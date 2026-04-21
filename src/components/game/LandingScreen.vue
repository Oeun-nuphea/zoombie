<template>
  <section class="landing-screen">
    <div class="landing-screen__backdrop"></div>
    <div class="landing-screen__grain"></div>
    <header class="landing-header">
      <div class="landing-header__stats">
        <div class="header-stat">
          <span class="header-stat__label">Best Score</span>
          <span class="header-stat__value">{{ formatScore(gameStore.bestScore) }}</span>
        </div>
        <div class="header-stat">
          <span class="header-stat__label">Souls</span>
          <span class="header-stat__value header-stat__value--souls">{{ gameStore.souls }} 💀</span>
        </div>
      </div>

      <div class="landing-header__actions">
        <button class="header-action-btn" type="button" @click="showSkinSelector = true">
          👕 Operatives
        </button>
        <button class="header-action-btn" type="button" @click="showShop = true">
          💀 Upgrades
        </button>
        <button class="header-action-btn" type="button" @click="showBestiary = true">
          🧟 Bestiary
        </button>
        <button class="header-action-btn header-action-btn--icon" type="button"
          :title="soundMuted ? 'Unmute sound' : 'Mute sound'" @click="toggleSound">
          {{ soundMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </header>

    <div class="landing-screen__content">

      <!-- ── Hero ── -->
      <div class="landing-screen__hero">
        <img src="/logo.png" alt="Logo" class="landing-screen__logo" />

        <!-- Primary Actions -->
        <div class="landing-screen__actions">
          <button class="landing-screen__play-button" type="button" @click="initiateStartGame('normal')">
            ▶ Start Game
          </button>
          <button v-if="gameStore.endlessUnlocked" class="landing-screen__secondary-button" type="button"
            @click="initiateStartGame('endless')">
            ∞ Endless
          </button>
        </div>
      </div>

      <!-- ── Corner Modifier ── -->
      <div class="landing-corner-modifiers">
        <div class="challenge-picker" @mouseleave="dropdownOpen = false">
          <p class="challenge-picker__label">Run Modifier</p>
          <div class="custom-dropdown" :class="{ 'is-open': dropdownOpen }">
            <div class="custom-dropdown__selected" @click="dropdownOpen = !dropdownOpen">
              <span class="custom-dropdown__value">
                {{ CHALLENGE_ICONS[selectedChallenge] }} <span style="margin-left: 0.5rem">{{ CHALLENGES[selectedChallenge].label }}</span>
              </span>
              <span class="custom-dropdown__arrow">▼</span>
            </div>
            
            <ul class="custom-dropdown__options" v-if="dropdownOpen">
              <li 
                v-for="(challenge, key) in CHALLENGES" 
                :key="key" 
                @click="selectedChallenge = key; dropdownOpen = false"
                :class="{'is-active': selectedChallenge === key}"
              >
                {{ CHALLENGE_ICONS[key] }} <span style="margin-left: 0.5rem">{{ challenge.label }}</span>
              </li>
            </ul>
          </div>
          <p class="challenge-picker__desc" v-if="selectedChallenge !== 'none'">{{ CHALLENGES[selectedChallenge].desc }}</p>
        </div>
      </div>
    </div>

    <!-- ── Modals ── -->
    <div v-if="showShop || showMapSelector || showSkinSelector || showBestiary"
      class="landing-screen__modal-backdrop responsive-overlay" @click.self="closePanels">
      <div class="landing-screen__modal responsive-overlay__panel">

        <!-- Map Selector Mode -->
        <template v-if="showMapSelector">
          <p class="landing-screen__modal-label">Select Battleground</p>
          <h2 class="landing-screen__modal-title">Where to Deploy?</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid" style="grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
              <button v-for="(mapConfig, key) in MAP_CONFIG" :key="key" type="button" class="challenge-picker__card"
                :class="{
                  'challenge-picker__card--active': previewMap === key,
                  'shop-item__btn--disabled': !mapConfig.default && !gameStore.unlockedMaps.includes(key)
                }" @click="previewMap = key" style="padding: 1rem; border-radius: 12px; min-height: 5.5rem;">
                <span class="challenge-picker__card-icon"
                  style="font-size: 2rem; margin-bottom: 0.5rem; display: block;">{{ MAP_ICONS[key] }}</span>
                <span class="challenge-picker__card-name" style="font-size: 0.85rem;">{{ mapConfig.label }}</span>
              </button>
            </div>

            <div class="shop-item" style="margin-top: 1.5rem;">
              <div>
                <h4 class="shop-item__name">{{ MAP_CONFIG[previewMap]?.label }}</h4>
                <p class="shop-item__sub">{{ MAP_CONFIG[previewMap]?.desc }}</p>
              </div>
              <button v-if="!MAP_CONFIG[previewMap]?.default && !gameStore.unlockedMaps.includes(previewMap)"
                class="landing-screen__play-button shop-item__btn"
                :disabled="gameStore.souls < MAP_CONFIG[previewMap].cost"
                :class="{ 'shop-item__btn--disabled': gameStore.souls < MAP_CONFIG[previewMap].cost }" @click="buyMap">
                Unlock ({{ MAP_CONFIG[previewMap].cost }} 💀)
              </button>
              <button v-else class="landing-screen__play-button shop-item__btn" @click="confirmMapAndStart">
                ▶ Start
              </button>
            </div>
          </div>
        </template>

        <!-- Skin Selector -->
        <template v-else-if="showSkinSelector">
          <p class="landing-screen__modal-label">Barracks</p>
          <h2 class="landing-screen__modal-title">Select Operative</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid">
              <button v-for="(skinConfig, key) in PLAYER_SKINS" :key="key" type="button" class="challenge-picker__card"
                :class="{ 'challenge-picker__card--active': gameStore.selectedSkin === key }"
                @click="gameStore.setSelectedSkin(key)">
                <div class="challenge-picker__card-header">
                  <span class="challenge-picker__card-icon">
                    <span v-if="key === 'swat'">🥷</span>
                    <span v-else-if="key === 'ranger'">🤠</span>
                    <span v-else>🧢</span>
                  </span>
                  <span class="challenge-picker__card-name">{{ skinConfig.name }}</span>
                </div>
                <span class="challenge-picker__card-desc">Select Operator</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Shop -->
        <template v-else-if="showShop">
          <p class="landing-screen__modal-label">Meta Shop</p>
          <h2 class="landing-screen__modal-title">Spend Souls</h2>
          <div class="landing-screen__modal-copy">
            <p>You have <strong
                style="color: #c084fc; font-size: 1.1rem; text-shadow: 0 0 10px rgba(192,132,252,0.4);">{{
                gameStore.souls }} Zombie Souls</strong>.</p>
            <div class="shop-items">
              <div class="shop-item">
                <div>
                  <h4 class="shop-item__name">Base Health +1 <span v-if="(gameStore.metaUpgrades?.health || 0) >= 20"
                      class="shop-item__max">MAX</span></h4>
                  <p class="shop-item__sub">{{ gameStore.metaUpgrades?.health || 0 }} / 20 levels</p>
                </div>
                <button class="landing-screen__play-button shop-item__btn"
                  :disabled="gameStore.souls < healthCost || (gameStore.metaUpgrades?.health || 0) >= 20"
                  :class="{ 'shop-item__btn--disabled': gameStore.souls < healthCost || (gameStore.metaUpgrades?.health || 0) >= 20 }"
                  @click="buyHealth">{{ (gameStore.metaUpgrades?.health || 0) >= 20 ? 'MAX' : `${healthCost} 💀`
                  }}</button>
              </div>
              <div class="shop-item">
                <div>
                  <h4 class="shop-item__name">Base Speed +5% <span v-if="(gameStore.metaUpgrades?.speed || 0) >= 10"
                      class="shop-item__max">MAX</span></h4>
                  <p class="shop-item__sub">{{ gameStore.metaUpgrades?.speed || 0 }} / 10 levels (+{{
                    (Math.min(gameStore.metaUpgrades?.speed || 0, 10)) * 5 }}%)</p>
                </div>
                <button class="landing-screen__play-button shop-item__btn"
                  :disabled="gameStore.souls < speedCost || (gameStore.metaUpgrades?.speed || 0) >= 10"
                  :class="{ 'shop-item__btn--disabled': gameStore.souls < speedCost || (gameStore.metaUpgrades?.speed || 0) >= 10 }"
                  @click="buySpeed">{{ (gameStore.metaUpgrades?.speed || 0) >= 10 ? 'MAX' : `${speedCost} 💀`
                  }}</button>
              </div>
            </div>
          </div>
        </template>



        <!-- Bestiary -->
        <template v-else-if="showBestiary">
          <p class="landing-screen__modal-label">The Horde</p>
          <h2 class="landing-screen__modal-title">Subject Files</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid" style="grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
              <div v-for="i in 5" :key="i" class="challenge-picker__card" style="padding: 0.5rem; text-align: center;">
                <div style="width: 100%; aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; margin-bottom: 0.5rem; background: rgba(0,0,0,0.5);">
                  <img :src="`/assets/zombiles/z${i}.jpg`" alt="Zombie" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <span class="challenge-picker__card-name" style="font-size: 0.75rem;">Subject 0{{ i }}</span>
              </div>
            </div>
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
import { PLAYER_SKINS } from '../../game/config/playerVisualConfig'
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

const showShop = ref(false)
const showMapSelector = ref(false)
const showSkinSelector = ref(false)
const showBestiary = ref(false)
const pendingRunMode = ref('normal')
const selectedChallenge = ref('none')
const dropdownOpen = ref(false)
const previewMap = ref(gameStore.selectedMap || 'arena1')
const soundMuted = ref(readStorage(STORAGE_KEYS.soundMuted, false))
const runtimeProfile = getGameRuntimeProfile()

const closePanels = () => {
  showShop.value = false
  showMapSelector.value = false
  showSkinSelector.value = false
  showBestiary.value = false
}

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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');

/* ── Root ─────────────────────────────────────────────────── */
.landing-screen {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #030407;
  color: #f8fafc;
  font-family: 'Outfit', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes bg-pan {
  0% {
    transform: scale(1.05) translate(0, 0);
  }

  50% {
    transform: scale(1.12) translate(-1%, 2%);
  }

  100% {
    transform: scale(1.05) translate(0, 0);
  }
}

.landing-screen__backdrop {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(circle at 40% 40%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
    linear-gradient(135deg, rgba(3, 4, 7, 0.95) 0%, rgba(3, 4, 7, 0.4) 50%, rgba(3, 4, 7, 0.9) 100%);
  filter: saturate(0.6) brightness(0.6) contrast(1.2);
  animation: bg-pan 45s ease-in-out infinite alternate;
  z-index: 0;
}

.landing-screen__grain {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 3px 3px;
  opacity: 0.8;
  z-index: 1;
  pointer-events: none;
}

/* ── Layout ───────────────────────────────────────────────── */
.landing-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  pointer-events: none;
}

.landing-header>* {
  pointer-events: auto;
}

.landing-header__stats {
  display: flex;
  gap: 2.5rem;
}

.header-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.header-stat__label {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.header-stat__value {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #f8fafc;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
}

.header-stat__value--souls {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(192, 132, 252, 0.4));
}

.landing-header__actions {
  display: flex;
  gap: 1rem;
}

.header-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.header-action-btn--icon {
  padding: 0.6rem;
  font-size: 1.2rem;
}

.landing-screen__content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: 0 2rem;
}

.landing-screen__hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  max-width: 50rem;
  margin: 0 auto;
}

@keyframes float-logo {

  0%,
  100% {
    transform: translateY(0);
    filter: drop-shadow(0 15px 35px rgba(220, 38, 38, 0.5)) brightness(1);
  }

  50% {
    transform: translateY(-8px);
    filter: drop-shadow(0 25px 45px rgba(220, 38, 38, 0.8)) brightness(1.15);
  }
}

.landing-screen__logo {
  display: block;
  max-width: 100%;
  width: 36rem;
  margin: 0 auto 2.5rem;
  animation: float-logo 6s ease-in-out infinite;
}

/* ── Typography & Elements ────────────────────────────────── */
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
  margin: 1rem 0 0;
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.9rem;
  line-height: 1.75;
  border-left: 2px solid rgba(252, 211, 77, 0.35);
  padding-left: 1rem;
}

/* ── Challenge Picker ─────────────────────────────────────── */
.challenge-picker {
  margin: 0 auto;
  max-width: 24rem;
  width: 100%;
}

.challenge-picker__label {
  margin: 0 0 0.75rem;
  color: #fcd34d;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  text-shadow: 0 2px 10px rgba(252, 211, 77, 0.3);
}

/* Dropdown specific */
.landing-corner-modifiers {
  position: absolute;
  bottom: 2rem;
  left: 2.5rem;
  z-index: 10;
  width: 22rem;
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.custom-dropdown__selected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.custom-dropdown__selected:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(252, 211, 77, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(252, 211, 77, 0.1);
}

.custom-dropdown.is-open .custom-dropdown__selected {
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
}

.custom-dropdown__arrow {
  font-size: 0.8rem;
  color: #fcd34d;
  transition: transform 0.3s ease;
}

.custom-dropdown.is-open .custom-dropdown__arrow {
  transform: rotate(180deg);
}

.custom-dropdown__options {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  margin: 0;
  padding: 0.5rem;
  list-style: none;
  background: rgba(10, 15, 24, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 20rem;
  overflow-y: auto;
  z-index: 20;
}

.custom-dropdown__options li {
  padding: 0.85rem 1rem;
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.custom-dropdown__options li:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.custom-dropdown__options li.is-active {
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
}

/* Modals grid fallback */
.challenge-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.challenge-picker__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  color: #cbd5e1;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.challenge-picker__card:hover {
  background: rgba(252, 211, 77, 0.08);
  border-color: rgba(252, 211, 77, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(252, 211, 77, 0.15);
}

.challenge-picker__card--active {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
  box-shadow: 0 10px 25px rgba(251, 191, 36, 0.25), inset 0 0 0 1px rgba(251, 191, 36, 0.4);
  transform: translateY(-3px);
}

.challenge-picker__card-icon {
  font-size: 1.75rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.challenge-picker__card-name {
  font-size: 0.7rem;
}

.challenge-picker__desc {
  margin: 1rem 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
  min-height: 2.8rem;
  padding: 0.6rem 1rem;
  border-left: 3px solid rgba(252, 211, 77, 0.5);
  background: linear-gradient(90deg, rgba(252, 211, 77, 0.05) 0%, transparent 100%);
  border-radius: 0 8px 8px 0;
  text-align: left;
}

/* ── Action Buttons ───────────────────────────────────────── */
.landing-screen__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 2.5rem;
}

@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: 0 15px 35px rgba(220, 38, 38, 0.4), 0 0 20px rgba(220, 38, 38, 0.2);
  }

  50% {
    box-shadow: 0 20px 45px rgba(220, 38, 38, 0.6), 0 0 35px rgba(220, 38, 38, 0.4);
  }
}

.landing-screen__play-button,
.landing-screen__secondary-button,
.landing-screen__settings-toggle,
.landing-screen__modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.landing-screen__play-button {
  min-width: 16rem;
  padding: 1.35rem 2.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: pulse-glow 3s infinite;
  border: 1px solid rgba(255, 163, 163, 0.3);
}

.landing-screen__play-button:hover {
  transform: translateY(-4px) scale(1.02);
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 25px 50px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.5);
  color: #fff;
}

.landing-screen__secondary-button,
.landing-screen__settings-toggle,
.landing-screen__modal-close {
  padding: 1.1rem 1.75rem;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.landing-screen__secondary-button:hover,
.landing-screen__settings-toggle:hover,
.landing-screen__modal-close:hover {
  transform: translateY(-3px);
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Side panel removed and moved to header */

/* ── Modal ────────────────────────────────────────────────── */
.landing-screen__modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(3, 4, 7, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.landing-screen__modal {
  width: 100%;
  max-width: 36rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 4, 7, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-pop {
  0% {
    transform: scale(0.95) translateY(20px);
    opacity: 0;
  }

  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.landing-screen__modal-label {
  margin: 0;
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.landing-screen__modal-title {
  margin: 0.5rem 0 0;
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #f8fafc;
}

.landing-screen__modal-copy {
  margin-top: 1.5rem;
  color: #cbd5e1;
  line-height: 1.8;
  font-size: 1rem;
}

.landing-screen__modal-list {
  margin: 1.5rem 0 0;
  padding-left: 1.25rem;
}

.landing-screen__modal-list li {
  margin-bottom: 0.75rem;
}

.landing-screen__modal-list li strong {
  color: #fff;
}

.landing-screen__modal-close {
  margin-top: 2rem;
  width: 100%;
}

/* Shop items */
.shop-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.shop-item:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.15);
}

.shop-item__name {
  margin: 0;
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 800;
}

.shop-item__max {
  color: #4ade80;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  padding: 0.2rem 0.4rem;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 4px;
}

.shop-item__sub {
  margin: 0.4rem 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.shop-item__btn {
  min-width: auto;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.shop-item__btn--disabled {
  opacity: 0.5;
  filter: grayscale(1);
  cursor: not-allowed;
  box-shadow: none;
  animation: none;
  pointer-events: none;
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 1024px) {
  .landing-header {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .landing-header__stats {
    width: 100%;
    justify-content: space-between;
  }

  .landing-header__actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .landing-screen__content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    padding-bottom: 4rem;
  }
}

@media (max-width: 640px) {
  .landing-screen__content {
    padding: 1.5rem;
  }

  .landing-screen__hero {
    max-width: 100%;
  }

  .landing-screen__logo {
    width: 100%;
  }

  .landing-screen__actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .landing-screen__play-button,
  .landing-screen__secondary-button,
  .landing-screen__modal-close {
    width: 100%;
    text-align: center;
  }

  .challenge-picker__dropdown {
    font-size: 1rem;
  }

  .challenge-picker__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing-screen__modal {
    padding: 1.5rem;
  }

  .landing-screen__modal-copy {
    font-size: 0.95rem;
  }

  .landing-corner-modifiers {
    position: relative;
    bottom: auto;
    left: auto;
    width: 100%;
    margin-top: 1.5rem;
    z-index: 10;
  }

  .landing-screen__modal-title {
    font-size: 2rem;
  }
}
</style>
