<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="px-0 py-2">
      <template #prepend>
        <v-icon icon="mdi-home" size="small" class="me-1" />
      </template>
    </v-breadcrumbs>

    <!-- Loading State -->
    <div v-if="pending" class="my-6">
      <v-skeleton-loader type="article, actions" class="mb-4" />
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error || !concern"
      type="error"
      variant="tonal"
      class="my-6"
      title="Health Concern Not Found"
      icon="mdi-alert-circle"
    >
      <div>We could not locate this health concern. It may have been removed or Strapi is not reachable.</div>
      <v-btn color="primary" class="mt-3" to="/">Return to Body Map</v-btn>
    </v-alert>

    <!-- Health Concern Detail -->
    <div v-else class="max-w-900 mx-auto">
      <!-- Header Banner Card -->
      <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
        <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
          <div class="d-flex align-center flex-wrap gap-2">
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-human">
              {{ concern.body_part || 'General' }}
            </v-chip>
            <v-chip v-if="concern.anatomical_area" color="secondary" variant="tonal" prepend-icon="mdi-crosshairs-gps">
              {{ concern.anatomical_area }}
            </v-chip>
          </div>

          <v-chip
            :color="getTriageColor(concern.triage_level)"
            size="large"
            class="font-weight-bold"
            :prepend-icon="getTriageIcon(concern.triage_level)"
          >
            Triage: {{ concern.triage_level || 'Routine' }}
          </v-chip>
        </div>

        <h1 class="text-h3 font-weight-bold text-primary mb-2">
          {{ concern.symptom }}
        </h1>
        <div class="text-subtitle-1 text-medium-emphasis">
          Symptom details, red flag warning signs, triage criteria, and care recommendations.
        </div>
      </v-card>

      <!-- Red Signal / Warning Signs Alert -->
      <v-alert
        v-if="concern.warning_signs"
        type="error"
        variant="elevated"
        rounded="lg"
        class="mb-6 pa-5"
        icon="mdi-alert-octagon"
        elevation="3"
      >
        <div class="text-h6 font-weight-bold mb-1">
          Red Flags & Warning Signs
        </div>
        <div class="text-body-1 font-weight-medium white-space-pre-line">
          {{ concern.warning_signs }}
        </div>
        <div class="text-caption mt-2 text-white">
          If you experience any of the warning signs above, seek immediate emergency medical care.
        </div>
      </v-alert>

      <!-- Overview / Description -->
      <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
        <div class="d-flex align-center mb-3">
          <v-avatar color="primary" variant="tonal" size="36" class="me-3">
            <v-icon icon="mdi-text-box-outline" />
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">Description & Overview</h2>
        </div>
        <v-divider class="mb-4" />
        <p class="text-body-1 text-high-emphasis line-height-relaxed white-space-pre-line">
          {{ concern.description || 'No detailed overview provided for this entry.' }}
        </p>
      </v-card>

      <!-- Associated Symptoms -->
      <v-card v-if="concern.associated_symptoms" class="pa-6 mb-6" rounded="lg" elevation="2">
        <div class="d-flex align-center mb-3">
          <v-avatar color="secondary" variant="tonal" size="36" class="me-3">
            <v-icon icon="mdi-format-list-checks" />
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">Associated Symptoms</h2>
        </div>
        <v-divider class="mb-4" />
        <p class="text-body-1 text-high-emphasis line-height-relaxed white-space-pre-line">
          {{ concern.associated_symptoms }}
        </p>
      </v-card>

      <!-- Triage Criteria breakdown (if present) -->
      <v-card v-if="concern.triage_criteria && concern.triage_criteria.length" class="pa-6 mb-6" rounded="lg" elevation="2">
        <div class="d-flex align-center mb-3">
          <v-avatar color="warning" variant="tonal" size="36" class="me-3">
            <v-icon icon="mdi-scale-balance" />
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">Triage Criteria</h2>
        </div>
        <v-divider class="mb-4" />
        <v-table density="comfortable">
          <thead>
            <tr>
              <th class="text-left font-weight-bold">Condition / Scenario</th>
              <th class="text-left font-weight-bold" style="width: 140px;">Severity Level</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(crit, idx) in concern.triage_criteria" :key="idx">
              <td>{{ crit.Condition }}</td>
              <td>
                <v-chip :color="getTriageColor(crit.Triage_Level)" size="small" class="font-weight-medium">
                  {{ crit.Triage_Level }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Initial Management -->
      <v-card v-if="concern.initial_management" class="pa-6 mb-6" rounded="lg" elevation="2">
        <div class="d-flex align-center mb-3">
          <v-avatar color="info" variant="tonal" size="36" class="me-3">
            <v-icon icon="mdi-medication-outline" />
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">Initial Management & Home Care</h2>
        </div>
        <v-divider class="mb-4" />
        <p class="text-body-1 text-high-emphasis line-height-relaxed white-space-pre-line">
          {{ concern.initial_management }}
        </p>
      </v-card>

      <!-- When to Seek Care / Facility Recommendation -->
      <v-card v-if="concern.when_to_seek_care" class="pa-6 mb-8" rounded="lg" elevation="2">
        <div class="d-flex align-center mb-3">
          <v-avatar color="success" variant="tonal" size="36" class="me-3">
            <v-icon icon="mdi-hospital-building" />
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">When to Seek Care & Recommended Facilities</h2>
        </div>
        <v-divider class="mb-4" />
        <p class="text-body-1 text-high-emphasis line-height-relaxed white-space-pre-line">
          {{ concern.when_to_seek_care }}
        </p>
      </v-card>

      <!-- Bottom Navigation -->
      <div class="d-flex flex-wrap justify-space-between align-center my-6 gap-3">
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          to="/"
        >
          Check Another Area
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-printer"
          @click="printPage"
        >
          Print Summary
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const concernId = computed(() => (route.params.id || '').toString())

const { getHealthConcern, normalizeConcern } = useStrapi()
const { data, error, pending } = await getHealthConcern(concernId.value)

const concern = computed(() => {
  if (!data.value?.data) return null
  return normalizeConcern(data.value.data)
})

const breadcrumbItems = computed(() => [
  { title: 'Home', disabled: false, href: '/' },
  { title: 'Symptoms', disabled: false, href: '/' },
  { title: concern.value?.symptom || 'Concern Detail', disabled: true },
])

function getTriageColor(level) {
  const lvl = (level || '').toLowerCase()
  if (lvl === 'emergency') return 'error'
  if (lvl === 'urgent') return 'warning'
  return 'success'
}

function getTriageIcon(level) {
  const lvl = (level || '').toLowerCase()
  if (lvl === 'emergency') return 'mdi-alert-octagon'
  if (lvl === 'urgent') return 'mdi-alert'
  return 'mdi-check-circle'
}

function printPage() {
  if (process.client) {
    window.print()
  }
}

useHead({
  title: computed(() => concern.value ? `Symply — ${concern.value.symptom}` : 'Symply'),
})
</script>

<style scoped>
/* ─── Card Styles ───────────────────────────────────────────────────────────── */
.max-w-900 {
  max-width: 900px;
}
.line-height-relaxed {
  line-height: 1.75;
}
.white-space-pre-line {
  white-space: pre-line;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

/* ─── Vuetify Overrides ─────────────────────────────────────────────────────── */
.v-card {
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-lg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--symply-shadow-md);
}

.v-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: var(--symply-radius-md);
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--symply-shadow-sm);
}

.v-chip {
  font-weight: 600;
  border-radius: var(--symply-radius-sm);
  padding: 4px 12px;
}

.v-avatar {
  border-radius: var(--symply-radius-md);
}

.v-divider {
  border-color: var(--symply-border);
}

.v-table {
  border-radius: var(--symply-radius-md);
  overflow: hidden;
}

.v-table th {
  background: #F8FAFC;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--symply-text-muted);
}

.v-table td {
  border-bottom: 1px solid var(--symply-border);
}

.v-table tbody tr:hover {
  background: #F8FAFC;
}

/* ─── Alert Styles ──────────────────────────────────────────────────────────── */
.v-alert {
  border-radius: var(--symply-radius-lg);
  border: none;
}

.v-alert.v-alert-type-error {
  background-color: #FEF2F2;
  color: #991B1B;
}

.v-alert.v-alert-type-warning {
  background-color: #FFFBEB;
  color: #92400E;
}

.v-alert.v-alert-type-success {
  background-color: #F0FDF4;
  color: #166534;
}

.v-alert .v-alert__text {
  line-height: 1.6;
}

/* ─── Breadcrumbs ───────────────────────────────────────────────────────────── */
.v-breadcrumbs {
  --v-breadcrumbs-divider-color: var(--symply-text-muted);
}

.v-breadcrumbs-item {
  font-weight: 500;
  font-size: 0.875rem;
}

.v-breadcrumbs-item--disabled {
  color: var(--symply-text-muted);
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
.v-footer {
  border-top: 1px solid var(--symply-border);
  background: var(--symply-card-bg);
}

/* ─── Layout Containers ─────────────────────────────────────────────────────── */
.v-container {
  padding-left: clamp(1rem, 5vw, 2rem);
  padding-right: clamp(1rem, 5vw, 2rem);
}
</style>
