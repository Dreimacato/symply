<template>
  <NuxtLayout>
    <Transition :name="transitionName" mode="out-in">
      <NuxtPage />
    </Transition>
  </NuxtLayout>
</template>

<script setup>
import { useNavigation } from '~/composables/useNavigation'
import { computed } from 'vue'

const { direction } = useNavigation()

const transitionName = computed(() => {
  if (!direction.value) {
    return 'page'
  }
  return direction.value === 'forward' ? 'page-forward' : 'page-back'
})
</script>

<style>
/* =========================================
   Base
========================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  color-scheme: light;
  --symply-primary: #06B6D4;
  --symply-primary-dark: #0891B2;
  --symply-primary-light: rgba(6, 182, 212, 0.1);
  --symply-primary-bg: #0B4F8F;
  --symply-bg-app: #FAFBFC;
  --symply-card-bg: #FFFFFF;
  --symply-footer-bg: #edf7f6;
  --symply-border: #E2E8F0;
  --symply-text-primary: #0F172A;
  --symply-text-secondary: #334155;
  --symply-text-muted: #64748B;
  --symply-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --symply-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --symply-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --symply-radius-sm: 6px;
  --symply-radius-md: 8px;
  --symply-radius-lg: 12px;
  --symply-radius-xl: 16px;
}

/* =========================================
   Dark theme (activated via data-theme="dark" on <html>)
========================================= */
:root[data-theme='dark'] {
  color-scheme: dark;
  --symply-primary: #22D3EE;
  --symply-primary-dark: #06B6D4;
  --symply-primary-light: rgba(34, 211, 238, 0.14);
  --symply-primary-bg: #38BDF8;
  --symply-bg-app: #0B1220;
  --symply-card-bg: #16223A;
  --symply-footer-bg: #0d1626;
  --symply-border: #2E3D57;
  --symply-text-primary: #F2F7FF;
  --symply-text-secondary: #C3D0E0;
  --symply-text-muted: #B4C2D4;
  --symply-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --symply-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
  --symply-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.55), 0 4px 6px -2px rgba(0, 0, 0, 0.45);
}

html,
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--symply-bg-app);
  color: var(--symply-text-primary);
}

/* =========================================
   Typography scale
========================================= */

h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.02em;
  line-height: 1.25;
  font-weight: 700;
  color: var(--symply-text-primary);
}

h1 { font-size: 2rem; margin-bottom: 1.5rem; }
h2 { font-size: 1.5rem; margin-bottom: 1.25rem; }
h3 { font-size: 1.25rem; margin-bottom: 1rem; }
h4 { font-size: 1.1rem; margin-bottom: 0.75rem; }
p {
  color: var(--symply-text-secondary);
  line-height: 1.65;
  margin-bottom: 1rem;
}

/* =========================================
   Vuetify overrides
========================================= */

.v-application {
  font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
}

.v-btn {
  font-weight: 600 !important;
  text-transform: none !important;
}

.v-input__slot {
  border-radius: var(--symply-radius-md) !important;
}

.v-text-field .v-field--variant-outlined {
  border-radius: var(--symply-radius-md) !important;
}

.v-select .v-select__selection {
  font-weight: 500 !important;
}

/* =========================================
   Directional page transitions
========================================= */

.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Forward navigation (right to left) */
.page-forward-enter-from,
.page-forward-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.page-forward-enter-to,
.page-forward-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.page-forward-enter-active,
.page-forward-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

/* Backward navigation (left to right) */
.page-back-enter-from,
.page-back-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.page-back-enter-to,
.page-back-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.page-back-enter-active,
.page-back-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

/* =========================================
   Text slide-in
   Every text element slides up into place whenever it is added to the page:
   on route changes, and when modals, drawers, steps or filtered lists swap
   their content (new DOM nodes replay the animation). Uses transform and
   opacity only, so it is cheap and never shifts the layout. Reduced motion
   is handled by the global rule below, which shortens all animations.
========================================= */

@keyframes symply-text-slide-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

h1, h2, h3, h4, h5, h6,
p, li, label, legend, figcaption, blockquote,
th, td, dt, dd,
.v-card-title, .v-card-subtitle, .v-card-text,
.v-list-item-title, .v-list-item-subtitle, .v-chip__content, .v-alert__content {
  animation: symply-text-slide-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

/* Page changes: pure fade (no sideways slide) so it doesn't fight the
   text's own slide-up */
.page-enter-from,
.page-leave-to,
.page-forward-enter-from,
.page-forward-leave-to,
.page-back-enter-from,
.page-back-leave-to {
  transform: none !important;
}

/* =========================================
   Focus ring
========================================= */

:focus-visible {
  outline: 2px solid var(--symply-primary);
  outline-offset: 2px;
  border-radius: var(--symply-radius-sm);
}

/* =========================================
   Reduced motion
========================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* =========================================
   Utility
========================================= */

.v-container.container--fluid {
  max-width: 100% !important;
}

/* =========================================
   Global Component Styles
========================================= */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 10px 20px;
  border-radius: var(--symply-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--symply-primary-bg) 0%, var(--symply-primary) 100%);
  color: white;
  box-shadow: var(--symply-shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--symply-shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: white;
  color: var(--symply-text-secondary);
  border: 2px solid var(--symply-border);
}

.btn-secondary:hover {
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
  background: #F8FAFC;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.card {
  background: var(--symply-card-bg);
  border-radius: var(--symply-radius-lg);
  box-shadow: var(--symply-shadow-sm);
  padding: 24px;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--symply-shadow-md);
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 1rem;
  color: var(--symply-text-primary);
  background: white;
  border: 2px solid var(--symply-border);
  border-radius: var(--symply-radius-md);
  outline: none;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: var(--symply-primary);
  box-shadow: 0 0 0 3px var(--symply-primary-light);
}


/* =========================================
   Input Field Styles
========================================= */

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--symply-text-primary);
  margin-bottom: 0.5rem;
}

.input-label-required::after {
  content: ' *';
  color: #EF4444;
}

/* =========================================
   Button Group Styles
========================================= */

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* =========================================
   Empty State
========================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--symply-text-muted);
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state-text {
  font-size: 1rem;
  font-weight: 500;
}

/* =========================================
   Badge
========================================= */

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary {
  background: var(--symply-primary-light);
  color: var(--symply-primary);
}

.badge-success {
  background: #D1FAE5;
  color: #059669;
}

.badge-warning {
  background: #FEF3C7;
  color: #D97706;
}

/* =========================================
   Modal Overlay
========================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

/* =========================================
   Card Grid
========================================= */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================
   Night mode overrides (applied on top of the :root[data-theme='dark']
   variables)
========================================= */

:root[data-theme='dark'] .modal-overlay {
  background: rgba(0, 0, 0, 0.55);
}
:root[data-theme='dark'] .card,
:root[data-theme='dark'] .card:hover {
  background: var(--symply-card-bg);
  box-shadow: var(--symply-shadow-md);
}
:root[data-theme='dark'] .input-field {
  background: var(--symply-card-bg);
  border-color: var(--symply-border);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .input-field:focus {
  border-color: var(--symply-primary);
  box-shadow: 0 0 0 3px var(--symply-primary-light);
}
:root[data-theme='dark'] .input-label {
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .empty-state,
:root[data-theme='dark'] .empty-state-text {
  color: var(--symply-text-muted);
}
:root[data-theme='dark'] .badge-primary {
  background: var(--symply-primary-light);
  color: var(--symply-primary);
}
:root[data-theme='dark'] .badge-success {
  background: #166534;
  color: #86EFAC;
}
:root[data-theme='dark'] .badge-warning {
  background: #7C2D12;
  color: #FDE68A;
}
:root[data-theme='dark'] .btn-secondary {
  background: var(--symply-card-bg);
  color: var(--symply-text-primary);
  border-color: var(--symply-border);
}
:root[data-theme='dark'] .btn-secondary:hover {
  background: var(--symply-card-bg);
  border-color: var(--symply-primary);
  color: var(--symply-text-primary);
}
:root[data-theme='dark'] .btn-primary {
  background: linear-gradient(135deg, var(--symply-primary-bg) 0%, var(--symply-primary) 100%);
  color: white;
}
:root[data-theme='dark'] .btn-primary:hover {
  box-shadow: var(--symply-shadow-md);
}
</style>