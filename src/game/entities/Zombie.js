import Phaser from 'phaser'

import { HEADSHOT_CONFIG } from '../config/gameplayConfig'

const ATTACK_HOLD_MS = 180

export default class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    const animationType = config.animationType ?? config.typeId ?? 'walker'
    const baseFrameKey = `zombie-${animationType}-idle-0`
    super(scene, x, y, scene.textures.exists(baseFrameKey) ? baseFrameKey : 'zombie-idle-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.typeId = config.typeId
    this.typeName = config.typeName
    this.animationPrefix = `zombie-${animationType}`
    this.health = config.health
    this.maxHealth = config.maxHealth ?? config.health
    this.speed = config.speed
    this.contactDamage = config.contactDamage
    this.scoreValue = config.scoreValue
    this.attackRange = config.attackRange
    this.damageCooldownMs = config.damageCooldownMs ?? 500
    this.hitStunMs = config.hitStunMs
    this.wobbleAmount = config.wobbleAmount
    this.wobbleSpeed = config.wobbleSpeed
    this.wobbleSeed = Phaser.Math.Between(0, 100000)
    this.poisonDamage = config.poisonDamage ?? 0
    this.poisonDuration = config.poisonDuration ?? 0
    this.poisonTickInterval = config.poisonTickInterval ?? 0
    this.hurtRadiusScale = config.hurtRadiusScale ?? 0.22
    this.hurtOffsetYScale = config.hurtOffsetYScale ?? 0.42
    this.bodyHitRadiusScale = config.bodyHitRadiusScale ?? this.hurtRadiusScale
    this.bodyHitOffsetYScale = config.bodyHitOffsetYScale ?? this.hurtOffsetYScale
    this.headHitRadiusScale = config.headHitRadiusScale ?? HEADSHOT_CONFIG.defaultHeadRadiusScale
    this.headHitOffsetYScale = config.headHitOffsetYScale ?? HEADSHOT_CONFIG.defaultHeadOffsetYScale
    this.minHeadHitRadius = config.minHeadHitRadius ?? HEADSHOT_CONFIG.minHeadRadius
    this.minBodyHitRadius = config.minBodyHitRadius ?? HEADSHOT_CONFIG.minBodyRadius
    this.headshotMultiplier = config.headshotMultiplier ?? HEADSHOT_CONFIG.damageMultiplier
    this.shadowOffsetX = config.shadowOffsetX ?? 6
    this.shadowOffsetY = config.shadowOffsetY ?? 8
    this.hitFlashColor = config.hitFlashColor ?? 0xffd8aa
    this.headshotFlashColor = config.headshotFlashColor ?? HEADSHOT_CONFIG.headshotFlashColor
    this.auraColor = config.auraColor ?? 0xff8f66
    this.isBoss = Boolean(config.isBoss)
    this.isMiniBoss = Boolean(config.isMiniBoss)
    this.isFinalBoss = Boolean(config.isFinalBoss)
    this.bossKind = config.bossKind ?? null
    this.bossLabel = config.bossLabel ?? config.typeName
    this.bossStatusLabel = config.bossStatusLabel ?? null
    this.deathBannerText = config.deathBannerText ?? null
    this.bossTier = config.bossTier ?? 0
    this.knockbackForceScale = config.knockbackForceScale ?? 1
    // Boomer-style explosive flags
    this.explodes = config.explodes ?? false
    this.explosionRadius = config.explosionRadius ?? 160
    this.explosionDamage = config.explosionDamage ?? 2
    this.explosionKnockback = config.explosionKnockback ?? 800
    this.explosionKnockback = config.explosionKnockback ?? 800
    this.acidPoolDurationMs = config.acidPoolDurationMs ?? 2500
    // Shield zombie flags
    this.shielded = config.shielded ?? false
    // Leaper flags
    this.leaps = config.leaps ?? false
    this.leapRangeMin = config.leapRangeMin
    this.leapRangeMax = config.leapRangeMax
    this.leapCooldownMs = config.leapCooldownMs
    this.leapDurationMs = config.leapDurationMs
    this.leapSpeed = config.leapSpeed
    this.nextLeapAt = 0
    this.isLeaping = false
    this.leapUntil = 0
    this.leapVector = new Phaser.Math.Vector2()
    // Spitter flags
    this.spits = config.spits ?? false
    this.spitRangeMin = config.spitRangeMin
    this.spitRangeMax = config.spitRangeMax
    this.spitCooldownMs = config.spitCooldownMs
    this.spitSpeed = config.spitSpeed
    this.spitDamage = config.spitDamage
    this.spitLifetimeMs = config.spitLifetimeMs
    this.nextSpitAt = 0

    this.facingAngle = 0  // updated every frame as zombie chases player
    this.speedModifier = 1
    this.state = 'idle'
    this.isDead = false
    this.attackUntil = 0
    this.hitUntil = 0
    this.aiSuspendUntil = 0
    this.lastDamageAt = -Infinity
    this.hitFlashEvent = null
    this.damageHitboxCache = null
    this.shadow = scene.add.ellipse(
      x + this.shadowOffsetX,
      y + this.shadowOffsetY,
      config.shadowWidth ?? 34,
      config.shadowHeight ?? 18,
      config.shadowColor ?? 0x000000,
      config.shadowAlpha ?? 0.24,
    )
    this.aura = this.isBoss
      ? scene.add.ellipse(
          x + this.shadowOffsetX,
          y + this.shadowOffsetY + 4,
          (config.shadowWidth ?? 34) * (this.isFinalBoss ? 1.9 : 1.45),
          (config.shadowHeight ?? 18) * (this.isFinalBoss ? 2.15 : 1.7),
          this.auraColor,
          this.isFinalBoss ? 0.22 : 0.18,
        )
      : null
    this.aura?.setBlendMode(Phaser.BlendModes.ADD).setDepth(4)
    this.shadow.setDepth(5)
    this.setOrigin(0.5, 0.82)
    this.setScale(config.scale ?? 0.82)
    this.body.setSize(config.bodyWidth ?? 36, config.bodyHeight ?? 44)
    this.body.setOffset(config.bodyOffsetX ?? 46, config.bodyOffsetY ?? 70)
    this.setDepth(18)
    this.healthBar = scene.add.graphics().setDepth(19)
    this.setCollideWorldBounds(true)
    this.shadow.setScale(this.scaleX, this.scaleY)
    this.play(this.getAnimationKey('idle'))
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)

    if (config.tintColor) {
      this.setTint(config.tintColor)
    }
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

  isPlayerInAttackRange(target) {
    return Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= this.attackRange
  }

  canDamagePlayer(time) {
    return !this.isDead && time >= this.lastDamageAt + this.damageCooldownMs
  }

  isAiSuspended(time = this.scene.time.now) {
    return time < this.aiSuspendUntil
  }

  suspendAi(durationMs) {
    this.aiSuspendUntil = Math.max(this.aiSuspendUntil, this.scene.time.now + durationMs)
    return this.aiSuspendUntil
  }

  clearAiSuspend() {
    this.aiSuspendUntil = 0
  }

  markDamageDealt(time) {
    this.lastDamageAt = time
    this.attack(time)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)
    this.shadow?.setPosition(this.x + this.shadowOffsetX, this.y + this.shadowOffsetY)
    this.aura?.setPosition(this.x + this.shadowOffsetX, this.y + this.shadowOffsetY + 4)

    if (this.aura) {
      const pulse = 0.84 + Math.sin((time + this.wobbleSeed) * 0.008) * 0.06
      this.aura.setScale(pulse)
      this.aura.setAlpha(this.isDead ? 0.05 : 0.12 + Math.sin((time + this.wobbleSeed) * 0.012) * 0.04)
    }

    if (this.isDead || time < this.hitUntil) {
      return
    }

    if (time >= this.attackUntil && this.state === 'attack') {
      this.resumeMovementState()
    }

    this.drawHealthBar()
  }

  chase(target) {
    if (this.isDead) {
      return
    }

    const time = this.scene.time.now
    const wobblePhase = (time + this.wobbleSeed) * this.wobbleSpeed
    const steerX = target.x + Math.sin(wobblePhase) * this.wobbleAmount
    const steerY = target.y + Math.cos(wobblePhase * 0.8) * this.wobbleAmount * 0.35
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)

    this.setFlipX(steerX < this.x)

    if (this.isAiSuspended(time)) {
      this.setVelocity(this.body.velocity.x * 0.78, this.body.velocity.y * 0.78)

      if (this.state !== 'attack') {
        this.playLoop('idle')
      }

      return
    }

    if (time < this.hitUntil) {
      const dragFactor = this.typeId === 'tank' ? 0.92 : 0.84
      this.setVelocity(this.body.velocity.x * dragFactor, this.body.velocity.y * dragFactor)
      return
    }

    if (this.isLeaping && time < this.leapUntil) {
      this.setVelocity(this.leapVector.x * this.leapSpeed, this.leapVector.y * this.leapSpeed)
      return
    } else if (this.isLeaping && time >= this.leapUntil) {
      this.isLeaping = false
    }

    if (distance <= this.attackRange) {
      this.attack(time)
      this.setVelocity(this.body.velocity.x * 0.65, this.body.velocity.y * 0.65)
      return
    }

    if (this.leaps && time >= this.nextLeapAt && !this.isAiSuspended(time)) {
      if (distance >= this.leapRangeMin && distance <= this.leapRangeMax) {
        this.nextLeapAt = time + this.leapCooldownMs + Phaser.Math.Between(0, 1000)
        this.isLeaping = true
        this.leapUntil = time + this.leapDurationMs
        this.leapVector.set(target.x - this.x, target.y - this.y).normalize()
        this.playLoop('attack')
        
        // Impact burst on leap
        import('../systems/effectsSystem').then(({ createImpactBurst }) => {
          createImpactBurst(this.scene, this.x, this.y + 20, {
            color: 0x991b1b, radius: 10, endRadius: 28, particleCount: 8, duration: 160
          })
        })
        return
      }
    }

    let currentSteerX = steerX
    let currentSteerY = steerY

    if (this.spits && time >= this.nextSpitAt && !this.isAiSuspended(time)) {
      if (distance >= this.spitRangeMin && distance <= this.spitRangeMax) {
        this.nextSpitAt = time + this.spitCooldownMs + Phaser.Math.Between(0, 1000)
        this.fireSpit(target)
        this.playLoop('attack')
        this.attackUntil = time + 400
        this.setVelocity(this.body.velocity.x * 0.1, this.body.velocity.y * 0.1)
        return
      } else if (distance < this.spitRangeMin) {
        // Move backward a bit to maintain distance
        currentSteerX = this.x - (target.x - this.x)
        currentSteerY = this.y - (target.y - this.y)
      }
    }

    const effectiveSpeed = Math.max(12, this.speed * (this.speedModifier ?? 1))

    this.scene.physics.moveTo(this, currentSteerX, currentSteerY, effectiveSpeed)
    // Track direction zombie is facing (toward player) for shield deflection
    this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
    this.playLoop('walk')
  }

  fireSpit(target) {
    const projectile = this.scene.physics.add.sprite(this.x, this.y - 12, 'bullet')
        .setTint(0x16a34a).setScale(1.3).setDepth(30)
    projectile.body.setCircle(6)
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
    this.scene.physics.velocityFromRotation(angle, this.spitSpeed, projectile.body.velocity)
    
    // Add collision against player with active combat director
    this.scene.physics.add.overlap(this.scene.player, projectile, (_player, proj) => {
      if (proj.active) {
        this.scene.combat?.handleBossAttack?.({ isBoss: true, active: true, isDead: false, damageCooldownMs: 0, x: this.x, y: this.y }, {
          damage: this.spitDamage, fromX: proj.x, fromY: proj.y, knockbackForceScale: 0.8,
          damageSource: 'spitter-projectile'
        })
        
        import('../systems/effectsSystem').then(({ createImpactBurst }) => {
          createImpactBurst(this.scene, proj.x, proj.y, {
            color: 0x166534, radius: 10, endRadius: 28, particleCount: 12, duration: 180
          })
        })
        
        proj.destroy()
      }
    })

    // Destroy after lifetime
    this.scene.time.delayedCall(this.spitLifetimeMs, () => proj.destroy?.())
  }

  /**
   * Returns true if the zombie's shield is facing the incoming bullet.
   * Bullets coming from the FRONT (same direction as facing) are blocked.
   * Bullets from behind or sides bypass the shield.
   */
  isBlockingShot(bulletVx, bulletVy) {
    if (!this.shielded || this.isDead) return false
    // The bullet travels toward (-bulletVx, -bulletVy) from zombie perspective
    // The zombie faces outward at facingAngle. Dot product > 0 means frontal hit.
    const bulletAngle = Math.atan2(bulletVy, bulletVx)
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(bulletAngle - this.facingAngle))
    // Block if bullet comes from within ±65° of the facing direction
    return angleDiff < 1.13  // ~65 degrees in radians
  }

  setSpeedModifier(multiplier = 1) {
    this.speedModifier = Phaser.Math.Clamp(Number(multiplier) || 1, 0.2, 1.4)
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
    this.attackUntil = 0
    const impactBrake = this.typeId === 'tank' ? 0.45 : 0.2
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

    this.scene.zombies?.remove(this, false, false)
    this.body.stop()
    this.body.enable = false
    this.play(this.getAnimationKey('death'), true)

    this.scene.tweens.add({
      targets: this.shadow,
      alpha: 0.06,
      scaleX: this.scaleX * 0.84,
      scaleY: this.scaleY * 0.84,
      duration: 260,
      ease: 'Quad.easeOut',
    })

    if (this.aura) {
      this.scene.tweens.add({
        targets: this.aura,
        alpha: 0,
        scaleX: 1.45,
        scaleY: 1.45,
        duration: 320,
        ease: 'Quad.easeOut',
      })
    }
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

  drawHealthBar() {
    this.healthBar.clear()

    if (this.health <= 0 || this.isDead) {
      return
    }

    const width = this.isBoss ? 56 : 36
    const height = this.isBoss ? 5 : 4
    const x = this.x - width / 2
    const y = this.y - this.displayHeight * this.headHitOffsetYScale - 24

    this.healthBar.fillStyle(0x000000, 0.7)
    this.healthBar.fillRect(x, y, width, height)

    const healthWidth = Math.max(0, (this.health / this.maxHealth) * width)
    this.healthBar.fillStyle(0xef4444, 1) // red
    this.healthBar.fillRect(x, y, healthWidth, height)

    this.healthBar.lineStyle(1, 0x000000, 0.9)
    this.healthBar.strokeRect(x, y, width, height)
  }

  applyHitFlash(color = this.hitFlashColor) {
    this.setTintFill(color)
    this.aura?.setAlpha(0.28)
    this.hitFlashEvent?.remove(false)
    this.hitFlashEvent = this.scene.time.delayedCall(80, () => {
      this.clearTint()
      this.hitFlashEvent = null
    })
  }

  destroy(fromScene) {
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)
    this.hitFlashEvent?.remove(false)
    this.aura?.destroy()
    this.shadow?.destroy()
    this.healthBar?.destroy()
    return super.destroy(fromScene)
  }
}
