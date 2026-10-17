/**
 * useFollowUpQuestions composable for Symply
 * Manages symptom-specific follow-up question flows
 */

export interface FollowUpAnswer {
  duration?: string
  severity?: 'mild' | 'moderate' | 'severe'
  warningSigns?: boolean
  warningSignDetails?: string
  riskFactors?: boolean
  riskFactorDetails?: string
}

export interface FollowUpStep {
  id: string
  label: string
  type: 'duration' | 'severity' | 'warning-signs' | 'risk-factors' | 'text'
  question: string
  options?: string[]
  showIf?: (answers: FollowUpAnswer, symptom: any) => boolean
}

export interface SymptomQuestions {
  symptomNamePattern: string | string[]
  steps: FollowUpStep[]
}

// Symptom-specific follow-up question flows
export const followUpQuestions: SymptomQuestions[] = [
  {
    symptomNamePattern: ['stuffy nose', 'nasal congestion', 'blocked nose'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this symptom?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your nasal congestion?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like fever, facial pain, or green/yellow discharge?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['headache', 'migraine', 'pain in head'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this headache?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your headache?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like weakness, numbness, confusion, or vision changes?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['abdominal pain', 'stomach pain', 'belly pain', 'abdomen'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this abdominal pain?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your abdominal pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like vomiting, bleeding, or fever?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['itchy skin', 'skin rash', 'rash', 'hives'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this itchy skin/rash?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is the itching/rash?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like fever, swelling, or difficulty breathing?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['acne', 'pimples', 'zits'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this acne?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your acne?',
      },
      {
        id: 'riskFactors',
        label: 'Risk Factors',
        type: 'risk-factors',
        question: 'Have you noticed any triggers like stress, diet changes, or new skincare products?',
        showIf: (answers, symptom) => {
          const name = symptom?.name?.toLowerCase() || ''
          return name.includes('acne') || name.includes('pimple') || name.includes('zit')
        },
      },
    ],
  },
  {
    symptomNamePattern: ['sore throat', 'throat pain', 'throat sore'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this sore throat?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your throat pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like fever, difficulty swallowing, or swollen glands?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['cough', 'dry cough', 'wet cough', 'persistent cough'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this cough?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your cough?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like difficulty breathing, chest pain, or coughing up blood?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['fever', 'high temperature', 'elevated temperature'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this fever?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How high is your fever?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like confusion, stiff neck, or difficulty breathing?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['back pain', 'lower back pain', 'upper back pain'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this back pain?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your back pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like numbness, tingling, or loss of bladder control?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['arm pain', 'shoulder pain', 'elbow pain', 'wrist pain', 'hand pain'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this arm pain?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your arm pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like swelling, numbness, or inability to move the arm?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['leg pain', 'knee pain', 'ankle pain', 'foot pain', 'thigh pain'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this leg pain?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your leg pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like swelling, numbness, or inability to walk?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['chest pain', 'heart pain', 'chest discomfort'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this chest pain?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is your chest pain?',
      },
      {
        id: 'warningSigns',
        label: 'Warning Signs',
        type: 'warning-signs',
        question: 'Do you have any warning signs like shortness of breath, dizziness, or pain radiating to arm/jaw?',
      },
      {
        id: 'warningDetails',
        label: 'Warning Details',
        type: 'text',
        question: 'Can you describe these warning signs?',
        showIf: (answers) => answers.warningSigns === true,
      },
    ],
  },
  {
    symptomNamePattern: ['head', 'neck', 'face'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this symptom?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is it?',
      },
    ],
  },
  {
    symptomNamePattern: ['abdomen', 'pelvis', 'stomach'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this symptom?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is it?',
      },
    ],
  },
  {
    symptomNamePattern: ['skin', 'rash', 'itch', 'hives'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this symptom?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is it?',
      },
    ],
  },
  {
    symptomNamePattern: ['all'],
    steps: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'duration',
        question: 'How long have you had this symptom?',
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'severity',
        question: 'How severe is it?',
      },
    ],
  },
]

export function useFollowUpQuestions() {
  const currentStepIndex = ref(0)
  const answers = ref<FollowUpAnswer>({})

  function getQuestionsForSymptom(symptom: any): FollowUpStep[] {
    if (!symptom?.name) return followUpQuestions.find(q => q.symptomNamePattern[0] === 'all')?.steps || []

    const symptomName = symptom.name.toLowerCase()
    const match = followUpQuestions.find(q =>
      Array.isArray(q.symptomNamePattern)
        ? q.symptomNamePattern.some(pattern => symptomName.includes(pattern))
        : symptomName.includes(q.symptomNamePattern)
    )
    return match?.steps || followUpQuestions.find(q => q.symptomNamePattern[0] === 'all')?.steps || []
  }

  function getNextStep(currentStepIndex: number, steps: FollowUpStep[], currentAnswers: FollowUpAnswer, symptom: any): FollowUpStep | null {
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      const step = steps[i]
      if (!step.showIf || step.showIf(currentAnswers, symptom)) {
        return step
      }
    }
    return null
  }

  function isComplete(steps: FollowUpStep[], currentAnswers: FollowUpAnswer, symptom: any): boolean {
    if (steps.length === 0) return true
    const lastStep = steps[steps.length - 1]
    if (!lastStep.showIf || lastStep.showIf(currentAnswers, symptom)) {
      return currentAnswers[lastStep.id as keyof FollowUpAnswer] !== undefined
    }
    return true
  }

  function reset() {
    currentStepIndex.value = 0
    answers.value = {}
  }

  return {
    currentStepIndex,
    answers,
    getQuestionsForSymptom,
    getNextStep,
    isComplete,
    reset,
  }
}
