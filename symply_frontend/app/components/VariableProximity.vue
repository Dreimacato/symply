<template>
  <span
    ref="rootEl"
    class="variable-proximity"
    :class="className"
    :style="rootStyle"
    @click="onClick"
  >
    <template v-for="(word, wordIndex) in words" :key="wordIndex">
      <br v-if="breakSet.has(wordIndex)" />
      <span data-word style="display: inline-block; white-space: nowrap">
        <span
          v-for="(letter, li) in word.split('')"
          :key="li"
          ref="letterEls"
          style="display: inline-block; transform-origin: 50% 80%"
          :style="{ fontVariationSettings: fromFontVariationSettings, color: fromColor || undefined }"
          aria-hidden="true"
        >{{ letter }}</span>
        <span v-if="wordIndex < words.length - 1" style="display: inline-block">&nbsp;</span>
      </span>
    </template>
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  fromFontVariationSettings: { type: String, default: "'wght' 400, 'opsz' 9" },
  toFontVariationSettings: { type: String, default: "'wght' 1000, 'opsz' 40" },
  containerRef: { type: Object, default: null },
  radius: { type: Number, default: 50 },
  falloff: { type: String, default: 'linear' },
  smoothing: { type: Number, default: 0.2 },
  fromColor: { type: String, default: undefined },
  toColor: { type: String, default: undefined },
  scale: { type: Number, default: 1 },
  lift: { type: Number, default: 0 },
  idleWave: { type: Boolean, default: false },
  fontSize: { type: [Number, String], default: undefined },
  className: { type: String, default: '' },
  onClick: { type: Function, default: null },
  style: { type: Object, default: null },
})

const emit = defineEmits(['click'])

const rootEl = ref(null)
const letterEls = ref([])
const lineStarts = ref(null)

const words = computed(() => props.label.split(' '))
const breakSet = computed(() => new Set(lineStarts.value ? lineStarts.value.split(',').map(Number) : []))

const GAUSSIAN_EDGE = Math.exp(-2)
const WAVE_PERIOD = 3.2
const WAVE_PEAK = 0.7

const parseSettings = (settings) => new Map(
  settings.split(',').map(p => p.trim()).filter(Boolean).map(part => {
    const [name, value] = part.split(/\s+/)
    return [name.replace(/['"]/g, ''), parseFloat(value)]
  })
)

const strengthAt = (distance, radius, falloff) => {
  if (distance >= radius) return 0
  const norm = 1 - distance / radius
  switch (falloff) {
    case 'exponential': return norm * norm
    case 'gaussian': return (Math.exp(-2 * (distance / radius) ** 2) - GAUSSIAN_EDGE) / (1 - GAUSSIAN_EDGE)
    case 'linear':
    default: return norm
  }
}

const axes = computed(() => {
  const fromSettings = parseSettings(props.fromFontVariationSettings)
  const toSettings = parseSettings(props.toFontVariationSettings)
  return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
    axis, fromValue, toValue: toSettings.get(axis) ?? fromValue
  }))
})

const rootStyle = computed(() => ({
  display: 'inline',
  ...(props.fontSize !== undefined ? { fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize } : {}),
  ...(lineStarts.value !== null ? { whiteSpace: 'nowrap' } : {}),
  ...(props.style || {}),
}))

// state
const state = { pointer: { x: 0, y: 0, active: false }, levels: [], targets: [] }

let frame = 0
let lastTime = 0
let dirty = true
let layoutDirty = true
let nearAny = false
let lastNear = -Infinity
let waveMix = 0
let span = 1
let visible = true
const written = []
const painted = []
const moved = []
const anchors = []

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const waving = computed(() => props.idleWave && !reduced)

const measureLineBreaks = () => {
  const root = rootEl.value
  if (!root) return
  const words = Array.from(root.querySelectorAll('[data-word]'))
  const breaks = Array.from(root.querySelectorAll('br'))
  const letters = (letterEls.value || []).filter(Boolean)
  const saved = letters.map(l => l.style.fontVariationSettings)
  const wrap = root.style.whiteSpace
  root.style.whiteSpace = 'normal'
  breaks.forEach(n => (n.style.display = 'none'))
  letters.forEach(l => (l.style.fontVariationSettings = props.fromFontVariationSettings))
  const starts = []
  let lastTop = null
  words.forEach((word, index) => {
    const top = word.getBoundingClientRect().top
    if (lastTop !== null && top > lastTop + 2) starts.push(index)
    lastTop = top
  })
  letters.forEach((l, index) => (l.style.fontVariationSettings = saved[index]))
  breaks.forEach(n => (n.style.display = ''))
  root.style.whiteSpace = wrap
  const key = starts.join(',')
  lineStarts.value = lineStarts.value === key ? lineStarts.value : key
}

const measureAnchors = () => {
  const letters = (letterEls.value || []).filter(Boolean)
  let left = Infinity, top = Infinity, right = -Infinity
  letters.forEach((letter, index) => {
    if (!letter) return
    const rect = letter.getBoundingClientRect()
    anchors[index] = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
  })
  anchors.forEach(a => { a.x -= left; a.y -= top })
  span = Math.max(220, (right - left) * 0.85)
}

const measure = () => {
  const letters = (letterEls.value || []).filter(Boolean)
  state.targets.length = letters.length
  state.targets.fill(0)
  nearAny = false
  if (!state.pointer.active) return
  const area = props.containerRef?.value?.getBoundingClientRect?.() || props.containerRef?.getBoundingClientRect?.()
  if (area) {
    const dx = Math.max(area.left - state.pointer.x, 0, state.pointer.x - area.right)
    const dy = Math.max(area.top - state.pointer.y, 0, state.pointer.y - area.bottom)
    if (dx * dx + dy * dy >= props.radius * props.radius) return
  }
  letters.forEach((letter, index) => {
    if (!letter) return
    const rect = letter.getBoundingClientRect()
    const distance = Math.hypot(state.pointer.x - (rect.left + rect.width / 2), state.pointer.y - (rect.top + rect.height / 2))
    state.targets[index] = strengthAt(distance, props.radius, props.falloff)
    if (state.targets[index] > 0) nearAny = true
  })
}

const waveAt = (index, time) => {
  const anchor = anchors[index]
  if (!anchor) return 0
  const phase = ((anchor.x + anchor.y * 0.6) / span - time / WAVE_PERIOD) * Math.PI * 2
  return WAVE_PEAK * ((1 + Math.cos(phase)) / 2) ** 2.2
}

const settingsAt = (level) => axes.value.map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * level}`).join(', ')

const tick = (now) => {
  frame = 0
  const delta = lastTime ? Math.min(now - lastTime, 64) : 16
  lastTime = now
  if (dirty) { measure(); dirty = false }
  if (waving.value && layoutDirty) { measureAnchors(); layoutDirty = false }
  if (nearAny) lastNear = now
  const idle = waving.value && visible && !nearAny && now - lastNear > 500
  const goal = idle ? 1 : 0
  waveMix += (goal - waveMix) * (1 - Math.exp(-delta / 600))
  if (Math.abs(goal - waveMix) < 0.002) waveMix = goal
  const ease = props.smoothing > 0 ? 1 - Math.exp(-delta / (props.smoothing * 400)) : 1
  const time = now / 1000
  let settling = false
  const tinted = Boolean(props.fromColor || props.toColor)
  const restColor = props.fromColor || 'currentColor'
  const nearColor = props.toColor || 'currentColor'
  const growth = (Number(props.scale) || 1) - 1
  const rise = Number(props.lift) || 0
  const transformed = growth !== 0 || rise !== 0
  const letters = (letterEls.value || []).filter(Boolean)
  letters.forEach((letter, index) => {
    if (!letter) return
    let target = state.targets[index] ?? 0
    if (waveMix > 0) target = Math.max(target, waveMix * waveAt(index, time))
    const current = state.levels[index] ?? 0
    let next = current + (target - current) * ease
    if (Math.abs(target - next) < 0.002) next = target
    else settling = true
    state.levels[index] = next
    const settings = next === 0 ? props.fromFontVariationSettings : settingsAt(next)
    if (written[index] !== settings) { written[index] = settings; letter.style.fontVariationSettings = settings }
    if (tinted) {
      const paint = next === 0 ? (props.fromColor || '') : `color-mix(in oklab, ${restColor} ${((1 - next) * 100).toFixed(1)}%, ${nearColor})`
      if (painted[index] !== paint) { painted[index] = paint; letter.style.color = paint }
    }
    if (transformed) {
      const shift = next === 0 ? '' : `translateY(${(-rise * next).toFixed(3)}em) scale(${(1 + growth * next).toFixed(3)})`
      if (moved[index] !== shift) { moved[index] = shift; letter.style.transform = shift }
    }
  })
  if (settling || waveMix > 0 || (waving.value && visible && !nearAny)) {
    frame = requestAnimationFrame(tick)
  } else {
    lastTime = 0
  }
}

const schedule = () => { dirty = true; if (!frame) frame = requestAnimationFrame(tick) }
const relayout = () => { layoutDirty = true; schedule() }
const handleMove = (x, y) => { state.pointer.x = x; state.pointer.y = y; state.pointer.active = true; schedule() }
const handleMouseMove = (e) => handleMove(e.clientX, e.clientY)
const handleTouchMove = (e) => { const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY) }
const handleLeave = () => { state.pointer.active = false; schedule() }

let observer = null
let resizeObserver = null

onMounted(async () => {
  await nextTick()
  const root = rootEl.value
  if (!root) return
  const letters = (letterEls.value || []).filter(Boolean)
  letters.forEach(l => { if (!props.fromColor && !props.toColor) l.style.color = ''; if (Number(props.scale) === 1 && !props.lift) l.style.transform = '' })
  measureLineBreaks()
  const parent = root.parentElement
  if (parent && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const width = entries?.[0]?.contentRect.width
      // simple dedup
      if (width !== undefined) {
        // track last width
      }
      if (!frame) frame = requestAnimationFrame(measureLineBreaks)
    })
    resizeObserver.observe(parent)
  }
  document.fonts?.ready.then(() => { if (!frame) frame = requestAnimationFrame(measureLineBreaks) })

  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('touchend', handleLeave)
  window.addEventListener('touchcancel', handleLeave)
  window.addEventListener('scroll', schedule, { capture: true, passive: true })
  window.addEventListener('resize', relayout)
  document.documentElement.addEventListener('mouseleave', handleLeave)
  if (waving.value && root && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); schedule() })
    observer.observe(root)
  }
  if (waving.value) document.fonts?.ready.then(relayout)
  schedule()
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  observer?.disconnect()
  resizeObserver?.disconnect()
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleLeave)
  window.removeEventListener('touchcancel', handleLeave)
  window.removeEventListener('scroll', schedule, { capture: true })
  window.removeEventListener('resize', relayout)
  document.documentElement.removeEventListener('mouseleave', handleLeave)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap');

.variable-proximity {
  font-family: 'Roboto Flex', sans-serif;
}

.sr-only {
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
</style>
