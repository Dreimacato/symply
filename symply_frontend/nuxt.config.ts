// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify'],
  },

  css: ['~/assets/css/preline-about.css', '~/assets/css/aura-arctic-frost.css', '~/assets/css/profile-card.css'],

  runtimeConfig: {
    public: {
      strapiBase: process.env.STRAPI_URL || 'http://localhost:1337',
      /* SYMPY_USE_FIXTURE=1 serves local sample facilities instead of
         calling the live Overpass API (local dev only) */
      useFixture: process.env.SYMPY_USE_FIXTURE === '1',
    },
  },

  app: {
    head: {
      title: 'Symply',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  vite: {
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
    plugins: [tailwindcss(), vuetify({ autoImport: true })],
  },

  compatibilityDate: '2024-08-01',

  srcDir: 'app/',
  dir: {
    public: 'public',
  },
})
