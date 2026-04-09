import Phaser from 'phaser'

import { MINI_BOSS_REWARD_CONFIG } from '../config/gameplayConfig'
import {
  DROP_SYSTEM_CONFIG,
  HEALTH_DROP_CONFIG,
  getHealthDropDefinition,
  getHealthDropTextureKey,
} from '../config/dropItems'
import {
  WEAPON_DROP_CONFIG,
  getWeaponDefinition,
  getWeaponDropTable,
  getWeaponDropTextureKey,
  resolveWeaponAmmo,
} from '../config/weapons'

function pickWeightedWeapon(table) {
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0)

  if (!totalWeight) {
    return null
  }

  let roll = Phaser.Math.Between(1, totalWeight)

  for (const entry of table) {
    roll -= entry.weight

    if (roll <= 0) {
      return entry.id
    }
  }

  return table[0]?.id ?? null
}

function createPickupBurst(scene, x, y, color) {
  const ring = scene.add.circle(x, y, 12, color, 0.26)
  ring.setStrokeStyle(2, color, 0.6).setDepth(32)

  scene.tweens.add({
    targets: ring,
    radius: 38,
    alpha: 0,
    duration: 240,
    onComplete: () => ring.destroy(),
  })
}

export function createDropDirector(scene, config) {
  const { player, weaponDirector, gameStore, hud, soundManager } = config
  const drops = scene.physics.add.group()

  scene.physics.add.overlap(player, drops, (_playerSprite, drop) => {
    pickupDrop(drop)
  })

  function trimDropOverflow() {
    const activeDrops = drops
      .getChildren()
      .filter((drop) => drop?.active)
      .sort((left, right) => (left.spawnedAt ?? 0) - (right.spawnedAt ?? 0))

    while (activeDrops.length >= DROP_SYSTEM_CONFIG.maxActiveItems) {
      const oldestDrop = activeDrops.shift()
      destroyDrop(oldestDrop)
    }
  }

  function destroyDrop(drop) {
    if (!drop) {
      return
    }

    drop.expireEvent?.remove(false)
    drop.hoverTween?.stop()
    drop.glowTween?.stop()
    drop.glow?.destroy()
    drop.timerGraphics?.destroy()
    drops.remove(drop, false, false)
    drop.destroy()
  }

  function expireDrop(drop) {
    if (!drop?.active) {
      return
    }

    const targets = [drop]

    if (drop.glow?.active) {
      targets.push(drop.glow)
    }

    if (drop.timerGraphics?.active) {
      targets.push(drop.timerGraphics)
    }

    scene.tweens.add({
      targets,
      alpha: 0,
      scaleX: 0.6,
      scaleY: 0.6,
      duration: 180,
      onComplete: () => destroyDrop(drop),
    })
  }

  function spawnDrop(config) {
    trimDropOverflow()

    const {
      x,
      y,
      textureKey,
      glowColor,
      lifetimeMs,
      scale = 1,
      itemType,
      itemId,
      data = {},
    } = config
    const glow = scene.add.circle(x, y + 2, 28, glowColor ?? 0xf8fafc, 0.14)
    glow.setBlendMode(Phaser.BlendModes.ADD).setDepth(13)

    const drop = scene.physics.add.sprite(x, y, textureKey)
    drop.setDepth(14)
    drop.setScale(scale)
    drop.setImmovable(true)
    drop.body.setAllowGravity(false)
    drop.body.setSize(24, 24)
    drop.setDataEnabled()
    drop.setData('itemType', itemType)
    drop.setData('itemId', itemId)
    Object.entries(data).forEach(([key, value]) => {
      drop.setData(key, value)
    })
    
    const timerGraphics = scene.add.graphics()
    timerGraphics.setDepth(15)

    drop.glow = glow
    drop.glowColor = glowColor ?? 0xf8fafc
    drop.timerGraphics = timerGraphics
    drop.lifetimeMs = lifetimeMs
    drop.spawnedAt = scene.time.now
    drop.hoverTween = scene.tweens.add({
      targets: [drop, glow],
      y: '-=5',
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    drop.glowTween = scene.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.28 },
      scaleX: { from: 0.95, to: 1.08 },
      scaleY: { from: 0.95, to: 1.08 },
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    drop.expireEvent = scene.time.delayedCall(lifetimeMs, () => {
      expireDrop(drop)
    })
    drops.add(drop)

    return drop
  }

  function maybeSpawnHealthDrop(zombie) {
    const roll = Math.random()
    let healthDropId = null

    if (roll <= HEALTH_DROP_CONFIG.bigChance) {
      healthDropId = 'big'
    } else if (roll <= HEALTH_DROP_CONFIG.bigChance + HEALTH_DROP_CONFIG.smallChance) {
      healthDropId = 'small'
    }

    if (!healthDropId) {
      return null
    }

    const healthDrop = getHealthDropDefinition(healthDropId)

    return spawnHealthDrop(healthDrop.id, zombie.x + Phaser.Math.Between(-6, 6), zombie.y + Phaser.Math.Between(-6, 6))
  }

  function maybeSpawnDrop(zombie) {
    if (gameStore.challengeMode === 'pistolOnly') {
      return null
    }

    if (Math.random() > WEAPON_DROP_CONFIG.baseDropChance) {
      return null
    }

    const weaponId = pickWeightedWeapon(getWeaponDropTable())

    if (!weaponId) {
      return null
    }

    const ammoState = resolveWeaponAmmo(
      weaponId,
      'drop',
      (minAmmo, maxAmmo) => Phaser.Math.Between(minAmmo, maxAmmo),
    )

    const weapon = getWeaponDefinition(weaponId)

    return spawnDrop({
      x: zombie.x,
      y: zombie.y,
      textureKey: getWeaponDropTextureKey(weaponId),
      glowColor: weapon.dropColor ?? 0xf8fafc,
      lifetimeMs: WEAPON_DROP_CONFIG.lifetimeMs,
      scale: 1,
      itemType: 'weapon',
      itemId: weaponId,
      data: {
        weaponId,
        ammo: ammoState.ammo,
        maxAmmo: ammoState.maxAmmo,
      },
    })
  }

  function maybeSpawnDrops(zombie) {
    maybeSpawnHealthDrop(zombie)
    maybeSpawnDrop(zombie)
  }

  function spawnHealthDrop(healthDropId, x, y, overrides = {}) {
    const healthDrop = getHealthDropDefinition(healthDropId)

    return spawnDrop({
      x,
      y,
      textureKey: getHealthDropTextureKey(healthDrop.id),
      glowColor: healthDrop.glowColor,
      lifetimeMs: overrides.lifetimeMs ?? healthDrop.lifetimeMs,
      scale: overrides.scale ?? healthDrop.scale,
      itemType: 'health',
      itemId: healthDrop.id,
    })
  }

  function spawnBossReward(zombie) {
    const healthRatio = gameStore.health / Math.max(1, gameStore.maxPlayerHealth)
    const rewardX = zombie.x + Phaser.Math.Between(-10, 10)
    const rewardY = zombie.y + Phaser.Math.Between(-10, 10)

    const shouldDropFullRecovery = (
      healthRatio <= MINI_BOSS_REWARD_CONFIG.fullHealThreshold
      && Math.random() <= MINI_BOSS_REWARD_CONFIG.fullHealChanceWhenLow
    ) || Math.random() <= MINI_BOSS_REWARD_CONFIG.fullHealChanceBase

    return spawnHealthDrop(shouldDropFullRecovery ? 'full' : 'large', rewardX, rewardY, {
      lifetimeMs: MINI_BOSS_REWARD_CONFIG.rewardLifetimeMs,
      scale: shouldDropFullRecovery ? 1.16 : 1.12,
    })
  }

  function handleZombieDefeat(zombie) {
    if (zombie?.isBoss && !zombie?.isFinalBoss) {
      spawnBossReward(zombie)
      return
    }

    maybeSpawnDrops(zombie)
  }

  function pickupHealthDrop(drop) {
    if (gameStore.health >= gameStore.maxPlayerHealth) {
      return false
    }

    const healthDrop = getHealthDropDefinition(drop.getData('itemId'))

    if (healthDrop.restoreMode === 'full') {
      gameStore.restoreFullHealth()
    } else {
      gameStore.healPlayer(healthDrop.restoreAmount ?? 1)
    }

    hud.flashBanner(healthDrop.pickupText, healthDrop.bannerColor)
    createPickupBurst(scene, drop.x, drop.y, healthDrop.glowColor)
    soundManager?.play('heal')
    destroyDrop(drop)

    return true
  }

  function pickupDrop(drop) {
    if (!drop?.active || !['running', 'spawning', 'wave-clear'].includes(gameStore.phase)) {
      return
    }

    if (drop.getData('itemType') === 'health') {
      pickupHealthDrop(drop)
      return
    }

    const weaponId = drop.getData('weaponId')
    const ammo = drop.getData('ammo')
    const maxAmmo = drop.getData('maxAmmo')
    const prevAmmo = gameStore.weaponAmmo
    const weapon = weaponDirector.setWeapon(weaponId, {
      source: 'drop',
      ammo,
      maxAmmo,
    })

    const newAmmoLabel = Number.isFinite(ammo) ? ` • ${ammo}/${maxAmmo} rounds` : ''
    const oldAmmoLabel = Number.isFinite(prevAmmo) ? ` (had ${prevAmmo})` : ''
    hud.flashBanner(`${weapon.name.toUpperCase()} PICKED${newAmmoLabel}${oldAmmoLabel}`, '#bef264')
    createPickupBurst(scene, drop.x, drop.y, weapon.dropColor ?? 0xf8fafc)
    soundManager?.play('pickup')
    destroyDrop(drop)
  }

  function clear() {
    drops.getChildren().slice().forEach((drop) => destroyDrop(drop))
  }

  function update(time) {
    drops.children.iterate((drop) => {
      if (!drop?.active || !drop.timerGraphics) return
      
      drop.timerGraphics.clear()
      
      const elapsed = time - drop.spawnedAt
      const remaining = drop.lifetimeMs - elapsed
      
      if (remaining <= 0) return
      
      const progress = Math.max(0, remaining / drop.lifetimeMs)
      const radius = Math.max(14, (drop.displayWidth * 0.5) + 6)
      
      drop.timerGraphics.lineStyle(3, drop.glowColor, 0.75)
      drop.timerGraphics.beginPath()
      drop.timerGraphics.arc(
        drop.x, 
        drop.y, 
        radius, 
        Phaser.Math.DegToRad(-90), 
        Phaser.Math.DegToRad(-90 + 360 * progress), 
        false
      )
      drop.timerGraphics.strokePath()
    })
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, clear)

  return {
    clear,
    update,
    handleZombieDefeat,
    maybeSpawnDrops,
    maybeSpawnHealthDrop,
    maybeSpawnDrop,
    spawnBossReward,
  }
}
