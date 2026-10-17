import { ref, shallowRef } from 'vue'
import { useRouter, useRoute } from '#imports'

/**
 * Composable to track navigation direction for page transitions.
 * Uses a stack-based approach to determine if navigation is forward or backward.
 */
export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  // Track the navigation direction: 'forward' | 'back' | null
  const direction = ref<'forward' | 'back' | null>(null)

  // Navigation stack to track history
  const navStack = shallowRef<string[]>([])

  let isInitialized = false

  function init() {
    if (isInitialized || !process.client) return
    isInitialized = true

    // Initialize stack with current route
    navStack.value = [route.fullPath]

    // Navigation guard to detect direction
    router.afterEach((to, from) => {
      const toPath = to.fullPath
      const fromPath = from.fullPath

      // Find if the target route is already in our stack (going back)
      const existingIndex = navStack.value.indexOf(toPath)

      if (existingIndex !== -1 && existingIndex < navStack.value.length - 1) {
        // Route exists in history and is not the current page - going back
        direction.value = 'back'
        // Truncate stack to the target route
        navStack.value = navStack.value.slice(0, existingIndex + 1)
      } else if (toPath !== fromPath) {
        // New route or same path but not in history - going forward
        direction.value = 'forward'
        navStack.value.push(toPath)
      }

      // Reset direction after transition completes
      // This ensures the next navigation starts fresh
      setTimeout(() => {
        direction.value = null
      }, 300) // Slightly longer than transition duration
    })
  }

  // Expose a reset function for testing or specific use cases
  function reset() {
    direction.value = null
  }

  // Auto-initialize on client
  if (typeof window !== 'undefined') {
    init()
  }

  return {
    direction,
    reset
  }
}