<template>
  <div class="what-you-can-do-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="content-container">
        <h1 class="page-title">What You Can Do</h1>
        <p class="page-description">Based on your symptoms, here's what you can do at home and when to seek medical care.</p>

        <!-- Overall Triage Banner -->
        <div v-if="selectedSymptoms.length > 0" class="overall-triage-banner" :class="`triage-${overallTriageLevel}`">
          <div class="triage-banner-header">
            <v-icon :icon="getTriageIcon(overallTriageLevel)" :size="28" :color="getTriageColor(overallTriageLevel)" />
            <div class="triage-banner-title">
              <h2 class="triage-level-label">
                {{ overallTriageLevel === 'emergency' ? 'Severe — Emergency' : overallTriageLevel === 'urgent' ? 'Moderate — Urgent Assessment' : 'Mild — Routine Assessment' }}
              </h2>
              <p class="triage-next-step">
                {{ firstSymptomTriage?.nextStep || '' }}
              </p>
            </div>
          </div>
          <p v-if="overallTriageLevel === 'emergency'" class="emergency-notice">
            <strong>If you are experiencing emergency symptoms, call 119 (Korea) or your local emergency number immediately.</strong>
          </p>
        </div>

        <!-- Symptom Cards -->
        <div v-if="selectedSymptoms.length > 0" class="symptoms-cards">
          <div
            v-for="symptom in selectedSymptoms"
            :key="symptom.id"
            class="symptom-card"
          >
            <!-- Symptom Triage Header -->
            <div v-if="getTriageResult(symptom)" class="symptom-triage-header" :class="`triage-${getTriageResult(symptom).level}`">
              <div class="triage-badge">
                <v-icon :icon="getTriageIcon(getTriageResult(symptom).level)" :size="20" :color="getTriageColor(getTriageResult(symptom).level)" />
                <span class="triage-level-text">{{ getTriageResult(symptom).levelLabel }}</span>
              </div>
              <div class="triage-reason">
                {{ getTriageResult(symptom).reason }}
              </div>
            </div>

            <div class="card-header">
              <h2 class="symptom-title">{{ symptom.name }}</h2>
              <span v-if="symptom.sourceBodyPart" class="body-source">
                {{ symptom.sourceBodyPart }}
              </span>
            </div>

            <!-- Emergency Guidance (shown first for emergency level) -->
            <div v-if="getTriageResult(symptom)?.shouldShowEmergencyGuidance" class="care-section emergency-guidance">
              <div class="section-icon section-icon--emergency" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 14h-2v-2h2v2zm0-6h-2v4h2v-4zm-1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div class="section-content">
                <h3 class="section-title">Emergency Guidance</h3>
                <div class="section-text">
                  <p><strong>Call 119 or go to the nearest Emergency Department immediately.</strong></p>
                  <p>Do not wait. Do not drive yourself. Emergency warning signs require immediate medical evaluation.</p>
                  <ul v-if="getTriageResult(symptom)?.warningSigns?.length">
                    <li v-for="sign in getTriageResult(symptom).warningSigns" :key="sign">
                      {{ sign }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Initial Management -->
            <div class="care-section">
              <div class="section-icon section-icon--home" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <div class="section-content">
                <h3 class="section-title">Initial Management & Home Care</h3>
                <div class="section-text" v-html="formatContent(symptom.initialManagement)"></div>
              </div>
            </div>

            <!-- When to Seek Care -->
            <div class="care-section">
              <div class="section-icon section-icon--hospital" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6V9h12v10zm-4-4h-2V9h2v6zm0-6h-2V5h2v4z"/>
                </svg>
              </div>
              <div class="section-content">
                <h3 class="section-title">When to Seek Care</h3>
                <div class="section-text" v-html="formatContent(symptom.whenToSeekCare)"></div>
              </div>
            </div>

            <!-- Triage Details: Warning Signs & Next Steps -->
            <div v-if="getTriageResult(symptom) && !getTriageResult(symptom).shouldShowEmergencyGuidance" class="triage-details">
              <div class="triage-detail-row">
                <span class="triage-detail-label">Recommended Next Step:</span>
                <span class="triage-detail-value">{{ getTriageResult(symptom).nextStep }}</span>
              </div>
              <div v-if="getTriageResult(symptom).warningSigns?.length" class="triage-detail-row">
                <span class="triage-detail-label">Warning Signs to Watch For:</span>
                <div class="triage-detail-value">
                  <ul class="warning-signs-list">
                    <li v-for="sign in getTriageResult(symptom).warningSigns" :key="sign">{{ sign }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="10" y="15" width="50" height="60" rx="4" stroke="#CBD5E1" stroke-width="2" fill="none"/>
              <line x1="20" y1="30" x2="50" y2="30" stroke="#CBD5E1" stroke-width="2"/>
              <line x1="20" y1="40" x2="50" y2="40" stroke="#CBD5E1" stroke-width="2"/>
              <line x1="20" y1="50" x2="40" y2="50" stroke="#CBD5E1" stroke-width="2"/>
              <circle cx="24" cy="30" r="3" fill="#34D399"/>
              <path d="M22 30 L23.5 31.5 L26 29" stroke="white" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
          <p class="empty-text">No symptoms added yet</p>
          <button class="add-symptoms-btn" @click="goToSymptoms">
            Add Symptoms
            <svg class="chevron-right" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Navigation Buttons -->
        <div class="action-buttons">
          <button @click="goToSymptoms" class="nav-btn prev-btn">
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Symptoms
          </button>
          <button @click="goToWhereToGetHelp" class="nav-btn continue-btn">
            Where to Get Help
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStrapi } from '~/composables/useStrapi'
import { evaluateTriage, getTriageColor, getTriageIcon } from '~/composables/useTriage'

const router = useRouter()
const currentStep = ref(3)
const selectedSymptoms = ref([])
const userLocation = ref(null)
const symptomTriageResults = ref({})

const config = useRuntimeConfig()
const strapiBase = config.public.strapiBase
const { normalizeConcern } = useStrapi()

/* Load user location from localStorage for later use */
function loadUserProfile() {
  try {
    userLocation.value = localStorage.getItem('symply_user_address')
  } catch (e) {
    console.error('Failed to load user profile:', e)
  }
}

/* Evaluate triage for a single symptom */
function evaluateSymptomTriage(symptom) {
  const answers = symptom.followUpAnswers || {}
  return evaluateTriage(symptom, answers)
}

/* Parse content with bullet points and convert to proper HTML lists */
function formatContent(text) {
  if (!text) return ''

  // First, check if the text already contains HTML tags
  if (text.includes('<ul>') || text.includes('<ol>') || text.includes('<li>')) {
    return text
  }

  const lines = text.split('\n')
  const hasBullets = lines.some(line => {
    const trimmed = line.trim()
    return trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')
  })

  if (hasBullets) {
    const listItems = []
    let currentItem = ''

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        if (currentItem) {
          listItems.push(currentItem)
        }
        currentItem = trimmed.slice(1).trim()
      } else {
        if (currentItem) {
          currentItem += ' ' + trimmed
        }
      }
    }

    if (currentItem) {
      listItems.push(currentItem)
    }

    if (listItems.length > 0) {
      return '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>'
    }
  }

  return `<p>${text}</p>`
}

onMounted(async () => {
  if (process.client) {
    loadUserProfile()
    const stored = localStorage.getItem('selectedSymptoms')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        selectedSymptoms.value = parsed

        let shouldUpdateStorage = false

        for (const symptom of selectedSymptoms.value) {
          if (!symptom.initialManagement || !symptom.whenToSeekCare) {
            try {
              const query = `filters[Symptom_Name][$eqi]=${encodeURIComponent(symptom.name)}&populate=*&pagination[pageSize]=1`
              const url = `${strapiBase}/api/abdomen-stomaches?${query}`

              const res = await $fetch(url)

              if (res && res.data && res.data.length > 0) {
                const normalized = normalizeConcern(res.data[0])
                symptom.initialManagement = normalized.initial_management
                symptom.whenToSeekCare = normalized.when_to_seek_care
                shouldUpdateStorage = true
              }
            } catch (err) {
              console.error('Failed to fetch symptom data:', err)
            }
          }

          // Evaluate triage for each symptom
          symptomTriageResults.value[symptom.id] = evaluateSymptomTriage(symptom)
        }

        if (shouldUpdateStorage) {
          localStorage.setItem('selectedSymptoms', JSON.stringify(selectedSymptoms.value))
        }
      } catch (e) {
        console.error('Failed to parse or fetch stored symptoms:', e)
        selectedSymptoms.value = []
      }
    }
  }
})

function goToSymptoms() {
  sessionStorage.setItem('returningFromResult', 'true')
  router.push('/bodymap')
}

function goToWhereToGetHelp() {
  router.push('/where-to-get-help')
}

/* Get triage result for a symptom */
function getTriageResult(symptom) {
  return symptomTriageResults.value[symptom.id] || null
}

/* Get overall triage next step for the banner */
const firstSymptomTriage = computed(() => {
  if (selectedSymptoms.value.length === 0) return null
  return symptomTriageResults.value[selectedSymptoms.value[0].id] || null
})

/* Get overall highest triage level across all symptoms */
const overallTriageLevel = computed(() => {
  if (selectedSymptoms.value.length === 0) return 'routine'
  const levels = selectedSymptoms.value.map(s => symptomTriageResults.value[s.id]?.level || 'routine')
  if (levels.includes('emergency')) return 'emergency'
  if (levels.includes('urgent')) return 'urgent'
  return 'routine'
})
</script>

<style scoped>
/* ─── Core Page ─────────────────────────────────────────────────────────────── */
.what-you-can-do-page {
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
}

/* ─── Symptom Cards ─────────────────────────────────────────────────────────── */
.symptoms-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.symptom-card {
  background: white;
  border-radius: var(--symply-radius-lg);
  padding: 32px;
  box-shadow: var(--symply-shadow-sm);
  transition: box-shadow 0.2s ease;
}

.symptom-card:hover {
  box-shadow: var(--symply-shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--symply-border);
}

.symptom-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0;
}

.body-source {
  font-size: 0.875rem;
  color: var(--symply-text-secondary);
  background: #F8FAFC;
  padding: 4px 12px;
  border-radius: var(--symply-radius-sm);
}

/* ─── Care Sections ─────────────────────────────────────────────────────────── */
.care-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #F8FAFC;
  border-radius: var(--symply-radius-md);
}

.section-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--symply-radius-md);
  /* Debug: ensure SVG is visible */
  overflow: visible;
}

/* Icon colors matching Symply healthcare style */
.section-icon--home {
  background: rgba(22, 163, 74, 0.12);
  color: #16A34A;
}

.section-icon--hospital {
  background: rgba(220, 38, 38, 0.12);
  color: #DC2626;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 8px 0;
  flex: 1;
}

.section-content {
  flex: 1;
}

.section-text {
  color: var(--symply-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  text-align: justify;
  text-justify: inter-word;
}

.section-text p,
.section-text li,
.triage-reason,
.triage-detail-value,
.triage-next-step {
  text-align: justify;
  text-justify: inter-word;
}

/* ─── Empty State ───────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  color: var(--symply-text-muted);
  font-size: 1rem;
  margin: 0 0 24px 0;
}

.add-symptoms-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: white;
  color: var(--symply-primary-bg);
  border: 2px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-symptoms-btn:hover {
  border-color: var(--symply-primary);
  color: var(--symply-primary-bg);
  background: #F8FAFC;
  box-shadow: var(--symply-shadow-sm);
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

.continue-btn {
  background: linear-gradient(135deg, var(--symply-primary-bg) 0%, var(--symply-primary) 100%);
  color: white;
  box-shadow: var(--symply-shadow-sm);
}

.continue-btn:hover {
  box-shadow: var(--symply-shadow-md);
  transform: translateY(-1px);
}

/* ─── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 24px;
  }

  .symptom-card {
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

  .symptom-card {
    padding: 20px;
  }

  .care-section {
    flex-direction: column;
    padding: 16px;
  }

  .section-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }

  .triage-banner-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .triage-detail-row {
    flex-direction: column;
    gap: 4px;
  }
}

/* ─── Overall Triage Banner ─────────────────────────────────────────────────── */
.overall-triage-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: var(--symply-radius-lg);
  margin-bottom: 32px;
  box-shadow: var(--symply-shadow-sm);
}

.overall-triage-banner.triage-emergency {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  border: 2px solid #DC2626;
}

.overall-triage-banner.triage-urgent {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border: 2px solid #D97706;
}

.overall-triage-banner.triage-routine {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border: 2px solid #16A34A;
}

.triage-banner-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.triage-banner-title {
  flex: 1;
}

.triage-level-label {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.triage-emergency .triage-level-label { color: #DC2626; }
.triage-urgent .triage-level-label { color: #D97706; }
.triage-routine .triage-level-label { color: #16A34A; }

.triage-next-step {
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
  color: var(--symply-text-secondary);
}

.emergency-notice {
  margin: 12px 0 0 0;
  padding: 12px 16px;
  background: #FEE2E2;
  border-radius: var(--symply-radius-md);
  color: #991B1B;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ─── Symptom Triage Header ─────────────────────────────────────────────────── */
.symptom-triage-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: var(--symply-radius-md);
  margin-bottom: 16px;
}

.symptom-triage-header.triage-emergency {
  background: #FEF2F2;
  border: 1px solid #FECACA;
}

.symptom-triage-header.triage-urgent {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
}

.symptom-triage-header.triage-routine {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
}

.triage-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--symply-radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.triage-emergency .triage-badge { background: #FEE2E2; color: #DC2626; }
.triage-urgent .triage-badge { background: #FEF3C7; color: #D97706; }
.triage-routine .triage-badge { background: #DCFCE7; color: #16A34A; }

.triage-reason {
  flex: 1;
  font-size: 0.9rem;
  color: var(--symply-text-secondary);
  line-height: 1.5;
}

/* ─── Emergency Guidance Section ────────────────────────────────────────────── */
.emergency-guidance {
  background: #FEF2F2;
  border: 2px solid #DC2626;
}

.section-icon--emergency {
  background: rgba(220, 38, 38, 0.12);
  color: #DC2626;
}

/* ─── Triage Details ────────────────────────────────────────────────────────── */
.triage-details {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: var(--symply-radius-md);
  margin-top: 16px;
}

.triage-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--symply-border);
}

.triage-detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.triage-detail-label {
  flex-shrink: 0;
  min-width: 180px;
  font-weight: 600;
  color: var(--symply-text-secondary);
  font-size: 0.9rem;
}

.triage-detail-value {
  flex: 1;
  color: var(--symply-text-primary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.warning-signs-list {
  margin: 0;
  padding-left: 20px;
}

.warning-signs-list li {
  margin-bottom: 4px;
  color: var(--symply-text-secondary);
}

@media (max-width: 640px) {
  .triage-banner-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .triage-detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .triage-detail-label {
    min-width: auto;
  }
}

/* ─── Night mode overrides ───────────────────────────────────────────────
   This page had no dark overrides and is packed with fixed light colors
   (white surfaces, #F8FAFC panels, triage tints/gradients). Repaint every
   one of them for data-theme="dark" using the shared --symply-* tokens and
   a consistent dark-tint palette (see where-to-get-help.vue). */

/* Neutral surfaces */
:root[data-theme='dark'] .symptom-card,
:root[data-theme='dark'] .empty-state,
:root[data-theme='dark'] .add-symptoms-btn,
:root[data-theme='dark'] .prev-btn {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .add-symptoms-btn:hover,
:root[data-theme='dark'] .prev-btn:hover {
  background: var(--symply-card-bg);
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
}

/* Recessed panels */
:root[data-theme='dark'] .body-source,
:root[data-theme='dark'] .care-section,
:root[data-theme='dark'] .triage-details {
  background: #0f1a2b;
  border-color: var(--symply-border);
}

/* Section icons (home / hospital / emergency) */
:root[data-theme='dark'] .section-icon--home {
  background: rgba(34, 197, 94, 0.16);
  color: #4ADE80;
}
:root[data-theme='dark'] .section-icon--hospital,
:root[data-theme='dark'] .section-icon--emergency {
  background: rgba(239, 68, 68, 0.16);
  color: #F87171;
}

/* Overall triage banner — flat dark tints replace the light gradients */
:root[data-theme='dark'] .overall-triage-banner.triage-emergency {
  background: #2A1216;
  border-color: #991B1B;
}
:root[data-theme='dark'] .overall-triage-banner.triage-urgent {
  background: #2A2110;
  border-color: #92400E;
}
:root[data-theme='dark'] .overall-triage-banner.triage-routine {
  background: #0F2A1A;
  border-color: #166534;
}
:root[data-theme='dark'] .triage-emergency .triage-level-label { color: #FCA5A5; }
:root[data-theme='dark'] .triage-urgent .triage-level-label { color: #FCD34D; }
:root[data-theme='dark'] .triage-routine .triage-level-label { color: #86EFAC; }

/* Emergency notice strip */
:root[data-theme='dark'] .emergency-notice {
  background: #2A1216;
  color: #FCA5A5;
}

/* Symptom triage header tints */
:root[data-theme='dark'] .symptom-triage-header.triage-emergency {
  background: #2A1216;
  border-color: #991B1B;
}
:root[data-theme='dark'] .symptom-triage-header.triage-urgent {
  background: #2A2110;
  border-color: #92400E;
}
:root[data-theme='dark'] .symptom-triage-header.triage-routine {
  background: #0F2A1A;
  border-color: #166534;
}

/* Triage badges */
:root[data-theme='dark'] .triage-emergency .triage-badge { background: #3A1518; color: #FCA5A5; }
:root[data-theme='dark'] .triage-urgent .triage-badge { background: #3A2C10; color: #FCD34D; }
:root[data-theme='dark'] .triage-routine .triage-badge { background: #123522; color: #86EFAC; }

/* Emergency guidance care-section */
:root[data-theme='dark'] .emergency-guidance {
  background: #2A1216;
  border-color: #991B1B;
}

</style>