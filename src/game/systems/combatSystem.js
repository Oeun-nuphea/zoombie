import Phaser from 'phaser'

import { HEADSHOT_CONFIG } from '../config/gameplayConfig'
import { registerGameCollisions } from './collisionSystem'
import { createBloodSplatter, createFloatingCombatText, createImpactBurst, createMuzzleFlash } from './effectsSystem'

export function createCombatDirector(scene, config) {
  const {
    player,
    bullets,
    zombies,
    gameStore,
    hud,
    dropDirector,
    soundManager,
    upgradeDirector,
    onZombieKilled,
    onGameOver,
  } = config
  const collisionDirector = registerGameCollisions(scene, {
    bullets,
    zombies,
    player,
    onPlayerHit: handlePlayerHit,
    onZombieDamaged: handleZombieDamaged,
    onZombieKilled: handleZombieDown,
  })
  const combatGlow = scene.add.circle(player.x, player.y, 96, 0xffb357, 0.12)
  combatGlow.setBlendMode(Phaser.BlendModes.ADD).setDepth(8)
  const poisonGlow = scene.add.circle(player.x, player.y, 84, 0x8fe55b, 0)
  poisonGlow.setBlendMode(Phaser.BlendModes.ADD).setDepth(7)

  let isGameOver = false
  let poisonUntil = 0
  let poisonNextTickAt = 0
  let poisonTickDamage = 0
  let poisonTickInterval = 0
  let lifestealCharge = 0
  let lastVampireTick = 0
  let api = null

  function isBossTarget(zombie) {
    return Boolean(zombie?.isBoss)
  }

  function handleShot(shot) {
    createMuzzleFlash(scene, shot.x, shot.y, shot.rotation)
    flashCombatLight(shot.x, shot.y)
    
    // Weapon fire screen shake
    const isShotgun = shot.weapon?.id === 'shotgun'
    scene.cameras.main.shake(isShotgun ? 40 : 20, isShotgun ? 0.0025 : 0.001)

    if (isShotgun) {
      soundManager?.play('shotgun-shoot', { volume: 1.2 })
    } else {
      soundManager?.play('shoot', { volume: 1 })
    }

  }

  function applyLifesteal(damageDealt = 0, options = {}) {
    const lifesteal = player.getCombatStats?.().lifesteal ?? 0

    if (
      !lifesteal
      || damageDealt <= 0
      || options.source === 'explosion'
      || gameStore.health >= gameStore.maxPlayerHealth
    ) {
      return
    }

    lifestealCharge += damageDealt * lifesteal
    const recoveredHealth = Math.floor(lifestealCharge)

    if (recoveredHealth <= 0) {
      return
    }

    lifestealCharge -= recoveredHealth
    gameStore.healPlayer(recoveredHealth)

    createFloatingCombatText(scene, player.x, player.y - 12, `+${recoveredHealth}`, {
      color: '#4ade80',
      shadowColor: '#14532d',
      fontSize: '22px',
      duration: 500,
      rise: 22,
    })
  }

  function handleZombieDamaged(zombie, bullet, hitResult = {}) {
    applyLifesteal(hitResult?.damageTaken ?? bullet?.damage ?? 0, hitResult)

    if (hitResult?.isHeadshot) {
      gameStore.addHeadshot()
      const impactX = hitResult.impactPoint?.x ?? hitResult.hitCircle?.x ?? zombie.x
      const impactY = hitResult.impactPoint?.y ?? hitResult.hitCircle?.y ?? zombie.y - 32
      const heavyTarget = isBossTarget(zombie)
      const isFinalBoss = Boolean(zombie?.isFinalBoss)

      createBloodSplatter(scene, impactX, impactY, isFinalBoss ? 5 : heavyTarget ? 4 : 3)
      createImpactBurst(scene, impactX, impactY, {
        color: HEADSHOT_CONFIG.impactColor,
        radius: isFinalBoss ? 24 : heavyTarget ? 18 : 14,
        endRadius: isFinalBoss ? 76 : heavyTarget ? 58 : 46,
        particleCount: isFinalBoss ? 20 : heavyTarget ? 16 : 12,
        duration: isFinalBoss ? 320 : heavyTarget ? 260 : 220,
      })
      createFloatingCombatText(scene, impactX, impactY - 12, HEADSHOT_CONFIG.text, {
        color: Phaser.Display.Color.IntegerToColor(HEADSHOT_CONFIG.textColor).rgba,
        shadowColor: '#4a1111',
        fontSize: isFinalBoss ? '32px' : heavyTarget ? '28px' : '24px',
        duration: isFinalBoss ? 860 : 760,
        rise: isFinalBoss ? 40 : 34,
      })
      scene.cameras.main.shake(isFinalBoss ? 95 : heavyTarget ? 65 : 42, isFinalBoss ? 0.0032 : heavyTarget ? 0.0022 : 0.0015)
      soundManager?.play('headshot-hit', {
        volume: isFinalBoss ? 1.28 : heavyTarget ? 1.18 : 1,
        rate: isFinalBoss ? 0.94 : heavyTarget ? 1.08 : 1.14,
      })
      upgradeDirector?.handleEnemyHit({
        zombie,
        bullet,
        combat: api,
        ...hitResult,
      })
      return
    }

    if (isBossTarget(zombie)) {
      const isFinalBoss = Boolean(zombie?.isFinalBoss)

      createBloodSplatter(scene, zombie.x, zombie.y, 2)
      createImpactBurst(scene, zombie.x, zombie.y - 8, {
        color: zombie.auraColor ?? (isFinalBoss ? 0xef4444 : 0xf97316),
        radius: isFinalBoss ? 18 : 12,
        endRadius: isFinalBoss ? 54 : 42,
        particleCount: isFinalBoss ? 14 : 10,
        duration: isFinalBoss ? 220 : 180,
      })
      scene.cameras.main.shake(isFinalBoss ? 70 : 40, isFinalBoss ? 0.0024 : 0.0012)
      soundManager?.play('zombie-hit', {
        volume: isFinalBoss ? 1.22 : 1.15,
        rate: isFinalBoss ? 0.7 : 0.88,
      })
      upgradeDirector?.handleEnemyHit({
        zombie,
        bullet,
        combat: api,
        ...hitResult,
      })
      return
    }

    createBloodSplatter(scene, zombie.x, zombie.y, 1)
    
    // Regular floating damage text
    const impactX = hitResult?.impactPoint?.x ?? zombie.x
    const impactY = hitResult?.impactPoint?.y ?? zombie.y - 16
    const damageAmount = hitResult?.damageTaken ?? bullet?.damage ?? 1
    const displayDamage = Number.isFinite(damageAmount) ? Number(damageAmount.toFixed(1)) : damageAmount
    createFloatingCombatText(scene, impactX, impactY, displayDamage.toString(), {
      color: '#fbbf24',
      shadowColor: '#78350f',
      fontSize: '18px',
      duration: 500,
      rise: 20,
    })

    soundManager?.play('zombie-hit')
    upgradeDirector?.handleEnemyHit({
      zombie,
      bullet,
      combat: api,
      ...hitResult,
    })
  }

  function handleZombieDown(zombie, killContext = {}) {
    if (isGameOver) {
      return
    }

    if (isBossTarget(zombie)) {
      const isFinalBoss = Boolean(zombie?.isFinalBoss)

      createBloodSplatter(scene, zombie.x, zombie.y, isFinalBoss ? 7 : 5)
      createImpactBurst(scene, zombie.x, zombie.y - 10, {
        color: zombie.auraColor ?? (isFinalBoss ? 0xef4444 : 0xf97316),
        radius: isFinalBoss ? 28 : 20,
        endRadius: isFinalBoss ? 120 : 88,
        particleCount: isFinalBoss ? 26 : 18,
        duration: isFinalBoss ? 420 : 340,
        depth: 34,
      })
      flashCombatLight(zombie.x, zombie.y)
      hud.clearBossTarget()
      hud.flashBanner(zombie.deathBannerText ?? (isFinalBoss ? 'FINAL BOSS DOWN' : 'MINI BOSS DOWN'), isFinalBoss ? '#f87171' : '#fb923c')
      scene.cameras.main.shake(isFinalBoss ? 320 : 220, isFinalBoss ? 0.007 : 0.0055)
      soundManager?.play('zombie-death', {
        volume: isFinalBoss ? 1.4 : 1.3,
        rate: isFinalBoss ? 0.58 : 0.76,
      })
      soundManager?.play('zombie-die', {
        volume: isFinalBoss ? 1.1 : 0.9,
        rate: isFinalBoss ? 0.62 : 0.82,
      })
    } else {
      createBloodSplatter(scene, zombie.x, zombie.y, 2)
      soundManager?.play('zombie-die')

      if (zombie.isElite) {
        createImpactBurst(scene, zombie.x, zombie.y - 10, {
          color: zombie.eliteConfig?.tintColor ?? 0xfacc15,
          radius: 14,
          endRadius: 40,
          particleCount: 10,
          duration: 250,
        })
        hud.flashBanner('ELITE DOWN', zombie.eliteConfig?.labelColor ?? '#facc15')
      }

      // Boomer explosion on death
      if (zombie.explodes) {
        const boomX = zombie.x
        const boomY = zombie.y
        const boomRadius = zombie.explosionRadius ?? 160
        const boomDamage = zombie.explosionDamage ?? 2
        const boomKnockback = zombie.explosionKnockback ?? 800
        const acidMs = zombie.acidPoolDurationMs ?? 2500

        // Flash + shockwave ring (use graphics for reliable cleanup)
        const ring = scene.add.graphics()
        ring.setDepth(28)
        ring.lineStyle(8, 0xfbbf24, 0.9)
        ring.strokeCircle(boomX, boomY, 18)
        scene.tweens.add({
          targets: ring,
          alpha: 0,
          scaleX: boomRadius / 18,
          scaleY: boomRadius / 18,
          duration: 320,
          ease: 'Cubic.easeOut',
          onComplete: () => ring.destroy(),
        })

        // Acid pool that persists
        const pool = scene.add.circle(boomX, boomY, boomRadius * 0.55, 0x84cc16, 0.32)
        pool.setDepth(3)
        scene.tweens.add({
          targets: pool,
          alpha: 0,
          delay: acidMs,
          duration: 600,
          onComplete: () => pool.destroy(),
        })

        // Amplified barrel explosion shake
        scene.cameras.main.shake(200, 0.004)
        soundManager?.play('shoot', { volume: 1.4, rate: 0.38 })

        // Damage all zombies in radius
        damageEnemiesInRadius({ x: boomX, y: boomY }, boomRadius, {
          damage: boomDamage,
          source: 'boomer-explosion',
          allowBossDamage: false,
          excludeZombie: zombie,
        })

        // Knockback nearby zombies
        zombies.getChildren().forEach((z) => {
          if (!z.active || z.isDead || z === zombie) return
          const dist = Phaser.Math.Distance.Between(boomX, boomY, z.x, z.y)
          if (dist <= boomRadius) {
            const angle = Phaser.Math.Angle.Between(boomX, boomY, z.x, z.y)
            z.body.velocity.x += Math.cos(angle) * boomKnockback
            z.body.velocity.y += Math.sin(angle) * boomKnockback
          }
        })

        // Damage player if caught in blast (check distance first)
        const playerDist = Phaser.Math.Distance.Between(boomX, boomY, player.x, player.y)
        if (playerDist <= boomRadius) {
          applyDamageToPlayer(zombie, {
            fromX: boomX,
            fromY: boomY,
            damage: boomDamage,
            triggerAttackAnimation: false,
            soundKey: 'player-hit',
          })
        }
      }
    }

    gameStore.addKill()
    gameStore.addScore(zombie.scoreValue ?? 10)
    dropDirector?.handleZombieDefeat(zombie)
    upgradeDirector?.handleEnemyKilled({
      zombie,
      combat: api,
      ...killContext,
    })
    onZombieKilled?.(zombie)
  }

  function damageZombie(zombie, amount = 0, options = {}) {
    if (!zombie?.active || zombie.isDead || amount <= 0) {
      return null
    }

    const hitResult = zombie.takeDamage(amount, {
      hitZone: options.hitZone ?? 'body',
      isHeadshot: options.isHeadshot ?? false,
      impactPoint: options.impactPoint ?? {
        x: zombie.x,
        y: zombie.y - 8,
      },
    })
    const hitPayload = {
      ...hitResult,
      baseDamage: amount,
      totalDamage: amount,
      damageMultiplier: 1,
      hitCircle: null,
      source: options.source ?? 'effect',
      impactPoint: options.impactPoint ?? {
        x: zombie.x,
        y: zombie.y - 8,
      },
    }

    handleZombieDamaged(zombie, null, hitPayload)

    if (hitResult.isDead) {
      zombie.die()
      handleZombieDown(zombie, {
        ...hitPayload,
      })
    }

    return hitPayload
  }

  function damageEnemiesInRadius(origin, radius, options = {}) {
    const {
      damage = 1,
      maxTargets = Number.POSITIVE_INFINITY,
      excludeZombie = null,
      source = 'effect',
      allowBossDamage = false,
      cameraShakeDuration = 0,
      cameraShakeIntensity = 0,
    } = options

    if (!origin || radius <= 0 || damage <= 0) {
      return 0
    }

    const targets = zombies.getChildren()
      .filter((zombie) => zombie?.active && !zombie.isDead)
      .filter((zombie) => zombie !== excludeZombie)
      .filter((zombie) => allowBossDamage || !zombie.isBoss)
      .map((zombie) => ({
        zombie,
        distanceSq: Phaser.Math.Distance.Squared(origin.x, origin.y, zombie.x, zombie.y),
      }))
      .filter((entry) => entry.distanceSq <= radius * radius)
      .sort((left, right) => left.distanceSq - right.distanceSq)
      .slice(0, Number.isFinite(maxTargets) ? maxTargets : Number.POSITIVE_INFINITY)

    if (cameraShakeDuration > 0 && cameraShakeIntensity > 0) {
      scene.cameras.main.shake(cameraShakeDuration, cameraShakeIntensity)
    }

    targets.forEach(({ zombie }) => {
      damageZombie(zombie, damage, {
        source,
        impactPoint: {
          x: zombie.x,
          y: zombie.y - 8,
        },
      })
    })

    return targets.length
  }

  function applyDamageToPlayer(source, options = {}) {
    if (isGameOver || player.isDead) {
      return false
    }

    const time = scene.time.now

    if (player.isDamageImmune?.(time)) {
      return false
    }

    if (options.respectPlayerCooldown && !player.canTakeDamage(time)) {
      return false
    }

    if (options.triggerAttackAnimation !== false) {
      source?.attack?.(time)
    }

    player.takeDamage(time)
    player.applyKnockback(
      options.fromX ?? source?.x ?? player.x,
      options.fromY ?? source?.y ?? player.y,
      options.knockbackForceScale ?? source?.knockbackForceScale ?? 1,
    )
    gameStore.damagePlayer(options.damage ?? source?.contactDamage ?? 1)

    if (options.applyPoison !== false && source) {
      applyPoison(source)
    }

    createBloodSplatter(scene, player.x + Phaser.Math.Between(-8, 8), player.y, options.bloodIntensity ?? 2)
    scene.cameras.main.shake(
      options.cameraShakeDuration ?? (isBossTarget(source) ? 115 : 80),
      options.cameraShakeIntensity ?? (isBossTarget(source) ? 0.0048 : 0.003),
    )
    soundManager?.play(options.soundKey ?? 'player-hit', options.soundOptions)
    upgradeDirector?.handlePlayerDamaged({
      source: options.damageSource ?? source?.typeId ?? source?.bossKind ?? 'contact',
      enemy: source ?? null,
      damage: options.damage ?? source?.contactDamage ?? 1,
      combat: api,
    })

    if (gameStore.health <= 0) {
      endRun()
    }

    return true
  }

  function handlePlayerHit(zombie) {
    return applyDamageToPlayer(zombie)
  }

  function handleBossAttack(boss, attackConfig = {}) {
    return applyDamageToPlayer(boss, {
      ...attackConfig,
      respectPlayerCooldown: true,
      applyPoison: false,
      bloodIntensity: attackConfig.bloodIntensity ?? 3,
      cameraShakeDuration: attackConfig.cameraShakeDuration ?? 160,
      cameraShakeIntensity: attackConfig.cameraShakeIntensity ?? 0.0058,
      soundKey: attackConfig.soundKey ?? 'player-hit',
    })
  }

  function applyPoison(zombie) {
    if (!zombie.poisonDamage || !zombie.poisonDuration || !zombie.poisonTickInterval) {
      return
    }

    const time = scene.time.now
    poisonUntil = Math.max(poisonUntil, time + zombie.poisonDuration)
    poisonTickDamage = Math.max(poisonTickDamage, zombie.poisonDamage)
    poisonTickInterval = zombie.poisonTickInterval

    if (poisonNextTickAt <= time) {
      poisonNextTickAt = time + poisonTickInterval
    }
  }

  function updatePoison() {
    if (isGameOver) {
      poisonGlow.setAlpha(0)
      return
    }

    const time = scene.time.now
    const isPoisoned = time < poisonUntil

    poisonGlow.setPosition(player.x, player.y + 4)
    poisonGlow.setAlpha(isPoisoned ? 0.1 + Math.sin(time * 0.018) * 0.035 : 0)

    if (!isPoisoned || time < poisonNextTickAt) {
      return
    }

    poisonNextTickAt += poisonTickInterval

    if (player.isDamageImmune?.(time)) {
      return
    }

    gameStore.damagePlayer(poisonTickDamage)
    scene.cameras.main.shake(45, 0.0018)
    soundManager?.play('player-hit')
    upgradeDirector?.handlePlayerDamaged({
      source: 'poison',
      enemy: null,
      damage: poisonTickDamage,
      combat: api,
    })

    if (gameStore.health <= 0) {
      endRun()
    }
  }

  function endRun() {
    if (isGameOver) {
      return
    }

    isGameOver = true
    lifestealCharge = 0
    player.die?.()
    gameStore.finishRun()
    gameStore.setZombiesRemaining(0)
    hud.clearBossTarget()
    hud.flashBanner('OVER RUN', '#fb7185')
    soundManager?.play('player-die')
    soundManager?.play('game-over')
    scene.physics.pause()
    onGameOver?.()
  }

  function flashCombatLight(x, y) {
    combatGlow.setPosition(x, y).setAlpha(0.32).setRadius(118)

    scene.tweens.killTweensOf(combatGlow)
    scene.tweens.add({
      targets: combatGlow,
      alpha: 0.12,
      radius: 96,
      duration: 90,
    })
  }

  function updateVampire() {
    if (isGameOver || gameStore.challengeMode !== 'vampire') {
      return
    }

    if (!['running', 'spawning', 'wave-clear'].includes(gameStore.phase)) {
      return
    }

    const time = scene.time.now
    if (lastVampireTick === 0) lastVampireTick = time
    if (time < lastVampireTick + 3000) {
      return
    }

    lastVampireTick = time
    gameStore.damagePlayer(1)
    scene.cameras.main.shake(20, 0.0015)
    
    if (gameStore.health <= 0) {
      hud.flashBanner('BLED OUT', '#ef4444')
      soundManager?.play('player-hit')
      endRun()
    }
  }

  function update() {
    collisionDirector.update()

    if (!isGameOver) {
      combatGlow.setPosition(player.x, player.y + 8)
    }

    updatePoison()
    updateVampire()
  }

  api = {
    update,
    handleShot,
    handleBossAttack,
    damageZombie,
    damageEnemiesInRadius,
    endRun,
    get isGameOver() {
      return isGameOver
    },
  }

  return api
}
