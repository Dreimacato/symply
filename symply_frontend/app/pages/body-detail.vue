<template>
  <div class="body-detail-page">
    <!-- Header with Back button -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <v-icon icon="mdi-map-marker" size="16" color="#2563EB" />
        <span>Back</span>
      </button>
    </div>

    <!-- Body Views Grid -->
    <div class="body-views-container">
      <div class="body-views-grid">
        <!-- Front View -->
        <div class="body-view-card">
          <div class="body-view-wrapper">
            <img
              src="/body-front.png"
              alt="Front view"
              class="body-image-detail"
            />

            <!-- SVG overlay with detailed regions -->
            <svg class="body-overlay-detail" viewBox="0 0 560 1204" xmlns="http://www.w3.org/2000/svg">
              <!-- Head -->
              <ellipse
                cx="280" cy="85" rx="60" ry="75"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'head' }"
                @click="selectRegion('head', 'Head')"
                @mouseenter="hoveredRegion = 'head'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Neck -->
              <rect
                x="250" y="145" width="60" height="55"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'neck' }"
                @click="selectRegion('neck', 'Neck')"
                @mouseenter="hoveredRegion = 'neck'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Upper Chest -->
              <path
                d="M 200 210 Q 280 200 360 210 L 340 315 Q 280 320 220 315 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'upper-chest' }"
                @click="selectRegion('upper-chest', 'Upper Chest')"
                @mouseenter="hoveredRegion = 'upper-chest'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Lower Chest -->
              <path
                d="M 220 315 Q 280 320 340 315 L 340 420 Q 280 430 220 420 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'lower-chest' }"
                @click="selectRegion('lower-chest', 'Lower Chest')"
                @mouseenter="hoveredRegion = 'lower-chest'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Upper Arm -->
              <path
                d="M 90 280 Q 100 360 75 450 L 95 460 Q 115 370 140 290 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-upper-arm' }"
                @click="selectRegion('left-upper-arm', 'Left Upper Arm')"
                @mouseenter="hoveredRegion = 'left-upper-arm'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Lower Arm -->
              <path
                d="M 75 450 Q 60 540 50 620 L 70 640 Q 85 550 95 460 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-lower-arm' }"
                @click="selectRegion('left-lower-arm', 'Left Forearm')"
                @mouseenter="hoveredRegion = 'left-lower-arm'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Upper Arm -->
              <path
                d="M 470 280 Q 460 360 485 450 L 465 460 Q 445 370 420 290 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-upper-arm' }"
                @click="selectRegion('right-upper-arm', 'Right Upper Arm')"
                @mouseenter="hoveredRegion = 'right-upper-arm'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Lower Arm -->
              <path
                d="M 485 450 Q 500 540 510 620 L 490 640 Q 475 550 465 460 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-lower-arm' }"
                @click="selectRegion('right-lower-arm', 'Right Forearm')"
                @mouseenter="hoveredRegion = 'right-lower-arm'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Upper Abdomen -->
              <path
                d="M 220 420 Q 280 430 340 420 L 335 515 Q 280 525 225 515 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'upper-abdomen' }"
                @click="selectRegion('upper-abdomen', 'Upper Abdomen')"
                @mouseenter="hoveredRegion = 'upper-abdomen'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Lower Abdomen -->
              <path
                d="M 225 515 Q 280 525 335 515 L 325 610 Q 280 620 235 610 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'lower-abdomen' }"
                @click="selectRegion('lower-abdomen', 'Lower Abdomen')"
                @mouseenter="hoveredRegion = 'lower-abdomen'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Pelvis -->
              <path
                d="M 235 610 Q 280 620 325 610 L 315 690 Q 280 700 245 690 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'pelvis' }"
                @click="selectRegion('pelvis', 'Pelvis')"
                @mouseenter="hoveredRegion = 'pelvis'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Upper Leg -->
              <path
                d="M 210 690 Q 220 840 215 990 L 265 990 Q 270 840 265 690 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-upper-leg' }"
                @click="selectRegion('left-upper-leg', 'Left Thigh')"
                @mouseenter="hoveredRegion = 'left-upper-leg'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Lower Leg -->
              <path
                d="M 215 990 Q 210 1085 210 1180 L 270 1180 Q 270 1085 265 990 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-lower-leg' }"
                @click="selectRegion('left-lower-leg', 'Left Lower Leg')"
                @mouseenter="hoveredRegion = 'left-lower-leg'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Upper Leg -->
              <path
                d="M 295 690 Q 290 840 295 990 L 350 990 Q 345 840 335 690 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-upper-leg' }"
                @click="selectRegion('right-upper-leg', 'Right Thigh')"
                @mouseenter="hoveredRegion = 'right-upper-leg'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Lower Leg -->
              <path
                d="M 295 990 Q 290 1085 290 1180 L 350 1180 Q 345 1085 345 990 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-lower-leg' }"
                @click="selectRegion('right-lower-leg', 'Right Lower Leg')"
                @mouseenter="hoveredRegion = 'right-lower-leg'"
                @mouseleave="hoveredRegion = null"
              />
            </svg>
          </div>
        </div>

        <!-- Back View -->
        <div class="body-view-card">
          <div class="body-view-wrapper">
            <img
              src="/body-back.png"
              alt="Back view"
              class="body-image-detail"
            />

            <!-- SVG overlay with detailed regions -->
            <svg class="body-overlay-detail" viewBox="0 0 560 1204" xmlns="http://www.w3.org/2000/svg">
              <!-- Head Back -->
              <ellipse
                cx="280" cy="85" rx="60" ry="75"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'head-back' }"
                @click="selectRegion('head-back', 'Head (Back)')"
                @mouseenter="hoveredRegion = 'head-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Neck Back -->
              <rect
                x="250" y="145" width="60" height="55"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'neck-back' }"
                @click="selectRegion('neck-back', 'Neck (Back)')"
                @mouseenter="hoveredRegion = 'neck-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Upper Back -->
              <path
                d="M 200 210 Q 280 200 360 210 L 340 360 Q 280 370 220 360 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'upper-back' }"
                @click="selectRegion('upper-back', 'Upper Back')"
                @mouseenter="hoveredRegion = 'upper-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Middle Back -->
              <path
                d="M 220 360 Q 280 370 340 360 L 340 520 Q 280 530 220 520 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'middle-back' }"
                @click="selectRegion('middle-back', 'Middle Back')"
                @mouseenter="hoveredRegion = 'middle-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Upper Arm Back -->
              <path
                d="M 90 280 Q 100 360 75 450 L 95 460 Q 115 370 140 290 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-upper-arm-back' }"
                @click="selectRegion('left-upper-arm-back', 'Left Upper Arm (Back)')"
                @mouseenter="hoveredRegion = 'left-upper-arm-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Lower Arm Back -->
              <path
                d="M 75 450 Q 60 540 50 620 L 70 640 Q 85 550 95 460 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-lower-arm-back' }"
                @click="selectRegion('left-lower-arm-back', 'Left Forearm (Back)')"
                @mouseenter="hoveredRegion = 'left-lower-arm-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Upper Arm Back -->
              <path
                d="M 470 280 Q 460 360 485 450 L 465 460 Q 445 370 420 290 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-upper-arm-back' }"
                @click="selectRegion('right-upper-arm-back', 'Right Upper Arm (Back)')"
                @mouseenter="hoveredRegion = 'right-upper-arm-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Lower Arm Back -->
              <path
                d="M 485 450 Q 500 540 510 620 L 490 640 Q 475 550 465 460 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-lower-arm-back' }"
                @click="selectRegion('right-lower-arm-back', 'Right Forearm (Back)')"
                @mouseenter="hoveredRegion = 'right-lower-arm-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Lower Back -->
              <path
                d="M 220 520 Q 280 530 340 520 L 330 590 Q 280 600 230 590 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'lower-back' }"
                @click="selectRegion('lower-back', 'Lower Back')"
                @mouseenter="hoveredRegion = 'lower-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Buttocks -->
              <ellipse
                cx="280" cy="640" rx="65" ry="50"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'buttocks' }"
                @click="selectRegion('buttocks', 'Buttocks')"
                @mouseenter="hoveredRegion = 'buttocks'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Upper Leg Back -->
              <path
                d="M 210 690 Q 220 840 215 990 L 265 990 Q 270 840 265 690 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-upper-leg-back' }"
                @click="selectRegion('left-upper-leg-back', 'Left Thigh (Back)')"
                @mouseenter="hoveredRegion = 'left-upper-leg-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Left Lower Leg Back -->
              <path
                d="M 215 990 Q 210 1085 210 1180 L 270 1180 Q 270 1085 265 990 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'left-lower-leg-back' }"
                @click="selectRegion('left-lower-leg-back', 'Left Calf')"
                @mouseenter="hoveredRegion = 'left-lower-leg-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Upper Leg Back -->
              <path
                d="M 295 690 Q 290 840 295 990 L 350 990 Q 345 840 335 690 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-upper-leg-back' }"
                @click="selectRegion('right-upper-leg-back', 'Right Thigh (Back)')"
                @mouseenter="hoveredRegion = 'right-upper-leg-back'"
                @mouseleave="hoveredRegion = null"
              />

              <!-- Right Lower Leg Back -->
              <path
                d="M 295 990 Q 290 1085 290 1180 L 350 1180 Q 345 1085 345 990 Z"
                class="body-region-detail"
                :class="{ 'region-selected': selectedRegion === 'right-lower-leg-back' }"
                @click="selectRegion('right-lower-leg-back', 'Right Calf')"
                @mouseenter="hoveredRegion = 'right-lower-leg-back'"
                @mouseleave="hoveredRegion = null"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Info Cards -->
    <div class="info-cards-container">
      <div class="info-card">
        <div class="info-icon red">
          <v-icon icon="mdi-alert-circle" size="24" color="white" />
        </div>
        <div class="info-content">
          <h3 class="info-title">Red signal alerts</h3>
          <p class="info-text">Urgent warning signs are flagged immediately so you know when to act fast.</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon orange">
          <v-icon icon="mdi-hospital-box" size="24" color="white" />
        </div>
        <div class="info-content">
          <h3 class="info-title">Triage guidance</h3>
          <p class="info-text">Know whether to monitor at home, visit a clinic, or head to the ER.</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon green">
          <v-icon icon="mdi-hospital-building" size="24" color="white" />
        </div>
        <div class="info-content">
          <h3 class="info-title">Facility routing</h3>
          <p class="info-text">Recommendations on the right type of facility for your specific concern.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const hoveredRegion = ref(null)
const selectedRegion = ref(null)

function selectRegion(regionId, regionName) {
  selectedRegion.value = regionId
  // Navigate to symptoms page with the selected region
  setTimeout(() => {
    router.push({
      path: '/bodymap',
      query: { region: regionName }
    })
  }, 200)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
/* ─── Core Page ─────────────────────────────────────────────────────────────── */
.body-detail-page {
  min-height: 100vh;
  /* Transparent so the global Arctic Frost shows through (light + dark) */
  background: transparent;
  padding: 24px;
}

/* ─── Page Header ───────────────────────────────────────────────────────────── */
.page-header {
  max-width: 1200px;
  margin: 0 auto 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  font-size: 1rem;
  font-weight: 600;
  color: var(--symply-primary-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #F8FAFC;
  border-color: var(--symply-primary);
  box-shadow: var(--symply-shadow-sm);
}

/* ─── Body Views Grid ───────────────────────────────────────────────────────── */
.body-views-container {
  max-width: 1200px;
  margin: 0 auto 40px;
}

.body-views-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

/* ─── Body View Card ────────────────────────────────────────────────────────── */
.body-view-card {
  background: white;
  border-radius: var(--symply-radius-lg);
  padding: 24px;
  box-shadow: var(--symply-shadow-sm);
  transition: box-shadow 0.2s ease;
}

.body-view-card:hover {
  box-shadow: var(--symply-shadow-md);
}

.body-view-wrapper {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.body-image-detail {
  width: 100%;
  height: auto;
  display: block;
}

.body-overlay-detail {
  position: absolute;
  top: 24px;
  left: 24px;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  pointer-events: none;
}

.body-region-detail {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
}

.body-region-detail:hover {
  fill: rgba(6, 182, 212, 0.25);
  stroke: var(--symply-primary);
  stroke-width: 2;
}

.body-region-detail.region-selected {
  fill: rgba(6, 182, 212, 0.4);
  stroke: var(--symply-primary);
  stroke-width: 3;
}

/* ─── Info Cards ────────────────────────────────────────────────────────────── */
.info-cards-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--symply-shadow-md);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--symply-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon.red {
  background: #EF4444;
}

.info-icon.orange {
  background: #F97316;
}

.info-icon.green {
  background: #10B981;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin: 0 0 8px 0;
}

.info-text {
  font-size: 0.95rem;
  color: var(--symply-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ─── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .body-views-grid {
    grid-template-columns: 1fr;
  }

  .info-cards-container {
    grid-template-columns: 1fr;
  }

  .body-view-card {
    margin-bottom: 24px;
  }
}

@media (max-width: 640px) {
  .body-detail-page {
    padding: 16px;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }

  .body-views-grid {
    gap: 24px;
  }

  .body-view-card {
    padding: 20px;
  }

  .info-cards-container {
    gap: 16px;
  }

  .info-card {
    padding: 20px;
  }

  .info-title {
    font-size: 1rem;
  }
}

/* ─── Night mode overrides for Body Detail page ──────────────────────────────────
     These cover elements that still carry fixed hex colors which would stay
     light in dark mode (back button, body view cards, info cards, info icons,
     region selection, charts). */
:root[data-theme='dark'] .body-detail-page {
  /* Transparent so the global Arctic Frost shows through in dark mode */
  background: transparent;
}
:root[data-theme='dark'] .page-header {
  background: var(--symply-card-bg);
  border-bottom-color: var(--symply-border);
}
:root[data-theme='dark'] .back-btn {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .back-btn:hover {
  background: var(--symply-primary);
  border-color: var(--symply-primary);
  color: white;
}
:root[data-theme='dark'] .body-views-container {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .body-view-card {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .body-view-card:hover {
  box-shadow: var(--symply-shadow-md);
}
:root[data-theme='dark'] .body-image-detail {
  filter: brightness(0.85);
}
:root[data-theme='dark'] .body-region-detail {
  fill: transparent;
  stroke: var(--symply-border);
  stroke-width: 0;
}
:root[data-theme='dark'] .body-region-detail:hover {
  fill: var(--symply-primary-light);
  stroke: var(--symply-primary);
  stroke-width: 2;
}
:root[data-theme='dark'] .body-region-detail.region-selected {
  fill: var(--symply-primary-light);
  stroke: var(--symply-primary);
  stroke-width: 3;
}
:root[data-theme='dark'] .info-cards-container {
  background: var(--symply-card-bg);
  border: 1px solid var(--symply-border);
}
:root[data-theme='dark'] .info-card {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .info-icon {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .info-icon .info-icon-svg {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .info-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .info-text {
  color: var(--symply-text-secondary);
}
:root[data-theme='dark'] .info-icon.red .info-icon-svg {
  color: #EF4444;
}
:root[data-theme='dark'] .info-icon.orange .info-icon-svg {
  color: #F97316;
}
:root[data-theme='dark'] .info-icon.green .info-icon-svg {
  color: #10B981;
}
</style>
