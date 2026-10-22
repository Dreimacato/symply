
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  /* Vuetify 4's createVuetify() registers NO components by default (its
     `components` option defaults to {}). The app previously relied solely on
     vite-plugin-vuetify's auto-import to inject <v-btn>, <v-icon>, etc., but
     that plugin is built for Vuetify 3's package layout and does not reliably
     resolve components against Vuetify 4 — which caused the intermittent
     "Failed to resolve component: v-btn" warnings. Registering the full
     component + directive sets here guarantees every v-* tag resolves
     regardless of the plugin's tree-shaking. */
  const vuetify = createVuetify({
    components,
    directives,
    ssr: true,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#2563EB',
            secondary: '#0891B2',
            accent: '#93C5FD',
            error: '#DC2626',
            info: '#0284C7',
            success: '#16A34A',
            warning: '#D97706',
            background: '#F0F4F8',
            surface: '#FFFFFF',
          },
        },
        dark: {
          /* `dark: true` tells Vuetify this is a dark theme so it picks the
             dark `on-*` foreground defaults. Without it Vuetify keeps the
             light-theme foregrounds (dark text) and every v-card / v-list /
             v-dialog renders dark-on-dark in dark mode. The explicit
             `on-surface` / `on-background` entries make the text color
             independent of that flag. */
          dark: true,
          colors: {
            primary: '#60A5FA',
            secondary: '#14B8A6',
            accent: '#93C5FD',
            error: '#EF4444',
            info: '#0EA5E9',
            success: '#22C55E',
            warning: '#F59E0B',
            background: '#0F1116',
            surface: '#16223A',
            'on-background': '#F2F7FF',
            'on-surface': '#F2F7FF',
          },
        },
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)

  /* ─── Night mode CSS overrides for Vuetify components ─────────────────────
     Vuetify 4 registers NO components by default (createVuetify() defaults
     to {}), so the app registers the full set here rather than relying on
     vite-plugin-vuetify's auto-import (which is built for Vuetify 3). The
     dark-theme CSS below targets Vuetify's dark-mode classes so that
     v-text-field, v-card, v-alert, v-chip, v-select, v-avatar, v-btn,
     v-dialog, v-drawer, v-menu, and v-snackbar all adapt to the CSS-variable
     data-theme="dark" theme managed by useThemeMode. */

  /* Expose Vuetify's theme controller so the layout can keep it in sync with
     the CSS-variable theme (data-theme) managed by useThemeMode. */
  nuxtApp.provide('vuetifyTheme', vuetify.theme)
})
