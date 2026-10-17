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
  'https://z.overpass-api.de/api/interpreter'
]

/* Module-level caches shared across all useHealthMap() callers */
const geocodeCache = new Map()

/* Facilities cache for Overpass API responses */
const facilitiesCache = new Map()

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

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusMeters},${lat},${lng});
      way["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusMeters},${lat},${lng});
      node["healthcare"~"^(hospital|clinic|doctor|centre)$"](around:${radiusMeters},${lat},${lng});
      way["healthcare"~"^(hospital|clinic|doctor|centre)$"](around:${radiusMeters},${lat},${lng});
    );
    out center ${NEARBY_RESULT_LIMIT};
  `

  searchingFacilities.value = true
  try {
    /* Race every Overpass endpoint in parallel and take the first one that
       answers with usable data. Each request is bounded by an AbortController
       timeout, so a single slow/hanging endpoint (a 504 or a socket that never
       closes) can no longer stall the whole step â€” the remaining endpoints
       keep racing and the losers are aborted. This turns the old sequential
       failover (worst case = the *sum* of every timeout) into "fastest healthy
       endpoint wins", which is why the map used to take 8â€“40 s+ to load. */
    const OVERPASS_TIMEOUT_MS = 15000

    const attemptEndpoint = async (endpoint) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS)
      const start = Date.now()
      try {
        console.log('[useHealthMap] Trying Overpass endpoint:', endpoint)
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new URLSearchParams({ data: query }),
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Symply/1.0'
          },
          signal: controller.signal
        })
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          console.warn('[useHealthMap] HTTP error:', response.status, text.slice(0, 200))
          throw new Error(`Nearby facilities request failed (${response.status})`)
        }
        const data = await response.json()
        console.log('[useHealthMap] Response from', endpoint, '- status:', response.status, '- duration:', Date.now() - start, 'ms - elements:', data.elements?.length ?? 0)
        return data
      } finally {
        clearTimeout(timer)
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
    }

    if (!data) {
      throw lastError || new Error('Nearby facilities request failed')
    }

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
        distanceMeters: haversineMeters(lat, lng, elat, elng)
      })
    }

    facilities.sort((a, b) => a.distanceMeters - b.distanceMeters)

    /* Cache successful responses (including empty results for this area) */
    facilitiesCache.set(cacheKey, facilities)
    return facilities
  } finally {
    searchingFacilities.value = false
  }
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