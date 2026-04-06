<template>
  <section
    ref="gameViewport"
    :class="['game-screen', isMobileDevice ? 'game-screen--mobile' : '']"
  >
    <div
      ref="stageArea"
      class="game-screen__stage"
    >
      <div
        class="game-screen__surface"
        :style="stageStyle"
      >
        <GameCanvas
          ref="gameCanvas"
          class="game-screen__canvas"
        />

        <HUD
          :game-store="gameStore"
          :is-fullscreen="isFullscreen"
          :is-mobile="isMobileDevice"
          :sound-muted="soundMuted"
          @toggle-fullscreen="toggleFullscreen"
          @toggle-sound="toggleSound"
          @pause="gameStore.pauseRun()"
        />

        <MobileControls
          :visible="showMobileControls"
          :game-store="gameStore"
        />
      </div>
    </div>

    <PauseModal
      :visible="gameStore.phase === 'paused'"
      @resume="gameStore.resumeRun()"
      @restart="gameStore.requestRestart()"
      @quit="returnToLanding"
    />

    <UpgradeModal
      :visible="gameStore.phase === 'upgrade-select'"
      :choices="gameStore.upgradeChoices"
      :auto-pick-ends-at="gameStore.upgradeAutoPickEndsAt"
      :is-mobile="isMobileDevice"
      :upgrade-counts="gameStore.upgradeCounts"
      @select="selectUpgrade"
    />

    <GameOverModal
      :visible="['game-over', 'victory'].includes(gameStore.phase)"
      :victory="gameStore.phase === 'victory'"
      :game-store="gameStore"
      @restart="gameStore.requestRestart()"
      @quit="returnToLanding"
      @endless="gameStore.requestRestart('endless')"
    />

    <div
      v-if="showOrientationPrompt"
      class="game-screen__orientation responsive-overlay"
    >
      <div class="game-screen__orientation-card responsive-overlay__panel">
        <p class="game-screen__orientation-kicker">Landscape Recommended</p>
        <h2 class="game-screen__orientation-title">Rotate your device for the full arena view.</h2>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import GameCanvas from './GameCanvas.vue'
import GameOverModal from './GameOverModal.vue'
import HUD from './HUD.vue'
import MobileControls from './MobileControls.vue'
import PauseModal from './PauseModal.vue'
import UpgradeModal from './UpgradeModal.vue'
import { useFullscreenMode } from '../../composables/useFullscreenMode'
import { useResponsiveCanvas } from '../../composables/useResponsiveCanvas'
import { readStorage, writeStorage } from '../../services/storageService'
import { useGameStore } from '../../stores/gameStore'
import { STORAGE_KEYS } from '../../utils/constants'
import { getGameRuntimeProfile } from '../../utils/device'

const router = useRouter()
const gameViewport = ref(null)
const gameCanvas = ref(null)
const stageArea = ref(null)
const gameStore = useGameStore()
const soundMuted = ref(readStorage(STORAGE_KEYS.soundMuted, false))
const isPortrait = ref(false)
const runtimeProfile = getGameRuntimeProfile()
const isMobileDevice = runtimeProfile.isMobile

const { stageStyle } = useResponsiveCanvas(stageArea)
const { isFullscreen, toggleFullscreen } = useFullscreenMode(gameViewport)
const showMobileControls = computed(() => (
  isMobileDevice
  && !isPortrait.value
  && ['running', 'spawning', 'wave-clear'].includes(gameStore.phase)
))
const showOrientationPrompt = computed(() => isMobileDevice && isPortrait.value)

function toggleSound() {
  const nextMuted = gameCanvas.value?.toggleMute?.()

  if (typeof nextMuted === 'boolean') {
    soundMuted.value = nextMuted
    return
  }

  soundMuted.value = !soundMuted.value
  writeStorage(STORAGE_KEYS.soundMuted, soundMuted.value)
}

function selectUpgrade(upgradeId) {
  if (!upgradeId) {
    return
  }

  gameStore.chooseUpgrade(upgradeId)
}

function returnToLanding() {
  gameStore.resumeRun()
  router.push('/')
}

function syncOrientation() {
  if (!isMobileDevice) {
    isPortrait.value = false
    return
  }

  isPortrait.value = window.innerHeight > window.innerWidth
}

function preventTouchScroll(event) {
  if (!isMobileDevice) {
    return
  }

  event.preventDefault()
}

function handleKeydown(event) {
  if (event.code !== 'Escape') {
    return
  }

  if (gameStore.phase === 'paused') {
    gameStore.resumeRun()
    return
  }

  if (['running', 'spawning', 'wave-clear'].includes(gameStore.phase)) {
    gameStore.pauseRun()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  syncOrientation()
  window.addEventListener('resize', syncOrientation)
  window.addEventListener('orientationchange', syncOrientation)
  gameViewport.value?.addEventListener('touchmove', preventTouchScroll, {
    passive: false,
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', syncOrientation)
  window.removeEventListener('orientationchange', syncOrientation)
  gameViewport.value?.removeEventListener('touchmove', preventTouchScroll)
})
</script>

<style scoped>
.game-screen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  overscroll-behavior: none;
  background:
    radial-gradient(circle at top, rgba(249, 115, 22, 0.18), transparent 28%),
    linear-gradient(180deg, #05070a 0%, #11161c 100%);
}

.game-screen--mobile {
  touch-action: none;
}

.game-screen__stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-screen__surface {
  position: relative;
  overflow: hidden;
}

.game-screen__canvas {
  width: 100%;
  height: 100%;
}

.game-screen__orientation {
  z-index: 46;
  background: rgba(2, 6, 12, 0.82);
  backdrop-filter: blur(14px);
}

.game-screen__orientation-card {
  --overlay-width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: rgba(8, 17, 28, 0.94);
  text-align: center;
}

.game-screen__orientation-kicker {
  margin: 0;
  color: #fcd34d;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.game-screen__orientation-title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.5rem, 5vw, 2.4rem);
  font-weight: 900;
  line-height: 1.1;
}
</style>
