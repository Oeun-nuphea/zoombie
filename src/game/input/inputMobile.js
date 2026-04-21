import Phaser from 'phaser'

import { getGameRuntimeProfile } from '../../utils/device'

const MOBILE_INPUT_STORE_KEY = '__zoombieMobileInputStore__'
const MOBILE_AIM_FALLBACK_DISTANCE = 280
const MOBILE_ACTIONS = ['dash', 'shield']

function createMobileInputStore() {
  return {
    joystick: {
      x: 0,
      y: 0,
      intensity: 0,
    },
    actions: {
      dash: false,
      shield: false,
    },
  }
}

function getMobileInputStore() {
  if (!globalThis[MOBILE_INPUT_STORE_KEY]) {
    globalThis[MOBILE_INPUT_STORE_KEY] = createMobileInputStore()
  }

  return globalThis[MOBILE_INPUT_STORE_KEY]
}

function resetActions(store) {
  MOBILE_ACTIONS.forEach((action) => {
    store.actions[action] = false
  })
}

export function setMobileJoystick(vector = {}) {
  const store = getMobileInputStore()
  const x = Phaser.Math.Clamp(Number(vector.x) || 0, -1, 1)
  const y = Phaser.Math.Clamp(Number(vector.y) || 0, -1, 1)
  const intensity = Phaser.Math.Clamp(Number(vector.intensity) || Math.max(Math.abs(x), Math.abs(y)), 0, 1)

  store.joystick.x = x
  store.joystick.y = y
  store.joystick.intensity = intensity
}

export function releaseMobileJoystick() {
  setMobileJoystick({
    x: 0,
    y: 0,
    intensity: 0,
  })
}

export function triggerMobileAction(action) {
  const store = getMobileInputStore()

  if (!Object.hasOwn(store.actions, action)) {
    return false
  }

  store.actions[action] = true
  return true
}

export function consumeMobileAction(action) {
  const store = getMobileInputStore()

  if (!Object.hasOwn(store.actions, action)) {
    return false
  }

  const value = Boolean(store.actions[action])
  store.actions[action] = false
  return value
}

export function resetMobileInput() {
  const store = getMobileInputStore()
  releaseMobileJoystick()
  resetActions(store)
}

export function createMobileInput(scene, config = {}) {
  const { player, zombies } = config
  const runtimeProfile = getGameRuntimeProfile()
  const virtualPointer = {
    worldX: player?.x ?? 0,
    worldY: player?.y ?? 0,
    isDown: false,
  }

  let cachedTarget = null
  let nextTargetScanAt = 0

  function isValidTarget(target) {
    return Boolean(target?.active) && !target.isDead
  }

  function scoreTarget(target) {
    const distanceSq = Phaser.Math.Distance.Squared(player.x, player.y, target.x, target.y)

    if (target.isBoss) {
      return distanceSq * 0.72
    }

    if (target.typeId === 'z1') {
      return distanceSq * 0.84
    }

    return distanceSq
  }

  function findAutoAimTarget(time) {
    if (isValidTarget(cachedTarget) && time < nextTargetScanAt) {
      return cachedTarget
    }

    let closestTarget = null
    let closestScore = Number.POSITIVE_INFINITY

    zombies?.getChildren?.().forEach((zombie) => {
      if (!isValidTarget(zombie)) {
        return
      }

      const score = scoreTarget(zombie)

      if (score < closestScore) {
        closestTarget = zombie
        closestScore = score
      }
    })

    cachedTarget = closestTarget
    nextTargetScanAt = time + (runtimeProfile.performance.autoAimIntervalMs ?? 96)

    return cachedTarget
  }

  function getMoveVector() {
    const { joystick } = getMobileInputStore()
    const vector = new Phaser.Math.Vector2(joystick.x, joystick.y)

    if (vector.lengthSq() > 0) {
      vector.normalize().scale((player?.getMoveSpeed?.() ?? 0) * Math.max(0.42, joystick.intensity || 1))
    }

    return vector
  }

  function updateVirtualPointer(target) {
    if (target) {
      const hitPoint = target.getHeadHitCircle?.() ?? {
        x: target.x,
        y: target.y - target.displayHeight * 0.2,
      }

      virtualPointer.worldX = hitPoint.x
      virtualPointer.worldY = hitPoint.y
      virtualPointer.isDown = true
      return
    }

    const center = player?.getPlayerCenter?.() ?? {
      x: player.x,
      y: player.y,
    }
    const aimAngle = player?.lastAimAngle ?? 0

    virtualPointer.worldX = center.x + Math.cos(aimAngle) * MOBILE_AIM_FALLBACK_DISTANCE
    virtualPointer.worldY = center.y + Math.sin(aimAngle) * MOBILE_AIM_FALLBACK_DISTANCE
    virtualPointer.isDown = false
  }

  function read(time = scene.time.now, delta = scene.game.loop.delta) {
    const moveVector = getMoveVector()
    const target = findAutoAimTarget(time)

    updateVirtualPointer(target)

    return {
      time,
      delta,
      moveVector,
      pointer: virtualPointer,
      shouldShoot: Boolean(target),
      actions: {
        dash: consumeMobileAction('dash'),
        shield: consumeMobileAction('shield'),
      },
    }
  }

  return {
    mode: 'mobile',
    read,
    destroy() {
      resetMobileInput()
    },
  }
}
