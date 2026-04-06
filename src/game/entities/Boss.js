import Phaser from 'phaser'

import { HEADSHOT_CONFIG } from '../config/gameplayConfig'

const ATTACK_HOLD_MS = 220

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    const animationType = config.animationType ?? config.typeId ?? 'miniBoss'
    const baseFrameKey = `zombie-${animationType}-idle-0`
    super(scene, x, y, scene.textures.exists(baseFrameKey) ? baseFrameKey : 'zombie-idle-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.typeId = config.typeId
    this.typeName = config.typeName
    this.animationPrefix = `zombie-${animationType}`
    this.health = config.health
    this.maxHealth = config.maxHealth ?? config.health
    this.baseSpeed = config.speed
    this.speed = config.speed
    this.baseContactDamage = config.contactDamage
    this.contactDamage = config.contactDamage
    this.scoreValue = config.scoreValue
    this.attackRange = config.attackRange
    this.damageCooldownMs = config.damageCooldownMs ?? 500
    this.hitStunMs = config.hitStunMs
    this.baseHitStunMs = config.hitStunMs
    this.headshotMultiplier = config.headshotMultiplier ?? HEADSHOT_CONFIG.damageMultiplier
    this.knockbackForceScale = config.knockbackForceScale ?? 1.35
    this.shadowOffsetX = config.shadowOffsetX ?? 8
    this.shadowOffsetY = config.shadowOffsetY ?? 12
    this.hitFlashColor = config.hitFlashColor ?? 0xffb374
    this.headshotFlashColor = config.headshotFlashColor ?? HEADSHOT_CONFIG.headshotFlashColor
    this.auraColor = config.auraColor ?? 0xf97316
    this.hurtRadiusScale = config.hurtRadiusScale ?? 0.28
    this.hurtOffsetYScale = config.hurtOffsetYScale ?? 0.36
    this.bodyHitRadiusScale = config.bodyHitRadiusScale ?? this.hurtRadiusScale
    this.bodyHitOffsetYScale = config.bodyHitOffsetYScale ?? this.hurtOffsetYScale
    this.headHitRadiusScale = config.headHitRadiusScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadRadiusScale, this.bodyHitRadiusScale * 0.62)
    this.headHitOffsetYScale = config.headHitOffsetYScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadOffsetYScale, this.bodyHitOffsetYScale + 0.17)
    this.minHeadHitRadius = config.minHeadHitRadius ?? HEADSHOT_CONFIG.minHeadRadius
    this.minBodyHitRadius = config.minBodyHitRadius ?? HEADSHOT_CONFIG.minBodyRadius
    this.isBoss = true
    this.isMiniBoss = Boolean(config.isMiniBoss)
    this.isFinalBoss = Boolean(config.isFinalBoss)
    this.bossKind = config.bossKind ?? (this.isFinalBoss ? 'final-boss' : 'mini-boss')
    this.bossLabel = config.bossLabel ?? config.typeName ?? 'Boss'
    this.baseBossStatusLabel = config.bossStatusLabel ?? null
    this.bossStatusLabel = this.baseBossStatusLabel
    this.deathBannerText = config.deathBannerText ?? null
    this.bossTier = config.bossTier ?? 0
    this.bossBehavior = config.bossBehavior ?? null
    this.phase = 1
    this.isEnraged = false
    this.phaseSpeedMultiplier = 1
    this.speedModifier = 1
    this.state = 'idle'
    this.isDead = false
    this.attackUntil = 0
    this.hitUntil = 0
    this.aiSuspendUntil = 0
    this.lastDamageAt = -Infinity
    this.lockedUntil = 0
    this.activeAbility = null
    this.chargeUntil = 0
    this.chargeSpeed = 0
    this.chargeVector = new Phaser.Math.Vector2(1, 0)
    this.hitFlashEvent = null
    this.damageHitboxCache = null
    this.movementSeed = Phaser.Math.Between(0, 100000)
    this.shadow = scene.add.ellipse(
      x + this.shadowOffsetX,
      y + this.shadowOffsetY,
      config.shadowWidth ?? 60,
      config.shadowHeight ?? 32,
      config.shadowColor ?? 0x160709,
      config.shadowAlpha ?? 0.36,
    )
    this.aura = scene.add.ellipse(
      x + this.shadowOffsetX,
      y + this.shadowOffsetY + 4,
      (config.shadowWidth ?? 60) * (this.isFinalBoss ? 2.25 : 1.8),
      (config.shadowHeight ?? 32) * (this.isFinalBoss ? 2.45 : 2.05),
      this.auraColor,
      this.isFinalBoss ? 0.24 : 0.2,
    )
    this.aura.setBlendMode(Phaser.BlendModes.ADD).setDepth(4)
    this.shadow.setDepth(5)
    this.setOrigin(0.5, 0.82)
    this.setScale(config.scale ?? (this.isFinalBoss ? 1.96 : 1.58))
    this.body.setSize(config.bodyWidth ?? 62, config.bodyHeight ?? 72)
    this.body.setOffset(config.bodyOffsetX ?? 33, config.bodyOffsetY ?? 44)
    this.setDepth(18)
    this.setCollideWorldBounds(true)
    this.shadow.setScale(this.scaleX, this.scaleY)
    this.play(this.getAnimationKey('idle'))
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)
  }

  getPhysicsBounds() {
    return {
      x: this.body.x,
      y: this.body.y,
      width: this.body.width,
      height: this.body.height,
    }
  }

  buildBodyHitbox() {
    const physicsBounds = this.getPhysicsBounds()
    const centerY = this.y - this.displayHeight * this.bodyHitOffsetYScale
    const radius = Math.max(
      this.minBodyHitRadius,
      this.displayWidth * this.bodyHitRadiusScale,
      physicsBounds.width * 0.58,
    )
    const x = physicsBounds.x + physicsBounds.width * 0.5
    const topY = Math.min(centerY, physicsBounds.y + radius * 0.52)
    const bottomY = Math.max(centerY, physicsBounds.y + physicsBounds.height - radius * 0.34)
    const rectHeight = Math.max(0, bottomY - topY)

    return {
      type: 'capsule',
      x,
      radius,
      topY,
      bottomY,
      centerY: (topY + bottomY) * 0.5,
      topCircle: {
        x,
        y: topY,
        radius,
      },
      bottomCircle: {
        x,
        y: bottomY,
        radius,
      },
      rect: {
        left: x - radius,
        right: x + radius,
        top: topY,
        bottom: bottomY,
        width: radius * 2,
        height: rectHeight,
      },
    }
  }

  getDamageHitboxes() {
    if (
      this.damageHitboxCache
      && this.damageHitboxCache.x === this.x
      && this.damageHitboxCache.y === this.y
      && this.damageHitboxCache.width === this.displayWidth
      && this.damageHitboxCache.height === this.displayHeight
    ) {
      return this.damageHitboxCache.value
    }

    const body = this.buildBodyHitbox()
    const head = {
      x: this.x,
      y: this.y - this.displayHeight * this.headHitOffsetYScale,
      radius: Math.max(this.minHeadHitRadius, this.displayWidth * this.headHitRadiusScale),
    }
    const bodyHull = {
      x: body.x,
      y: body.centerY,
      radius: body.radius + Math.max(0, body.bottomY - body.topY) * 0.5,
    }
    const hull = {
      x: (bodyHull.x + head.x) * 0.5,
      y: (bodyHull.y + head.y) * 0.5,
      radius: Math.max(
        Phaser.Math.Distance.Between((bodyHull.x + head.x) * 0.5, (bodyHull.y + head.y) * 0.5, bodyHull.x, bodyHull.y) + bodyHull.radius,
        Phaser.Math.Distance.Between((bodyHull.x + head.x) * 0.5, (bodyHull.y + head.y) * 0.5, head.x, head.y) + head.radius,
      ),
    }

    this.damageHitboxCache = {
      x: this.x,
      y: this.y,
      width: this.displayWidth,
      height: this.displayHeight,
      value: {
        head,
        body,
        hull,
      },
    }

    return this.damageHitboxCache.value
  }

  getHeadHitCircle() {
    return this.getDamageHitboxes().head
  }

  getBodyHitCircle() {
    return this.getDamageHitboxes().body
  }

  getDamageHullCircle() {
    return this.getDamageHitboxes().hull
  }

  getHurtCircle() {
    return this.getDamageHullCircle()
  }

  canDamagePlayer(time) {
    return !this.isDead && time >= this.lastDamageAt + this.damageCooldownMs
  }

  markDamageDealt(time) {
    this.lastDamageAt = time
    this.attack(time)
  }

  isAiSuspended(time = this.scene.time.now) {
    return time < this.aiSuspendUntil
  }

  suspendAi(durationMs) {
    this.aiSuspendUntil = Math.max(this.aiSuspendUntil, this.scene.time.now + durationMs)
    this.lockedUntil = Math.max(this.lockedUntil, this.aiSuspendUntil)
    return this.aiSuspendUntil
  }

  clearAiSuspend() {
    this.aiSuspendUntil = 0
  }

  isLocked(time = this.scene.time.now) {
    return time < this.lockedUntil
  }

  beginWindup(abilityId, durationMs) {
    this.activeAbility = abilityId
    this.lockedUntil = Math.max(this.lockedUntil, this.scene.time.now + durationMs)
    this.attack(this.scene.time.now)
    this.body.stop()
  }

  beginCharge(direction, config = {}) {
    const normalized = new Phaser.Math.Vector2(direction.x, direction.y)

    if (normalized.lengthSq() <= 0.0001) {
      normalized.set(1, 0)
    }

    normalized.normalize()
    this.activeAbility = 'charge'
    this.chargeVector.copy(normalized)
    this.chargeSpeed = config.speed ?? 520
    this.chargeUntil = this.scene.time.now + (config.durationMs ?? 380)
    this.lockedUntil = this.chargeUntil
    this.attackUntil = this.chargeUntil
    this.setFlipX(normalized.x < 0)
    this.playLoop('attack')
  }

  stopActiveAbility() {
    const wasCharging = this.activeAbility === 'charge'

    this.activeAbility = null
    this.chargeUntil = 0
    this.chargeSpeed = 0

    if (wasCharging) {
      this.body.stop()
    }

    if (!this.isDead) {
      this.resumeMovementState()
    }
  }

  isCharging(time = this.scene.time.now) {
    return this.activeAbility === 'charge' && time < this.chargeUntil
  }

  setSpeedModifier(multiplier = 1) {
    this.speedModifier = Phaser.Math.Clamp(Number(multiplier) || 1, 0.2, 1.4)
  }

  getMoveSpeed() {
    return Math.max(18, this.baseSpeed * this.phaseSpeedMultiplier * (this.speedModifier ?? 1))
  }

  enterPhaseTwo(config = {}) {
    if (this.phase >= 2) {
      return false
    }

    this.phase = 2
    this.isEnraged = true
    this.phaseSpeedMultiplier = Math.max(this.phaseSpeedMultiplier, config.phaseTwoSpeedMultiplier ?? 1.2)
    this.contactDamage = this.baseContactDamage + Math.max(0, config.phaseTwoDamageBonus ?? 1)
    this.hitStunMs = Math.max(26, Math.round(this.baseHitStunMs * (config.phaseTwoHitStunScale ?? 0.8)))
    this.bossStatusLabel = config.phaseTwoStatusLabel ?? this.baseBossStatusLabel
    const scaleMultiplier = Phaser.Math.Clamp(config.phaseTwoScaleMultiplier ?? 1.03, 1, 1.12)

    this.setScale(this.scaleX * scaleMultiplier, this.scaleY * scaleMultiplier)
    this.shadow?.setScale(this.scaleX, this.scaleY)
    this.aura?.setFillStyle(this.isFinalBoss ? 0xef4444 : 0xf97316, this.isFinalBoss ? 0.28 : 0.24)
    this.applyHitFlash(0xfca5a5)

    return true
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)
    this.shadow?.setPosition(this.x + this.shadowOffsetX, this.y + this.shadowOffsetY)
    this.aura?.setPosition(this.x + this.shadowOffsetX, this.y + this.shadowOffsetY + 4)

    if (this.aura) {
      const pulseBase = this.isEnraged ? 0.94 : 0.88
      const pulseRange = this.isEnraged ? 0.12 : 0.08
      const pulse = pulseBase + Math.sin((time + this.movementSeed) * (this.isEnraged ? 0.01 : 0.007)) * pulseRange
      this.aura.setScale(pulse)
      this.aura.setAlpha(this.isDead ? 0.05 : (this.isEnraged ? 0.16 : 0.12) + Math.sin((time + this.movementSeed) * 0.012) * 0.04)
    }

    if (this.isDead) {
      return
    }

    if (this.isCharging(time)) {
      this.body.velocity.set(this.chargeVector.x * this.chargeSpeed, this.chargeVector.y * this.chargeSpeed)
      this.playLoop('attack')
      return
    }

    if (this.activeAbility === 'charge' && time >= this.chargeUntil) {
      this.stopActiveAbility()
    }

    if (this.activeAbility && time >= this.lockedUntil) {
      this.stopActiveAbility()
    }

    if (time >= this.attackUntil && this.state === 'attack' && !this.activeAbility) {
      this.resumeMovementState()
    }
  }

  chase(target) {
    if (this.isDead) {
      return
    }

    const time = this.scene.time.now

    if (this.isCharging(time)) {
      this.setFlipX(this.chargeVector.x < 0)
      return
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
    const toTarget = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y)

    if (toTarget.lengthSq() > 0.0001) {
      toTarget.normalize()
    } else {
      toTarget.set(1, 0)
    }

    const orbitMagnitude = Math.sin((time + this.movementSeed) * 0.0038) * Math.min(40, Math.max(14, distance * 0.08))
    const spacing = Math.min(64, Math.max(28, this.attackRange * 0.36))
    const steerX = target.x - toTarget.x * spacing - toTarget.y * orbitMagnitude
    const steerY = target.y - toTarget.y * spacing + toTarget.x * orbitMagnitude

    this.setFlipX(target.x < this.x)

    if (this.isAiSuspended(time) || this.isLocked(time)) {
      this.setVelocity(this.body.velocity.x * 0.74, this.body.velocity.y * 0.74)

      if (this.state !== 'attack') {
        this.playLoop('idle')
      }

      return
    }

    if (time < this.hitUntil) {
      this.setVelocity(this.body.velocity.x * 0.9, this.body.velocity.y * 0.9)
      return
    }

    if (distance <= this.attackRange * 0.92) {
      this.attack(time)
      this.setVelocity(this.body.velocity.x * 0.6, this.body.velocity.y * 0.6)
      return
    }

    this.scene.physics.moveTo(this, steerX, steerY, this.getMoveSpeed())
    this.playLoop('walk')
  }

  takeDamage(amount = 1, options = {}) {
    if (this.isDead) {
      return {
        isDead: true,
        damageTaken: 0,
        health: this.health,
        hitZone: options.hitZone ?? 'body',
        isHeadshot: Boolean(options.isHeadshot),
      }
    }

    const damageTaken = Math.min(this.health, amount)
    this.health -= amount

    if (this.health <= 0) {
      this.health = 0
      return {
        isDead: true,
        damageTaken,
        health: this.health,
        hitZone: options.hitZone ?? 'body',
        isHeadshot: Boolean(options.isHeadshot),
        impactPoint: options.impactPoint ?? null,
      }
    }

    this.hitUntil = this.scene.time.now + this.hitStunMs
    const impactBrake = this.isCharging() ? 0.82 : 0.55
    this.setVelocity(this.body.velocity.x * impactBrake, this.body.velocity.y * impactBrake)
    this.applyHitFlash(options.isHeadshot ? this.headshotFlashColor : this.hitFlashColor)
    this.playOnce('hit')

    return {
      isDead: false,
      damageTaken,
      health: this.health,
      hitZone: options.hitZone ?? 'body',
      isHeadshot: Boolean(options.isHeadshot),
      impactPoint: options.impactPoint ?? null,
    }
  }

  attack(time = this.scene.time.now) {
    if (this.isDead || time < this.hitUntil) {
      return
    }

    this.attackUntil = Math.max(this.attackUntil, time + ATTACK_HOLD_MS)
    this.playLoop('attack')
  }

  die() {
    if (this.isDead) {
      return
    }

    this.isDead = true
    this.state = 'dead'
    this.hitUntil = 0
    this.attackUntil = 0
    this.aiSuspendUntil = 0
    this.lockedUntil = 0
    this.chargeUntil = 0
    this.activeAbility = null

    this.scene.zombies?.remove(this, false, false)
    this.body.stop()
    this.body.enable = false
    this.play(this.getAnimationKey('death'), true)

    this.scene.tweens.add({
      targets: this.shadow,
      alpha: 0.04,
      scaleX: this.scaleX * 0.8,
      scaleY: this.scaleY * 0.8,
      duration: 320,
      ease: 'Quad.easeOut',
    })

    this.scene.tweens.add({
      targets: this.aura,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 420,
      ease: 'Quad.easeOut',
    })
  }

  handleAnimationComplete(animation) {
    if (animation.key === this.getAnimationKey('hit') && !this.isDead) {
      this.resumeMovementState()
      return
    }

    if (animation.key === this.getAnimationKey('death')) {
      this.destroy()
    }
  }

  resumeMovementState() {
    if (this.isDead) {
      return
    }

    if (this.body.velocity.lengthSq() > 20) {
      this.playLoop('walk')
      return
    }

    this.playLoop('idle')
  }

  getAnimationKey(state) {
    return `${this.animationPrefix}-${state}`
  }

  playLoop(state) {
    const animationKey = this.getAnimationKey(state)

    if (this.state === state && this.anims.currentAnim?.key === animationKey && this.anims.isPlaying) {
      return
    }

    this.state = state
    this.play(animationKey, true)
  }

  playOnce(state) {
    this.state = state
    this.play(this.getAnimationKey(state), true)
  }

  applyHitFlash(color = this.hitFlashColor) {
    this.setTintFill(color)
    this.aura?.setAlpha(this.isEnraged ? 0.3 : 0.24)
    this.hitFlashEvent?.remove(false)
    this.hitFlashEvent = this.scene.time.delayedCall(90, () => {
      this.clearTint()
      this.hitFlashEvent = null
    })
  }

  destroy(fromScene) {
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)
    this.hitFlashEvent?.remove(false)
    this.aura?.destroy()
    this.shadow?.destroy()
    return super.destroy(fromScene)
  }
}
