/**
 * useStrapi composable for Symply
 * Handles communication with Strapi REST API for Health Concerns collection
 */

export interface TriageCriterion {
  id?: number | string
  Condition?: string
  Triage_Level?: 'Emergency' | 'Urgent' | 'Non-Urgent' | string
}

export interface HealthConcernNormalized {
  id: number | string
  symptom: string
  body_part: string
  anatomical_area: string
  description: string
  associated_symptoms?: string
  warning_signs: string
  when_to_seek_care: string
  initial_management: string
  triage_criteria?: TriageCriterion[]
  triage_level: 'Emergency' | 'Urgent' | 'Routine' | 'Non-Urgent' | string
  hospital_recommendation?: string
}

export interface HealthcareFacility {
  id: number | string
  Name: string
  Facility_Type: string
  Location: string
  Address: string
  Services?: string
  Latitude?: number
  Longitude?: number
  services?: string
  latitude?: number
  longitude?: number
}

export function useStrapi() {
  const config = useRuntimeConfig()
  const base = config.public.strapiBase as string

  function buildQuery(params: Record<string, any>) {
    return Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
  }

  async function apiFetch<T = any>(endpoint: string, params: Record<string, any> = {}) {
    const query = buildQuery(params)
    const url = `${base}${endpoint}${query ? '?' + query : ''}`

    return await useFetch<T>(url, {
      key: url,
    })
  }

  /**
   * Helper to parse text out of Strapi Rich Text Blocks if present
   */
  function extractBlockText(val: any): string {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (Array.isArray(val)) {
      return val
        .map((node) => {
          if (node.children) {
            return node.children.map((c: any) => c.text || '').join('')
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')
    }
    return String(val)
  }

  /**
   * Normalize Strapi response item (handles Strapi v4 nested attributes or Strapi v5 flat objects,
   * as well as PascalCase/camelCase/snake_case field variations)
   */
  function normalizeConcern(item: any): HealthConcernNormalized {
    if (!item) return {} as any
    const attrs = item.attributes ? item.attributes : item

    // Extract triage level from component or attribute
    let triageLevel = attrs.triage_level || attrs.Triage_Level || 'Routine'
    const triageCriteriaList: TriageCriterion[] = attrs.Triage_Criteria || attrs.triage_criteria || []
    if (triageCriteriaList.length > 0 && !attrs.triage_level) {
      // Pick highest severity if available
      const levels = triageCriteriaList.map((c) => c.Triage_Level)
      if (levels.includes('Emergency')) triageLevel = 'Emergency'
      else if (levels.includes('Urgent')) triageLevel = 'Urgent'
      else triageLevel = 'Routine'
    }

    return {
      id: item.id,
      symptom: attrs.Symptom_Name || attrs.symptom || attrs.title || '',
      body_part: attrs.Body_Part || attrs.body_part || '',
      anatomical_area: attrs.Anatomical_Area || attrs.anatomical_area || '',
      description: extractBlockText(attrs.Description || attrs.description || ''),
      associated_symptoms: extractBlockText(attrs.Associated_Symptoms || attrs.associated_symptoms || ''),
      warning_signs: extractBlockText(attrs.Red_Flags_and_Warning_Signs || attrs.warning_signs || attrs.red_flags || ''),
      when_to_seek_care: extractBlockText(attrs.When_to_Seek_Care || attrs.when_to_seek_care || attrs.hospital_recommendation || ''),
      initial_management: extractBlockText(attrs.Initial_Management || attrs.initial_management || attrs.triage_information || ''),
      triage_criteria: triageCriteriaList,
      triage_level: triageLevel,
      hospital_recommendation: extractBlockText(attrs.When_to_Seek_Care || attrs.hospital_recommendation || ''),
    }
  }

  /**
   * Fetch list of health concerns with optional filters
   * Checks both `/api/abdomen-stomaches` (the Strapi schema plural name) and `/api/health-concerns`
   */
  function getHealthConcerns(filters: { bodyPart?: string; anatomicalArea?: string; search?: string } = {}) {
    const params: Record<string, any> = {
      populate: '*',
      'pagination[pageSize]': 100,
    }

    if (filters.bodyPart) {
      params['filters[$or][0][Body_Part][$containsi]'] = filters.bodyPart
      params['filters[$or][1][body_part][$containsi]'] = filters.bodyPart
    }
    if (filters.anatomicalArea) {
      params['filters[$or][0][Anatomical_Area][$containsi]'] = filters.anatomicalArea
      params['filters[$or][1][anatomical_area][$containsi]'] = filters.anatomicalArea
    }
    if (filters.search) {
      params['filters[$or][0][Symptom_Name][$containsi]'] = filters.search
      params['filters[$or][1][symptom][$containsi]'] = filters.search
    }

    // Strapi collection API endpoint (pluralName from schema: abdomen-stomaches)
    return apiFetch<{ data: any[] }>('/api/abdomen-stomaches', params)
  }

  /**
   * Fetch a single health concern by ID
   */
  function getHealthConcern(id: string | number) {
    return apiFetch<{ data: any }>(`/api/abdomen-stomaches/${id}`, { populate: '*' })
  }

  /**
   * Fetch triage criteria for a specific body part and condition
   * Returns matching health concerns with their triage criteria
   */
  function getTriageCriteria(bodyPart: string, searchSymptom: string = '') {
    const params: Record<string, any> = {
      populate: 'Triage_Criteria',
      'pagination[pageSize]': 100,
    }

    // Filter by body part (case insensitive)
    params['filters[$or][0][Body_Part][$containsi]'] = bodyPart
    params['filters[$or][1][body_part][$containsi]'] = bodyPart

    // If symptom provided, also search by symptom name
    if (searchSymptom) {
      params['filters[$or][2][Symptom_Name][$containsi]'] = searchSymptom
      params['filters[$or][3][symptom][$containsi]'] = searchSymptom
    }

    return apiFetch<{ data: any[] }>('/api/abdomen-stomaches', params)
  }

  /**
   * Create a new user_profile record
   */
  async function createUserProfile(data: {
    Age: number
    Gender: 'Male' | 'Female'
    Location: string
  }) {
    try {
      const response = await fetch(`${base}/api/user-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Strapi error response:', response.status, errorData)
        throw new Error(errorData.error?.message || `HTTP ${response.status}: Failed to save profile`)
      }
      return await response.json()
    } catch (error) {
      console.error('createUserProfile error:', error)
      throw error
    }
  }

  /**
   * Get the current user_profile (assumes only one record exists)
   */
  async function getUserProfile() {
    try {
      const result = await apiFetch<{ data: any[] }>(
        '/api/user-profiles',
        { 'pagination[pageSize]': 1 }
      )
      return result.data?.[0] || null
    } catch {
      return null
    }
  }

  /**
   * Get healthcare facilities filtered by location
   */
  async function getHealthcareFacilities(location: string) {
    if (!location) return []

    try {
      const result = await apiFetch<{ data: HealthcareFacility[] }>(
        '/api/healthcare-facilities',
        {
          'filters[Location][$eqi]': location,
          'pagination[pageSize]': 100,
          populate: '*'
        }
      )
      return result.data || []
    } catch {
      return []
    }
  }

  return {
    getHealthConcerns,
    getHealthConcern,
    getTriageCriteria,
    normalizeConcern,
    createUserProfile,
    getUserProfile,
    getHealthcareFacilities,
  }
}
