import Phaser from 'phaser'

import { WEAPON_POOL_CONFIG } from '../config/gameplayConfig'

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet')

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.damage = WEAPON_POOL_CONFIG.bulletDamage
    this.lifetime = WEAPON_POOL_CONFIG.bulletLifetime
    this.spawnedAt = 0
    this.pierceRemaining = 0
    this.ricochetRemaining = 0
    this.ricochetRange = 0
    this.ricochetDamageMultiplier = 0.72
    this.hitTargets = new Set()
    this.setActive(false)
    this.setVisible(false)
    this.disableBody(true, true)
    this.setDepth(26)
  }

  fire(x, y, rotation, time, config = {}) {
    this.enableBody(true, x, y, true, true)
    this.setActive(true)
    this.setVisible(true)
    this.setRotation(rotation)
    this.damage = config.damage ?? WEAPON_POOL_CONFIG.bulletDamage
    this.lifetime = config.lifetime ?? WEAPON_POOL_CONFIG.bulletLifetime
    this.spawnedAt = time
    this.pierceRemaining = Math.max(0, Math.floor(config.pierceCount ?? 0))
    this.ricochetRemaining = Math.max(0, Math.floor(config.ricochetCount ?? 0))
    this.ricochetRange = Math.max(0, Math.floor(config.ricochetRange ?? 0))
    this.ricochetDamageMultiplier = Phaser.Math.Clamp(config.ricochetDamageMultiplier ?? 0.72, 0.2, 1)
    this.hitTargets.clear()
    this.setScale(config.scale ?? 1)

    if (config.tint) {
      this.setTint(config.tint)
    } else {
      this.clearTint()
    }

    this.scene.physics.velocityFromRotation(rotation, config.speed ?? WEAPON_POOL_CONFIG.bulletSpeed, this.body.velocity)
  }

  disableBody(disableGameObject, hideGameObject) {
    this.hitTargets?.clear?.()
    this.pierceRemaining = 0
    this.ricochetRemaining = 0
    this.ricochetRange = 0
    return super.disableBody(disableGameObject, hideGameObject)
  }

  hasHitTarget(target) {
    return this.hitTargets.has(target)
  }

  registerHitTarget(target) {
    this.hitTargets.add(target)
  }

  canPierce() {
    return this.pierceRemaining > 0
  }

  consumePierce() {
    if (this.pierceRemaining > 0) {
      this.pierceRemaining -= 1
    }

    return this.pierceRemaining
  }

  canRicochet() {
    return this.ricochetRemaining > 0 && this.ricochetRange > 0
  }

  continuePast(point, distance = 12) {
    const offsetX = Math.cos(this.rotation) * distance
    const offsetY = Math.sin(this.rotation) * distance
    const velocityX = this.body.velocity.x
    const velocityY = this.body.velocity.y

    this.setPosition(point.x + offsetX, point.y + offsetY)
    this.body.reset(this.x, this.y)
    this.body.velocity.set(velocityX, velocityY)
  }

  redirectTo(target, impactPoint = null) {
    if (!target?.active) {
      return false
    }

    const originX = impactPoint?.x ?? this.x
    const originY = impactPoint?.y ?? this.y
    const angle = Phaser.Math.Angle.Between(originX, originY, target.x, target.y)
    const speed = this.body.velocity.length()

    this.ricochetRemaining = Math.max(0, this.ricochetRemaining - 1)
    this.damage *= this.ricochetDamageMultiplier
    this.setPosition(originX, originY)
    this.setRotation(angle)
    this.body.reset(originX, originY)
    this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity)

    return true
  }

  update(time, delta = this.scene.game.loop.delta) {
    if (this.scene.physics.world.isPaused) {
      this.spawnedAt += delta
      return
    }

    const cam = this.scene.cameras.main.worldView
    if (
      !this.active ||
      time > this.spawnedAt + this.lifetime ||
      this.x < cam.left - 60 ||
      this.x > cam.right + 60 ||
      this.y < cam.top - 60 ||
      this.y > cam.bottom + 60
    ) {
      this.disableBody(true, true)
    }
  }
}
