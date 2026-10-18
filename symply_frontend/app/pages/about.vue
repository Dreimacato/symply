<template>
  <div class="min-h-screen bg-[var(--symply-bg-app)] text-[var(--symply-text-primary)]" @keydown.esc.window="closeTeamBio">
    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div class="space-y-12">
        <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--symply-border)] pb-6">
          <button class="inline-flex items-center gap-2 rounded-lg border border-[var(--symply-border)] bg-[var(--symply-card-bg)] px-4 py-2 text-sm font-semibold text-[var(--symply-text-primary)] transition hover:border-[var(--symply-primary)] hover:bg-[var(--symply-primary-light)]" type="button" @click="goBack">
            <v-icon icon="mdi-arrow-left" size="18" aria-hidden="true" />
            Back
          </button>
          <p class="m-0 text-xs font-bold uppercase tracking-widest text-[var(--symply-primary)]">About Symply</p>
        </header>

        <section class="space-y-4 py-2">
          <h1 class="m-0 text-4xl font-semibold tracking-normal text-[var(--symply-text-primary)]">Who We Are</h1>
          <p class="max-w-4xl text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
            Symply is a healthcare navigation tool designed to help individuals better understand their health concerns and find appropriate healthcare services. Through an interactive body map, users can explore symptoms based on specific body areas, access relevant health information, and discover possible next steps based on their reported concerns.
          </p>
          <p class="max-w-4xl text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
            Recognizing that navigating health information and locating appropriate healthcare services can sometimes be challenging, Symply aims to provide a more accessible and user-friendly way for individuals to explore their concerns and become better informed about their healthcare options.
          </p>
        </section>

        <section class="grid divide-y divide-[var(--symply-border)] border-y border-[var(--symply-border)] md:grid-cols-2 md:divide-x md:divide-y-0">
          <article class="space-y-3 py-6 md:pr-8">
            <h2 class="m-0 text-2xl font-semibold tracking-normal text-[var(--symply-text-primary)]">Our Mission</h2>
            <p class="text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
              Symply aims to develop a simple and user-friendly healthcare navigation tool that connects individuals' reported symptoms with appropriate healthcare services and available local health resources.
            </p>
          </article>
          <article class="space-y-3 py-6 md:pl-8">
            <h2 class="m-0 text-2xl font-semibold tracking-normal text-[var(--symply-text-primary)]">Our Vision</h2>
            <p class="text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
              Symply envisions a healthcare environment where individuals can easily understand their health concerns and confidently navigate toward appropriate and accessible healthcare services.
            </p>
          </article>
        </section>

        <section class="space-y-5">
          <h2 class="m-0 text-2xl font-semibold tracking-normal text-[var(--symply-text-primary)]">What We Offer</h2>
          <ul class="grid list-none gap-3 p-0 sm:grid-cols-2">
            <li class="rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4"><strong class="mb-1 block text-sm font-semibold text-[var(--symply-text-primary)]">Interactive Body Map</strong><span class="offer-description block text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">Allows users to select specific body areas and explore related symptoms.</span></li>
            <li class="rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4"><strong class="mb-1 block text-sm font-semibold text-[var(--symply-text-primary)]">Symptom Information</strong><span class="offer-description block text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">Provides descriptions, associated symptoms, and relevant warning signs to help users better understand their concerns.</span></li>
            <li class="rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4"><strong class="mb-1 block text-sm font-semibold text-[var(--symply-text-primary)]">Assessment and Guidance</strong><span class="offer-description block text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">Guides users through relevant assessment questions and presents an urgency result based on the system's implemented assessment rules.</span></li>
            <li class="rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4"><strong class="mb-1 block text-sm font-semibold text-[var(--symply-text-primary)]">Self-Care Information</strong><span class="offer-description block text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">Presents general initial management guidance and information about when to seek professional care.</span></li>
            <li class="rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4 sm:col-span-2"><strong class="mb-1 block text-sm font-semibold text-[var(--symply-text-primary)]">Healthcare Navigation</strong><span class="offer-description block text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">Helps users locate nearby healthcare facilities and explore available options for further assistance.</span></li>
          </ul>
        </section>

        <section class="space-y-4 border-t border-[var(--symply-border)] pt-8">
          <h2 class="m-0 text-2xl font-semibold tracking-normal text-[var(--symply-text-primary)]">Our Commitment</h2>
          <p class="max-w-4xl text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
            We are committed to making health information easier to access, understand, and navigate. Through a clear and user-friendly platform, Symply aims to help individuals become more informed about their health concerns and available healthcare resources.
          </p>
          <p class="max-w-4xl text-justify text-base leading-7 text-[var(--symply-text-secondary)]">
            We also recognize the importance of responsible health communication. The information presented through Symply should support informed healthcare decisions without replacing professional evaluation or medical advice.
          </p>
        </section>

        <section class="team-section space-y-6 border-t border-[var(--symply-border)] pt-10">
          <div class="space-y-2">
            <p class="m-0 text-xs font-bold uppercase tracking-widest text-[var(--symply-primary)]">Meet the People Behind Symply</p>
            <h2 class="m-0 text-3xl font-semibold tracking-normal text-[var(--symply-text-primary)]">Meet the Symply Team</h2>
          </div>
          <div class="team-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article v-for="member in teamMembers" :key="member.id" class="team-member-block group relative z-0 min-w-0 rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4 shadow-sm transition hover:z-20 hover:-translate-y-0.5 hover:shadow-md focus-within:z-20">
              <h3 class="m-0 text-base font-semibold leading-snug text-[var(--symply-text-primary)]">{{ member.name }}</h3>

              <div
                class="team-photo-wrap relative mx-auto w-full max-w-60"
                @mouseenter="handleTeamBioHover(member, $event)"
                @mouseleave="hideTeamBio"
                @focusin="handleTeamBioHover(member, $event)"
                @focusout="handleTeamBioFocusOut"
              >
                <button
                  class="team-photo-slot flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--symply-border)] bg-[var(--symply-bg-app)] p-0 text-[var(--symply-text-muted)] transition hover:border-[var(--symply-primary)] hover:bg-[var(--symply-primary-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--symply-primary)]"
                  type="button"
                  :aria-label="`View ${member.name}'s biography`"
                  :aria-expanded="activeTeamBio === member.id"
                  :aria-controls="`team-bio-${member.id}`"
                  @click="toggleTeamBio(member, $event)"
                >
                  <img v-if="member.photo" :src="member.photo" :alt="member.name" :style="{ objectPosition: member.photoPosition || 'top' }" class="block h-full w-full object-cover" />
                  <v-icon v-else icon="mdi-image-outline" size="38" aria-hidden="true" />
                </button>

                <Transition name="team-bio">
                  <section
                    v-if="activeTeamBio === member.id"
                    :id="`team-bio-${member.id}`"
                    class="team-bio-dialog rounded-xl border border-[var(--symply-border)] bg-[var(--symply-card-bg)] p-4 text-[var(--symply-text-primary)] shadow-xl"
                    role="dialog"
                    aria-label="Biography"
                    :style="{ top: `${teamBioPosition.top}px`, left: `${teamBioPosition.left}px` }"
                  >
                    <header class="mb-3 border-b border-[var(--symply-border)] pb-3">
                      <p class="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--symply-primary)]">Biography</p>
                      <h3 class="m-0 text-base font-semibold leading-snug text-[var(--symply-text-primary)]">{{ member.name }}</h3>
                    </header>
                    <div class="team-bio-content text-justify">
                      <p v-for="(paragraph, index) in member.bio" :key="index" class="text-justify text-sm leading-6 text-[var(--symply-text-secondary)]">{{ paragraph }}</p>
                    </div>
                  </section>
                </Transition>
              </div>
            </article>
          </div>
        </section>

        <section class="space-y-3 border-t border-slate-200 pt-8 dark:border-slate-800">
          <h2 class="m-0 text-xl font-semibold tracking-normal text-slate-900 dark:text-white">Important Disclaimer</h2>
          <p class="max-w-4xl text-justify text-sm leading-6 text-slate-500 dark:text-slate-400">
            Symply provides general health information and guidance for educational purposes.
            It does not replace professional medical advice, diagnosis, or treatment.
            Assessment results should not be considered a definitive medical diagnosis.
            Users experiencing potentially life-threatening symptoms should seek emergency
            medical assistance immediately.
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTeamBio = ref(null)
const teamBioPosition = ref({ top: 16, left: 16 })

const teamMembers = [
  {
    id: 'jean',
    name: 'Jean Arren S. Pangan',
    photo: '/team/jean-arren-pangan.png',
    bio: [
      `I am part of Symply, where I help bring our ideas to life through website development, interface design, and creative problem-solving. I enjoy exploring how technology and healthcare can work together to create something useful and meaningful for the community.`,
      `Outside academics and project work, I enjoy graphic design, digital art, listening to music, playing video games, and exploring different fragrances. I am also a self-proclaimed clean freak who enjoys keeping things neat, clean, and organized. I always look forward to learning new things, exploring my interests, and finding ways to improve my skills.`,
    ],
  },
  {
    id: 'john-paul',
    name: 'John Paul Q. Guinto',
    photo: '/team/john-paul-guinto.png',
    bio: [
      `I am a nursing student who enjoys designing and organizing things, especially when it comes to academic work. I love exploring new ideas, learning new skills, and discovering opportunities that help me grow both personally and academically.`,
      `Outside my studies, I enjoy having coffee and taking time to relax. As a nursing student, I am eager to expand my knowledge, develop my skills, and contribute to meaningful projects like Symply that promote learning and improve nursing practice.`,
    ],
  },
  {
    id: 'helary-joy',
    name: 'Helary Joy B. Canilao',
    photo: '/team/helary-joy-canilao.png',
    photoPosition: 'center',
    bio: [
      `I am a nursing student with a heart for compassion, patience, and continuous learning. I consider myself a quiet and observant person who enjoys getting to know others and paying attention to details. I am committed to self-improvement, both personally and academically.`,
      `I also enjoy being creative, especially when brainstorming ideas and exploring different scenarios for role-playing activities. I welcome constructive criticism and value collaboration in achieving shared goals. Through this evidence-informed project, I aim to contribute my knowledge, creativity, and dedication to research that can enhance nursing practice and ultimately improve patient care.`,
    ],
  },
  {
    id: 'larissa',
    name: 'Larissa Ann Juliette C. Garcia',
    photo: '/team/larissa-ann-juliette-garcia.png',
    bio: [
      `As someone who considers herself an empath, I have always wanted to help people feel heard, understood, and less alone. I believe that caring goes beyond treating illnesses; it also means providing comfort, understanding, and guidance.`,
      `Through Symply, we hope to put our compassion into action by helping make healthcare information more accessible and healthcare navigation less overwhelming for those who need it.`,
    ],
  },
  {
    id: 'erica-mae',
    name: 'Erica Mae G. Marcelo',
    photo: '/team/erica-mae-marcelo.png',
    bio: [
      `I am a nursing student with interests that extend beyond healthcare, particularly in graphic layout design, writing, and makeup. I enjoy exploring creative ideas, developing visual concepts, and expressing myself through design and words.`,
      `Outside academics, I am a cat person who appreciates the simple things that bring joy to everyday life. Through this evidence-informed project, I look forward to applying my knowledge and contributing to research that supports nursing practice.`,
    ],
  },
  {
    id: 'frances-mikaela',
    name: 'Frances Mikaela C. Santos',
    photo: '/team/frances-mikaela-santos.png',
    bio: [
      `I’m a nursing student with a love for literature, film, and understanding the human experience. I enjoy reading classic literature and annotating the pages with my thoughts, as well as watching films and writing essays about them on my Substack account.`,
      `As part of Symply, I hope to bring this curiosity and appreciation for different perspectives into making health information more accessible, understandable, and meaningful. I believe that understanding people begins with listening to their stories, and that healthcare should always be rooted in empathy and compassion.`,
    ],
  },
]

function showTeamBio(member, event) {
  const wrapper = event.currentTarget.closest('.team-photo-wrap')
  const trigger = wrapper.getBoundingClientRect()
  const panelWidth = Math.min(440, window.innerWidth - 32)
  const margin = 16

  let left = trigger.right + 12
  if (left + panelWidth > window.innerWidth - margin) {
    left = trigger.left - panelWidth - 12
  }
  left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin))

  teamBioPosition.value = { top: 0, left: left - trigger.left }
  activeTeamBio.value = member.id

  nextTick(() => {
    if (activeTeamBio.value !== member.id) return

    const panel = document.getElementById(`team-bio-${member.id}`)
    if (!panel) return

    const panelHeight = panel.getBoundingClientRect().height
    const maxTop = window.innerHeight - panelHeight - margin
    const top = Math.max(margin, Math.min(trigger.top, maxTop))
    teamBioPosition.value = {
      top: top - trigger.top,
      left: left - trigger.left,
    }
  })
}

function toggleTeamBio(member, event) {
  if (window.matchMedia('(hover: none)').matches && activeTeamBio.value === member.id) {
    closeTeamBio()
    return
  }

  showTeamBio(member, event)
}

function handleTeamBioHover(member, event) {
  if (!window.matchMedia('(hover: none)').matches) {
    showTeamBio(member, event)
  }
}

function hideTeamBio() {
  activeTeamBio.value = null
}

function closeTeamBio() {
  hideTeamBio()
}

function handleTeamBioFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    hideTeamBio()
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

useHead({
  title: 'About Symply',
})
</script>

<style scoped>
.team-bio-dialog {
  position: absolute;
  z-index: 1200;
  width: min(440px, calc(100vw - 2rem));
  overflow: visible;
}

.team-bio-content p {
  margin: 0;
  text-align: justify;
  text-justify: inter-word;
}

.team-bio-content p + p {
  margin-top: 0.8rem;
}

.team-bio-enter-active,
.team-bio-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.team-bio-enter-from,
.team-bio-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.team-bio-enter-to,
.team-bio-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.team-member-block p + p {
  margin-top: 0.8rem;
}
</style>
