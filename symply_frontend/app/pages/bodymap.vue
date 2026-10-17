<template>
  <div class="symply-bodymap-page">
    <div class="page-layout">
      <!-- Left Column -->
      <div class="left-pane">
        <h1 class="pane-title">What are your symptoms?</h1>

        <div class="symptom-search-container" ref="searchContainerRef">
          <input
            v-model="searchQuery"
            type="text"
            class="symptom-search-input"
            placeholder="Type your main symptom here"
            autocomplete="off"
            @focus="showSuggestions = true"
            @input="onSearchInput"
            @blur="onSearchBlur"
          />
          <ul v-if="showSuggestions && searchSuggestions.length > 0" class="search-suggestions">
            <li
              v-for="s in searchSuggestions"
              :key="s.id"
              class="search-suggestion-item"
            >
              <span class="search-suggestion-name">{{ s.name }}</span>
              <button class="search-suggestion-add" @click="addFromSearch(s)">
                ADD
              </button>
            </li>
          </ul>
        </div>

        <div class="selected-symptoms">
          <div class="symptoms-bucket">
            <div class="symptoms-bucket-title">My Symptoms</div>

            <template v-if="selectedSymptoms.length">
              <div class="symptoms-bucket-list">
                <div
                  v-for="s in selectedSymptoms"
                  :key="s.id"
                  class="symptoms-bucket-row"
                  @mouseenter="showSymptomDetails(s.name, $event)"
                  @mouseleave="hideSymptomDetails"
                >
                  <span class="symptom-name">{{ s.name }}</span>
                  <button
                    class="symptom-delete"
                    aria-label="Remove"
                    @click="removeSymptom(s.id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="empty-state-box">
                <div class="empty-state-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="28" y="22" width="28" height="36" rx="4" stroke="#d5e5e6" stroke-width="2" fill="#ffffff" />
                    <path d="M34 22V20C34 18.8954 34.8954 18 36 18H48C49.1046 18 50 18.8954 50 20V22" stroke="#d5e5e6" stroke-width="2" />
                    <path d="M34 32L36 34L38 31" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="42" y1="32" x2="50" y2="32" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" />
                    <path d="M34 40L36 42L38 39" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="42" y1="40" x2="50" y2="40" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" />
                    <path d="M34 48L36 50L38 47" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="42" y1="48" x2="48" y2="48" stroke="#d5e5e6" stroke-width="2" stroke-linecap="round" />
                    <path d="M52 14L54 10L56 14L60 16L56 18L54 22L52 18L48 16L52 14Z" fill="#a4d1cc" opacity="0.3" />
                    <circle cx="58" cy="24" r="2" stroke="#a4d1cc" stroke-width="2" />
                    <circle cx="26" cy="50" r="1.5" stroke="#a4d1cc" stroke-width="1.5" />
                  </svg>
                </div>
                <p class="empty-state-text">No symptoms added</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-pane">
        <div class="body-viewer">
          <img
            :src="anatomicalView === 'front' ? '/body-front.svg' : '/body-back.svg'"
            alt="Human body model"
            class="body-image"
          />
          <svg class="body-overlay" :viewBox="anatomicalView === 'front' ? '0 0 560 1204' : '0 0 560 1191'" xmlns="http://www.w3.org/2000/svg">
            <template v-if="anatomicalView === 'front'">
              <circle cx="280" cy="68" r="58" class="body-region" @click="openDrawerForRegion('Head')" />
              <rect x="252" y="126" width="56" height="54" rx="8" class="body-region" @click="openDrawerForRegion('Neck')" />
              <path d="M 140 185 Q 155 195 175 200 L 195 205 L 215 210 L 240 215 L 252 180 L 308 180 L 320 215 L 345 210 L 365 205 L 385 200 Q 405 195 420 185 L 425 195 L 435 225 L 445 270 L 452 330 L 455 390 L 455 420 L 340 430 L 220 430 L 105 420 L 105 390 L 108 330 L 115 270 L 125 225 L 135 195 Z" class="body-region" @click="openDrawerForRegion('Chest')" />
              <path d="M 140 185 L 130 200 Q 110 235 90 290 Q 75 350 68 410 Q 63 470 62 530 Q 62 580 65 620 L 70 650 L 85 655 Q 92 615 98 570 Q 108 510 122 450 Q 138 385 158 325 Q 172 280 188 240 L 198 215 Z" class="body-region" @click="openDrawerForRegion('Arm')" />
              <path d="M 420 185 L 430 200 Q 450 235 470 290 Q 485 350 492 410 Q 497 470 498 530 Q 498 580 495 620 L 490 650 L 475 655 Q 468 615 462 570 Q 452 510 438 450 Q 422 385 402 325 Q 388 280 372 240 L 362 215 Z" class="body-region" @click="openDrawerForRegion('Arm')" />
              <path d="M 220 430 L 340 430 L 338 490 L 335 550 L 330 610 L 325 640 Q 305 645 280 645 Q 255 645 235 640 L 230 610 L 225 550 L 222 490 Z" class="body-region" @click="openDrawerForRegion('Abdomen')" />
              <path d="M 235 640 Q 255 645 280 645 Q 305 645 325 640 L 320 675 L 315 700 Q 298 703 280 703 Q 262 703 245 700 L 240 675 Z" class="body-region" @click="openDrawerForRegion('Pelvis')" />
              <path d="M 200 675 L 215 700 Q 210 750 207 810 Q 203 890 201 970 Q 199 1050 201 1130 L 205 1185 L 285 1195 Q 290 1130 291 1070 Q 292 990 293 910 Q 294 830 294 750 Q 294 703 294 700 L 295 703 L 293 685 Z" class="body-region" @click="openDrawerForRegion('Leg')" />
              <path d="M 267 685 L 265 703 L 266 700 Q 266 703 266 750 Q 266 830 267 910 Q 268 990 269 1070 Q 270 1130 273 1185 L 355 1195 Q 359 1130 359 1070 Q 359 990 357 910 Q 355 830 353 750 Q 350 703 347 700 L 355 675 Z" class="body-region" @click="openDrawerForRegion('Leg')" />
            </template>
            <template v-else>
              <ellipse cx="280" cy="85" rx="60" ry="75" class="body-region" @click="openDrawerForRegion('Head')" />
              <rect x="250" y="145" width="60" height="55" class="body-region" @click="openDrawerForRegion('Neck')" />
              <path d="M 200 210 Q 280 200 360 210 L 340 470 Q 280 480 220 470 Z" class="body-region" @click="openDrawerForRegion('Back')" />
              <path d="M 90 280 Q 100 400 50 620 L 70 640 Q 110 430 150 300 Z" class="body-region" @click="openDrawerForRegion('Arm')" />
              <path d="M 470 280 Q 460 400 510 620 L 490 640 Q 450 430 410 300 Z" class="body-region" @click="openDrawerForRegion('Arm')" />
              <ellipse cx="280" cy="540" rx="70" ry="60" class="body-region" @click="openDrawerForRegion('Buttock')" />
              <rect x="240" y="590" width="80" height="80" class="body-region" @click="openDrawerForRegion('Pelvis/Groin')" />
              <path d="M 190 690 Q 200 900 190 1180 L 285 1185 Q 295 900 285 690 Z" class="body-region" @click="openDrawerForRegion('Leg')" />
              <path d="M 275 690 Q 265 900 275 1180 L 370 1185 Q 380 900 370 690 Z" class="body-region" @click="openDrawerForRegion('Leg')" />
            </template>
          </svg>
        </div>

        <!-- Right side floating controls -->
        <div class="floating-controls">
          <button class="control-btn" @click="toggleView" title="Rotate Body">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21L21.5 8"></path>
            </svg>
          </button>
          <button
            class="control-btn"
            :class="{ 'control-btn--active': activeDrawer === 'browse' }"
            title="Browse Symptoms"
            @click="openDrawer('browse')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button
            class="control-btn text-btn"
            :class="{ 'control-btn--active': activeDrawer === 'skin' }"
            title="Skin Symptoms"
            @click="openDrawer('skin')"
          >
            SKIN
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="action-bar">
      <button class="action-btn prev-btn" @click="goBack">
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Previous
      </button>

      <button class="action-btn next-btn" :disabled="selectedSymptoms.length === 0" @click="goNext">
        Continue
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Left-side Navigation Drawers -->
    <Transition name="drawer-scrim">
      <div v-if="activeDrawer" class="drawer-scrim" @click="closeDrawer"></div>
    </Transition>

    <Transition name="drawer-slide">
      <aside
        v-if="activeDrawer"
        class="side-drawer"
        role="dialog"
        aria-modal="true"
      >
        <!-- General Symptoms drawer -->
        <template v-if="activeDrawer === 'general'">
          <header class="drawer-header">
            <h2 class="drawer-title">General Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-search">
            <v-icon icon="mdi-magnify" size="20" class="drawer-search-icon" />
            <input v-model="generalSearch" type="text" class="drawer-search-input" placeholder="Search all symptoms" />
          </div>

          <div class="drawer-body">
            <ul class="symptom-checklist">
              <li v-for="s in filteredGeneralSymptoms" :key="s.id">
                <label class="symptom-check" @click="selectSingleGeneralSymptom(s)">
                  <input
                    type="radio"
                    :value="s.id"
                    v-model="selectedGeneralSymptomId"
                    class="symptom-check-input"
                    style="display:none"
                  />
                  <span class="symptom-check-box" :class="{ 'symptom-check-box--checked': selectedGeneralSymptomId === s.id }">
                    <v-icon v-if="selectedGeneralSymptomId === s.id" icon="mdi-check" size="16" />
                  </span>
                  <span class="symptom-check-label">{{ s.name }}</span>
                </label>
              </li>
              <li v-if="filteredGeneralSymptoms.length === 0" class="symptom-empty">No symptoms found</li>
            </ul>
          </div>

          <div class="drawer-footer">
            <button class="drawer-add-btn" :disabled="!selectedGeneralSymptomId" @click="showTriageModalForSingleSymptom('general')">
              Add Symptom
            </button>
          </div>
        </template>

        <!-- Skin Symptoms drawer -->
        <template v-else-if="activeDrawer === 'skin'">
          <header class="drawer-header">
            <h2 class="drawer-title">Skin Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-search">
            <v-icon icon="mdi-magnify" size="20" class="drawer-search-icon" />
            <input
              v-model="skinSearch"
              type="text"
              class="drawer-search-input"
              placeholder="Search all skin symptoms"
            />
          </div>

          <div class="drawer-tabs">
            <button
              class="drawer-tab"
              :class="{ 'drawer-tab--active': skinTab === 'all' }"
              @click="skinTab = 'all'"
            >
              All
            </button>
            <button
              class="drawer-tab"
              :class="{ 'drawer-tab--active': skinTab === 'common' }"
              @click="skinTab = 'common'"
            >
              Common
            </button>
          </div>

          <div class="drawer-body">
            <ul class="symptom-checklist">
              <li v-for="s in filteredSkinSymptoms" :key="s.id">
                <label class="symptom-check" @click="selectSingleSkinSymptom(s)">
                  <input
                    type="radio"
                    :value="s.id"
                    v-model="selectedSkinSymptomId"
                    class="symptom-check-input"
                    style="display:none"
                  />
                  <span class="symptom-check-box" :class="{ 'symptom-check-box--checked': selectedSkinSymptomId === s.id }">
                    <v-icon v-if="selectedSkinSymptomId === s.id" icon="mdi-check" size="16" />
                  </span>
                  <span class="symptom-check-label">{{ s.name }}</span>
                </label>
              </li>
              <li v-if="filteredSkinSymptoms.length === 0" class="symptom-empty">No symptoms found</li>
            </ul>
          </div>

          <div class="drawer-footer">
            <button class="drawer-add-btn" :disabled="!selectedSkinSymptomId" @click="showTriageModalForSingleSymptom('skin')">
              Add Symptom
            </button>
          </div>
        </template>

        <!-- Head Symptoms drawer -->
        <template v-else-if="activeDrawer === 'head'">
          <header class="drawer-header">
            <h2 class="drawer-title">Head Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-search">
            <v-icon icon="mdi-magnify" size="20" class="drawer-search-icon" />
            <input v-model="headSearch" type="text" class="drawer-search-input" placeholder="Search head symptoms" />
          </div>

          <div class="drawer-tabs">
            <button class="drawer-tab" :class="{ 'drawer-tab--active': headTab === 'all' }" @click="headTab = 'all'">
              All
            </button>
            <button class="drawer-tab" :class="{ 'drawer-tab--active': headTab === 'common' }" @click="headTab = 'common'">
              Common
            </button>
          </div>

          <div class="drawer-body">
            <ul class="symptom-checklist">
              <li v-for="s in filteredHeadSymptoms" :key="s.id">
                <label class="symptom-check" @click="selectSingleHeadSymptom(s)">
                  <input
                    type="radio"
                    :value="s.id"
                    v-model="selectedHeadSymptomId"
                    class="symptom-check-input"
                    style="display:none"
                  />
                  <span class="symptom-check-box" :class="{ 'symptom-check-box--checked': selectedHeadSymptomId === s.id }">
                    <v-icon v-if="selectedHeadSymptomId === s.id" icon="mdi-check" size="16" />
                  </span>
                  <span class="symptom-check-label">{{ s.name }}</span>
                </label>
              </li>
              <li v-if="filteredHeadSymptoms.length === 0" class="symptom-empty">No symptoms found</li>
            </ul>
          </div>

          <div class="drawer-footer">
            <button class="drawer-add-btn" :disabled="!selectedHeadSymptomId" @click="showTriageModalForSingleSymptom('head')">
              Add Symptom
            </button>
          </div>
        </template>

        <!-- Front Body Part Symptoms drawer -->
        <template v-else-if="activeDrawer === 'front'">
          <header class="drawer-header">
            <h2 class="drawer-title">{{ frontBodyPart }} Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-search">
            <v-icon icon="mdi-magnify" size="20" class="drawer-search-icon" />
            <input v-model="frontSearch" type="text" class="drawer-search-input" :placeholder="`Search ${frontBodyPart.toLowerCase()} symptoms`" />
          </div>

          <div class="drawer-tabs">
            <button class="drawer-tab" :class="{ 'drawer-tab--active': frontTab === 'all' }" @click="frontTab = 'all'">
              All
            </button>
            <button class="drawer-tab" :class="{ 'drawer-tab--active': frontTab === 'common' }" @click="frontTab = 'common'">
              Common
            </button>
          </div>

          <div class="drawer-body">
            <ul class="symptom-checklist">
              <li v-for="s in filteredFrontSymptoms" :key="s.id">
                <label class="symptom-check" @click="selectSingleFrontSymptom(s)">
                  <input
                    type="radio"
                    :value="s.id"
                    v-model="selectedFrontSymptomId"
                    class="symptom-check-input"
                    style="display:none"
                  />
                  <span class="symptom-check-box" :class="{ 'symptom-check-box--checked': selectedFrontSymptomId === s.id }">
                    <v-icon v-if="selectedFrontSymptomId === s.id" icon="mdi-check" size="16" />
                  </span>
                  <span class="symptom-check-label">{{ s.name }}</span>
                </label>
              </li>
              <li v-if="filteredFrontSymptoms.length === 0" class="symptom-empty">No symptoms found</li>
            </ul>
          </div>

          <div class="drawer-footer">
            <button class="drawer-add-btn" :disabled="!selectedFrontSymptomId" @click="showTriageModalForSingleSymptom('front')">
              Add Symptom
            </button>
          </div>
        </template>

        <!-- Back Body Part Symptoms drawer -->
        <template v-else-if="activeDrawer === 'back'">
          <header class="drawer-header">
            <h2 class="drawer-title">{{ backBodyPart }} Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-search">
            <v-icon icon="mdi-magnify" size="20" class="drawer-search-icon" />
            <input v-model="backSearch" type="text" class="drawer-search-input" :placeholder="`Search ${backBodyPart.toLowerCase()} symptoms`" />
          </div>

          <div class="drawer-tabs">
            <button class="drawer-tab" :class="{ 'drawer-tab--active': backTab === 'all' }" @click="backTab = 'all'">
              All
            </button>
            <button class="drawer-tab" :class="{ 'drawer-tab--active': backTab === 'common' }" @click="backTab = 'common'">
              Common
            </button>
          </div>

          <div class="drawer-body">
            <ul class="symptom-checklist">
              <li v-for="s in filteredBackSymptoms" :key="s.id">
                <label class="symptom-check" @click="selectSingleBackSymptom(s)">
                  <input
                    type="radio"
                    :value="s.id"
                    v-model="selectedBackSymptomId"
                    class="symptom-check-input"
                    style="display:none"
                  />
                  <span class="symptom-check-box" :class="{ 'symptom-check-box--checked': selectedBackSymptomId === s.id }">
                    <v-icon v-if="selectedBackSymptomId === s.id" icon="mdi-check" size="16" />
                  </span>
                  <span class="symptom-check-label">{{ s.name }}</span>
                </label>
              </li>
              <li v-if="filteredBackSymptoms.length === 0" class="symptom-empty">No symptoms found</li>
            </ul>
          </div>

          <div class="drawer-footer">
            <button class="drawer-add-btn" :disabled="!selectedBackSymptomId" @click="showTriageModalForSingleSymptom('back')">
              Add Symptom
            </button>
          </div>
        </template>

        <!-- Browse Symptoms drawer -->
        <template v-else-if="activeDrawer === 'browse'">
          <header class="drawer-header">
            <h2 class="drawer-title">Browse Symptoms</h2>
            <button class="drawer-close" aria-label="Close" @click="closeDrawer">
              <v-icon icon="mdi-close" size="22" />
            </button>
          </header>

          <div class="drawer-body">
            <ul class="browse-list">
              <li><button type="button" class="browse-item" @click="openGeneralSymptoms"><span class="browse-item-label">General Symptoms</span><v-icon icon="mdi-chevron-right" size="20" class="browse-item-arrow" /></button></li>
              <li><button type="button" class="browse-item" @click="openDrawer('skin')"><span class="browse-item-label">Skin Symptoms</span><v-icon icon="mdi-chevron-right" size="20" class="browse-item-arrow" /></button></li>
            </ul>

            <div class="browse-section-label">Body List</div>

            <ul class="browse-list">
              <li v-for="area in bodyAreas" :key="area">
                <button type="button" class="browse-item" @click="openDrawerForRegion(area)">
                  <span class="browse-item-label">{{ area }}</span>
                  <v-icon icon="mdi-chevron-right" size="20" class="browse-item-arrow" />
                </button>
              </li>
            </ul>
          </div>
        </template>
      </aside>
    </Transition>

    <!-- Triage Question Modal - Multi-step follow-up -->
    <Transition name="drawer-scrim">
      <div v-if="showTriageModal" class="triage-modal-overlay" @click="closeTriageModal">
        <div class="triage-modal" @click.stop>
          <!-- Header -->
          <div class="triage-modal-header">
            <v-icon icon="mdi-stethoscope" size="24" color="#06B6D4" />
            <h2 class="triage-modal-title">Tell Us More</h2>
          </div>

          <!-- Progress Indicator -->
          <div v-if="currentStepIndex < followUpSteps.length - 1" class="triage-progress">
            Step {{ currentStepIndex + 1 }} of {{ followUpSteps.length }}
          </div>

          <!-- Modal Body - Dynamic Question Content -->
          <div class="triage-modal-body">
            <p v-if="currentStepIndex < followUpSteps.length" class="triage-modal-text">
              {{ followUpSteps[currentStepIndex]?.question }}
            </p>

            <!-- Duration Step -->
            <div v-if="followUpSteps[currentStepIndex]?.type === 'duration'" class="triage-options">
              <label
                v-for="option in durationOptions"
                :key="option.value"
                class="triage-option-label"
              >
                <input
                  type="radio"
                  :value="option.value"
                  v-model="triageAnswer"
                  name="triageDuration"
                />
                <span class="triage-option-text">{{ option.label }}</span>
              </label>
            </div>

            <!-- Severity Step -->
            <div v-if="followUpSteps[currentStepIndex]?.type === 'severity'" class="triage-options">
              <label
                v-for="option in severityOptions"
                :key="option.value"
                class="triage-option-label"
              >
                <input
                  type="radio"
                  :value="option.value"
                  v-model="triageAnswer"
                  name="triageSeverity"
                />
                <span class="triage-option-text">{{ option.label }}</span>
              </label>
            </div>

            <!-- Warning Signs Step -->
            <div v-if="followUpSteps[currentStepIndex]?.type === 'warning-signs'" class="triage-options">
              <label
                v-for="option in warningSignOptions"
                :key="option.value"
                class="triage-option-label"
              >
                <input
                  type="radio"
                  :value="option.value"
                  v-model="selectedWarningSign"
                  name="triageWarningSigns"
                />
                <span class="triage-option-text">{{ option.label }}</span>
              </label>
            </div>

            <!-- Warning Details Step (text input) -->
            <div v-if="followUpSteps[currentStepIndex]?.type === 'text'">
              <textarea
                v-model="warningDetails"
                class="triage-text-input"
                placeholder="Describe your symptoms..."
                rows="4"
              />
            </div>

            <!-- Risk Factors Step -->
            <div v-if="followUpSteps[currentStepIndex]?.type === 'risk-factors'" class="triage-options">
              <label
                v-for="option in riskFactorOptions"
                :key="option.value"
                class="triage-option-label"
              >
                <input
                  type="radio"
                  :value="option.value"
                  v-model="triageAnswer"
                  name="triageRiskFactors"
                />
                <span class="triage-option-text">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="triage-modal-footer">
            <button @click="closeTriageModal" class="triage-modal-btn triage-cancel-btn">
              Cancel
            </button>

            <!-- Back Button (if not first step) -->
            <button
              v-if="currentStepIndex > 0"
              @click="goToPreviousStep"
              class="triage-modal-btn triage-back-btn"
            >
              Back
            </button>

            <!-- Next / Add Symptom Button -->
            <button
              v-if="currentStepIndex >= followUpSteps.length || canAddSymptom"
              @click="addSingleSymptom"
              class="triage-modal-btn triage-continue-btn"
            >
              Add Symptom
              <v-icon icon="mdi-check" size="20" />
            </button>

            <button
              v-else-if="canGoNext"
              @click="goToNextStep"
              class="triage-modal-btn triage-continue-btn"
            >
              Next
              <v-icon icon="mdi-chevron-right" size="20" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Triage Flow Modals (Emergency/Urgent) -->
    <Transition name="drawer-scrim">
      <div v-if="flowState.isOpen" class="triage-modal-overlay" :class="`${getFlowTheme()}-overlay`" @click="cancelTriageFlow"></div>
    </Transition>

    <Transition name="triage-pop">
      <aside
        v-if="flowState.isOpen"
        class="triage-modal"
        :class="getFlowTheme()"
        role="dialog"
        aria-modal="true"
      >
        <div class="triage-modal-header" :class="`${getFlowTheme()}-header`">
          <v-icon v-if="getFlowTheme() === 'emergency'" icon="mdi-alert-circle-outline" size="24" />
          <v-icon v-else icon="mdi-clock-alert-outline" size="24" />
          <h2 class="triage-modal-title">{{ getStepTitle() }}</h2>
        </div>

        <div class="triage-modal-body">
          <div v-html="getStepContent()" class="triage-flow-content"></div>
        </div>

        <div class="triage-modal-footer">
          <button @click="cancelTriageFlow" class="triage-modal-btn triage-cancel-btn">
            Cancel
          </button>

          <button
            v-if="flowState.step !== 'caution'"
            @click="previousStep"
            class="triage-modal-btn triage-back-btn"
          >
            Back
          </button>

          <button
            v-if="flowState.step !== 'summary'"
            @click="nextStep"
            class="triage-modal-btn triage-continue-btn"
          >
            Next
            <v-icon icon="mdi-chevron-right" size="20" />
          </button>

          <button
            v-if="flowState.step === 'summary'"
            @click="finishFlow"
            class="triage-modal-btn triage-continue-btn"
          >
            Finish
            <v-icon icon="mdi-check" size="20" />
          </button>
        </div>
      </aside>
    </Transition>

    <!-- Floating Symptom Details Panel -->
    <Transition name="panel-fade">
      <div
        v-if="showSymptomDetailsPanel"
        class="symptom-details-panel"
        :style="{ top: symptomDetailsPosition.top + 'px', left: symptomDetailsPosition.left + 'px' }"
      >
        <div class="panel-header">
          <v-icon icon="mdi-stethoscope" size="20" color="#06B6D4" />
          <h3 class="panel-title">Symptom Details</h3>
        </div>
        <div class="panel-content">
          <div v-if="symptomDetails" class="details-container">
            <p class="panel-symptom-name">{{ symptomDetails.Symptom_Name }}</p>

            <div class="details-section" v-if="symptomDetails.Description">
              <p class="section-label">Description</p>
              <p class="section-text">{{ symptomDetails.Description }}</p>
            </div>

            <div class="details-section" v-if="symptomDetails.Red_Flags_and_Warning_Signs">
              <p class="section-label">Red Flags & Warning Signs</p>
              <p class="section-text">{{ symptomDetails.Red_Flags_and_Warning_Signs }}</p>
            </div>
          </div>
          <div v-else class="loading-state">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="#06B6D4" stroke-width="4" opacity="0.2"/>
              <path class="spinner-path" d="M12 2C12 2 16 6 16 12" stroke="#06B6D4" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <p class="loading-text">Loading details...</p>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFollowUpQuestions } from '~/composables/useFollowUpQuestions'
import { useStrapi } from '~/composables/useStrapi'
import { useTriageFlow } from '~/composables/useTriageFlow'
import { evaluateTriage } from '~/composables/useTriage'
import type { FollowUpStep } from '~/composables/useFollowUpQuestions'

const router = useRouter()
const searchQuery = ref('')
const showSuggestions = ref(false)
/* Template ref for the search box container (used by "General Symptoms" to
   focus the global symptom search, which spans every body part). */
const searchContainerRef = ref<HTMLElement | null>(null)
const anatomicalView = ref('front')

/* ── User profile state ── */
const userAge = ref<string | null>(null)
const userSex = ref<string | null>(null)
const userLocation = ref<string | null>(null)

/* ── Shared selected-symptoms state ── */
const selectedSymptoms = ref([])

/* ── Drawer state ── */
const activeDrawer = ref(null)

/* ── Follow-up questions ── */
const { currentStepIndex, answers, getQuestionsForSymptom, getNextStep, isComplete, reset: resetFollowUp } = useFollowUpQuestions()
const followUpSteps = ref<FollowUpStep[]>([])
const triageAnswer = ref('')
const selectedWarningSign = ref<string | null>(null)
const warningDetails = ref('')

// Follow-up question options
const durationOptions = [
  { label: 'Less than 24 hours', value: 'less_24h' },
  { label: '1-3 days', value: '1_3_days' },
  { label: 'More than a week', value: 'more_than_week' },
  { label: 'More than a month', value: 'more_than_month' },
]

const severityOptions = [
  { label: 'Mild', value: 'mild' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Severe', value: 'severe' },
]

const warningSignOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

/* ── Triage modal state (single symptom) ── */
const showTriageModal = ref(false)
const currentSymptomName = ref('')
const triageModalSource = ref(null)
const selectedSearchSymptom = ref(null)
const selectedBodyPart = ref(null)

const riskFactorOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

/* ── Triage Flow State (Emergency/Urgent) ── */
const { flowState, openFlow, closeFlow, nextStep, previousStep, getFlowTheme, getStepTitle, getStepContent } = useTriageFlow()

/* ── Symptom Details Panel state ── */
const showSymptomDetailsPanel = ref(false)
const symptomDetailsPosition = ref({ top: 0, left: 0 })
const symptomDetails = ref(null)
const hoveredSymptomName = ref('')
const symptomDetailsCache = ref({})

/* ── Skin Symptoms (radio selection - single) ── */
const skinSearch = ref('')
const skinTab = ref('all')
const selectedSkinSymptomId = ref(null)
const skinSymptoms = ref([])

async function fetchSkinSymptoms() {
  try {
    const response = await fetch('http://localhost:1337/api/abdomen-stomaches?filters[Body_Part][$eq]=Skin&pagination[limit]=100&populate=*')
    if (!response.ok) { console.error('Failed to fetch skin symptoms:', response.statusText); skinSymptoms.value = []; return }
    const data = await response.json()
    skinSymptoms.value = (data.data || []).map(item => ({
      id: item.id,
      name: item.Symptom_Name || 'Unnamed Symptom',
      description: item.Description || '',
      anatomicalArea: item.Anatomical_Area || '',
      associatedSymptoms: item.Associated_Symptoms || '',
      redFlags: item.Red_Flags_and_Warning_Signs || '',
      initialManagement: item.Initial_Management || '',
      whenToSeekCare: item.When_to_Seek_Care || '',
      common: true,
      sourceBodyPart: 'Skin'
    }))
  } catch (error) { console.error('Error fetching skin symptoms:', error); skinSymptoms.value = [] }
}

const filteredSkinSymptoms = computed(() => {
  const q = skinSearch.value.trim().toLowerCase()
  return skinSymptoms.value.filter(s => {
    const matchesTab = skinTab.value === 'all' || s.common
    const matchesQuery = !q || s.name.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
})

function selectSingleSkinSymptom(s) {
  selectedSkinSymptomId.value = s.id
}

/* ── Head Symptoms (radio selection - single) ── */
const headSymptoms = ref([])
const headSearch = ref('')
const headTab = ref('all')
const selectedHeadSymptomId = ref(null)
const filteredHeadSymptoms = computed(() => {
  const q = headSearch.value.trim().toLowerCase()
  return headSymptoms.value.filter(s => {
    const matchesTab = headTab.value === 'all' || s.common
    const matchesQuery = !q || s.name.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
})

function selectSingleHeadSymptom(s) {
  selectedHeadSymptomId.value = s.id
}

/* ── Front Body Part Symptoms ── */
const frontSymptoms = ref([])
const frontSearch = ref('')
const frontTab = ref('all')
const frontBodyPart = ref('')
const selectedFrontSymptomId = ref(null)
const filteredFrontSymptoms = computed(() => {
  const q = frontSearch.value.trim().toLowerCase()
  return frontSymptoms.value.filter(s => {
    const matchesTab = frontTab.value === 'all' || s.common
    const matchesQuery = !q || s.name.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
})

function selectSingleFrontSymptom(s) {
  selectedFrontSymptomId.value = s.id
}

/* ── Back Body Part Symptoms ── */
const backSymptoms = ref([])
const backSearch = ref('')
const backTab = ref('all')
const backBodyPart = ref('')
const selectedBackSymptomId = ref(null)
const filteredBackSymptoms = computed(() => {
  const q = backSearch.value.trim().toLowerCase()
  return backSymptoms.value.filter(s => {
    const matchesTab = backTab.value === 'all' || s.common
    const matchesQuery = !q || s.name.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
})

function selectSingleBackSymptom(s) {
  selectedBackSymptomId.value = s.id
}

/* ── All symptoms from Strapi for search autocomplete ── */
const allSymptoms = ref([])
const searchLoading = ref(false)

async function fetchAllSymptoms() {
  try {
    searchLoading.value = true
    const response = await fetch('http://localhost:1337/api/abdomen-stomaches?pagination[limit]=1000')
    if (!response.ok) { console.error('Failed to fetch symptoms:', response.statusText); allSymptoms.value = []; return }
    const data = await response.json()
    if (!data.data || data.data.length === 0) { allSymptoms.value = []; return }
    const uniqueSymptoms = new Map()
    data.data.forEach(item => {
      const name = item.Symptom_Name
      if (name && !uniqueSymptoms.has(name)) uniqueSymptoms.set(name, { id: item.id, name: name })
    })
    allSymptoms.value = Array.from(uniqueSymptoms.values())
  } catch (error) {
    console.error('Error fetching symptoms:', error)
    allSymptoms.value = []
  } finally {
    searchLoading.value = false
  }
}

const searchSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q || allSymptoms.value.length === 0) return []
  const startsWithQuery = [], containsQuery = []
  for (const symptom of allSymptoms.value) {
    const nameLower = symptom.name.toLowerCase()
    if (nameLower.startsWith(q)) startsWithQuery.push(symptom)
    else if (nameLower.includes(q)) containsQuery.push(symptom)
  }
  return [...startsWithQuery, ...containsQuery].slice(0, 10)
})

async function addFromSearch(symptom) {
  // Fetch full details for the selected symptom
  try {
    const response = await fetch(`http://localhost:1337/api/abdomen-stomaches?filters[Symptom_Name][$eq]=${encodeURIComponent(symptom.name)}&pagination[limit]=1&populate=*`)
    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const fullSymptom = data.data[0]
        selectedSearchSymptom.value = {
          id: fullSymptom.id,
          name: fullSymptom.Symptom_Name,
          anatomicalArea: fullSymptom.Anatomical_Area || '',
          description: fullSymptom.Description || '',
          associatedSymptoms: fullSymptom.Associated_Symptoms || '',
          redFlags: fullSymptom.Red_Flags_and_Warning_Signs || '',
          initialManagement: fullSymptom.Initial_Management || '',
          whenToSeekCare: fullSymptom.When_to_Seek_Care || '',
          sourceBodyPart: fullSymptom.Body_Part || ''
        }
      } else {
        selectedSearchSymptom.value = symptom
      }
    } else {
      selectedSearchSymptom.value = symptom
    }
  } catch (error) {
    console.error('Error fetching symptom details:', error)
    selectedSearchSymptom.value = symptom
  }

  currentSymptomName.value = symptom.name
  triageModalSource.value = 'search'
  followUpSteps.value = getQuestionsForSymptom(selectedSearchSymptom.value)
  currentStepIndex.value = 0
  answers.value = {}
  triageAnswer.value = ''
  selectedWarningSign.value = null
  warningDetails.value = ''
  showTriageModal.value = true
}

/* ── Body region drawers ── */
async function fetchHeadSymptoms() {
  try {
    const response = await fetch('http://localhost:1337/api/abdomen-stomaches?filters[Body_Part][$eq]=Head&pagination[limit]=100&populate=*')
    if (!response.ok) { console.error('Failed to fetch head symptoms:', response.statusText); headSymptoms.value = []; return }
    const data = await response.json()
    headSymptoms.value = (data.data || []).map(item => ({
      id: item.id,
      name: item.Symptom_Name || 'Unnamed Symptom',
      description: item.Description || '',
      anatomicalArea: item.Anatomical_Area || '',
      associatedSymptoms: item.Associated_Symptoms || '',
      redFlags: item.Red_Flags_and_Warning_Signs || '',
      initialManagement: item.Initial_Management || '',
      whenToSeekCare: item.When_to_Seek_Care || '',
      common: true,
      sourceBodyPart: 'Head'
    }))
  } catch (error) { console.error('Error fetching head symptoms:', error); headSymptoms.value = [] }
}

async function fetchFrontSymptoms(bodyPart) {
  try {
    const response = await fetch(`http://localhost:1337/api/abdomen-stomaches?filters[Body_Part][$eq]=${encodeURIComponent(bodyPart)}&pagination[limit]=100&populate=*`)
    if (!response.ok) { console.error(`Failed to fetch ${bodyPart} symptoms:`, response.statusText); frontSymptoms.value = []; return }
    const data = await response.json()
    frontSymptoms.value = (data.data || []).map(item => ({
      id: item.id,
      name: item.Symptom_Name || 'Unnamed Symptom',
      description: item.Description || '',
      anatomicalArea: item.Anatomical_Area || '',
      associatedSymptoms: item.Associated_Symptoms || '',
      redFlags: item.Red_Flags_and_Warning_Signs || '',
      initialManagement: item.Initial_Management || '',
      whenToSeekCare: item.When_to_Seek_Care || '',
      common: true,
      sourceBodyPart: bodyPart
    }))
  } catch (error) { console.error(`Error fetching ${bodyPart} symptoms:`, error); frontSymptoms.value = [] }
}

async function fetchBackSymptoms(bodyPart) {
  try {
    const response = await fetch(`http://localhost:1337/api/abdomen-stomaches?filters[Body_Part][$eq]=${encodeURIComponent(bodyPart)}&pagination[limit]=100&populate=*`)
    if (!response.ok) { console.error(`Failed to fetch ${bodyPart} symptoms:`, response.statusText); backSymptoms.value = []; return }
    const data = await response.json()
    backSymptoms.value = (data.data || []).map(item => ({
      id: item.id,
      name: item.Symptom_Name || 'Unnamed Symptom',
      description: item.Description || '',
      anatomicalArea: item.Anatomical_Area || '',
      associatedSymptoms: item.Associated_Symptoms || '',
      redFlags: item.Red_Flags_and_Warning_Signs || '',
      initialManagement: item.Initial_Management || '',
      whenToSeekCare: item.When_to_Seek_Care || '',
      common: true,
      sourceBodyPart: bodyPart
    }))
  } catch (error) { console.error(`Error fetching ${bodyPart} symptoms:`, error); backSymptoms.value = [] }
}

/* ── Browse Symptoms drawer ── */
const bodyAreas = ['Head', 'Neck', 'Chest', 'Abdomen', 'Pelvis', 'Back', 'Shoulder', 'Arm', 'Hand', 'Buttock', 'Leg', 'Knee', 'Foot', 'Skin']

/* ── General Symptoms drawer ── */
const generalSearch = ref('')
const generalSymptoms = ref([])
const selectedGeneralSymptomId = ref(null)

async function fetchGeneralSymptoms() {
  try {
    const response = await fetch('http://localhost:1337/api/abdomen-stomaches?pagination[limit]=1000&populate=*')
    if (!response.ok) {
      console.error('Failed to fetch general symptoms:', response.statusText)
      generalSymptoms.value = []
      return
    }

    const data = await response.json()
    const uniqueSymptoms = new Map()

    ;(data.data || []).forEach((item) => {
      const name = item.Symptom_Name
      if (!name || uniqueSymptoms.has(name)) return
      uniqueSymptoms.set(name, {
        id: item.id,
        name,
        description: item.Description || '',
        anatomicalArea: item.Anatomical_Area || '',
        associatedSymptoms: item.Associated_Symptoms || '',
        redFlags: item.Red_Flags_and_Warning_Signs || '',
        initialManagement: item.Initial_Management || '',
        whenToSeekCare: item.When_to_Seek_Care || '',
        sourceBodyPart: item.Body_Part || '',
      })
    })

    generalSymptoms.value = Array.from(uniqueSymptoms.values())
  } catch (error) {
    console.error('Error fetching general symptoms:', error)
    generalSymptoms.value = []
  }
}

const filteredGeneralSymptoms = computed(() => {
  const q = generalSearch.value.trim().toLowerCase()
  return generalSymptoms.value.filter((s) => !q || s.name.toLowerCase().includes(q))
})

function selectSingleGeneralSymptom(s) {
  selectedGeneralSymptomId.value = s.id
}

/* ── Drawer open functions ── */
function openDrawer(name) {
  activeDrawer.value = name
}

function closeDrawer() {
  activeDrawer.value = null
  // Reset radio selections when closing
  selectedGeneralSymptomId.value = null
  selectedSkinSymptomId.value = null
  selectedHeadSymptomId.value = null
  selectedFrontSymptomId.value = null
  selectedBackSymptomId.value = null
}

/* Maps the friendly "Body List" labels shown in the Browse drawer to the
   actual Strapi Body_Part values. Only the body regions that exist in the live
   Strapi dataset are included here; the legacy label set included regions that
   had no matching records and therefore opened empty drawers. */
const BODY_LIST_MAP = {
  Head: { bodyPart: 'Head', view: 'head' },
  Neck: { bodyPart: 'Neck', view: 'front' },
  Chest: { bodyPart: 'Chest', view: 'front' },
  Abdomen: { bodyPart: 'Abdomen/Stomach', view: 'front' },
  Pelvis: { bodyPart: 'Pelvis/Groin', view: 'front' },
  Back: { bodyPart: 'Back', view: 'back' },
  Shoulder: { bodyPart: 'Shoulder', view: 'front' },
  Arm: { bodyPart: 'Arm', view: 'front' },
  Hand: { bodyPart: 'Hand', view: 'front' },
  Buttock: { bodyPart: 'Buttock', view: 'back' },
  Leg: { bodyPart: 'Leg', view: 'front' },
  Knee: { bodyPart: 'Knee', view: 'front' },
  Foot: { bodyPart: 'Foot', view: 'front' },
  Skin: { bodyPart: 'Skin', view: 'skin' },
}

function openDrawerForRegion(region) {
  const entry = BODY_LIST_MAP[region]
  if (!entry) return

  if (entry.view === 'head') {
    fetchHeadSymptoms()
    openDrawer('head')
  } else if (entry.view === 'front') {
    fetchFrontSymptoms(entry.bodyPart)
    frontBodyPart.value = entry.bodyPart
    openDrawer('front')
  } else if (entry.view === 'back') {
    fetchBackSymptoms(entry.bodyPart)
    backBodyPart.value = entry.bodyPart
    openDrawer('back')
  }
}

async function openGeneralSymptoms() {
  await fetchGeneralSymptoms()
  selectedGeneralSymptomId.value = null
  generalSearch.value = ''
  openDrawer('general')
}

/* ── Triage modal functions (single symptom) ── */
function showTriageModalForSingleSymptom(source) {
  let symptom = null

  if (source === 'general') {
    symptom = generalSymptoms.value.find(s => s.id === selectedGeneralSymptomId.value)
  } else if (source === 'skin') {
    symptom = skinSymptoms.value.find(s => s.id === selectedSkinSymptomId.value)
  } else if (source === 'head') {
    symptom = headSymptoms.value.find(s => s.id === selectedHeadSymptomId.value)
  } else if (source === 'front') {
    symptom = frontSymptoms.value.find(s => s.id === selectedFrontSymptomId.value)
  } else if (source === 'back') {
    symptom = backSymptoms.value.find(s => s.id === selectedBackSymptomId.value)
  }

  if (symptom) {
    currentSymptomName.value = symptom.name
    triageModalSource.value = source
    followUpSteps.value = getQuestionsForSymptom(symptom)
    currentStepIndex.value = 0
    answers.value = {}
    triageAnswer.value = ''
    selectedWarningSign.value = null
    warningDetails.value = ''
    showTriageModal.value = true
  }
}

function closeTriageModal() {
  showTriageModal.value = false
  triageAnswer.value = ''
  currentSymptomName.value = ''
  currentStepIndex.value = 0
  answers.value = {}
  followUpSteps.value = []
  selectedWarningSign.value = null
  warningDetails.value = ''
}

/* ── Helper to extract plain text from rich text/JSON ── */
function extractBlockText(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (Array.isArray(val)) {
    return val
      .map((node) => {
        if (node.children) {
          return node.children.map((c) => c.text || '').join('')
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }
  return String(val)
}

// ── Follow-up step navigation ──

function goToNextStep() {
  const currentStep = followUpSteps.value[currentStepIndex.value]

  // Save the answer
  if (currentStep?.type === 'duration') {
    answers.value.duration = triageAnswer.value
  } else if (currentStep?.type === 'severity') {
    answers.value.severity = triageAnswer.value as 'mild' | 'moderate' | 'severe'
  } else if (currentStep?.type === 'warning-signs') {
    answers.value.warningSigns = selectedWarningSign.value === 'yes'
    answers.value.warningSignDetails = selectedWarningSign.value === 'yes' ? warningDetails.value : ''
  } else if (currentStep?.type === 'risk-factors') {
    answers.value.riskFactors = triageAnswer.value === 'yes'
    answers.value.riskFactorDetails = triageAnswer.value === 'yes' ? warningDetails.value : ''
  } else if (currentStep?.type === 'text') {
    answers.value.warningSignDetails = warningDetails.value
  }

  // Branch to the Emergency/Urgent assessment flow immediately when the user
  // selects Moderate or Severe on the severity step.
  if (currentStep?.type === 'severity') {
    const picked = answers.value.severity
    if (picked === 'severe' || picked === 'moderate') {
      startTriageFlow(picked)
      return
    }
  }

  // Safety escalation: severity is only an initial branch. If the answers
  // collected so far (warning-sign details, risk factors) indicate an
  // emergency or urgent situation, escalate now — even for a Mild rating.
  // Checked after the details/risk-factor answers are recorded so the
  // normal Mild flow keeps its questions. Severe/Moderate never reach this
  // point because they branch above.
  const mayEscalate = currentStep?.type === 'text'
    || currentStep?.type === 'risk-factors'
  if (mayEscalate) {
    const symptom = getSymptomForSource()
    if (symptom) {
      const result = evaluateTriage(symptom, answers.value)
      if (result.level === 'emergency' || result.level === 'urgent') {
        startTriageFlow(result.level)
        return
      }
    }
  }

  // Move to next visible step or finish
  const symptom = getSymptomForSource()
  let nextIndex = -1
  for (let i = currentStepIndex.value + 1; i < followUpSteps.value.length; i++) {
    const step = followUpSteps.value[i]
    if (!step.showIf || step.showIf(answers.value, symptom)) {
      nextIndex = i
      break
    }
  }
  if (nextIndex !== -1) {
    currentStepIndex.value = nextIndex
    // Reset input for the new step
    triageAnswer.value = ''
    selectedWarningSign.value = null
    warningDetails.value = ''
  } else {
    // No more steps — advance past end so Add Symptom button shows
    currentStepIndex.value = followUpSteps.value.length
  }
}

/* Open the Emergency/Urgent assessment flow from the questionnaire.
   Accepts either the severity value ('severe'/'moderate') or the triage
   level ('emergency'/'urgent') so it can be used for both the severity
   branch and the warning-sign escalation. */
function startTriageFlow(level) {
  const symptom = getSymptomForSource()
  if (!symptom) return

  // Collect only the answers actually provided so far
  const followUpData: any = {}
  if (answers.value.duration) followUpData.duration = answers.value.duration
  if (answers.value.severity) followUpData.severity = answers.value.severity
  if (answers.value.warningSigns !== undefined) followUpData.warningSigns = answers.value.warningSigns
  if (answers.value.warningSignDetails) followUpData.warningSignDetails = answers.value.warningSignDetails
  if (answers.value.riskFactors !== undefined) followUpData.riskFactors = answers.value.riskFactors
  if (answers.value.riskFactorDetails) followUpData.riskFactorDetails = answers.value.riskFactorDetails

  const symptomWithAnswers = {
    ...symptom,
    followUpAnswers: followUpData
  }

  // Close the questionnaire so the assessment flow is the next visible screen
  showTriageModal.value = false
  openFlow(level === 'severe' || level === 'emergency' ? 'emergency' : 'urgent', symptomWithAnswers, followUpData)
}

/* Cancelling the flow returns the user to the questionnaire without
   adding a symptom or erasing the answers already given */
function cancelTriageFlow() {
  closeFlow()
  const symptom = getSymptomForSource()
  if (symptom) {
    // currentStepIndex still points at the severity step; restore the chosen
    // answer for display and reopen the questionnaire where it was left off.
    triageAnswer.value = answers.value.severity || ''
    showTriageModal.value = true
  } else {
    closeTriageModal()
  }
}

function goToPreviousStep() {
  const symptom = getSymptomForSource()
  for (let i = currentStepIndex.value - 1; i >= 0; i--) {
    const step = followUpSteps.value[i]
    if (!step.showIf || step.showIf(answers.value, symptom)) {
      currentStepIndex.value = i
      triageAnswer.value = ''
      selectedWarningSign.value = null
      warningDetails.value = ''
      return
    }
  }
}

function getSymptomForSource() {
  if (triageModalSource.value === 'skin') {
    return skinSymptoms.value.find(s => s.id === selectedSkinSymptomId.value)
  } else if (triageModalSource.value === 'head') {
    return headSymptoms.value.find(s => s.id === selectedHeadSymptomId.value)
  } else if (triageModalSource.value === 'front') {
    return frontSymptoms.value.find(s => s.id === selectedFrontSymptomId.value)
  } else if (triageModalSource.value === 'back') {
    return backSymptoms.value.find(s => s.id === selectedBackSymptomId.value)
  } else if (triageModalSource.value === 'search') {
    return selectedSearchSymptom.value
  }
  return null
}

const currentStepAnswered = computed(() => {
  const currentStep = followUpSteps.value[currentStepIndex.value]
  if (!currentStep) return false

  switch (currentStep.type) {
    case 'duration':
      return !!triageAnswer.value
    case 'severity':
      return !!triageAnswer.value
    case 'warning-signs':
      return !!selectedWarningSign.value
    case 'text':
    case 'risk-factors':
      return true
    default:
      return false
  }
})

const hasMoreSteps = computed(() => {
  const symptom = getSymptomForSource()
  const currentStep = followUpSteps.value[currentStepIndex.value]
  const pendingAnswers = { ...answers.value }
  if (currentStep?.type === 'warning-signs') {
    pendingAnswers.warningSigns = selectedWarningSign.value === 'yes'
  } else if (currentStep?.type === 'risk-factors') {
    pendingAnswers.riskFactors = triageAnswer.value === 'yes'
  }
  for (let i = currentStepIndex.value + 1; i < followUpSteps.value.length; i++) {
    const step = followUpSteps.value[i]
    if (!step.showIf || step.showIf(pendingAnswers, symptom)) return true
  }
  return false
})

const canGoNext = computed(() => currentStepAnswered.value && hasMoreSteps.value)

const canAddSymptom = computed(() => currentStepAnswered.value && !hasMoreSteps.value)

function addSingleSymptom() {
  /* Persist the answer from the current step first. When this button
     appears on the severity step (symptoms without further follow-up
     questions), goToNextStep never runs, so answers.value would stay
     empty and a Moderate/Severe rating would be treated as Mild. */
  const currentStep = followUpSteps.value[currentStepIndex.value]
  if (currentStep?.type === 'duration') {
    answers.value.duration = triageAnswer.value
  } else if (currentStep?.type === 'severity') {
    answers.value.severity = triageAnswer.value as 'mild' | 'moderate' | 'severe'
  } else if (currentStep?.type === 'warning-signs') {
    answers.value.warningSigns = selectedWarningSign.value === 'yes'
    answers.value.warningSignDetails = selectedWarningSign.value === 'yes' ? warningDetails.value : ''
  } else if (currentStep?.type === 'risk-factors') {
    answers.value.riskFactors = triageAnswer.value === 'yes'
    answers.value.riskFactorDetails = triageAnswer.value === 'yes' ? warningDetails.value : ''
  } else if (currentStep?.type === 'text') {
    answers.value.warningSignDetails = warningDetails.value
  }

  let symptom = null

  if (triageModalSource.value === 'skin') {
    symptom = skinSymptoms.value.find(s => s.id === selectedSkinSymptomId.value)
  } else if (triageModalSource.value === 'head') {
    symptom = headSymptoms.value.find(s => s.id === selectedHeadSymptomId.value)
  } else if (triageModalSource.value === 'front') {
    symptom = frontSymptoms.value.find(s => s.id === selectedFrontSymptomId.value)
  } else if (triageModalSource.value === 'back') {
    symptom = backSymptoms.value.find(s => s.id === selectedBackSymptomId.value)
  } else if (triageModalSource.value === 'search') {
    symptom = selectedSearchSymptom.value
  }

  if (symptom) {
    // Store answers from the follow-up flow
    const followUpData: any = {}

    if (answers.value.duration) followUpData.duration = answers.value.duration
    if (answers.value.severity) followUpData.severity = answers.value.severity
    if (answers.value.warningSigns !== undefined) followUpData.warningSigns = answers.value.warningSigns
    if (answers.value.warningSignDetails) followUpData.warningSignDetails = answers.value.warningSignDetails
    if (answers.value.riskFactors !== undefined) followUpData.riskFactors = answers.value.riskFactors
    if (answers.value.riskFactorDetails) followUpData.riskFactorDetails = answers.value.riskFactorDetails

    // Check severity to determine flow
    const severity = answers.value.severity

    if (severity === 'severe') {
      // Emergency flow
      const symptomWithAnswers = {
        ...symptom,
        followUpAnswers: followUpData
      }
      openFlow('emergency', symptomWithAnswers, followUpData)
      // Don't add to selectedSymptoms yet - will be added after flow completes
    } else if (severity === 'moderate') {
      // Urgent flow
      const symptomWithAnswers = {
        ...symptom,
        followUpAnswers: followUpData
      }
      openFlow('urgent', symptomWithAnswers, followUpData)
      // Don't add to selectedSymptoms yet - will be added after flow completes
    } else {
      // Mild - continue with existing behavior (add directly)
      selectedSymptoms.value.push({
        id: symptom.id,
        name: symptom.name,
        triageAnswer: triageAnswer.value || (answers.value.duration || answers.value.severity || ''),
        followUpAnswers: followUpData,
        anatomicalArea: symptom.anatomicalArea || '',
        description: extractBlockText(symptom.description) || '',
        associatedSymptoms: extractBlockText(symptom.associatedSymptoms) || '',
        redFlags: extractBlockText(symptom.redFlags) || '',
        initialManagement: extractBlockText(symptom.initialManagement) || '',
        whenToSeekCare: extractBlockText(symptom.whenToSeekCare) || '',
        sourceBodyPart: symptom.sourceBodyPart || ''
      })
    }
  }

  // Reset and close
  selectedSearchSymptom.value = null
  closeTriageModal()
  closeDrawer()
}

/* Finish the Emergency/Urgent assessment: preserve the collected
   answers and assessment results, end the assessment, and return
   the user to the first Info page */
function finishFlow() {
  if (flowState.value.symptom && flowState.value.answers) {
    const symptom = flowState.value.symptom
    const followUpData = flowState.value.answers

    selectedSymptoms.value.push({
      id: symptom.id,
      name: symptom.name,
      triageAnswer: followUpData.severity || followUpData.duration || '',
      followUpAnswers: followUpData,
      anatomicalArea: symptom.anatomicalArea || '',
      description: extractBlockText(symptom.description) || '',
      associatedSymptoms: extractBlockText(symptom.associatedSymptoms) || '',
      redFlags: extractBlockText(symptom.redFlags) || '',
      initialManagement: extractBlockText(symptom.initialManagement) || '',
      whenToSeekCare: extractBlockText(symptom.whenToSeekCare) || '',
      sourceBodyPart: symptom.sourceBodyPart || ''
    })

    // Preserve the assessment results for the rest of the session
    try {
      localStorage.setItem('selectedSymptoms', JSON.stringify(selectedSymptoms.value))
    } catch (e) { /* storage unavailable */ }
  }

  // Clear transient state so the next assessment cannot reuse stale data
  selectedSearchSymptom.value = null
  answers.value = {}
  triageModalSource.value = null
  closeFlow()
  closeDrawer()

  // End the assessment and return to the first Info page
  router.push('/')
}

/* ── Remove symptom ── */
function removeSymptom(id) {
  selectedSymptoms.value = selectedSymptoms.value.filter(s => s.id !== id)
  // Clear symptom details panel state
  symptomDetails.value = null
  hoveredSymptomName.value = ''
  showSymptomDetailsPanel.value = false
}

/* ── Symptom Details Panel ── */
// Get symptom details from the selectedSymptoms cache (no API call needed)
function getSymptomDetails(symptomName) {
  const symptom = selectedSymptoms.value.find(s => s.name === symptomName)
  if (!symptom) return null

  // Return the stored details in the format expected by the panel
  return {
    Symptom_Name: symptom.name,
    Description: extractBlockText(symptom.description) || '',
    Red_Flags_and_Warning_Signs: extractBlockText(symptom.redFlags) || ''
  }
}

function showSymptomDetails(symptomName, event) {
  hoveredSymptomName.value = symptomName
  const rect = event.target.getBoundingClientRect()

  // Position the panel to the right of the symptom, within viewport
  const panelWidth = 400
  const panelHeight = 320
  const margin = 10

  let left = rect.right + margin
  let top = rect.top

  // Check if panel would go off right edge
  if (left + panelWidth > window.innerWidth - 20) {
    left = rect.left - panelWidth - margin
  }

  // Check if panel would go off bottom edge
  if (top + panelHeight > window.innerHeight - 20) {
    top = window.innerHeight - panelHeight - 20
  }

  // Ensure top doesn't go negative
  top = Math.max(20, top)

  symptomDetailsPosition.value = { top, left }

  showSymptomDetailsPanel.value = true
  symptomDetails.value = getSymptomDetails(symptomName)
}

function hideSymptomDetails() {
  showSymptomDetailsPanel.value = false
  symptomDetails.value = null
  hoveredSymptomName.value = ''
}

/* ── Other functions ── */
function handleKeydown(e) {
  if (e.key === 'Escape' && activeDrawer.value) closeDrawer()
}

function toggleView() {
  anatomicalView.value = anatomicalView.value === 'front' ? 'back' : 'front'
}

function onSearchInput() { showSuggestions.value = true }
function onSearchBlur() { setTimeout(() => { showSuggestions.value = false }, 150) }

function goBack() {
  router.push('/')
}

function goNext() {
  if (selectedSymptoms.value.length > 0) {
    localStorage.setItem('selectedSymptoms', JSON.stringify(selectedSymptoms.value))
    // Set flag to indicate we're going to results page
    sessionStorage.setItem('returningFromResult', 'true')
    router.push('/what-you-can-do')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  loadUserProfile()
  restoreSelectedSymptoms()
  fetchAllSymptoms()
  fetchSkinSymptoms()
})

/* Load user profile from localStorage */
function loadUserProfile() {
  try {
    userAge.value = localStorage.getItem('symply_user_age')
    userSex.value = localStorage.getItem('symply_user_sex')
    userLocation.value = localStorage.getItem('symply_user_address')
  } catch (e) {
    console.error('Failed to load user profile:', e)
  }
}

/* Restore previously selected symptoms (e.g. when returning from
   "What You Can Do" via "Back to Symptoms") so state is preserved.
   Only restores when returning from result page, clears otherwise. */
function restoreSelectedSymptoms() {
  try {
    // Check if we're returning from "What You Can Do" page
    const returningFromResult = sessionStorage.getItem('returningFromResult')

    const stored = localStorage.getItem('selectedSymptoms')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Only restore if returning from result page
        if (returningFromResult) {
          selectedSymptoms.value = parsed
        }
        // If not returning from result, clear localStorage to start fresh
        if (!returningFromResult) {
          localStorage.removeItem('selectedSymptoms')
        }
      }
    }

    // Clear the flag after restoring (if we had one)
    if (returningFromResult) {
      sessionStorage.removeItem('returningFromResult')
    }
  } catch (e) {
    console.error('Failed to restore selected symptoms:', e)
  }
}
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

useHead({ title: 'Symply — Body Map' })
</script>

<style scoped>
.symply-bodymap-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #FFFFFF 0%, #F8FAFB 100%);
  color: #1E293B;
  font-family: var(--font-family, system-ui, -apple-system, sans-serif);
}

.page-layout { flex: 1; display: flex; width: 100%; max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; box-sizing: border-box; }

.left-pane { flex: 1; max-width: 50%; padding-right: 3rem; display: flex; flex-direction: column; }
.pane-title { font-size: 1.8rem; font-weight: 600; color: #1E293B; margin-bottom: 2rem; }

.symptom-search-container { margin-bottom: 2rem; position: relative; }
.search-suggestions {
  list-style: none; padding: 0; margin: 0.5rem 0 0; border: 1px solid #E2E8F0; border-radius: 8px; background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); overflow: hidden; position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
}
.search-suggestion-item {
  display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; gap: 1rem; cursor: pointer; font-size: 0.95rem; color: #1E293B;
}
.search-suggestion-item + .search-suggestion-item { border-top: 1px solid #E2E8F0; }
.search-suggestion-item:hover { background: #F8FAFC; }
.search-suggestion-add {
  flex-shrink: 0; background: transparent; border: none; color: #06B6D4; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s;
}
.search-suggestion-add:hover { background: #F0FDFF; color: #0B4F8F; }

.symptom-search-input {
  width: 100%; padding: 1.25rem 1.5rem; font-size: 1.05rem; color: var(--symply-text-primary); border: 2px solid var(--symply-border);
  border-radius: 8px; outline: none; background-color: var(--symply-card-bg); transition: all 0.2s;
}
.symptom-search-input::placeholder { color: var(--symply-text-muted); }
.symptom-search-input:focus { border-color: #06B6D4; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1); }
.symptom-search-input:-webkit-autofill,
.symptom-search-input:-webkit-autofill:hover,
.symptom-search-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--symply-text-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--symply-card-bg) inset;
  caret-color: var(--symply-text-primary);
}

.empty-state-box {
  background-color: #FFFFFF; border: 2px dashed #E2E8F0; border-radius: 12px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 3rem 2rem; margin-top: 1rem; flex: 1;
}
.empty-state-icon { margin-bottom: 1.5rem; opacity: 0.6; }
.empty-state-text { font-size: 1.05rem; color: #64748B; font-weight: 500; }

.selected-symptoms { margin-bottom: 2rem; }
.symptoms-bucket {
  background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem 1.5rem; min-height: 280px; display: flex; flex-direction: column;
}
.symptoms-bucket-list {
  flex: 1; overflow-y: auto; max-height: 210px; padding-right: 0.5rem;
}
.symptoms-bucket-list::-webkit-scrollbar { width: 6px; }
.symptoms-bucket-list::-webkit-scrollbar-track { background: transparent; }
.symptoms-bucket-list::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }
.symptoms-bucket-title { font-size: 1rem; font-weight: 600; color: #1E293B; margin-bottom: 0.75rem; }
.symptoms-bucket-row {
  display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; gap: 1rem;
}
.symptoms-bucket-row:not(:last-child) { border-bottom: 1px solid #E2E8F0; }
.symptoms-bucket-row .symptom-name { font-size: 0.95rem; color: #1E293B; }
.symptom-delete {
  display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent;
  color: #94A3B8; border-radius: 6px; cursor: pointer; padding: 0; transition: all 0.15s;
}
.symptom-delete:hover { background: #FEE2E2; color: #EF4444; }

.right-pane { flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.body-viewer { position: relative; width: 100%; max-width: 320px; }
.body-image { width: 100%; height: auto; display: block; user-select: none; }
.body-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; user-select: none; }
.body-region {
  fill: transparent; stroke: transparent; stroke-width: 0; cursor: pointer; pointer-events: all;
  user-select: none;
}

.floating-controls {
  position: absolute; right: -2rem; top: 2rem; display: flex; flex-direction: column; gap: 1rem;
}
.control-btn {
  width: 48px; height: 48px; background-color: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
  user-select: none;
}
.control-btn:hover { border-color: #06B6D4; background-color: #F0FDFF; }
.text-btn { font-size: 0.75rem; font-weight: 600; color: #64748B; letter-spacing: 0.5px; }
.text-btn:hover { color: #0B4F8F; }
.text-btn.control-btn--active { color: #0B4F8F; }
.control-btn--active { border-color: #06B6D4; background-color: #F0FDFF; }

.action-bar {
  display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; border-top: 1px solid #E2E8F0; background-color: #FFFFFF;
}
.action-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1.05rem; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s;
  user-select: none;
}
.prev-btn { background-color: transparent; color: #64748B; border: 2px solid #E2E8F0; }
.prev-btn:hover { background-color: #F8FAFC; color: #1E293B; border-color: #CBD5E1; }
.next-btn { background-color: #E2E8F0; color: #94A3B8; border: none; padding: 0.75rem 2.5rem; }
.next-btn:not(:disabled) {
  background: linear-gradient(135deg, #0B4F8F 0%, #06B6D4 100%); color: #FFFFFF; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}
.next-btn:not(:disabled):hover { box-shadow: 0 6px 16px rgba(6, 182, 212, 0.3); transform: translateY(-1px); }
.next-btn:disabled { cursor: not-allowed; }

/* Drawer styles */
.drawer-scrim { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.25); z-index: 1900; }
.drawer-scrim-enter-active, .drawer-scrim-leave-active { transition: opacity 0.25s ease; }
.drawer-scrim-enter-from, .drawer-scrim-leave-to { opacity: 0; }
.side-drawer {
  position: fixed; top: 0; left: 0; bottom: 0; width: 400px; max-width: 90vw; background: var(--symply-card-bg); z-index: 2000;
  display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
}
.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(-100%); }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid var(--symply-border); }
.drawer-title { font-size: 1.25rem; font-weight: 700; color: var(--symply-text-primary); margin: 0; }
.drawer-close {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; background: transparent; color: var(--symply-text-muted);
  border-radius: 8px; cursor: pointer; transition: all 0.15s ease;
}
.drawer-close:hover { background: var(--symply-bg-app); color: var(--symply-text-primary); }
.drawer-search { display: flex; align-items: center; gap: 8px; margin: 16px 20px 12px; padding: 0 12px; border: 2px solid var(--symply-border); border-radius: 10px; background: var(--symply-card-bg); transition: all 0.2s; }
.drawer-search:focus-within { border-color: #06B6D4; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1); }
.drawer-search-icon { color: var(--symply-text-muted); flex-shrink: 0; }
.drawer-search-input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; padding: 11px 0; font-size: 0.95rem; color: var(--symply-text-primary); }
.drawer-search-input::placeholder { color: var(--symply-text-muted); }
.drawer-search-input:-webkit-autofill,
.drawer-search-input:-webkit-autofill:hover,
.drawer-search-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--symply-text-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--symply-card-bg) inset;
  caret-color: var(--symply-text-primary);
}
.drawer-tabs { display: flex; gap: 8px; padding: 4px 20px 14px; border-bottom: 1px solid var(--symply-border); }
.drawer-tab {
  flex: 1; padding: 8px 12px; font-size: 0.9rem; font-weight: 600; color: var(--symply-text-secondary); background: var(--symply-bg-app); border: none; border-radius: 8px; cursor: pointer; transition: all 0.15s ease;
}
.drawer-tab:hover { color: var(--symply-primary); }
.drawer-tab--active { color: #FFFFFF; background: #2563EB; }
.drawer-body { flex: 1; overflow-y: auto; padding: 8px 12px 12px; }
.symptom-checklist { list-style: none; margin: 0; padding: 0; }
.symptom-check { display: flex; align-items: center; gap: 12px; padding: 12px 8px; border-radius: 8px; cursor: pointer; transition: background 0.12s ease; }
.symptom-check:hover { background: var(--symply-primary-light); }
.symptom-check-input { position: absolute; opacity: 0; width: 0; height: 0; }
.symptom-check-box {
  flex-shrink: 0; width: 22px; height: 22px; border: 2px solid var(--symply-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #FFFFFF; transition: all 0.15s ease;
}
.symptom-check-box--checked { background: #2563EB; border-color: #2563EB; }
.symptom-check-input:focus-visible + .symptom-check-box { outline: 2px solid #F59E0B; outline-offset: 2px; }
.symptom-check-label { font-size: 0.95rem; color: var(--symply-text-primary); }
.symptom-empty { padding: 28px 8px; text-align: center; color: var(--symply-text-muted); font-size: 0.9rem; }
.drawer-footer { padding: 16px 20px; border-top: 1px solid var(--symply-border); }
.drawer-add-btn {
  width: 100%; padding: 14px; font-size: 1rem; font-weight: 600; color: #FFFFFF; background: linear-gradient(135deg, #0B4F8F 0%, #06B6D4 100%);
  border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}
.drawer-add-btn:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(6, 182, 212, 0.3); transform: translateY(-1px); }
.drawer-add-btn:disabled { background: var(--symply-border); color: var(--symply-text-muted); cursor: not-allowed; box-shadow: none; }
.browse-list { list-style: none; margin: 0 0 8px; padding: 0; }
.browse-item {
  width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 15px 12px; border: none; background: transparent; border-radius: 8px; cursor: pointer; text-align: left; transition: background 0.12s ease;
}
.browse-item:hover { background: var(--symply-primary-light); }
.browse-item-label { font-size: 0.98rem; font-weight: 500; color: var(--symply-text-primary); }
.browse-item-arrow { color: var(--symply-text-muted); flex-shrink: 0; }
.browse-section-label { padding: 14px 12px 8px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--symply-text-muted); }

/* Triage Modal Styles */
.triage-modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 1950;
  display: flex; align-items: center; justify-content: center; padding: 2rem;
}
.triage-modal-overlay-enter-active, .triage-modal-overlay-leave-active { transition: opacity 0.25s ease; }
.triage-modal-overlay-enter-from, .triage-modal-overlay-leave-to { opacity: 0; }
.triage-modal {
  background: var(--symply-card-bg); border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
}
.triage-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
.triage-modal-title { font-size: 1.25rem; font-weight: 600; color: var(--symply-text-primary); margin: 0; }
.triage-modal-body { margin-bottom: 2rem; }
.triage-modal-text { color: var(--symply-text-secondary); font-size: 1rem; line-height: 1.5; margin: 0 0 1.5rem 0; }
.triage-options { display: flex; flex-direction: column; gap: 10px; }
.triage-option-label {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--symply-bg-app); border: 2px solid var(--symply-border); border-radius: 10px; cursor: pointer; transition: all 0.2s;
}
.triage-option-label:hover { border-color: var(--symply-primary); }
.triage-option-label input[type="radio"] { width: 18px; height: 18px; accent-color: var(--symply-primary); }
.triage-option-text { color: var(--symply-text-primary); font-size: 0.95rem; }
.triage-modal-footer { display: flex; gap: 12px; justify-content: flex-end; }
.triage-modal-btn { padding: 12px 24px; border-radius: 8px; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; border: none; }
.triage-cancel-btn { background: var(--symply-bg-app); color: var(--symply-text-secondary); }
.triage-cancel-btn:hover { background: var(--symply-border); }
.triage-back-btn { background: var(--symply-border); color: var(--symply-text-secondary); }
.triage-back-btn:hover { background: var(--symply-primary-light); }
.triage-continue-btn { background: #06B6D4; color: white; }
.triage-continue-btn:hover:not(:disabled) { background: #0891B2; }
.triage-continue-btn:disabled { background: var(--symply-border); color: var(--symply-text-muted); cursor: not-allowed; }

/* Multi-step Progress */
.triage-progress {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--symply-text-muted);
  margin-bottom: 1rem;
  text-align: right;
}

/* Text input for warning details */
.triage-text-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--symply-text-primary);
  background: var(--symply-card-bg);
  border: 2px solid var(--symply-border);
  border-radius: 10px;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.triage-text-input::placeholder { color: var(--symply-text-muted); }

.triage-text-input:-webkit-autofill,
.triage-text-input:-webkit-autofill:hover,
.triage-text-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--symply-text-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--symply-card-bg) inset;
  caret-color: var(--symply-text-primary);
}

.triage-text-input:focus {
  border-color: #06B6D4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

/* Symptom Details Panel Styles */
.symptom-details-panel {
  position: fixed;
  width: 480px;
  max-width: 92vw;
  min-width: 400px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.16);
  z-index: 1960;
  overflow: hidden;
  animation: panel-slide-in 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes panel-slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
}
.panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  letter-spacing: -0.01em;
}
.panel-content {
  padding: 24px;
  max-height: 420px;
  overflow-y: auto;
}
.panel-content::-webkit-scrollbar { width: 8px; }
.panel-content::-webkit-scrollbar-track { background: #F8FAFC; }
.panel-content::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 8px;
  border: 3px solid #F8FAFC;
}
.panel-symptom-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0B4F8F;
  margin: 0 0 20px 0;
  line-height: 1.2;
}
.details-section { margin-bottom: 24px; }
.details-section:last-child { margin-bottom: 0; }
.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748B;
  margin: 0 0 8px 0;
  background: #F1F5F9;
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
}
.section-text {
  font-size: 0.98rem;
  color: #334155;
  line-height: 1.65;
  margin: 0;
  white-space: pre-wrap;
}
.section-text strong {
  color: #0B4F8F;
  font-weight: 600;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.spinner {
  width: 40px;
  height: 40px;
  animation: spinner-rotate 1s linear infinite;
}
@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}
.spinner-circle {
  fill: none;
}
.spinner-path {
  fill: none;
  stroke-dasharray: 75;
  stroke-dashoffset: 0;
  animation: spinner-dash 1.5s ease-in-out infinite;
}
@keyframes spinner-dash {
  0% { stroke-dashoffset: 75; }
  50% { stroke-dashoffset: 18.75; }
  100% { stroke-dashoffset: 75; }
}
.loading-text {
  font-size: 0.9rem;
  color: #64748B;
  margin-top: 16px;
  font-weight: 500;
}

.panel-fade-enter-active, .panel-fade-leave-active { transition: opacity 0.15s ease; }
.panel-fade-enter-from, .panel-fade-leave-to { opacity: 0; }

/* Triage Flow Modal Styles (Emergency/Urgent) — matches existing assessment modal */
/* Keep the same neutral scrim as the existing assessment modal so the whole
   page never turns red/orange; the theme colour lives on the modal itself. */
.emergency-overlay,
.urgent-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 1950;
}

/* Emergency theme */
.triage-modal.emergency {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 2000;
  display: flex; flex-direction: column;
  background: white; border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px;
  max-height: 90vh; overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18); border: 2px solid #FECACA;
}
.triage-modal.emergency .triage-modal-header { color: #DC2626; }
.triage-modal.emergency .triage-modal-header .v-icon { color: #DC2626; }
.triage-modal.emergency .triage-modal-title { color: #DC2626; }
.triage-modal.emergency .map-close:hover { background: #FEF2F2; color: #DC2626; }
.triage-modal.emergency .triage-continue-btn { background: #DC2626; color: white; }
.triage-modal.emergency .triage-continue-btn:hover:not(:disabled) { background: #B91C1C; }

/* Urgent theme */
.triage-modal.urgent {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 2000;
  display: flex; flex-direction: column;
  background: white; border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px;
  max-height: 90vh; overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18); border: 2px solid #FDE68A;
}
.triage-modal.urgent .triage-modal-header { color: #D97706; }
.triage-modal.urgent .triage-modal-header .v-icon { color: #D97706; }
.triage-modal.urgent .triage-modal-title { color: #D97706; }
.triage-modal.urgent .map-close:hover { background: #FFFBEB; color: #D97706; }
.triage-modal.urgent .triage-continue-btn { background: #D97706; color: white; }
.triage-modal.urgent .triage-continue-btn:hover:not(:disabled) { background: #B45309; }

/* Content typography */
.triage-flow-content { color: #475569; font-size: 1rem; line-height: 1.6; max-width: 100%; overflow-wrap: anywhere; word-break: break-word; }
.triage-flow-content h4 { margin: 1.5rem 0 0.75rem; font-size: 1rem; font-weight: 600; }
.triage-flow-content h4:first-child { margin-top: 0; }
.triage-modal.emergency .triage-flow-content h4 { color: #DC2626; }
.triage-modal.urgent .triage-flow-content h4 { color: #D97706; }
.triage-flow-content p { margin: 0 0 1rem; }
.triage-flow-content p:last-child { margin-bottom: 0; }
.triage-flow-content ul { margin: 0.25rem 0 1rem; padding-left: 1.5rem; }
.triage-flow-content li { margin-bottom: 0.75rem; }
.triage-flow-content li:last-child { margin-bottom: 0; }
.triage-flow-content .action-section { margin-bottom: 1.5rem; }
.triage-flow-content .action-section:last-child { margin-bottom: 0; }
.triage-flow-content .caution-message { font-size: 1.05rem; font-weight: 600; margin: 0 0 1rem 0; line-height: 1.5; }
.triage-modal.emergency .caution-message { color: #DC2626; }
.triage-modal.urgent .caution-message { color: #D97706; }
.triage-flow-content .symptom-info { margin: 0 0 1rem 0; }
.triage-flow-content .symptom-info strong { color: #1E293B; }
.triage-flow-content .caution-details { margin: 0 0 1rem 0; }
.triage-flow-content .emergency-instruction {
  background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 1rem; margin: 1rem 0;
}
.triage-modal.urgent .emergency-instruction { background: #FFFBEB; border-color: #FDE68A; }
.triage-flow-content .emergency-instruction p { margin: 0 0 0.5rem 0; }
.triage-flow-content .emergency-instruction p:last-child { margin-bottom: 0; }

/* Facility list */
.triage-flow-content .facilities-loading,
.triage-flow-content .facilities-error,
.triage-flow-content .facilities-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2.5rem 1.5rem; text-align: center; color: #64748B;
}
.triage-flow-content .facilities-loading p { margin-top: 1rem; }
.triage-flow-content .retry-btn {
  margin-top: 1rem; padding: 12px 24px; background: #06B6D4; color: white; border: none;
  border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.95rem;
}
.triage-flow-content .retry-btn:hover { background: #0891B2; }
.triage-flow-content .facilities-count { font-size: 0.9rem; font-weight: 600; color: #64748B; margin: 0 0 1rem 0; }
.triage-flow-content .facility-items { display: flex; flex-direction: column; gap: 12px; }
.triage-flow-content .facility-item {
  padding: 1rem 1.25rem; background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 10px; transition: all 0.2s;
}
.triage-modal.emergency .triage-flow-content .facility-item:hover { border-color: #FCA5A5; }
.triage-modal.urgent .triage-flow-content .facility-item:hover { border-color: #FCD34D; }
.triage-flow-content .facility-name { font-weight: 600; color: #1E293B; margin: 0 0 0.5rem 0; font-size: 0.95rem; }
.triage-flow-content .facility-rows { display: flex; flex-direction: column; gap: 0.35rem; }
.triage-flow-content .facility-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: #64748B; line-height: 1.45; }
.triage-flow-content .facility-row-icon { flex-shrink: 0; width: 15px; height: 15px; margin-top: 1px; color: #94A3B8; }
.triage-flow-content .facility-row--phone { color: #06B6D4; font-weight: 500; }
.triage-flow-content .facility-row--phone .facility-row-icon { color: #06B6D4; }
.triage-flow-content .facility-row--distance { color: #94A3B8; font-size: 0.8rem; }

/* Summary content */
.triage-flow-content .assessment-summary { padding: 0; }
.triage-flow-content .assessment-summary.emergency-summary { background: transparent; border: none; border-radius: 0; }
.triage-flow-content .assessment-summary.urgent-summary { background: transparent; border: none; border-radius: 0; }
.triage-flow-content .summary-row { display: flex; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #E2E8F0; align-items: flex-start; }
.triage-flow-content .summary-row:last-child { border-bottom: none; }
.triage-flow-content .summary-label { flex-shrink: 0; min-width: 130px; font-weight: 600; color: #64748B; font-size: 0.9rem; }
.triage-flow-content .summary-value { flex: 1; color: #1E293B; font-size: 0.9rem; line-height: 1.5; }
.triage-flow-content .triage-emergency { color: #DC2626; font-weight: 700; }
.triage-flow-content .triage-urgent { color: #D97706; font-weight: 700; }
.triage-flow-content .triage-routine { color: #16A34A; font-weight: 700; }
.triage-flow-content .summary-recommendation { margin: 1rem 0 0 0; padding: 1rem; border-radius: 10px; font-size: 0.95rem; line-height: 1.6; }
.triage-flow-content .emergency-summary .summary-recommendation { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
.triage-flow-content .urgent-summary .summary-recommendation { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }

/* Scrollable body on long content */
.triage-modal.emergency .triage-modal-body,
.triage-modal.urgent .triage-modal-body {
  max-height: 60vh; overflow-y: auto; margin-bottom: 1.5rem;
}
/* Hide the scrollbar but keep scrolling enabled (cross-browser) */
.triage-modal.emergency .triage-modal-body,
.triage-modal.urgent .triage-modal-body {
  scrollbar-width: none;        /* Firefox */
  -ms-overflow-style: none;     /* IE / old Edge */
}
.triage-modal.emergency .triage-modal-body::-webkit-scrollbar,
.triage-modal.urgent .triage-modal-body::-webkit-scrollbar { display: none; width: 0; height: 0; }

/* Triage flow modal open/close animation (fade + scale, keeps centering) */
.triage-pop-enter-active,
.triage-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.triage-pop-enter-from,
.triage-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.97);
}

@media (max-width: 768px) {
  .triage-modal.emergency, .triage-modal.urgent {
    width: calc(100% - 2rem); padding: 1.5rem;
  }
  .triage-modal.emergency .triage-modal-body,
  .triage-modal.urgent .triage-modal-body { max-height: 55vh; }
}
</style>

<style>
/* ─── Night mode overrides for Body Map page ────────────────────────────────────
     These cover elements that still carry fixed hex colors which would stay
     light in dark mode (symptom search, selected symptoms, region drawers,
     triage modal, summary drawer, map, charts, buttons). */
:root[data-theme='dark'] .symply-bodymap-page {
  background: var(--symply-bg-app);
}
:root[data-theme='dark'] .pane-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .symptom-search-input {
  background: var(--symply-card-bg);
  border: 2px solid var(--symply-border);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .symptom-search-input:focus {
  border-color: var(--symply-primary);
  box-shadow: 0 0 0 3px var(--symply-primary-light);
}
:root[data-theme='dark'] .symptom-search-input::placeholder {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .search-suggestion-item {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .search-suggestion-item:hover {
  background: var(--symply-primary-light);
}
:root[data-theme='dark'] .search-suggestion-item .search-suggestion-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .selected-symptoms .symptoms-bucket-row {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .selected-symptoms .symptoms-bucket-row:hover {
  border-color: var(--symply-primary);
}
:root[data-theme='dark'] .selected-symptoms .symptoms-bucket-row .symptom-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .selected-symptoms .symptoms-bucket-row .symptom-delete {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .selected-symptoms .symptoms-bucket-row .symptom-delete:hover {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .empty-state-box {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-overlay {
  background: rgba(0, 0, 0, 0.55);
}
:root[data-theme='dark'] .summary-modal-header {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-header .summary-icon {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-header .summary-icon .summary-icon-label {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-body {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-body .summary-symptom-item {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-body .summary-symptom-item .summary-symptom-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-body .summary-symptom-item .summary-symptom-part {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .summary-modal-body .summary-modal-close {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-body .summary-modal-close:hover {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .summary-modal-footer {
  background: var(--symply-card-bg);
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .summary-modal-footer .summary-modal-cancel,
:root[data-theme='dark'] .summary-modal-footer .summary-modal-cancel:hover,
:root[data-theme='dark'] .summary-modal-footer .summary-modal-confirm,
:root[data-theme='dark'] .summary-modal-footer .summary-modal-confirm:hover {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .region-drawer-scrim {
  background: rgba(0, 0, 0, 0.5);
}
:root[data-theme='dark'] .region-drawer {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .region-drawer .region-drawer-header {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .region-drawer .region-drawer-footer {
  background: var(--symply-card-bg);
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .region-drawer .region-drawer-row {
  border-bottom-color: var(--symply-border);
}
:root[data-theme='dark'] .region-drawer .region-drawer-row:hover {
  background: var(--symply-primary-light);
}
:root[data-theme='dark'] .region-drawer .region-drawer-row .region-drawer-row-label {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .region-drawer .region-drawer-row .region-drawer-row-sublabel {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .region-drawer .region-drawer-row .region-drawer-row-badge {
  background: var(--symply-primary-light);
  color: var(--symply-primary);
}
</style>

/* The triage modal body is rendered with v-html, and Vue scoped styles
  cannot reach v-html-injected DOM (no data-v-* attribute is stamped onto raw
  innerHTML). This global block guarantees the facility rows and their inline
  SVG icons are sized and laid out correctly regardless of scoping, so the
  icons never balloon to their intrinsic size.
 */
<style>
.triage-modal .triage-flow-content .facility-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.triage-modal .triage-flow-content .facility-row .facility-row-icon,
.triage-modal .triage-flow-content .facility-row > svg {
  flex-shrink: 0;
  width: 15px !important;
  height: 15px !important;
  max-width: 15px;
  max-height: 15px;
}
</style>

<style>
/* ─── Night mode overrides part 2: triage modal ──────────────────────────────────
     These cover the triage flow modal: header, body, footer, emergency
     guidance, and the assessment summary. */
:root[data-theme='dark'] .triage-modal {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-modal .triage-modal-header {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-modal .triage-modal-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-modal .triage-modal-close {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-modal .triage-modal-close:hover {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-modal .triage-modal-footer {
  background: var(--symply-card-bg);
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-modal .triage-modal-footer .triage-modal-cancel,
:root[data-theme='dark'] .triage-modal .triage-modal-footer .triage-modal-cancel:hover,
:root[data-theme='dark'] .triage-modal .triage-modal-footer .triage-modal-confirm,
:root[data-theme='dark'] .triage-modal .triage-modal-footer .triage-modal-confirm:hover {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-modal .triage-modal-footer .triage-modal-confirm:enabled:hover {
  background: var(--symply-primary);
  color: white;
}
:root[data-theme='dark'] .triage-flow-content {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-flow-content h4 {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-modal.emergency .triage-flow-content h4 {
  color: var(--symply-text-danger);
}
:root[data-theme='dark'] .triage-modal.urgent .triage-flow-content h4 {
  color: var(--symply-text-warning);
}
:root[data-theme='dark'] .triage-modal.emergency .caution-message {
  color: var(--symply-text-danger);
}
:root[data-theme='dark'] .triage-modal.urgent .caution-message {
  color: var(--symply-text-warning);
}
:root[data-theme='dark'] .triage-flow-content .symptom-info strong {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-flow-content .emergency-instruction {
  background: #16210F;
  border-color: #991B1B;
}
:root[data-theme='dark'] .triage-flow-content .emergency-instruction .emergency-instruction-title {
  color: var(--symply-text-danger);
}
:root[data-theme='dark'] .triage-flow-content .emergency-instruction .emergency-instruction-text {
  color: var(--symply-text-primary);
}
/* Urgent (moderate) callout must match the orange "Next" button, not the
   emergency dark-green theme above. */
:root[data-theme='dark'] .triage-modal.urgent .emergency-instruction {
  background: #D97706;
  border-color: #B45309;
}
:root[data-theme='dark'] .triage-modal.urgent .emergency-instruction p,
:root[data-theme='dark'] .triage-modal.urgent .emergency-instruction strong {
  color: #FFFFFF;
}
:root[data-theme='dark'] .triage-flow-content .retry-btn {
  background: var(--symply-primary);
  color: white;
}
:root[data-theme='dark'] .triage-flow-content .retry-btn:hover {
  background: var(--symply-primary-dark);
}
:root[data-theme='dark'] .triage-flow-content .facilities-count {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .triage-flow-content .assessment-summary {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .triage-flow-content .assessment-summary .summary-row {
  border-bottom-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-flow-content .assessment-summary .summary-label {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .triage-flow-content .assessment-summary .summary-value {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-flow-content .summary-recommendation {
  background: var(--symply-card-bg);
}
:root[data-theme='dark'] .triage-flow-content .emergency-summary .summary-recommendation {
  background: var(--symply-card-bg);
  color: var(--symply-text-danger);
}
:root[data-theme='dark'] .triage-flow-content .urgent-summary .summary-recommendation {
  background: var(--symply-card-bg);
  color: var(--symply-text-warning);
}
:root[data-theme='dark'] .triage-flow-content .facility-item {
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .triage-flow-content .facility-item:hover {
  border-color: var(--symply-primary);
}
:root[data-theme='dark'] .triage-flow-content .facility-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .triage-flow-content .facility-row {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .triage-flow-content .facility-row--phone {
  color: var(--symply-primary);
}

/* ─── Night mode overrides part 2: map, charts, nearby results, buttons ───
     These cover the health map legend and cards, nearby facilities list,
     search results list, no-results, and top-level buttons. */
:root[data-theme='dark'] .nearby-results-section {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .nearby-results-section .nearby-results-header {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .nearby-results-section .nearby-results-list {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .nearby-results-section .nearby-results-item {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .nearby-results-section .nearby-results-item .nearby-results-item-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .nearby-results-section .nearby-results-item .nearby-results-item-location,
:root[data-theme='dark'] .nearby-results-section .nearby-results-item .nearby-results-item-distance,
:root[data-theme='dark'] .nearby-results-section .nearby-results-item .nearby-results-item-phone {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .health-map .v-card {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .health-map .v-card .map-legend {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .health-map .v-card .map-legend .map-legend-item {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .search-results .v-card {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .search-results .v-card .result-symptom-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .search-results .v-card .result-symptom-body-part,
:root[data-theme='dark'] .search-results .v-card .result-symptom-anatomical {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .search-results .v-card .result-symptom-description {
  color: var(--symply-text-secondary);
}
:root[data-theme='dark'] .no-results .no-results-message {
  color: var(--symply-text-muted);
}

/* ─── Night mode overrides part 3: search dropdown, symptoms bucket,
      floating controls, action bar ─────────────────────────────────────────
      These fix the remaining fixed-light surfaces on the Body Map page:
      the autocomplete dropdown, the "My Symptoms" bucket + its text, the
      right-side floating control buttons, and the bottom action bar. */

/* Autocomplete dropdown + ADD buttons */
:root[data-theme='dark'] .search-suggestions {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
:root[data-theme='dark'] .search-suggestion-item {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .search-suggestion-item + .search-suggestion-item {
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .search-suggestion-item:hover {
  background: var(--symply-primary-light);
}
:root[data-theme='dark'] .search-suggestion-item .search-suggestion-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .search-suggestion-add {
  color: var(--symply-primary);
}
:root[data-theme='dark'] .search-suggestion-add:hover {
  background: var(--symply-primary-light);
  color: var(--symply-primary);
}

/* "My Symptoms" bucket — dark surface + visible text */
:root[data-theme='dark'] .symptoms-bucket {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .symptoms-bucket-title {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .symptoms-bucket-row:not(:last-child) {
  border-bottom-color: var(--symply-border);
}
:root[data-theme='dark'] .symptoms-bucket-row .symptom-name {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .symptoms-bucket-list::-webkit-scrollbar-thumb {
  background-color: var(--symply-border);
}
:root[data-theme='dark'] .empty-state-text {
  color: var(--symply-text-secondary);
}

/* Right-side floating control buttons (rotate / browse / skin) */
:root[data-theme='dark'] .control-btn {
  background-color: var(--symply-card-bg);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .control-btn:hover {
  border-color: var(--symply-primary);
  background-color: var(--symply-primary-light);
}
:root[data-theme='dark'] .control-btn svg {
  stroke: var(--symply-text-secondary);
}
:root[data-theme='dark'] .control-btn:hover svg {
  stroke: var(--symply-primary);
}
:root[data-theme='dark'] .text-btn {
  color: var(--symply-text-secondary);
}
:root[data-theme='dark'] .text-btn:hover {
  color: var(--symply-primary);
}
:root[data-theme='dark'] .text-btn.control-btn--active {
  color: var(--symply-primary);
}
:root[data-theme='dark'] .control-btn--active {
  border-color: var(--symply-primary);
  background-color: var(--symply-primary-light);
}

/* Bottom action bar + prev/next buttons */
:root[data-theme='dark'] .action-bar {
  background-color: var(--symply-card-bg);
  border-top-color: var(--symply-border);
}
:root[data-theme='dark'] .prev-btn {
  color: var(--symply-text-secondary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .prev-btn:hover {
  background-color: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-primary);
}
:root[data-theme='dark'] .next-btn:disabled {
  background-color: var(--symply-border);
  color: var(--symply-text-muted);
}

</style>
