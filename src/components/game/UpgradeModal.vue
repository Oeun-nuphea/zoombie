<template>
  <Transition name="upgrade-enter">
    <div
      v-if="visible"
      :class="['upgrade-modal', { 'upgrade-modal--mobile': isMobile }]"
    >
      <div class="upgrade-modal__frame">
        <!-- Header -->
        <div class="upgrade-modal__header">
          <div class="upgrade-modal__badge">
            <span class="upgrade-modal__badge-icon">⚡</span>
            <span class="upgrade-modal__badge-text">Upgrade Draft</span>
          </div>
          <h2 class="upgrade-modal__title">Choose Your Edge</h2>
          <div
            v-if="autoPickSeconds > 0"
            class="upgrade-modal__timer"
          >
            <span class="upgrade-modal__timer-bar" :style="{ width: timerPercent + '%' }" />
            <span class="upgrade-modal__timer-text">{{ autoPickSeconds }}s</span>
          </div>
        </div>

        <!-- Cards -->
        <div class="upgrade-modal__body">
          <div :class="['upgrade-modal__grid', { 'upgrade-modal__grid--two': choices.length <= 2 }]">
            <button
              v-for="(choice, index) in choices"
              :key="choice.id"
              :class="[
                'upgrade-card',
                { 'upgrade-card--active': activeCardId === choice.id },
              ]"
              type="button"
              :style="{ '--accent': choice.accentColor || '#fb923c', '--accent-glow': (choice.accentColor || '#fb923c') + '33' }"
              @mousedown="setActiveCard(choice.id)"
              @touchstart="setActiveCard(choice.id)"
              @focus="setActiveCard(choice.id)"
              @mouseleave="clearActiveCard(choice.id)"
              @touchend="clearActiveCard(choice.id)"
              @touchcancel="clearActiveCard(choice.id)"
              @blur="clearActiveCard(choice.id)"
              @click="$emit('select', choice.id)"
            >
              <!-- Glow effect -->
              <span class="upgrade-card__glow" />

              <!-- Top row: number + type badge -->
              <div class="upgrade-card__top">
                <span class="upgrade-card__index">{{ index + 1 }}</span>
                <span class="upgrade-card__type-badge">{{ formatType(choice.type) }}</span>
                <span :class="['upgrade-card__stack-badge', { 'upgrade-card__stack-badge--new': !hasStack(choice.id) }]">
                  {{ formatStack(choice.id) }}
                </span>
              </div>

              <!-- Name -->
              <h3 class="upgrade-card__name">{{ choice.name }}</h3>

              <!-- Divider -->
              <span class="upgrade-card__divider" />

              <!-- Description -->
              <p class="upgrade-card__desc">{{ getChoiceDescription(choice) }}</p>

              <!-- Hotkey hint (desktop) -->
              <span v-if="!isMobile" class="upgrade-card__hotkey">{{ index + 1 }}</span>
            </button>
          </div>
        </div>

        <!-- Keyboard hint -->
        <p v-if="!isMobile" class="upgrade-modal__hint">
          Press <kbd>1</kbd><template v-if="choices.length >= 2"> – <kbd>{{ choices.length }}</kbd></template> to pick
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  choices: {
    type: Array,
    default: () => [],
  },
  autoPickEndsAt: {
    type: Number,
    default: 0,
  },
  upgradeCounts: {
    type: Object,
    default: () => ({}),
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
const now = ref(Date.now())
const activeCardId = ref(null)
let countdownInterval = null

const AUTOPICK_DURATION_MS = 35000

function formatType(type = 'passive') {
  return type.toUpperCase()
}

function hasStack(upgradeId) {
  return (props.upgradeCounts?.[upgradeId] ?? 0) > 0
}

function formatStack(upgradeId) {
  const count = props.upgradeCounts?.[upgradeId] ?? 0
  return count > 0 ? `LV ${count + 1}` : 'NEW'
}

function handleKeydown(event) {
  if (!props.visible) {
    return
  }

  if (event.code === 'Digit1' || event.code === 'Numpad1') {
    emit('select', props.choices[0]?.id)
  }

  if (event.code === 'Digit2' || event.code === 'Numpad2') {
    emit('select', props.choices[1]?.id)
  }

  if (event.code === 'Digit3' || event.code === 'Numpad3') {
    emit('select', props.choices[2]?.id)
  }
}

function setActiveCard(choiceId) {
  activeCardId.value = choiceId
}

function clearActiveCard(choiceId = null) {
  if (!choiceId || activeCardId.value === choiceId) {
    activeCardId.value = null
  }
}

function getChoiceDescription(choice = {}) {
  if (props.isMobile) {
    return choice.shortDescription ?? choice.description ?? ''
  }

  return choice.description ?? choice.shortDescription ?? ''
}

const autoPickSeconds = computed(() => {
  if (!props.visible || !props.autoPickEndsAt) {
    return 0
  }

  return Math.max(0, Math.ceil((props.autoPickEndsAt - now.value) / 1000))
})

const timerPercent = computed(() => {
  if (!props.visible || !props.autoPickEndsAt) return 0
  const remaining = Math.max(0, props.autoPickEndsAt - now.value)
  return Math.min(100, (remaining / AUTOPICK_DURATION_MS) * 100)
})

function stopCountdown() {
  if (countdownInterval) {
    window.clearInterval(countdownInterval)
    countdownInterval = null
  }
}

function startCountdown() {
  stopCountdown()

  if (!props.visible || !props.autoPickEndsAt) {
    return
  }

  now.value = Date.now()
  countdownInterval = window.setInterval(() => {
    now.value = Date.now()

    if (props.autoPickEndsAt <= now.value) {
      stopCountdown()
    }
  }, 250)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startCountdown()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCountdown()
  clearActiveCard()
})

watch(
  () => [props.visible, props.autoPickEndsAt],
  () => {
    startCountdown()

    if (!props.visible) {
      clearActiveCard()
    }
  },
)
</script>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */
.upgrade-modal {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  padding:
    max(12px, env(safe-area-inset-top, 12px))
    max(12px, env(safe-area-inset-right, 12px))
    max(12px, env(safe-area-inset-bottom, 12px))
    max(12px, env(safe-area-inset-left, 12px));
  overscroll-behavior: contain;
  background: radial-gradient(ellipse at 50% 30%, rgba(251, 146, 60, 0.08) 0%, transparent 60%),
              rgba(2, 6, 12, 0.72);
  backdrop-filter: blur(16px) saturate(1.1);
}

/* ── Frame ───────────────────────────────────────────────────────────────── */
.upgrade-modal__frame {
  width: min(94vw, 52rem);
  max-width: 52rem;
  max-height: min(calc(100dvh - 2rem), 44rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(1.4rem, 3vw, 2rem);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.5rem;
  background: linear-gradient(170deg, rgba(15, 23, 42, 0.97) 0%, rgba(8, 12, 21, 0.98) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 32px 80px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.upgrade-modal__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.upgrade-modal__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.upgrade-modal__badge-icon {
  font-size: 0.75rem;
  line-height: 1;
}

.upgrade-modal__badge-text {
  color: #fcd34d;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.upgrade-modal__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* ── Timer ────────────────────────────────────────────────────────────────── */
.upgrade-modal__timer {
  position: relative;
  width: 6rem;
  height: 0.32rem;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.8);
  overflow: hidden;
}

.upgrade-modal__timer-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #fbbf24, #f97316);
  transition: width 0.25s linear;
}

.upgrade-modal__timer-text {
  position: absolute;
  top: 0.55rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* ── Body / Grid ─────────────────────────────────────────────────────────── */
.upgrade-modal__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.upgrade-modal__body::-webkit-scrollbar {
  width: 0.3rem;
}

.upgrade-modal__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.3);
}

.upgrade-modal__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.85rem;
}

.upgrade-modal__grid--two {
  max-width: 44rem;
  margin: 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.upgrade-card {
  --card-bg: rgba(15, 23, 42, 0.7);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  overflow: hidden;
  min-height: clamp(11rem, 24vh, 14rem);
  padding: 1.25rem 1.3rem 1.15rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.1rem;
  background: var(--card-bg);
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.upgrade-card:hover,
.upgrade-card:focus-visible,
.upgrade-card--active {
  --card-bg: rgba(20, 30, 52, 0.9);
  border-color: var(--accent);
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.28),
    0 0 24px var(--accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.upgrade-card:active {
  opacity: 0.92;
  transition-duration: 80ms;
}

.upgrade-card:focus-visible {
  outline: none;
}

/* Card glow */
.upgrade-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 200ms ease;
}

.upgrade-card:hover .upgrade-card__glow,
.upgrade-card--active .upgrade-card__glow {
  opacity: 1;
}

/* Top row */
.upgrade-card__top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.upgrade-card__index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(226, 232, 240, 0.6);
  font-size: 0.68rem;
  font-weight: 800;
}

.upgrade-card__type-badge {
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.upgrade-card__stack-badge {
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.upgrade-card__stack-badge--new {
  background: rgba(52, 211, 153, 0.1);
  border-color: rgba(52, 211, 153, 0.22);
  color: #6ee7b7;
}

/* Name */
.upgrade-card__name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.01em;
  word-break: break-word;
}

/* Divider */
.upgrade-card__divider {
  display: block;
  height: 1px;
  background: linear-gradient(90deg, var(--accent), transparent 70%);
  opacity: 0.25;
}

/* Description */
.upgrade-card__desc {
  margin: 0;
  color: rgba(203, 213, 225, 0.82);
  font-size: 0.88rem;
  line-height: 1.5;
  word-break: break-word;
}

/* Hotkey hint */
.upgrade-card__hotkey {
  position: absolute;
  bottom: 0.75rem;
  right: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(148, 163, 184, 0.4);
  font-size: 0.68rem;
  font-weight: 700;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease;
}

.upgrade-card:hover .upgrade-card__hotkey {
  opacity: 1;
}

/* ── Keyboard hint ───────────────────────────────────────────────────────── */
.upgrade-modal__hint {
  margin: 0;
  text-align: center;
  color: rgba(148, 163, 184, 0.45);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.upgrade-modal__hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 0.32rem;
  border-radius: 0.3rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(226, 232, 240, 0.6);
  font-family: inherit;
  font-size: 0.62rem;
  font-weight: 800;
}

/* ── Transition ──────────────────────────────────────────────────────────── */
.upgrade-enter-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upgrade-enter-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.upgrade-enter-enter-from,
.upgrade-enter-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE
   ═══════════════════════════════════════════════════════════════════════════ */
.upgrade-modal--mobile {
  align-items: center;
  justify-content: center;
}

.upgrade-modal--mobile .upgrade-modal__frame {
  width: min(94vw, 420px);
  max-width: 420px;
  max-height: min(78vh, calc(100vh - 24px));
  gap: 0.75rem;
  padding: 1rem;
}

.upgrade-modal--mobile .upgrade-modal__title {
  font-size: clamp(1.1rem, 4vw, 1.35rem);
}

.upgrade-modal--mobile .upgrade-modal__body {
  flex: 0 0 auto;
  overflow: visible;
}

.upgrade-modal--mobile .upgrade-modal__grid,
.upgrade-modal--mobile .upgrade-modal__grid--two {
  grid-template-columns: 1fr;
  gap: 0.55rem;
}

.upgrade-modal--mobile .upgrade-card {
  min-height: 5rem;
  padding: 0.75rem 0.85rem 0.8rem;
  gap: 0.4rem;
  border-radius: 0.9rem;
}

.upgrade-modal--mobile .upgrade-card__name {
  font-size: clamp(0.95rem, 3.5vw, 1.1rem);
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.upgrade-modal--mobile .upgrade-card__desc {
  font-size: 0.75rem;
  line-height: 1.25;
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.upgrade-modal--mobile .upgrade-card__index {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.6rem;
}

.upgrade-modal--mobile .upgrade-card__type-badge,
.upgrade-modal--mobile .upgrade-card__stack-badge {
  font-size: 0.5rem;
  padding: 0.14rem 0.4rem;
}

/* ── Landscape mobile ────────────────────────────────────────────────────── */
@media (orientation: landscape) and (max-width: 1023px) {
  .upgrade-modal--mobile .upgrade-modal__frame {
    width: min(94vw, 36rem);
    max-width: 36rem;
    max-height: min(84dvh, calc(100dvh - 24px));
    padding: 0.85rem 1rem;
  }

  .upgrade-modal--mobile .upgrade-modal__grid,
  .upgrade-modal--mobile .upgrade-modal__grid--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .upgrade-modal--mobile .upgrade-card {
    min-height: 5rem;
  }
}

/* ── 3-column on wide screens ────────────────────────────────────────────── */
@media (min-width: 1180px) {
  .upgrade-modal__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ── Small screens ───────────────────────────────────────────────────────── */
@media (max-width: 420px) {
  .upgrade-modal__frame {
    width: min(96vw, 24rem);
    padding: 0.95rem;
  }

  .upgrade-card {
    min-height: 10rem;
    padding: 1rem;
  }

  .upgrade-card__desc {
    font-size: 0.82rem;
  }
}

@supports (height: 100dvh) {
  .upgrade-modal__frame {
    max-height: min(calc(100dvh - 2rem), 44rem);
  }

  .upgrade-modal--mobile .upgrade-modal__frame {
    max-height: min(
      78dvh,
      calc(
        100dvh
        - env(safe-area-inset-top, 12px)
        - env(safe-area-inset-bottom, 12px)
        - 24px
      )
    );
  }
}
</style>
