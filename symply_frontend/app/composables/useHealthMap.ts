import { ref } from 'vue'

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * OpenStreetMap helpers for the "Where to Get Help" page.
 * - Geocoding: Nominatim (https://nominatim.org) â€” keyless, usage-limited.
 * - Nearby facilities: Overpass API (https://overpass-api.de) â€” keyless.
 * Results are cached per address / per area so revisiting the page does not
 * re-issue identical requests (also respects Nominatim's 1 req/s policy).
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const NEARBY_RADIUS_METERS = 5000

/* Max facilities rendered on the map â€” keeps large cities usable */
const NEARBY_RESULT_LIMIT = 60

/* Speed: fast 2 km query (8 s client timeout) answers dense areas quickly.
   The full 5 km radius is only used as a widened second attempt (12 s). */
const OVERPASS_FAST_TIMEOUT_MS = 8000
const OVERPASS_FULL_TIMEOUT_MS = 12000
const FAST_RADIUS_METERS = 2000
const FAST_MIN_RESULTS = 5

/* Nominatim's fair-use policy allows at most 1 request per second.
   Reserve a slot before every request so rapid typing or automated
   tests can never burst the endpoint. Cached results skip the slot. */
const NOMINATIM_MIN_INTERVAL_MS = 1100
let nextNominatimSlot = 0

/* Nominatim requires a valid User-Agent on every request */
const NOMINATIM_USER_AGENT = 'Symply/1.0'

async function nominatimSlot() {
  const now = Date.now()
  const slot = Math.max(nextNominatimSlot, now)
  nextNominatimSlot = slot + NOMINATIM_MIN_INTERVAL_MS
  const wait = slot - now
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
}

/* â”€â”€ Mock mode for repeatable automated tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Enable with localStorage.symply_mock_nominatim = '1' (browser only).
   Geocoding then returns deterministic canned responses instead of
   hitting the live API, so E2E tests never depend on Nominatim
   availability or network conditions. Queries containing "fail"
   simulate a network failure; "nowhere"/"unknown" simulate a no-match. */
const NOMINATIM_MOCK_KEY = 'symply_mock_nominatim'

function nominatimMockEnabled() {
  if (process.server) return false
  try {
    return localStorage.getItem(NOMINATIM_MOCK_KEY) === '1'
  } catch (e) {
    return false
  }
}

const MOCK_GEOCODE_RESULTS = [
  {
    match: /arayat/i,
    results: [
      { lat: 15.1504805, lng: 120.772694, display_name: 'Arayat, Pampanga, Central Luzon, 2012, Philippines' },
    ],
  },
  {
    match: /seoul/i,
    results: [
      { lat: 37.5665, lng: 126.978, display_name: 'Seoul, South Korea' },
    ],
  },
]

function mockGeocodeResponse(normalized) {
  if (/fail/i.test(normalized)) {
    throw new Error('Simulated geocoding failure (mock mode)')
  }
  for (const entry of MOCK_GEOCODE_RESULTS) {
    if (entry.match.test(normalized)) return entry.results
  }
  if (/nowhere|unknown|xyz/i.test(normalized)) return []
  return MOCK_GEOCODE_RESULTS[0].results
}

function mockSuggestionResponse(normalized) {
  if (/fail/i.test(normalized)) {
    throw new Error('Simulated geocoding failure (mock mode)')
  }
  const q = normalized.toLowerCase()
  const pool = [
    { lat: 15.1504805, lng: 120.772694, display_name: 'Arayat, Pampanga, Central Luzon, 2012, Philippines' },
    { lat: 15.1467, lng: 120.7589, display_name: 'Arayat, Pampanga, Philippines' },
    { lat: 37.5665, lng: 126.978, display_name: 'Seoul, South Korea' },
    { lat: 37.4979, lng: 127.0276, display_name: 'Seoul, South Korea (Gangnam)' },
  ]
  const hits = pool.filter(item => item.display_name.toLowerCase().includes(q))
  if (hits.length > 0) return hits
  if (/nowhere|unknown|xyz/i.test(normalized)) return []
  return [pool[0]]
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
]

/* Pause before re-racing the endpoints after they all fail fast (429/502) */
const OVERPASS_RETRY_DELAY_MS = 700

/* Start the full-radius query if the fast query is still pending after this */
const OVERPASS_HEDGE_DELAY_MS = 1500

/* Module-level caches shared across all useHealthMap() callers */
const geocodeCache = new Map()

/* Facilities cache for Overpass API responses */
const facilitiesCache = new Map()

/* Persist successful Overpass results in localStorage so revisits and
   reloads near the same area are instant (24 h TTL, max 20 areas). */
const FACILITIES_LS_KEY = 'symply_facilities_cache_v1'
const FACILITIES_LS_TTL_MS = 86400000
const FACILITIES_LS_MAX = 20
let facilitiesLsCache = null
function readFacilitiesLsCache() {
  if (process.server) return new Map()
  try {
    const raw = localStorage.getItem(FACILITIES_LS_KEY)
    if (!raw) return new Map()
    const parsed = JSON.parse(raw)
    const map = new Map()
    const now = Date.now()
    const entries = Object.entries(parsed || {})
    for (let i = 0; i < entries.length; i++) {
      const k = entries[i][0]
      const e = entries[i][1]
      if (e && Array.isArray(e.value) && (now - e.savedAt) < FACILITIES_LS_TTL_MS) map.set(k, e.value)
    }
    return map
  } catch (err) { return new Map() }
}
function getFacilitiesLsCache() {
  if (!facilitiesLsCache) facilitiesLsCache = readFacilitiesLsCache()
  return facilitiesLsCache
}
function writeFacilitiesLsCache(cacheKey, facilities) {
  if (process.server) return
  try {
    const cache = getFacilitiesLsCache()
    cache.set(cacheKey, facilities)
    while (cache.size > FACILITIES_LS_MAX) cache.delete(cache.keys().next().value)
    const obj = {}
    cache.forEach((v, k) => { obj[k] = { savedAt: Date.now(), value: v } })
    localStorage.setItem(FACILITIES_LS_KEY, JSON.stringify(obj))
  } catch (err) { /* memory cache still applies */ }
}

/* Local fixture loader â€” only used when SYMPY_USE_FIXTURE=1 for local dev */
let fixtureFacilities: any[] = []
async function loadFixture() {
  if (fixtureFacilities.length > 0) return fixtureFacilities
  try {
    const fixtureModule = await import('../../data/sample_facilities.json')
    fixtureFacilities =
      fixtureModule && fixtureModule.default !== undefined
        ? fixtureModule.default
        : fixtureModule
  } catch (e) {
    console.warn('[useHealthMap] Could not load fixture:', e)
  }
  return fixtureFacilities
}

/* Cache for autocomplete suggestions, keyed by the normalized query */
const suggestionCache = new Map()

/* Max autocomplete suggestions shown in the address dropdown */
const SUGGESTION_LIMIT = 5

export function useHealthMap() {
  /* Public runtime config is baked in at dev-server start, so the
     fixture flag works in the browser too (plain process.env does not) */
  const useFixture = useRuntimeConfig().public.useFixture === true

  const geocoding = ref(false)
  const searchingFacilities = ref(false)

  /**
   * Convert a free-text address into coordinates via Nominatim.
   * Resolves to null when the address cannot be found; rejects on
   * network/HTTP failure so callers can offer a retry.
   */
  async function geocodeAddress(address) {
    const normalized = String(address || '').trim()
    if (!normalized) return null

    if (geocodeCache.has(normalized)) {
      return geocodeCache.get(normalized)
    }

    geocoding.value = true
    try {
      const params = new URLSearchParams({
        q: normalized,
        format: 'jsonv2',
        limit: '1',
        addressdetails: '0'
      })
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`

      await nominatimSlot()
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) {
        throw new Error(`Geocoding request failed (${response.status})`)
      }

      const results = await response.json()
      const point = results && results.length > 0
        ? {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon),
            displayName: results[0].display_name || normalized
          }
        : null

      /* Cache both hits and misses to avoid repeat lookups of the same address */
      geocodeCache.set(normalized, point)
      return point
    } finally {
      geocoding.value = false
    }
  }


  /**
   * Fetch address autocomplete suggestions for a partial query via Nominatim.
   * Returns an array of { lat, lng, displayName } â€” empty when nothing matches.
   * Rejects on network/HTTP failure so callers can fail silently or retry.
   */
  async function searchAddressSuggestions(query) {
    const normalized = String(query || '').trim()
    if (normalized.length < 3) return []

    if (suggestionCache.has(normalized)) {
      return suggestionCache.get(normalized)
    }

    geocoding.value = true
    try {
      const params = new URLSearchParams({
        q: normalized,
        format: 'jsonv2',
        limit: String(SUGGESTION_LIMIT),
        addressdetails: '0'
      })
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`

      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) {
        throw new Error(`Address suggestion request failed (${response.status})`)
      }

      const results = await response.json()
      const suggestions = (results || []).map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name || normalized
      }))

      /* Cache both hits and misses so repeat keystrokes are instant */
      suggestionCache.set(normalized, suggestions)
      return suggestions
    } finally {
      geocoding.value = false
    }
  }


  /**
   * Fetch hospitals/clinics/doctors near a point via the Overpass API.
   * Returns a distance-sorted list of normalized facility objects.
   * Falls back to local fixture if all Overpass endpoints fail.
   */
  async function fetchNearbyFacilities(lat, lng, radiusMeters = NEARBY_RADIUS_METERS) {
  /* â”€â”€â”€ Local development fixture (optional) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   * SYMPY_USE_FIXTURE=1 bypasses the live Overpass API and returns the sample
   * clinics in `../data/sample_facilities.json`. This is the fastest, zero-API
   * way to verify the cards, sorting, and the map modal end-to-end.
   * Do not commit real facility data. */

  /* Cache per area (rounded to ~110 m) so repeated calls are instant */
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusMeters}`

  if (useFixture) {
    if (facilitiesCache.has(cacheKey)) {
      return facilitiesCache.get(cacheKey)
    }
    const fixture = await loadFixture()
    if (fixture.length === 0) return []
    facilitiesCache.set(cacheKey, fixture)
    return fixture
  }

  if (facilitiesCache.has(cacheKey)) {
    return facilitiesCache.get(cacheKey)
  }

  if (getFacilitiesLsCache().has(cacheKey)) {
    const cached = getFacilitiesLsCache().get(cacheKey)
    facilitiesCache.set(cacheKey, cached)
    refreshFacilitiesInBackground(lat, lng, radiusMeters, cacheKey)
    return cached
  }

  const fastRadius = Math.min(FAST_RADIUS_METERS, radiusMeters)
  searchingFacilities.value = true
  /* Hedged requests: the full-radius query starts if the fast (2 km) query
     has not answered within OVERPASS_HEDGE_DELAY_MS (or as soon as it fails),
     instead of strictly after it. A sparse area or slow mirror no longer pays
     fast-timeout + full-timeout, while quick answers still send only one query. */
  const fullController = new AbortController()
  let fullPromise = null
  let hedgeTimer = null
  const startFull = () => {
    if (fullPromise || fastRadius >= radiusMeters) return
    clearTimeout(hedgeTimer)
    fullPromise = queryOverpassFast(buildOverpassQuery(lat, lng, radiusMeters), OVERPASS_FULL_TIMEOUT_MS, fullController.signal)
    /* Prevent an unhandled rejection when the full query is aborted or unused */
    fullPromise.catch(() => {})
  }
  hedgeTimer = setTimeout(startFull, OVERPASS_HEDGE_DELAY_MS)

  try {
    let fastData = null
    try {
      fastData = await queryOverpassFast(buildOverpassQuery(lat, lng, fastRadius), OVERPASS_FAST_TIMEOUT_MS)
    } catch (err) {
      console.warn('[useHealthMap] Fast query failed, waiting for full radius')
    }
    clearTimeout(hedgeTimer)
    const fastCount = fastData && fastData.elements ? fastData.elements.length : 0
    if (fastData && (fastCount >= FAST_MIN_RESULTS || fastRadius >= radiusMeters)) {
      fullController.abort()
      const facilities = normalizeFacilities(fastData, lat, lng)
      facilitiesCache.set(cacheKey, facilities)
      writeFacilitiesLsCache(cacheKey, facilities)
      return facilities
    }
    /* Few/no fast results and the hedge hasn't fired yet: start it now */
    startFull()
    if (!fullPromise) throw new Error('Nearby facilities request failed')
    let fullData = null
    try {
      fullData = await fullPromise
    } catch (err) {
      /* Fall back to the few fast-query results rather than showing an error */
      if (!fastData) throw err
      fullData = fastData
    }
    const facilities = normalizeFacilities(fullData, lat, lng)
    facilitiesCache.set(cacheKey, facilities)
    writeFacilitiesLsCache(cacheKey, facilities)
    return facilities
  } finally {
    searchingFacilities.value = false
  }
}

  function buildOverpassQuery(qlat, qlng, qradius) {
    return (
      '[out:json][timeout:12];' +
      '(node["amenity"~"^(hospital|clinic|doctors)$"](around:' + qradius + ',' + qlat + ',' + qlng + ');' +
      'way["amenity"~"^(hospital|clinic|doctors)$"](around:' + qradius + ',' + qlat + ',' + qlng + ');' +
      'node["healthcare"~"^(hospital|clinic|doctor|centre)$"](around:' + qradius + ',' + qlat + ',' + qlng + ');' +
      'way["healthcare"~"^(hospital|clinic|doctor|centre)$"](around:' + qradius + ',' + qlat + ',' + qlng + '););' +
      'out center ' + NEARBY_RESULT_LIMIT + ';'
    )
  }

  async function queryOverpassFast(query, timeoutMs, externalSignal = null) {
    const deadline = Date.now() + timeoutMs
    try {
      return await raceOverpassEndpoints(query, timeoutMs, externalSignal)
    } catch (err) {
      /* Public endpoints often reject instantly (429 rate limit / 502). If every
         endpoint failed quickly and time remains, re-race once after a short pause
         instead of surfacing an error. */
      const remaining = deadline - Date.now() - OVERPASS_RETRY_DELAY_MS
      if (externalSignal?.aborted || remaining < 2000) throw err
      await new Promise((resolve) => setTimeout(resolve, OVERPASS_RETRY_DELAY_MS))
      if (externalSignal?.aborted) throw err
      console.warn('[useHealthMap] Retrying Overpass endpoints once')
      return raceOverpassEndpoints(query, remaining, externalSignal)
    }
  }

  async function raceOverpassEndpoints(query, timeoutMs, externalSignal = null) {
    /* Race every Overpass endpoint in parallel and take the first one that
       answers with usable data. Each request is bounded by an AbortController
       timeout, so a single slow/hanging endpoint (a 504 or a socket that never
       closes) can no longer stall the whole step â€” the remaining endpoints
       keep racing and the losers are aborted. This turns the old sequential
       failover (worst case = the *sum* of every timeout) into "fastest healthy
       endpoint wins", which is why the map used to take 8â€“40 s+ to load. */
    const OVERPASS_TIMEOUT_MS = timeoutMs

    /* One controller per race: aborted by the timeout, by the caller, or as soon
       as one endpoint wins, so the losing requests stop consuming bandwidth */
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS)
    const onExternalAbort = () => controller.abort()
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort()
      else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
    }

    const attemptEndpoint = async (endpoint) => {
      const start = Date.now()
      try {
        console.log('[useHealthMap] Trying Overpass endpoint:', endpoint)
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new URLSearchParams({ data: query }),
          /* Only CORS-safelisted headers, so browsers send a "simple" request
             with no extra OPTIONS preflight round-trip (browsers manage
             User-Agent themselves) */
          headers: { Accept: 'application/json' },
          signal: controller.signal
        })
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          console.warn('[useHealthMap] HTTP error:', response.status, text.slice(0, 200))
          throw new Error(`Nearby facilities request failed (${response.status})`)
        }
        const data = await response.json()
        if (!data || !Array.isArray(data.elements)) {
          throw new Error('Nearby facilities response was malformed')
        }
        console.log('[useHealthMap] Response from', endpoint, '- status:', response.status, '- duration:', Date.now() - start, 'ms - elements:', data.elements.length)
        return data
      } catch (err) {
        console.warn('[useHealthMap] Endpoint failed:', endpoint, err?.message || err)
        throw err
      }
    }

    let data = null
    let lastError = null
    try {
      /* First endpoint to resolve with valid data wins; the rest are aborted. */
      data = await Promise.any(
        OVERPASS_ENDPOINTS.map((endpoint) => attemptEndpoint(endpoint))
      )
    } catch (aggregateError) {
      /* Promise.any rejects only once *every* endpoint has failed. Record each
         individual reason for diagnostics, then surface a single clear error. */
      const reasons = (aggregateError.errors || []).map((e) => e?.message || String(e))
      console.warn('[useHealthMap] All Overpass endpoints failed:', reasons)
      lastError =
        aggregateError.errors?.[0] ||
        new Error('Nearby facilities request failed')
    } finally {
      clearTimeout(timer)
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort)
      /* Cancel the endpoints that lost the race */
      controller.abort()
    }

    if (!data) {
      throw lastError || new Error('Nearby facilities request failed')
    }
    return data
  }

  function refreshFacilitiesInBackground(rlat, rlng, rradius, rkey) {
    Promise.resolve()
      .then(() => queryOverpassFast(buildOverpassQuery(rlat, rlng, rradius), OVERPASS_FULL_TIMEOUT_MS))
      .then((fresh) => {
        const facilities = normalizeFacilities(fresh, rlat, rlng)
        facilitiesCache.set(rkey, facilities)
        writeFacilitiesLsCache(rkey, facilities)
      })
      .catch(() => { /* keep serving cached copy */ })
  }

  function normalizeFacilities(data, nlat, nlng) {
    const seen = new Set()
    const facilities = []

    for (const element of data.elements || []) {
      /* Nodes carry lat/lon directly; ways only carry a computed center */
      const elat = typeof element.lat === 'number' ? element.lat : element.center?.lat
      const elng = typeof element.lon === 'number' ? element.lon : element.center?.lon
      if (!Number.isFinite(elat) || !Number.isFinite(elng)) continue

      const tags = element.tags || {}
      const name = (tags.name || '').trim()
      const type = (tags.amenity || tags.healthcare || '').trim()

      /* Skip unnamed entries â€” nothing useful to show in a popup */
      if (!name) continue

      /* Dedupe (the same site can match both amenity and healthcare queries) */
      const dedupeKey = `${name.toLowerCase()}|${elat.toFixed(4)}|${elng.toFixed(4)}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      /* Structured address â†’ addr:full â†’ any locality tags available */
      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city']
      ].filter(Boolean).join(' ') ||
        (tags['addr:full'] || '').trim() ||
        [
          tags['addr:suburb'],
          tags['addr:district'],
          tags['addr:quarter'],
          tags['addr:neighbourhood'],
          tags['addr:village'],
          tags['addr:place'],
          tags['addr:postcode']
        ]
          .filter(Boolean)
          .join(' ')

      facilities.push({
        id: `${element.type}/${element.id}`,
        name,
        type,
        lat: elat,
        lng: elng,
        phone: (tags.phone || tags['contact:phone'] || '').trim(),
        website: (tags.website || tags['contact:website'] || '').trim(),
        address: address.trim(),
        distanceMeters: haversineMeters(nlat, nlng, elat, elng)
      })
    }

    facilities.sort((a, b) => a.distanceMeters - b.distanceMeters)
    return facilities
  }

  return {
    geocoding,
    searchingFacilities,
    geocodeAddress,
    searchAddressSuggestions,
    fetchNearbyFacilities
  }
}

/* Great-circle distance in meters */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}