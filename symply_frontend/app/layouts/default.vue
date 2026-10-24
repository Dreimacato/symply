<template>
  <v-app>
    <!-- App Bar (transparent, seamless over Arctic Frost, scrolls with page) -->
    <v-app-bar color="transparent" elevation="0" class="symply-app-bar">
      <div class="app-bar-container d-flex align-center">
        <NuxtLink
          to="/"
          class="d-flex align-center text-decoration-none symply-logo"
          aria-label="Symply home"
        >
          <img :src="logoUrl" alt="Symply" class="symply-logo-img" />
        </NuxtLink>

        <v-spacer />

        <!-- Theme toggle (light / dark) -->
        <v-btn
          class="theme-toggle-btn"
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          variant="text"
          size="small"
          @click="toggleTheme"
        />

        <!-- Progress Tracker -->
        <ol class="progress-tracker" aria-label="Progress">
          <li
            class="progress-step"
            :class="{ 'progress-step--active': activeStep === 1 }"
            :aria-current="activeStep === 1 ? 'step' : undefined"
          >
            INFO
          </li>

          <li class="progress-divider" aria-hidden="true"></li>

          <li
            class="progress-step"
            :class="{ 'progress-step--active': activeStep === 2 }"
            :aria-current="activeStep === 2 ? 'step' : undefined"
          >
            SYMPTOMS
          </li>

          <li class="progress-divider" aria-hidden="true"></li>

          <li
            class="progress-step"
            :class="{ 'progress-step--active': activeStep === 3 }"
            :aria-current="activeStep === 3 ? 'step' : undefined"
          >
            WHAT YOU CAN DO
          </li>

          <li class="progress-divider" aria-hidden="true"></li>

          <li
            class="progress-step"
            :class="{ 'progress-step--active': activeStep === 4 }"
            :aria-current="activeStep === 4 ? 'step' : undefined"
          >
            WHERE TO GET HELP
          </li>
        </ol>
      </div>
    </v-app-bar>

    <!-- Arctic Frost aura: fixed backdrop behind every page -->
    <AuraBackground backdrop />

    <!-- Page Content -->
    <v-main class="symply-main">
      <slot />
    </v-main>

    <!-- Unified Footer (informational only - deliberately not a navigation menu) -->
    <v-footer class="symply-footer">
      <v-container class="footer-container">
        <div class="footer-bottom">
          <div class="footer-grid">
            <!-- Brand -->
            <div class="footer-col footer-col--brand">
              <img :src="logoUrl" alt="Symply" class="footer-logo-img" />
              <p class="footer-tagline">Understand your symptoms. Know your next step.</p>
              <NuxtLink to="/about" class="footer-about-btn">
                About Us
                <v-icon icon="mdi-arrow-right" size="16" aria-hidden="true" />
              </NuxtLink>
              <p class="footer-copyright">© {{ currentYear }} Symply. All rights reserved.</p>
            </div>

            <!-- Our Purpose -->
            <div class="footer-col">
              <h3 class="footer-heading">Our Purpose</h3>
              <ul class="footer-list">
                <li class="footer-item">Understand Symptoms</li>
                <li class="footer-item">Explore Health Information</li>
                <li class="footer-item">Support Informed Decisions</li>
              </ul>
            </div>

            <!-- Health & Safety -->
            <div class="footer-col">
              <h3 class="footer-heading">Health &amp; Safety</h3>
              <ul class="footer-list">
                <li class="footer-item">Educational Information</li>
                <li class="footer-item">Medical Disclaimer</li>
                <li class="footer-item">Seek Professional Care</li>
              </ul>
            </div>

            <!-- About Symply -->
            <div class="footer-col">
              <h3 class="footer-heading">About Symply</h3>
              <ul class="footer-list">
                <li class="footer-item">Symptom Awareness</li>
                <li class="footer-item">User-Friendly Design</li>
                <li class="footer-item">Health Education</li>
              </ul>
            </div>
          </div>

          <!-- Decorative interactive wordmark (React Bits TechText) -->
          <div class="footer-wordmark-wrap">
            <div class="footer-wordmark-stage">
              <TechText
                text="Symply"
                class-name="footer-tech-text"
                :font-weight="700"
                :font-size="250"
                :letter-spacing="-0.04"
                reveal="letter"
                :dash-length="4"
                :dash-gap="2"
                :specks="15"
                intro="none"
                :intro-duration="2"
                click-kick
                :guides="false"
                :labels="true"
                :accent-color="isDark ? '#22D3EE' : '#7DD3FC'"
              />
            </div>
          </div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeMode } from '~/composables/useThemeMode'

const logoUrl = '/logo.png'
const route = useRoute()

const currentYear = new Date().getFullYear()

/* ── Theme mode (light / dark) ────────────────────────────────────────────
   useThemeMode owns the data-theme attribute + localStorage. The layout also
   keeps Vuetify's own theme in sync so v-* components match the CSS theme. */
const { mode, isDark, toggle } = useThemeMode()
const { $vuetifyTheme } = useNuxtApp()

function toggleTheme() {
  toggle()
}

watch(mode, (next) => {
  if ($vuetifyTheme) {
    $vuetifyTheme.global.name.value = next
  }
}, { immediate: true })

const activeStep = computed(() => {
  const path = route.path.replace(/\/+$/, '') || '/'

  if (path === '/' || path === '/info') return 1
  if (path === '/bodymap') return 2
  if (path === '/what-you-can-do') return 3
  if (path === '/where-to-get-help') return 4

  return null
})
</script>

<style>
/* =========================================
   Main Layout
========================================= */

.symply-main {
  background: var(--symply-bg-app);
}

/* =========================================
   App Bar
========================================= */

.app-bar-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding: 0 clamp(1rem, 3vw, 2.5rem);
  box-sizing: border-box;
}

.symply-logo {
  flex-shrink: 0;
}

.symply-logo-img {
  display: block;
  width: auto;
  height: 48px;
  object-fit: contain;
  transition: opacity 0.2s ease;
}

.symply-logo:hover .symply-logo-img {
  opacity: 0.85;
}

.theme-toggle-btn {
  flex-shrink: 0;
  margin-inline-end: 12px;
  color: var(--symply-text-secondary);
}

.theme-toggle-btn:hover {
  color: var(--symply-primary-bg);
  background: var(--symply-primary-light);
}

/* =========================================
   Progress Tracker
========================================= */

.progress-tracker {
  display: flex;
  align-items: stretch;
  width: max-content;
  max-width: 100%;
  min-width: 0;
  height: 56px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--symply-radius-md);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: var(--symply-shadow-sm);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.progress-step {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: max-content;
  padding: 0 20px;
  color: var(--symply-text-muted);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.progress-step--active {
  color: var(--symply-primary-bg);
  background: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

.progress-step--active::after {
  position: absolute;
  right: 16px;
  bottom: 0;
  left: 16px;
  height: 4px;
  background: var(--symply-primary);
  content: '';
}

.progress-step.completed::after {
  position: absolute;
  right: 16px;
  bottom: 0;
  left: 16px;
  height: 4px;
  background: #10b981;
  content: '';
}

.progress-divider {
  flex: 0 0 1px;
  width: 1px;
  background: var(--symply-border);
}

/* =========================================
   Footer - transparent panel over the page bg
   The frost layers are fixed behind everything, so the footer must NOT
   paint its own background or it cuts the frost and shows a hard seam
   (a flat darker rectangle in dark mode). Kept transparent in both
   themes so the backdrop flows through continuously.
   ========================================= */

.symply-footer {
  display: block;
  padding: 0 0 32px;
  color: #334155;
  background: transparent;
  border-top: none;
}

.footer-container {
  width: 100%;
  max-width: 1440px;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
  box-sizing: border-box;
}

/* The panel itself - stays transparent so the frost flows through */
.footer-bottom {
  padding: clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px) 0;
  overflow: hidden;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* Column row */
.footer-grid {
  display: grid;
  grid-template-columns: 1.35fr repeat(3, minmax(0, 1fr));
  gap: clamp(32px, 4vw, 56px) clamp(24px, 3vw, 48px);
  align-items: start;
}

.footer-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.footer-heading {
  margin: 0;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Static label list - deliberately not a link list */
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-item {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.5;
}

/* Brand column - visually the most prominent */
.footer-col--brand {
  gap: 16px;
}

.footer-tagline {
  max-width: 30ch;
  margin: 0;
  color: #22374d;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.5;
}

.footer-copyright {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.5;
}

/* The one interactive element in the footer - routes to the about page.
   Kept transparent so the frost still flows behind it. */
.footer-about-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 10px;
  background: transparent;
  color: #22374d;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.footer-about-btn:hover {
  border-color: #0b4f8f;
  background: rgba(255, 255, 255, 0.14);
  color: #0b4f8f;
  transform: translateY(-1px);
}

.footer-about-btn:focus-visible {
  outline: 2px solid #0b4f8f;
  outline-offset: 2px;
}

/* Brand logo */
.footer-logo-img {
  display: block;
  width: auto;
  height: 44px;
  object-fit: contain;
}

/* =========================================
   Decorative oversized wordmark
   ========================================= */

.footer-wordmark-wrap {
  margin-top: clamp(40px, 6vw, 80px);
  padding-bottom: clamp(8px, 1.5vw, 20px);
  overflow: hidden;
  border-top: 1px solid rgba(15, 23, 42, 0.12);
  user-select: none;
}

/* Sized stage for the TechText canvas. The canvas fills it, and the wordmark
   ink colour comes from `color` (the component defaults to currentColor).
   Light mode sits on the ocean gradient, so the ink is deep ocean navy -
   a frosted white washed out against the mid-teal page. The drop shadow on
   the canvas lifts the letters off the backdrop so they read as raised. */
.footer-wordmark-stage {
  position: relative;
  width: 100%;
  height: clamp(140px, 18vw, 280px);
  color: rgba(11, 79, 143, 0.88);
}

.footer-wordmark-stage .footer-tech-text {
  filter: drop-shadow(0 12px 26px rgba(3, 22, 34, 0.38));
}


/* =========================================
   Tablet and Mobile
   ========================================= */

/* Tablet: four columns wrap down to two */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px 28px;
  }

  .footer-tagline {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .app-bar-container {
    flex-wrap: wrap;
    gap: 8px 16px;
    padding: 8px 16px;
  }

  .progress-tracker {
    order: 3;
    flex: 0 0 100%;
    width: 100%;
    max-width: 100%;
    height: 48px;
    margin: 8px 0 0;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .progress-step {
    flex: 0 0 auto;
    min-width: max-content;
    padding-inline: 12px;
    font-size: 0.68rem;
    letter-spacing: 0.3px;
  }

  .progress-step--active::after {
    right: 6px;
    left: 6px;
  }

  .footer-container {
    padding: 0 16px;
  }

  .footer-bottom {
    padding: 28px 22px 0;
  }
}

/* =========================================
   Small Phones
   ========================================= */

/* Mobile: stack the sections vertically */
@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-col--brand {
    gap: 12px;
  }

  .footer-tagline {
    font-size: 0.98rem;
  }
}

@media (max-width: 420px) {
  .progress-step {
    padding-inline: 8px;
    font-size: 0.62rem;
    letter-spacing: 0.2px;
  }

  .progress-step--active::after {
    right: 4px;
    left: 4px;
  }

  .footer-logo-img {
    height: 38px;
  }
}

/* Respect reduced-motion preferences */

@media (prefers-reduced-motion: reduce) {
  .symply-logo-img {
    transition: none;
  }
}


/* =========================================
   Dark theme overrides for the floating-card footer
========================================= */

:root[data-theme='dark'] .progress-tracker {
  background: rgba(16, 14, 11, 0.45);
  border-color: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

:root[data-theme='dark'] .progress-step {
  background: transparent;
  color: var(--symply-text-muted);
}

:root[data-theme='dark'] .progress-step--active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--symply-text-primary);
}

:root[data-theme='dark'] .progress-divider {
  background: rgba(255, 255, 255, 0.12);
}

:root[data-theme='dark'] .symply-footer {
  color: var(--symply-text-secondary);
  background: transparent;
}

:root[data-theme='dark'] .footer-bottom {
  background: transparent;
  border: none;
  box-shadow: none;
}

:root[data-theme='dark'] .footer-tagline {
  color: var(--symply-text-primary);
}

:root[data-theme='dark'] .footer-heading,
:root[data-theme='dark'] .footer-copyright,
:root[data-theme='dark'] .footer-item {
  color: var(--symply-text-secondary);
}

:root[data-theme='dark'] .footer-about-btn {
  border-color: rgba(255, 255, 255, 0.18);
  color: var(--symply-text-primary);
}

:root[data-theme='dark'] .footer-about-btn:hover {
  border-color: var(--symply-primary);
  background: var(--symply-primary-light);
  color: var(--symply-primary);
}

:root[data-theme='dark'] .footer-wordmark-wrap {
  border-top-color: rgba(255, 255, 255, 0.1);
}

:root[data-theme='dark'] .footer-wordmark-stage {
  color: rgba(255, 255, 255, 0.32);
}
</style>