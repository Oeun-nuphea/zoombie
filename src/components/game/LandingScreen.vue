<template>
  <section class="landing-screen">
    <div class="landing-screen__backdrop"></div>
    <div class="landing-screen__grain"></div>

    <!-- Zombie silhouettes walking in the background -->
    <!-- z1 faces RIGHT natively; z2,z3,z4,z5 face LEFT natively -->
    <div class="landing-screen__zombies">
      <div class="bg-zombie bg-zombie--ltr-native-right bg-zombie--1" style="background-image: url(/assets/zombiles/z1_frame.png)"></div>
      <div class="bg-zombie bg-zombie--rtl-native-left  bg-zombie--2" style="background-image: url(/assets/zombiles/z3_frame.png)"></div>
      <div class="bg-zombie bg-zombie--ltr-native-left  bg-zombie--3" style="background-image: url(/assets/zombiles/z5_frame.png)"></div>
      <div class="bg-zombie bg-zombie--rtl-native-left  bg-zombie--4" style="background-image: url(/assets/zombiles/z2_frame.png)"></div>
      <div class="bg-zombie bg-zombie--ltr-native-left  bg-zombie--5" style="background-image: url(/assets/zombiles/z4_frame.png)"></div>
      <div class="bg-zombie bg-zombie--rtl-native-right bg-zombie--6" style="background-image: url(/assets/zombiles/z1_frame.png)"></div>
    </div>

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
        <button class="header-action-btn" type="button" @click="showArsenal = true">
          🔫 Arsenal
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
        </div>
      </div>
    </div>

    <!-- ── Modals ── -->
    <div v-if="showShop || showMapSelector || showSkinSelector || showBestiary || showArsenal"
      class="landing-screen__modal-backdrop responsive-overlay" @click.self="closePanels">
      <div class="landing-screen__modal responsive-overlay__panel">

        <!-- Map Selector Mode -->
        <template v-if="showMapSelector">
          <p class="landing-screen__modal-label">Select Battleground</p>
          <h2 class="landing-screen__modal-title">Let's go</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
              <button v-for="(mapConfig, key) in MAP_CONFIG" :key="key" type="button" class="challenge-picker__card"
                :class="{
                  'challenge-picker__card--active': previewMap === key,
                  'challenge-picker__card--adventure': mapConfig.endless,
                  'map-card--locked': !mapConfig.default && !gameStore.unlockedMaps.includes(key)
                }" @click="previewMap = key" style="padding: 1rem; border-radius: 12px; min-height: 5.5rem; position: relative;">
                <span class="challenge-picker__card-icon"
                  style="font-size: 2rem; margin-bottom: 0.5rem; display: block;">{{ MAP_ICONS[key] }}</span>
                <span class="challenge-picker__card-name" style="font-size: 0.85rem;">{{ mapConfig.label }}</span>
                <span v-if="mapConfig.endless" class="map-badge-endless">∞ ENDLESS</span>
                <span v-if="!mapConfig.default && !gameStore.unlockedMaps.includes(key)" class="map-lock-badge">🔒</span>
              </button>
            </div>

            <div class="shop-item" style="margin-top: 1.5rem;">
              <div>
                <h4 class="shop-item__name">{{ MAP_CONFIG[previewMap]?.label }}</h4>
                <p class="shop-item__sub">{{ MAP_CONFIG[previewMap]?.desc }}</p>
              </div>
              <button v-if="MAP_CONFIG[previewMap] && !MAP_CONFIG[previewMap].default && !gameStore.unlockedMaps.includes(previewMap)"
                class="landing-screen__play-button shop-item__btn"
                :disabled="gameStore.souls < MAP_CONFIG[previewMap].cost"
                :class="{ 'shop-item__btn--disabled': gameStore.souls < MAP_CONFIG[previewMap].cost }" @click="buyMap">
                Unlock ({{ MAP_CONFIG[previewMap].cost }} 💀)
              </button>
              <button v-else class="landing-screen__play-button shop-item__btn" :disabled="!MAP_CONFIG[previewMap]" @click="confirmMapAndStart">
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

        <!-- Arsenal (Gun Skins + Head Skins) -->
        <template v-else-if="showArsenal">
          <p class="landing-screen__modal-label">Armory</p>
          <h2 class="landing-screen__modal-title">Loadout Cosmetics</h2>

          <!-- Tabs -->
          <div class="arsenal-tabs">
            <button class="arsenal-tab" :class="{ 'arsenal-tab--active': arsenalTab === 'gun' }" @click="arsenalTab = 'gun'">
              🔫 Gun Skins
            </button>
            <button class="arsenal-tab" :class="{ 'arsenal-tab--active': arsenalTab === 'head' }" @click="arsenalTab = 'head'">
              🤖 Head Gear
            </button>
          </div>

          <div class="landing-screen__modal-copy" style="margin-top: 1rem;">
            <!-- Gun Skins tab -->
            <template v-if="arsenalTab === 'gun'">
              <div class="gun-skin-grid">
                <button
                  v-for="(skin, key) in GUN_SKINS" :key="key" type="button"
                  class="gun-skin-card"
                  :class="[
                    `gun-skin-card--${skin.rarity}`,
                    { 'gun-skin-card--active': gameStore.selectedGunSkin === key },
                    { 'gun-skin-card--locked': !gameStore.unlockedGunSkins.includes(key) },
                  ]"
                  @click="selectGunSkinPreview(key)"
                >
                  <span class="gun-skin-card__rarity-badge" :class="`rarity--${skin.rarity}`">
                    {{ GUN_SKIN_RARITY[skin.rarity].label }}
                  </span>
                  <span class="gun-skin-card__icon">{{ skin.icon }}</span>
                  <span class="gun-skin-card__name">{{ skin.name }}</span>
                  <span v-if="!gameStore.unlockedGunSkins.includes(key)" class="gun-skin-card__cost">
                    {{ skin.cost }} 💀
                  </span>
                  <span v-else-if="gameStore.selectedGunSkin === key" class="gun-skin-card__equipped">✓ Equipped</span>
                  <span v-else class="gun-skin-card__cost" style="color: #4ade80;">Owned</span>
                </button>
              </div>
              <div v-if="previewGunSkin" class="gun-skin-preview">
                <div class="gun-skin-preview__info">
                  <span class="gun-skin-card__rarity-badge" :class="`rarity--${GUN_SKINS[previewGunSkin].rarity}`" style="font-size: 0.75rem;">
                    {{ GUN_SKIN_RARITY[GUN_SKINS[previewGunSkin].rarity].label }}
                  </span>
                  <h4 class="gun-skin-preview__name">{{ GUN_SKINS[previewGunSkin].icon }} {{ GUN_SKINS[previewGunSkin].name }}</h4>
                  <p class="gun-skin-preview__desc">{{ GUN_SKINS[previewGunSkin].desc }}</p>
                </div>
                <div class="gun-skin-preview__actions">
                  <button v-if="!gameStore.unlockedGunSkins.includes(previewGunSkin)"
                    class="landing-screen__play-button shop-item__btn"
                    :disabled="gameStore.souls < GUN_SKINS[previewGunSkin].cost"
                    :class="{ 'shop-item__btn--disabled': gameStore.souls < GUN_SKINS[previewGunSkin].cost }"
                    @click="buyGunSkin">
                    Unlock ({{ GUN_SKINS[previewGunSkin].cost }} 💀)
                  </button>
                  <button v-else-if="gameStore.selectedGunSkin !== previewGunSkin"
                    class="landing-screen__play-button shop-item__btn"
                    @click="equipGunSkin">
                    ✓ Equip Skin
                  </button>
                  <span v-else class="gun-skin-equipped-label">✓ Currently Equipped</span>
                </div>
              </div>
            </template>

            <!-- Head Gear tab -->
            <template v-else-if="arsenalTab === 'head'">
              <div class="gun-skin-grid">
                <button
                  v-for="(skin, key) in HEAD_SKINS" :key="key" type="button"
                  class="gun-skin-card"
                  :class="[
                    `gun-skin-card--${skin.rarity}`,
                    { 'gun-skin-card--active': gameStore.selectedHeadSkin === key },
                    { 'gun-skin-card--locked': !gameStore.unlockedHeadSkins.includes(key) },
                  ]"
                  @click="selectHeadSkinPreview(key)"
                >
                  <span class="gun-skin-card__rarity-badge" :class="`rarity-head--${skin.rarity}`">
                    {{ HEAD_SKIN_RARITY[skin.rarity].label }}
                  </span>
                  <span class="gun-skin-card__icon">{{ skin.icon }}</span>
                  <span class="gun-skin-card__name">{{ skin.name }}</span>
                  <span v-if="!gameStore.unlockedHeadSkins.includes(key)" class="gun-skin-card__cost">
                    {{ skin.cost }} 💀
                  </span>
                  <span v-else-if="gameStore.selectedHeadSkin === key" class="gun-skin-card__equipped">✓ Equipped</span>
                  <span v-else class="gun-skin-card__cost" style="color: #4ade80;">Owned</span>
                </button>
              </div>
              <div v-if="previewHeadSkin" class="gun-skin-preview">
                <div class="gun-skin-preview__info">
                  <span class="gun-skin-card__rarity-badge" :class="`rarity-head--${HEAD_SKINS[previewHeadSkin].rarity}`" style="font-size: 0.75rem;">
                    {{ HEAD_SKIN_RARITY[HEAD_SKINS[previewHeadSkin].rarity].label }}
                  </span>
                  <h4 class="gun-skin-preview__name">{{ HEAD_SKINS[previewHeadSkin].icon }} {{ HEAD_SKINS[previewHeadSkin].name }}</h4>
                  <p class="gun-skin-preview__desc">{{ HEAD_SKINS[previewHeadSkin].desc }}</p>
                </div>
                <div class="gun-skin-preview__actions">
                  <button v-if="!gameStore.unlockedHeadSkins.includes(previewHeadSkin)"
                    class="landing-screen__play-button shop-item__btn"
                    :disabled="gameStore.souls < HEAD_SKINS[previewHeadSkin].cost"
                    :class="{ 'shop-item__btn--disabled': gameStore.souls < HEAD_SKINS[previewHeadSkin].cost }"
                    @click="buyHeadSkin">
                    Unlock ({{ HEAD_SKINS[previewHeadSkin].cost }} 💀)
                  </button>
                  <button v-else-if="gameStore.selectedHeadSkin !== previewHeadSkin"
                    class="landing-screen__play-button shop-item__btn"
                    @click="equipHeadSkin">
                    ✓ Equip Gear
                  </button>
                  <span v-else class="gun-skin-equipped-label">✓ Currently Equipped</span>
                </div>
              </div>
            </template>
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
          <h2 class="landing-screen__modal-title">Zombies</h2>
          <div class="landing-screen__modal-copy" style="margin-top: 1.5rem;">
            <div class="challenge-picker__grid" style="grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
              <div v-for="zombie in bestiaryZombies" :key="zombie.id" 
                   class="challenge-picker__card" style="padding: 0.5rem; text-align: center;">
                <div style="width: 100%; aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; margin-bottom: 0.5rem; background: rgba(0,0,0,0.5);">
                  <img :src="`/assets/zombiles/${zombie.spriteKey || zombie.id}.jpg`" :alt="zombie.name" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <span class="challenge-picker__card-name" style="font-size: 0.75rem;">{{ zombie.name }}</span>
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
import { PLAYER_SKINS, GUN_SKINS, GUN_SKIN_RARITY, HEAD_SKINS, HEAD_SKIN_RARITY } from '../../game/config/playerVisualConfig'
import { getGameRuntimeProfile } from '../../utils/device'
import { ZOMBIE_TYPES } from '../../game/config/gameplayConfig'
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
  adventure: '🗺️',
}

const router = useRouter()
const gameStore = useGameStore()

const showShop = ref(false)
const showMapSelector = ref(false)
const showSkinSelector = ref(false)
const showArsenal = ref(false)
const showBestiary = ref(false)
const arsenalTab = ref('gun')
const previewGunSkin = ref(gameStore.selectedGunSkin || 'standard')
const previewHeadSkin = ref(gameStore.selectedHeadSkin || 'none')
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
  showArsenal.value = false
  showBestiary.value = false
}

const bestiaryZombies = computed(() => {
  return Object.values(ZOMBIE_TYPES).filter(z => !z.bossOnly)
})

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

function selectGunSkinPreview(key) {
  previewGunSkin.value = key
}

function buyGunSkin() {
  const skin = GUN_SKINS[previewGunSkin.value]
  if (!skin) return
  const ok = gameStore.buyGunSkin(previewGunSkin.value, skin.cost)
  if (ok) gameStore.setSelectedGunSkin(previewGunSkin.value)
}

function equipGunSkin() {
  gameStore.setSelectedGunSkin(previewGunSkin.value)
}

function selectHeadSkinPreview(key) {
  previewHeadSkin.value = key
}

function buyHeadSkin() {
  const skin = HEAD_SKINS[previewHeadSkin.value]
  if (!skin) return
  const ok = gameStore.buyHeadSkin(previewHeadSkin.value, skin.cost)
  if (ok) gameStore.setSelectedHeadSkin(previewHeadSkin.value)
}

function equipHeadSkin() {
  gameStore.setSelectedHeadSkin(previewHeadSkin.value)
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
  const mapCfg = MAP_CONFIG[previewMap.value]
  // Adventure map forces endless mode regardless of what was selected
  const mode = mapCfg?.endless ? 'endless' : pendingRunMode.value
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

/* ── Walking zombie silhouettes ──────────────────────────── */
.landing-screen__zombies {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

/* Sprite faces RIGHT natively → no flip for LTR, flip for RTL */
@keyframes walk-ltr-no-flip {
  from { transform: translateX(-180px); }
  to   { transform: translateX(calc(100vw + 180px)); }
}
@keyframes walk-rtl-flip {
  from { transform: translateX(calc(100vw + 180px)) scaleX(-1); }
  to   { transform: translateX(-180px) scaleX(-1); }
}

/* Sprite faces LEFT natively → flip for LTR, no flip for RTL */
@keyframes walk-ltr-flip {
  from { transform: translateX(-180px) scaleX(-1); }
  to   { transform: translateX(calc(100vw + 180px)) scaleX(-1); }
}
@keyframes walk-rtl-no-flip {
  from { transform: translateX(calc(100vw + 180px)); }
  to   { transform: translateX(-180px); }
}

@keyframes zombie-walk-frames {
  0%   { background-position: 0%   33.33%; }
  33%  { background-position: 50%  33.33%; }
  66%  { background-position: 100% 33.33%; }
  100% { background-position: 0%   33.33%; }
}

.bg-zombie {
  position: absolute;
  width: 120px;
  height: 97px;
  background-size: 300% 400%;
  background-position: 0% 33.33%;
  background-repeat: no-repeat;
  filter: brightness(0.35) saturate(0.3);
  opacity: 0.4;
  will-change: transform;
}

/* Faces right natively: no flip going right, flip going left */
.bg-zombie--ltr-native-right { animation: walk-ltr-no-flip linear infinite, zombie-walk-frames 0.6s steps(1) infinite; }
.bg-zombie--rtl-native-right { animation: walk-rtl-flip    linear infinite, zombie-walk-frames 0.6s steps(1) infinite; }

/* Faces left natively: flip going right, no flip going left */
.bg-zombie--ltr-native-left  { animation: walk-ltr-flip    linear infinite, zombie-walk-frames 0.6s steps(1) infinite; }
.bg-zombie--rtl-native-left  { animation: walk-rtl-no-flip linear infinite, zombie-walk-frames 0.6s steps(1) infinite; }

.bg-zombie--1 { top: 72%; animation-duration: 28s, 0.6s; animation-delay: -4s, 0s;  height: 90px; }
.bg-zombie--2 { top: 80%; animation-duration: 35s, 0.6s; animation-delay: -12s, 0s; height: 80px; }
.bg-zombie--3 { top: 65%; animation-duration: 24s, 0.6s; animation-delay: -18s, 0s; height: 110px; }
.bg-zombie--4 { top: 85%; animation-duration: 32s, 0.6s; animation-delay: -8s, 0s;  height: 75px; }
.bg-zombie--5 { top: 58%; animation-duration: 30s, 0.6s; animation-delay: -22s, 0s; height: 95px; }
.bg-zombie--6 { top: 76%; animation-duration: 26s, 0.6s; animation-delay: -15s, 0s; height: 85px; }

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

/* Locked map card — still clickable so user can preview & buy */
.map-card--locked {
  opacity: 0.55;
  filter: grayscale(0.8);
  cursor: pointer;
}

.map-card--locked:hover {
  opacity: 0.8;
  filter: grayscale(0.4);
}

.map-lock-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.85rem;
  line-height: 1;
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

  .landing-screen__logo {
    display: none;
  }
}

@media (max-height: 450px) {
  .landing-screen__logo {
    display: none;
  }
}

@media (max-width: 640px) {
  .landing-screen__content {
    padding: 1.5rem;
  }

  .landing-screen__hero {
    max-width: 100%;
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

/* ── Adventure / Endless Map card ────────────────────────── */
.challenge-picker__card--adventure {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.06);
}

.challenge-picker__card--adventure:hover {
  border-color: rgba(16, 185, 129, 0.8);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 18px rgba(16, 185, 129, 0.25);
}

.challenge-picker__card--active.challenge-picker__card--adventure {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3), inset 0 0 0 1px rgba(16, 185, 129, 0.5);
}

.map-badge-endless {
  display: inline-block;
  margin-top: 0.35rem;
  padding: 0.15rem 0.55rem;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.55);
  border-radius: 999px;
  color: #6ee7b7;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* ── Gun Skin Arsenal ─────────────────────────────────────── */
.gun-skin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.gun-skin-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 0.5rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  color: #cbd5e1;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.gun-skin-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--skin-glow, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.gun-skin-card:hover::before { opacity: 1; }

.gun-skin-card:hover {
  transform: translateY(-3px);
  border-color: var(--skin-color, rgba(255,255,255,0.3));
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 16px var(--skin-color, rgba(255,255,255,0.1));
}

.gun-skin-card--active {
  border-color: var(--skin-color, #fbbf24) !important;
  background: var(--skin-bg, rgba(251,191,36,0.12)) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px var(--skin-color, rgba(251,191,36,0.3)) !important;
  transform: translateY(-2px);
}

.gun-skin-card--locked {
  opacity: 0.72;
}

/* Rarity CSS variables */
.gun-skin-card--standard  { --skin-color: #94a3b8; --skin-glow: rgba(148,163,184,0.06); --skin-bg: rgba(148,163,184,0.1); }
.gun-skin-card--special   { --skin-color: #60a5fa; --skin-glow: rgba(96,165,250,0.08);  --skin-bg: rgba(96,165,250,0.12);  }
.gun-skin-card--epic      { --skin-color: #c084fc; --skin-glow: rgba(192,132,252,0.08); --skin-bg: rgba(192,132,252,0.12); }
.gun-skin-card--sakura    { --skin-color: #f472b6; --skin-glow: rgba(244,114,182,0.08); --skin-bg: rgba(244,114,182,0.12); }
.gun-skin-card--phantom   { --skin-color: #34d399; --skin-glow: rgba(52,211,153,0.08);  --skin-bg: rgba(52,211,153,0.12);  }
.gun-skin-card--inferno   { --skin-color: #fb923c; --skin-glow: rgba(251,146,60,0.08);  --skin-bg: rgba(251,146,60,0.12);  }

.gun-skin-card__rarity-badge {
  display: inline-block;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.15rem;
  border: 1px solid currentColor;
}

.rarity--standard { color: #94a3b8; background: rgba(148,163,184,0.12); }
.rarity--special  { color: #60a5fa; background: rgba(96,165,250,0.14);  }
.rarity--epic     { color: #c084fc; background: rgba(192,132,252,0.14); }
.rarity--sakura   { color: #f472b6; background: rgba(244,114,182,0.14); }
.rarity--phantom  { color: #34d399; background: rgba(52,211,153,0.14);  }
.rarity--inferno  { color: #fb923c; background: rgba(251,146,60,0.14);  }

.gun-skin-card__icon {
  font-size: 1.6rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
}

.gun-skin-card__name {
  font-size: 0.68rem;
  font-weight: 800;
  color: #e2e8f0;
}

.gun-skin-card__cost {
  font-size: 0.65rem;
  color: #fcd34d;
  font-weight: 700;
}

.gun-skin-card__equipped {
  font-size: 0.65rem;
  color: #4ade80;
  font-weight: 700;
}

/* Preview panel */
.gun-skin-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.gun-skin-preview__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.gun-skin-preview__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #f8fafc;
}

.gun-skin-preview__desc {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 24rem;
}

.gun-skin-preview__actions {
  flex-shrink: 0;
}

.gun-skin-equipped-label {
  color: #4ade80;
  font-size: 0.85rem;
  font-weight: 700;
}

/* ── Arsenal tabs ─────────────────────────────────────────────── */
.arsenal-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0;
}

.arsenal-tab {
  flex: 1;
  padding: 0.55rem 1rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(15,23,42,0.4);
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.arsenal-tab:hover {
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
}

.arsenal-tab--active {
  background: rgba(99,102,241,0.18);
  border-color: rgba(99,102,241,0.5);
  color: #a5b4fc;
  box-shadow: 0 0 12px rgba(99,102,241,0.2);
}

/* ── Head skin rarity badges (separate from gun rarity palette) ── */
.rarity-head--none    { color: #94a3b8; background: rgba(148,163,184,0.12); border: 1px solid currentColor; }
.rarity-head--rare    { color: #60a5fa; background: rgba(96,165,250,0.14);  border: 1px solid currentColor; }
.rarity-head--epic    { color: #c084fc; background: rgba(192,132,252,0.14); border: 1px solid currentColor; }
.rarity-head--mythic  { color: #fb923c; background: rgba(251,146,60,0.18);  border: 1px solid currentColor; }
.rarity-head--sakura  { color: #f472b6; background: rgba(244,114,182,0.14); border: 1px solid currentColor; }
.rarity-head--phantom { color: #34d399; background: rgba(52,211,153,0.14);  border: 1px solid currentColor; }
</style>

