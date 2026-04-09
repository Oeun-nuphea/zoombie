import Phaser from 'phaser'

import { createGrenadeExplosion, createImpactBurst } from './effectsSystem'

export function createAbilitySystem(scene, config) {
  const { player, gameStore, hud, soundManager } = config
  const keyboard = scene.input.keyboard
  const dashKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null
  const shieldKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Q) ?? null
  const grenadeKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E) ?? null
  const shieldRing = scene.add.circle(player.x, player.y + 4, 44, 0x93c5fd, 0)

  shieldRing.setDepth(24).setStrokeStyle(3, 0xe0f2fe, 0).setVisible(false)
  shieldRing.setBlendMode(Phaser.BlendModes.ADD)

  let dashLastUsedAt = -Infinity
  let shieldLastUsedAt = -Infinity
  let shieldActiveUntil = 0
  let grenadeLastUsedAt = -Infinity

  function getStats() {
    return gameStore.playerCombatStats
  }

  function getDashDirection(moveVector, pointer) {
    if (moveVector?.lengthSq() > 0) {
      return moveVector.clone().normalize()
    }

    if (pointer) {
      const center = player.getPlayerCenter?.() ?? {
        x: player.x,
        y: player.y,
      }
      const pointerDirection = new Phaser.Math.Vector2(pointer.worldX - center.x, pointer.worldY - center.y)

      if (pointerDirection.lengthSq() > 0) {
        return pointerDirection.normalize()
      }
    }

    return new Phaser.Math.Vector2(Math.cos(player.lastAimAngle ?? 0), Math.sin(player.lastAimAngle ?? 0))
  }

  function activateDash(time, moveVector, pointer) {
    const stats = getStats()
    const dashSpeed = Math.max(
      stats.dashSpeed ?? 0,
      stats.dashDistance && stats.dashDurationMs
        ? stats.dashDistance / (Math.max(40, stats.dashDurationMs) / 1000)
        : 0,
    )

    if (!stats.dashDistance || dashSpeed <= 0) {
      return false
    }

    if (time < dashLastUsedAt + stats.dashCooldownMs) {
      return false
    }

    const direction = getDashDirection(moveVector, pointer)

    if (direction.lengthSq() <= 0.0001) {
      return false
    }

    dashLastUsedAt = time
    player.applyImpulse(direction.x * dashSpeed, direction.y * dashSpeed, {
      replace: true,
      clearMoveVelocity: true,
    })
    player.grantDamageImmunity(stats.dashInvulnerabilityMs ?? stats.dashDurationMs)

    createImpactBurst(scene, player.x, player.y + 10, {
      color: 0x93c5fd,
      radius: 18,
      endRadius: 72,
      alpha: 0.22,
      particleCount: 10,
      duration: 180,
      depth: 30,
    })
    hud?.flashBanner('DASH', '#93c5fd')
    soundManager?.play('pickup', {
      volume: 0.92,
      rate: 1.08,
    })

    return true
  }

  function activateShield(time) {
    const stats = getStats()

    if (!stats.shieldDurationMs) {
      return false
    }

    if (time < shieldLastUsedAt + stats.shieldCooldownMs) {
      return false
    }

    shieldLastUsedAt = time
    shieldActiveUntil = time + stats.shieldDurationMs
    player.grantDamageImmunity(stats.shieldDurationMs)
    shieldRing.setVisible(true).setAlpha(0.28).setRadius(44).setStrokeStyle(3, 0xe0f2fe, 0.82)

    scene.tweens.killTweensOf(shieldRing)
    scene.tweens.add({
      targets: shieldRing,
      radius: 62,
      alpha: 0.18,
      duration: 240,
      ease: 'Sine.easeOut',
    })

    hud?.flashBanner('SHIELD UP', '#d8b4fe')
    soundManager?.play('heal', {
      volume: 0.9,
      rate: 1.08,
    })

    return true
  }

  function handleInput(context = {}) {
    const {
      time = scene.time.now,
      moveVector = null,
      pointer = null,
      actions = {},
    } = context

    if ((dashKey && Phaser.Input.Keyboard.JustDown(dashKey)) || actions.dash) {
      activateDash(time, moveVector, pointer)
    }

    if ((shieldKey && Phaser.Input.Keyboard.JustDown(shieldKey)) || actions.shield) {
      activateShield(time)
    }

    if ((grenadeKey && Phaser.Input.Keyboard.JustDown(grenadeKey)) || actions.grenade) {
      activateGrenade(time, pointer)
    }
  }

  function activateGrenade(time, pointer) {
    const stats = getStats()
    const cooldown = stats.grenadeCooldownMs ?? 0
    const radius = stats.grenadeRadius ?? 0
    const damage = stats.grenadeDamage ?? 0
    const maxTargets = stats.grenadeMaxTargets ?? 6

    if (radius <= 0 || damage <= 0) {
      return false
    }

    if (time < grenadeLastUsedAt + cooldown) {
      return false
    }

    const center = player.getPlayerCenter?.() ?? { x: player.x, y: player.y }
    let targetX = center.x
    let targetY = center.y

    if (pointer) {
      const dx = pointer.worldX - center.x
      const dy = pointer.worldY - center.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const clampedDist = Phaser.Math.Clamp(dist, 60, 420)
      const norm = dist > 1 ? clampedDist / dist : 1
      targetX = center.x + dx * norm
      targetY = center.y + dy * norm
    }

    grenadeLastUsedAt = time

    // Grenade projectile sprite (circle as stand-in)
    const grenade = scene.add.circle(center.x, center.y - 4, 7, 0xfbbf24, 0.95)
    grenade.setDepth(26).setStrokeStyle(2, 0xfef9c3, 0.9)

    // Arc duration ~450ms
    const travelMs = 450
    scene.tweens.add({
      targets: grenade,
      x: targetX,
      y: targetY - 18,          // high arc
      duration: travelMs * 0.5,
      ease: 'Sine.easeOut',
      yoyo: false,
      onComplete: () => {
        // Fall to ground
        scene.tweens.add({
          targets: grenade,
          y: targetY,
          duration: travelMs * 0.5,
          ease: 'Sine.easeIn',
          onComplete: () => {
            grenade.destroy()
            // Explosion visual
            createGrenadeExplosion(scene, targetX, targetY, radius)
            scene.cameras.main.shake(180, 0.0035)
            soundManager?.play('shoot', { volume: 1.3, rate: 0.32 })
            hud?.flashBanner('GRENADE', '#fbbf24')
            // Damage enemies
            scene.combat?.damageEnemiesInRadius(
              { x: targetX, y: targetY },
              radius,
              {
                damage,
                maxTargets,
                source: 'grenade',
                cameraShakeDuration: 0,
              },
            )
          },
        })
      },
    })

    return true
  }

  function update(time = scene.time.now) {
    const stats = getStats()
    const shieldAvailable = Number.isFinite(stats.shieldDurationMs) && stats.shieldDurationMs > 0
    const shieldActive = shieldAvailable && time < shieldActiveUntil

    shieldRing.setPosition(player.x, player.y + 4)

    if (!shieldAvailable) {
      shieldRing.setVisible(false).setAlpha(0)
      shieldActiveUntil = 0
      return
    }

    if (!shieldActive) {
      shieldRing.setVisible(false).setAlpha(0).setStrokeStyle(3, 0xe0f2fe, 0)
      return
    }

    shieldRing
      .setVisible(true)
      .setStrokeStyle(3, 0xe0f2fe, 0.72)
      .setAlpha(0.14 + Math.sin(time * 0.02) * 0.05)
      .setRadius(52 + Math.sin(time * 0.018) * 4)
  }

  function destroy() {
    shieldRing.destroy()
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy)

  return {
    activateDash,
    activateShield,
    activateGrenade,
    handleInput,
    update,
    getCooldownState(time = scene.time.now) {
      const stats = getStats()

      return {
        dashReady: Boolean(stats.dashDistance) && time >= dashLastUsedAt + stats.dashCooldownMs,
        shieldReady: Boolean(stats.shieldDurationMs) && time >= shieldLastUsedAt + stats.shieldCooldownMs,
        shieldActive: time < shieldActiveUntil,
        grenadeReady: Boolean(stats.grenadeRadius) && time >= grenadeLastUsedAt + (stats.grenadeCooldownMs ?? 0),
      }
    },
  }
}
