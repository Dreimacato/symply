<template>
  <h1 class="symply-headline main-heading m-0 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
    <span class="symply-headline-static">{{ staticText }}</span>

    <!-- Highlight pill: its width smoothly resizes to fit each phrase -->
    <span class="text-rotate text-rotate-highlight" :style="pillWidth ? { width: pillWidth + 'px' } : null">
      <!-- Screen readers get the current phrase once, without per-letter noise -->
      <span class="text-rotate-sr-only">{{ texts[index] }}</span>

      <span ref="contentRef" class="text-rotate-highlight-content">
        <span
          :key="`active-${index}`"
          class="text-rotate-active"
          :class="{ 'is-animated': animated, 'is-leaving': leaving }"
          aria-hidden="true"
        >
          <span v-for="(word, w) in activeWords" :key="`${index}-${w}`" class="text-rotate-word">
            <span
              v-for="(char, c) in word.chars"
              :key="`${index}-${w}-${c}`"
              class="text-rotate-element"
              :style="{ animationDelay: `${staggerDelay(word.offset + c)}s` }"
            >{{ char }}</span>
          </span>
        </span>
      </span>
    </span>
  </h1>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

/* Vue port of React Bits <RotatingText /> (effect="slide", direction="up",
   highlight={true}, staggerFrom="last", staggerDuration={0.025},
   rotationInterval={2000}, splitBy="characters"), implemented with CSS animations
   so no extra dependency (motion) is needed. The highlight colors follow the
   light / dark theme (see the <style> block). */
const props = defineProps({
  staticText: { type: String, default: 'Understand your health,' },
  texts: {
    type: Array,
    default: () => [
      'one symptom at a time.',
      'with greater clarity.',
      'with informed next steps.',
      'with health insights.',
    ],
  },
  rotationInterval: { type: Number, default: 4500 },
  staggerDuration: { type: Number, default: 0.06 },
  staggerFrom: { type: String, default: 'last' },
})

const EXIT_MS = 700 /* must match the rt-slide-out duration in the CSS */
const index = ref(0)
const leaving = ref(false)
const animated = ref(false) /* false until the first swap (animatePresenceInitial=false) */
const pillWidth = ref(0)
const contentRef = ref(null)
let reduceMotion = false
let timer = null
let swapTimer = null
let observer = null

const splitWords = (text) => (text || '').split(' ')

const activeWords = computed(() => {
  let offset = 0
  return splitWords(props.texts[index.value]).map((word) => {
    const chars = Array.from(word)
    const entry = { chars, offset }
    offset += chars.length
    return entry
  })
})

const totalChars = computed(() =>
  activeWords.value.reduce((sum, word) => sum + word.chars.length, 0),
)

const staggerDelay = (i) => {
  if (reduceMotion) return 0
  const total = totalChars.value
  if (props.staggerFrom === 'last') return (total - 1 - i) * props.staggerDuration
  if (props.staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - i) * props.staggerDuration
  return i * props.staggerDuration
}

function measure() {
  if (contentRef.value) pillWidth.value = contentRef.value.offsetWidth + 1
}

function next() {
  if (!props.texts.length) return
  animated.value = true
  leaving.value = true
  const wait = reduceMotion ? 0 : EXIT_MS + Math.max(totalChars.value - 1, 0) * props.staggerDuration * 1000
  swapTimer = setTimeout(() => {
    index.value = (index.value + 1) % props.texts.length
    leaving.value = false
  }, wait)
}

watch(index, () => nextTick(measure))

onMounted(() => {
  /* reduceMotion stays false on purpose: the slide always runs */
  measure()
  document.fonts?.ready.then(measure)
  if (typeof ResizeObserver !== 'undefined' && contentRef.value) {
    observer = new ResizeObserver(measure)
    observer.observe(contentRef.value)
  }
  timer = setInterval(next, props.rotationInterval)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (swapTimer) clearTimeout(swapTimer)
  observer?.disconnect()
})
</script>

<style scoped>
/* One single line: static text + rotating pill side by side. The font size
   scales with the viewport so the longest phrase still fits without wrapping,
   which keeps the headline from jumping up and down. */
.symply-headline {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  white-space: nowrap;
  font-size: clamp(0.8rem, 3.3vw, 1.5rem);
  font-family: 'Avenir Next', 'Segoe UI', sans-serif;
}
.symply-headline-static {
  flex-shrink: 0;
  color: var(--symply-text-primary);
}

/* Highlight pill - light theme colors */
.text-rotate {
  --rt-bg: #0d9488;
  --rt-fg: #ffffff;
  position: relative;
}
/* Highlight pill - dark theme colors */
:root[data-theme='dark'] .text-rotate {
  --rt-bg: #10b981;
  --rt-fg: #0b0b0c;
}

.text-rotate-highlight {
  display: inline-flex;
  box-sizing: content-box;
  justify-content: center;
  overflow: hidden;
  max-width: 100%;
  padding: 0.28em 0.7em;
  border-radius: 0.4em;
  background-color: var(--rt-bg);
  color: var(--rt-fg);
  font-weight: 700;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s ease, color 0.3s ease;
}

.text-rotate-highlight-content {
  display: flex;
  flex-shrink: 0;
  white-space: pre;
}

.text-rotate-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-rotate-active {
  display: inline-flex;
  white-space: pre;
}
/* Masked slide: each word clips its letters while they travel */
.text-rotate-word {
  display: inline-flex;
  overflow: hidden;
  padding-bottom: 0.12em;
}
.text-rotate-word + .text-rotate-word {
  margin-left: 0.28em;
}
.text-rotate-element {
  display: inline-block;
}

/* Slide up, staggered from the last letter: letters rise in from below the
   mask and leave upward (enter y 100% -> 0, exit y 0 -> -120%) */
.text-rotate-active.is-animated .text-rotate-element {
  animation: rt-slide-in 1s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.text-rotate-active.is-leaving .text-rotate-element {
  animation: rt-slide-out 0.7s cubic-bezier(0.45, 0, 0.55, 1) forwards;
}

@keyframes rt-slide-in {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes rt-slide-out {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-120%); opacity: 0; }
}

/* Intentionally no prefers-reduced-motion override: the slide is a core part
   of the headline and must run even when the OS animation setting is off. */
</style>