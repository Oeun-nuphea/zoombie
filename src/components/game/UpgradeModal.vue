<template>
  <div
    v-if="visible"
    :class="['upgrade-modal', { 'upgrade-modal--mobile': isMobile }]"
  >
    <div class="upgrade-modal__frame">
      <div class="upgrade-modal__header">
        <p class="upgrade-modal__label">Upgrade Draft</p>
        <div class="upgrade-modal__header-main">
          <h2 class="upgrade-modal__title">Pick your next edge.</h2>
          <p
            v-if="autoPickSeconds > 0"
            class="upgrade-modal__timer"
          >
            Auto-picks in {{ autoPickSeconds }}s
          </p>
        </div>
      </div>

      <div class="upgrade-modal__body">
        <div :class="['upgrade-modal__grid', { 'upgrade-modal__grid--two': choices.length <= 2 }]">
          <button
            v-for="(choice, index) in choices"
            :key="choice.id"
            :class="['upgrade-modal__card', { 'upgrade-modal__card--active': activeCardId === choice.id }]"
            type="button"
            :style="{ '--upgrade-accent': choice.accentColor || '#fb923c' }"
            @mousedown="setActiveCard(choice.id)"
            @touchstart="setActiveCard(choice.id)"
            @focus="setActiveCard(choice.id)"
            @mouseleave="clearActiveCard(choice.id)"
            @touchend="clearActiveCard(choice.id)"
            @touchcancel="clearActiveCard(choice.id)"
            @blur="clearActiveCard(choice.id)"
            @click="$emit('select', choice.id)"
          >
            <span class="upgrade-modal__accent"></span>
            <div class="upgrade-modal__meta">
              <p class="upgrade-modal__kicker">
                {{ index + 1 }} · {{ formatType(choice.type) }} · {{ formatStack(choice.id) }}
              </p>
              <p
                v-if="isMobile && choice.quickLabel"
                class="upgrade-modal__chip"
              >
                {{ choice.quickLabel }}
              </p>
            </div>
            <h3 class="upgrade-modal__name">{{ choice.name }}</h3>
            <p class="upgrade-modal__description">{{ getChoiceDescription(choice) }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
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

function formatType(type = 'passive') {
  return type.toUpperCase()
}

function formatStack(upgradeId) {
  const count = props.upgradeCounts?.[upgradeId] ?? 0
  return count > 0 ? `STACK ${count}` : 'NEW'
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
  background: rgba(2, 6, 12, 0.58);
  backdrop-filter: blur(10px);
}

.upgrade-modal__frame {
  width: min(92vw, 56rem);
  max-width: 56rem;
  max-height: min(calc(100dvh - 2rem), 46rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(1.15rem, 2.8vw, 1.75rem);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: clamp(1rem, 3vw, 1.35rem);
  background: rgba(8, 17, 28, 0.94);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35);
}

.upgrade-modal__header {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  flex: 0 0 auto;
  text-align: center;
}

.upgrade-modal__header-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}

.upgrade-modal__label {
  margin: 0;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.upgrade-modal__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  line-height: 1.05;
}

.upgrade-modal__timer {
  margin: 0;
  align-self: center;
  padding: 0.48rem 0.82rem;
  border: 1px solid rgba(147, 197, 253, 0.18);
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.56);
  color: rgba(191, 219, 254, 0.86);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.upgrade-modal__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.upgrade-modal__body::-webkit-scrollbar {
  width: 0.36rem;
}

.upgrade-modal__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.4);
}

.upgrade-modal__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
  gap: 1rem;
  padding: 0;
  overflow: visible;
  scroll-snap-type: none;
  touch-action: auto;
}

.upgrade-modal__grid::-webkit-scrollbar {
  display: none;
}

.upgrade-modal__grid--two {
  max-width: 52rem;
  margin: 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.upgrade-modal__card {
  --card-outline: rgba(255, 255, 255, 0.08);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: clamp(12rem, 28vh, 15rem);
  padding: 1.35rem 1.4rem;
  border: 0;
  border-radius: 1.35rem;
  background: rgba(10, 19, 32, 0.95);
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
  scroll-snap-align: unset;
  box-shadow:
    inset 0 0 0 1px var(--card-outline),
    0 16px 34px rgba(0, 0, 0, 0.24);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.upgrade-modal__card:hover,
.upgrade-modal__card:focus-visible,
.upgrade-modal__card--active,
.upgrade-modal__card:active {
  --card-outline: var(--upgrade-accent);
  transform: translateY(-3px);
  background: rgba(13, 24, 40, 0.98);
  box-shadow:
    inset 0 0 0 1px var(--card-outline),
    0 20px 48px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--upgrade-accent);
}

.upgrade-modal__card:focus-visible {
  outline: none;
}

.upgrade-modal__accent {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.45rem;
  background: var(--upgrade-accent);
}

.upgrade-modal__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.upgrade-modal__kicker {
  margin: 0;
  color: rgba(191, 219, 254, 0.86);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.upgrade-modal__name {
  margin: 0.85rem 0 0;
  font-size: 1.55rem;
  font-weight: 900;
  line-height: 1.08;
  word-break: break-word;
}

.upgrade-modal__description {
  margin: 0.85rem 0 0;
  color: rgba(226, 232, 240, 0.82);
  font-size: 1rem;
  line-height: 1.65;
  word-break: break-word;
}

.upgrade-modal__chip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  margin: 0.58rem 0 0;
  padding: 0.28rem 0.52rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.74);
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.upgrade-modal--mobile {
  align-items: center;
  justify-content: center;
}

.upgrade-modal--mobile .upgrade-modal__frame {
  width: min(92vw, 420px);
  max-width: 420px;
  max-height: min(78vh, calc(100vh - 24px));
  gap: 0.5rem;
  padding: 0.72rem;
}

.upgrade-modal--mobile .upgrade-modal__header {
  gap: 0.2rem;
  text-align: center;
}

.upgrade-modal--mobile .upgrade-modal__header-main {
  align-items: center;
  gap: 0.34rem;
}

.upgrade-modal--mobile .upgrade-modal__title {
  font-size: clamp(1rem, 3.8vw, 1.24rem);
  line-height: 1;
}

.upgrade-modal--mobile .upgrade-modal__timer {
  align-self: center;
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  padding: 0.28rem 0.48rem;
}

.upgrade-modal--mobile .upgrade-modal__body {
  flex: 0 0 auto;
  min-height: 0;
  overflow: visible;
}

.upgrade-modal--mobile .upgrade-modal__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0;
  overflow: visible;
  scroll-snap-type: none;
  touch-action: auto;
}

.upgrade-modal--mobile .upgrade-modal__grid--two {
  grid-template-columns: 1fr;
}

.upgrade-modal--mobile .upgrade-modal__card {
  width: 100%;
  max-width: none;
  min-width: 0;
  min-height: 4.55rem;
  padding: 0.64rem 0.72rem 0.68rem 0.82rem;
  border-radius: 1rem;
  scroll-snap-align: unset;
}

.upgrade-modal--mobile .upgrade-modal__kicker {
  font-size: 0.54rem;
  letter-spacing: 0.1em;
}

.upgrade-modal--mobile .upgrade-modal__name {
  margin-top: 0.28rem;
  font-size: clamp(0.9rem, 3.3vw, 1rem);
  line-height: 1.02;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.upgrade-modal--mobile .upgrade-modal__description {
  margin-top: 0.18rem;
  font-size: 0.72rem;
  line-height: 1.16;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.upgrade-modal--mobile .upgrade-modal__chip {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 52%;
  margin: 0;
  padding: 0.18rem 0.38rem;
  font-size: 0.48rem;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@supports (height: 100dvh) {
  .upgrade-modal__frame {
    max-height: min(calc(100dvh - 2rem), 46rem);
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

@media (orientation: landscape) and (max-width: 1023px) {
  .upgrade-modal--mobile .upgrade-modal__frame {
    width: min(94vw, 34rem);
    max-width: 34rem;
    max-height: min(82dvh, calc(100dvh - 24px));
    padding: 0.66rem 0.72rem 0.72rem;
  }

  .upgrade-modal--mobile .upgrade-modal__grid,
  .upgrade-modal--mobile .upgrade-modal__grid--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .upgrade-modal--mobile .upgrade-modal__card {
    min-height: 4.7rem;
  }

  .upgrade-modal--mobile .upgrade-modal__title {
    font-size: clamp(0.96rem, 2.8vw, 1.18rem);
  }
}

@media (min-width: 1180px) {
  .upgrade-modal__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .upgrade-modal__frame {
    width: min(94vw, 24rem);
    max-height: min(calc(100dvh - 0.8rem), 33rem);
    padding: 0.85rem 0.85rem 1rem;
  }

  .upgrade-modal__card {
    flex-basis: 84%;
    min-height: 11rem;
    padding-inline: 0.95rem;
  }

  .upgrade-modal__description {
    font-size: 0.88rem;
  }

  .upgrade-modal--mobile .upgrade-modal__frame {
    width: min(92vw, 24rem);
    max-height: min(78dvh, calc(100dvh - 24px));
    padding: 0.7rem;
  }

  .upgrade-modal--mobile .upgrade-modal__card {
    min-height: 4.35rem;
    padding-inline: 0.76rem;
  }

  .upgrade-modal--mobile .upgrade-modal__title {
    font-size: clamp(0.96rem, 4vw, 1.14rem);
  }

  .upgrade-modal--mobile .upgrade-modal__description {
    font-size: 0.68rem;
  }
}

@media (max-height: 760px) and (max-width: 767px) {
  .upgrade-modal__frame {
    max-height: min(80dvh, calc(100dvh - 24px));
  }

  .upgrade-modal__card {
    min-height: 10.5rem;
  }

  .upgrade-modal--mobile .upgrade-modal__frame {
    max-height: min(80dvh, calc(100dvh - 24px));
  }

  .upgrade-modal--mobile .upgrade-modal__card {
    min-height: 4.2rem;
    padding-block: 0.6rem 0.64rem;
  }
}
</style>
