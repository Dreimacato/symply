<template>
  <section class="nhm" aria-label="Map of nearby healthcare facilities">
    <h2 class="nhm-title">Nearby Hospitals &amp; Clinics</h2>
    <p class="nhm-subtitle">
      Centered on your address: <strong>{{ address || '—' }}</strong>
      <span v-if="address"> · within {{ radiusKm }} km</span>
    </p>

    <!-- No address entered yet -->
    <div v-if="!address" class="nhm-state">
      <v-icon icon="mdi-map-marker-off" size="42" color="#94A3B8" />
      <p class="nhm-state-text">
        No address is set. Add your address on the Info page to see nearby
        hospitals and clinics on the map.
      </p>
      <NuxtLink to="/" class="nhm-btn">Go to the Info page</NuxtLink>
    </div>

    <!-- Location lookup failed (network / service error) -->
    <div v-else-if="geoState === 'error'" class="nhm-state">
      <v-icon icon="mdi-wifi-off" size="42" color="#94A3B8" />
      <p class="nhm-state-text">
        The location service is unavailable right now. Please try again in a
        moment.
      </p>
      <button type="button" class="nhm-btn" @click="load">Try again</button>
    </div>

    <!-- Address could not be found on the map -->
    <div v-else-if="geoState === 'not-found'" class="nhm-state">
      <v-icon icon="mdi-map-search" size="42" color="#94A3B8" />
      <p class="nhm-state-text">
        We couldn't find "{{ address }}" on the map. Check the address on the
        Info page, or try a more specific one (for example, include the city).
      </p>
      <div class="nhm-state-actions">
        <button type="button" class="nhm-btn" @click="load">Try again</button>
        <NuxtLink to="/" class="nhm-btn nhm-btn--ghost">Edit address</NuxtLink>
      </div>
    </div>

    <!-- Initial geocoding in progress -->
    <div v-else-if="geoState === 'loading'" class="nhm-state">
      <ClientOnly>
        <v-progress-circular indeterminate color="primary" :size="36" />
      </ClientOnly>
      <p class="nhm-state-text">Finding "{{ address }}" on the map…</p>
    </div>

    <!-- Map (nearby facilities may still be loading) -->
    <template v-else-if="geoState === 'ready'">
      <div class="nhm-map-frame">
        <div
          ref="mapEl"
          class="nhm-map"
          role="application"
          aria-label="Interactive map of nearby healthcare facilities"
        ></div>
        <div v-if="facState === 'loading'" class="nhm-overlay">
          <ClientOnly>
            <v-progress-circular indeterminate color="primary" :size="32" />
          </ClientOnly>
          <p>Searching for nearby hospitals and clinics…</p>
        </div>
      </div>

      <div
        v-if="facState === 'error'"
        class="nhm-banner nhm-banner--error"
      >
        <p>Nearby facilities couldn't be loaded. The map still shows your location.</p>
        <button type="button" class="nhm-btn nhm-btn--small" @click="retryFacilities">
          Retry search
        </button>
      </div>
      <p v-else-if="facState === 'empty'" class="nhm-banner">
        No hospitals or clinics were found within {{ radiusKm }} km of this
        location in OpenStreetMap data. You can zoom out to explore a wider area.
      </p>
      <p v-else-if="facState === 'ready'" class="nhm-banner nhm-banner--count">
        {{ facilities.length }} healthcare
        {{ facilities.length === 1 ? 'facility' : 'facilities' }} found — click a
        marker for details.
      </p>

      <p class="nhm-note">
        Map data ©
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
        contributors. Geocoding by Nominatim · nearby places via Overpass API.
        Listings may be incomplete — please verify before visiting.
      </p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHealthMap, NEARBY_RADIUS_METERS } from '~/composables/useHealthMap'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps({
  address: {
    type: String,
    default: ''
  },
  radiusMeters: {
    type: Number,
    default: NEARBY_RADIUS_METERS
  },
  /* Exact coordinates saved by the Info page's autocomplete (null when unavailable) */
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['facilities-loaded'])

const mapEl = ref(null)

/* Geocoding status: 'idle' | 'loading' | 'ready' | 'not-found' | 'error' */
const geoState = ref('idle')
/* Facilities status: 'idle' | 'loading' | 'ready' | 'empty' | 'error' */
const facState = ref('idle')
const facilities = ref([])
const resolvedPoint = ref(null)

const radiusKm = computed(() => Math.round((props.radiusMeters / 1000) * 10) / 10)

const { geocodeAddress, fetchNearbyFacilities } = useHealthMap()

/* MapLibre lives in plain module-scope refs to avoid Vue proxy issues */
let map = null
let maplibregl = null
let resizeFrame = 0
let userMarker = null
let facilityMarkers = []
let resizeObserver = null

/* Guards against stale async results when the address changes mid-flight */
let loadToken = 0

async function load() {
  const token = ++loadToken
  const address = String(props.address || '').trim()

  clearFacilityMarkers()
  facilities.value = []
  resolvedPoint.value = null

  if (!address) {
    geoState.value = 'idle'
    facState.value = 'idle'
    facilities.value = []
    destroyMap()
    emit('facilities-loaded', [])
    return
  }

  geoState.value = 'loading'
  facState.value = 'idle'

  let point = null

  /* Prefer the exact coordinates saved by the autocomplete — avoids
     re-geocoding the address text (and the drift that can come with it) */
  if (Number.isFinite(props.lat) && Number.isFinite(props.lng)) {
    point = { lat: props.lat, lng: props.lng, displayName: address || `${props.lat}, ${props.lng}` }
  } else {
    try {
      point = await geocodeAddress(address)
     } catch (e) {
       if (token !== loadToken) return
       geoState.value = 'error'
       emit('facilities-loaded', [])
       return
     }
    if (token !== loadToken) return
  }

   if (!point) {
     geoState.value = 'not-found'
     destroyMap()
     emit('facilities-loaded', [])
     return
   }

  geoState.value = 'ready'
  resolvedPoint.value = point

  /* Start the facilities request now so it runs alongside map setup
     (MapLibre download + WebGL init) instead of waiting for it */
  const facilitiesPromise = loadNearbyFacilities(point, token, false)

  await nextTick()
  if (token !== loadToken) return

  /* Container is only guaranteed after the ready branch has rendered */
  await ensureMap(point)
  if (token !== loadToken) return

  /* Draw any facilities that arrived before the map was ready */
  const list = await facilitiesPromise
  if (token !== loadToken) return
  if (list && list.length > 0) renderFacilityMarkers(list)
}

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
}

async function ensureMap(point) {
  if (!mapEl.value) return

  if (!maplibregl) {
    const mod = await import('maplibre-gl')
    maplibregl = mod.default || mod
  }

  /* Container may have been re-rendered (loading state) or unmounted while importing */
  if (!mapEl.value) return
  if (map && map.getContainer() !== mapEl.value) destroyMap()

  if (!map) {
    try {
      map = new maplibregl.Map({
        container: mapEl.value,
        style: OSM_STYLE,
        center: [point.lng, point.lat],
        zoom: 14,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false
      })
    } catch (e) {
      console.warn('Map could not be initialised (WebGL unavailable?)', e)
      map = null
      return
    }
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
    map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right')

    userMarker = new maplibregl.Marker({ element: userIcon(), anchor: 'center' })
      .setLngLat([point.lng, point.lat])
      .setPopup(buildPopup('<strong>Your location</strong>'))
      .addTo(map)

    facilityMarkers = []

    /* Container may be zero-sized right after mount (e.g. inside transitions);
       the observer coalesces resize calls into one per animation frame */
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (resizeFrame) return
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = 0
          if (map) map.resize()
        })
      })
      resizeObserver.observe(mapEl.value)
    }
  } else {
    map.jumpTo({ center: [point.lng, point.lat], zoom: 14 })
    if (userMarker) userMarker.setLngLat([point.lng, point.lat])
  }
}

function buildPopup(content) {
  const popup = new maplibregl.Popup({ offset: 12, maxWidth: '300px' })
  if (typeof content === 'string') {
    const el = document.createElement('div')
    el.innerHTML = content
    popup.setDOMContent(el)
  } else {
    popup.setDOMContent(content)
  }
  return popup
}

/* Cyan pulse-style dot for the user; teal dot for facilities */
function userIcon() {
  const el = document.createElement('span')
  el.className = 'nhm-user-dot'
  el.title = 'Your location'
  return el
}

function facilityIcon(name) {
  const el = document.createElement('span')
  el.className = 'nhm-facility-dot'
  el.title = name || ''
  return el
}

/* Resolves to the facility list (or null on failure / stale token).
   When render is false the caller draws the markers once the map exists. */
async function loadNearbyFacilities(point, token, render = true) {
  facState.value = 'loading'
  try {
    const list = await fetchNearbyFacilities(point.lat, point.lng, props.radiusMeters)
    if (token !== loadToken) return null

    facilities.value = list
    if (render) renderFacilityMarkers(list)
    facState.value = list.length > 0 ? 'ready' : 'empty'
    emit('facilities-loaded', list)
    return list
  } catch (e) {
    if (token !== loadToken) return null
    facState.value = 'error'
    emit('facilities-loaded', [])
    return null
  }
}

function retryFacilities() {
  if (resolvedPoint.value) {
    loadNearbyFacilities(resolvedPoint.value, loadToken)
  }
}

function renderFacilityMarkers(list) {
  if (!map) return
  clearFacilityMarkers()

  const bounds = new maplibregl.LngLatBounds()
  for (const facility of list) {
    const marker = new maplibregl.Marker({ element: facilityIcon(facility.name), anchor: 'center' })
      .setLngLat([facility.lng, facility.lat])
      .setPopup(buildPopup(buildPopupContent(facility)))
      .addTo(map)
    facilityMarkers.push(marker)
    bounds.extend([facility.lng, facility.lat])
  }

  /* Fit view around user + facilities (capped zoom so markers stay readable) */
  if (list.length > 0) {
    if (userMarker && resolvedPoint.value) {
      bounds.extend([resolvedPoint.value.lng, resolvedPoint.value.lat])
    }
    /* Equivalent of Leaflet's bounds.pad(0.2): 20% of the span on each side */
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const dLng = (ne.lng - sw.lng) * 0.2
    const dLat = (ne.lat - sw.lat) * 0.2
    map.fitBounds(
      [[sw.lng - dLng, sw.lat - dLat], [ne.lng + dLng, ne.lat + dLat]],
      { maxZoom: 15 }
    )
  }
}

function clearFacilityMarkers() {
  for (const marker of facilityMarkers) {
    marker.remove()
  }
  facilityMarkers = []
}

/* Build popup DOM with textContent so OSM strings can never inject HTML */
function buildPopupContent(facility) {
  const container = document.createElement('div')
  container.className = 'nhm-popup'

  const name = document.createElement('strong')
  name.textContent = facility.name
  container.appendChild(name)

  if (facility.type) {
    const type = document.createElement('div')
    type.className = 'nhm-popup-type'
    type.textContent = facility.type
    container.appendChild(type)
  }
  if (facility.address) {
    const address = document.createElement('div')
    address.textContent = facility.address
    container.appendChild(address)
  }
  if (facility.phone) {
    const phone = document.createElement('div')
    const phoneLink = document.createElement('a')
    phoneLink.href = 'tel:' + facility.phone.replace(/[^0-9+]/g, '')
    phoneLink.textContent = facility.phone
    phone.appendChild(phoneLink)
    container.appendChild(phone)
  }
  if (facility.website) {
    const site = document.createElement('div')
    const siteLink = document.createElement('a')
    siteLink.href = facility.website
    siteLink.target = '_blank'
    siteLink.rel = 'noopener noreferrer'
    siteLink.textContent = 'Visit website'
    site.appendChild(siteLink)
    container.appendChild(site)
  }
  if (typeof facility.distanceMeters === 'number') {
    const distance = document.createElement('div')
    distance.className = 'nhm-popup-distance'
    distance.textContent = formatDistance(facility.distanceMeters)
    container.appendChild(distance)
  }

  return container
}

function formatDistance(meters) {
  if (meters < 1000) return `${meters} m away`
  return `${(meters / 1000).toFixed(1)} km away`
}

function destroyMap() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = 0
  }
  clearFacilityMarkers()
  if (userMarker) {
    userMarker.remove()
    userMarker = null
  }
  if (map) {
    map.remove()
    map = null
  }
}

/* Re-run whenever the address or saved coordinates from the Info page change */
watch(() => [props.address, props.lat, props.lng], () => {
  load()
})

onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  loadToken++
  destroyMap()
})


</script>

<style scoped>
/* ─── Map card ──────────────────────────────────────────────────────────── */
.nhm {
  background: white;
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
  padding: 24px;
  margin-bottom: 32px;
}

.nhm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 4px 0;
}

.nhm-subtitle {
  font-size: 0.9375rem;
  color: var(--symply-text-secondary);
  margin: 0 0 16px 0;
}

.nhm-subtitle strong {
  color: var(--symply-text-primary);
  font-weight: 600;
}

/* ─── State panels (loading / errors / empty) ───────────────────────────── */
.nhm-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 56px 24px;
  text-align: center;
}

.nhm-state-text {
  margin: 0;
  max-width: 420px;
  color: var(--symply-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.nhm-state-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ─── Buttons ───────────────────────────────────────────────────────────── */
.nhm-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: var(--symply-radius-md);
  background: #06B6D4;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nhm-btn:hover {
  background: #0891b2;
}

.nhm-btn--ghost {
  background: white;
  color: var(--symply-text-secondary);
  border: 1px solid #cbd5e1;
}

.nhm-btn--ghost:hover {
  background: #f8fafc;
  color: var(--symply-text-primary);
}

.nhm-btn--small {
  padding: 8px 16px;
  font-size: 0.875rem;
}

/* ─── Map frame + overlay ───────────────────────────────────────────────── */
.nhm-map-frame {
  position: relative;
  border-radius: var(--symply-radius-md);
  overflow: hidden;
}

.nhm-map {
  height: 420px;
  width: 100%;
  background: #e2e8f0;
}

.nhm-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.82);
  z-index: 1000;
  color: var(--symply-text-secondary);
  font-size: 0.9375rem;
}

.nhm-overlay p {
  margin: 0;
}

/* ─── Banners ───────────────────────────────────────────────────────────── */
.nhm-banner {
  margin: 12px 0 0 0;
  padding: 12px 16px;
  border-radius: var(--symply-radius-md);
  background: #F1F5F9;
  color: var(--symply-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.nhm-banner p {
  margin: 0;
}

.nhm-banner--error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: #FEF2F2;
  color: #991B1B;
}

.nhm-note {
  margin: 12px 0 0 0;
  font-size: 0.8125rem;
  color: #94A3B8;
  line-height: 1.5;
}

.nhm-note a {
  color: #64748B;
  text-decoration: underline;
}

/* ─── Markers (rendered inside MapLibre canvas container — needs :deep) ─── */
:deep(.maplibregl-map) {
  font: inherit;
}

:deep(.maplibregl-popup-content) {
  border-radius: 12px;
  padding: 13px 19px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  color: #333;
}

:deep(.maplibregl-popup-close-button) {
  font-size: 18px;
  color: #757575;
}

:deep(.nhm-user-dot),
:deep(.nhm-facility-dot) {
  cursor: pointer;
}

:deep(.nhm-user-dot),
:deep(.nhm-facility-dot) {
  display: block;
  border-radius: 50%;
  box-sizing: border-box;
}

:deep(.nhm-user-dot) {
  width: 18px;
  height: 18px;
  background: #06B6D4;
  border: 3px solid white;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.25), 0 1px 4px rgba(0, 0, 0, 0.3);
}

:deep(.nhm-facility-dot) {
  width: 14px;
  height: 14px;
  background: #0f766e;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* ─── Popup content ─────────────────────────────────────────────────────── */
:deep(.nhm-popup) {
  font-size: 0.875rem;
  line-height: 1.45;
  min-width: 160px;
}

:deep(.nhm-popup strong) {
  font-size: 0.9375rem;
}

:deep(.nhm-popup-type) {
  color: #0f766e;
  font-weight: 600;
  margin-bottom: 2px;
}

:deep(.nhm-popup a) {
  color: #06B6D4;
  text-decoration: none;
}

:deep(.nhm-popup-distance) {
  margin-top: 6px;
  color: #64748B;
  font-size: 0.8125rem;
}

/* ─── Mobile ────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .nhm {
    padding: 16px;
  }

  .nhm-map {
    height: 320px;
  }
}


/* --- Dark theme (data-theme="dark" on <html>) ------------------------- */
:root[data-theme='dark'] .nhm {
  background: var(--symply-card-bg);
}

:root[data-theme='dark'] .nhm-overlay {
  background: rgba(11, 18, 32, 0.78);
}

:root[data-theme='dark'] .nhm-banner {
  background: rgba(255, 255, 255, 0.06);
}

:root[data-theme='dark'] .nhm-banner--error {
  background: rgba(248, 113, 113, 0.12);
  color: #FCA5A5;
}

:root[data-theme='dark'] .nhm-note {
  color: var(--symply-text-muted);
}

:root[data-theme='dark'] .nhm-note a {
  color: var(--symply-text-secondary);
}

:root[data-theme='dark'] .nhm-btn--ghost {
  background: transparent;
  border-color: var(--symply-border);
}</style>
