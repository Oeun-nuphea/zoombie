import { createZombieConfig } from '../config/zombieConfig.js'
import { Animation } from '../systems/Animation.js'

function intersectsRect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export class Zombie {
  constructor({ x, y, config = {} }) {
    this.config = createZombieConfig(config)
    this.animation = new Animation({
      clips: this.config.animations,
      initial: 'idle',
      spriteSheet: this.config.sprite,
    })

    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.health = this.config.maxHealth
    this.facing = 1
    this.state = 'idle'
    this.dead = false

    this.attackQueued = false
    this.attackDidConnect = false
    this.attackCooldownMs = 0
    this.hurtRecoverMs = 0
    this.lastRenderedFrame = null
  }

  setState(nextState, { force = false } = {}) {
    if (this.state === 'death' && nextState !== 'death') {
      return false
    }

    if (!force) {
      if (this.state === 'hurt' && nextState !== 'death' && !this.animation.isComplete) {
        return false
      }

      if (this.state === 'attack' && nextState !== 'death' && !this.animation.isComplete) {
        return false
      }
    }

    if (nextState === 'attack') {
      this.attackDidConnect = false
      this.attackQueued = false
    }

    this.state = nextState
    return this.animation.play(nextState, { force })
  }

  takeDamage(amount = 1) {
    if (this.dead || this.state === 'death') {
      return
    }

    this.health -= amount
    this.vx = 0
    this.vy = 0

    if (this.health <= 0) {
      this.dead = true
      this.state = 'death'
      this.animation.play('death', { force: true })
      return
    }

    this.hurtRecoverMs = this.config.hurtRecoverMs
    this.setState('hurt', { force: true })
  }

  update(deltaMs, player) {
    this.animation.update(deltaMs)

    if (this.dead) {
      return
    }

    this.attackCooldownMs = Math.max(0, this.attackCooldownMs - deltaMs)
    this.hurtRecoverMs = Math.max(0, this.hurtRecoverMs - deltaMs)

    const dx = player.x - this.x
    const dy = player.y - this.y
    const distance = Math.hypot(dx, dy)

    if (Math.abs(dx) > 0.001) {
      this.facing = dx >= 0 ? 1 : -1
    }

    if (this.state === 'hurt') {
      this.vx = 0
      this.vy = 0

      if (this.animation.consumeFinished('hurt') || this.hurtRecoverMs <= 0) {
        if (distance <= this.config.attackRange && this.attackCooldownMs <= 0) {
          this.setState('attack', { force: true })
        } else if (distance <= this.config.aggroRadius) {
          this.setState('walk', { force: true })
        } else {
          this.setState('idle', { force: true })
        }
      }

      return
    }

    if (this.state === 'attack') {
      this.vx = 0
      this.vy = 0

      if (
        !this.attackDidConnect &&
        this.animation.currentFrameIndex >= this.config.attackDamageFrame
      ) {
        this.attackQueued = true
        this.attackDidConnect = true
      }

      if (this.animation.consumeFinished('attack')) {
        this.attackCooldownMs = this.config.attackCooldownMs

        if (distance <= this.config.attackRange) {
          this.setState('idle', { force: true })
        } else if (distance <= this.config.aggroRadius) {
          this.setState('walk', { force: true })
        } else {
          this.setState('idle', { force: true })
        }
      }

      return
    }

    if (distance > this.config.aggroRadius) {
      this.vx = 0
      this.vy = 0
      this.setState('idle')
      return
    }

    if (distance <= this.config.attackRange && this.attackCooldownMs <= 0) {
      this.vx = 0
      this.vy = 0
      this.setState('attack', { force: true })
      return
    }

    const safeDistance = Math.max(distance, 0.001)
    const moveScale = this.config.moveSpeed / safeDistance

    this.vx = dx * moveScale
    this.vy = dy * moveScale
    this.x += this.vx * (deltaMs / 1000)
    this.y += this.vy * (deltaMs / 1000)
    this.setState('walk')
  }

  consumeAttack() {
    if (!this.attackQueued) {
      return false
    }

    this.attackQueued = false
    return true
  }

  isReadyToRemove() {
    return this.dead && this.animation.isComplete
  }

  getBounds() {
    const diameter = this.config.hitRadius * 2

    return {
      x: this.x - this.config.hitRadius,
      y: this.y - this.config.hitRadius,
      width: diameter,
      height: diameter,
    }
  }

  intersectsRect(rect) {
    return intersectsRect(this.getBounds(), rect)
  }

  render(ctx, image) {
    if (!ctx || !image) {
      return
    }

    const { sx, sy, sw, sh } = this.animation.getCurrentFrameRect()
    const frameNumber = this.animation.getCurrentFrameNumber()
    const drawWidth = sw * this.config.sprite.drawScale
    const drawHeight = sh * this.config.sprite.drawScale
    const originX = drawWidth * this.config.sprite.anchorX
    const originY = drawHeight * this.config.sprite.anchorY
    const drawX = this.facing < 0 ? this.x - (drawWidth - originX) : this.x - originX
    const drawY = this.y - originY

    if (this.config.debug && this.lastRenderedFrame !== frameNumber) {
      console.debug(`[Zombie] frame=${frameNumber} clip=${this.animation.currentKey} sx=${sx} sy=${sy}`)
      this.lastRenderedFrame = frameNumber
    }

    ctx.save()

    if (this.facing < 0) {
      ctx.translate(this.x, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(image, sx, sy, sw, sh, -(originX), drawY, drawWidth, drawHeight)
    } else {
      ctx.drawImage(image, sx, sy, sw, sh, drawX, drawY, drawWidth, drawHeight)
    }
    ctx.restore()

    if (this.config.debug) {
      ctx.save()
      ctx.strokeStyle = '#7df56a'
      ctx.lineWidth = 2
      ctx.strokeRect(drawX, drawY, drawWidth, drawHeight)

      const bounds = this.getBounds()
      ctx.strokeStyle = '#ff4d4f'
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.restore()
    }
  }
}
