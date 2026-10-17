/**
 * useTriageFlow composable for Symply
 * Manages Emergency and Urgent assessment modal flows
 */

import { ref } from 'vue'
import { useHealthMap } from './useHealthMap'

export type TriageFlowType = 'emergency' | 'urgent' | null
export type TriageFlowStep = 'caution' | 'actions' | 'facilities' | 'summary' | null

export interface TriageFlowState {
  type: TriageFlowType
  step: TriageFlowStep
  isOpen: boolean
  symptom: any
  answers: any
  facilities: any[]
  facilitiesLoading: boolean
  facilitiesError: string | null
  userLocation: { lat: number | null; lng: number | null; address: string | null }
}

export function useTriageFlow() {
  const { fetchNearbyFacilities } = useHealthMap()
  const flowState = ref<TriageFlowState>({
    type: null,
    step: null,
    isOpen: false,
    symptom: null,
    answers: {},
    facilities: [],
    facilitiesLoading: false,
    facilitiesError: null,
    userLocation: { lat: null, lng: null, address: null }
  })

  function openFlow(type: TriageFlowType, symptom: any, answers: any) {
    flowState.value = {
      type,
      step: 'caution',
      isOpen: true,
      symptom,
      answers: { ...answers },
      facilities: [],
      facilitiesLoading: false,
      facilitiesError: null,
      userLocation: {
        lat: Number(localStorage.getItem('symply_user_lat')) || null,
        lng: Number(localStorage.getItem('symply_user_lng')) || null,
        address: localStorage.getItem('symply_user_address') || null
      }
    }
    loadFacilities()
  }

  async function loadFacilities() {
    if (!flowState.value.userLocation.lat || !flowState.value.userLocation.lng) {
      flowState.value.facilitiesError = 'Location not available. Please set your address on the Info page.'
      return
    }

    flowState.value.facilitiesLoading = true
    flowState.value.facilitiesError = null

    try {
      const list = await fetchNearbyFacilities(
        flowState.value.userLocation.lat,
        flowState.value.userLocation.lng,
        10000 // 10km radius for emergency/urgent
      )

      // Prioritize hospitals and emergency departments for emergency flow
      let filtered = list
      if (flowState.value.type === 'emergency') {
        filtered = list.filter(f =>
          f.type?.toLowerCase().includes('hospital') ||
          f.type?.toLowerCase().includes('emergency') ||
          f.name?.toLowerCase().includes('hospital')
        )
        // If no hospitals, fall back to all facilities
        if (filtered.length === 0) filtered = list
      }

      flowState.value.facilities = filtered.slice(0, 5) // Max 5 facilities
    } catch (error) {
      console.error('Failed to load facilities:', error)
      flowState.value.facilitiesError = 'Unable to load nearby facilities. Please try again.'
    } finally {
      flowState.value.facilitiesLoading = false
    }
  }

  function goToStep(step: TriageFlowStep) {
    flowState.value.step = step
    if (step === 'facilities' && flowState.value.facilities.length === 0 && !flowState.value.facilitiesLoading) {
      loadFacilities()
    }
  }

  function nextStep() {
    const steps: TriageFlowStep[] = ['caution', 'actions', 'facilities', 'summary']
    const currentIndex = steps.indexOf(flowState.value.step)
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1])
    }
  }

  function previousStep() {
    const steps: TriageFlowStep[] = ['caution', 'actions', 'facilities', 'summary']
    const currentIndex = steps.indexOf(flowState.value.step)
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1])
    }
  }

  function closeFlow() {
    flowState.value = {
      type: null,
      step: null,
      isOpen: false,
      symptom: null,
      answers: {},
      facilities: [],
      facilitiesLoading: false,
      facilitiesError: null,
      userLocation: { lat: null, lng: null, address: null }
    }
  }

  function getFlowTheme() {
    return flowState.value.type === 'emergency' ? 'emergency' : 'urgent'
  }

  function getStepTitle() {
    const type = flowState.value.type
    const step = flowState.value.step
    if (type === 'emergency') {
      switch (step) {
        case 'caution': return 'Emergency Caution'
        case 'actions': return 'What You Should Do Now'
        case 'facilities': return 'Nearby Emergency Care'
        case 'summary': return 'Emergency Assessment Summary'
        default: return 'Emergency Assessment'
      }
    } else if (type === 'urgent') {
      switch (step) {
        case 'caution': return 'Urgent Caution'
        case 'actions': return 'What You Should Do Now'
        case 'facilities': return 'Nearby Healthcare Facilities'
        case 'summary': return 'Urgent Assessment Summary'
        default: return 'Urgent Assessment'
      }
    }
    return ''
  }

  function getStepContent() {
    const symptom = flowState.value.symptom
    const answers = flowState.value.answers
    const type = flowState.value.type

    if (!symptom || !type) return ''

    switch (flowState.value.step) {
      case 'caution':
        return getCautionContent(symptom, answers, type)
      case 'actions':
        return getActionsContent(symptom, answers, type)
      case 'facilities':
        return getFacilitiesContent()
      case 'summary':
        return getSummaryContent(symptom, answers)
      default:
        return ''
    }
  }

  function getCautionContent(symptom: any, answers: any, type: TriageFlowType) {
    // Report exactly what was answered — do not assume warning signs are
    // absent when the question has not been answered yet.
    let warningSignsText = ''
    if (answers.warningSigns === true) {
      const details = (answers.warningSignDetails || '').trim()
      warningSignsText = details
        ? `You reported warning signs: ${details}`
        : 'You reported that warning signs are present.'
    } else if (answers.warningSigns === false) {
      warningSignsText = 'You reported that no additional warning signs are present.'
    } else {
      warningSignsText = 'The warning-signs questions were not completed as part of this assessment.'
    }

    const severity = answers.severity
      ? `Severity: ${answers.severity.charAt(0).toUpperCase() + answers.severity.slice(1)}`
      : 'Severity: not recorded'
    const duration = answers.duration ? formatDuration(answers.duration) : ''

    // Warning signs from the existing symptom-specific record
    // (Strapi rich-text fields arrive as JSON blocks, not strings)
    const symptomRedFlags = toText(symptom.redFlags || symptom.warningSigns).trim()

    if (type === 'emergency') {
      return `
        <div class="emergency-caution">
          <p class="caution-message"><strong>Based on your answers, this may indicate a medical emergency.</strong></p>
          <p class="symptom-info">Symptom: <strong>${escapeHtml(symptom.name)}</strong></p>
          <p class="symptom-info">${severity}</p>
          ${duration ? `<p class="symptom-info">${formatDuration(answers.duration)}</p>` : ''}
          <p class="caution-details">${warningSignsText}</p>
          ${symptomRedFlags ? `
          <div class="symptom-flags">
            <h4>Warning signs recorded for this symptom</h4>
            <p>${toHtmlLines(symptomRedFlags)}</p>
            <p class="flags-note">These are the warning signs your healthcare service records for this symptom — review them and tell a medical professional about any you have.</p>
          </div>` : ''}
          <p class="caution-note">This assessment does not confirm a diagnosis. It indicates that your answers suggest urgency, and it is safer to be assessed in person.</p>
          <div class="emergency-instruction">
            <p><strong>Call your local emergency number immediately or go to the nearest emergency department.</strong></p>
            <p>Do not drive yourself if symptoms are severe.</p>
          </div>
        </div>
      `
    } else {
      return `
        <div class="urgent-caution">
          <p class="caution-message"><strong>Based on your answers, your symptoms may require prompt medical assessment.</strong></p>
          <p class="symptom-info">Symptom: <strong>${escapeHtml(symptom.name)}</strong></p>
          <p class="symptom-info">${severity}</p>
          ${duration ? `<p class="symptom-info">${formatDuration(answers.duration)}</p>` : ''}
          <p class="caution-details">${warningSignsText}</p>
          ${symptomRedFlags ? `
          <div class="symptom-flags">
            <h4>Warning signs recorded for this symptom</h4>
            <p>${toHtmlLines(symptomRedFlags)}</p>
          </div>` : ''}
          <p class="caution-note">This does not confirm a specific diagnosis, but suggests you should seek medical evaluation soon.</p>
          <div class="emergency-instruction">
            <p><strong>Contact a healthcare provider today or visit an urgent care clinic.</strong></p>
            <p>If symptoms worsen or you develop warning signs, seek emergency care.</p>
          </div>
        </div>
      `
    }
  }

function getActionsContent(symptom: any, answers: any, type: TriageFlowType) {
  const initialMgmt = toText(symptom.initialManagement) || 'Follow general self-care measures for this symptom.'
  const whenToSeek = toText(symptom.whenToSeekCare) || 'Seek medical care if symptoms worsen or do not improve.'

  if (type === 'emergency') {
    return `
      <div class="emergency-actions">
        <div class="action-section">
          <h4>Immediate Actions</h4>
          <ul>
            <li><strong>Call your local emergency number or go to the nearest emergency department now.</strong></li>
            <li>Do not wait for symptoms to improve on their own.</li>
            <li>Do not drive yourself if you are experiencing severe symptoms.</li>
            <li>If possible, have someone accompany you or call for an ambulance.</li>
          </ul>
        </div>
        <div class="action-section">
          <h4>While waiting for help</h4>
          <p>${toHtmlLines(initialMgmt)}</p>
        </div>
        <div class="action-section">
          <h4>When to seek care</h4>
          <p>${toHtmlLines(whenToSeek)}</p>
        </div>
      </div>
    `
  } else {
    return `
      <div class="urgent-actions">
        <div class="action-section">
          <h4>Recommended Next Steps</h4>
          <ul>
            <li><strong>Contact a healthcare provider today or visit an urgent care clinic.</strong></li>
            <li>If symptoms worsen before you can be seen, seek emergency care.</li>
            <li>Follow any specific guidance for your symptom below.</li>
          </ul>
        </div>
        <div class="action-section">
          <h4>Self-care while awaiting assessment</h4>
          <p>${toHtmlLines(initialMgmt)}</p>
        </div>
        <div class="action-section">
          <h4>When to seek care</h4>
          <p>${toHtmlLines(whenToSeek)}</p>
        </div>
      </div>
    `
  }
}

  function getFacilitiesContent() {
    const { facilities, facilitiesLoading, facilitiesError, type } = flowState.value

    /* Fixed emergency contact number shown for every facility (edit here to change) */
    const FIXED_CONTACT_NUMBER = '911'

    if (facilitiesLoading) {
      return '<div class="facilities-loading"><v-progress-circular indeterminate color="primary" /> <p>Finding nearby facilities...</p></div>'
    }

    if (facilitiesError) {
      return `
        <div class="facilities-error">
          <p>${facilitiesError}</p>
          <button class="retry-btn" @click="loadFacilities">Retry</button>
        </div>
      `
    }

    if (facilities.length === 0) {
      return `
        <div class="facilities-empty">
          <p>No ${type === 'emergency' ? 'emergency departments' : 'healthcare facilities'} found near your location.</p>
          <p>Please ensure your address is set on the Info page, or search manually for local hospitals.</p>
        </div>
      `
    }

    return `
      <div class="facilities-list">
        <p class="facilities-count" style="font-size:0.9rem;font-weight:600;color:var(--symply-text-muted);margin:0 0 1rem 0;">${facilities.length} ${facilities.length === 1 ? 'facility' : 'facilities'} found:</p>
        <div class="facility-items" style="display:flex;flex-direction:column;gap:10px;">
          ${facilities.map(f => `
            <div class="facility-item" style="border:1px solid var(--symply-border);border-radius:10px;padding:12px 14px;">
              <div class="facility-name" style="font-weight:600;color:var(--symply-text-primary);margin:0 0 6px 0;font-size:0.95rem;">${escapeHtml(f.name)}</div>
              <div class="facility-rows" style="display:flex;flex-direction:column;gap:4px;">
                <div class="facility-row" style="display:flex;align-items:flex-start;gap:8px;font-size:0.875rem;color:var(--symply-text-secondary);line-height:1.45;">
                  <svg class="facility-row-icon" style="flex-shrink:0;width:15px;height:15px;margin-top:1px;color:var(--symply-text-muted);" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>${escapeHtml(f.address || 'Address unavailable')}</span>
                </div>
                <div class="facility-row facility-row--phone" style="display:flex;align-items:flex-start;gap:8px;font-size:0.875rem;color:var(--symply-primary);font-weight:500;line-height:1.45;">
                  <svg class="facility-row-icon" style="flex-shrink:0;width:15px;height:15px;margin-top:1px;color:var(--symply-primary);" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>${FIXED_CONTACT_NUMBER}</span>
                </div>
                ${typeof f.distanceMeters === 'number' ? `
                <div class="facility-row facility-row--distance" style="display:flex;align-items:flex-start;gap:8px;font-size:0.8rem;color:var(--symply-text-muted);line-height:1.45;">
                  <svg class="facility-row-icon" style="flex-shrink:0;width:15px;height:15px;margin-top:1px;color:var(--symply-text-muted);" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
                  <span>${formatDistance(f.distanceMeters)}</span>
                </div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  function getSummaryContent(symptom: any, answers: any) {
    const type = flowState.value.type
    const triageLevel = type === 'emergency' ? 'Emergency' : 'Urgent'

    const NOT_ANSWERED = 'Not answered in this assessment'
    const durationValue = answers.duration ? formatDuration(answers.duration) : NOT_ANSWERED
    const severityValue = answers.severity
      ? answers.severity.charAt(0).toUpperCase() + answers.severity.slice(1)
      : NOT_ANSWERED

    let warningSignsValue = NOT_ANSWERED
    if (answers.warningSigns === true) {
      warningSignsValue = (answers.warningSignDetails || '').trim()
        ? answers.warningSignDetails
        : 'Reported present (no details given)'
    } else if (answers.warningSigns === false) {
      warningSignsValue = 'Reported not present'
    }

    let riskFactorsValue = 'No risk factors recorded for this symptom'
    if (answers.riskFactors === true) {
      riskFactorsValue = (answers.riskFactorDetails || '').trim()
        ? answers.riskFactorDetails
        : 'Reported present (no details given)'
    } else if (answers.riskFactors === false) {
      riskFactorsValue = 'Reported not present'
    }

    return `
      <div class="assessment-summary ${type}-summary">
        <div class="summary-row">
          <span class="summary-label">Symptom:</span>
          <span class="summary-value">${toHtmlLines(symptom.name)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Duration:</span>
          <span class="summary-value">${escapeHtml(durationValue)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Severity:</span>
          <span class="summary-value">${escapeHtml(severityValue)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Triage Level:</span>
          <span class="summary-value triage-${type}"><strong>${triageLevel}</strong></span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Warning Signs:</span>
          <span class="summary-value">${toHtmlLines(warningSignsValue)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Risk Factors:</span>
          <span class="summary-value">${toHtmlLines(riskFactorsValue)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Assessment:</span>
          <span class="summary-value">${type === 'emergency' ? 'Potential emergency — immediate care recommended' : 'Prompt medical assessment recommended'}</span>
        </div>
        <p class="summary-note">This summary reports only the answers you provided. It is not a diagnosis.</p>
        <div class="summary-recommendation ${type}-recommendation">
          <strong>Recommended Action:</strong> ${type === 'emergency' ? 'Call your local emergency number or go to the nearest emergency department immediately.' : 'Contact a healthcare provider today or visit an urgent care clinic.'}
        </div>
      </div>
    `
  }

  return {
    flowState,
    openFlow,
    closeFlow,
    nextStep,
    previousStep,
    goToStep,
    getFlowTheme,
    getStepTitle,
    getStepContent
  }
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/* Strapi rich-text fields (description, red flags, management advice) arrive
   as JSON blocks, not strings. Flatten them to plain text. */
function toText(val: any): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (Array.isArray(val)) {
    return val
      .map((node) => toText(node))
      .filter(Boolean)
      .join('\n')
  }
  if (typeof val === 'object') {
    if (val.children) return toText(val.children)
    if (val.text !== undefined) return String(val.text)
    if (val.data) return toText(val.data)
    return ''
  }
  return String(val)
}

/* Escape HTML and keep line breaks so multi-line text renders
   as separate lines instead of running together */
function toHtmlLines(val: any): string {
  return escapeHtml(toText(val)).replace(/\n+/g, '<br>')
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m away`
  return `${(meters / 1000).toFixed(1)} km away`
}

function formatDuration(value) {
  const labels = {
    less_24h: 'Less than 24 hours',
    '1_3_days': '1–3 days',
    more_than_week: 'More than a week',
    more_than_month: 'More than a month'
  }
  return labels[value] || value
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}