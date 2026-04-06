<template>
  <div
    v-if="visible"
    :class="['mobile-controls', { 'mobile-controls--engaged': isControlsActive }]"
  >
    <div class="mobile-controls__status">
      Auto aim · Auto fire
    </div>

    <div
      ref="joystick"
      :class="['mobile-controls__joystick', { 'mobile-controls__joystick--active': isJoystickActive }]"
      @touchstart.prevent="handleJoystickStart"
      @touchmove.prevent="handleJoystickMove"
      @touchend.prevent="handleJoystickEnd"
      @touchcancel.prevent="handleJoystickEnd"
    >
      <div class="mobile-controls__joystick-base"></div>
      <div
        class="mobile-controls__joystick-thumb"
        :style="thumbStyle"
      ></div>
    </div>

    <div class="mobile-controls__actions">
      <button
        v-if="canShield"
        :class="['mobile-controls__action', 'mobile-controls__action--secondary', { 'mobile-controls__action--active': activeActionId === 'shield' }]"
        type="button"
        @touchstart.prevent="handleActionTouchStart('shield')"
        @touchend.prevent="handleActionTouchEnd('shield')"
        @touchcancel.prevent="handleActionTouchEnd('shield')"
        @focus="setActiveAction('shield')"
        @blur="clearActiveAction('shield')"
        @click.prevent="triggerAction('shield')"
      >
        Shield
      </button>
      <button
        v-if="canDash"
        :class="['mobile-controls__action', { 'mobile-controls__action--active': activeActionId === 'dash' }]"
        type="button"
        @touchstart.prevent="handleActionTouchStart('dash')"
        @touchend.prevent="handleActionTouchEnd('dash')"
        @touchcancel.prevent="handleActionTouchEnd('dash')"
        @focus="setActiveAction('dash')"
        @blur="clearActiveAction('dash')"
        @click.prevent="triggerAction('dash')"
      >
        Dash
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { releaseMobileJoystick, setMobileJoystick, triggerMobileAction } from '../../game/input/inputMobile'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  gameStore: {
    type: Object,
    required: true,
  },
})

const joystick = ref(null)
const activeTouchId = ref(null)
const activeActionId = ref(null)
const thumbPosition = ref({
  x: 0,
  y: 0,
})

const canDash = computed(() => (props.gameStore?.playerCombatStats?.dashDistance ?? 0) > 0)
const canShield = computed(() => (props.gameStore?.playerCombatStats?.shieldDurationMs ?? 0) > 0)
const isJoystickActive = computed(() => activeTouchId.value !== null)
const isControlsActive = computed(() => isJoystickActive.value || activeActionId.value !== null)
const thumbStyle = computed(() => ({
  transform: `translate(${thumbPosition.value.x}px, ${thumbPosition.value.y}px) scale(${isJoystickActive.value ? 1.04 : 1})`,
}))
let actionReleaseTimeout = null

function clearActionReleaseTimeout() {
  if (actionReleaseTimeout) {
    window.clearTimeout(actionReleaseTimeout)
    actionReleaseTimeout = null
  }
}

function setActiveAction(action) {
  activeActionId.value = action
  clearActionReleaseTimeout()
}

function clearActiveAction(action = null, delayMs = 0) {
  clearActionReleaseTimeout()

  const release = () => {
    if (!action || activeActionId.value === action) {
      activeActionId.value = null
    }
  }

  if (delayMs > 0) {
    actionReleaseTimeout = window.setTimeout(() => {
      release()
      actionReleaseTimeout = null
    }, delayMs)
    return
  }

  release()
}

function getJoystickCenter() {
  if (!joystick.value) {
    return null
  }

  const rect = joystick.value.getBoundingClientRect()

  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top + rect.height * 0.5,
    maxDistance: Math.min(rect.width, rect.height) * 0.34,
  }
}

function updateJoystickFromTouch(touch) {
  const center = getJoystickCenter()

  if (!center) {
    return
  }

  const deltaX = touch.clientX - center.x
  const deltaY = touch.clientY - center.y
  const distance = Math.min(center.maxDistance, Math.hypot(deltaX, deltaY))
  const angle = Math.atan2(deltaY, deltaX)
  const offsetX = Math.cos(angle) * distance
  const offsetY = Math.sin(angle) * distance
  const intensity = center.maxDistance > 0 ? distance / center.maxDistance : 0

  thumbPosition.value = {
    x: offsetX,
    y: offsetY,
  }

  setMobileJoystick({
    x: center.maxDistance > 0 ? offsetX / center.maxDistance : 0,
    y: center.maxDistance > 0 ? offsetY / center.maxDistance : 0,
    intensity,
  })
}

function resetJoystick() {
  activeTouchId.value = null
  thumbPosition.value = {
    x: 0,
    y: 0,
  }
  releaseMobileJoystick()
}

function findTrackedTouch(event) {
  return Array.from(event.changedTouches).find((touch) => touch.identifier === activeTouchId.value) ?? null
}

function handleJoystickStart(event) {
  if (!props.visible || activeTouchId.value !== null) {
    return
  }

  const touch = event.changedTouches[0]

  if (!touch) {
    return
  }

  activeTouchId.value = touch.identifier
  updateJoystickFromTouch(touch)
}

function handleJoystickMove(event) {
  if (!props.visible || activeTouchId.value === null) {
    return
  }

  const touch = findTrackedTouch(event)

  if (!touch) {
    return
  }

  updateJoystickFromTouch(touch)
}

function handleJoystickEnd(event) {
  if (activeTouchId.value === null) {
    return
  }

  const touch = findTrackedTouch(event)

  if (!touch) {
    return
  }

  resetJoystick()
}

function triggerAction(action) {
  if (!props.visible) {
    return
  }

  triggerMobileAction(action)
}

function handleActionTouchStart(action) {
  setActiveAction(action)
  triggerAction(action)
}

function handleActionTouchEnd(action) {
  clearActiveAction(action, 240)
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetJoystick()
      clearActiveAction()
    }
  },
)

onBeforeUnmount(() => {
  resetJoystick()
  clearActiveAction()
})
</script>

<style scoped>
.mobile-controls {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 34;
}

.mobile-controls__status {
  position: absolute;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
  transform: translateX(-50%);
  padding: 0.55rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(7, 10, 14, 0.56);
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  opacity: 0.18;
  transition:
    opacity 240ms ease,
    background-color 240ms ease,
    box-shadow 240ms ease,
    backdrop-filter 240ms ease;
}

.mobile-controls__joystick {
  pointer-events: auto;
  position: absolute;
  left: max(1rem, env(safe-area-inset-left, 0px));
  bottom: calc(env(safe-area-inset-bottom, 0px) + 1.6rem);
  width: clamp(8.8rem, 24vw, 9.75rem);
  height: clamp(8.8rem, 24vw, 9.75rem);
  display: grid;
  place-items: center;
  touch-action: none;
}

.mobile-controls__joystick-base,
.mobile-controls__joystick-thumb {
  border-radius: 50%;
  opacity: 0.18;
  backdrop-filter: blur(4px);
  transition:
    opacity 240ms ease,
    transform 240ms ease,
    box-shadow 240ms ease,
    background-color 240ms ease,
    backdrop-filter 240ms ease;
}

.mobile-controls__joystick-base {
  width: 86%;
  height: 86%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 19, 32, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.mobile-controls__joystick-thumb {
  position: absolute;
  width: clamp(3.45rem, 10vw, 4rem);
  height: clamp(3.45rem, 10vw, 4rem);
  border: 1px solid rgba(148, 197, 255, 0.32);
  background: radial-gradient(circle at 30% 30%, rgba(148, 197, 255, 0.18), rgba(10, 19, 32, 0.38));
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
}

.mobile-controls__joystick--active .mobile-controls__joystick-base {
  opacity: 0.76;
  background: rgba(10, 19, 32, 0.7);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 12px 28px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(14px);
}

.mobile-controls__joystick--active .mobile-controls__joystick-thumb {
  opacity: 0.94;
  background: radial-gradient(circle at 30% 30%, rgba(148, 197, 255, 0.36), rgba(10, 19, 32, 0.92));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(14px);
}

.mobile-controls__actions {
  pointer-events: auto;
  position: absolute;
  right: max(1rem, env(safe-area-inset-right, 0px));
  bottom: calc(env(safe-area-inset-bottom, 0px) + 1.75rem);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.mobile-controls__action {
  min-width: 7rem;
  padding: 1rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.92), rgba(30, 64, 175, 0.9));
  color: #eff6ff;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.34);
  touch-action: manipulation;
  opacity: 0.2;
  backdrop-filter: blur(0px);
  transition:
    opacity 240ms ease,
    box-shadow 240ms ease,
    transform 240ms ease,
    backdrop-filter 240ms ease,
    background 240ms ease;
}

.mobile-controls__action--secondary {
  background: linear-gradient(180deg, rgba(126, 34, 206, 0.9), rgba(91, 33, 182, 0.88));
}

.mobile-controls__action--active {
  opacity: 0.94;
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(14px);
}

.mobile-controls--engaged .mobile-controls__status {
  opacity: 0.72;
  background: rgba(7, 10, 14, 0.68);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

@media (max-width: 720px) {
  .mobile-controls__joystick {
    width: 8.7rem;
    height: 8.7rem;
  }

  .mobile-controls__joystick-thumb {
    width: 3.45rem;
    height: 3.45rem;
  }

  .mobile-controls__action {
    min-width: 6.4rem;
    padding: 0.92rem 1rem;
    font-size: 0.8rem;
  }

  .mobile-controls__status {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.6rem);
    font-size: 0.68rem;
  }
}
</style>
