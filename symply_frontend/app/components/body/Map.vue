<template>
  <div class="body-map-wrap mx-auto">
    <!-- Map + sidebar layout -->
    <div class="map-layout">
      <!-- SVG -->
      <div class="map-svg-col">
        <svg
          viewBox="0 0 300 620"
          class="body-svg"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Interactive human body map. Click a region to explore symptoms."
        >
          <!-- HEAD -->
          <g
            id="region-head"
            class="body-region"
            :class="{ active: hoveredRegion === 'head' || selectedRegion === 'head' }"
            @mouseenter="hoveredRegion = 'head'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('head')"
            tabindex="-1"
            role="button"
            aria-label="Head"
            @keyup.enter="selectRegion('head')"
          >
            <ellipse cx="150" cy="65" rx="38" ry="46" />
            <text x="150" y="70" class="region-text">Head</text>
          </g>

          <!-- NECK -->
          <g
            id="region-neck"
            class="body-region"
            :class="{ active: hoveredRegion === 'neck' || selectedRegion === 'neck' }"
            @mouseenter="hoveredRegion = 'neck'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('neck')"
            tabindex="-1"
            role="button"
            aria-label="Neck"
            @keyup.enter="selectRegion('neck')"
          >
            <rect x="135" y="112" width="30" height="25" rx="4" />
            <text x="150" y="128" class="region-text-sm">Neck</text>
          </g>

          <!-- CHEST -->
          <g
            id="region-chest"
            class="body-region"
            :class="{ active: hoveredRegion === 'chest' || selectedRegion === 'chest' }"
            @mouseenter="hoveredRegion = 'chest'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('chest')"
            tabindex="-1"
            role="button"
            aria-label="Chest"
            @keyup.enter="selectRegion('chest')"
          >
            <path d="M 98 138 Q 150 142 202 138 L 195 230 Q 150 236 105 230 Z" />
            <text x="150" y="185" class="region-text">Chest</text>
          </g>

          <!-- ABDOMEN -->
          <g
            id="region-abdomen"
            class="body-region"
            :class="{ active: hoveredRegion === 'abdomen' || selectedRegion === 'abdomen' }"
            @mouseenter="hoveredRegion = 'abdomen'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('abdomen')"
            tabindex="-1"
            role="button"
            aria-label="Abdomen"
            @keyup.enter="selectRegion('abdomen')"
          >
            <path d="M 106 232 Q 150 238 194 232 L 188 310 Q 150 316 112 310 Z" />
            <text x="150" y="275" class="region-text">Abdomen</text>
          </g>

          <!-- PELVIS -->
          <g
            id="region-pelvis"
            class="body-region"
            :class="{ active: hoveredRegion === 'pelvis' || selectedRegion === 'pelvis' }"
            @mouseenter="hoveredRegion = 'pelvis'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('pelvis')"
            tabindex="-1"
            role="button"
            aria-label="Pelvis"
            @keyup.enter="selectRegion('pelvis')"
          >
            <path d="M 113 312 Q 150 318 187 312 L 178 355 L 122 355 Z" />
            <text x="150" y="338" class="region-text-sm">Pelvis</text>
          </g>

          <!-- LEFT ARM -->
          <g
            id="region-left-arm"
            class="body-region"
            :class="{ active: hoveredRegion === 'left-arm' || selectedRegion === 'left-arm' }"
            @mouseenter="hoveredRegion = 'left-arm'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('left-arm')"
            tabindex="-1"
            role="button"
            aria-label="Left arm"
            @keyup.enter="selectRegion('left-arm')"
          >
            <rect x="52" y="142" width="40" height="135" rx="16" transform="rotate(8 72 209)" />
            <ellipse cx="40" cy="305" rx="16" ry="20" />
            <text x="64" y="215" class="region-text-sm">Arm</text>
          </g>

          <!-- RIGHT ARM -->
          <g
            id="region-right-arm"
            class="body-region"
            :class="{ active: hoveredRegion === 'right-arm' || selectedRegion === 'right-arm' }"
            @mouseenter="hoveredRegion = 'right-arm'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('right-arm')"
            tabindex="-1"
            role="button"
            aria-label="Right arm"
            @keyup.enter="selectRegion('right-arm')"
          >
            <rect x="208" y="142" width="40" height="135" rx="16" transform="rotate(-8 228 209)" />
            <ellipse cx="260" cy="305" rx="16" ry="20" />
            <text x="236" y="215" class="region-text-sm">Arm</text>
          </g>

          <!-- LEFT LEG -->
          <g
            id="region-left-leg"
            class="body-region"
            :class="{ active: hoveredRegion === 'left-leg' || selectedRegion === 'left-leg' }"
            @mouseenter="hoveredRegion = 'left-leg'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('left-leg')"
            tabindex="-1"
            role="button"
            aria-label="Left leg"
            @keyup.enter="selectRegion('left-leg')"
          >
            <rect x="110" y="360" width="36" height="210" rx="16" />
            <ellipse cx="122" cy="585" rx="18" ry="12" />
            <text x="128" y="465" class="region-text-sm">Leg</text>
          </g>

          <!-- RIGHT LEG -->
          <g
            id="region-right-leg"
            class="body-region"
            :class="{ active: hoveredRegion === 'right-leg' || selectedRegion === 'right-leg' }"
            @mouseenter="hoveredRegion = 'right-leg'"
            @mouseleave="hoveredRegion = null"
            @click="selectRegion('right-leg')"
            tabindex="-1"
            role="button"
            aria-label="Right leg"
            @keyup.enter="selectRegion('right-leg')"
          >
            <rect x="154" y="360" width="36" height="210" rx="16" />
            <ellipse cx="178" cy="585" rx="18" ry="12" />
            <text x="172" y="465" class="region-text-sm">Leg</text>
          </g>
        </svg>

        <!-- Hover label -->
        <div class="map-hint" aria-live="polite">
          <template v-if="hoveredRegion || selectedRegion">
            <v-icon icon="mdi-map-marker" size="14" color="primary" class="me-1" />
            <span class="hint-label">{{ regionLabel(hoveredRegion || selectedRegion) }}</span>
          </template>
          <template v-else>
            <span class="hint-empty">Tap a region to explore</span>
          </template>
        </div>
      </div>

      <!-- Quick-select list -->
      <div class="map-list-col">
        <div class="map-list-label">Or select a region</div>
        <div
          v-for="reg in quickRegions"
          :key="reg.key"
          class="map-list-item"
          :class="{ 'map-list-item--active': selectedRegion === reg.key }"
          tabindex="-1"
          role="button"
          :aria-label="reg.label"
          @click="selectRegion(reg.key)"
          @keyup.enter="selectRegion(reg.key)"
        >
          <v-icon :icon="reg.icon" size="18" class="me-2" color="primary" />
          <span>{{ reg.label }}</span>
          <v-icon icon="mdi-chevron-right" size="16" class="ms-auto" color="grey-lighten-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hoveredRegion = ref(null)
const selectedRegion = ref(null)

const quickRegions = [
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

function regionLabel(key) {
  return regionLabels[key] ?? key.replace('-', ' ')
}

function selectRegion(regionKey) {
  selectedRegion.value = regionKey
  router.push(`/check/${regionKey}`)
}
</script>

<style scoped>
.body-map-wrap {
  max-width: 640px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 32px 28px;
}

.map-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* SVG column */
.map-svg-col {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.body-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Regions */
.body-region {
  cursor: pointer;
  fill: #BFDBFE;
  stroke: #93C5FD;
  stroke-width: 1.5;
  transition: fill 0.15s ease, stroke 0.15s ease;
  outline: none;
}

.body-region:hover,
.body-region.active {
  fill: #2563EB;
  stroke: #1D4ED8;
  stroke-width: 2;
  filter: drop-shadow(0 2px 6px rgba(37, 99, 235, 0.35));
}

.body-region:focus-visible {
  stroke: #F59E0B;
  stroke-width: 3;
}

.region-text,
.region-text-sm {
  fill: #1E3A8A;
  font-family: inherit;
  font-weight: 600;
  text-anchor: middle;
  pointer-events: none;
  user-select: none;
}

.body-region:hover .region-text,
.body-region.active .region-text,
.body-region:hover .region-text-sm,
.body-region.active .region-text-sm {
  fill: #ffffff;
}

.region-text {
  font-size: 13px;
}

.region-text-sm {
  font-size: 11px;
}

/* Hint below SVG */
.map-hint {
  margin-top: 10px;
  min-height: 22px;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.hint-label {
  font-weight: 600;
  color: #2563EB;
}

.hint-empty {
  color: #94A3B8;
}

/* List column */
.map-list-col {
  flex: 1;
  min-width: 0;
}

.map-list-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 8px;
}

.map-list-item {
  display: flex;
  align-items: center;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  transition: background 0.12s ease;
  outline: none;
  user-select: none;
}

.map-list-item:hover {
  background: #F0F4F8;
  color: #2563EB;
}

.map-list-item--active {
  background: #EFF6FF;
  color: #2563EB;
  font-weight: 600;
}

.map-list-item:focus-visible {
  box-shadow: 0 0 0 2px #F59E0B;
}

/* Responsive: stack on small screens */
@media (max-width: 480px) {
  .body-map-wrap {
    padding: 20px 16px;
  }
  .map-layout {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .map-svg-col {
    flex: none;
    width: 180px;
  }
}
</style>
