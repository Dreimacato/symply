<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="px-0 py-2">
      <template #prepend>
        <v-icon icon="mdi-home" size="small" class="me-1" />
      </template>
    </v-breadcrumbs>

    <div class="my-4">
      <h1 class="text-h4 font-weight-bold text-primary">
        Search Results for "{{ searchQuery }}"
      </h1>
      <p class="text-body-1 text-medium-emphasis mt-1">
        Matching health concerns and symptoms across all anatomical areas.
      </p>
    </div>

    <!-- Search input -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchInput"
          placeholder="Search symptoms or conditions..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          clearable
          @keyup.enter="updateSearch"
        >
          <template #append-inner>
            <v-btn color="primary" size="small" variant="flat" @click="updateSearch">
              Search
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="pending" class="my-6">
      <v-skeleton-loader type="card, card" class="mb-4" />
    </div>

    <!-- Error -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="my-6"
      title="Search Failed"
      text="Could not retrieve results from Strapi backend. Please verify the server is running."
    />

    <!-- Results list -->
    <div v-else-if="results.length">
      <v-row>
        <v-col
          v-for="item in results"
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
                <v-chip :color="getTriageColor(item.triage_level)" size="small">
                  {{ item.triage_level || 'Routine' }}
                </v-chip>
              </div>

              <div class="d-flex gap-2 mb-3">
                <v-chip size="x-small" variant="tonal" color="primary">
                  {{ item.body_part || 'General' }}
                </v-chip>
                <v-chip v-if="item.anatomical_area" size="x-small" variant="tonal" color="secondary">
                  {{ item.anatomical_area }}
                </v-chip>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-3 text-truncate-2">
                {{ item.description || 'No description provided.' }}
              </p>
            </div>

            <div class="d-flex justify-end pt-3 border-t">
              <v-btn variant="text" color="primary" size="small" append-icon="mdi-arrow-right">
                View Guidance
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- No results -->
    <v-card v-else class="pa-10 text-center my-6" rounded="lg" variant="tonal">
      <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
        <v-icon icon="mdi-magnify-remove-outline" size="36" />
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-2">No symptoms found for "{{ searchQuery }}"</div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Try searching for alternative medical keywords, or use the interactive body map to browse by area.
      </p>
      <v-btn color="primary" variant="flat" to="/">
        Go to Body Map
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const searchQuery = computed(() => (route.query.q || '').toString())
const searchInput = ref(searchQuery.value)

watch(searchQuery, (newVal) => {
  searchInput.value = newVal
})

const breadcrumbItems = computed(() => [
  { title: 'Home', disabled: false, href: '/' },
  { title: 'Search', disabled: true },
])

const { getHealthConcerns, normalizeConcern } = useStrapi()
const { data, error, pending, refresh } = await getHealthConcerns({ search: searchQuery.value })

const results = computed(() => {
  const rawList = data.value?.data || []
  return rawList.map((item) => normalizeConcern(item))
})

function updateSearch() {
  if (!searchInput.value?.trim()) return
  router.push({ path: '/check/search', query: { q: searchInput.value.trim() } })
}

function getTriageColor(level) {
  const lvl = (level || '').toLowerCase()
  if (lvl === 'emergency') return 'error'
  if (lvl === 'urgent') return 'warning'
  return 'success'
}

useHead({
  title: computed(() => `Symply — Search: ${searchQuery.value}`),
})
</script>

<style scoped>
/* ─── Modern Search Page Styles ─────────────────────────────────────────────── */
.gap-2 {
  gap: 8px;
}
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

.v-text-field .v-field {
  border-radius: var(--symply-radius-md);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.v-text-field .v-field:hover {
  border-color: var(--symply-primary);
}

.v-text-field .v-field--variant-outlined:not(.v-field--error) .v-field__outline {
  border-color: var(--symply-border);
}

.v-text-field .v-field--focused .v-field__outline {
  border-color: var(--symply-primary);
  box-shadow: 0 0 0 3px var(--symply-primary-light);
}

.v-alert {
  border-radius: var(--symply-radius-lg);
}

.v-alert.v-alert-type-error {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

/* ─── Card Hover Effects ────────────────────────────────────────────────────── */
.v-card.cursor-pointer:hover {
  border-color: var(--symply-primary);
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
.v-footer {
  border-top: 1px solid var(--symply-border);
  background: var(--symply-card-bg);
}

/* ─── Container ─────────────────────────────────────────────────────────────── */
.v-container {
  padding-left: clamp(1rem, 5vw, 2rem);
  padding-right: clamp(1rem, 5vw, 2rem);
}
</style>
