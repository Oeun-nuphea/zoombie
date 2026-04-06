import Phaser from 'phaser'

const TEXTURE_KEY = 'red-barrel'

function ensureBarrelTexture(scene) {
  if (!scene.textures.exists(TEXTURE_KEY)) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })
    
    // Draw base shadow
    graphics.fillStyle(0x000000, 0.3)
    graphics.fillEllipse(20, 52, 28, 12)
    
    // Draw barrel body
    graphics.fillStyle(0xdc2626, 1) // red-600
    graphics.fillRoundedRect(4, 4, 32, 48, 6)
    
    // Draw barrel bands
    graphics.fillStyle(0x171717, 1) // neutral-900
    graphics.fillRect(4, 14, 32, 6)
    graphics.fillRect(4, 36, 32, 6)
    
    graphics.generateTexture(TEXTURE_KEY, 40, 60)
  }
}

export default class Barrel extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    ensureBarrelTexture(scene)
    super(scene, x, y, TEXTURE_KEY)
    
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.health = 3
    this.isDestroyed = false
    this.explosiveRadius = 220
    this.explosiveDamage = 30
    this.knockbackForce = 1200

    this.setOrigin(0.5, 0.8)
    this.body.setSize(32, 32)
    this.body.setOffset(4, 28)
    this.setImmovable(true)
    this.setDepth(this.y)
  }

  takeDamage(amount = 1) {
    if (this.isDestroyed) return

    this.health -= amount
    
    this.setTintFill(0xffffff)
    this.scene.time.delayedCall(80, () => {
      if (!this.isDestroyed) this.clearTint()
    })

    if (this.health <= 0) {
      this.explode()
    } else {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.15,
        scaleY: 0.85,
        duration: 60,
        yoyo: true,
      })
    }
  }

  explode() {
    this.isDestroyed = true
    this.setVisible(false)
    this.body.setEnable(false)
    
    if (this.scene.soundManager) {
      // Re-use shoot sound at a deep pitch for a meaty explosion
      this.scene.soundManager.play('shoot', { volume: 1.8, rate: 0.4 }) 
    }

    const blast = this.scene.add.circle(this.x, this.y - 15, 10, 0xf97316, 0.8)
    blast.setDepth(20)
    blast.setBlendMode(Phaser.BlendModes.ADD)
    
    const blastOutline = this.scene.add.circle(this.x, this.y - 15, 10, 0, 0)
    blastOutline.setStrokeStyle(6, 0xfef08a, 1)
    blastOutline.setDepth(19) // below blast glow

    this.scene.tweens.add({
      targets: [blast, blastOutline],
      radius: this.explosiveRadius,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        blast.destroy()
        blastOutline.destroy()
        this.destroy()
      }
    })

    // Deal Damage to Zombies via the combat system (correct API signature)
    if (this.scene.combat?.damageEnemiesInRadius) {
      this.scene.combat.damageEnemiesInRadius(
        { x: this.x, y: this.y },
        this.explosiveRadius,
        {
          damage: this.explosiveDamage,
          source: 'explosion',
          allowBossDamage: true,
        }
      )
    }

    // Manual knockback pass (separate from damage)
    if (this.scene.zombies?.getChildren) {
      for (const zombie of this.scene.zombies.getChildren()) {
        if (!zombie.active || zombie.isDead) continue
        const dist = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y)
        if (dist <= this.explosiveRadius) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, zombie.x, zombie.y)
          zombie.body.velocity.x += Math.cos(angle) * this.knockbackForce
          zombie.body.velocity.y += Math.sin(angle) * this.knockbackForce
        }
      }
    }

    // Damage player if caught in radius
    if (this.scene.player?.active) {
      const pDist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y)
      if (pDist <= this.explosiveRadius) {
        this.scene.gameStore.damagePlayer(1)
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y)
        this.scene.player.body.velocity.x += Math.cos(angle) * this.knockbackForce * 0.7
        this.scene.player.body.velocity.y += Math.sin(angle) * this.knockbackForce * 0.7
      }
    }
  }

  update() {
     if (this.active && !this.isDestroyed) {
        this.setDepth(this.y)
     }
  }
}
