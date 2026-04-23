import Phaser from 'phaser'

import {
  DEFAULT_WEAPON_ID,
  getWeaponChoices,
  getWeaponDefinition,
  resolveWeaponAmmo,
} from '../config/weapons'
import { getActiveBulletTint } from '../config/playerVisualConfig'

export function createWeaponDirector(scene, config) {
  const { player, bullets, gameStore, upgradeDirector } = config
  let currentWeaponId = gameStore.weaponId ?? DEFAULT_WEAPON_ID
  let currentUpgradeDirector = upgradeDirector ?? null

  function getPelletAngles(aimAngle, weapon, bonusBullets) {
    const totalPellets = Math.max(1, weapon.pellets + bonusBullets)

    if (totalPellets === 1) {
      return [aimAngle]
    }

    const bonusSpread = bonusBullets > 0 ? 0.05 * bonusBullets : 0
    const totalSpread = weapon.spread + bonusSpread
    const jitterAmount = Math.min(0.018, totalSpread * 0.2)

    return Array.from({ length: totalPellets }, (_entry, index) => {
      const ratio = totalPellets === 1 ? 0.5 : index / (totalPellets - 1)
      const spreadOffset = Phaser.Math.Linear(-totalSpread, totalSpread, ratio)
      const jitter = Phaser.Math.FloatBetween(-jitterAmount, jitterAmount)
      return aimAngle + spreadOffset + jitter
    })
  }

  function getCurrentWeapon() {
    return getWeaponDefinition(currentWeaponId)
  }

  function resolveAmmoState(weaponId, options = {}) {
    if (Number.isFinite(options.ammo)) {
      return {
        ammo: Math.max(0, Math.floor(options.ammo)),
        maxAmmo: Number.isFinite(options.maxAmmo) ? Math.max(0, Math.floor(options.maxAmmo)) : Math.max(0, Math.floor(options.ammo)),
      }
    }

    return resolveWeaponAmmo(
      weaponId,
      options.source ?? 'loadout',
      (minAmmo, maxAmmo) => Phaser.Math.Between(minAmmo, maxAmmo),
    )
  }

  function setWeapon(weaponId, options = {}) {
    const nextWeapon = getWeaponDefinition(weaponId)
    const ammoState = resolveAmmoState(nextWeapon.id, options)
    currentWeaponId = nextWeapon.id
    gameStore.equipWeapon(nextWeapon.id, ammoState.ammo, ammoState.maxAmmo)

    return getCurrentWeapon()
  }

  function getSelectionChoices() {
    return getWeaponChoices()
  }

  function consumeWeaponAmmo(weapon) {
    if (weapon.infiniteAmmo) {
      return {
        ammo: null,
        ammoMax: null,
        depleted: false,
        autoSwapWeapon: null,
      }
    }

    const ammoState = gameStore.consumeWeaponAmmo(1)

    return {
      ...ammoState,
      autoSwapWeapon: null,
    }
  }

  function restoreAmmo(amount = 1) {
    const weapon = getCurrentWeapon()

    if (weapon.infiniteAmmo) {
      return {
        ammo: null,
        ammoMax: null,
        restored: 0,
      }
    }

    return gameStore.restoreWeaponAmmo(amount)
  }

  function fire(pointer, time) {
    const weapon = getCurrentWeapon()
    const playerStats = player.getCombatStats?.() ?? {
      damage: 1,
      fireRate: 1,
      bulletCount: 0,
    }

    if (!weapon.infiniteAmmo && (!Number.isFinite(gameStore.weaponAmmo) || gameStore.weaponAmmo <= 0)) {
      const fallbackWeapon = setWeapon(DEFAULT_WEAPON_ID, { source: 'fallback' })

      return {
        autoSwapWeapon: fallbackWeapon,
        pelletsFired: 0,
      }
    }

    if (!player.canFire(time, player.getFireInterval?.(weapon.fireRate) ?? weapon.fireRate)) {
      return null
    }

    const aimAngle = player.getAimAngle(pointer)
    const muzzle = player.getMuzzlePosition(aimAngle)
    const pelletAngles = getPelletAngles(aimAngle, weapon, playerStats.bulletCount ?? 0)
    const bulletUpgradeConfig = currentUpgradeDirector?.getBulletConfig({
      weapon,
      playerStats,
    }) ?? {}
    let pelletsFired = 0

    for (const pelletAngle of pelletAngles) {
      const bullet = bullets.get(muzzle.x, muzzle.y, 'bullet')

      if (!bullet) {
        continue
      }

      // Override bullet tint with gun skin colour (unless the bullet upgrade config is already forcing a custom tint)
      const skinId = gameStore.selectedGunSkin ?? 'standard'
      const skinTint = skinId !== 'standard' ? getActiveBulletTint(skinId) : weapon.bulletTint

      bullet.fire(muzzle.x, muzzle.y, pelletAngle, time, {
        damage: weapon.damage * (playerStats.damage ?? 1),
        speed: weapon.bulletSpeed,
        lifetime: weapon.bulletLifetime,
        scale: weapon.bulletScale,
        tint: bulletUpgradeConfig.tint ?? skinTint,
        ...bulletUpgradeConfig,
      })
      pelletsFired += 1
    }

    if (!pelletsFired) {
      return null
    }

    player.triggerShot(time, aimAngle)
    const ammoState = consumeWeaponAmmo(weapon)

    return {
      x: muzzle.x,
      y: muzzle.y,
      rotation: aimAngle,
      weapon,
      playerStats,
      pelletsFired,
      ammoState,
      autoSwapWeapon: ammoState.autoSwapWeapon,
    }
  }

  setWeapon(currentWeaponId, {
    ammo: gameStore.weaponAmmo,
    maxAmmo: gameStore.weaponAmmoMax,
  })

  return {
    fire,
    setWeapon,
    getCurrentWeapon,
    getSelectionChoices,
    restoreAmmo,
    setUpgradeDirector(nextUpgradeDirector) {
      currentUpgradeDirector = nextUpgradeDirector ?? null
    },
  }
}
