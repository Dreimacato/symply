<template>
  <div class="address-autocomplete">
    <div class="address-input-wrap">
      <input
        :value="modelValue"
        type="text"
        class="address-input"
        placeholder="e.g., 123 Main St, City, State"
        autocomplete="off"
        role="combobox"
        :aria-expanded="showSuggestions"
        aria-controls="address-suggestions"
        aria-autocomplete="list"
        @input="onInput"
        @focus="onFocus"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter.prevent="confirmActive"
        @keydown.esc="closeSuggestions"
        @blur="onBlur"
      />
      <span v-if="loading" class="address-spinner" aria-hidden="true"></span>
    </div>

    <ul
      v-if="showSuggestions && suggestions.length > 0"
      id="address-suggestions"
      class="address-suggestions"
      role="listbox"
    >
      <li
        v-for="(s, i) in suggestions"
        :key="`${s.lat},${s.lng},${i}`"
        class="address-suggestion-item"
        :class="{ 'address-suggestion-item--active': i === activeIndex }"
        role="option"
        :aria-selected="i === activeIndex"
        @mousedown.prevent="selectSuggestion(s)"
        @mouseenter="activeIndex = i"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
        <span class="address-suggestion-text">{{ s.displayName }}</span>
      </li>
    </ul>

    <p v-else-if="showSuggestions && searched && !loading && suggestions.length === 0" class="address-suggestions-empty">
      No matching addresses found. Try a more specific address.
    </p>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useHealthMap } from '~/composables/useHealthMap'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const { searchAddressSuggestions } = useHealthMap()

const suggestions = ref([])
const loading = ref(false)
const searched = ref(false)
const showSuggestions = ref(false)
const activeIndex = ref(-1)

/* Debounce timer + request token to drop stale responses */
let debounceTimer = null
let requestId = 0

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 350

function onInput(event) {
  const value = event.target.value
  emit('update:modelValue', value)

  /* Typing invalidates any previous selection */
  emit('select', null)

  clearTimeout(debounceTimer)
  const query = String(value || '').trim()

  if (query.length < MIN_QUERY_LENGTH) {
    suggestions.value = []
    searched.value = false
    showSuggestions.value = false
    activeIndex.value = -1
    return
  }

  debounceTimer = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS)
}

async function fetchSuggestions(query) {
  const token = ++requestId
  loading.value = true
  searched.value = true

  try {
    const results = await searchAddressSuggestions(query)
    if (token !== requestId) return /* stale response — a newer query superseded it */

    suggestions.value = results
    activeIndex.value = results.length > 0 ? 0 : -1
    showSuggestions.value = true
  } catch (e) {
    if (token !== requestId) return
    /* Fail quietly — autocomplete is an enhancement; typing freely still works */
    console.warn('Address autocomplete unavailable:', e)
    suggestions.value = []
    activeIndex.value = -1
    showSuggestions.value = false
  } finally {
    if (token === requestId) {
      loading.value = false
    }
  }
}

function onFocus() {
  if (suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

function onBlur() {
  /* Defer so item mousedown handlers run before the list disappears */
  setTimeout(() => closeSuggestions(), 150)
}

function closeSuggestions() {
  showSuggestions.value = false
  activeIndex.value = -1
}

function moveActive(delta) {
  if (!showSuggestions.value || suggestions.value.length === 0) return
  const count = suggestions.value.length
  activeIndex.value = (activeIndex.value + delta + count) % count
}

function confirmActive() {
  if (!showSuggestions.value || activeIndex.value < 0) return
  selectSuggestion(suggestions.value[activeIndex.value])
}

function selectSuggestion(suggestion) {
  emit('update:modelValue', suggestion.displayName)
  emit('select', { lat: suggestion.lat, lng: suggestion.lng, displayName: suggestion.displayName })
  closeSuggestions()
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  requestId++
})
</script>

<style scoped>
.address-autocomplete {
  position: relative;
  width: 100%;
}

.address-input-wrap {
  position: relative;
  width: 100%;
}

.address-input {
  width: 100%;
  height: 56px;
  border: 2px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  font-size: 1rem;
  padding: 0 1.25rem;
  color: var(--symply-text-primary);
  outline: none;
  background: var(--symply-card-bg);
  transition: all 0.2s;
  box-sizing: border-box;
}

.address-input::placeholder {
  color: var(--symply-text-muted);
}

.address-input:focus {
  border-color: var(--symply-primary);
  box-shadow: 0 0 0 3px var(--symply-primary-light);
}

/* Keep typed text visible in dark mode: Chrome's autofill paints a white
   background + dark text over the input, which hides the near-white theme
   text. Repaint the background to the theme surface and force the text color. */
.address-input:-webkit-autofill,
.address-input:-webkit-autofill:hover,
.address-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--symply-text-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--symply-card-bg) inset;
  caret-color: var(--symply-text-primary);
  transition: background-color 9999s ease-in-out 0s;
}

/* Small inline spinner while suggestions load */
.address-spinner {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 2px solid var(--symply-primary-light);
  border-top-color: var(--symply-primary);
  border-radius: 50%;
  animation: address-spin 0.7s linear infinite;
  pointer-events: none;
}

@keyframes address-spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.address-suggestions {
  list-style: none;
  padding: 0;
  margin: 0.375rem 0 0;
  border: 1px solid var(--symply-border);
  border-radius: 8px;
  background: var(--symply-card-bg);
  box-shadow: var(--symply-shadow-md);
  overflow: hidden;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 260px;
  overflow-y: auto;
  text-align: left;
}

.address-suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--symply-text-primary);
}

.address-suggestion-item + .address-suggestion-item {
  border-top: 1px solid var(--symply-border);
}

.address-suggestion-item:hover,
.address-suggestion-item--active {
  background: var(--symply-primary-light);
}

.address-suggestion-text {
  line-height: 1.35;
}

.address-suggestions-empty {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0.375rem 0 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--symply-border);
  border-radius: 8px;
  background: var(--symply-card-bg);
  box-shadow: var(--symply-shadow-md);
  color: var(--symply-text-muted);
  font-size: 0.875rem;
  text-align: left;
  z-index: 20;
}
</style>
