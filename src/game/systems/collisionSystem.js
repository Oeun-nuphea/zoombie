import Phaser from 'phaser'

import { HEADSHOT_CONFIG } from '../config/gameplayConfig'

function isHitDebugEnabled() {
  if (typeof window === 'undefined') {
    return HEADSHOT_CONFIG.debugHitboxes
  }

  return HEADSHOT_CONFIG.debugHitboxes || new URLSearchParams(window.location.search).get('debugHit') === '1'
}

function getBulletSegment(bullet) {
  const body = bullet.body
  const halfWidth = body.width * 0.5
  const halfHeight = body.height * 0.5

  return {
    x1: body.prev.x + halfWidth,
    y1: body.prev.y + halfHeight,
    x2: body.x + halfWidth,
    y2: body.y + halfHeight,
  }
}

function getSegmentCircleContact(segment, circle) {
  const dx = segment.x2 - segment.x1
  const dy = segment.y2 - segment.y1
  const lengthSq = dx * dx + dy * dy

  if (lengthSq <= 0.0001) {
    const offsetX = segment.x1 - circle.x
    const offsetY = segment.y1 - circle.y

    if (offsetX * offsetX + offsetY * offsetY > circle.radius * circle.radius) {
      return null
    }

    return {
      x: segment.x1,
      y: segment.y1,
    }
  }

  const projected = ((circle.x - segment.x1) * dx + (circle.y - segment.y1) * dy) / lengthSq
  const t = Phaser.Math.Clamp(projected, 0, 1)
  const closestX = segment.x1 + dx * t
  const closestY = segment.y1 + dy * t
  const offsetX = closestX - circle.x
  const offsetY = closestY - circle.y

  if (offsetX * offsetX + offsetY * offsetY > circle.radius * circle.radius) {
    return null
  }

  return {
    x: closestX,
    y: closestY,
  }
}

function getSegmentContactDistanceSq(segment, point) {
  return Phaser.Math.Distance.Squared(segment.x1, segment.y1, point.x, point.y)
}

function getClosestContact(segment, contacts) {
  let closestContact = null
  let closestDistanceSq = Number.POSITIVE_INFINITY

  for (const contact of contacts) {
    if (!contact) {
      continue
    }

    const distanceSq = getSegmentContactDistanceSq(segment, contact)

    if (distanceSq < closestDistanceSq) {
      closestDistanceSq = distanceSq
      closestContact = contact
    }
  }

  return closestContact
}

function getSegmentRectContact(segment, rect) {
  const dx = segment.x2 - segment.x1
  const dy = segment.y2 - segment.y1
  let entryTime = 0
  let exitTime = 1

  const axes = [
    {
      delta: dx,
      start: segment.x1,
      min: rect.left,
      max: rect.right,
    },
    {
      delta: dy,
      start: segment.y1,
      min: rect.top,
      max: rect.bottom,
    },
  ]

  for (const axis of axes) {
    if (Math.abs(axis.delta) <= 0.0001) {
      if (axis.start < axis.min || axis.start > axis.max) {
        return null
      }

      continue
    }

    const inverseDelta = 1 / axis.delta
    let axisEntry = (axis.min - axis.start) * inverseDelta
    let axisExit = (axis.max - axis.start) * inverseDelta

    if (axisEntry > axisExit) {
      [axisEntry, axisExit] = [axisExit, axisEntry]
    }

    entryTime = Math.max(entryTime, axisEntry)
    exitTime = Math.min(exitTime, axisExit)

    if (entryTime > exitTime) {
      return null
    }
  }

  return {
    x: segment.x1 + dx * entryTime,
    y: segment.y1 + dy * entryTime,
  }
}

function getSegmentCapsuleContact(segment, capsule) {
  if (!capsule) {
    return null
  }

  return getClosestContact(segment, [
    getSegmentCircleContact(segment, capsule.topCircle),
    getSegmentRectContact(segment, capsule.rect),
    getSegmentCircleContact(segment, capsule.bottomCircle),
  ])
}

function resolveZombieHit(segment, hitboxes) {
  if (!hitboxes?.hull || !getSegmentCircleContact(segment, hitboxes.hull)) {
    return null
  }

  const headContact = getSegmentCircleContact(segment, hitboxes.head)

  if (headContact) {
    return {
      zone: 'head',
      isHeadshot: true,
      impactPoint: headContact,
      hitCircle: hitboxes.head,
    }
  }

  const bodyContact = getSegmentCapsuleContact(segment, hitboxes.body)

  if (!bodyContact) {
    return null
  }

  return {
    zone: 'body',
    isHeadshot: false,
    impactPoint: bodyContact,
    hitCircle: hitboxes.body,
  }
}

function findRicochetTarget(bullet, sourceZombie, damageTargets, originPoint) {
  if (!bullet?.canRicochet?.()) {
    return null
  }

  let closestZombie = null
  let closestDistanceSq = bullet.ricochetRange * bullet.ricochetRange

  for (const target of damageTargets) {
    const { zombie } = target

    if (!zombie?.active || zombie.isDead || zombie === sourceZombie || bullet.hasHitTarget?.(zombie)) {
      continue
    }

    const distanceSq = Phaser.Math.Distance.Squared(originPoint.x, originPoint.y, zombie.x, zombie.y)

    if (distanceSq > closestDistanceSq) {
      continue
    }

    closestZombie = zombie
    closestDistanceSq = distanceSq
  }

  return closestZombie
}

export function registerGameCollisions(scene, config) {
  const { bullets, zombies, player, onPlayerHit, onZombieDamaged, onZombieKilled } = config
  const debugEnabled = isHitDebugEnabled()
  const debugGraphics = debugEnabled ? scene.add.graphics().setDepth(240) : null

  function resolveBulletHit(bullet, target, hitInfo, damageTargets) {
    const { zombie } = target

    if (!bullet.active || !zombie.active || zombie.isDead || !hitInfo) {
      return false
    }

    bullet.registerHitTarget?.(zombie)

    // Shield zombie deflects frontal bullets
    if (zombie.isBlockingShot?.(bullet.body.velocity.x, bullet.body.velocity.y)) {
      // Spark deflect effect
      const spark = scene.add.graphics()
      const sx = hitInfo.impactPoint?.x ?? zombie.x
      const sy = hitInfo.impactPoint?.y ?? zombie.y
      spark.setDepth(30)
      spark.lineStyle(4, 0x818cf8, 1)
      spark.strokeCircle(sx, sy, 8)
      scene.tweens.add({
        targets: spark,
        alpha: 0,
        scaleX: 3.5,
        scaleY: 3.5,
        duration: 180,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      })
      // Pass through the shield (bullet continues, but no damage)
      bullet.continuePast(hitInfo.impactPoint ?? { x: zombie.x, y: zombie.y })
      return true
    }

    const damageMultiplier = hitInfo.isHeadshot ? zombie.headshotMultiplier ?? HEADSHOT_CONFIG.damageMultiplier : 1
    const totalDamage = bullet.damage * damageMultiplier
    const hitResult = zombie.takeDamage(totalDamage, {
      hitZone: hitInfo.zone,
      isHeadshot: hitInfo.isHeadshot,
      impactPoint: hitInfo.impactPoint,
    })
    onZombieDamaged?.(zombie, bullet, {
      ...hitResult,
      baseDamage: bullet.damage,
      totalDamage,
      damageMultiplier,
      hitCircle: hitInfo.hitCircle,
      source: 'bullet',
    })

    if (hitResult.isDead) {
      zombie.die()
      onZombieKilled?.(zombie, {
        ...hitResult,
        baseDamage: bullet.damage,
        totalDamage,
        damageMultiplier,
        hitCircle: hitInfo.hitCircle,
        source: 'bullet',
        bullet,
      })
    }

    if (bullet.canPierce?.()) {
      bullet.consumePierce()
      bullet.continuePast(hitInfo.impactPoint ?? {
        x: zombie.x,
        y: zombie.y,
      })
      return true
    }

    const ricochetTarget = findRicochetTarget(
      bullet,
      zombie,
      damageTargets,
      hitInfo.impactPoint ?? {
        x: zombie.x,
        y: zombie.y,
      },
    )

    if (ricochetTarget && bullet.redirectTo?.(ricochetTarget, hitInfo.impactPoint)) {
      return true
    }

    bullet.disableBody(true, true)

    return true
  }

  function renderDebug(damageTargets, activeBullets) {
    if (!debugGraphics) {
      return
    }

    const pointer = scene.input.activePointer
    pointer.updateWorldPoint?.(scene.cameras.main)
    debugGraphics.clear()

    const muzzle = player.getMuzzlePosition(player.lastAimAngle)
    debugGraphics.lineStyle(2, 0x5cc8ff, 0.92)
    debugGraphics.strokeLineShape(new Phaser.Geom.Line(muzzle.x, muzzle.y, pointer.worldX, pointer.worldY))
    debugGraphics.fillStyle(0xffc857, 1)
    debugGraphics.fillCircle(muzzle.x, muzzle.y, 4)
    debugGraphics.fillStyle(0xff6b8a, 1)
    debugGraphics.fillCircle(pointer.worldX, pointer.worldY, 5)

    for (const target of damageTargets) {
      const { zombie, hitboxes } = target
      const physicsBounds = zombie.getPhysicsBounds?.()

      if (physicsBounds) {
        debugGraphics.lineStyle(1, 0x4ade80, 0.9)
        debugGraphics.strokeRect(physicsBounds.x, physicsBounds.y, physicsBounds.width, physicsBounds.height)
      }

      if (hitboxes?.body) {
        debugGraphics.lineStyle(2, 0x5eead4, 0.94)
        debugGraphics.strokeRect(
          hitboxes.body.rect.left,
          hitboxes.body.rect.top,
          hitboxes.body.rect.width,
          hitboxes.body.rect.height,
        )
        debugGraphics.strokeCircle(hitboxes.body.topCircle.x, hitboxes.body.topCircle.y, hitboxes.body.topCircle.radius)
        debugGraphics.strokeCircle(hitboxes.body.bottomCircle.x, hitboxes.body.bottomCircle.y, hitboxes.body.bottomCircle.radius)
      }

      if (hitboxes?.head) {
        debugGraphics.lineStyle(2, 0xf87171, 0.98)
        debugGraphics.strokeCircle(hitboxes.head.x, hitboxes.head.y, hitboxes.head.radius)
      }

      debugGraphics.lineStyle(1, 0xf97316, 0.55)
      debugGraphics.strokeCircle(zombie.x, zombie.y, zombie.attackRange ?? 0)
    }

    for (const bullet of activeBullets) {
      if (!bullet?.active) {
        continue
      }

      const segment = getBulletSegment(bullet)
      debugGraphics.lineStyle(2, 0xfacc15, 0.95)
      debugGraphics.strokeLineShape(new Phaser.Geom.Line(segment.x1, segment.y1, segment.x2, segment.y2))
    }
  }

  function update() {
    const time = scene.time.now
    const activeBullets = bullets.getChildren()
    const activeZombies = zombies.getChildren()
    const damageTargets = []

    for (const zombie of activeZombies) {
      if (!zombie?.active || zombie.isDead) {
        continue
      }

      damageTargets.push({
        zombie,
        hitboxes: zombie.getDamageHitboxes?.(),
      })
    }

    for (const bullet of activeBullets) {
      if (!bullet?.active) {
        continue
      }

      const segment = getBulletSegment(bullet)

      for (const target of damageTargets) {
        if (bullet.hasHitTarget?.(target.zombie)) {
          continue
        }

        const hitInfo = resolveZombieHit(segment, target.hitboxes)

        if (!hitInfo) {
          continue
        }

        resolveBulletHit(bullet, target, hitInfo, damageTargets)
        break
      }
    }

    for (const { zombie } of damageTargets) {
      if (!zombie?.active || zombie.isDead) {
        continue
      }

      if (!zombie.isPlayerInAttackRange?.(player) || !zombie.canDamagePlayer?.(time)) {
        continue
      }

      const damageApplied = onPlayerHit?.(zombie)

      if (!damageApplied) {
        continue
      }

      zombie.markDamageDealt?.(time)

      if (debugEnabled) {
        console.debug('[ZombieDamage]', {
          time,
          zombieType: zombie.typeId,
          attackRange: zombie.attackRange,
          damage: zombie.contactDamage,
          playerX: player.x,
          playerY: player.y,
        })
      }
    }

    renderDebug(damageTargets, activeBullets)
  }

  function destroy() {
    debugGraphics?.destroy()
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy)

  return {
    update,
    destroy,
  }
}
