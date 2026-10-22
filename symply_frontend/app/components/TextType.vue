<template>
  <span class="text-type" :class="{ 'text-type--reduced-motion': reduceMotion }" aria-live="off">
    <span class="text-type__text">{{ displayedText }}</span>
    <span v-if="!reduceMotion" class="text-type__cursor" aria-hidden="true"></span>
  </span>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  text: {
    type: Array,
    default: () => ['one symptom at a time.', 'with greater clarity.', 'with informed next steps.', 'with health insights.']
  },
  typingSpeed: { type: Number, default: 55 },
  deletingSpeed: { type: Number, default: 30 },
  pauseDuration: { type: Number, default: 2000 },
  initialDelay: { type: Number, default: 300 },
  loop: { type: Boolean, default: true }
})

const phraseIndex = ref(0)
const displayedText = ref('')
const isDeleting = ref(false)
const isPaused = ref(false)
const reduceMotion = ref(false)

let timer = null
let mediaQuery = null

const currentPhrase = computed(() => props.text[phraseIndex.value] ?? '')

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function scheduleNext(delay) {
  clearTimer()
  timer = setTimeout(tick, reduceMotion.value ? 0 : delay)
}

function tick() {
  const phrase = currentPhrase.value

  if (reduceMotion.value) {
    displayedText.value = phrase
    return
  }

  if (isPaused.value) {
    isPaused.value = false
    isDeleting.value = true
    scheduleNext(props.deletingSpeed)
    return
  }

  if (!isDeleting.value) {
    displayedText.value = phrase.slice(0, displayedText.value.length + 1)

    if (displayedText.value === phrase) {
      isPaused.value = true
      scheduleNext(props.pauseDuration)
    } else {
      scheduleNext(props.typingSpeed)
    }
    return
  }

  displayedText.value = displayedText.value.slice(0, -1)

  if (displayedText.value.length === 0) {
    isDeleting.value = false
    if (phraseIndex.value < props.text.length - 1) {
      phraseIndex.value++
    } else if (props.loop) {
      phraseIndex.value = 0
    } else {
      clearTimer()
      return
    }
    scheduleNext(props.typingSpeed)
  } else {
    scheduleNext(props.deletingSpeed)
  }
}

function handleMotionChange(event) {
  reduceMotion.value = event.matches
  if (reduceMotion.value) {
    clearTimer()
    displayedText.value = currentPhrase.value
  } else {
    displayedText.value = ''
    isDeleting.value = false
    isPaused.value = false
    scheduleNext(props.initialDelay)
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = mediaQuery.matches
  mediaQuery.addEventListener?.('change', handleMotionChange)
  if (reduceMotion.value) {
    displayedText.value = currentPhrase.value
  } else {
    scheduleNext(props.initialDelay)
  }
})

onUnmounted(() => {
  clearTimer()
  mediaQuery?.removeEventListener?.('change', handleMotionChange)
})
</script>

<style scoped>
.text-type {
  display: inline;
  color: var(--symply-mint, #399D87);
  overflow-wrap: anywhere;
}
.text-type__text {
  white-space: pre-wrap;
}
.text-type__cursor {
  display: inline-block;
  width: 2px;
  height: 0.9em;
  margin-left: 3px;
  vertical-align: -0.06em;
  background: currentColor;
  animation: text-type-blink 0.8s step-end infinite;
}
@keyframes text-type-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .text-type__cursor { animation: none; }
}
</style>
