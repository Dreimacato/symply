<template>
  <div class="bodymap-wrapper">
    <div class="maps-container">
      <!-- Left: Skin Condition -->
      <div class="map-panel">
        <div class="panel-header">
          <span class="panel-title">Skin Condition</span>
        </div>
        <div class="map-box">
          <div class="body-map-container">
            <img
              src="/skin.png"
              alt="Skin conditions map"
              class="body-image"
              :class="{ 'body-image--hovered': skinHovered }"
              @click="selectRegion('Skin')"
              @mouseenter="skinHovered = true"
              @mouseleave="skinHovered = false"
            />
          </div>
        </div>
      </div>

      <!-- Right: Anatomical with rotation -->
      <div class="map-panel">
        <div class="panel-header">
          <button
            class="rotate-btn"
            @click="toggleView"
            :title="anatomicalView === 'front' ? 'Rotate to back view' : 'Rotate to front view'"
          >
            <v-icon icon="mdi-rotate-3d-variant" size="20" />
            Rotate
          </button>
        </div>
        <div class="map-box">
          <div class="body-map-container">
            <!-- Body image -->
            <img
              :src="anatomicalView === 'front' ? '/skin.png' : '/body-back.png'"
              alt="Human body"
              class="body-image"
            />

            <!-- SVG overlay for clickable regions -->
            <svg class="body-overlay" viewBox="0 0 560 1204" xmlns="http://www.w3.org/2000/svg">
              <template v-if="anatomicalView === 'front'">
                <!-- Head -->
                <ellipse
                  cx="280" cy="85" rx="60" ry="75"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'head' }"
                  @click="selectRegion('Head')"
                  @mouseenter="hoveredRegion = 'head'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Neck -->
                <rect
                  x="250" y="145" width="60" height="55"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'neck' }"
                  @click="selectRegion('Neck')"
                  @mouseenter="hoveredRegion = 'neck'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Chest -->
                <path
                  d="M 200 210 Q 280 200 360 210 L 340 420 Q 280 430 220 420 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'chest' }"
                  @click="selectRegion('Chest')"
                  @mouseenter="hoveredRegion = 'chest'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Left Arm -->
                <path
                  d="M 90 280 Q 100 400 50 620 L 70 640 Q 110 430 150 300 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'arm-left' }"
                  @click="selectRegion('Arm')"
                  @mouseenter="hoveredRegion = 'arm-left'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Right Arm -->
                <path
                  d="M 470 280 Q 460 400 510 620 L 490 640 Q 450 430 410 300 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'arm-right' }"
                  @click="selectRegion('Arm')"
                  @mouseenter="hoveredRegion = 'arm-right'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Abdomen/Stomach -->
                <path
                  d="M 220 420 Q 280 430 340 420 L 325 610 Q 280 620 235 610 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'stomach' }"
                  @click="selectRegion('Abdomen/Stomach')"
                  @mouseenter="hoveredRegion = 'stomach'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Pelvis/Groin -->
                <path
                  d="M 235 610 Q 280 620 325 610 L 315 690 Q 280 700 245 690 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'groin' }"
                  @click="selectRegion('Pelvis/Groin')"
                  @mouseenter="hoveredRegion = 'groin'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Left Leg -->
                <path
                  d="M 210 690 Q 220 900 210 1180 L 270 1180 Q 280 900 270 690 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'leg-left' }"
                  @click="selectRegion('Leg')"
                  @mouseenter="hoveredRegion = 'leg-left'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Right Leg -->
                <path
                  d="M 290 690 Q 280 900 290 1180 L 350 1180 Q 340 900 330 690 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'leg-right' }"
                  @click="selectRegion('Leg')"
                  @mouseenter="hoveredRegion = 'leg-right'"
                  @mouseleave="hoveredRegion = null"
                />
              </template>

              <template v-else>
                <!-- Back view regions -->
                <!-- Head (back) -->
                <ellipse
                  cx="280" cy="85" rx="60" ry="75"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'head' }"
                  @click="selectRegion('Head')"
                  @mouseenter="hoveredRegion = 'head'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Neck (back) -->
                <rect
                  x="250" y="145" width="60" height="55"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'neck' }"
                  @click="selectRegion('Neck')"
                  @mouseenter="hoveredRegion = 'neck'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Upper Back -->
                <path
                  d="M 200 210 Q 280 200 360 210 L 340 470 Q 280 480 220 470 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'back' }"
                  @click="selectRegion('Back')"
                  @mouseenter="hoveredRegion = 'back'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Left Arm (back) -->
                <path
                  d="M 90 280 Q 100 400 50 620 L 70 640 Q 110 430 150 300 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'arm-left' }"
                  @click="selectRegion('Arm')"
                  @mouseenter="hoveredRegion = 'arm-left'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Right Arm (back) -->
                <path
                  d="M 470 280 Q 460 400 510 620 L 490 640 Q 450 430 410 300 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'arm-right' }"
                  @click="selectRegion('Arm')"
                  @mouseenter="hoveredRegion = 'arm-right'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Buttocks -->
                <ellipse
                  cx="280" cy="540" rx="70" ry="60"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'buttocks' }"
                  @click="selectRegion('Buttock')"
                  @mouseenter="hoveredRegion = 'buttocks'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Lower back/Pelvis -->
                <rect
                  x="240" y="590" width="80" height="80"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'lower-back' }"
                  @click="selectRegion('Pelvis/Groin')"
                  @mouseenter="hoveredRegion = 'lower-back'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Left Leg (back) -->
                <path
                  d="M 210 690 Q 220 900 210 1180 L 270 1180 Q 280 900 270 690 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'leg-left' }"
                  @click="selectRegion('Leg')"
                  @mouseenter="hoveredRegion = 'leg-left'"
                  @mouseleave="hoveredRegion = null"
                />

                <!-- Right Leg (back) -->
                <path
                  d="M 290 690 Q 280 900 290 1180 L 350 1180 Q 340 900 330 690 Z"
                  class="body-region"
                  :class="{ 'region--hovered': hoveredRegion === 'leg-right' }"
                  @click="selectRegion('Leg')"
                  @mouseenter="hoveredRegion = 'leg-right'"
                  @mouseleave="hoveredRegion = null"
                />
              </template>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicator -->
    <div class="region-indicator" aria-live="polite">
      <template v-if="skinHovered">
        <v-icon icon="mdi-map-marker" size="14" color="primary" class="me-1" />
        <span class="indicator-text">Skin</span>
      </template>
      <template v-else-if="hoveredRegion">
        <v-icon icon="mdi-map-marker" size="14" color="primary" class="me-1" />
        <span class="indicator-text">{{ getRegionLabel(hoveredRegion) }}</span>
      </template>
      <template v-else>
        <span class="indicator-empty">Tap a region to explore</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const anatomicalView = ref('front')
const skinHovered = ref(false)
const hoveredRegion = ref(null)

const regionLabels = {
  head: 'Head',
  neck: 'Neck',
  chest: 'Chest',
  back: 'Back',
  stomach: 'Abdomen',
  buttocks: 'Buttocks',
  groin: 'Pelvis/Groin',
  'lower-back': 'Lower Back',
  'arm-left': 'Left Arm',
  'arm-right': 'Right Arm',
  'leg-left': 'Left Leg',
  'leg-right': 'Right Leg',
}

function getRegionLabel(key) {
  return regionLabels[key] ?? ''
}

function toggleView() {
  anatomicalView.value = anatomicalView.value === 'front' ? 'back' : 'front'
  hoveredRegion.value = null
}

function selectRegion(bodyPart) {
  router.push(`/check/${bodyPart}`)
}
</script>

<style scoped>
.bodymap-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.maps-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.map-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0F172A;
}

.rotate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  background: #2563EB;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rotate-btn:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.rotate-btn:active {
  transform: translateY(0);
}

.map-box {
  background: #F0F4F8;
  border: 2px solid #CBD5E1;
  border-radius: 20px;
  padding: 24px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body-map-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
}

.body-image {
  display: block;
  width: 100%;
  height: auto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.body-image--hovered {
  filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.6));
  transform: scale(1.02);
}

.body-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.body-region {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
}

.body-region:hover,
.region--hovered {
  fill: rgba(37, 99, 235, 0.25);
  stroke: #2563EB;
  stroke-width: 2;
}

.region-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  font-size: 0.9rem;
}

.indicator-text {
  font-weight: 600;
  color: #2563EB;
}

.indicator-empty {
  color: #94A3B8;
}

.me-1 {
  margin-right: 4px;
}

@media (max-width: 768px) {
  .maps-container {
    grid-template-columns: 1fr;
  }

  .body-map-container {
    max-width: 240px;
  }
}
</style>
