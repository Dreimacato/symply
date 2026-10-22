<template>
  <div class="crosshair" aria-hidden="true">
    <span class="crosshair-line crosshair-h" :style="{ transform: 'translateY(' + (y - 0.5) + 'px)' }"></span>
    <span class="crosshair-line crosshair-v" :style="{ transform: 'translateX(' + (x - 0.5) + 'px)' }"></span>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const x = ref(0)
const y = ref(0)
const visible = ref(false)

function handleMove(e) {
  x.value = e.clientX
  y.value = e.clientY
  visible.value = true
}

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(pointer: coarse)').matches) return
  window.addEventListener('mousemove', handleMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMove)
})
</script>

<style scoped>
.crosshair {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483647;
  overflow: hidden;
}
.crosshair-line {
  position: absolute;
  background: #399D87;
  opacity: 0.9;
  pointer-events: none;
}
.crosshair-h {
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
}
.crosshair-v {
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
}
</style>
