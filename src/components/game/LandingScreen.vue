<template>
  <section class="landing-screen">
    <div class="landing-screen__backdrop"></div>
    <div class="landing-screen__grain"></div>
    <div class="landing-screen__content">

      <!-- ── Hero ── -->
      <div class="landing-screen__hero">
        <p class="landing-screen__eyebrow">Top-Down Survival Shooter</p>
        <h1 class="landing-screen__title">{{ APP_NAME }}</h1>
        <p class="landing-screen__tagline">
          Hold the line. Cut through the swarm. Build a run that actually changes how you survive.
        </p>
        <p class="landing-screen__description">
          You are the last survivor in a dark, overrun arena. Waves of relentless undead pour in
          from every direction — Walkers, Runners, armored Tanks, and poison-spewing Toxics.
        </p>

        <!-- Run Modifier -->
        <div class="challenge-picker">
          <p class="challenge-picker__label">Run Modifier</p>
          <div class="challenge-picker__grid">
            <button
              v-for="(challenge, key) in CHALLENGES"
              :key="key"
              type="button"
              class="challenge-picker__card"
              :class="{ 'challenge-picker__card--active': selectedChallenge === key }"
              @click="selectedChallenge = key"
            >
              <span class="challenge-picker__card-icon">{{ CHALLENGE_ICONS[key] }}</span>
              <span class="challenge-picker__card-name">{{ challenge.label }}</span>
            </button>
          </div>
          <p class="challenge-picker__desc">{{ CHALLENGES[selectedChallenge].desc }}</p>
        </div>

        <!-- Primary Actions -->
        <div class="landing-screen__actions">
          <button class="landing-screen__play-button" type="button" @click="initiateStartGame('normal')">
            ▶ Start Game
          </button>
          <button
            v-if="gameStore.endlessUnlocked"
            class="landing-screen__secondary-button"
            type="button"
            @click="initiateStartGame('endless')"
          >
            ∞ Endless
          </button>
          <button class="landing-screen__secondary-button" type="button" @click="showHowToPlay = true">
            ? How to Play
          </button>
        </div>
      </div>

      <!-- ── Side Panel ── -->
      <aside class="landing-screen__panel">

        <!-- Stats row -->
        <div class="panel-stats">
          <div class="panel-stat">
            <p class="panel-stat__label">Best Score</p>
            <p class="panel-stat__value">{{ formatScore(gameStore.bestScore) }}</p>
          </div>
          <div class="panel-stat">
            <p class="panel-stat__label">Souls</p>
            <p class="panel-stat__value panel-stat__value--souls">{{ gameStore.souls }}</p>
          </div>
        </div>

        <!-- What awaits -->
        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">What Awaits</p>
          <ul class="landing-screen__awaits">
            <li>15 escalating waves of undead chaos</li>
            <li>4 zombie types with unique behaviours</li>
            <li>Epic boss every 5 waves</li>
            <li>Draft upgrades between waves</li>
            <li v-if="gameStore.endlessUnlocked">♾ Endless Mode unlocked</li>
          </ul>
        </div>

        <!-- Controls -->
        <div class="landing-screen__panel-block">
          <p class="landing-screen__panel-label">Controls</p>
          <p class="landing-screen__controls-mode">Desktop</p>
          <ul class="landing-screen__controls">
            <li><span>WASD</span><strong>Move</strong></li>
            <li><span>Mouse</span><strong>Aim</strong></li>
            <li><span>Click</span><strong>Shoot</strong></li>
          </ul>
          <p class="landing-screen__controls-mode" style="margin-top: 0.75rem">Mobile</p>
          <ul class="landing-screen__controls">
            <li><span>Joystick</span><strong>Move</strong></li>
            <li><span>Auto</span><strong>Aim &amp; Fire</strong></li>
          </ul>
        </div>

        <!-- Panel actions -->
        <div class="panel-actions">
          <button class="panel-action-btn" type="button" @click="showShop = true">
            💀 Upgrades Shop
          </button>
          <button
            class="panel-action-btn panel-action-btn--icon"
            type="button"
            :title="soundMuted ? 'Unmute sound' : 'Mute sound'"
            @click="toggleSound"
          >
            {{ soundMuted ? '🔇' : '🔊' }}
          </button>
        </div>

      </aside>
    </div>

    <!-- ── Modals ── -->
    <div
      v-if="showHowToPlay || showShop || showMapSelector"
      class="landing-screen__modal-backdrop responsive-overlay"
      @click.self="closePanels"
    >
      <div class="landing-screen__modal responsive-overlay__panel">

        <!-- Map Selector Mode -->
        <template v-if="showMapSelector">
          <p class="landing-screen__modal-label">Select Battleground</p>
          <h2 class="landing-screen__modal-title">Where to Deploy?</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid" style="grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
              <button
                v-for="(mapConfig, key) in MAP_CONFIG"
                :key="key"
                type="button"
                class="challenge-picker__card"
                :class="{ 
                  'challenge-picker__card--active': previewMap === key,
                  'shop-item__btn--disabled': !mapConfig.default && !gameStore.unlockedMaps.includes(key)
                }"
                @click="previewMap = key"
                style="padding: 1rem; border-radius: 12px; min-height: 5.5rem;"
              >
                <span class="challenge-picker__card-icon" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;">{{ MAP_ICONS[key] }}</span>
                <span class="challenge-picker__card-name" style="font-size: 0.85rem;">{{ mapConfig.label }}</span>
              </button>
            </div>

            <div class="shop-item" style="margin-top: 1.5rem;">
              <div>
                <h4 class="shop-item__name">{{ MAP_CONFIG[previewMap]?.label }}</h4>
                <p class="shop-item__sub">{{ MAP_CONFIG[previewMap]?.desc }}</p>
              </div>
              <button
                v-if="!MAP_CONFIG[previewMap]?.default && !gameStore.unlockedMaps.includes(previewMap)"
                class="landing-screen__play-button shop-item__btn"
                :disabled="gameStore.souls < MAP_CONFIG[previewMap].cost"
                :class="{ 'shop-item__btn--disabled': gameStore.souls < MAP_CONFIG[previewMap].cost }"
                @click="buyMap"
              >
                Unlock ({{ MAP_CONFIG[previewMap].cost }} 💀)
              </button>
              <button
                v-else
                class="landing-screen__play-button shop-item__btn"
                @click="confirmMapAndStart"
              >
                ▶ Start
              </button>
            </div>
          </div>
        </template>

        <!-- Shop -->
        <template v-else-if="showShop">
          <p class="landing-screen__modal-label">Meta Shop</p>
          <h2 class="landing-screen__modal-title">Spend Souls</h2>
          <div class="landing-screen__modal-copy">
            <p>You have <strong style="color: #c084fc; font-size: 1.1rem; text-shadow: 0 0 10px rgba(192,132,252,0.4);">{{ gameStore.souls }} Zombie Souls</strong>.</p>
            <div class="shop-items">
              <div class="shop-item">
                <div>
                  <h4 class="shop-item__name">Base Health +1 <span v-if="(gameStore.metaUpgrades?.health || 0) >= 20" class="shop-item__max">MAX</span></h4>
                  <p class="shop-item__sub">{{ gameStore.metaUpgrades?.health || 0 }} / 20 levels</p>
                </div>
                <button
                  class="landing-screen__play-button shop-item__btn"
                  :disabled="gameStore.souls < healthCost || (gameStore.metaUpgrades?.health || 0) >= 20"
                  :class="{ 'shop-item__btn--disabled': gameStore.souls < healthCost || (gameStore.metaUpgrades?.health || 0) >= 20 }"
                  @click="buyHealth"
                >{{ (gameStore.metaUpgrades?.health || 0) >= 20 ? 'MAX' : `${healthCost} 💀` }}</button>
              </div>
              <div class="shop-item">
                <div>
                  <h4 class="shop-item__name">Base Speed +5% <span v-if="(gameStore.metaUpgrades?.speed || 0) >= 10" class="shop-item__max">MAX</span></h4>
                  <p class="shop-item__sub">{{ gameStore.metaUpgrades?.speed || 0 }} / 10 levels (+{{ (Math.min(gameStore.metaUpgrades?.speed || 0, 10)) * 5 }}%)</p>
                </div>
                <button
                  class="landing-screen__play-button shop-item__btn"
                  :disabled="gameStore.souls < speedCost || (gameStore.metaUpgrades?.speed || 0) >= 10"
                  :class="{ 'shop-item__btn--disabled': gameStore.souls < speedCost || (gameStore.metaUpgrades?.speed || 0) >= 10 }"
                  @click="buySpeed"
                >{{ (gameStore.metaUpgrades?.speed || 0) >= 10 ? 'MAX' : `${speedCost} 💀` }}</button>
              </div>
            </div>
          </div>
        </template>

        <!-- How To Play -->
        <template v-else-if="showHowToPlay">
          <p class="landing-screen__modal-label">How To Play</p>
          <h2 class="landing-screen__modal-title">Stay moving. Build the run.</h2>
          <div class="landing-screen__modal-copy">
            <p>Every few waves you draft an upgrade. Boss waves drop weapon rewards. Strong builds come from synergy, not one stat.</p>
            <ul class="landing-screen__modal-list">
              <li>Keep distance from Tanks and Toxic zombies.</li>
              <li>Headshots hit harder and can trigger ammo recovery upgrades.</li>
              <li>Dash and shield only appear after picking the related upgrades.</li>
              <li><strong>On mobile</strong> — the gun auto-aims and auto-fires at the nearest threat. Use the joystick to move.</li>
            </ul>
          </div>
        </template>

        <button class="landing-screen__modal-close" type="button" @click="closePanels">
          Close
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { requestDocumentFullscreen } from '../../composables/useFullscreenMode'
import { readStorage, writeStorage } from '../../services/storageService'
import { useGameStore } from '../../stores/gameStore'
import { APP_NAME, STORAGE_KEYS, CHALLENGES, MAP_CONFIG } from '../../utils/constants'
import { getGameRuntimeProfile } from '../../utils/device'
import { formatScore } from '../../utils/helpers'

const CHALLENGE_ICONS = {
  none: '🎮',
  vampire: '🧛',
  pistolOnly: '🔫',
  glassCannon: '💥',
  overtime: '⚡',
  noMercy: '💀',
}

const MAP_ICONS = {
  arena1: '🏕️',
  angkor: '🛕',
  pagoda: '⛩️',
  palace: '🏯',
}

const router = useRouter()
const gameStore = useGameStore()
const showHowToPlay = ref(false)
const showShop = ref(false)
const showMapSelector = ref(false)
const pendingRunMode = ref('normal')
const selectedChallenge = ref('none')
const previewMap = ref(gameStore.selectedMap || 'arena1')
const soundMuted = ref(readStorage(STORAGE_KEYS.soundMuted, false))
const runtimeProfile = getGameRuntimeProfile()

const healthCost = computed(() => 50 * ((gameStore.metaUpgrades?.health || 0) + 1))
const speedCost = computed(() => 40 * ((gameStore.metaUpgrades?.speed || 0) + 1))

function buyHealth() { gameStore.buyMetaUpgrade('health', healthCost.value) }
function buySpeed() { gameStore.buyMetaUpgrade('speed', speedCost.value) }

function handleMapSelect(key) {
  previewMap.value = key;
}

function buyMap() {
  const mapItem = MAP_CONFIG[previewMap.value];
  if (!mapItem) return;
  gameStore.buyMap(previewMap.value, mapItem.cost);
}

function closePanels() {
  showHowToPlay.value = false
  showShop.value = false
  showMapSelector.value = false
}

function toggleSound() {
  soundMuted.value = !soundMuted.value
  writeStorage(STORAGE_KEYS.soundMuted, soundMuted.value)
}

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
    || window.navigator?.standalone === true
  )
}

async function enterFullscreenMode() {
  if (isStandaloneDisplayMode()) return
  try { await requestDocumentFullscreen() } catch { /* ignore */ }
}

function initiateStartGame(mode = 'normal') {
  pendingRunMode.value = mode
  showMapSelector.value = true
}

async function confirmMapAndStart() {
  await enterFullscreenMode()
  gameStore.selectMap(previewMap.value)
  const mode = pendingRunMode.value
  closePanels()
  gameStore.startRun(mode, selectedChallenge.value)
  await router.push('/game')
}
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
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
    linear-gradient(90deg, rgba(7,9,12,0.88) 0%, rgba(7,9,12,0.6) 48%, rgba(7,9,12,0.85) 100%),
    url('/assets/maps/field-map.png') center / cover no-repeat;
  filter: saturate(0.72) brightness(0.4);
  transform: scale(1.06);
}

.landing-screen__grain {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 4px 4px;
  mix-blend-mode: soft-light;
  opacity: 0.5;
}

/* ── Layout ───────────────────────────────────────────────── */
.landing-screen__content {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 24rem);
  gap: 2rem;
  align-items: center;
  padding: clamp(1.5rem, 3vw, 3rem);
}

.landing-screen__hero {
  max-width: 42rem;
  padding-bottom: clamp(1rem, 3vw, 2rem);
}

/* ── Typography ───────────────────────────────────────────── */
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
  text-shadow: 0 10px 34px rgba(0,0,0,0.45);
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
  margin: 1rem 0 0;
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.9rem;
  line-height: 1.75;
  border-left: 2px solid rgba(252, 211, 77, 0.35);
  padding-left: 1rem;
}

/* ── Challenge Picker ─────────────────────────────────────── */
.challenge-picker {
  margin-top: 1.75rem;
  max-width: 26rem;
}

.challenge-picker__label {
  margin: 0 0 0.6rem;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.challenge-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.challenge-picker__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 0.5rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.55);
  color: #cbd5e1;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  text-align: center;
  line-height: 1.3;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease;
}

.challenge-picker__card:hover {
  border-color: rgba(252, 211, 77, 0.35);
  background: rgba(252, 211, 77, 0.07);
  transform: translateY(-1px);
}

.challenge-picker__card--active {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.12);
  color: #fcd34d;
  box-shadow: 0 0 14px rgba(251,191,36,0.22), inset 0 0 0 1px rgba(251,191,36,0.25);
}

.challenge-picker__card-icon { font-size: 1.35rem; line-height: 1; }
.challenge-picker__card-name { font-size: 0.66rem; }

.challenge-picker__desc {
  margin: 0.65rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.5;
  min-height: 2.4rem;
  padding: 0.5rem 0.65rem;
  border-left: 2px solid rgba(252, 211, 77, 0.3);
  transition: color 150ms ease;
}

/* ── Action Buttons ───────────────────────────────────────── */
.landing-screen__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.75rem;
}

.landing-screen__play-button,
.landing-screen__secondary-button,
.landing-screen__settings-toggle,
.landing-screen__modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.2rem;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease;
}

.landing-screen__play-button {
  min-width: 13rem;
  padding: 1.1rem 1.8rem;
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #130b06;
  font-size: 1rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 0 18px 38px rgba(249,115,22,0.28);
}

.landing-screen__play-button:hover,
.landing-screen__secondary-button:hover,
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
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
}

/* ── Side Panel ───────────────────────────────────────────── */
.landing-screen__panel {
  position: relative;
  z-index: 1;
  align-self: center;
  padding: 1.35rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1.45rem;
  background: rgba(10, 13, 17, 0.74);
  box-shadow: 0 28px 60px rgba(0,0,0,0.32);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Stats row */
.panel-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.panel-stat__label {
  margin: 0 0 0.3rem;
  color: rgba(252, 211, 77, 0.9);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.panel-stat__value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.panel-stat__value--souls { color: #c084fc; }

.landing-screen__panel-block {
  padding-top: 1.15rem;
  margin-top: 1.15rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.landing-screen__panel-block:first-child { padding-top: 0; margin-top: 0; border-top: none; }

.landing-screen__panel-label {
  margin: 0 0 0.45rem;
  color: rgba(252, 211, 77, 0.9);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

/* Awaits list */
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

/* Controls */
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

/* Panel bottom actions */
.panel-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.15rem;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.panel-action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #e2e8f0;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}

.panel-action-btn:hover {
  border-color: rgba(252, 211, 77, 0.3);
  background: rgba(252, 211, 77, 0.06);
  transform: translateY(-1px);
}

.panel-action-btn--icon {
  flex: 0 0 auto;
  min-width: 3rem;
  font-size: 1.15rem;
  letter-spacing: 0;
}

/* ── Modal ────────────────────────────────────────────────── */
.landing-screen__modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: rgba(4, 6, 8, 0.72);
  backdrop-filter: blur(8px);
}

.landing-screen__modal {
  --overlay-width: 32rem;
  background: linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,13,17,0.98) 100%);
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

.landing-screen__modal-list li+li { margin-top: 0.55rem; }

.landing-screen__modal-close { margin-top: 1.25rem; }

/* Shop items */
.shop-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  background: rgba(0,0,0,0.2);
}

.shop-item__name {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
}

.shop-item__max {
  color: #86efac;
  font-size: 0.72rem;
  margin-left: 0.35rem;
}

.shop-item__sub {
  margin: 0.2rem 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
}

.shop-item__btn {
  min-width: auto;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

.shop-item__btn--disabled {
  opacity: 0.45;
  filter: grayscale(0.8);
  cursor: not-allowed;
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 980px) {
  .landing-screen__content {
    grid-template-columns: 1fr;
    align-items: start;
    min-height: auto;
    padding-bottom: 2rem;
  }

  .landing-screen__panel {
    max-width: 34rem;
  }
}

@media (max-width: 640px) {
  .landing-screen__content {
    padding: 1.15rem;
  }

  .landing-screen__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .landing-screen__play-button,
  .landing-screen__secondary-button,
  .landing-screen__modal-close {
    width: 100%;
    text-align: center;
  }

  .challenge-picker {
    max-width: 100%;
  }

  .challenge-picker__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing-screen__modal-title {
    font-size: clamp(1.55rem, 8vw, 1.9rem);
  }

  .landing-screen__modal-copy {
    font-size: 0.95rem;
  }
}
</style>
