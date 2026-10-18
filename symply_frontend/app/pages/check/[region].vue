<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="px-0 py-2">
      <template #prepend>
        <v-icon icon="mdi-home" size="small" class="me-1" />
      </template>
    </v-breadcrumbs>

    <div class="d-flex align-center justify-space-between my-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-capitalize text-primary">
          {{ regionTitle }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Select the specific anatomical area where you are experiencing symptoms.
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-format-list-bulleted"
        :to="`/check/${region}/all`"
      >
        View All in {{ regionTitle }}
      </v-btn>
    </div>

    <!-- Sub-Areas Grid -->
    <v-row class="mt-2">
      <v-col
        v-for="area in subAreas"
        :key="area.slug"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-4 h-100 cursor-pointer transition-swing"
          hover
          rounded="lg"
          elevation="2"
          @click="selectArea(area.slug)"
        >
          <div class="d-flex align-center mb-2">
            <v-avatar color="primary" variant="tonal" size="40" class="me-3">
              <v-icon :icon="area.icon || 'mdi-crosshairs-gps'" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ area.label }}</div>
              <div class="area-description text-caption text-medium-emphasis">{{ area.description }}</div>
            </div>
          </div>

          <div class="d-flex justify-end mt-3">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              append-icon="mdi-chevron-right"
            >
              Explore Symptoms
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Fallback if no sub-areas -->
    <v-alert
      v-if="!subAreas.length"
      type="info"
      variant="tonal"
      class="mt-6"
      title="No specific sub-areas configured"
      text="You can still browse all symptoms logged for this general region."
    >
      <v-btn
        class="mt-3"
        color="primary"
        :to="`/check/${region}/all`"
      >
        View Symptoms for {{ regionTitle }}
      </v-btn>
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const region = computed(() => (route.params.region || '').toString())
const regionTitle = computed(() => region.value.replace(/-/g, ' '))

const breadcrumbItems = computed(() => [
  { title: 'Home', disabled: false, href: '/' },
  { title: 'Body Map', disabled: false, href: '/' },
  { title: regionTitle.value, disabled: true },
])

const areaRegistry = {
  head: [
    { label: 'Scalp & Crown', slug: 'scalp', icon: 'mdi-head', description: 'Tenderness, hair loss, skin lesions, itching' },
    { label: 'Forehead & Temples', slug: 'forehead', icon: 'mdi-head-snowflake', description: 'Tension headache, sinus pressure, fever' },
    { label: 'Eyes & Vision', slug: 'eyes', icon: 'mdi-eye', description: 'Blurry vision, pain, redness, discharge, floaters' },
    { label: 'Ears & Hearing', slug: 'ears', icon: 'mdi-ear-hearing', description: 'Earache, ringing (tinnitus), discharge, hearing loss' },
    { label: 'Nose & Sinuses', slug: 'nose', icon: 'mdi-face-man-shimmer', description: 'Congestion, runny nose, nosebleeds, facial pressure' },
    { label: 'Mouth, Teeth & Throat', slug: 'mouth-throat', icon: 'mdi-account-voice', description: 'Sore throat, difficulty swallowing, mouth sores' },
  ],
  neck: [
    { label: 'Front of Neck & Thyroid', slug: 'neck-front', icon: 'mdi-human', description: 'Swelling, thyroid tenderness, voice changes' },
    { label: 'Back of Neck & Cervical Spine', slug: 'neck-back', icon: 'mdi-human-handsdown', description: 'Stiffness, muscle spasm, shooting nerve pain' },
    { label: 'Lymph Nodes', slug: 'lymph-nodes', icon: 'mdi-circle-multiple-outline', description: 'Swollen or tender glands under jaw or neck' },
  ],
  chest: [
    { label: 'Center Chest / Heart Area', slug: 'heart', icon: 'mdi-heart-pulse', description: 'Pressure, tightness, palpitations, sharp chest pain' },
    { label: 'Lungs & Airways', slug: 'lungs', icon: 'mdi-lungs', description: 'Shortness of breath, wheezing, persistent cough' },
    { label: 'Ribs & Chest Wall', slug: 'ribs', icon: 'mdi-bone', description: 'Pain with deep breathing, bruising, localized tenderness' },
    { label: 'Breast & Axilla', slug: 'breast', icon: 'mdi-circle-slice-8', description: 'Lumps, tenderness, skin changes, nipple discharge' },
  ],
  abdomen: [
    { label: 'Upper Center (Epigastric)', slug: 'upper-center-abdomen', icon: 'mdi-stomach', description: 'Heartburn, reflux, burning indigestion' },
    { label: 'Upper Right (RUQ)', slug: 'upper-right-abdomen', icon: 'mdi-shield-plus', description: 'Gallbladder or liver discomfort, pain after fatty meals' },
    { label: 'Lower Right (RLQ)', slug: 'lower-right-abdomen', icon: 'mdi-alert', description: 'Appendix area, sharp acute localized pain' },
    { label: 'Lower Left (LLQ)', slug: 'lower-left-abdomen', icon: 'mdi-chart-timeline-variant', description: 'Diverticular discomfort, cramps, bowel changes' },
    { label: 'Diffuse / Whole Abdomen', slug: 'diffuse-abdomen', icon: 'mdi-food-off', description: 'Bloating, nausea, generalized cramping, gas' },
  ],
  pelvis: [
    { label: 'Bladder & Urinary Tract', slug: 'urinary', icon: 'mdi-water-alert', description: 'Burning urination, frequency, urgency, cloudy urine' },
    { label: 'Reproductive & Pelvic Organs', slug: 'pelvic-organs', icon: 'mdi-human-male-female', description: 'Pelvic pressure, menstrual pain, localized cramps' },
    { label: 'Groin & Inguinal Area', slug: 'groin', icon: 'mdi-run', description: 'Bulge, pulling sensation, muscle strain' },
  ],
  'left-arm': [
    { label: 'Shoulder', slug: 'shoulder', icon: 'mdi-arm-flex', description: 'Rotator cuff pain, limited range of motion' },
    { label: 'Elbow', slug: 'elbow', icon: 'mdi-arm-flex-outline', description: 'Tennis elbow, joint swelling, stiffness' },
    { label: 'Wrist & Hand', slug: 'wrist-hand', icon: 'mdi-hand-back-right', description: 'Carpal tunnel, numbness, tingling, joint pain' },
  ],
  'right-arm': [
    { label: 'Shoulder', slug: 'shoulder', icon: 'mdi-arm-flex', description: 'Rotator cuff pain, limited range of motion' },
    { label: 'Elbow', slug: 'elbow', icon: 'mdi-arm-flex-outline', description: 'Tennis elbow, joint swelling, stiffness' },
    { label: 'Wrist & Hand', slug: 'wrist-hand', icon: 'mdi-hand-back-right', description: 'Carpal tunnel, numbness, tingling, joint pain' },
  ],
  'left-leg': [
    { label: 'Hip & Upper Thigh', slug: 'hip-thigh', icon: 'mdi-walk', description: 'Sciatica, bursitis, muscle pull' },
    { label: 'Knee Joint', slug: 'knee', icon: 'mdi-crosshairs', description: 'Swelling, meniscus pain, instability, clicking' },
    { label: 'Ankle & Foot', slug: 'ankle-foot', icon: 'mdi-shoe-sneaker', description: 'Sprains, plantar fasciitis, heel pain, swelling' },
  ],
  'right-leg': [
    { label: 'Hip & Upper Thigh', slug: 'hip-thigh', icon: 'mdi-walk', description: 'Sciatica, bursitis, muscle pull' },
    { label: 'Knee Joint', slug: 'knee', icon: 'mdi-crosshairs', description: 'Swelling, meniscus pain, instability, clicking' },
    { label: 'Ankle & Foot', slug: 'ankle-foot', icon: 'mdi-shoe-sneaker', description: 'Sprains, plantar fasciitis, heel pain, swelling' },
  ],
}

const subAreas = computed(() => areaRegistry[region.value] || [])

function selectArea(areaSlug) {
  router.push(`/check/${region.value}/${areaSlug}`)
}

useHead({
  title: computed(() => `Symply — ${regionTitle.value} Areas`),
})
</script>

<style scoped>
/* ─── Modern Grid Card Styles ───────────────────────────────────────────────── */
.v-card {
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-lg);
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--symply-shadow-md);
  border-color: var(--symply-primary);
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
}

.v-chip {
  font-weight: 500;
  border-radius: var(--symply-radius-sm);
}

.v-avatar {
  border-radius: var(--symply-radius-md);
}

/* ─── Alert Styles ──────────────────────────────────────────────────────────── */
.v-alert {
  border-radius: var(--symply-radius-lg);
}

.v-alert.v-alert-type-info {
  background-color: #F0F9FF;
  border: 1px solid #BAE6FD;
  color: #0E7490;
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
