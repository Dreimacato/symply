<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="px-0 py-2">
      <template #prepend>
        <v-icon icon="mdi-home" size="small" class="me-1" />
      </template>
    </v-breadcrumbs>

    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center my-4 gap-3">
      <div>
        <h1 class="text-h4 font-weight-bold text-capitalize text-primary">
          {{ areaTitle }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Possible symptoms and health concerns in {{ regionTitle }} &gt; {{ areaTitle }}
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        :to="`/check/${region}`"
      >
        Change Area
      </v-btn>
    </div>

    <!-- Filter Bar -->
    <v-card class="pa-4 mb-6" rounded="lg" elevation="1">
      <v-row align="center">
        <v-col cols="12" sm="7" md="8">
          <v-text-field
            v-model="filterText"
            placeholder="Filter symptoms or conditions..."
            prepend-inner-icon="mdi-filter-variant"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="5" md="4">
          <v-select
            v-model="selectedTriage"
            :items="triageOptions"
            label="Triage Severity"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading State -->
    <div v-if="pending" class="my-6">
      <v-skeleton-loader type="card, card, card" class="mb-4" />
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="my-6"
      title="Unable to load health concerns"
      icon="mdi-alert-circle"
    >
      <div>Could not connect to Strapi at {{ strapiBase }}. Make sure your Strapi server is running.</div>
      <v-btn color="error" variant="flat" size="small" class="mt-3" prepend-icon="mdi-refresh" @click="refresh">
        Retry
      </v-btn>
    </v-alert>

    <!-- Concerns List -->
    <div v-else-if="filteredConcerns.length">
      <v-row>
        <v-col
          v-for="item in filteredConcerns"
          :key="item.id"
          cols="12"
          md="6"
        >
          <v-card
            class="pa-5 h-100 cursor-pointer d-flex flex-column justify-space-between"
            hover
            rounded="lg"
            elevation="2"
            :to="`/concern/${item.id}`"
          >
            <div>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-h6 font-weight-bold text-primary">
                  {{ item.symptom }}
                </div>
                <v-chip
                  :color="getTriageColor(item.triage_level)"
                  size="small"
                  class="font-weight-medium"
                >
                  {{ item.triage_level || 'Routine' }}
                </v-chip>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-3 text-truncate-2">
                {{ item.description || 'No description provided.' }}
              </p>

              <!-- Warning Signs Snippet -->
              <v-alert
                v-if="item.warning_signs"
                density="compact"
                variant="tonal"
                color="error"
                class="py-1 px-2 my-2 text-caption"
                icon="mdi-alert-octagon-outline"
              >
                <span class="font-weight-bold">Red Signal:</span> {{ item.warning_signs }}
              </v-alert>
            </div>

            <div class="d-flex justify-space-between align-center pt-3 border-t">
              <span class="text-caption text-medium-emphasis">
                <v-icon icon="mdi-hospital-marker" size="x-small" class="me-1" />
                {{ item.hospital_recommendation ? 'Facility guidance available' : 'General care' }}
              </span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
              >
                View Guidance
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Empty State -->
    <v-card v-else class="pa-10 text-center my-6" rounded="lg" variant="tonal">
      <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
        <v-icon icon="mdi-clipboard-text-search-outline" size="36" />
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-2">No health concerns found</div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ filterText || selectedTriage ? 'Try clearing your search filters or check back once Strapi has more entries.' : 'No entries found for this specific anatomical area yet.' }}
      </p>
      <v-btn
        v-if="filterText || selectedTriage"
        variant="tonal"
        color="primary"
        @click="clearFilters"
      >
        Clear Filters
      </v-btn>
      <v-btn
        v-else
        variant="flat"
        color="primary"
        :to="`/check/${region}`"
      >
        Choose Another Area
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const config = useRuntimeConfig()
const strapiBase = config.public.strapiBase

const region = computed(() => (route.params.region || '').toString())
const area = computed(() => (route.params.area || '').toString())

const regionTitle = computed(() => region.value.replace(/-/g, ' '))
const areaTitle = computed(() => area.value.replace(/-/g, ' '))

const filterText = ref('')
const selectedTriage = ref(null)
const triageOptions = ['Emergency', 'Urgent', 'Routine']

const breadcrumbItems = computed(() => [
  { title: 'Home', disabled: false, href: '/' },
  { title: regionTitle.value, disabled: false, href: `/check/${region.value}` },
  { title: areaTitle.value, disabled: true },
])

const { getHealthConcerns, normalizeConcern } = useStrapi()

const isAll = computed(() => area.value === 'all')
const queryFilters = computed(() => {
  if (isAll.value) {
    return { bodyPart: regionTitle.value }
  }
  return {
    bodyPart: regionTitle.value,
    anatomicalArea: areaTitle.value,
  }
})

const { data, error, pending, refresh } = await getHealthConcerns(queryFilters.value)

const normalizedConcerns = computed(() => {
  const rawList = data.value?.data || []
  return rawList.map((item) => normalizeConcern(item))
})

const filteredConcerns = computed(() => {
  return normalizedConcerns.value.filter((item) => {
    const matchesText =
      !filterText.value ||
      item.symptom.toLowerCase().includes(filterText.value.toLowerCase()) ||
      item.description.toLowerCase().includes(filterText.value.toLowerCase())

    const matchesTriage =
      !selectedTriage.value ||
      item.triage_level?.toLowerCase() === selectedTriage.value.toLowerCase()

    return matchesText && matchesTriage
  })
})

function getTriageColor(level) {
  const lvl = (level || '').toLowerCase()
  if (lvl === 'emergency') return 'error'
  if (lvl === 'urgent') return 'warning'
  return 'success'
}

function clearFilters() {
  filterText.value = ''
  selectedTriage.value = null
}

useHead({
  title: computed(() => `Symply — ${areaTitle.value} Symptoms`),
})
</script>

<style scoped>
/* ─── Modern Card Styles ────────────────────────────────────────────────────── */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Vuetify Overrides ─────────────────────────────────────────────────────── */
.v-card {
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-lg);
  transition: box-shadow 0.2s ease;
}

.v-card:hover {
  box-shadow: var(--symply-shadow-md);
}

.v-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: var(--symply-radius-md);
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--symply-shadow-sm);
}

.v-chip {
  font-weight: 500;
  border-radius: var(--symply-radius-sm);
}

.v-select .v-select__selection {
  font-weight: 500;
}

.v-text-field .v-field {
  border-radius: var(--symply-radius-md);
  transition: border-color 0.2s ease;
}

.v-text-field .v-field:hover {
  border-color: var(--symply-primary);
}

.v-text-field .v-field--variant-outlined:not(.v-field--error) .v-field__outline {
  border-color: var(--symply-border);
}

.v-text-field .v-field--focused .v-field__outline {
  border-color: var(--symply-primary);
}

.v-alert {
  border-radius: var(--symply-radius-lg);
}

.v-alert.v-alert-type-error {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.v-alert.v-alert-type-warning {
  background-color: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
}

.v-alert.v-alert-type-success {
  background-color: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
}

/* ─── Progress Tracker in layout ────────────────────────────────────────────── */
.progress-tracker {
  box-shadow: var(--symply-shadow-sm);
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
.v-footer {
  border-top: 1px solid var(--symply-border);
  background: var(--symply-card-bg);
}
</style>
