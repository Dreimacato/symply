import { useThemeMode } from '~/composables/useThemeMode'

/* Applies the saved / preferred theme to <html> before the Vue app mounts,
   so the page paints in the correct mode without a light-flash. Vuetify's
   own theme name is synced from the layout (which has setup context). */
export default defineNuxtPlugin(() => {
  useThemeMode().init()
})
