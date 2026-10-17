<template>
  <div class="skin-map-wrap mx-auto">
    <div class="skin-map-label mb-4">
      <div class="label-text">Select a skin area or condition</div>
    </div>

    <!-- Full body skin image with clickable regions -->
    <div class="skin-image-container">
      <img src="/BACK.png" alt="Full body skin map" class="skin-image" />

      <!-- Overlay clickable regions -->
      <svg class="skin-overlay" viewBox="0 0 560 1204" xmlns="http://www.w3.org/2000/svg">
        <!-- Head -->
        <ellipse
          cx="280"
          cy="120"
          rx="80"
          ry="100"
          class="skin-region"
          @click="selectArea('head')"
          @mouseenter="hoveredArea = 'head'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Head and face"
          @keyup.enter="selectArea('head')"
        />

        <!-- Neck -->
        <rect
          x="240"
          y="210"
          width="80"
          height="50"
          class="skin-region"
          @click="selectArea('neck')"
          @mouseenter="hoveredArea = 'neck'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Neck"
          @keyup.enter="selectArea('neck')"
        />

        <!-- Chest -->
        <path
          d="M 200 270 Q 280 280 360 270 L 340 450 Q 280 460 220 450 Z"
          class="skin-region"
          @click="selectArea('chest')"
          @mouseenter="hoveredArea = 'chest'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Chest"
          @keyup.enter="selectArea('chest')"
        />

        <!-- Abdomen -->
        <path
          d="M 220 450 Q 280 460 340 450 L 330 650 Q 280 660 230 650 Z"
          class="skin-region"
          @click="selectArea('abdomen')"
          @mouseenter="hoveredArea = 'abdomen'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Abdomen"
          @keyup.enter="selectArea('abdomen')"
        />

        <!-- Pelvis/Groin -->
        <path
          d="M 230 650 Q 280 660 330 650 L 320 750 Q 280 760 240 750 Z"
          class="skin-region"
          @click="selectArea('pelvis')"
          @mouseenter="hoveredArea = 'pelvis'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Pelvis and groin"
          @keyup.enter="selectArea('pelvis')"
        />

        <!-- Left Arm -->
        <rect
          x="100"
          y="290"
          width="80"
          height="280"
          rx="30"
          class="skin-region"
          @click="selectArea('left-arm')"
          @mouseenter="hoveredArea = 'left-arm'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Left arm"
          @keyup.enter="selectArea('left-arm')"
        />

        <!-- Right Arm -->
        <rect
          x="380"
          y="290"
          width="80"
          height="280"
          rx="30"
          class="skin-region"
          @click="selectArea('right-arm')"
          @mouseenter="hoveredArea = 'right-arm'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Right arm"
          @keyup.enter="selectArea('right-arm')"
        />

        <!-- Left Leg -->
        <rect
          x="190"
          y="750"
          width="70"
          height="420"
          rx="30"
          class="skin-region"
          @click="selectArea('left-leg')"
          @mouseenter="hoveredArea = 'left-leg'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Left leg"
          @keyup.enter="selectArea('left-leg')"
        />

        <!-- Right Leg -->
        <rect
          x="300"
          y="750"
          width="70"
          height="420"
          rx="30"
          class="skin-region"
          @click="selectArea('right-leg')"
          @mouseenter="hoveredArea = 'right-leg'"
          @mouseleave="hoveredArea = null"
          tabindex="-1"
          role="button"
          aria-label="Right leg"
          @keyup.enter="selectArea('right-leg')"
        />
      </svg>
    </div>

    <!-- Area indicator -->
    <div class="area-indicator" aria-live="polite">
      <template v-if="hoveredArea || selectedArea">
        <v-icon icon="mdi-map-marker" size="16" color="primary" class="me-2" />
        <span class="indicator-label">{{ areaLabel(hoveredArea || selectedArea) }}</span>
      </template>
      <template v-else>
        <span class="indicator-empty">Tap a region to explore</span>
      </template>
    </div>

    <!-- Quick select list -->
    <div class="area-list-wrap mt-6">
      <div class="list-label">Or select an area</div>
      <div class="area-list">
        <button
          v-for="area in areas"
          :key="area.key"
          class="area-list-item"
          :class="{ 'area-list-item--active': selectedArea === area.key }"
          @click="selectArea(area.key)"
        >
          <v-icon :icon="area.icon" size="18" class="me-2" color="primary" />
          <span>{{ area.label }}</span>
          <v-icon icon="mdi-chevron-right" size="16" class="ms-auto" color="grey-lighten-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hoveredArea = ref(null)
const selectedArea = ref(null)

const areas = [
  { key: 'head', label: 'Head & Face', icon: 'mdi-head' },
  { key: 'neck', label: 'Neck & Throat', icon: 'mdi-account-voice' },
  { key: 'chest', label: 'Chest', icon: 'mdi-heart-pulse' },
  { key: 'abdomen', label: 'Abdomen', icon: 'mdi-stomach' },
  { key: 'pelvis', label: 'Pelvis & Groin', icon: 'mdi-human-male-female' },
  { key: 'left-arm', label: 'Arms', icon: 'mdi-arm-flex' },
  { key: 'left-leg', label: 'Legs', icon: 'mdi-walk' },
]

const areaLabels = {
  head: 'Head & Face',
  neck: 'Neck & Throat',
  chest: 'Chest',
  abdomen: 'Abdomen',
  pelvis: 'Pelvis & Groin',
  'left-arm': 'Arms',
  'right-arm': 'Arms',
  'left-leg': 'Legs',
  'right-leg': 'Legs',
}

function areaLabel(key) {
  return areaLabels[key] ?? key.replace('-', ' ')
}

function selectArea(areaKey) {
  selectedArea.value = areaKey
  // Map skin areas to body parts for the query
  const bodyPartMap = {
    head: 'Head',
    neck: 'Neck',
    chest: 'Chest',
    abdomen: 'Abdomen/Stomach',
    pelvis: 'Pelvis/Groin',
    'left-arm': 'Arm',
    'right-arm': 'Arm',
    'left-leg': 'Leg',
    'right-leg': 'Leg',
  }
  const bodyPart = bodyPartMap[areaKey]
  router.push(`/check/${bodyPart}`)
}
</script>

<style scoped>
.skin-map-wrap {
  max-width: 320px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px 20px;
}

.skin-map-label {
  text-align: center;
}

.label-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
}

.skin-image-container {
  position: relative;
  width: 100%;
  margin: 16px 0;
}

.skin-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: #F0F4F8;
}

.skin-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.skin-region {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0;
  transition: all 0.15s ease;
  cursor: pointer;
  outline: none;
  user-select: none;
}

.skin-region:hover,
.skin-region:active {
  fill: rgba(37, 99, 235, 0.15);
  stroke: #2563EB;
  stroke-width: 2;
}

.skin-region:focus-visible {
  stroke: #F59E0B;
  stroke-width: 3;
}

.area-indicator {
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

.area-list-wrap {
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

.area-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.area-list-item {
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

.area-list-item:hover {
  background: #F0F4F8;
  color: #2563EB;
}

.area-list-item--active {
  background: #EFF6FF;
  color: #2563EB;
  font-weight: 600;
}

.area-list-item:focus-visible {
  box-shadow: 0 0 0 2px #F59E0B;
}
</style>
