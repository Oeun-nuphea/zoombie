import Phaser from 'phaser'

import { createFloatingCombatText, createImpactBurst } from './effectsSystem'

const TELEGRAPH_DEPTH = 32
const PROJECTILE_MAX_COUNT = 8

function randomizeCooldown(time, config) {
  const base = config?.cooldownMs ?? 0
  const variance = config?.cooldownVarianceMs ?? 0

  return time + base + (variance > 0 ? Phaser.Math.Between(-variance, variance) : 0)
}

function getDistance(a, b) {
  return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)
}

export function createBossDirector(scene, config) {
  const { player, zombies, spawnDirector, combatDirector, hud, soundManager, onHostilesChanged } = config
  const summonedMinions = new Set()
  const bossProjectiles = scene.physics.add.group({
    maxSize: PROJECTILE_MAX_COUNT,
    allowGravity: false,
  })

  let activeBoss = null
  let activeWave = null
  let currentAbilityState = null
  let telegraphNodes = []
  let nextSummonAt = 0
  let nextSlamAt = 0
  let nextChargeAt = 0
  let nextRangedAt = 0
  let nextGatlingAt = 0

  scene.physics.add.overlap(player, bossProjectiles, (_playerSprite, projectile) => {
    impactProjectile(projectile, {
      directHit: true,
    })
  })

  function getBehavior() {
    return activeBoss?.bossBehavior ?? null
  }

  function getAbilityConfig(abilityName) {
    return getBehavior()?.[abilityName] ?? null
  }

  function canUseAbility(abilityName) {
    const ability = getAbilityConfig(abilityName)

    if (!ability) {
      return false
    }

    if ((ability.minTier ?? 0) > (activeBoss?.bossTier ?? 0)) {
      return false
    }

    return (ability.unlockPhase ?? 1) <= (activeBoss?.phase ?? 1)
  }

  function destroyTelegraphNode(node) {
    if (!node) {
      return
    }

    scene.tweens.killTweensOf(node)
    node.destroy?.()
  }

  function clearTelegraph() {
    telegraphNodes.forEach((node) => destroyTelegraphNode(node))
    telegraphNodes = []
  }

  function clearProjectile(projectile) {
    if (!projectile) {
      return
    }

    projectile.spawnedAt = 0
    projectile.damage = 0
    projectile.splashRadius = 0
    projectile.knockbackScale = 1
    projectile.setActive(false)
    projectile.setVisible(false)
    projectile.body?.stop?.()
    projectile.disableBody(true, true)
  }

  function cleanupSummons() {
    for (const minion of summonedMinions) {
      if (!minion?.active || minion.isDead) {
        summonedMinions.delete(minion)
      }
    }
  }

  function cleanupProjectiles(time = scene.time.now) {
    bossProjectiles.getChildren().forEach((projectile) => {
      if (!projectile?.active) {
        return
      }

      if (
        time > (projectile.spawnedAt ?? 0) + (projectile.lifetimeMs ?? 0)
        || projectile.x < -80
        || projectile.x > scene.scale.width + 80
        || projectile.y < -80
        || projectile.y > scene.scale.height + 80
      ) {
        impactProjectile(projectile, {
          directHit: false,
        })
      }
    })
  }

  function setInitialCooldowns(time) {
    const summon = getAbilityConfig('summon')
    const slam = getAbilityConfig('slam')
    const charge = getAbilityConfig('charge')
    const ranged = getAbilityConfig('ranged')
    const gatling = getAbilityConfig('gatling')

    nextSummonAt = summon ? time + Math.max(1800, Math.round(summon.cooldownMs * 0.56)) : Number.POSITIVE_INFINITY
    nextSlamAt = slam ? time + Math.max(2200, Math.round(slam.cooldownMs * 0.62)) : Number.POSITIVE_INFINITY
    nextChargeAt = charge ? time + Math.max(2400, Math.round(charge.cooldownMs * 0.72)) : Number.POSITIVE_INFINITY
    nextRangedAt = ranged ? time + Math.max(1600, Math.round(ranged.cooldownMs * 0.52)) : Number.POSITIVE_INFINITY
    nextGatlingAt = gatling ? time + Math.max(2000, Math.round(gatling.cooldownMs * 0.52)) : Number.POSITIVE_INFINITY
  }

  function scheduleAbility(abilityName, time = scene.time.now) {
    const ability = getAbilityConfig(abilityName)

    if (!ability) {
      return
    }

    const nextTime = randomizeCooldown(time, ability)

    if (abilityName === 'summon') {
      nextSummonAt = nextTime
      return
    }

    if (abilityName === 'slam') {
      nextSlamAt = nextTime
      return
    }

    if (abilityName === 'charge') {
      nextChargeAt = nextTime
      return
    }

    if (abilityName === 'ranged') {
      nextRangedAt = nextTime
      return
    }

    if (abilityName === 'gatling') {
      nextGatlingAt = nextTime
    }
  }

  function pulseBanner(text, color = '#f8fafc', options = {}) {
    if (!text) {
      return
    }

    hud.flashBanner(text, color)
    soundManager?.play(options.soundKey ?? 'zombie-hit', {
      volume: options.volume ?? 1.12,
      rate: options.rate ?? 0.8,
    })
  }

  function createAbilityLabel(text, x, y, options = {}) {
    createFloatingCombatText(scene, x, y, text, {
      color: options.color ?? '#f8fafc',
      shadowColor: options.shadowColor ?? '#2b0b0b',
      fontSize: options.fontSize ?? '26px',
      duration: options.duration ?? 760,
      rise: options.rise ?? 22,
      depth: options.depth ?? 40,
    })
  }

  function createSlamTelegraph(boss, ability) {
    const dangerZone = scene.add.circle(boss.x, boss.y, ability.radius, 0xff0000, 0.25)
    dangerZone.setDepth(TELEGRAPH_DEPTH).setBlendMode(Phaser.BlendModes.ADD)
    dangerZone.setScale(0.1)

    const ring = scene.add.circle(boss.x, boss.y, ability.radius, 0xef4444, 0)
    ring.setDepth(TELEGRAPH_DEPTH + 1).setStrokeStyle(3, 0xfca5a5, 0.8)

    scene.tweens.add({
      targets: dangerZone,
      scale: 1,
      duration: ability.warningMs,
      ease: 'Linear',
    })

    scene.tweens.add({
      targets: ring,
      alpha: 0.5,
      duration: ability.warningMs,
      ease: 'Linear',
    })

    telegraphNodes.push(dangerZone, ring)
  }

  function createChargeTelegraph(boss, targetPoint, ability) {
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, targetPoint.x, targetPoint.y)
    const length = Phaser.Math.Clamp(
      Phaser.Math.Distance.Between(boss.x, boss.y, targetPoint.x, targetPoint.y) + 92,
      180,
      ability.triggerRangeMax + 64,
    )
    const stripe = scene.add.rectangle(
      boss.x + Math.cos(angle) * length * 0.5,
      boss.y + Math.sin(angle) * length * 0.5,
      length,
      28,
      0xfb923c,
      0.14,
    )
    stripe.setRotation(angle).setDepth(TELEGRAPH_DEPTH).setStrokeStyle(3, 0xf97316, 0.82)

    const reticle = scene.add.circle(targetPoint.x, targetPoint.y, 24, 0xf87171, 0.1)
    reticle.setDepth(TELEGRAPH_DEPTH + 1).setStrokeStyle(4, 0xfca5a5, 0.9)

    scene.tweens.add({
      targets: stripe,
      alpha: 0.26,
      scaleY: 1.2,
      duration: ability.warningMs,
      ease: 'Quad.easeOut',
    })
    scene.tweens.add({
      targets: reticle,
      radius: 32,
      alpha: 0.22,
      duration: ability.warningMs,
      ease: 'Sine.easeIn',
    })

    telegraphNodes.push(stripe, reticle)
  }

  function createRangedTelegraph(boss, targetPoint, ability) {
    const chargeGlow = scene.add.circle(boss.x, boss.y - boss.displayHeight * 0.18, 24, ability.tint ?? 0xa3e635, 0.14)
    chargeGlow.setDepth(TELEGRAPH_DEPTH).setBlendMode(Phaser.BlendModes.ADD)

    const reticle = scene.add.circle(targetPoint.x, targetPoint.y, 18, ability.tint ?? 0xa3e635, 0.08)
    reticle.setDepth(TELEGRAPH_DEPTH + 1).setStrokeStyle(3, ability.tint ?? 0xd9f99d, 0.88)

    scene.tweens.add({
      targets: chargeGlow,
      radius: 42,
      alpha: 0.2,
      duration: ability.warningMs,
      ease: 'Quad.easeOut',
    })
    scene.tweens.add({
      targets: reticle,
      radius: 28,
      alpha: 0.2,
      duration: ability.warningMs,
      ease: 'Sine.easeIn',
    })

    telegraphNodes.push(chargeGlow, reticle)
  }

  function createSummonTelegraph(boss, ability) {
    const ring = scene.add.circle(boss.x, boss.y, ability.radius * 0.46, 0xf59e0b, 0.1)
    ring.setDepth(TELEGRAPH_DEPTH).setStrokeStyle(4, 0xfbbf24, 0.86)
    ring.setBlendMode(Phaser.BlendModes.ADD)

    scene.tweens.add({
      targets: ring,
      radius: ability.radius * 0.76,
      alpha: 0.22,
      duration: 680,
      ease: 'Quad.easeOut',
    })

    telegraphNodes.push(ring)
  }

  function beginAbilityState(state) {
    currentAbilityState = state
  }

  function spawnSummonedZombies(ability) {
    cleanupSummons()

    if (!activeBoss?.active || activeBoss.isDead || !activeWave) {
      return 0
    }

    const currentSummonCount = summonedMinions.size
    const availableSlots = Math.max(
      0,
      (activeWave.maxAlive ?? 0) + (ability.maxAliveBonus ?? 0) - zombies.countActive(true),
    )
    const spawnCount = Math.min(
      ability.count ?? 0,
      Math.max(0, (ability.maxConcurrent ?? ability.count ?? 0) - currentSummonCount),
      availableSlots,
    )

    if (spawnCount <= 0) {
      return 0
    }

    for (let index = 0; index < spawnCount; index += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
      const basePoint = {
        label: 'Boss Summon',
        x: activeBoss.x + Math.cos(angle) * (ability.radius ?? 110) * 0.5,
        y: activeBoss.y + Math.sin(angle) * (ability.radius ?? 110) * 0.35,
        radius: (ability.radius ?? 110) * 0.34,
      }
      const typeId = Phaser.Utils.Array.GetRandom(ability.spawnTypes ?? ['goreWalker', 'hoodieRunner'])
      const minion = spawnDirector.spawnZombie(activeWave, {
        basePoint,
        typeId,
        speedVariance: {
          min: -3,
          max: 7,
        },
      })

      minion.isBossSummon = true
      summonedMinions.add(minion)
      createImpactBurst(scene, minion.x, minion.y - 6, {
        color: 0xf97316,
        radius: 12,
        endRadius: 48,
        particleCount: 9,
        duration: 220,
      })
    }

    pulseBanner(ability.bannerText ?? 'REINFORCEMENTS', activeBoss.isFinalBoss ? '#fca5a5' : '#fdba74', {
      volume: 1.14,
      rate: 0.72,
    })
    onHostilesChanged?.()

    return spawnCount
  }

  function impactProjectile(projectile, options = {}) {
    if (!projectile?.active) {
      return
    }

    const splashRadius = projectile.splashRadius ?? 0
    const shouldHitPlayer = options.directHit
      || (splashRadius > 0 && getDistance(projectile, player) <= splashRadius)

    createImpactBurst(scene, projectile.x, projectile.y, {
      color: projectile.impactColor ?? 0xa3e635,
      radius: 16,
      endRadius: Math.max(32, splashRadius + 18),
      particleCount: 12,
      duration: 240,
      depth: TELEGRAPH_DEPTH + 2,
    })
    soundManager?.play('zombie-hit', {
      volume: 1.04,
      rate: 0.94,
    })

    if (shouldHitPlayer) {
      combatDirector.handleBossAttack(activeBoss ?? projectile.sourceBoss ?? null, {
        damage: projectile.damage ?? 1,
        fromX: projectile.x,
        fromY: projectile.y,
        knockbackForceScale: projectile.knockbackScale ?? 1.2,
        cameraShakeDuration: 120,
        cameraShakeIntensity: 0.0044,
        damageSource: 'boss-projectile',
      })
    }

    clearProjectile(projectile)
  }

  function spawnBossProjectile(targetPoint, ability) {
    const projectile = bossProjectiles.getFirstDead(false)
      ?? bossProjectiles.create(activeBoss.x, activeBoss.y, 'bullet')

    if (!projectile) {
      return null
    }

    const originX = activeBoss.x
    const originY = activeBoss.y - activeBoss.displayHeight * 0.18
    const angle = Phaser.Math.Angle.Between(originX, originY, targetPoint.x, targetPoint.y)

    projectile.enableBody?.(true, originX, originY, true, true)
    projectile.setActive(true).setVisible(true)
    projectile.setPosition(originX, originY)
    projectile.setDepth(30)
    projectile.setScale(activeBoss.isFinalBoss ? 1.55 : 1.35)
    projectile.setTint(ability.tint ?? 0xa3e635)
    projectile.body.setAllowGravity(false)
    projectile.body.setCircle?.(8)
    projectile.spawnedAt = scene.time.now
    projectile.lifetimeMs = ability.lifetimeMs ?? 2200
    projectile.damage = ability.damage ?? 1
    projectile.splashRadius = ability.splashRadius ?? 0
    projectile.knockbackScale = ability.knockbackScale ?? 1.2
    projectile.impactColor = ability.tint ?? 0xa3e635
    projectile.sourceBoss = activeBoss

    scene.physics.velocityFromRotation(angle, ability.speed ?? 380, projectile.body.velocity)
    createImpactBurst(scene, originX, originY, {
      color: ability.tint ?? 0xa3e635,
      radius: 10,
      endRadius: 28,
      particleCount: 8,
      duration: 180,
    })

    return projectile
  }

  function startGroundSlam(time) {
    const ability = getAbilityConfig('slam')

    if (!activeBoss?.active || activeBoss.isDead || !ability || currentAbilityState) {
      return false
    }

    activeBoss.beginWindup('slam', ability.warningMs)
    createSlamTelegraph(activeBoss, ability)
    createAbilityLabel(ability.warningText ?? 'GROUND SLAM', activeBoss.x, activeBoss.y - activeBoss.displayHeight * 0.55, {
      color: '#fda4af',
      shadowColor: '#450a0a',
      duration: ability.warningMs,
    })
    pulseBanner(ability.warningText ?? 'GROUND SLAM', '#fda4af', {
      volume: 1.22,
      rate: 0.62,
    })

    beginAbilityState({
      type: 'slam',
      executeAt: time + ability.warningMs,
      x: activeBoss.x,
      y: activeBoss.y,
      radius: ability.radius,
      damage: ability.damage,
      knockbackScale: ability.knockbackScale,
    })

    return true
  }

  function resolveGroundSlam(time) {
    const abilityState = currentAbilityState
    const ability = getAbilityConfig('slam')

    clearTelegraph()
    currentAbilityState = null

    if (!activeBoss?.active || activeBoss.isDead || !abilityState || !ability) {
      activeBoss?.stopActiveAbility?.()
      scheduleAbility('slam', time)
      return
    }

    activeBoss.stopActiveAbility()

    createImpactBurst(scene, abilityState.x, abilityState.y, {
      color: 0xef4444,
      radius: 34,
      endRadius: abilityState.radius + 32,
      particleCount: activeBoss.isFinalBoss ? 24 : 20,
      duration: 380,
      depth: TELEGRAPH_DEPTH + 4,
    })
    scene.cameras.main.shake(activeBoss.isFinalBoss ? 260 : 220, activeBoss.isFinalBoss ? 0.0066 : 0.0058)
    soundManager?.play('zombie-death', {
      volume: activeBoss.isFinalBoss ? 1.3 : 1.22,
      rate: activeBoss.isFinalBoss ? 0.54 : 0.62,
    })

    if (Phaser.Math.Distance.Between(player.x, player.y, abilityState.x, abilityState.y) <= abilityState.radius) {
      combatDirector.handleBossAttack(activeBoss, {
        damage: abilityState.damage,
        fromX: abilityState.x,
        fromY: abilityState.y,
        knockbackForceScale: abilityState.knockbackScale,
        bloodIntensity: 3,
        cameraShakeDuration: 180,
        cameraShakeIntensity: 0.0064,
        damageSource: 'boss-slam',
      })
      activeBoss.markDamageDealt(time)
    }

    scheduleAbility('slam', time)
  }

  function startCharge(time) {
    const ability = getAbilityConfig('charge')

    if (!activeBoss?.active || activeBoss.isDead || !ability || currentAbilityState) {
      return false
    }

    const targetPoint = {
      x: player.x,
      y: player.y,
    }
    const direction = new Phaser.Math.Vector2(targetPoint.x - activeBoss.x, targetPoint.y - activeBoss.y)

    if (direction.lengthSq() <= 0.001) {
      direction.set(1, 0)
    }

    direction.normalize()
    activeBoss.beginWindup('charge', ability.warningMs)
    createChargeTelegraph(activeBoss, targetPoint, ability)
    createAbilityLabel(ability.warningText ?? 'CHARGE', activeBoss.x, activeBoss.y - activeBoss.displayHeight * 0.58, {
      color: '#fdba74',
      shadowColor: '#431407',
      duration: ability.warningMs,
    })
    pulseBanner(ability.warningText ?? 'CHARGE', '#fdba74', {
      volume: 1.18,
      rate: 0.74,
    })

    beginAbilityState({
      type: 'charge-windup',
      executeAt: time + ability.warningMs,
      direction,
      durationMs: ability.durationMs,
      speed: ability.speed,
      damage: ability.damage,
      knockbackScale: ability.knockbackScale,
      hitPlayer: false,
    })

    return true
  }

  function resolveCharge(time) {
    const abilityState = currentAbilityState
    const ability = getAbilityConfig('charge')

    clearTelegraph()

    if (!activeBoss?.active || activeBoss.isDead || !abilityState || !ability) {
      currentAbilityState = null
      scheduleAbility('charge', time)
      return
    }

    activeBoss.beginCharge(abilityState.direction, ability)
    createImpactBurst(scene, activeBoss.x, activeBoss.y, {
      color: 0xf97316,
      radius: 18,
      endRadius: 56,
      particleCount: 12,
      duration: 220,
    })
    soundManager?.play('zombie-hit', {
      volume: 1.16,
      rate: 0.84,
    })

    currentAbilityState = {
      type: 'charge',
      endAt: time + ability.durationMs,
      damage: ability.damage,
      knockbackScale: ability.knockbackScale,
      hitPlayer: false,
    }
  }

  function updateCharge(time) {
    if (!currentAbilityState || currentAbilityState.type !== 'charge' || !activeBoss?.active || activeBoss.isDead) {
      return
    }

    const bossBody = activeBoss.body
    const isBlocked = bossBody?.blocked?.left || bossBody?.blocked?.right || bossBody?.blocked?.up || bossBody?.blocked?.down
    const isCloseToPlayer = getDistance(activeBoss, player) <= Math.max(activeBoss.attackRange * 0.8, 72)

    if (!currentAbilityState.hitPlayer && isCloseToPlayer) {
      const didDamage = combatDirector.handleBossAttack(activeBoss, {
        damage: currentAbilityState.damage,
        fromX: activeBoss.x,
        fromY: activeBoss.y,
        knockbackForceScale: currentAbilityState.knockbackScale,
        bloodIntensity: 3,
        cameraShakeDuration: 160,
        cameraShakeIntensity: 0.0062,
        damageSource: 'boss-charge',
      })

      currentAbilityState.hitPlayer = didDamage

      if (didDamage) {
        activeBoss.markDamageDealt(time)
      }
    }

    if (isBlocked || time >= currentAbilityState.endAt || currentAbilityState.hitPlayer) {
      createImpactBurst(scene, activeBoss.x, activeBoss.y, {
        color: 0xfb7185,
        radius: 16,
        endRadius: 44,
        particleCount: 10,
        duration: 180,
      })
      activeBoss.stopActiveAbility()
      currentAbilityState = null
      scheduleAbility('charge', time)
    }
  }

  function startRangedAttack(time) {
    const ability = getAbilityConfig('ranged')

    if (!activeBoss?.active || activeBoss.isDead || !ability || currentAbilityState) {
      return false
    }

    const targetPoint = {
      x: player.x + player.body.velocity.x * 0.18,
      y: player.y + player.body.velocity.y * 0.18,
    }

    activeBoss.beginWindup('ranged', ability.warningMs)
    createRangedTelegraph(activeBoss, targetPoint, ability)
    createAbilityLabel(ability.warningText ?? 'RANGED ATTACK', activeBoss.x, activeBoss.y - activeBoss.displayHeight * 0.54, {
      color: '#d9f99d',
      shadowColor: '#365314',
      duration: ability.warningMs,
      fontSize: '24px',
    })
    pulseBanner(ability.warningText ?? 'PLAGUE SPIT', '#d9f99d', {
      volume: 1.08,
      rate: 0.9,
    })

    beginAbilityState({
      type: 'ranged',
      executeAt: time + ability.warningMs,
      targetPoint,
    })

    return true
  }

  function resolveRangedAttack(time) {
    const abilityState = currentAbilityState
    const ability = getAbilityConfig('ranged')

    clearTelegraph()
    currentAbilityState = null

    if (!activeBoss?.active || activeBoss.isDead || !abilityState || !ability) {
      activeBoss?.stopActiveAbility?.()
      scheduleAbility('ranged', time)
      return
    }

    activeBoss.stopActiveAbility()
    spawnBossProjectile(abilityState.targetPoint, ability)
    scheduleAbility('ranged', time)
  }

  function startGatlingAttack(time) {
    const ability = getAbilityConfig('gatling')

    if (!activeBoss?.active || activeBoss.isDead || !ability || currentAbilityState) {
      return false
    }

    const targetPoint = {
      x: player.x,
      y: player.y,
    }

    activeBoss.beginWindup('gatling', ability.warningMs)
    createRangedTelegraph(activeBoss, targetPoint, ability)
    pulseBanner(ability.warningText ?? 'GATLING BURST', '#d9f99d', {
      volume: 1.18,
      rate: 0.95,
    })

    beginAbilityState({
      type: 'gatling-windup',
      executeAt: time + ability.warningMs,
    })

    return true
  }

  function resolveGatlingAttack(time) {
    const abilityState = currentAbilityState
    const ability = getAbilityConfig('gatling')

    clearTelegraph()

    if (!activeBoss?.active || activeBoss.isDead || !abilityState || !ability) {
      currentAbilityState = null
      activeBoss?.stopActiveAbility?.()
      scheduleAbility('gatling', time)
      return
    }

    currentAbilityState = {
      type: 'gatling-active',
      shotsFired: 0,
      totalShots: ability.shots ?? 15,
      nextShotAt: time,
      delayMs: ability.shotDelayMs ?? 90,
    }
  }

  function updateGatlingAttack(time) {
    if (!currentAbilityState || currentAbilityState.type !== 'gatling-active' || !activeBoss?.active || activeBoss.isDead) {
      return
    }

    const ability = getAbilityConfig('gatling')

    if (time >= currentAbilityState.nextShotAt) {
      const targetPoint = {
        x: player.x + Phaser.Math.Between(-30, 30),
        y: player.y + Phaser.Math.Between(-30, 30),
      }
      
      spawnBossProjectile(targetPoint, ability)
      currentAbilityState.shotsFired += 1
      currentAbilityState.nextShotAt = time + currentAbilityState.delayMs

      if (currentAbilityState.shotsFired >= currentAbilityState.totalShots) {
        currentAbilityState = null
        activeBoss.stopActiveAbility()
        scheduleAbility('gatling', time)
      }
    }
  }

  function startSummon(time) {
    const ability = getAbilityConfig('summon')

    if (!activeBoss?.active || activeBoss.isDead || !ability || currentAbilityState) {
      return false
    }

    activeBoss.beginWindup('summon', 680)
    createSummonTelegraph(activeBoss, ability)
    createAbilityLabel(ability.warningText ?? 'SUMMONING', activeBoss.x, activeBoss.y - activeBoss.displayHeight * 0.58, {
      color: '#fde68a',
      shadowColor: '#713f12',
      duration: 680,
      fontSize: '24px',
    })

    beginAbilityState({
      type: 'summon',
      executeAt: time + 680,
    })

    return true
  }

  function resolveSummon(time) {
    clearTelegraph()
    currentAbilityState = null

    const ability = getAbilityConfig('summon')

    if (!ability) {
      activeBoss?.stopActiveAbility?.()
      scheduleAbility('summon', time)
      return
    }

    activeBoss?.stopActiveAbility?.()
    spawnSummonedZombies(ability)
    scheduleAbility('summon', time)
  }

  function maybeEnterPhaseTwo(time) {
    const behavior = getBehavior()

    if (!activeBoss?.active || activeBoss.isDead || !behavior || activeBoss.phase >= 2) {
      return
    }

    const healthRatio = activeBoss.health / Math.max(1, activeBoss.maxHealth)

    if (healthRatio > (behavior.phaseTwoThreshold ?? 0.5)) {
      return
    }

    const didTransition = activeBoss.enterPhaseTwo(behavior)

    if (!didTransition) {
      return
    }

    createImpactBurst(scene, activeBoss.x, activeBoss.y - 10, {
      color: activeBoss.isFinalBoss ? 0xef4444 : 0xfb923c,
      radius: 28,
      endRadius: activeBoss.isFinalBoss ? 112 : 88,
      particleCount: activeBoss.isFinalBoss ? 24 : 18,
      duration: 340,
      depth: TELEGRAPH_DEPTH + 4,
    })
    createAbilityLabel(
      behavior.phaseTwoBannerText ?? 'ENRAGED',
      activeBoss.x,
      activeBoss.y - activeBoss.displayHeight * 0.7,
      {
        color: '#fecaca',
        shadowColor: '#450a0a',
        fontSize: activeBoss.isFinalBoss ? '30px' : '26px',
        duration: 900,
        rise: 26,
      },
    )
    pulseBanner(behavior.phaseTwoBannerText ?? 'ENRAGED', '#fecaca', {
      soundKey: 'zombie-death',
      volume: 1.26,
      rate: activeBoss.isFinalBoss ? 0.62 : 0.72,
    })
    scene.cameras.main.shake(activeBoss.isFinalBoss ? 220 : 180, activeBoss.isFinalBoss ? 0.0056 : 0.0048)

    if (canUseAbility('charge')) {
      nextChargeAt = Math.min(nextChargeAt, time + 1000)
    }

    if (canUseAbility('slam')) {
      nextSlamAt = Math.min(nextSlamAt, time + 1400)
    }

    if (canUseAbility('gatling')) {
      nextGatlingAt = Math.min(nextGatlingAt, time + 800)
    }
  }

  function tryStartAbility(time) {
    if (!activeBoss?.active || activeBoss.isDead || currentAbilityState || activeBoss.isLocked(time)) {
      return
    }

    const distanceToPlayer = getDistance(activeBoss, player)
    const slam = getAbilityConfig('slam')

    if (
      canUseAbility('slam')
      && slam
      && time >= nextSlamAt
      && distanceToPlayer <= (slam.triggerRange ?? 220)
    ) {
      startGroundSlam(time)
      return
    }

    const charge = getAbilityConfig('charge')

    if (
      canUseAbility('charge')
      && charge
      && time >= nextChargeAt
      && distanceToPlayer >= (charge.triggerRangeMin ?? 90)
      && distanceToPlayer <= (charge.triggerRangeMax ?? 300)
    ) {
      startCharge(time)
      return
    }

    const ranged = getAbilityConfig('ranged')

    if (
      canUseAbility('ranged')
      && ranged
      && time >= nextRangedAt
      && distanceToPlayer <= (ranged.triggerRangeMax ?? 420)
    ) {
      startRangedAttack(time)
      return
    }

    if (canUseAbility('summon') && time >= nextSummonAt) {
      startSummon(time)
      return
    }

    const gatling = getAbilityConfig('gatling')

    if (
      canUseAbility('gatling')
      && gatling
      && time >= nextGatlingAt
    ) {
      startGatlingAttack(time)
    }
  }

  function resolveAbilityState(time) {
    if (!currentAbilityState) {
      return
    }

    if (currentAbilityState.type === 'slam' && time >= currentAbilityState.executeAt) {
      resolveGroundSlam(time)
      return
    }

    if (currentAbilityState.type === 'charge-windup' && time >= currentAbilityState.executeAt) {
      resolveCharge(time)
      return
    }

    if (currentAbilityState.type === 'ranged' && time >= currentAbilityState.executeAt) {
      resolveRangedAttack(time)
      return
    }

    if (currentAbilityState.type === 'gatling-windup' && time >= currentAbilityState.executeAt) {
      resolveGatlingAttack(time)
      return
    }

    if (currentAbilityState.type === 'gatling-active') {
      updateGatlingAttack(time)
      return
    }

    if (currentAbilityState.type === 'summon' && time >= currentAbilityState.executeAt) {
      resolveSummon(time)
      return
    }

    if (currentAbilityState.type === 'charge') {
      updateCharge(time)
    }
  }

  function setBoss(boss, waveConfig) {
    clearBoss()
    activeBoss = boss
    activeWave = waveConfig

    if (!activeBoss?.isBoss) {
      return
    }

    setInitialCooldowns(scene.time.now)
  }

  function update(time) {
    cleanupSummons()
    cleanupProjectiles(time)

    if (!activeBoss?.active || activeBoss.isDead) {
      clearBoss()
      return
    }

    maybeEnterPhaseTwo(time)
    resolveAbilityState(time)
    tryStartAbility(time)
  }

  function clearBoss() {
    activeBoss?.stopActiveAbility?.()
    activeBoss = null
    activeWave = null
    currentAbilityState = null
    nextSummonAt = 0
    nextSlamAt = 0
    nextChargeAt = 0
    nextRangedAt = 0
    summonedMinions.clear()
    clearTelegraph()
    bossProjectiles.getChildren().forEach((projectile) => clearProjectile(projectile))
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    clearBoss()
    bossProjectiles.clear(true, true)
  })

  return {
    clearBoss,
    setBoss,
    update,
  }
}
