import Phaser from 'phaser'

import { PLAYER_CONFIG } from '../config/gameplayConfig'
import {
  PLAYER_BODY_LOCAL_ORIGIN,
  PLAYER_CARRIED_WEAPON_TEXTURE,
  PLAYER_FRAME_POSES,
  PLAYER_TEXTURE_SIZE,
  PLAYER_WEAPON_SHOULDER_LOCAL,
} from '../config/playerVisualConfig'

const AIM_GRACE_MS = 180
const SHOOT_FEEDBACK_MS = 100
const HIT_FEEDBACK_MS = 140
const DODGE_SPEED = 820
const DODGE_DURATION_MS = 220
const DODGE_COOLDOWN_MS = 900
const DODGE_IFRAME_MS = 260

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'player-idle-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.runStatsProvider = config.getRunStats ?? null
    this.healthProvider = config.getHealth ?? null
    this.maxHealthProvider = config.getMaxHealth ?? null
    this.lastFiredAt = -9999
    this.lastDamagedAt = -PLAYER_CONFIG.contactCooldown
    this.lastAimedAt = 0
    this.lastAimAngle = 0
    this.shootUntil = 0
    this.hitUntil = 0
    this.damageImmuneUntil = 0
    this.state = 'idle'
    this.isDead = false
    this.isDodging = false
    this.lastDodgedAt = -DODGE_COOLDOWN_MS
    this.hasMoveInput = false
    this.moveVelocity = new Phaser.Math.Vector2()
    this.impactVelocity = new Phaser.Math.Vector2()
    this.shadow = scene.add.ellipse(x + 6, y + 12, 40, 22, 0x000000, 0.3)
    this.carriedWeapon = scene.add.image(x, y, PLAYER_CARRIED_WEAPON_TEXTURE.key)
    this.shadow.setDepth(6)
    this.carriedWeapon.setOrigin(
      PLAYER_CARRIED_WEAPON_TEXTURE.originX / PLAYER_CARRIED_WEAPON_TEXTURE.width,
      PLAYER_CARRIED_WEAPON_TEXTURE.originY / PLAYER_CARRIED_WEAPON_TEXTURE.height,
    )
    this.setOrigin(0.46, 0.8)
    this.setScale(0.8)
    this.setDepth(20)
    this.carriedWeapon.setScale(this.scaleX, this.scaleY)
    this.carriedWeapon.setDepth(this.depth + 1)
    this.setCollideWorldBounds(true)
    this.refreshDynamicCaps()
    this.body.setSize(42, 48)
    this.body.setOffset(42, 52)
    this.healthBar = scene.add.graphics().setDepth(this.depth + 3)
    this.play('player-idle')
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)
    this.updateCarriedWeapon()
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)
    this.refreshDynamicCaps()
    this.shadow?.setPosition(this.x + 6, this.y + 14)
    this.updateAnimationState(time)
    this.updateCarriedWeapon()
    this.drawHealthBar()
  }

  getCurrentPose() {
    const frameKey = this.anims?.currentFrame?.textureKey ?? this.texture.key
    return PLAYER_FRAME_POSES[frameKey] ?? PLAYER_FRAME_POSES['player-idle-0']
  }

  localToWorld(localX, localY) {
    let effectiveX = localX;
    if (this.flipX) {
      effectiveX = PLAYER_TEXTURE_SIZE - localX;
    }
    
    return {
      x: this.x + (effectiveX - (PLAYER_TEXTURE_SIZE * this.originX)) * Math.abs(this.scaleX),
      y: this.y + (localY - (PLAYER_TEXTURE_SIZE * this.originY)) * this.scaleY,
    }
  }

  getPlayerCenter(pose = this.getCurrentPose()) {
    return this.localToWorld(
      PLAYER_BODY_LOCAL_ORIGIN.x,
      PLAYER_BODY_LOCAL_ORIGIN.y + pose.bob,
    )
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
    
    // Auto-correct gun inversion when aiming backwards
    const isAimingLeft = Math.abs(angle) > Math.PI / 2
    const weaponScaleX = Math.abs(this.scaleX)
    const weaponScaleY = isAimingLeft ? -Math.abs(this.scaleY) : Math.abs(this.scaleY)

    this.carriedWeapon
      .setPosition(transform.x, transform.y)
      .setRotation(angle)
      .setScale(weaponScaleX, weaponScaleY)
      .setDepth(Math.sin(angle) < -0.15 ? this.depth - 1 : this.depth + 1)
  }

  getCombatStats() {
    return this.runStatsProvider?.() ?? {
      damage: 1,
      fireRate: 1,
      moveSpeed: 1,
      bulletCount: 0,
      maxHP: PLAYER_CONFIG.maxHealth,
      lifesteal: 0,
    }
  }

  getMoveSpeed() {
    let speedMult = this.getCombatStats().moveSpeed ?? 1;
    
    // Terrain effects
    const tile = this.scene.arena?.groundLayer?.getTileAtWorldXY(this.x, this.y);
    if (tile && tile.index === 5) { // 5 is the mud/water tile
      speedMult *= 0.6; // 40% slowdown in mud
    }

    return PLAYER_CONFIG.maxSpeed * speedMult;
  }

  getFireInterval(baseFireRate) {
    return Math.max(45, baseFireRate / Math.max(0.1, this.getCombatStats().fireRate ?? 1))
  }

  refreshDynamicCaps() {
    this.setMaxVelocity(this.getMoveSpeed())
  }

  move(moveVector, delta) {
    const hasInput = moveVector.lengthSq() > 0
    const blend = hasInput ? PLAYER_CONFIG.moveAcceleration : PLAYER_CONFIG.moveDeceleration
    this.hasMoveInput = hasInput

    this.moveVelocity.lerp(moveVector, Math.min(1, blend * (delta / 16.667)))
    this.impactVelocity.scale(Math.pow(PLAYER_CONFIG.knockbackDecay, delta / 16.667))

    if (this.impactVelocity.lengthSq() < 1) {
      this.impactVelocity.set(0, 0)
    }

    this.body.velocity.set(
      this.moveVelocity.x + this.impactVelocity.x,
      this.moveVelocity.y + this.impactVelocity.y,
    )
  }

  getAimAngle(pointer) {
    const center = this.getPlayerCenter()
    return Math.atan2(pointer.worldY - center.y, pointer.worldX - center.x)
  }

  facePointer(pointer, time = this.scene.time.now) {
    const angle = this.getAimAngle(pointer)
    const angleDelta = Math.abs(Phaser.Math.Angle.Wrap(angle - this.lastAimAngle))

    if (pointer.isDown || angleDelta > 0.015) {
      this.lastAimedAt = time
    }

    this.lastAimAngle = angle
    
    // Automatically turn around the player body model!
    this.setFlipX(Math.abs(angle) > Math.PI / 2)
    
    this.updateCarriedWeapon()
  }

  canFire(time, fireRate) {
    return !this.isDead && time >= this.lastFiredAt + fireRate
  }

  isDamageImmune(time = this.scene.time.now) {
    return time < this.damageImmuneUntil
  }

  grantDamageImmunity(durationMs = 0) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return this.damageImmuneUntil
    }

    this.damageImmuneUntil = Math.max(this.damageImmuneUntil, this.scene.time.now + durationMs)
    return this.damageImmuneUntil
  }

  canDodge(time = this.scene.time.now) {
    return !this.isDead && !this.isDodging && time >= this.lastDodgedAt + DODGE_COOLDOWN_MS
  }

  get dodgeCooldownRatio() {
    const elapsed = this.scene.time.now - this.lastDodgedAt
    return Math.min(1, elapsed / DODGE_COOLDOWN_MS)
  }

  dodge(time = this.scene.time.now) {
    if (!this.canDodge(time)) return false

    this.isDodging = true
    this.lastDodgedAt = time
    this.grantDamageImmunity(DODGE_IFRAME_MS)

    // Direction: use current move velocity, fallback to facing direction
    const speed = this.moveVelocity.lengthSq() > 1
      ? this.moveVelocity.clone().normalize()
      : new Phaser.Math.Vector2(Math.cos(this.lastAimAngle), Math.sin(this.lastAimAngle))

    this.impactVelocity.set(speed.x * DODGE_SPEED, speed.y * DODGE_SPEED)

    // Ghost afterimage
    this._spawnDodgeAfterimage()

    this.scene.time.delayedCall(DODGE_DURATION_MS, () => {
      this.isDodging = false
    })

    return true
  }

  _spawnDodgeAfterimage() {
    const ghost = this.scene.add.image(this.x, this.y, this.texture.key, this.frame.name)
    ghost.setOrigin(this.originX, this.originY)
    ghost.setScale(this.scaleX, this.scaleY)
    ghost.setDepth(this.depth - 1)
    ghost.setAlpha(0.55)
    ghost.setTintFill(0x7dd3fc) // light blue trail
    ghost.setBlendMode(Phaser.BlendModes.ADD)

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: ghost.scaleX * 1.1,
      scaleY: ghost.scaleY * 0.9,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => ghost.destroy(),
    })
  }

  clearDamageImmunity() {
    this.damageImmuneUntil = 0
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

  triggerShot(time, angle) {
    this.lastFiredAt = time
    this.lastAimedAt = time
    this.shootUntil = time + SHOOT_FEEDBACK_MS
    this.lastAimAngle = angle
    this.updateAnimationState(time)
    this.updateCarriedWeapon()
  }

  canTakeDamage(time) {
    return !this.isDead && !this.isDamageImmune(time) && time >= this.lastDamagedAt + PLAYER_CONFIG.contactCooldown
  }

  takeDamage(time) {
    this.lastDamagedAt = time
    this.lastAimedAt = time
    this.hitUntil = time + HIT_FEEDBACK_MS
    this.shootUntil = 0
    this.updateAnimationState(time)
    this.updateCarriedWeapon()
  }

  applyKnockback(fromX, fromY, forceScale = 1) {
    // Zeroed out: zombies now grapple the player in place instead of knocking them back!
    this.impactVelocity.set(0, 0);
  }

  applyImpulse(forceX, forceY, options = {}) {
    if (options.replace) {
      this.impactVelocity.set(forceX, forceY)
    } else {
      this.impactVelocity.set(this.impactVelocity.x + forceX, this.impactVelocity.y + forceY)
    }

    if (options.clearMoveVelocity) {
      this.moveVelocity.scale(0.4)
    }
  }

  die() {
    if (this.isDead) {
      return
    }

    this.isDead = true
    this.state = 'dead'
    this.hitUntil = 0
    this.shootUntil = 0
    this.clearDamageImmunity()
    this.body.stop()
    this.body.enable = false
    this.play('player-death', true)
    this.updateCarriedWeapon()

    this.scene.tweens.add({
      targets: this.shadow,
      alpha: 0.08,
      scaleX: 0.86,
      scaleY: 0.86,
      duration: 300,
      ease: 'Quad.easeOut',
    })
  }

  handleAnimationComplete(animation) {
    if (animation.key === 'player-hit' && !this.isDead) {
      this.updateAnimationState(this.scene.time.now)
    }
  }

  updateAnimationState(time) {
    if (this.isDead) {
      this.playState('dead', 'player-death')
      return
    }

    if (time < this.hitUntil) {
      this.playState('hit', 'player-hit')
      return
    }

    if (time < this.shootUntil) {
      this.playState('shoot', 'player-shoot')
      return
    }

    if (this.hasMoveInput || this.body.velocity.lengthSq() > 500) {
      this.playState('walk', 'player-walk')
      return
    }

    if (time < this.lastAimedAt + AIM_GRACE_MS) {
      this.playState('aim', 'player-aim')
      return
    }

    this.playState('idle', 'player-idle')
  }

  playState(state, animationKey) {
    if (this.state === state && this.anims.currentAnim?.key === animationKey) {
      return
    }

    this.state = state
    this.play(animationKey, true)
  }

  drawHealthBar() {
    const maxHealth = this.maxHealthProvider?.() ?? this.getCombatStats().maxHP
    const currentHealth = this.healthProvider?.() ?? maxHealth

    const width = 42
    const height = 5
    const targetX = this.x - width / 2
    const targetY = this.y - this.displayHeight * 0.95
    
    // Always reposition so its location updates, but we only redraw graphics if health changes!
    this.healthBar.setPosition(targetX, targetY)

    if (!maxHealth || this.isDead) {
      if (!this._healthBarCleared) {
        this.healthBar.clear()
        this._healthBarCleared = true
      }
      return
    }

    if (this._lastHealth === currentHealth && this._lastMaxHealth === maxHealth) {
      return
    }

    this._lastHealth = currentHealth
    this._lastMaxHealth = maxHealth
    this._healthBarCleared = false

    this.healthBar.clear()
    this.healthBar.fillStyle(0x000000, 0.7)
    this.healthBar.fillRect(0, 0, width, height)

    const healthRatio = Math.min(1, Math.max(0, currentHealth / (maxHealth || 1)))
    const healthWidth = healthRatio * width
    this.healthBar.fillStyle(0x22c55e, 1)
    this.healthBar.fillRect(0, 0, healthWidth, height)

    this.healthBar.lineStyle(1, 0x000000, 0.9)
    this.healthBar.strokeRect(0, 0, width, height)
  }

  destroy(fromScene) {
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this)
    this.shadow?.destroy()
    this.healthBar?.destroy()
    this.carriedWeapon?.destroy()
    return super.destroy(fromScene)
  }
}
