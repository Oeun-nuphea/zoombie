<template>
  <section class="landing-screen">
    <div class="landing-screen__backdrop"></div>
    <div class="landing-screen__grain"></div>
    <div class="landing-screen__content">
      <div class="landing-screen__hero">
        <p class="landing-screen__eyebrow">Top-Down Survival Shooter</p>
        <h1 class="landing-screen__title">
          {{ APP_NAME }}
        </h1>
        <p class="landing-screen__tagline">
          Hold the line. Cut through the swarm. Build a run that actually changes how you survive.
        </p>

        <p class="landing-screen__description">
          You are the last survivor in a dark, overrun arena. Waves of relentless undead pour in
          from every direction — Walkers, Runners, armored Tanks, and poison-spewing Toxics.
          Scavenge weapons, draft powerful upgrades between waves, and craft a unique build
          every run. No two games play the same.
        </p>

        <div class="landing-screen__actions">
          <button
            class="landing-screen__play-button"
            type="button"
            @click="startGame('normal')"
          >
            Start Game
          </button>

          <button
            v-if="gameStore.endlessUnlocked"
            class="landing-screen__secondary-button"
            type="button"
            @click="startGame('endless')"
          >
            Endless
          </button>

          <button
            class="landing-screen__secondary-button"
            type="button"
            @click="showHowToPlay = true"
          >
            How to Play
          </button>

          <button
            class="landing-screen__secondary-button"
            type="button"
            @click="goToPresentation"
          >
            Presentation
          </button>

          <button
            class="landing-screen__secondary-button"
            type="button"
            @click="toggleSound"
          >
            {{ soundMuted ? 'Sound Off' : 'Sound On' }}
          </button>
        </div>
      </div>

      <aside class="landing-screen__panel">
        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">Best Score</p>
          <p class="landing-screen__panel-value">{{ formatScore(gameStore.bestScore) }}</p>
        </div>

        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">Mode</p>
          <p class="landing-screen__panel-copy">
            {{ gameStore.endlessUnlocked ? 'Normal + Endless unlocked' : 'Normal mode available' }}
          </p>
        </div>

        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">What Awaits You</p>
          <ul class="landing-screen__awaits">
            <li>15 escalating waves of undead chaos</li>
            <li>4 deadly zombie types with unique abilities</li>
            <li>Epic boss encounters every 5 waves</li>
            <li>Progression upgrades that reshape each run</li>
            <li>Endless Mode for the truly fearless</li>
          </ul>
        </div>

        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">Controls</p>
          <p class="landing-screen__controls-mode">Desktop</p>
          <ul class="landing-screen__controls">
            <li><span>WASD</span><strong>Move</strong></li>
            <li><span>Mouse</span><strong>Aim</strong></li>
            <li><span>Click</span><strong>Shoot</strong></li>
            <li><span>Space</span><strong>Dash when unlocked</strong></li>
          </ul>
          <p class="landing-screen__controls-mode" style="margin-top: 0.75rem">Mobile</p>
          <ul class="landing-screen__controls">
            <li><span>Joystick</span><strong>Move</strong></li>
            <li><span>Auto</span><strong>Aim &amp; Fire</strong></li>
            <li><span>Dash / Shield</span><strong>Tap when unlocked</strong></li>
          </ul>
        </div>
      </aside>
    </div>

    <div class="landing-screen__features">
      <div class="landing-screen__feature-card">
        <span class="landing-screen__feature-icon">🧟</span>
        <h3 class="landing-screen__feature-title">4 Zombie Types</h3>
        <p class="landing-screen__feature-text">
          Walkers swarm in numbers. Runners close the gap fast.
          Tanks absorb punishment. Toxics leave a lingering poison.
          Learn their patterns or get overwhelmed.
        </p>
      </div>

      <div class="landing-screen__feature-card">
        <span class="landing-screen__feature-icon">🔫</span>
        <h3 class="landing-screen__feature-title">Arsenal of Weapons</h3>
        <p class="landing-screen__feature-text">
          Switch between the reliable Pistol, devastating close-range
          Shotgun, precise Rifle, and bullet-hose SMG. Loot drops
          from fallen zombies keep your loadout evolving.
        </p>
      </div>

      <div class="landing-screen__feature-card">
        <span class="landing-screen__feature-icon">⬆️</span>
        <h3 class="landing-screen__feature-title">Progression upgrades</h3>
        <p class="landing-screen__feature-text">
          Draft 1 of 3 upgrade cards every few waves — boost damage,
          fire rate, speed, lifesteal, or add extra projectiles.
          Every run creates a different power fantasy.
        </p>
      </div>

      <div class="landing-screen__feature-card">
        <span class="landing-screen__feature-icon">💀</span>
        <h3 class="landing-screen__feature-title">Boss Encounters</h3>
        <p class="landing-screen__feature-text">
          Mini Bosses arrive every 5 waves with reinforcements.
          Survive all 15 waves to face the Giant Boss — a towering
          monstrosity with ground-smash AoE and summon abilities.
        </p>
      </div>
    </div>

    <div class="landing-screen__footer">
      <p>Survive 15 waves, defeat the giant boss, and unlock Endless Mode.</p>
    </div>

    <div
      v-if="showHowToPlay || showSettings"
      class="landing-screen__modal-backdrop responsive-overlay"
      @click.self="closePanels"
    >
      <div class="landing-screen__modal responsive-overlay__panel">
        <template v-if="showHowToPlay">
          <p class="landing-screen__modal-label">How To Play</p>
          <h2 class="landing-screen__modal-title">Stay moving. Build the run.</h2>
          <div class="landing-screen__modal-copy">
            <p>Every few waves you draft an upgrade. Boss waves drop weapon rewards. Strong builds come from synergy, not one stat.</p>
            <ul class="landing-screen__modal-list">
              <li>Keep distance from tanks and toxic zombies.</li>
              <li>Headshots hit harder and can trigger ammo recovery upgrades.</li>
              <li>Dash and shield only appear after you pick the related upgrades.</li>
              <li><strong>On mobile</strong> — the gun auto-aims and auto-fires at the nearest threat. Use the joystick to move; no tapping to shoot required.</li>
            </ul>
          </div>
        </template>

        <template v-else>
          <p class="landing-screen__modal-label">Settings</p>
          <h2 class="landing-screen__modal-title">Quick Setup</h2>
          <div class="landing-screen__modal-copy">
            <button
              class="landing-screen__settings-toggle"
              type="button"
              @click="toggleSound"
            >
              {{ soundMuted ? 'Enable Sound' : 'Mute Sound' }}
            </button>
            <p>Fullscreen mode is available once the game starts. Press <strong>M</strong> in-game for instant mute.</p>
          </div>
        </template>

        <button
          class="landing-screen__modal-close"
          type="button"
          @click="closePanels"
        >
          Close
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { requestDocumentFullscreen } from '../../composables/useFullscreenMode'
import { readStorage, writeStorage } from '../../services/storageService'
import { useGameStore } from '../../stores/gameStore'
import { APP_NAME, STORAGE_KEYS } from '../../utils/constants'
import { getGameRuntimeProfile } from '../../utils/device'
import { formatScore } from '../../utils/helpers'

const router = useRouter()
const gameStore = useGameStore()
const showHowToPlay = ref(false)
const showSettings = ref(false)
const soundMuted = ref(readStorage(STORAGE_KEYS.soundMuted, false))
const runtimeProfile = getGameRuntimeProfile()

function closePanels() {
  showHowToPlay.value = false
  showSettings.value = false
}

function toggleSound() {
  soundMuted.value = !soundMuted.value
  writeStorage(STORAGE_KEYS.soundMuted, soundMuted.value)
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
    // Mobile browsers do not consistently allow fullscreen; PWA standalone remains the fallback.
  }
}

async function startGame(mode = 'normal') {
  closePanels()
  gameStore.startRun(mode)
  await enterMobileAppMode()
  await router.push('/game')
}

function goToPresentation() {
  router.push('/presentation')
}
</script>

<style scoped>
.landing-screen {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(248, 113, 113, 0.24), transparent 34%),
    radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.18), transparent 28%),
    linear-gradient(180deg, #080a0d 0%, #11161c 46%, #060709 100%);
  color: #f8fafc;
}

.landing-screen__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7, 9, 12, 0.88) 0%, rgba(7, 9, 12, 0.6) 48%, rgba(7, 9, 12, 0.85) 100%),
    url('/assets/maps/field-map.png') center / cover no-repeat;
  filter: saturate(0.72) brightness(0.4);
  transform: scale(1.06);
}

.landing-screen__grain {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 4px 4px;
  mix-blend-mode: soft-light;
  opacity: 0.5;
}

.landing-screen__content {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: calc(100vh - 5rem);
  grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 24rem);
  gap: 2rem;
  align-items: end;
  padding: clamp(1.5rem, 3vw, 3rem);
}

.landing-screen__hero {
  max-width: 42rem;
  padding-bottom: clamp(2rem, 5vw, 4rem);
}

.landing-screen__eyebrow {
  margin: 0 0 1rem;
  color: #fcd34d;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}

.landing-screen__title {
  margin: 0;
  font-size: clamp(4rem, 12vw, 8.5rem);
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
}

.landing-screen__tagline {
  max-width: 34rem;
  margin: 1.25rem 0 0;
  color: rgba(226, 232, 240, 0.86);
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.7;
}

.landing-screen__description {
  max-width: 36rem;
  margin: 1.15rem 0 0;
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.92rem;
  line-height: 1.75;
  border-left: 2px solid rgba(252, 211, 77, 0.35);
  padding-left: 1rem;
}

.landing-screen__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 2rem;
}

.landing-screen__play-button,
.landing-screen__secondary-button,
.landing-screen__settings-toggle,
.landing-screen__modal-close {
  min-height: 3.2rem;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.landing-screen__play-button {
  min-width: 13rem;
  padding: 1.1rem 1.8rem;
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #130b06;
  font-size: 1rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 0 18px 38px rgba(249, 115, 22, 0.28);
}

.landing-screen__play-button:hover,
.landing-screen__secondary-button:hover,
.landing-screen__settings-toggle:hover,
.landing-screen__modal-close:hover {
  transform: translateY(-2px);
}

.landing-screen__secondary-button,
.landing-screen__settings-toggle,
.landing-screen__modal-close {
  padding: 0.95rem 1.3rem;
  background: rgba(15, 23, 42, 0.7);
  color: #e2e8f0;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.landing-screen__panel {
  position: relative;
  z-index: 1;
  align-self: center;
  padding: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.45rem;
  background: rgba(10, 13, 17, 0.74);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(18px);
}

.landing-screen__panel-block + .landing-screen__panel-block {
  margin-top: 1.15rem;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-screen__panel-label {
  margin: 0 0 0.45rem;
  color: rgba(252, 211, 77, 0.9);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.landing-screen__panel-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.landing-screen__panel-copy {
  margin: 0;
  color: rgba(226, 232, 240, 0.86);
  line-height: 1.6;
}

.landing-screen__awaits {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.landing-screen__awaits li {
  position: relative;
  padding-left: 1.05rem;
  color: rgba(226, 232, 240, 0.82);
  font-size: 0.85rem;
  line-height: 1.55;
}

.landing-screen__awaits li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #fbbf24;
  font-weight: 800;
}

.landing-screen__controls-mode {
  margin: 0 0 0.35rem;
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.landing-screen__controls {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.landing-screen__controls li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(226, 232, 240, 0.92);
}

.landing-screen__controls span {
  color: #f8fafc;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.landing-screen__controls strong {
  color: rgba(226, 232, 240, 0.7);
  font-size: 0.88rem;
  font-weight: 700;
}

.landing-screen__features {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.15rem;
  padding: 0 clamp(1.5rem, 3vw, 3rem);
  margin-top: -0.5rem;
}

.landing-screen__feature-card {
  padding: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 1.1rem;
  background: rgba(10, 13, 17, 0.6);
  backdrop-filter: blur(12px);
  transition: transform 200ms ease, border-color 200ms ease;
}

.landing-screen__feature-card:hover {
  transform: translateY(-3px);
  border-color: rgba(252, 211, 77, 0.25);
}

.landing-screen__feature-icon {
  display: block;
  font-size: 1.6rem;
  margin-bottom: 0.65rem;
}

.landing-screen__feature-title {
  margin: 0 0 0.5rem;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fcd34d;
}

.landing-screen__feature-text {
  margin: 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.82rem;
  line-height: 1.65;
}

.landing-screen__footer {
  position: relative;
  z-index: 1;
  padding: 1.5rem 3rem;
  color: rgba(226, 232, 240, 0.6);
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.landing-screen__modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: rgba(4, 6, 8, 0.72);
  backdrop-filter: blur(8px);
}

.landing-screen__modal {
  --overlay-width: 32rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 13, 17, 0.98) 100%);
}

.landing-screen__modal-label {
  margin: 0;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.landing-screen__modal-title {
  margin: 0.6rem 0 0;
  font-size: 2rem;
  font-weight: 900;
}

.landing-screen__modal-copy {
  margin-top: 1rem;
  color: rgba(226, 232, 240, 0.86);
  line-height: 1.7;
}

.landing-screen__modal-list {
  margin: 1rem 0 0;
  padding-left: 1rem;
}

.landing-screen__modal-list li + li {
  margin-top: 0.55rem;
}

.landing-screen__modal-close {
  margin-top: 1.25rem;
}

@media (max-width: 980px) {
  .landing-screen__content {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .landing-screen__panel {
    max-width: 34rem;
  }

  .landing-screen__features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .landing-screen__content {
    padding: 1.15rem;
  }

  .landing-screen__footer {
    padding: 0 1.15rem 1.15rem;
    font-size: 0.74rem;
    line-height: 1.5;
  }

  .landing-screen__features {
    grid-template-columns: 1fr;
    padding: 0 1.15rem;
  }

  .landing-screen__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .landing-screen__play-button,
  .landing-screen__secondary-button,
  .landing-screen__settings-toggle,
  .landing-screen__modal-close {
    width: 100%;
  }

  .landing-screen__modal-title {
    font-size: clamp(1.55rem, 8vw, 1.9rem);
  }

  .landing-screen__modal-copy {
    font-size: 0.95rem;
  }
}
</style>
