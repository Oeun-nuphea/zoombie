import Phaser from 'phaser'

import {
  PLAYER_BODY_LOCAL_ORIGIN,
  PLAYER_CARRIED_WEAPON_TEXTURE,
  PLAYER_FRAME_POSES,
  PLAYER_TEXTURE_SIZE,
  PLAYER_WEAPON_SHOULDER_LOCAL,
} from '../config/playerVisualConfig'

// Companion Bot upgrade tiers — unlocked by wave
const BOT_TIERS = [
  {
    wave: 8,
    label: 'BOT ONLINE',
    fireRate: 450,
    bulletDamage: 1,
    scanRange: 480,
    moveSpeed: 240,
    auraColor: 0x4ade80,
    auraAlpha: 0.38,
    tint: null,
  },
  {
    wave: 11,
    label: 'BOT UPGRADED',
    fireRate: 320,
    bulletDamage: 1,
    scanRange: 600,
    moveSpeed: 270,
    auraColor: 0x38bdf8,
    auraAlpha: 0.5,
    tint: 0xbae6fd,
  },
  {
    wave: 14,
    label: 'BOT OVERCLOCKED',
    fireRate: 200,
    bulletDamage: 2,
    scanRange: 760,
    moveSpeed: 300,
    auraColor: 0xa78bfa,
    auraAlpha: 0.65,
    tint: 0xe9d5ff,
  },
]

export default class CompanionBot extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, player) {
    super(scene, x, y, 'player-idle-0')

    this.player = player
    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Make it look like a translucent player ghost
    this.setOrigin(0.46, 0.8)
    this.setScale(0.8)
    this.clearTint()
    this.setAlpha(0.55)
    this.setDepth(20)

    this.carriedWeapon = scene.add.image(x, y, PLAYER_CARRIED_WEAPON_TEXTURE.key)
    this.carriedWeapon.setOrigin(
      PLAYER_CARRIED_WEAPON_TEXTURE.originX / PLAYER_CARRIED_WEAPON_TEXTURE.width,
      PLAYER_CARRIED_WEAPON_TEXTURE.originY / PLAYER_CARRIED_WEAPON_TEXTURE.height,
    )
    this.carriedWeapon.setScale(this.scaleX, this.scaleY)
    this.carriedWeapon.setDepth(this.depth + 1)
    this.carriedWeapon.setAlpha(this.alpha)

    // Aura underneath bot
    this.aura = scene.add.circle(x, y, 40, 0x4ade80, 0.38)
    this.aura.setDepth(19)

    // Core states
    this.lastFiredAt = 0
    this.lastAimAngle = 0
    this.lastScanAt = 0
    this.lastScannedTarget = null
    this.scanInterval = 150
    this.fireRate = BOT_TIERS[0].fireRate
    this.bulletDamage = BOT_TIERS[0].bulletDamage
    this.scanRange = BOT_TIERS[0].scanRange
    this.moveSpeed = BOT_TIERS[0].moveSpeed
    this._currentTierIndex = -1  // forces applyTier on first frame

    this.body.setSize(42, 48)
    this.body.setOffset(42, 52)
    this.setCollideWorldBounds(true)

    this.play('player-idle')
  }

  getGameStore() {
    return this.scene?.gameStore ?? null
  }

  getCurrentTierIndex() {
    const wave = this.getGameStore()?.wave ?? 8
    let tierIndex = 0
    for (let i = BOT_TIERS.length - 1; i >= 0; i--) {
      if (wave >= BOT_TIERS[i].wave) {
        tierIndex = i
        break
      }
    }
    return tierIndex
  }

  applyTier(tierIndex) {
    const tier = BOT_TIERS[tierIndex]
    if (!tier) return

    this.fireRate = tier.fireRate
    this.bulletDamage = tier.bulletDamage
    this.scanRange = tier.scanRange
    this.moveSpeed = tier.moveSpeed

    if (this.aura) {
      this.aura.fillColor = tier.auraColor
      this.aura.fillAlpha = tier.auraAlpha
    }

    if (tier.tint) {
      this.setTint(tier.tint)
      this.carriedWeapon?.setTint(tier.tint)
    } else {
      this.clearTint()
      this.carriedWeapon?.clearTint()
    }

    // Flash a level up banner (only on actual upgrade, not first init)
    if (this._currentTierIndex >= 0 && this.scene?.hud) {
      this.scene.hud.flashBanner(tier.label, '#a78bfa')
    }

    this._currentTierIndex = tierIndex
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    if (this.player.isDead || this.scene.combat?.isGameOver) {
      this.body.setVelocity(0, 0)
      return
    }

    // Auto-upgrade tier based on current wave
    const tierIndex = this.getCurrentTierIndex()
    if (tierIndex !== this._currentTierIndex) {
      this.applyTier(tierIndex)
    }

    // Hover effect
    this.y += Math.sin(time * 0.005) * 0.6

    // Update glowing aura position and pulse effect
    if (this.aura) {
      this.aura.setPosition(this.x, this.y + 14)
      this.aura.setRadius(34 + Math.sin(time * 0.006) * 6)
      this.aura.setAlpha(0.3 + Math.abs(Math.sin(time * 0.003)) * 0.2)
    }

    this.updateMovement()
    this.updateCombat(time)
    this.updateCarriedWeapon()
  }

  updateMovement() {
    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y)
    
    if (distanceToPlayer > 130) {
      // Follow player
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y)
      this.body.setVelocity(
        Math.cos(angleToPlayer) * this.moveSpeed,
        Math.sin(angleToPlayer) * this.moveSpeed
      )
    } else if (distanceToPlayer < 70) {
      // Back away slightly to avoid overlapping completely
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y)
      this.body.setVelocity(
        Math.cos(angleToPlayer + Math.PI) * (this.moveSpeed * 0.6),
        Math.sin(angleToPlayer + Math.PI) * (this.moveSpeed * 0.6)
      )
    } else {
      this.body.setVelocity(0, 0)
    }
    
    if (this.body.velocity.lengthSq() > 0) {
      if (this.body.velocity.x !== 0) {
        this.scaleX = this.body.velocity.x < 0 ? -0.8 : 0.8
      }
      this.play('player-run', true)
    } else {
      this.play('player-idle', true)
    }
  }

  getClosestZombie() {
    const maxRange = this.scanRange ?? 480
    let closestZombie = null
    let closestDistance = maxRange

    this.scene.zombies?.children?.iterate((zombie) => {
      if (!zombie.active || zombie.isDead) return

      const distance = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y)
      if (distance < closestDistance) {
        closestDistance = distance
        closestZombie = zombie
      }
    })

    return closestZombie
  }

  updateCombat(time) {
    // Throttle zombie scan – only refresh target every 150ms
    if (time >= this.lastScanAt + this.scanInterval) {
      this.lastScannedTarget = this.getClosestZombie()
      this.lastScanAt = time
    }

    if (time < this.lastFiredAt + this.fireRate) {
      return
    }

    const target = this.lastScannedTarget
    if (!target?.active || target.isDead) return

    const aimAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
    if (this.body.velocity.lengthSq() === 0) {
      this.scaleX = target.x < this.x ? -0.8 : 0.8
    }

    this.lastAimAngle = aimAngle
    this.fireBullet(time, aimAngle)
    this.lastFiredAt = time
  }

  getCurrentPose() {
    const frameKey = this.anims?.currentFrame?.textureKey ?? this.texture.key
    return PLAYER_FRAME_POSES[frameKey] ?? PLAYER_FRAME_POSES['player-idle-0']
  }

  localToWorld(localX, localY) {
    return {
      x: this.x + (localX - (PLAYER_TEXTURE_SIZE * this.originX)) * this.scaleX,
      y: this.y + (localY - (PLAYER_TEXTURE_SIZE * this.originY)) * this.scaleY,
    }
  }

  getWeaponShoulderPosition(pose = this.getCurrentPose()) {
    const leanCos = Math.cos(pose.torsoLean)
    const leanSin = Math.sin(pose.torsoLean)
    const shoulderOffsetX = (PLAYER_WEAPON_SHOULDER_LOCAL.x * leanCos) - (PLAYER_WEAPON_SHOULDER_LOCAL.y * leanSin)
    const shoulderOffsetY = (PLAYER_WEAPON_SHOULDER_LOCAL.x * leanSin) + (PLAYER_WEAPON_SHOULDER_LOCAL.y * leanCos)

    return this.localToWorld(
      PLAYER_BODY_LOCAL_ORIGIN.x + shoulderOffsetX,
      PLAYER_BODY_LOCAL_ORIGIN.y + pose.bob + shoulderOffsetY,
    )
  }

  getCarriedWeaponTransform(angle = this.lastAimAngle, pose = this.getCurrentPose()) {
    const shoulder = this.getWeaponShoulderPosition(pose)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const kick = pose.gunKick * this.scaleX
    const lift = pose.gunLift * this.scaleY

    return {
      x: shoulder.x + (cos * kick) - (sin * lift),
      y: shoulder.y + (sin * kick) + (cos * lift),
    }
  }

  updateCarriedWeapon() {
    if (!this.carriedWeapon?.active) {
      return
    }

    const angle = this.lastAimAngle
    const transform = this.getCarriedWeaponTransform(angle)

    this.carriedWeapon
      .setPosition(transform.x, transform.y)
      .setRotation(angle)
      .setScale(this.scaleX, this.scaleY)
      .setDepth(Math.sin(angle) < -0.15 ? this.depth - 1 : this.depth + 1)
      .setAlpha(this.alpha)
  }

  getMuzzlePosition(angle) {
    const weaponTransform = this.getCarriedWeaponTransform(angle)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const muzzleOffsetX = PLAYER_CARRIED_WEAPON_TEXTURE.muzzleOffsetX * this.scaleX
    const muzzleOffsetY = PLAYER_CARRIED_WEAPON_TEXTURE.muzzleOffsetY * this.scaleY

    return {
      x: weaponTransform.x + (muzzleOffsetX * cos) - (muzzleOffsetY * sin),
      y: weaponTransform.y + (muzzleOffsetX * sin) + (muzzleOffsetY * cos),
    }
  }

  fireBullet(time, aimAngle) {
    if (!this.scene.bullets) return

    const muzzle = this.getMuzzlePosition(aimAngle)
    const bullet = this.scene.bullets.get(muzzle.x, muzzle.y, 'bullet')
    if (!bullet) return

    // Tint bullets based on current tier
    const tierTints = [0x4ade80, 0x38bdf8, 0xa78bfa]  // green / cyan / purple
    const bulletTint = tierTints[this._currentTierIndex] ?? 0x4ade80

    bullet.fire(muzzle.x, muzzle.y, aimAngle, time, {
      damage: this.bulletDamage ?? 1,
      speed: 820,
      lifetime: 900,
      scale: 1.6,
      tint: bulletTint,
    })
  }

  destroy(fromScene) {
    this.carriedWeapon?.destroy()
    this.aura?.destroy()
    return super.destroy(fromScene)
  }
}
