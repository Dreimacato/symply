<template>
  <div class="anatomical-map-wrap mx-auto">
    <div class="map-header mb-4">
      <div class="header-label">Anatomical regions</div>
      <v-btn-toggle
        v-model="viewMode"
        mandatory
        density="compact"
        color="primary"
        variant="outlined"
        class="view-toggle"
      >
        <v-btn value="front" prepend-icon="mdi-human" size="small">Front</v-btn>
        <v-btn value="back" prepend-icon="mdi-human-male" size="small">Back</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Anatomical body image with clickable regions -->
    <div class="anatomical-image-container">
      <img
        :src="currentImage"
        :alt="`${viewMode} view of body with anatomical regions`"
        class="anatomical-image"
      />

      <!-- Overlay clickable regions (simplified - actual SVG paths would depend on image dimensions) -->
      <svg class="anatomical-overlay" viewBox="0 0 240 620" xmlns="http://www.w3.org/2000/svg">
        <!-- Head -->
        <ellipse
          cx="120"
          cy="50"
          rx="35"
          ry="45"
          class="region"
          @click="selectRegion('head')"
          @mouseenter="hoveredRegion = 'head'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Head"
          @keyup.enter="selectRegion('head')"
        />

        <!-- Neck -->
        <rect
          x="105"
          y="90"
          width="30"
          height="25"
          class="region"
          @click="selectRegion('neck')"
          @mouseenter="hoveredRegion = 'neck'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Neck"
          @keyup.enter="selectRegion('neck')"
        />

        <!-- Chest -->
        <path
          d="M 75 120 Q 120 125 165 120 L 160 200 Q 120 205 80 200 Z"
          class="region"
          @click="selectRegion('chest')"
          @mouseenter="hoveredRegion = 'chest'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Chest"
          @keyup.enter="selectRegion('chest')"
        />

        <!-- Abdomen -->
        <path
          d="M 80 200 Q 120 205 160 200 L 156 310 Q 120 315 84 310 Z"
          class="region"
          @click="selectRegion('abdomen')"
          @mouseenter="hoveredRegion = 'abdomen'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Abdomen"
          @keyup.enter="selectRegion('abdomen')"
        />

        <!-- Pelvis -->
        <path
          d="M 84 310 Q 120 315 156 310 L 150 370 Q 120 375 90 370 Z"
          class="region"
          @click="selectRegion('pelvis')"
          @mouseenter="hoveredRegion = 'pelvis'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Pelvis"
          @keyup.enter="selectRegion('pelvis')"
        />

        <!-- Left Arm -->
        <rect
          x="40"
          y="130"
          width="28"
          height="200"
          rx="12"
          class="region"
          @click="selectRegion('left-arm')"
          @mouseenter="hoveredRegion = 'left-arm'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Left arm"
          @keyup.enter="selectRegion('left-arm')"
        />

        <!-- Right Arm -->
        <rect
          x="172"
          y="130"
          width="28"
          height="200"
          rx="12"
          class="region"
          @click="selectRegion('right-arm')"
          @mouseenter="hoveredRegion = 'right-arm'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Right arm"
          @keyup.enter="selectRegion('right-arm')"
        />

        <!-- Left Leg -->
        <rect
          x="90"
          y="370"
          width="25"
          height="220"
          rx="12"
          class="region"
          @click="selectRegion('left-leg')"
          @mouseenter="hoveredRegion = 'left-leg'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Left leg"
          @keyup.enter="selectRegion('left-leg')"
        />

        <!-- Right Leg -->
        <rect
          x="125"
          y="370"
          width="25"
          height="220"
          rx="12"
          class="region"
          @click="selectRegion('right-leg')"
          @mouseenter="hoveredRegion = 'right-leg'"
          @mouseleave="hoveredRegion = null"
          tabindex="-1"
          role="button"
          aria-label="Right leg"
          @keyup.enter="selectRegion('right-leg')"
        />
      </svg>
    </div>

    <!-- Region indicator -->
    <div class="region-indicator" aria-live="polite">
      <template v-if="hoveredRegion || selectedRegion">
        <v-icon icon="mdi-map-marker" size="16" color="primary" class="me-2" />
        <span class="indicator-label">{{ regionLabel(hoveredRegion || selectedRegion) }}</span>
      </template>
      <template v-else>
        <span class="indicator-empty">Tap a region to explore</span>
      </template>
    </div>

    <!-- Quick select list -->
    <div class="region-list-wrap mt-6">
      <div class="list-label">Or select a region</div>
      <div class="region-list">
        <button
          v-for="reg in regions"
          :key="reg.key"
          class="region-list-item"
          :class="{ 'region-list-item--active': selectedRegion === reg.key }"
          @click="selectRegion(reg.key)"
        >
          <v-icon :icon="reg.icon" size="18" class="me-2" color="primary" />
          <span>{{ reg.label }}</span>
          <v-icon icon="mdi-chevron-right" size="16" class="ms-auto" color="grey-lighten-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const viewMode = ref('front')
const hoveredRegion = ref(null)
const selectedRegion = ref(null)

const regions = [
  { key: 'head', label: 'Head & Face', icon: 'mdi-head' },
  { key: 'neck', label: 'Neck & Throat', icon: 'mdi-account-voice' },
  { key: 'chest', label: 'Chest & Lungs', icon: 'mdi-heart-pulse' },
  { key: 'abdomen', label: 'Abdomen & Stomach', icon: 'mdi-stomach' },
  { key: 'pelvis', label: 'Pelvis & Groin', icon: 'mdi-human-male-female' },
  { key: 'left-arm', label: 'Arms & Hands', icon: 'mdi-arm-flex' },
  { key: 'left-leg', label: 'Legs & Feet', icon: 'mdi-walk' },
]

const regionLabels = {
  head: 'Head & Face',
  neck: 'Neck & Throat',
  chest: 'Chest & Lungs',
  abdomen: 'Abdomen & Stomach',
  pelvis: 'Pelvis & Groin',
  'left-arm': 'Arms & Hands',
  'right-arm': 'Arms & Hands',
  'left-leg': 'Legs & Feet',
  'right-leg': 'Legs & Feet',
}

const currentImage = computed(() => {
  return viewMode.value === 'front' ? '/skin.png' : '/skin-back.png'
})

function regionLabel(key) {
  return regionLabels[key] ?? key.replace('-', ' ')
}

function selectRegion(regionKey) {
  selectedRegion.value = regionKey
  router.push(`/check/${regionKey}`)
}
</script>

<style scoped>
.anatomical-map-wrap {
  max-width: 320px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px 20px;
}

.map-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.header-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
}

.view-toggle {
  width: 100%;
}

.anatomical-image-container {
  position: relative;
  width: 100%;
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  background: #F0F4F8;
}

.anatomical-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.anatomical-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.region {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0;
  transition: all 0.15s ease;
  cursor: pointer;
  outline: none;
  user-select: none;
}

.region:hover,
.region:active {
  fill: rgba(37, 99, 235, 0.15);
  stroke: #2563EB;
  stroke-width: 2;
}

.region:focus-visible {
  stroke: #F59E0B;
  stroke-width: 3;
}

.region-indicator {
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.indicator-label {
  font-weight: 600;
  color: #2563EB;
}

.indicator-empty {
  color: #94A3B8;
}

.region-list-wrap {
  border-top: 1px solid #E2E8F0;
  padding-top: 16px;
}

.list-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 8px;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.region-list-item {
  display: flex;
  align-items: center;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  transition: background 0.12s ease;
  text-align: left;
  outline: none;
  user-select: none;
}

.region-list-item:hover {
  background: #F0F4F8;
  color: #2563EB;
}

.region-list-item--active {
  background: #EFF6FF;
  color: #2563EB;
  font-weight: 600;
}

.region-list-item:focus-visible {
  box-shadow: 0 0 0 2px #F59E0B;
}
</style>
