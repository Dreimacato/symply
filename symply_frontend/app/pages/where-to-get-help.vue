<template>
  <div class="where-to-get-help-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="content-container">
        <h1 class="page-title">Where to Get Help</h1>
        <p class="page-description">Based on your symptoms and location, here are the recommended places to seek medical care.</p>

        <!-- Location Info -->
        <div class="location-section">
          <div class="location-card">
            <div class="location-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#06B6D4" aria-hidden="true">
                <path d="M12 11.5A2.5 2.5 0 0 1 9.5 9 2.5 2.5 0 0 1 12 6.5 2.5 2.5 0 0 1 14.5 9 2.5 2.5 0 0 1 12 11.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
              </svg>
            </div>
            <div class="location-content">
              <h3 class="location-title">Your Location</h3>
              <p class="location-text">
                {{ userLocation || 'Not specified' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nearby Facilities Map (OpenStreetMap) -->
        <ClientOnly>
          <NearbyHealthMap
            :address="userLocation || ''"
            :lat="userCoords.lat"
            :lng="userCoords.lng"
            @facilities-loaded="onFacilitiesLoaded"
          />
          <template #fallback>
            <div class="map-section-fallback">
              <p>Loading map…</p>
            </div>
          </template>
        </ClientOnly>

        <section class="doctor-search-section" aria-labelledby="doctor-search-title">
          <h2 id="doctor-search-title" class="section-title">Doctors Nearby</h2>
          <p class="doctor-search-description">
            Meet some of the doctors you can consult{{ userLocation ? ` near ${userLocation}` : '' }}. Contact the clinic directly to book an appointment.
          </p>

          <button
            class="doctor-search-button"
            type="button"
            :aria-expanded="showDoctorResults"
            aria-controls="nearby-doctor-results"
            @click="showDoctorResults = !showDoctorResults"
          >
            <v-icon icon="mdi-account-search-outline" size="18" aria-hidden="true" />
            {{ showDoctorResults ? 'Hide Doctors' : 'See Doctors Available' }}
          </button>

          <div
            v-if="showDoctorResults"
            id="nearby-doctor-results"
            class="doctor-results"
            aria-live="polite"
          >
            <div class="doctor-filters" role="group" aria-label="Filter doctors by specialty">
              <button
                v-for="option in SPECIALTY_FILTERS"
                :key="option.value"
                type="button"
                class="doctor-filter-pill"
                :class="{ 'doctor-filter-pill--active': specialtyFilter === option.value }"
                :aria-pressed="specialtyFilter === option.value"
                @click="specialtyFilter = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <p class="doctor-filter-count" aria-live="polite">
              Showing {{ filteredDoctors.length }} of {{ DOCTORS.length }} doctors
              <span v-if="specialtyFilter !== 'all'">· {{ activeSpecialtyLabel }}</span>
            </p>
            <div class="doctor-list">
              <article v-for="doctor in filteredDoctors" :key="doctor.id" class="doctor-list-item">
                <div class="doctor-avatar" aria-hidden="true">
                  {{ doctor.initials }}
                </div>
                <div class="doctor-list-info">
                  <h3 class="facility-list-name doctor-list-name">{{ doctor.specialty }}</h3>
                  <p class="doctor-clinic">{{ doctor.clinic }}</p>
                  <div class="doctor-list-meta">
                    <p class="doctor-list-detail doctor-list-location">
                      <v-icon icon="mdi-map-marker-outline" size="15" aria-hidden="true" />
                      <span>{{ doctor.address }}</span>
                    </p>
                    <p class="doctor-list-detail doctor-list-location">
                      <v-icon icon="mdi-clock-outline" size="15" aria-hidden="true" />
                      <span>{{ doctor.hours }}</span>
                    </p>
                  </div>
                  <div class="doctor-list-actions">
                    <a class="doctor-list-action" :href="phoneHref(doctor.phone)">
                      <v-icon icon="mdi-phone-outline" size="15" aria-hidden="true" />
                      <span>{{ doctor.phone }}</span>
                    </a>
                  </div>
                </div>
              </article>
            </div>
            <p class="doctor-search-note">
              Sample directory for demonstration — please verify doctor availability with the clinic before visiting.
            </p>
          </div>
        </section>

        <!-- Nearby Hospitals & Clinics List -->
        <div v-if="loading" class="loading-section">
          <ClientOnly>
            <v-progress-circular indeterminate color="primary" />
          </ClientOnly>
          <p class="loading-text">Loading facilities...</p>
        </div>

        <div v-else-if="facilities.length > 0" class="facilities-list-section">
          <h2 class="section-title">Nearby Hospitals & Clinics</h2>

          <div
            v-for="facility in facilities.slice(0, 3)"
            :key="facility.id"
            class="facility-list-item"
          >
            <div class="facility-list-thumb">
              <img
                v-if="facility.image"
                :src="facility.image"
                :alt="facility.name"
                class="facility-list-img"
                loading="lazy"
              />
              <div v-else class="facility-list-thumb-placeholder">
                <v-icon icon="mdi-hospital-building" size="28" color="#06B6D4" />
              </div>
            </div>
            <div class="facility-list-info">
              <h3 class="facility-list-name">{{ facility.name }}</h3>
              <p class="facility-list-location">
                <v-icon icon="mdi-map-marker-outline" size="14" color="#64748B" />
                <span>{{ facility.address || 'Address unavailable' }}</span>
              </p>
              <p v-if="typeof facility.distanceMeters === 'number'" class="facility-list-distance">
                {{ formatDistance(facility.distanceMeters) }}
              </p>
              <p class="facility-list-phone">
                <v-icon icon="mdi-phone-outline" size="14" color="#64748B" />
                <span>{{ FIXED_CONTACT_NUMBER }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- No Facilities Found -->
        <div v-else class="no-facilities-section">
          <div class="no-facilities-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <p class="no-facilities-text">
            No healthcare facilities were found for this location.
          </p>
        </div>
      </div>

        <!-- Navigation Buttons -->
        <div class="action-buttons">
          <button @click="goBackToWhatYouCanDo" class="nav-btn prev-btn">
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to What You Can Do
          </button>
          <button @click="openSummary" class="nav-btn summary-btn">
            <svg class="summary-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Summary
          </button>
        </div>

        <!-- Summary Modal -->
        <div v-if="showSummary" class="summary-modal-overlay" @click.self="closeSummary">
          <div class="summary-modal" role="dialog" aria-modal="true" aria-labelledby="summary-title">
            <div class="summary-modal-header">
              <h2 id="summary-title" class="summary-modal-title">Summary of Your Symptoms</h2>
              <button class="summary-modal-close" @click="closeSummary" aria-label="Close summary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="summary-modal-body">
              <div v-if="summaryProfile.age || summaryProfile.sex || summaryProfile.location" class="summary-meta">
                <div v-if="summaryProfile.sex || summaryProfile.age" class="summary-meta-item">
                  <span class="summary-meta-label">Profile:</span>
                  <span>{{ [summaryProfile.sex, summaryProfile.age ? summaryProfile.age + ' yrs' : ''].filter(Boolean).join(' · ') }}</span>
                </div>
                <div v-if="summaryProfile.location" class="summary-meta-item">
                  <span class="summary-meta-label">Location:</span>
                  <span>{{ summaryProfile.location }}</span>
                </div>
              </div>

              <div v-if="summarySymptoms.length === 0" class="summary-empty">
                No symptoms were recorded.
              </div>

              <div v-else class="summary-symptoms">
                <div
                  v-for="(symptom, index) in summarySymptoms"
                  :key="symptom.id || index"
                  class="summary-symptom-item"
                  :class="`triage-${symptom.level}`"
                >
                  <div class="summary-symptom-header">
                    <span class="summary-symptom-index">{{ index + 1 }}</span>
                    <div class="summary-symptom-title-wrap">
                      <h3 class="summary-symptom-name">{{ symptom.name }}</h3>
                      <span v-if="symptom.sourceBodyPart" class="summary-symptom-part">{{ symptom.sourceBodyPart }}</span>
                    </div>
                  </div>
                  <span class="summary-triage-badge" :style="{ color: getTriageColor(symptom.level), background: getTriageTint(symptom.level) }">
                    {{ symptom.levelLabel }}
                  </span>
                  <p v-if="symptom.nextStep" class="summary-symptom-next">{{ symptom.nextStep }}</p>
                </div>
              </div>
            </div>

            <div class="summary-modal-footer">
              <button @click="closeSummary" class="nav-btn prev-btn">Cancel</button>
              <button @click="finishAndReset" class="nav-btn finish-btn">
                Finish
                <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NearbyHealthMap from '~/components/NearbyHealthMap.vue'
import { evaluateTriage, getTriageColor } from '~/composables/useTriage'

const router = useRouter()
const userLocation = ref(null)
const showDoctorResults = ref(false)
/* Exact coordinates saved by the Info page's autocomplete (null when unavailable) */
const userCoords = ref({ lat: null, lng: null })
const facilities = ref([])
const loading = ref(true)
/* Static doctor directory for the "Doctors Nearby" section.
   OpenStreetMap's `amenity=doctors` tag only ever yields facility/building
   names — never individual doctors — so this section uses a fixed curated
   list of generic specialty + clinic entries instead of live map data. */
const DOCTORS = [
  {
    id: 'doctor-gp-1',
    initials: 'GP',
    specialty: 'General Practitioner',
    clinic: 'San Fernando City Health Center',
    address: 'A. Consunji Street, San Fernando, Pampanga',
    phone: '+63 (45) 961 1234',
    hours: 'Mon–Sat · 8:00 AM – 5:00 PM',
  },
  {
    id: 'doctor-gp-2',
    initials: 'GP',
    specialty: 'General Practitioner',
    clinic: 'Navarro–Mallari Charity Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 2234',
    hours: 'Mon–Fri · 9:00 AM – 6:00 PM',
  },
  {
    id: 'doctor-gp-3',
    initials: 'GP',
    specialty: 'General Practitioner',
    clinic: 'Santos Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 3234',
    hours: 'Tue–Sun · 8:00 AM – 4:00 PM',
  },
  {
    id: 'doctor-im-1',
    initials: 'IM',
    specialty: 'Internal Medicine',
    clinic: 'Saint Ferdinand Medical Arts Building',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 5678',
    hours: 'Mon–Fri · 9:00 AM – 6:00 PM',
  },
  {
    id: 'doctor-im-2',
    initials: 'IM',
    specialty: 'Internal Medicine',
    clinic: 'San Fernando City Health Center',
    address: 'A. Consunji Street, San Fernando, Pampanga',
    phone: '+63 (45) 961 6678',
    hours: 'Mon–Sat · 8:00 AM – 5:00 PM',
  },
  {
    id: 'doctor-im-3',
    initials: 'IM',
    specialty: 'Internal Medicine',
    clinic: 'Santos Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 7678',
    hours: 'Wed–Sun · 9:00 AM – 5:00 PM',
  },
  {
    id: 'doctor-fm-1',
    initials: 'FM',
    specialty: 'Family Medicine',
    clinic: 'Saint Ferdinand Medical Arts Building',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 9012',
    hours: 'Mon–Sat · 8:00 AM – 4:00 PM',
  },
  {
    id: 'doctor-fm-2',
    initials: 'FM',
    specialty: 'Family Medicine',
    clinic: 'Navarro–Mallari Charity Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 8012',
    hours: 'Mon–Fri · 8:00 AM – 5:00 PM',
  },
  {
    id: 'doctor-fm-3',
    initials: 'FM',
    specialty: 'Family Medicine',
    clinic: 'San Fernando City Health Center',
    address: 'A. Consunji Street, San Fernando, Pampanga',
    phone: '+63 (45) 961 7012',
    hours: 'Tue–Sat · 9:00 AM – 6:00 PM',
  },
  {
    id: 'doctor-pd-1',
    initials: 'PD',
    specialty: 'Pediatrics',
    clinic: 'Santos Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 3456',
    hours: 'Tue–Sun · 9:00 AM – 5:00 PM',
  },
  {
    id: 'doctor-pd-2',
    initials: 'PD',
    specialty: 'Pediatrics',
    clinic: 'Saint Ferdinand Medical Arts Building',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 4456',
    hours: 'Mon–Sat · 8:00 AM – 4:00 PM',
  },
  {
    id: 'doctor-pd-3',
    initials: 'PD',
    specialty: 'Pediatrics',
    clinic: 'Navarro–Mallari Charity Clinic',
    address: 'San Fernando, Pampanga',
    phone: '+63 (45) 961 5456',
    hours: 'Mon–Fri · 9:00 AM – 6:00 PM',
  },
]

/* Specialty filter for the "Doctors Nearby" section. */
const SPECIALTY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'General Practitioner', label: 'General Practitioner' },
  { value: 'Internal Medicine', label: 'Internal Medicine' },
  { value: 'Family Medicine', label: 'Family Medicine' },
  { value: 'Pediatrics', label: 'Pediatrics' },
]
const specialtyFilter = ref('all')
const filteredDoctors = computed(() =>
  specialtyFilter.value === 'all'
    ? DOCTORS
    : DOCTORS.filter((doctor) => doctor.specialty === specialtyFilter.value)
)
const activeSpecialtyLabel = computed(
  () => SPECIALTY_FILTERS.find((option) => option.value === specialtyFilter.value)?.label || ''
)

/* Fixed emergency contact number shown for every facility, since individual
   facility phone numbers are usually unavailable from OpenStreetMap. Matches
   the number used in the triage-flow facilities list (useTriageFlow.ts). */
const FIXED_CONTACT_NUMBER = '911'

/* ── Summary modal state ─────────────────────────────────────────────────── */
const showSummary = ref(false)
const summaryProfile = ref({ age: '', sex: '', location: '' })
const summarySymptoms = ref([])

function phoneHref(phone) {
  return `tel:${String(phone || '').replace(/[^0-9+]/g, '')}`
}

function safeWebsite(website) {
  try {
    const url = new URL(website)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch (e) {
    return ''
  }
}

/* Triage badge tint keyed off the level, mirroring what-you-can-do.vue */
function getTriageTint(level) {
  if (level === 'emergency') return '#FEE2E2'
  if (level === 'urgent') return '#FEF3C7'
  return '#DCFCE7'
}

function formatSex(value) {
  if (!value) return ''
  return value === 'male' ? 'Male' : value === 'female' ? 'Female' : value
}

/* Load the saved symptoms + profile and evaluate triage for each symptom */
function openSummary() {
  try {
    summaryProfile.value = {
      age: localStorage.getItem('symply_user_age') || '',
      sex: formatSex(localStorage.getItem('symply_user_sex')),
      location: localStorage.getItem('symply_user_address') || '',
    }

    const stored = localStorage.getItem('selectedSymptoms')
    const parsed = stored ? JSON.parse(stored) : []
    summarySymptoms.value = Array.isArray(parsed)
      ? parsed.map((symptom) => {
          const answers = symptom.followUpAnswers || {}
          const result = evaluateTriage(symptom, answers)
          return {
            id: symptom.id,
            name: symptom.name,
            sourceBodyPart: symptom.sourceBodyPart,
            level: result.level,
            levelLabel: result.levelLabel,
            nextStep: result.nextStep,
          }
        })
      : []
  } catch (e) {
    console.error('Failed to build symptom summary:', e)
    summarySymptoms.value = []
  }
  showSummary.value = true
}

function closeSummary() {
  showSummary.value = false
}

/* Reset everything and return to the first page (Info) */
function finishAndReset() {
  try {
    localStorage.removeItem('selectedSymptoms')
    localStorage.removeItem('symply_user_age')
    localStorage.removeItem('symply_user_sex')
    localStorage.removeItem('symply_user_address')
    localStorage.removeItem('symply_user_lat')
    localStorage.removeItem('symply_user_lng')
    sessionStorage.removeItem('returningFromResult')
  } catch (e) {
    console.error('Failed to reset session data:', e)
  }
  showSummary.value = false
  router.push('/')
}


/* Load user location from localStorage */
async function loadUserProfile() {
  try {
    userLocation.value = localStorage.getItem('symply_user_address')

    // Read coordinates saved by the Info page's autocomplete (if any)
    const rawLat = Number(localStorage.getItem('symply_user_lat'))
    const rawLng = Number(localStorage.getItem('symply_user_lng'))
    userCoords.value = {
      lat: Number.isFinite(rawLat) ? rawLat : null,
      lng: Number.isFinite(rawLng) ? rawLng : null,
    }

    /* Only stop loading once the map reports back. Without this the
       "No facilities" state would flash before the search finishes. */
    if (!userLocation.value) loading.value = false
  } catch (e) {
    console.error('Failed to load user profile:', e)
    loading.value = false
  }
}

/* Handle facilities loaded from the map component */
function onFacilitiesLoaded(loadedFacilities) {
  facilities.value = loadedFacilities
  loading.value = false
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m away`
  return `${(meters / 1000).toFixed(1)} km away`
}

function goBackToWhatYouCanDo() {
  router.push('/what-you-can-do')
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
/* ─── Core Page ─────────────────────────────────────────────────────────────── */
.where-to-get-help-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--symply-bg-app);
}

/* ─── Content Layout ────────────────────────────────────────────────────────── */
.content-wrapper {
  flex: 1;
  padding: 40px 24px;
}

.content-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 12px 0;
}

.page-description {
  color: var(--symply-text-secondary);
  font-size: 1rem;
  margin: 0 0 32px 0;
  text-align: justify;
  text-justify: inter-word;
}

/* ─── Location Section ──────────────────────────────────────────────────────── */
.location-section {
  margin-bottom: 32px;
}

.location-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
}

.location-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--symply-primary-light);
  border-radius: var(--symply-radius-md);
}

.location-content {
  flex: 1;
}

.location-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 8px 0;
}

.location-text {
  color: var(--symply-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* ─── Find a Doctor ──────────────────────────────────────────────────────────── */
.doctor-search-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--symply-card-bg);
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
}

.doctor-search-description {
  margin: -4px 0 20px;
  color: var(--symply-text-secondary);
  line-height: 1.6;
  text-align: justify;
  text-justify: inter-word;
}

.doctor-search-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 0;
  border-radius: var(--symply-radius-md);
  background: var(--symply-primary-bg);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.doctor-search-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--symply-shadow-md);
}

.doctor-search-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.doctor-results {
  margin-top: 20px;
}

.doctor-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.doctor-filter-pill {
  min-height: 36px;
  padding: 6px 14px;
  border: 1px solid var(--symply-border);
  border-radius: 20px;
  background: var(--symply-card-bg);
  color: var(--symply-text-secondary);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.doctor-filter-pill:hover {
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
}

.doctor-filter-pill--active {
  border-color: var(--symply-primary-bg);
  background: var(--symply-primary-bg);
  color: white;
}

.doctor-filter-count {
  margin: 0 0 12px;
  color: var(--symply-text-muted);
  font-size: 0.8125rem;
}

.doctor-list {
  display: grid;
  gap: 12px;
}

.doctor-list-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  background: var(--symply-card-bg);
}

.doctor-avatar {
  display: flex;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--symply-primary-bg) 0%, var(--symply-primary) 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.doctor-clinic {
  margin: 0;
  color: var(--symply-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.doctor-list-icon {
  display: flex;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  align-self: center;
  justify-content: center;
  border-radius: var(--symply-radius-md);
  background: var(--symply-primary-light);
}

.doctor-list-info {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
}

.doctor-list-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: break-word;
  word-break: break-word;
}

.doctor-list-detail,
.doctor-list-distance {
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
}

.doctor-list-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.doctor-list-detail {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  color: var(--symply-text-secondary);
  text-align: left;
}

.doctor-list-detail .v-icon,
.doctor-list-action .v-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.doctor-list-location span {
  min-width: 0;
  flex: 1 1 auto;
}

.doctor-list-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 6px;
}

.doctor-list-action {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--symply-primary);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.doctor-list-action:hover {
  text-decoration: underline;
}

.doctor-list-distance {
  margin: 0;
  color: var(--symply-text-muted);
}

@media (max-width: 480px) {
  .doctor-list-item {
    gap: 12px;
    padding: 12px 14px;
  }

  .doctor-list-icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }
}

.doctor-results-state {
  margin: 0;
  padding: 16px;
  border-radius: var(--symply-radius-md);
  background: var(--symply-bg-app);
  color: var(--symply-text-secondary);
}

.doctor-search-note {
  margin: 16px 0 0;
  color: var(--symply-text-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

/* ─── Loading Section ───────────────────────────────────────────────────────── */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
}

.loading-text {
  color: var(--symply-text-secondary);
  font-size: 1rem;
}

/* ─── No Facilities Section ─────────────────────────────────────────────────── */
.no-facilities-section {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
}

.no-facilities-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-facilities-text {
  color: var(--symply-text-muted);
  font-size: 1rem;
}

/* ─── Facilities List Section ────────────────────────────────────────────────── */
.facilities-list-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 16px 0;
}

.facility-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
  margin-bottom: 12px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.facility-list-item:hover {
  box-shadow: var(--symply-shadow-md);
  border-color: #99F6E4;
}

.facility-list-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: var(--symply-radius-md);
  overflow: hidden;
  background: #F1F5F9;
}

.facility-list-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.facility-list-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ECFEFF;
}

.facility-list-info {
  flex: 1;
  min-width: 0;
}

.facility-list-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 4px 0;
  overflow-wrap: anywhere;
}

.facility-list-location,
.facility-list-phone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--symply-text-secondary);
  line-height: 1.5;
  margin: 2px 0;
  min-width: 0;
}

.facility-list-location span,
.facility-list-phone span {
  overflow-wrap: anywhere;
}

.facility-list-distance {
  font-size: 0.8125rem;
  color: #06B6D4;
  font-weight: 600;
  margin: 2px 0;
}

/* ─── Action Buttons ────────────────────────────────────────────────────────── */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--symply-border);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--symply-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.prev-btn {
  background: white;
  color: var(--symply-text-secondary);
  border: 2px solid var(--symply-border);
}

.prev-btn:hover {
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
  background: #F8FAFC;
}

/* ─── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 24px;
  }
}

@media (max-width: 640px) {
  .content-wrapper {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .location-card {
    padding: 16px;
  }

  .doctor-search-section {
    padding: 16px;
  }

  .doctor-search-button {
    width: 100%;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .facility-list-item {
    align-items: flex-start;
    gap: 12px;
  }

  .facility-list-thumb {
    width: 56px;
    height: 56px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .summary-modal-overlay {
    padding: 16px;
  }

  .summary-modal-header,
  .summary-modal-body,
  .summary-modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .summary-modal-footer {
    flex-direction: column-reverse;
  }

  .summary-modal-footer .nav-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ─── Summary Button & Modal ─────────────────────────────────────────────── */
.summary-btn,
.finish-btn {
  background: linear-gradient(135deg, var(--symply-primary-bg) 0%, var(--symply-primary) 100%);
  color: white;
  box-shadow: var(--symply-shadow-sm);
}

.summary-btn:hover,
.finish-btn:hover {
  box-shadow: var(--symply-shadow-md);
  transform: translateY(-1px);
}

.summary-btn .summary-icon {
  color: currentColor;
}

.summary-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.summary-modal {
  background: var(--symply-card-bg);
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-lg);
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--symply-border);
}

.summary-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--symply-text-primary);
  margin: 0;
}

.summary-modal-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--symply-radius-md);
  background: transparent;
  color: var(--symply-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-modal-close:hover {
  background: #F1F5F9;
  color: var(--symply-text-primary);
}

.summary-modal-body {
  padding: 24px;
  overflow-y: auto;
}

.summary-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #F8FAFC;
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  margin-bottom: 20px;
}

.summary-meta-item {
  font-size: 0.95rem;
  color: var(--symply-text-primary);
  line-height: 1.5;
}

.summary-meta-label {
  font-weight: 600;
  color: var(--symply-text-secondary);
  margin-right: 6px;
}

.summary-empty {
  text-align: center;
  color: var(--symply-text-muted);
  font-size: 0.95rem;
  padding: 24px 0;
}

.summary-symptoms {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-symptom-item {
  padding: 16px;
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
}

.summary-symptom-item.triage-emergency {
  background: #FEF2F2;
  border-color: #FECACA;
}

.summary-symptom-item.triage-urgent {
  background: #FFFBEB;
  border-color: #FDE68A;
}

.summary-symptom-item.triage-routine {
  background: #F0FDF4;
  border-color: #BBF7D0;
}

.summary-symptom-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.summary-symptom-index {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--symply-border);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--symply-text-secondary);
}

.summary-symptom-title-wrap {
  flex: 1;
  min-width: 0;
}

.summary-symptom-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0;
}

.summary-symptom-part {
  font-size: 0.8125rem;
  color: var(--symply-text-muted);
}

.summary-triage-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--symply-radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
}

.summary-symptom-next {
  font-size: 0.875rem;
  color: var(--symply-text-secondary);
  line-height: 1.55;
  margin: 10px 0 0 0;
}

.summary-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--symply-border);
}

/* Drawer animations */
.drawer-scrim-enter-active,
.drawer-scrim-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-scrim-enter-from,
.drawer-scrim-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* ─── Night mode overrides for Where to Get Help page ───────────────────────────
     These cover elements that still carry fixed hex colors which would stay
     light in dark mode (location card, badges, facility list, no-facilities,
     summary drawer, chart, buttons, map). */
:root[data-theme='dark'] .where-to-get-help-page {
  background: var(--symply-bg-app);
}
:root[data-theme='dark'] .content-wrapper,
:root[data-theme='dark'] .content-container {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .page-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .page-description,
:root[data-theme='dark'] .location-text,
:root[data-theme='dark'] .section-subtitle,
:root[data-theme='dark'] .facilities-list-title,
:root[data-theme='dark'] .facility-list-location,
:root[data-theme='dark'] .facility-list-phone,
:root[data-theme='dark'] .facility-list-distance,
:root[data-theme='dark'] .no-facilities-title,
:root[data-theme='dark'] .no-facilities-text,
:root[data-theme='dark'] .chart-header,
:root[data-theme='dark'] .chart-label,
:root[data-theme='dark'] .no-results {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .location-card {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .location-icon {
  background: var(--symply-primary-light);
}
:root[data-theme='dark'] .location-icon .location-icon-svg {
  color: var(--symply-primary);
}
:root[data-theme='dark'] .facility-list-item {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .facility-list-item:hover {
  border-color: var(--symply-primary);
}
:root[data-theme='dark'] .facility-list-thumb {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .facility-list-thumb-placeholder {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .no-facilities-section {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .facility-item .facility-icon {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .facility-item .facility-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .facility-item .facility-desc,
:root[data-theme='dark'] .facility-item .facility-detail {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .summary-modal-overlay {
  background: rgba(0, 0, 0, 0.55);
}
:root[data-theme='dark'] .summary-modal {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-header {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-close {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-close:hover {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-body {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-meta {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-meta-item {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-meta-label {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .summary-empty {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .summary-symptom-item {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-symptom-item.triage-emergency {
  background: #16210F;
  border-color: #991B1B;
}
:root[data-theme='dark'] .summary-symptom-item.triage-urgent {
  background: #7C2D12;
  border-color: #92400E;
}
:root[data-theme='dark'] .summary-symptom-item.triage-routine {
  background: #16452C;
  border-color: #166534;
}
:root[data-theme='dark'] .summary-symptom-item .summary-symptom-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-symptom-item .summary-symptom-part {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .summary-modal-footer {
  background: var(--symply-card-bg);
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-footer .summary-modal-btn {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-footer .summary-modal-btn:hover {
  background: var(--symply-primary);
  color: white;
}
:root[data-theme='dark'] .chart-container {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .chart-container .chart-title,
:root[data-theme='dark'] .chart-container .chart-subtitle {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .chart-container .chart-legend {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .chart-container .chart-legend .chart-legend-item {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .chart-container .chart-legend .chart-legend-item.active {
  color: var(--symply-primary);
}
:root[data-theme='dark'] .btn-primary,
:root[data-theme='dark'] .btn-secondary,
:root[data-theme='dark'] .action-btn,
:root[data-theme='dark'] .summary-btn {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .btn-primary:hover,
:root[data-theme='dark'] .btn-secondary:hover,
:root[data-theme='dark'] .action-btn:hover,
:root[data-theme='dark'] .summary-btn:hover {
  background: var(--symply-primary);
  color: white;
}

/* ─── Night mode gap fixes ───────────────────────────────────────────────
   The existing block above covers most surfaces; these fill the remaining
   fixed-light elements: the secondary "Back/Cancel" button, the summary
   symptom index circle, and the finish button. */
:root[data-theme='dark'] .prev-btn {
  background: var(--symply-card-bg);
  color: var(--symply-text-secondary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .prev-btn:hover {
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .summary-symptom-index {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
  color: var(--symply-text-secondary);
}
:root[data-theme='dark'] .finish-btn {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .finish-btn:hover {
  background: var(--symply-primary);
  color: white;
}

</style>
