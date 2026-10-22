<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

const props = withDefaults(defineProps<{
  avatarUrl?: string;
  iconUrl?: string;
  miniAvatarUrl?: string;
  photoPosition?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  statusColor?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  theme?: 'dark' | 'light';
  backdropColor?: string;
  radius?: number;
  holo?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  parallax?: number;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  intro?: boolean;
  className?: string;
}>(), {
  avatarUrl: '',
  photoPosition: 'center bottom',
  name: 'Javi A. Torres',
  title: 'Software Engineer',
  handle: 'javicodes',
  status: 'Online',
  statusColor: '#22c55e',
  contactText: 'Contact',
  showUserInfo: true,
  theme: 'dark',
  radius: 16,
  holo: 0.8,
  glare: 0.5,
  enableTilt: true,
  tiltStrength: 12,
  parallax: 8,
  enableMobileTilt: false,
  mobileTiltSensitivity: 5,
  intro: true,
  className: '',
});

const root = useTemplateRef('root');
const size = ref({ width: 0, height: 0 });

const palette = computed(() => props.theme ?? 'dark');
const foil = computed(() => (props.holo ?? 0) > 0 ? 'dark' : 'light');
const backdrop = computed(() => props.backdropColor ?? (palette.value === 'dark' ? 'rgba(18, 27, 43, 0.7)' : 'rgba(255,255,255,0.06)'));
const grain = computed(() => 0.05);

const themes = computed(() => ({
  dark: {
    '--pc-frame': 'rgba(12, 18, 30, 0.74)',
    '--pc-frame-shadow': '0 10px 30px -10px rgba(0,0,0,0.7)',
    '--pc-tile': 'rgba(255,255,255,0.1)',
    '--pc-tile-edge': 'rgba(255,255,255,0.18)',
    '--pc-tile-highlight': 'rgba(255,255,255,0.05)',
    '--pc-tile-shadow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
    '--pc-ink': '#ffffff',
    '--pc-muted': 'rgba(255,255,255,0.78)',
    '--pc-sheen': 'rgba(255,255,255,0.5)',
    '--pc-falloff': 'radial-gradient(farthest-corner circle at var(--pc-pointer-x) var(--pc-pointer-y), hsla(0,0%,0%,0.15) 0%, hsla(0,0%,0%,0) 70%)',
    '--pc-blend': 'normal',
    '--pc-holo-filter': 'none',
    '--pc-press': 'brightness(1.2)',
    '--pc-hover': 'brightness(1.1)',
    '--pc-frame-edge': 'rgba(255,255,255,0.14)',
    '--pc-frame-highlight': 'rgba(255,255,255,0.06)',
    '--pc-shade': 'rgba(0,0,0,0.25)',
    '--pc-holo-hue': '205',
  },
  light: {
    '--pc-frame': 'rgba(0,0,0,0.05)',
    '--pc-frame-shadow': '0 10px 30px -10px rgba(0,0,0,0.1)',
    '--pc-tile': 'rgba(255,255,255,0.03)',
    '--pc-tile-edge': 'rgba(0,0,0,0.06)',
    '--pc-tile-highlight': 'rgba(255,255,255,0.6)',
    '--pc-tile-shadow': 'inset 0 1px 0 rgba(255,255,255,0.6)',
    '--pc-ink': '#111827',
    '--pc-muted': 'rgba(17,24,39,0.6)',
    '--pc-sheen': 'rgba(255,255,255,0.8)',
    '--pc-falloff': 'radial-gradient(farthest-corner circle at var(--pc-pointer-x) var(--pc-pointer-y), hsla(0,0%,100%,0.3) 0%, hsla(0,0%,100%,0) 70%)',
    '--pc-blend': 'screen',
    '--pc-holo-filter': 'saturate(1.5)',
    '--pc-press': 'brightness(0.9)',
    '--pc-hover': 'brightness(0.95)',
    '--pc-frame-edge': 'rgba(0,0,0,0.06)',
    '--pc-frame-highlight': 'rgba(255,255,255,0.8)',
    '--pc-shade': 'rgba(0,0,0,0.1)',
    '--pc-holo-hue': '205',
  },
})[palette.value] || {});

const x = ref({ p: 0, v: 0, target: 0 });
const y = ref({ p: 0, v: 0, target: 0 });
const light = ref({ p: 0, target: 0 });
const reducedRef = ref(false);

let raf = 0;
let last = 0;
let slowUntil = 0;
let touchId: number | null = null;
let observer: ResizeObserver | null = null;
let rootEl: HTMLElement | null = null;

const reduced = () => {
  reducedRef.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const write = () => {
  const el = root.value;
  if (!el) return;
  const angle = props.enableTilt && !reducedRef.value ? props.tiltStrength : 0;
  const tilt = Math.min(1, Math.hypot(x.value.p, y.value.p));
  const st = el.style;
  st.setProperty('--pc-light-x', `${((x.value.p + 1) * 0.5 * size.value.width).toFixed(1)}px`);
  st.setProperty('--pc-light-y', `${((y.value.p + 1) * 0.5 * size.value.height).toFixed(1)}px`);
  st.setProperty('--pc-pointer-x', `${((x.value.p + 1) * 50).toFixed(2)}%`);
  st.setProperty('--pc-pointer-y', `${((y.value.p + 1) * 50).toFixed(2)}%`);
  st.setProperty('--pc-band-x', `${(50 + x.value.p * 15).toFixed(2)}%`);
  st.setProperty('--pc-band-y', `${(50 + y.value.p * 15).toFixed(2)}%`);
  st.setProperty('--pc-rotate-x', `${(y.value.p * angle).toFixed(3)}deg`);
  st.setProperty('--pc-rotate-y', `${(-x.value.p * angle).toFixed(3)}deg`);
  st.setProperty('--pc-shift-x', `${(x.value.p * (reducedRef.value ? 0 : props.parallax)).toFixed(2)}px`);
  st.setProperty('--pc-shift-y', `${(y.value.p * (reducedRef.value ? 0 : props.parallax)).toFixed(2)}px`);
  st.setProperty('--pc-reach', tilt.toFixed(4));
  st.setProperty('--pc-tilt', (tilt * light.value.p).toFixed(4));
  st.setProperty('--pc-active', light.value.p.toFixed(4));
};

const frame = (now: number) => {
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;
  const slow = now < slowUntil;
  const stiffness = slow ? 24 : 120;
  const damping = slow ? 9 : 16;
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    for (const axis of [x.value, y.value]) {
      axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
      axis.p += axis.v * h;
    }
  }
  const tau = light.value.target > light.value.p ? 0.18 : slow ? 0.9 : 0.45;
  light.value.p += (light.value.target - light.value.p) * (1 - Math.exp(-dt / tau));
  write();
  const moving =
    Math.abs(x.value.target - x.value.p) > 0.0005 ||
    Math.abs(y.value.target - y.value.p) > 0.0005 ||
    Math.abs(x.value.v) > 0.0005 ||
    Math.abs(y.value.v) > 0.0005 ||
    Math.abs(light.value.target - light.value.p) > 0.002;
  if (moving) {
    raf = requestAnimationFrame(frame);
  } else {
    x.value.p = x.value.target;
    y.value.p = y.value.target;
    light.value.p = light.value.target;
    write();
    raf = 0;
  }
};

const wake = () => {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
};

const aim = (nx: number, ny: number, on = true) => {
  x.value.target = Math.min(1, Math.max(-1, nx));
  y.value.target = Math.min(1, Math.max(-1, ny));
  light.value.target = on ? 1 : 0;
  slowUntil = 0;
  wake();
};

const aimAt = (event: MouseEvent | TouchEvent) => {
  if (!rootEl) return;
  const rect = rootEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  aim(
    ((event as MouseEvent).clientX - rect.left) / rect.width * 2 - 1,
    ((event as MouseEvent).clientY - rect.top) / rect.height * 2 - 1
  );
};

const release = () => aim(0, 0, false);

const onEnter = (event: MouseEvent) => {
  if (event.pointerType === 'mouse') aimAt(event);
};

const onMove = (event: MouseEvent) => {
  if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
};

const onLeave = (event: MouseEvent) => {
  if (event.pointerType === 'mouse') release();
};

const onDown = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') return;
  if (!props.enableMobileTilt) return;
  touchId = event.pointerId;
  aimAt(event);
};

const onUp = (event: PointerEvent) => {
  if (event.pointerId !== touchId) return;
  touchId = null;
  release();
};

onMounted(() => {
  reduced();
  rootEl = root.value;
  if (!rootEl) return;

  observer = new ResizeObserver(() => {
    size.value.width = rootEl!.offsetWidth;
    size.value.height = rootEl!.offsetHeight;
    write();
  });
  observer.observe(rootEl);

  if (props.intro && !reducedRef.value) {
    x.value.p = 0.62;
    y.value.p = -0.55;
    light.value.p = 1;
    slowUntil = performance.now() + 1400;
    write();
    wake();
  } else {
    write();
  }

  rootEl.addEventListener('pointerenter', onEnter);
  rootEl.addEventListener('pointermove', onMove);
  rootEl.addEventListener('pointerleave', onLeave);
  rootEl.addEventListener('pointerdown', onDown);
  rootEl.addEventListener('pointerup', onUp);
  rootEl.addEventListener('pointercancel', onUp);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  observer?.disconnect();
  observer = null;
  if (rootEl) {
    rootEl.removeEventListener('pointerenter', onEnter);
    rootEl.removeEventListener('pointermove', onMove);
    rootEl.removeEventListener('pointerleave', onLeave);
    rootEl.removeEventListener('pointerdown', onDown);
    rootEl.removeEventListener('pointerup', onUp);
    rootEl.removeEventListener('pointercancel', onUp);
  }
  rootEl = null;
});

watch(
  () => [props.enableTilt, props.tiltStrength, props.parallax, props.theme, props.holo, props.glare, props.radius],
  () => {
    write();
  },
  { immediate: true }
);
</script>

<template>
  <div
    ref="root"
    class="profile-card"
    :class="[className]"
    :style="{
      ...themes,
      '--pc-radius': `${Math.max(0, radius)}px`,
      '--pc-backdrop': backdrop,
      '--pc-holo': `${Math.min(1, Math.max(0, holo))}`,
      '--pc-glare': `${Math.min(1, Math.max(0, glare))}`,
      '--pc-parallax': `${Math.max(0, parallax)}px`,
      '--pc-status': statusColor,
      '--pc-grain': `${grain}`,
      '--pc-pattern': iconUrl ? `url('${iconUrl}')` : 'linear-gradient(#000, #000)',
      '--pc-pattern-size': iconUrl ? '180% auto' : '100% 100%',
      '--pc-holo-gain': iconUrl ? 1.25 : 0.75,
      '--pc-holo-detail': iconUrl && foil === 'dark' ? 1 : 0,
    }"
  >
    <div class="profile-card__body">
      <div class="profile-card__tile">
        <span class="profile-card__sheen" />
        <span class="profile-card__holo">
          <span class="profile-card__holo-glow" />
          <span class="profile-card__holo-shift" />
        </span>
        <img v-if="avatarUrl" class="profile-card__photo" :src="avatarUrl" :alt="name || ''" :style="{ objectPosition: photoPosition }" loading="lazy" draggable="false" />
        <template v-if="name || title">
          <span class="profile-card__scrim" />
          <div class="profile-card__info">
            <h3 v-if="name" class="profile-card__name">{{ name }}</h3>
            <p v-if="title" class="profile-card__title">{{ title }}</p>
          </div>
        </template>
        <span class="profile-card__tile-rim" />
      </div>

      <div v-if="showUserInfo" class="profile-card__footer">
        <span v-if="miniAvatarUrl" class="profile-card__avatar">
          <img :src="miniAvatarUrl" alt="" loading="lazy" draggable="false" />
        </span>
        <div class="profile-card__meta">
          <span v-if="handle" class="profile-card__handle">@{{ handle }}</span>
          <span class="profile-card__status">{{ status }}</span>
        </div>
        <button
          v-if="contactText"
          type="button"
          class="profile-card__contact"
          :aria-label="name ? `${contactText} ${name}` : contactText"
          @click="onContactClick"
        >
          <v-icon icon="mdi-email" size="16" aria-hidden="true" />
          {{ contactText }}
        </button>
      </div>

      <span class="profile-card__glare" />
      <span class="profile-card__shade" />
      <span class="profile-card__rim" />
    </div>
  </div>
</template>
