<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="surface" elevation="0" border="b">
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

    <!-- Page Content -->
    <v-main class="symply-main">
      <slot />
    </v-main>

    <!-- Unified Footer -->
    <v-footer class="symply-footer">
      <v-container class="footer-container">
        <div class="footer-bottom">
            <!-- Footer Brand -->
            <v-row class="footer-main" align="center">
              <v-col cols="12" md="8" class="footer-brand">
                <NuxtLink
                  to="/"
                  class="footer-logo"
                  aria-label="Symply home"
                >
                  <img
                    :src="logoUrl"
                    alt="Symply"
                    class="footer-logo-img"
                  />
                </NuxtLink>

                <p class="footer-tagline">
                  Understand your symptoms.
                  <br />
                  Know your next step.
                </p>

                <div class="footer-note">
                  <v-icon
                    icon="mdi-heart-pulse"
                    size="17"
                    aria-hidden="true"
                  />
                  <span>
                    Made to help you make informed decisions about your health.
                  </span>
                </div>
              </v-col>

              <!-- About Us Button -->
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-start justify-md-end align-center"
              >
                <v-btn
                  to="/about"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  class="about-us-btn"
                  append-icon="mdi-arrow-right"
                >
                  About Us
                </v-btn>
              </v-col>
            </v-row>

          <!-- Copyright -->
          <div class="footer-legal">
            <span class="footer-copyright">
              © {{ currentYear }} Symply. All rights reserved.
            </span>
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
  border: 1px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  overflow: hidden;
  background: white;
  box-shadow: var(--symply-shadow-sm);
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
  background: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.progress-step--active {
  color: var(--symply-primary-bg);
  background: white;
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
   Footer Background
========================================= */

.symply-footer {
  display: block;
  padding: 0;
  color: #334155;
  background: var(--symply-footer-bg);
  border-top: 1px solid #d6e9e6;
}

.footer-container {
  width: 100%;
  max-width: 1440px;
  padding: 32px clamp(1rem, 4vw, 2.5rem);
  box-sizing: border-box;
}

/* All footer content sits inside this panel */

.footer-bottom {
  padding: 32px;
  background: #e2f1ee;
  border: 1px solid #d1e6e0;
  border-radius: 18px;
}

.footer-main {
  row-gap: 32px;
}

/* =========================================
   Footer Brand
========================================= */

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  text-decoration: none;
}

.footer-logo-img {
  display: block;
  width: auto;
  height: 42px;
  object-fit: contain;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.footer-logo:hover .footer-logo-img {
  opacity: 0.85;
  transform: translateY(-1px);
}

.footer-tagline {
  margin: 0;
  color: #183b46;
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.65;
  letter-spacing: -0.01em;
}

.footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #607780;
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: nowrap;
}

.footer-note .v-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #32877e;
}


/* =========================================
   Footer Contact
========================================= */

.footer-contact {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: #247e75;
  background: #d5ebe5;
  border: 1px solid #c5e1d9;
  border-radius: 12px;
}

.contact-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-top: 2px;
}

.contact-title {
  color: #254650;
  font-size: 0.9rem;
  font-weight: 650;
}

.contact-subtitle {
  color: #607780;
  font-size: 0.84rem;
  line-height: 1.6;
}

.footer-contact-note {
  max-width: 290px;
  margin: 14px 0 0;
  color: #73878e;
  font-size: 0.78rem;
  line-height: 1.65;
}


/* =========================================
   Footer Copyright
========================================= */

.footer-legal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #cddfda;
}

.footer-copyright {
  color: #73878e;
  font-size: 0.76rem;
}

/* =========================================
   Tablet and Mobile
========================================= */

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
    padding: 24px 16px;
  }

  .footer-bottom {
    padding: 24px 20px;
    border-radius: 14px;
  }

  .footer-main {
    row-gap: 28px;
  }

}

/* =========================================
   Small Phones
========================================= */

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

  .footer-bottom {
    padding: 22px 16px;
  }

  .footer-heading {
    margin-bottom: 14px;
    font-size: 0.72rem;
  }

  .footer-links {
    gap: 10px;
  }

  .footer-links a {
    font-size: 0.84rem;
  }

  .footer-tagline {
    font-size: 0.98rem;
  }

  .footer-note {
    white-space: normal;
  }

  .footer-legal {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* Respect reduced-motion preferences */

@media (prefers-reduced-motion: reduce) {
  .symply-logo-img,
  .footer-logo-img,
  .footer-links a {
    transition: none;
  }
}

/* About Us Footer Button */
.about-us-btn {
  border-color: #b8d8d1 !important;
  color: #247e75 !important;
  background: rgba(255, 255, 255, 0.45);
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.about-us-btn:hover {
  background: #d5ebe5;
  border-color: #8fc6bb !important;
  transform: translateY(-2px);
}

/* =========================================
   Dark theme overrides for fixed-color surfaces
   (progress tracker + teal footer) that don't
   use --symply-* variables.
========================================= */

:root[data-theme='dark'] .progress-step {
  background: #0f1a2b;
}

:root[data-theme='dark'] .progress-step--active {
  background: var(--symply-card-bg);
}

:root[data-theme='dark'] .symply-footer {
  color: var(--symply-text-secondary);
  background: var(--symply-footer-bg);
  border-top-color: var(--symply-border);
}

:root[data-theme='dark'] .footer-bottom {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
}

:root[data-theme='dark'] .footer-legal {
  border-top-color: var(--symply-border);
}

:root[data-theme='dark'] .contact-card {
  background: #0f1a2b;
  border-color: var(--symply-border);
}

:root[data-theme='dark'] .contact-title {
  color: var(--symply-text-primary);
}

:root[data-theme='dark'] .contact-subtitle,
:root[data-theme='dark'] .footer-copyright,
:root[data-theme='dark'] .footer-contact-note {
  color: var(--symply-text-secondary);
}

:root[data-theme='dark'] .footer-links a,
:root[data-theme='dark'] .footer-heading {
  color: var(--symply-text-secondary);
}

:root[data-theme='dark'] .footer-tagline {
  color: var(--symply-text-primary);
}

:root[data-theme='dark'] .footer-note {
  color: var(--symply-text-secondary);
}

:root[data-theme='dark'] .about-us-btn {
  background: rgba(56, 189, 248, 0.08);
  border-color: var(--symply-border) !important;
  color: var(--symply-primary) !important;
}

:root[data-theme='dark'] .about-us-btn:hover {
  background: var(--symply-primary-light);
  border-color: var(--symply-primary) !important;
}
</style>