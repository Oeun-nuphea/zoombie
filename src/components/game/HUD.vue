<template>
  <div :class="['hud-shell', isMobile ? 'hud-shell--mobile' : '', isMobileHudActive ? 'hud-shell--engaged' : '']">
    <div class="hud-shell__top">
      <div class="hud-shell__cluster hud-shell__cluster--left">
        <div class="hud-shell__chip hud-shell__chip--health">
          <span>HP</span>
          <strong>{{ Math.ceil(gameStore.health) }} / {{ gameStore.maxPlayerHealth }}</strong>
        </div>
      </div>

      <div class="hud-shell__chip hud-shell__chip--wave">
        <div class="hud-shell__wave-main">
          <span>Wave</span>
          <strong>{{ String(gameStore.wave).padStart(2, '0') }}</strong>
        </div>
        <div class="hud-shell__wave-intel" v-if="gameStore.waveInfo">
          <span class="hud-shell__intel-label">Target: {{ gameStore.waveInfo.totalZombies }} Zombies</span>
          <span class="hud-shell__intel-label">Types: {{ formatZombieTypes(gameStore.waveInfo) }}</span>
        </div>
      </div>

      <div class="hud-shell__cluster hud-shell__cluster--right">
        <div
          v-if="!isMobile"
          class="hud-shell__scoreboard"
        >
          <div class="hud-shell__chip hud-shell__chip--score">
            <span>Score</span>
            <strong>{{ formatScore(gameStore.score) }}</strong>
          </div>
          <div class="hud-shell__chip hud-shell__chip--score">
            <span>Best</span>
            <strong>{{ formatScore(gameStore.bestScore) }}</strong>
          </div>
        </div>

        <div class="hud-shell__actions">
          <button
            v-if="!isMobile"
            class="hud-shell__button hud-shell__button--secondary"
            type="button"
            @click="$emit('toggle-fullscreen')"
          >
            {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
          </button>
          <button
            class="hud-shell__button hud-shell__button--secondary"
            type="button"
            @touchstart.passive="engageMobileHud"
            @touchend.passive="scheduleMobileHudRelease"
            @touchcancel.passive="scheduleMobileHudRelease"
            @focus="engageMobileHud"
            @blur="scheduleMobileHudRelease"
            @click="$emit('toggle-sound')"
          >
            {{ soundMuted ? 'Muted' : 'Sound' }}
          </button>
          <button
            class="hud-shell__button"
            type="button"
            @touchstart.passive="engageMobileHud"
            @touchend.passive="scheduleMobileHudRelease"
            @touchcancel.passive="scheduleMobileHudRelease"
            @focus="engageMobileHud"
            @blur="scheduleMobileHudRelease"
            @click="$emit('pause')"
          >
            Pause
          </button>
        </div>
      </div>
    </div>

    <!-- Ammo display bottom-left -->
    <div
      class="hud-shell__ammo"
      :class="{ 'hud-shell__ammo--low': weaponInfo.isLow }"
    >
      <span>{{ weaponInfo.name }}</span>
      <strong v-if="weaponInfo.hasAmmo">{{ weaponInfo.ammo }} <em>/ {{ weaponInfo.maxAmmo }}</em></strong>
      <strong v-else>∞</strong>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

import { getWeaponDefinition } from '../../game/config/gameplayConfig'
import { formatScore } from '../../utils/helpers'

function formatZombieTypes(waveInfo) {
  if (!waveInfo) return ''
  const types = (waveInfo.zombieTypeWeights || []).map(w => w.id.charAt(0).toUpperCase() + w.id.slice(1))
  if (waveInfo.isBossWave && waveInfo.boss?.healthBarLabel) {
    types.push(waveInfo.boss.healthBarLabel)
  }
  return types.join(', ')
}

const props = defineProps({
  gameStore: {
    type: Object,
    required: true,
  },
  isFullscreen: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  soundMuted: {
    type: Boolean,
    default: false,
  },
})

const weaponInfo = computed(() => {
  const { weaponId, weaponAmmo, weaponAmmoMax } = props.gameStore
  const hasAmmo = Number.isFinite(weaponAmmo) && Number.isFinite(weaponAmmoMax)
  const def = getWeaponDefinition(weaponId)
  return {
    hasAmmo,
    name: def?.name ?? weaponId ?? 'GUN',
    ammo: weaponAmmo ?? 0,
    maxAmmo: weaponAmmoMax ?? 0,
    isLow: hasAmmo && weaponAmmoMax > 0 && weaponAmmo / weaponAmmoMax <= 0.25,
  }
})

const isMobileHudActive = ref(false)
let mobileHudReleaseTimeout = null

function clearMobileHudReleaseTimeout() {
  if (mobileHudReleaseTimeout) {
    window.clearTimeout(mobileHudReleaseTimeout)
    mobileHudReleaseTimeout = null
  }
}

function engageMobileHud() {
  isMobileHudActive.value = true
  clearMobileHudReleaseTimeout()
}

function scheduleMobileHudRelease() {
  clearMobileHudReleaseTimeout()
  mobileHudReleaseTimeout = window.setTimeout(() => {
    isMobileHudActive.value = false
    mobileHudReleaseTimeout = null
  }, 260)
}

onBeforeUnmount(() => {
  clearMobileHudReleaseTimeout()
})

defineEmits(['toggle-fullscreen', 'toggle-sound', 'pause'])
</script>

<style scoped>
.hud-shell {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 30;
}

.hud-shell__top {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 1rem);
  left: max(1rem, env(safe-area-inset-left, 0px));
  right: max(1rem, env(safe-area-inset-right, 0px));
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  min-height: 4rem;
}

.hud-shell__cluster,
.hud-shell__actions,
.hud-shell__scoreboard {
  display: flex;
  gap: 0.7rem;
}

.hud-shell__cluster {
  min-width: 0;
  align-items: flex-start;
}

.hud-shell__cluster--right {
  margin-left: auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: min(36rem, calc(100% - 15rem));
}

.hud-shell__chip,
.hud-shell__button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 10, 14, 0.35);
  backdrop-filter: blur(2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.hud-shell__chip {
  min-width: 5.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 1rem;
}

.hud-shell__chip--health {
  min-width: 8rem;
}

.hud-shell__chip--wave {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  text-align: center;
}

.hud-shell__chip--score {
  min-width: 7.2rem;
  text-align: center;
}

.hud-shell__wave-intel {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.hud-shell__chip span,
.hud-shell__chip span.hud-shell__intel-label {
  display: block;
}

.hud-shell__chip span {
  color: rgba(252, 211, 77, 0.86);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hud-shell__chip strong {
  display: block;
  margin-top: 0.35rem;
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 900;
}

.hud-shell__button {
  pointer-events: auto;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  color: #f8fafc;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.hud-shell__button--secondary {
  background: rgba(7, 10, 14, 0.45);
}

@media (max-width: 900px) {
  .hud-shell__button {
    padding: 0.95rem 1.05rem;
    font-size: 0.76rem;
  }
}

@media (max-width: 900px) {
  .hud-shell--mobile .hud-shell__top {
    align-items: stretch;
    gap: 0.5rem;
    min-height: 0;
  }

  .hud-shell--mobile .hud-shell__chip,
  .hud-shell--mobile .hud-shell__button {
    opacity: 0.2;
    transition:
      opacity 240ms ease,
      background-color 240ms ease,
      box-shadow 240ms ease,
      backdrop-filter 240ms ease;
  }

  .hud-shell--mobile .hud-shell__chip {
    background: rgba(7, 10, 14, 0.18);
    backdrop-filter: blur(4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }

  .hud-shell--mobile .hud-shell__button,
  .hud-shell--mobile .hud-shell__button--secondary {
    background: rgba(7, 10, 14, 0.22);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
  }

  .hud-shell--mobile.hud-shell--engaged .hud-shell__chip,
  .hud-shell--mobile.hud-shell--engaged .hud-shell__button {
    opacity: 0.9;
    backdrop-filter: blur(14px);
  }

  .hud-shell--mobile.hud-shell--engaged .hud-shell__chip {
    background: rgba(7, 10, 14, 0.7);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  }

  .hud-shell--mobile.hud-shell--engaged .hud-shell__button,
  .hud-shell--mobile.hud-shell--engaged .hud-shell__button--secondary {
    background: rgba(7, 10, 14, 0.76);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.24);
  }

  .hud-shell--mobile .hud-shell__chip {
    min-width: 5rem;
    padding: 0.72rem 0.8rem;
  }

  .hud-shell--mobile .hud-shell__chip strong {
    font-size: 1rem;
  }

  .hud-shell--mobile .hud-shell__actions {
    flex-direction: column-reverse;
    align-items: stretch;
    min-width: 5.7rem;
  }

  .hud-shell--mobile .hud-shell__button {
    min-width: 5.7rem;
    padding: 0.9rem 0.95rem;
    font-size: 0.72rem;
  }
}

@media (max-width: 720px) {
  .hud-shell__top {
    gap: 0.5rem;
  }

  .hud-shell__cluster--right {
    max-width: calc(100% - 8rem);
  }

  .hud-shell__scoreboard {
    gap: 0.5rem;
  }

  .hud-shell--mobile .hud-shell__chip--health {
    min-width: 6.4rem;
  }

  .hud-shell--mobile .hud-shell__chip--wave {
    min-width: 4.8rem;
  }
}

.hud-shell__ammo {
  position: absolute;
  bottom: max(1.4rem, env(safe-area-inset-bottom, 0px));
  left: max(1.2rem, env(safe-area-inset-left, 0px));
  padding: 0.6rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 10, 14, 0.5);
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: border-color 200ms ease, background 200ms ease;
  min-width: 7rem;
}

.hud-shell__ammo span {
  display: block;
  color: rgba(252, 211, 77, 0.86);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hud-shell__ammo strong {
  display: block;
  margin-top: 0.3rem;
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 900;
  line-height: 1;
}

.hud-shell__ammo strong em {
  font-style: normal;
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.45);
}

.hud-shell__ammo--low {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(127, 15, 15, 0.45);
}

.hud-shell__ammo--low strong {
  color: #fca5a5;
}
</style>
