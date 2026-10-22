<template>
  <div class="symply-info-page aura-page-transparent min-h-screen text-[var(--symply-text-primary)]">
    <!-- Clean Minimal Header -->
    <!-- <header class="clean-header">
      <div class="header-container">
      </div>
    </header> -->

    <!-- Main Content -->
    <main class="main-content flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <div class="content-container w-full max-w-2xl">

        <div class="text-center intro-section mb-8">
          <RotatingText />
          <p class="intro-subtitle text-center m-0 mt-4 text-base text-[var(--symply-text-secondary)] sm:text-lg">
            Tell us a little about yourself to get started.
          </p>
        </div>

        <div class="form-grid grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          <!-- Age Column -->
          <div class="form-column age-column flex flex-col">
            <label class="form-label mb-2 text-sm font-semibold text-[var(--symply-text-primary)]">Age</label>
            <input
              v-model="age"
              type="number"
              min="0"
              max="120"
              class="age-input-box h-14 w-full appearance-none rounded-lg border-2 border-[var(--symply-border)] bg-[var(--symply-card-bg)] px-4 text-center text-lg text-[var(--symply-text-primary)] outline-none transition focus:border-[var(--symply-primary)] focus:ring-4 focus:ring-[var(--symply-primary-light)]"
              placeholder=""
            />
          </div>

          <!-- Sex Column -->
          <div class="form-column sex-column flex flex-col">
            <label class="form-label mb-2 text-sm font-semibold text-[var(--symply-text-primary)]">Sex</label>
            <div class="sex-buttons flex overflow-hidden rounded-lg border-2 border-[var(--symply-border)]">
              <button
                class="sex-button border-0 min-h-14 flex-1 bg-[var(--symply-card-bg)] px-4 text-sm font-medium text-[var(--symply-text-secondary)] transition hover:bg-[var(--symply-primary-light)] hover:text-[var(--symply-text-primary)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[var(--symply-primary)]"
                :class="sex === 'male' ? 'bg-[var(--symply-primary-light)] text-[var(--symply-primary-bg)] font-semibold' : ''"
                @click="sex = 'male'"
                type="button"
              >
                Male
              </button>
              <button
                class="sex-button border-0 min-h-14 flex-1 bg-[var(--symply-card-bg)] px-4 text-sm font-medium text-[var(--symply-text-secondary)] transition hover:bg-[var(--symply-primary-light)] hover:text-[var(--symply-text-primary)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[var(--symply-primary)]"
                :class="sex === 'female' ? 'bg-[var(--symply-primary-light)] text-[var(--symply-primary-bg)] font-semibold' : ''"
                @click="sex = 'female'"
                type="button"
              >
                Female
              </button>
            </div>
          </div>
        </div>

        <!-- Address Field -->
        <div class="address-section mt-6 flex flex-col">
          <label class="form-label mb-2 text-sm font-semibold text-[var(--symply-text-primary)]">Address</label>
          <AddressAutocomplete
            v-model="address"
            @select="onAddressSelected"
          />
        </div>

        <div class="action-container mt-6 flex justify-center">
          <button
            class="continue-button inline-flex min-h-12 w-full max-w-80 items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--symply-primary)]"
            :class="isFormValid ? 'cursor-pointer bg-[var(--symply-primary-bg)] text-white shadow-sm hover:brightness-110' : 'cursor-not-allowed bg-[var(--symply-border)] text-[var(--symply-text-muted)]'"
            @click="handleContinue"
            :disabled="!isFormValid"
            type="button"
          >
            Continue
            <svg class="chevron-right" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStrapi } from '~/composables/useStrapi'
import { useHead } from '#app'

const router = useRouter()
const age = ref('')
const sex = ref('')
const address = ref('')
const containerRef = ref(null)
const { createUserProfile } = useStrapi()

// Local storage keys for profile data
const STORAGE_KEYS = {
  age: 'symply_user_age',
  sex: 'symply_user_sex',
  address: 'symply_user_address',
  lat: 'symply_user_lat',
  lng: 'symply_user_lng',
}

// Coordinates of the address picked from autocomplete (null when typed manually)
const selectedCoords = ref(null)

function onAddressSelected(suggestion) {
  selectedCoords.value = suggestion
}

const isFormValid = computed(() => {
  if (!age.value) return false
  const ageNum = parseInt(age.value)
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) return false
  if (!sex.value) return false
  if (!address.value || address.value.trim().length < 3) return false
  return true
})

function formatGender(genderValue) {
  return genderValue === 'male' ? 'Male' : 'Female'
}

async function handleContinue() {
  if (!isFormValid.value) return

  // Save to localStorage first so navigation never depends on Strapi availability
  localStorage.setItem(STORAGE_KEYS.age, age.value)
  localStorage.setItem(STORAGE_KEYS.sex, sex.value)
  localStorage.setItem(STORAGE_KEYS.address, address.value)

  // Persist the exact coordinates of the picked suggestion so the
  // Where to Get Help map doesn't have to re-geocode the address
  if (
    selectedCoords.value &&
    Number.isFinite(selectedCoords.value.lat) &&
    Number.isFinite(selectedCoords.value.lng)
  ) {
    localStorage.setItem(STORAGE_KEYS.lat, String(selectedCoords.value.lat))
    localStorage.setItem(STORAGE_KEYS.lng, String(selectedCoords.value.lng))
  } else {
    localStorage.removeItem(STORAGE_KEYS.lat)
    localStorage.removeItem(STORAGE_KEYS.lng)
  }

  // Attempt to create the user_profile in Strapi. A failure here must not
  // block the assessment flow, so it is logged and swallowed.
  try {
    await createUserProfile({
      Age: parseInt(age.value),
      Gender: formatGender(sex.value),
      Location: address.value.trim(),
    })
  } catch (error) {
    console.error('Failed to save user profile to Strapi (continuing locally):', error)
  }

  // Navigate to symptoms page
  router.push('/bodymap')
}

useHead({
  title: 'Symply',
})
</script>

<style scoped>
.symply-info-page {
  position: relative;
  overflow: hidden;
}

.main-content,
.main-content .content-container {
  position: relative;
  z-index: 1;
}

.main-heading {
  font-family: 'Avenir Next', 'Segoe UI', sans-serif;
}

.sex-button + .sex-button {
  border-left: 1px solid var(--symply-border);
}

/* Age Input */
.age-input-box::-webkit-outer-spin-button,
.age-input-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Keep typed text visible in dark mode: Chrome's autofill paints a white
   background + dark text over the input, which hides the near-white theme
   text. Repaint the background to the theme surface and force the text color. */
.age-input-box:-webkit-autofill,
.age-input-box:-webkit-autofill:hover,
.age-input-box:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--symply-text-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--symply-card-bg) inset;
  caret-color: var(--symply-text-primary);
  transition: background-color 9999s ease-in-out 0s;
}

</style>