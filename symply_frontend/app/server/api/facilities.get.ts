import { defineEventHandler, getQuery, createError } from 'h3'

/**
 * Server-side Overpass proxy for the "Nearby Hospitals & Clinics" map.
 * Browsers give up on the public Overpass mirrors too quickly (they often
 * need 15-20 s), so the lookup runs here with a longer timeout, races every
 * mirror, and caches results in memory.
 */
const ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]

const TIMEOUT_MS = 28000
const CACHE_TTL_MS = 60 * 60 * 1000
const RESULT_LIMIT = 60
const cache = new Map<string, { savedAt: number; data: any }>()

function buildQuery(lat: number, lng: number, radius: number) {
  const around = `(around:${radius},${lat},${lng})`
  return (
    '[out:json][timeout:25];(' +
    `node["amenity"~"^(hospital|clinic|doctors)$"]${around};` +
    `way["amenity"~"^(hospital|clinic|doctors)$"]${around};` +
    `node["healthcare"~"^(hospital|clinic|doctor|centre)$"]${around};` +
    `way["healthcare"~"^(hospital|clinic|doctor|centre)$"]${around};` +
    `);out center ${RESULT_LIMIT};`
  )
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const lat = Number(q.lat)
  const lng = Number(q.lng)
  const radius = Math.min(Math.max(Number(q.radius) || 5000, 500), 20000)

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid coordinates' })
  }

  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.savedAt < CACHE_TTL_MS) return hit.data

  const body = new URLSearchParams({ data: buildQuery(lat, lng, radius) })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const data = await Promise.any(
      ENDPOINTS.map(async (endpoint) => {
        const res = await fetch(endpoint, {
          method: 'POST',
          body,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Symply/1.0 (nearby-health-map; https://github.com/Dreimacato/symply)'
          },
          signal: controller.signal
        })
        if (!res.ok) throw new Error(`${endpoint} responded ${res.status}`)
        const json: any = await res.json()
        if (!json || !Array.isArray(json.elements)) throw new Error(`${endpoint} malformed response`)
        return json
      })
    )
    controller.abort() // cancel the losing mirrors
    cache.set(key, { savedAt: Date.now(), data })
    return data
  } catch (err) {
    throw createError({ statusCode: 502, statusMessage: 'All Overpass mirrors failed' })
  } finally {
    clearTimeout(timer)
  }
})