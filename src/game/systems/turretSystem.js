import Phaser from 'phaser'

import { createFloatingCombatText } from './effectsSystem'

const TURRET_FIRE_INTERVAL_MS = 600
const TURRET_RANGE = 280
const TURRET_DAMAGE = 1

function drawTurret(gfx, x, y, angle) {
  gfx.clear()

  // Shadow base
  gfx.fillStyle(0x000000, 0.22)
  gfx.fillEllipse(x, y + 8, 38, 14)

  // Base plate
  gfx.fillStyle(0x475569, 1)
  gfx.fillCircle(x, y, 14)
  gfx.lineStyle(2, 0x94a3b8, 0.9)
  gfx.strokeCircle(x, y, 14)

  // Barrel
  const barrelLen = 20
  const bx = Math.cos(angle) * barrelLen
  const by = Math.sin(angle) * barrelLen
  gfx.lineStyle(5, 0x86efac, 0.95)
  gfx.beginPath()
  gfx.moveTo(x, y)
  gfx.lineTo(x + bx, y + by)
  gfx.strokePath()

  gfx.lineStyle(2.5, 0xbbf7d0, 0.7)
  gfx.beginPath()
  gfx.moveTo(x, y)
  gfx.lineTo(x + bx, y + by)
  gfx.strokePath()
}

export function createTurretDirector(scene, config) {
  const { zombies, combat } = config
  const turrets = []

  function spawnTurret(x, y, durationMs = 8000) {
    // Limit 1 active turret at a time
    if (turrets.length >= 1) {
      const oldest = turrets.shift()
      oldest._destroy()
    }

    const gfx = scene.add.graphics()
    gfx.setDepth(22)
    let angle = -Math.PI / 2
    let nextFireAt = scene.time.now + 800
    let alive = true

    function findTarget() {
      let nearest = null
      let nearestDist = Infinity

      zombies.getChildren().forEach((zombie) => {
        if (!zombie?.active || zombie.isDead) return
        const dist = Phaser.Math.Distance.Between(x, y, zombie.x, zombie.y)
        if (dist < TURRET_RANGE && dist < nearestDist) {
          nearestDist = dist
          nearest = zombie
        }
      })

      return nearest
    }

    function fire(target) {
      if (!alive) return

      // Muzzle flash line
      const flashLen = 18
      const flashGfx = scene.add.graphics()
      flashGfx.lineStyle(3, 0xfef08a, 0.9)
      flashGfx.beginPath()
      flashGfx.moveTo(
        x + Math.cos(angle) * 14,
        y + Math.sin(angle) * 14,
      )
      flashGfx.lineTo(
        x + Math.cos(angle) * (14 + flashLen),
        y + Math.sin(angle) * (14 + flashLen),
      )
      flashGfx.strokePath()
      flashGfx.setDepth(34)
      scene.tweens.add({
        targets: flashGfx,
        alpha: 0,
        duration: 80,
        onComplete: () => flashGfx.destroy(),
      })

      combat?.damageZombie(target, TURRET_DAMAGE, {
        source: 'turret',
        impactPoint: { x: target.x, y: target.y - 8 },
      })
    }

    function update(time) {
      if (!alive) return

      const target = findTarget()

      if (target) {
        angle = Phaser.Math.Angle.Between(x, y, target.x, target.y)
      }

      drawTurret(gfx, x, y, angle)

      if (target && time >= nextFireAt) {
        nextFireAt = time + TURRET_FIRE_INTERVAL_MS
        fire(target)
      }
    }

    function destroy() {
      alive = false
      scene.tweens.add({
        targets: gfx,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 280,
        ease: 'Quad.easeIn',
        onComplete: () => gfx.destroy(),
      })
    }

    // Spawn-in animation: scale from 0
    gfx.setScale(0).setAlpha(0.2)
    scene.tweens.add({
      targets: gfx,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 260,
      ease: 'Back.easeOut',
    })

    createFloatingCombatText(scene, x, y - 32, 'TURRET DEPLOYED', {
      color: '#86efac',
      shadowColor: '#14532d',
      fontSize: '16px',
      duration: 900,
      rise: 28,
      depth: 38,
    })

    const expireEvent = scene.time.delayedCall(durationMs, destroy)

    const turret = { update, _destroy: destroy, _expireEvent: expireEvent }
    turrets.push(turret)

    return turret
  }

  function update(time) {
    for (let i = turrets.length - 1; i >= 0; i--) {
      const turret = turrets[i]
      if (!turret) {
        turrets.splice(i, 1)
        continue
      }

      turret.update(time)
    }
  }

  function clear() {
    turrets.forEach((t) => t._destroy())
    turrets.length = 0
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, clear)

  return { spawnTurret, update, clear }
}
