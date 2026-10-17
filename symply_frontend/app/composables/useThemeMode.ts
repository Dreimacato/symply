import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'symply_theme'

/* Module-level so the value is shared across every page/layout and stays
   reactive without needing a store. Defaults to light and is corrected on
   init() (run from a client plugin) so there is no flash on first paint. */
const mode = ref<ThemeMode>('light')
let initialized = false

function applyToDocument(m: ThemeMode) {
  if (!process.client) return
  const root = document.documentElement
  root.setAttribute('data-theme', m)
  root.style.colorScheme = m
}

export function useThemeMode() {
  /* Apply the theme on startup. The app ALWAYS starts in light mode on every
     fresh load/restart — we deliberately ignore any previously saved choice
     and the OS prefers-color-scheme, so first-time (and returning) users
     always get light. The toggle still works within the session.
     Guarded so it only runs once, as early as possible on the client. */
  function init() {
    if (!process.client || initialized) return
    initialized = true

    /* Force light on every fresh start, regardless of what was saved before. */
    mode.value = 'light'

    /* Drop any stale saved preference so it can never override the default. */
    if (process.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
    }

    applyToDocument(mode.value)
  }

  function setMode(next: ThemeMode) {
    mode.value = next
    applyToDocument(next)
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
    }
  }

  function toggle() {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed(() => mode.value === 'dark')

  return { mode, isDark, init, setMode, toggle }
}
