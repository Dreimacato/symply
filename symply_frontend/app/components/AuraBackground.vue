<template>
  <!-- Arctic Frost aura - background only. Real page content goes in the slot. -->
  <template v-if="backdrop">
    <div class="aura-layer aura-layer-1 aura-layer--fixed" aria-hidden="true" />
    <div class="aura-layer aura-layer-2 aura-layer--fixed" aria-hidden="true" />
  </template>
  <div v-else class="aura-bg" :class="{ 'aura-bg--section': !fullHeight }">
    <div class="aura-layer aura-layer-1" aria-hidden="true" />
    <div class="aura-layer aura-layer-2" aria-hidden="true" />
    <div class="aura-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Reusable Arctic Frost background (Nuxt auto-imported via app/components).
   Usages:
     Global fixed backdrop (layout, once):
       <AuraBackground backdrop />
     Section/embedded wrapper:
       <AuraBackground>
         <!-- real content (no placeholder text) -->
       </AuraBackground>
   Props:
   - backdrop: renders the fixed full-viewport layer stack with no content slot
     (sits behind ALL page content at z-index 0).
   - fullHeight: for the embedded variant, keeps min-height:100vh (hero/full
     page). Set to false when embedding inside a section that already has
     height (e.g. inside <v-main> where page content provides the height).
*/
withDefaults(
  defineProps<{
    backdrop?: boolean
    fullHeight?: boolean
  }>(),
  { backdrop: false, fullHeight: true }
)
</script>
