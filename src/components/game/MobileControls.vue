<template>
  <div
    v-if="visible"
    :class="['mobile-controls', { 'mobile-controls--engaged': isControlsActive }]"
  >
    <!-- Left joystick: Movement -->
    <div
      ref="moveStick"
      :class="['mc-stick mc-stick--left', { 'mc-stick--active': isMoveActive }]"
      @touchstart.prevent="handleMoveStart"
      @touchmove.prevent="handleMoveMove"
      @touchend.prevent="handleMoveEnd"
      @touchcancel.prevent="handleMoveEnd"
    >
      <div class="mc-stick__base">
        <div class="mc-stick__ring" />
      </div>
      <div
        class="mc-stick__thumb"
        :style="moveThumbStyle"
      />
    </div>

    <!-- Right joystick: Aim + Fire -->
    <div
      ref="aimStick"
      :class="['mc-stick mc-stick--right', { 'mc-stick--active': isAimActive, 'mc-stick--firing': isAimActive }]"
      @touchstart.prevent="handleAimStart"
      @touchmove.prevent="handleAimMove"
      @touchend.prevent="handleAimEnd"
      @touchcancel.prevent="handleAimEnd"
    >
      <div class="mc-stick__base">
        <div class="mc-stick__ring mc-stick__ring--aim" />
        <div class="mc-stick__crosshair" />
      </div>
      <div
        class="mc-stick__thumb mc-stick__thumb--aim"
        :style="aimThumbStyle"
      />
    </div>

    <!-- Actions (dash, shield) — compact icon buttons -->
    <div class="mc-actions">
      <button
        v-if="canDash"
        :class="['mc-action', { 'mc-action--active': activeActionId === 'dash' }]"
        type="button"
        @touchstart.prevent="handleActionTouchStart('dash')"
        @touchend.prevent="handleActionTouchEnd('dash')"
        @touchcancel.prevent="handleActionTouchEnd('dash')"
        @click.prevent="triggerAction('dash')"
      >
        ⚡
      </button>
      <button
        v-if="canShield"
        :class="['mc-action mc-action--secondary', { 'mc-action--active': activeActionId === 'shield' }]"
        type="button"
        @touchstart.prevent="handleActionTouchStart('shield')"
        @touchend.prevent="handleActionTouchEnd('shield')"
        @touchcancel.prevent="handleActionTouchEnd('shield')"
        @click.prevent="triggerAction('shield')"
      >
        🛡
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import {
  releaseMobileAimStick,
  releaseMobileJoystick,
  setMobileAimStick,
  setMobileJoystick,
  triggerMobileAction,
} from '../../game/input/inputMobile'

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

// ── Refs ──────────────────────────────────────────────────────────────────
const moveStick = ref(null)
const aimStick = ref(null)
const moveTouchId = ref(null)
const aimTouchId = ref(null)
const activeActionId = ref(null)
const moveThumbPos = ref({ x: 0, y: 0 })
const aimThumbPos = ref({ x: 0, y: 0 })

// ── Computed ──────────────────────────────────────────────────────────────
const canDash = computed(() => (props.gameStore?.playerCombatStats?.dashDistance ?? 0) > 0)
const canShield = computed(() => (props.gameStore?.playerCombatStats?.shieldDurationMs ?? 0) > 0)
const isMoveActive = computed(() => moveTouchId.value !== null)
const isAimActive = computed(() => aimTouchId.value !== null)
const isControlsActive = computed(() => isMoveActive.value || isAimActive.value || activeActionId.value !== null)

const moveThumbStyle = computed(() => ({
  transform: `translate(${moveThumbPos.value.x}px, ${moveThumbPos.value.y}px) scale(${isMoveActive.value ? 1.06 : 1})`,
}))

const aimThumbStyle = computed(() => ({
  transform: `translate(${aimThumbPos.value.x}px, ${aimThumbPos.value.y}px) scale(${isAimActive.value ? 1.06 : 1})`,
}))

let actionReleaseTimeout = null

// ── Helpers ───────────────────────────────────────────────────────────────
function getStickCenter(el) {
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top + rect.height * 0.5,
    maxDistance: Math.min(rect.width, rect.height) * 0.34,
  }
}

function calcStickVector(touch, center) {
  const dx = touch.clientX - center.x
  const dy = touch.clientY - center.y
  const distance = Math.min(center.maxDistance, Math.hypot(dx, dy))
  const angle = Math.atan2(dy, dx)
  const ox = Math.cos(angle) * distance
  const oy = Math.sin(angle) * distance
  const intensity = center.maxDistance > 0 ? distance / center.maxDistance : 0
  return {
    x: center.maxDistance > 0 ? ox / center.maxDistance : 0,
    y: center.maxDistance > 0 ? oy / center.maxDistance : 0,
    ox, oy, intensity,
  }
}

function findTouch(event, touchId) {
  return Array.from(event.changedTouches).find(t => t.identifier === touchId) ?? null
}

// ── Move stick ────────────────────────────────────────────────────────────
function handleMoveStart(event) {
  if (!props.visible || moveTouchId.value !== null) return
  const touch = event.changedTouches[0]
  if (!touch) return
  moveTouchId.value = touch.identifier
  updateMoveFromTouch(touch)
}

function handleMoveMove(event) {
  if (moveTouchId.value === null) return
  const touch = findTouch(event, moveTouchId.value)
  if (touch) updateMoveFromTouch(touch)
}

function handleMoveEnd(event) {
  if (moveTouchId.value === null) return
  const touch = findTouch(event, moveTouchId.value)
  if (touch) resetMove()
}

function updateMoveFromTouch(touch) {
  const center = getStickCenter(moveStick.value)
  if (!center) return
  const v = calcStickVector(touch, center)
  moveThumbPos.value = { x: v.ox, y: v.oy }
  setMobileJoystick({ x: v.x, y: v.y, intensity: v.intensity })
}

function resetMove() {
  moveTouchId.value = null
  moveThumbPos.value = { x: 0, y: 0 }
  releaseMobileJoystick()
}

// ── Aim stick ─────────────────────────────────────────────────────────────
function handleAimStart(event) {
  if (!props.visible || aimTouchId.value !== null) return
  const touch = event.changedTouches[0]
  if (!touch) return
  aimTouchId.value = touch.identifier
  updateAimFromTouch(touch)
}

function handleAimMove(event) {
  if (aimTouchId.value === null) return
  const touch = findTouch(event, aimTouchId.value)
  if (touch) updateAimFromTouch(touch)
}

function handleAimEnd(event) {
  if (aimTouchId.value === null) return
  const touch = findTouch(event, aimTouchId.value)
  if (touch) resetAim()
}

function updateAimFromTouch(touch) {
  const center = getStickCenter(aimStick.value)
  if (!center) return
  const v = calcStickVector(touch, center)
  aimThumbPos.value = { x: v.ox, y: v.oy }
  setMobileAimStick({ x: v.x, y: v.y, intensity: v.intensity })
}

function resetAim() {
  aimTouchId.value = null
  aimThumbPos.value = { x: 0, y: 0 }
  releaseMobileAimStick()
}

// ── Actions ───────────────────────────────────────────────────────────────
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

function triggerAction(action) {
  if (!props.visible) return
  triggerMobileAction(action)
}

function handleActionTouchStart(action) {
  setActiveAction(action)
  triggerAction(action)
}

function handleActionTouchEnd(action) {
  clearActiveAction(action, 240)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetMove()
      resetAim()
      clearActiveAction()
    }
  },
)

onBeforeUnmount(() => {
  resetMove()
  resetAim()
  clearActiveAction()
})
</script>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────────── */
.mobile-controls {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 34;
}

/* ── Sticks (shared) ───────────────────────────────────────────────────── */
.mc-stick {
  pointer-events: auto;
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 1.4rem);
  width: clamp(9rem, 25vw, 10rem);
  height: clamp(9rem, 25vw, 10rem);
  display: grid;
  place-items: center;
  touch-action: none;
}

.mc-stick--left {
  left: max(0.8rem, env(safe-area-inset-left, 0px));
}

.mc-stick--right {
  right: max(0.8rem, env(safe-area-inset-right, 0px));
}

/* ── Base ring ─────────────────────────────────────────────────────────── */
.mc-stick__base {
  position: relative;
  width: 88%;
  height: 88%;
  display: grid;
  place-items: center;
}

.mc-stick__ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 16, 28, 0.15);
  opacity: 0.2;
  transition: opacity 200ms ease, border-color 200ms ease, background 200ms ease;
}

.mc-stick--active .mc-stick__ring {
  opacity: 0.7;
  border-color: rgba(148, 197, 255, 0.2);
  background: rgba(10, 16, 28, 0.55);
}

/* Aim ring red tint when firing */
.mc-stick--firing .mc-stick__ring--aim {
  border-color: rgba(251, 146, 60, 0.3);
}

/* Crosshair for aim stick */
.mc-stick__crosshair {
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0.12;
  transition: opacity 200ms ease;
}

.mc-stick__crosshair::before,
.mc-stick__crosshair::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;
}

.mc-stick__crosshair::before {
  width: 2px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.mc-stick__crosshair::after {
  height: 2px;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.mc-stick--active .mc-stick__crosshair {
  opacity: 0.45;
}

/* ── Thumb ─────────────────────────────────────────────────────────────── */
.mc-stick__thumb {
  position: absolute;
  width: clamp(3.4rem, 10vw, 3.8rem);
  height: clamp(3.4rem, 10vw, 3.8rem);
  border-radius: 50%;
  border: 1.5px solid rgba(148, 197, 255, 0.22);
  background: radial-gradient(circle at 35% 35%, rgba(148, 197, 255, 0.12), rgba(10, 16, 28, 0.3));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  opacity: 0.2;
  transition: opacity 200ms ease, background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  /* transform is set via style binding */
}

.mc-stick--active .mc-stick__thumb {
  opacity: 0.9;
  background: radial-gradient(circle at 35% 35%, rgba(148, 197, 255, 0.28), rgba(10, 16, 28, 0.75));
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}

/* Aim thumb: orange tint when active */
.mc-stick--firing .mc-stick__thumb--aim {
  border-color: rgba(251, 146, 60, 0.45);
  background: radial-gradient(circle at 35% 35%, rgba(251, 146, 60, 0.2), rgba(20, 12, 6, 0.75));
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.25),
    0 0 16px rgba(251, 146, 60, 0.12);
}

/* ── Action buttons ────────────────────────────────────────────────────── */
.mc-actions {
  pointer-events: auto;
  position: absolute;
  right: max(0.8rem, env(safe-area-inset-right, 0px));
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.mc-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(37, 99, 235, 0.75);
  color: #eff6ff;
  font-size: 1.15rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.25);
  touch-action: manipulation;
  opacity: 0.22;
  transition: opacity 200ms ease, transform 150ms ease, box-shadow 200ms ease;
  cursor: pointer;
}

.mc-action--secondary {
  background: rgba(126, 34, 206, 0.75);
}

.mc-action--active {
  opacity: 0.92;
  transform: scale(0.94);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.35);
}

/* ── Engaged state — boost opacity of all controls ─────────────────────── */
.mobile-controls--engaged .mc-action {
  opacity: 0.55;
}

/* ── Responsive ────────────────────────────────────────────────────────── */
@media (max-width: 720px) {
  .mc-stick {
    width: 8.5rem;
    height: 8.5rem;
  }

  .mc-stick__thumb {
    width: 3.2rem;
    height: 3.2rem;
  }

  .mc-action {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1rem;
  }

  .mc-actions {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 11rem);
  }
}

@media (max-height: 420px) {
  .mc-stick {
    width: 7.5rem;
    height: 7.5rem;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
  }

  .mc-actions {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 9rem);
  }
}
</style>
