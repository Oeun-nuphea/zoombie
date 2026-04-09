<template>
  <div class="presentation-wrapper">
    <!-- Header with Back Button -->
    <header class="presentation-header">
      <button class="btn-back" @click="goHome">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Game
      </button>
      <div class="slide-indicator">
        Slide {{ currentSlide + 1 }} / {{ slides.length }}
      </div>
    </header>

    <!-- Main Slide Area -->
    <main class="presentation-main">
      <Transition name="slide-fade" mode="out-in">
        <div :key="currentSlide" class="slide-content">
          <h1 class="slide-title">{{ slides[currentSlide].title }}</h1>

          <div class="slide-body">
            <!-- Render custom lists if available -->
            <ul v-if="slides[currentSlide].list" class="slide-list">
              <li v-for="(item, index) in slides[currentSlide].list" :key="index" v-html="item"></li>
            </ul>

            <!-- Render specific slide content -->
            <template v-else>
              <p class="slide-text" v-for="(p, index) in slides[currentSlide].text" :key="index" v-html="p"></p>
            </template>
          </div>

          <!-- Call to action button on last slide -->
          <button v-if="currentSlide === slides.length - 1" class="btn-cta" @click="startGame">
            Play Survival Arena Now!
          </button>
        </div>
      </Transition>
    </main>

    <!-- Footer Controls -->
    <footer class="presentation-footer">
      <button class="nav-control" :disabled="currentSlide === 0" @click="prevSlide">
        Prev
      </button>

      <div class="dots-container">
        <button v-for="i in slides.length" :key="i" class="nav-dot" :class="{ active: currentSlide === i - 1 }"
          @click="goToSlide(i - 1)"></button>
      </div>

      <button class="nav-control" :disabled="currentSlide === slides.length - 1" @click="nextSlide">
        Next
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { requestDocumentFullscreen } from '../composables/useFullscreenMode'
import { useGameStore } from '../stores/gameStore'
import { getGameRuntimeProfile } from '../utils/device'

const router = useRouter()
const gameStore = useGameStore()
const currentSlide = ref(0)
const runtimeProfile = getGameRuntimeProfile()

const slides = [
  {
    title: '🧟 Survival Arena',
    text: [
      '<strong>A browser-based 2D top-down zombie survival game.</strong>',
      'Built with Vue 3, Phaser 3, and Pinia',
      'Fight through increasingly difficult zombie waves',
      'Battle terrifying bosses across 15 waves',
      'Survive nonstop action and chaos',
      'Unlock Endless Mode for infinite survival'
    ]
  },
  {
    title: '🛠️ Tech Stack',
    list: [
      '<strong>Gemini</strong> - Generate UI, Generate Animation',
      '<strong>ChatGPT</strong> - Generate Game Logic, Generate Game Design',
      '<strong>Vue 3</strong> - UI Framework & Routing',
      '<strong>Phaser 3</strong> - 2D Game Engine',
      '<strong>Pinia</strong> - Game State Management',
      '<strong>TailwindCSS</strong> - Styling & Layouts',
      '<strong>Vite</strong> - Build Tool & Dev Server'
    ]
  },
  {
    title: '🎯 The Mission',
    text: [
      'You play as a lone survivor trapped in a dark, escalating arena.',
      '<strong>The Goal:</strong> Survive relentless waves of mutants, collect glowing weapon drops, and choose powerful upgrades to stay alive.',
      '<strong>The Climax:</strong> Battle through 15 waves of increasing difficulty to slay the Final Boss — or go infinite in Endless Mode to set a high score!'
    ]
  },
  {
    title: '🧟 The Horde',
    list: [
      '<strong>Walker:</strong> Standard zombie. Balanced health and speed.',
      '<strong>Runner:</strong> Fast and fragile. Low HP but covers ground quickly.',
      '<strong>Tank:</strong> Slow but heavily armored. Deals double damage on contact.',
      '<strong>Toxic:</strong> Applies a poison DoT on hit.',
      '<strong>Mini Boss:</strong> Large, tough zombie. Drops weapon rewards on death.',
      '<strong>Giant Boss:</strong> The ultimate wave 15 threat with Ground Smash attacks!'
    ]
  },
  {
    title: '🔫 The Arsenal',
    list: [
      '⚪ <strong>Pistol:</strong> Your reliable fallback. Never runs out of ammo.',
      '🟡 <strong>Shotgun:</strong> Fires 5 bullets at once at close range. Devastating but slow.',
      '🔵 <strong>Rifle:</strong> Doubles the damage per bullet. Kills basic zombies instantly.',
      '🟢 <strong>SMG:</strong> Fastest fire rate, great for melting through zombie groups quickly.'
    ]
  },
  {
    title: '🚀 Ready to Survive?',
    text: [
      'Can you reach wave 15 and defeat the Giant Boss?',
      'Experience dynamic combat, draft unique upgrades, and survive the night.'
    ]
  }
]

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function goToSlide(index) {
  currentSlide.value = index
}

function goHome() {
  router.push('/')
}

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
    || window.navigator?.standalone === true
  )
}

async function enterMobileAppMode() {
  if (!runtimeProfile.isMobile || isStandaloneDisplayMode()) {
    return
  }

  try {
    await requestDocumentFullscreen()
  } catch {
    // Fallback if needed
  }
}

async function startGame() {
  gameStore.startRun('normal')
  await enterMobileAppMode()
  await router.push('/game')
}

function handleKeydown(e) {
  if (e.key === 'ArrowRight' || e.key === 'Space') {
    nextSlide()
  } else if (e.key === 'ArrowLeft') {
    prevSlide()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.presentation-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(circle at center, #1b0f24 0%, #080a0d 100%);
  color: #f8fafc;
  font-family: inherit;
}

.presentation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  z-index: 10;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 99px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.slide-indicator {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.presentation-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.slide-content {
  max-width: 800px;
  width: 100%;
  padding: 3rem;
  background: rgba(10, 13, 17, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.slide-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  font-style: italic;
  margin-bottom: 2rem;
  color: #fcd34d;
  text-shadow: 0 4px 15px rgba(252, 211, 77, 0.2);
}

.slide-text,
.slide-list {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.9);
}

.slide-text {
  margin-bottom: 1.5rem;
}

.slide-list {
  padding-left: 1.5rem;
  margin-bottom: 0;
}

.slide-list li {
  margin-bottom: 1rem;
}

.slide-list li::marker {
  color: #fbbf24;
}

.btn-cta {
  display: inline-block;
  margin-top: 2.5rem;
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #130b06;
  border: none;
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 99px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(249, 115, 22, 0.4);
}

.presentation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem 2rem;
}

.nav-control {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0.5rem 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 1;
  transition: opacity 0.2s;
}

.nav-control:disabled {
  opacity: 0.2;
  cursor: default;
}

.dots-container {
  display: flex;
  gap: 0.6rem;
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, transform 0.2s;
}

.nav-dot.active {
  background: #fbbf24;
  transform: scale(1.3);
}

.nav-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.4);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

@media (max-width: 640px) {

  .presentation-header,
  .presentation-footer {
    padding: 1rem;
  }

  .slide-content {
    padding: 2rem 1.5rem;
  }
}
</style>
