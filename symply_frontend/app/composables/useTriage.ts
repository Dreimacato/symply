/**
 * useTriage composable for Symply
 * Centralized triage evaluation logic for symptom assessment
 */

export type TriageLevel = 'emergency' | 'urgent' | 'routine'

export interface TriageResult {
  level: TriageLevel
  levelLabel: string
  reason: string
  nextStep: string
  warningSigns: string[]
  shouldShowEmergencyGuidance: boolean
}

export interface FollowUpAnswers {
  duration?: string
  severity?: 'mild' | 'moderate' | 'severe'
  warningSigns?: boolean
  warningSignDetails?: string
  riskFactors?: boolean
  riskFactorDetails?: string
}

export interface SymptomData {
  name: string
  bodyPart?: string
  redFlags?: string
  warningSigns?: string
  initialManagement?: string
  whenToSeekCare?: string
  triageLevel?: string
  triageCriteria?: Array<{ Triage_Level?: string }>
}

/**
 * Symptom-specific emergency warning signs
 * These are high-risk indicators that should escalate to emergency regardless of self-reported severity
 */
const EMERGENCY_WARNING_SIGNS: Record<string, string[]> = {
  // Headache
  'headache': [
    'sudden onset thunderclap headache',
    'worst headache of life',
    'weakness or numbness',
    'confusion or difficulty speaking',
    'vision changes or loss',
    'stiff neck with fever',
    'head injury followed by worsening headache',
    'new headache with fever and neck stiffness'
  ],
  'migraine': [
    'sudden onset thunderclap headache',
    'worst headache of life',
    'weakness or numbness',
    'confusion or difficulty speaking',
    'vision changes or loss',
    'stiff neck with fever'
  ],

  // Chest pain
  'chest pain': [
    'shortness of breath',
    'pain radiating to arm, jaw, neck, or back',
    'dizziness, lightheadedness, or fainting',
    'cold sweats',
    'nausea or vomiting with chest pain',
    'palpitations or irregular heartbeat'
  ],
  'heart pain': [
    'shortness of breath',
    'pain radiating to arm, jaw, neck, or back',
    'dizziness, lightheadedness, or fainting',
    'cold sweats',
    'nausea or vomiting with chest pain'
  ],
  'chest discomfort': [
    'shortness of breath',
    'pain radiating to arm, jaw, neck, or back',
    'dizziness, lightheadedness, or fainting'
  ],

  // Abdominal pain
  'abdominal pain': [
    'severe, constant pain',
    'pain with vomiting blood or coffee-ground material',
    'black or bloody stools',
    'inability to pass stool or gas with vomiting',
    'severe tenderness with guarding',
    'pregnant with severe abdominal pain'
  ],
  'stomach pain': [
    'severe, constant pain',
    'vomiting blood or coffee-ground material',
    'black or bloody stools',
    'inability to pass stool or gas with vomiting'
  ],
  'belly pain': [
    'severe, constant pain',
    'vomiting blood or coffee-ground material',
    'black or bloody stools'
  ],

  // Shortness of breath / difficulty breathing
  'shortness of breath': [
    'unable to speak in full sentences',
    'blue lips or fingernails',
    'confusion or drowsiness',
    'chest pain with breathing difficulty'
  ],
  'difficulty breathing': [
    'unable to speak in full sentences',
    'blue lips or fingernails',
    'confusion or drowsiness',
    'chest pain with breathing difficulty'
  ],
  'breathing difficulty': [
    'unable to speak in full sentences',
    'blue lips or fingernails',
    'confusion or drowsiness'
  ],

  // Allergic reaction / anaphylaxis
  'allergic reaction': [
    'difficulty breathing or swallowing',
    'swelling of face, lips, or throat',
    'wheezing or stridor',
    'dizziness or fainting',
    'rapid pulse with rash'
  ],
  'anaphylaxis': [
    'difficulty breathing or swallowing',
    'swelling of face, lips, or throat',
    'wheezing or stridor',
    'dizziness or fainting'
  ],

  // Stroke symptoms
  'stroke': [
    'face drooping',
    'arm weakness',
    'speech difficulty',
    'sudden confusion',
    'sudden vision loss',
    'sudden severe headache',
    'sudden dizziness or loss of balance'
  ],
  'weakness': [
    'sudden weakness on one side',
    'face drooping',
    'speech difficulty'
  ],
  'numbness': [
    'sudden numbness on one side',
    'face drooping',
    'speech difficulty'
  ],

  // Severe bleeding
  'bleeding': [
    'uncontrolled bleeding',
    'bleeding that soaks through bandage',
    'vomiting blood',
    'black/tarry stools',
    'blood in urine'
  ],

  // Fever with warning signs
  'fever': [
    'confusion or altered mental status',
    'stiff neck',
    'difficulty breathing',
    'rash that does not blanch',
    'seizure',
    'temperature above 40°C (104°F)'
  ],

  // Pregnancy-related
  'pregnancy': [
    'vaginal bleeding',
    'severe abdominal pain',
    'severe headache with vision changes',
    'sudden swelling of face/hands',
    'decreased fetal movement'
  ],

  // Back pain with red flags
  'back pain': [
    'loss of bladder or bowel control',
    'numbness in groin/saddle area',
    'weakness in legs',
    'fever with back pain',
    'history of cancer with new back pain'
  ],

  // Eye symptoms
  'eye pain': [
    'sudden vision loss',
    'severe eye pain with nausea/vomiting',
    'halos around lights',
    'chemical exposure to eye'
  ],
  'vision changes': [
    'sudden vision loss',
    'double vision',
    'flashes of light with floaters'
  ]
}

/**
 * Symptom-specific urgent warning signs (moderate risk)
 */
const URGENT_WARNING_SIGNS: Record<string, string[]> = {
  'headache': [
    'headache waking from sleep',
    'headache worse in morning',
    'headache with fever',
    'new pattern of headaches'
  ],
  'migraine': [
    'headache waking from sleep',
    'headache worse in morning',
    'new pattern of headaches'
  ],

  'abdominal pain': [
    'pain lasting more than 6 hours',
    'pain with fever',
    'pain with vomiting',
    'pain localized to one area'
  ],

  'chest pain': [
    'pain with exertion',
    'pain relieved by rest',
    'known heart condition'
  ],

  'fever': [
    'fever lasting more than 3 days',
    'fever above 39°C (102°F)',
    'fever with rash'
  ],

  'cough': [
    'cough lasting more than 3 weeks',
    'cough with blood',
    'cough with weight loss',
    'cough with night sweats'
  ],

  'sore throat': [
    'difficulty swallowing',
    'drooling',
    'muffled voice',
    'fever above 38.5°C (101°F)'
  ],

  'rash': [
    'rapidly spreading rash',
    'rash with fever',
    'painful rash',
    'blistering rash'
  ],

  'back pain': [
    'pain radiating down leg',
    'pain worse at night',
    'unexplained weight loss',
    'history of trauma'
  ]
}

/**
 * Risk factors that increase urgency
 */
const RISK_FACTORS_BY_SYMPTOM: Record<string, string[]> = {
  'chest pain': [
    'age over 50',
    'male sex',
    'smoking',
    'diabetes',
    'hypertension',
    'high cholesterol',
    'family history of heart disease',
    'previous heart attack'
  ],
  'stroke': [
    'age over 55',
    'hypertension',
    'atrial fibrillation',
    'diabetes',
    'smoking',
    'previous stroke/TIA'
  ],
  'abdominal pain': [
    'age over 60',
    'pregnancy',
    'recent abdominal surgery',
    'immunocompromised'
  ],
  'shortness of breath': [
    'COPD/asthma',
    'heart failure',
    'obesity',
    'recent surgery'
  ],
  'fever': [
    'immunocompromised',
    'chemotherapy',
    'recent surgery',
    'indwelling catheter'
  ]
}

/**
 * Duration thresholds for escalation
 */
const DURATION_THRESHOLDS = {
  emergency: {
    'chest pain': 'less_24h',
    'stroke': 'less_24h',
    'shortness of breath': 'less_24h',
    'severe abdominal pain': 'less_24h'
  },
  urgent: {
    'abdominal pain': '1_3_days',
    'headache': '1_3_days',
    'fever': '1_3_days',
    'cough': 'more_than_week'
  }
}

/**
 * Check if any emergency warning signs are present in user's answers
 */
function checkEmergencyWarningSigns(symptomName: string, answers: FollowUpAnswers): string[] {
  const matched: string[] = []
  const name = symptomName.toLowerCase()

  // Check exact matches first
  for (const [key, signs] of Object.entries(EMERGENCY_WARNING_SIGNS)) {
    if (name.includes(key) || key.includes(name)) {
      if (answers.warningSigns === true) {
        // If user said yes to warning signs, check if details match emergency signs
        const details = (answers.warningSignDetails || '').toLowerCase()
        for (const sign of signs) {
          if (details.includes(sign.toLowerCase()) || sign.toLowerCase().includes(details)) {
            matched.push(sign)
          }
        }
        // If user said yes but no specific details, assume potential emergency
        if (details === '' || details === 'yes') {
          matched.push(...signs.slice(0, 3)) // Include top 3 as potential
        }
      }
    }
  }

  // Also check for stroke-like symptoms across all symptoms
  const strokeSigns = ['weakness', 'numbness', 'confusion', 'speech difficulty', 'vision loss', 'face drooping']
  const allDetails = ((answers.warningSignDetails || '') + ' ' + (answers.riskFactorDetails || '')).toLowerCase()
  for (const sign of strokeSigns) {
    if (allDetails.includes(sign)) {
      matched.push(`Stroke sign: ${sign}`)
    }
  }

  return [...new Set(matched)] // Deduplicate
}

/**
 * Check if any urgent warning signs are present
 */
function checkUrgentWarningSigns(symptomName: string, answers: FollowUpAnswers): string[] {
  const matched: string[] = []
  const name = symptomName.toLowerCase()

  for (const [key, signs] of Object.entries(URGENT_WARNING_SIGNS)) {
    if (name.includes(key) || key.includes(name)) {
      if (answers.warningSigns === true) {
        const details = (answers.warningSignDetails || '').toLowerCase()
        for (const sign of signs) {
          if (details.includes(sign.toLowerCase())) {
            matched.push(sign)
          }
        }
        if (details === '' || details === 'yes') {
          matched.push(...signs.slice(0, 2))
        }
      }
    }
  }

  return [...new Set(matched)]
}

/**
 * Evaluate duration-based risk
 */
function evaluateDuration(symptomName: string, duration: string | undefined): { isEmergency: boolean; isUrgent: boolean; reason: string } {
  if (!duration) return { isEmergency: false, isUrgent: false, reason: '' }

  const name = symptomName.toLowerCase()

  // Emergency duration thresholds
  for (const [key, threshold] of Object.entries(DURATION_THRESHOLDS.emergency)) {
    if (name.includes(key) && duration === threshold) {
      return { isEmergency: true, isUrgent: false, reason: `Duration ${threshold} for ${key} suggests urgent evaluation` }
    }
  }

  // Urgent duration thresholds
  for (const [key, threshold] of Object.entries(DURATION_THRESHOLDS.urgent)) {
    if (name.includes(key) && (duration === threshold || duration === 'more_than_week' || duration === 'more_than_month')) {
      return { isEmergency: false, isUrgent: true, reason: `Prolonged duration (${duration}) for ${key} warrants prompt evaluation` }
    }
  }

  return { isEmergency: false, isUrgent: false, reason: '' }
}

/**
 * Evaluate risk factors
 */
function evaluateRiskFactors(symptomName: string, answers: FollowUpAnswers): { hasRiskFactors: boolean; factors: string[] } {
  const factors: string[] = []
  const name = symptomName.toLowerCase()

  if (answers.riskFactors === true) {
    const details = (answers.riskFactorDetails || '').toLowerCase()

    for (const [key, riskList] of Object.entries(RISK_FACTORS_BY_SYMPTOM)) {
      if (name.includes(key) || key.includes(name)) {
        for (const factor of riskList) {
          if (details.includes(factor.toLowerCase()) || factor.toLowerCase().includes(details)) {
            factors.push(factor)
          }
        }
      }
    }

    // General risk factors from details
    const generalRisks = ['age over 60', 'pregnant', 'immunocompromised', 'cancer', 'heart disease', 'diabetes', 'hypertension']
    for (const risk of generalRisks) {
      if (details.includes(risk)) {
        factors.push(risk)
      }
    }
  }

  return { hasRiskFactors: factors.length > 0, factors }
}

/**
 * Get triage level from Strapi data
 */
function getStrapiTriageLevel(symptom: SymptomData): TriageLevel {
  if (symptom.triageLevel) {
    const level = symptom.triageLevel.toLowerCase()
    if (level.includes('emergency')) return 'emergency'
    if (level.includes('urgent')) return 'urgent'
  }
  if (symptom.triageCriteria && symptom.triageCriteria.length > 0) {
    const levels = symptom.triageCriteria.map(c => c.Triage_Level?.toLowerCase() || '')
    if (levels.includes('emergency')) return 'emergency'
    if (levels.includes('urgent')) return 'urgent'
  }
  return 'routine'
}

/**
 * Main triage evaluation function
 */
export function evaluateTriage(symptom: SymptomData, answers: FollowUpAnswers): TriageResult {
  const symptomName = symptom.name || ''
  const emergencySigns = checkEmergencyWarningSigns(symptomName, answers)
  const urgentSigns = checkUrgentWarningSigns(symptomName, answers)
  const { isEmergency: durationEmergency, isUrgent: durationUrgent, reason: durationReason } = evaluateDuration(symptomName, answers.duration)
  const { hasRiskFactors, factors: riskFactors } = evaluateRiskFactors(symptomName, answers)
  const strapiLevel = getStrapiTriageLevel(symptom)

  // User-selected severity
  const userSeverity = answers.severity || 'mild'

  // Determine final triage level
  let level: TriageLevel = 'routine'
  const reasons: string[] = []
  const allWarningSigns: string[] = []

  // 1. Emergency takes absolute priority
  if (emergencySigns.length > 0 || durationEmergency) {
    level = 'emergency'
    if (emergencySigns.length > 0) {
      reasons.push(`Emergency warning signs reported: ${emergencySigns.slice(0, 3).join(', ')}`)
      allWarningSigns.push(...emergencySigns)
    }
    if (durationEmergency) {
      reasons.push(durationReason)
    }
  }
  // 2. Strapi emergency level
  else if (strapiLevel === 'emergency') {
    level = 'emergency'
    reasons.push('Condition classified as emergency based on clinical criteria')
  }
  // 3. Urgent conditions
  else if (urgentSigns.length > 0 || durationUrgent || strapiLevel === 'urgent' || (userSeverity === 'severe' && (answers.warningSigns === true || hasRiskFactors))) {
    level = 'urgent'
    if (urgentSigns.length > 0) {
      reasons.push(`Urgent warning signs: ${urgentSigns.slice(0, 3).join(', ')}`)
      allWarningSigns.push(...urgentSigns)
    }
    if (durationUrgent) {
      reasons.push(durationReason)
    }
    if (strapiLevel === 'urgent') {
      reasons.push('Condition classified as urgent based on clinical criteria')
    }
    if (userSeverity === 'severe' && (answers.warningSigns === true || hasRiskFactors)) {
      reasons.push('Severe self-reported severity with warning signs or risk factors')
    }
  }
  // 4. Moderate severity with warning signs or risk factors -> urgent
  else if (userSeverity === 'moderate' && (answers.warningSigns === true || hasRiskFactors)) {
    level = 'urgent'
    reasons.push('Moderate severity with warning signs or risk factors')
    if (urgentSigns.length > 0) allWarningSigns.push(...urgentSigns)
  }
  // 5. Mild severity but warning signs present -> urgent (escalation)
  else if (userSeverity === 'mild' && answers.warningSigns === true) {
    level = 'urgent'
    reasons.push('Warning signs reported despite mild self-rated severity')
    if (urgentSigns.length > 0) allWarningSigns.push(...urgentSigns)
  }
  // 6. Severe self-reported severity -> urgent
  else if (userSeverity === 'severe') {
    level = 'urgent'
    reasons.push('Self-reported severe symptoms warrant prompt evaluation')
  }
  // 7. Moderate severity alone -> urgent
  else if (userSeverity === 'moderate') {
    level = 'urgent'
    reasons.push('Self-reported moderate symptoms warrant prompt evaluation')
  }
  // 8. Routine
  else {
    level = 'routine'
    reasons.push('No emergency or urgent warning signs identified based on reported symptoms')
  }

  // Add risk factors to reasons if present
  if (riskFactors.length > 0) {
    reasons.push(`Risk factors: ${riskFactors.slice(0, 3).join(', ')}`)
  }

  // Build next step guidance
  let nextStep = ''
  if (level === 'emergency') {
    nextStep = 'Seek emergency medical care immediately. Call emergency services (119 in Korea) or go to the nearest emergency department. Do not drive yourself.'
  } else if (level === 'urgent') {
    nextStep = 'Contact a healthcare provider today or visit an urgent care clinic. If symptoms worsen, seek emergency care.'
  } else {
    nextStep = 'Monitor symptoms and follow home care guidance. Seek medical care if symptoms worsen or new warning signs appear.'
  }

  // Compile all warning signs from symptom data too
  const symptomWarningSigns = (symptom.redFlags || symptom.warningSigns || '').split(/[,\n;]/).map(s => s.trim()).filter(Boolean)
  allWarningSigns.push(...symptomWarningSigns)

  return {
    level,
    levelLabel: level === 'emergency' ? 'Severe — Emergency' : level === 'urgent' ? 'Moderate — Urgent Assessment' : 'Mild — Routine Assessment',
    reason: reasons.join('; '),
    nextStep,
    warningSigns: [...new Set(allWarningSigns)],
    shouldShowEmergencyGuidance: level === 'emergency'
  }
}

/**
 * Get triage level color for UI
 */
export function getTriageColor(level: TriageLevel): string {
  switch (level) {
    case 'emergency': return '#DC2626'
    case 'urgent': return '#D97706'
    case 'routine': return '#16A34A'
    default: return '#64748B'
  }
}

/**
 * Get triage level icon for UI
 */
export function getTriageIcon(level: TriageLevel): string {
  switch (level) {
    case 'emergency': return 'mdi-alert-circle-outline'
    case 'urgent': return 'mdi-clock-alert-outline'
    case 'routine': return 'mdi-check-circle-outline'
    default: return 'mdi-help-circle-outline'
  }
}

export function useTriage() {
  return {
    evaluateTriage,
    getTriageColor,
    getTriageIcon
  }
}