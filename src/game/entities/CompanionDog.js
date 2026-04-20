import Phaser from 'phaser';

// Companion Dog upgrade tiers — unlocked by wave
const DOG_TIERS = [
  {
    wave: 5,
    label: 'DOG ONLINE',
    biteCooldown: 500,
    biteDamage: 2,
    scanRange: 400,
    moveSpeed: 280,
    auraColor: 0x4ade80,
    auraAlpha: 0.38,
  },
  {
    wave: 11,
    label: 'DOG UPGRADED',
    biteCooldown: 400,
    biteDamage: 3,
    scanRange: 500,
    moveSpeed: 320,
    auraColor: 0x38bdf8,
    auraAlpha: 0.5,
  },
  {
    wave: 14,
    label: 'DOG OVERCLOCKED',
    biteCooldown: 300,
    biteDamage: 5,
    scanRange: 600,
    moveSpeed: 380,
    auraColor: 0xa78bfa,
    auraAlpha: 0.65,
  },
]

export default class CompanionDog extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, player) {
    if (!scene.textures.exists('dog-blank')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0);
      g.fillRect(0, 0, 10, 10);
      g.generateTexture('dog-blank', 10, 10);
    }

    super(scene, x, y, 'dog-blank');

    this.player = player;
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1.2);
    this.setDepth(20);

    // Aura underneath
    this.aura = scene.add.circle(x, y, 30, 0x4ade80, 0.38);
    this.aura.setDepth(19);

    // Core states
    this.lastBiteAt = 0;
    this.lastScanAt = 0;
    this.lastScannedTarget = null;
    this.scanInterval = 150;
    this.biteCooldown = DOG_TIERS[0].biteCooldown;
    this.biteDamage = DOG_TIERS[0].biteDamage;
    this.scanRange = DOG_TIERS[0].scanRange;
    this.moveSpeed = DOG_TIERS[0].moveSpeed;
    this._currentTierIndex = -1;

    this.body.setSize(30, 30);
    this.body.setOffset(10, 5);
    this.setCollideWorldBounds(true);

    this.createDogVisuals(scene, x, y);
  }

  createDogVisuals(scene, x, y) {
    const tan = 0xd2a679;
    const dark = 0x2e2e2e;
    const black = 0x111111;

    this.dogGroup = scene.add.container(x, y);
    this.dogGroup.setDepth(20);
    this.dogGroup.setScale(0.85);

    // --- Back Legs ---
    const legBL = scene.add.ellipse(-10, 12, 8, 22, tan).setOrigin(0.5, 0.1);
    const legFL = scene.add.ellipse(12, 12, 8, 22, tan).setOrigin(0.5, 0.1);
    
    // --- Tail ---
    const tail = scene.add.ellipse(-20, -2, 12, 32, dark).setOrigin(0.5, 0.1).setAngle(-35);
    
    // --- Neck ---
    const neck = scene.add.ellipse(18, -6, 16, 24, tan).setAngle(30);

    // --- Body ---
    const bodyTan = scene.add.ellipse(0, 4, 44, 20, tan);
    const bodyDark = scene.add.ellipse(-3, -3, 40, 20, dark); // Saddle
    
    // --- Head ---
    const head = scene.add.ellipse(26, -18, 18, 18, tan);
    const snout = scene.add.ellipse(35, -16, 16, 10, black); 
    const earL = scene.add.triangle(23, -28, 0, 12, 5, 0, 10, 12, dark);
    const earR = scene.add.triangle(28, -28, 0, 12, 5, 0, 10, 12, dark);

    // --- Front Legs ---
    const legBR = scene.add.ellipse(-10, 12, 9, 22, tan).setOrigin(0.5, 0.1);
    const legFR = scene.add.ellipse(12, 12, 9, 22, tan).setOrigin(0.5, 0.1);

    this.dogGroup.add([
      legBL, legFL, tail, neck, bodyTan, bodyDark, head, snout, earL, earR, legBR, legFR
    ]);

    this.parts = {
      legBL, legFL, tail, neck, bodyTan, bodyDark, head, snout, earL, earR, legBR, legFR
    };
  }

  getGameStore() {
    return this.scene?.gameStore ?? null;
  }

  getCurrentTierIndex() {
    const wave = this.getGameStore()?.wave ?? 5;
    let tierIndex = 0;
    for (let i = DOG_TIERS.length - 1; i >= 0; i--) {
      if (wave >= DOG_TIERS[i].wave) {
        tierIndex = i;
        break;
      }
    }
    return tierIndex;
  }

  applyTier(tierIndex) {
    const tier = DOG_TIERS[tierIndex];
    if (!tier) return;

    this.biteCooldown = tier.biteCooldown;
    this.biteDamage = tier.biteDamage;
    this.scanRange = tier.scanRange;
    this.moveSpeed = tier.moveSpeed;

    if (this.aura) {
      this.aura.fillColor = tier.auraColor;
      this.aura.fillAlpha = tier.auraAlpha;
    }

    if (this._currentTierIndex >= 0 && this.scene?.hud) {
      this.scene.hud.flashBanner(tier.label, '#a78bfa');
    }

    this._currentTierIndex = tierIndex;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Sync Graphics position to Physics Body
    this.dogGroup.setPosition(this.x, this.y);

    if (this.player.isDead || this.scene.combat?.isGameOver) {
      this.body.setVelocity(0, 0);
      return;
    }

    const tierIndex = this.getCurrentTierIndex();
    if (tierIndex !== this._currentTierIndex) {
      this.applyTier(tierIndex);
    }

    if (this.aura) {
      this.aura.setPosition(this.x, this.y + 4);
      this.aura.setRadius(24 + Math.sin(time * 0.006) * 4);
      this.aura.setAlpha(0.3 + Math.abs(Math.sin(time * 0.003)) * 0.2);
    }

    this.updateMovement(time);
    this.animateGraphics(time);
  }

  animateGraphics(time) {
    const isMoving = this.body.velocity.lengthSq() > 20;

    // Flip direction
    if (this.body.velocity.x !== 0) {
      this.dogGroup.scaleX = this.body.velocity.x < 0 ? -0.85 : 0.85;
    } else if (this.lastScannedTarget) {
      this.dogGroup.scaleX = this.lastScannedTarget.x < this.x ? -0.85 : 0.85;
    } else {
      this.dogGroup.scaleX = this.player.x < this.x ? -0.85 : 0.85;
    }

    if (isMoving) {
      // Gallop animation
      const speed = this.moveSpeed * 0.055; 
      const stride = time * speed * 0.001;
      const bounce = Math.abs(Math.sin(stride * 1.5)) * 5;

      this.parts.bodyDark.y = -3 + bounce;
      this.parts.bodyTan.y = 4 + bounce;
      this.parts.neck.y = -6 + bounce * 0.9;
      this.parts.head.y = -18 + bounce * 0.7;
      this.parts.snout.y = -16 + bounce * 0.7;
      this.parts.earL.y = -28 + bounce * 0.7;
      this.parts.earR.y = -28 + bounce * 0.7;
      this.parts.tail.y = -2 + bounce;

      // Leg swings
      this.parts.legFR.angle = Math.sin(stride) * 55;
      this.parts.legBL.angle = Math.sin(stride) * 55;
      
      this.parts.legFL.angle = Math.sin(stride + Math.PI) * 55;
      this.parts.legBR.angle = Math.sin(stride + Math.PI) * 55;
      
      // Wag tail while running
      this.parts.tail.angle = -35 + Math.sin(stride * 2.5) * 20;
    } else {
      // Idle breathing animation
      const breathe = Math.sin(time * 0.003) * 2;
      
      this.parts.bodyDark.y = -3 + breathe;
      this.parts.bodyTan.y = 4 + breathe;
      this.parts.neck.y = -6 + breathe * 0.5;
      this.parts.head.y = -18 + breathe * 0.3;
      this.parts.snout.y = -16 + breathe * 0.3;
      this.parts.earL.y = -28 + breathe * 0.3;
      this.parts.earR.y = -28 + breathe * 0.3;
      this.parts.tail.y = -2 + breathe;

      this.parts.legFR.angle = 0;
      this.parts.legBL.angle = 0;
      this.parts.legFL.angle = 0;
      this.parts.legBR.angle = 0;

      // Happy idle tail wag
      this.parts.tail.angle = -35 + Math.sin(time * 0.01) * 8;
    }

    // Bite animation override
    if (time < this.lastBiteAt + 200) {
      this.parts.head.angle = 20;
      this.parts.snout.angle = 20;
      this.parts.snout.y += 3;
    } else {
      this.parts.head.angle = 0;
      this.parts.snout.angle = 0;
    }
  }

  getClosestZombie() {
    const maxRange = this.scanRange ?? 400;
    let closestZombie = null;
    let closestDistance = maxRange;

    this.scene.zombies?.children?.iterate((zombie) => {
      if (!zombie.active || zombie.isDead) return;
      
      const distance = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZombie = zombie;
      }
    });

    return closestZombie;
  }

  updateMovement(time) {
    if (time >= this.lastScanAt + this.scanInterval) {
      this.lastScannedTarget = this.getClosestZombie();
      this.lastScanAt = time;
    }

    const target = this.lastScannedTarget;

    if (target && target.active && !target.isDead) {
      // Chase Zombie
      const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

      if (distanceToTarget <= 40) {
        this.body.setVelocity(0, 0);
        this.biteTarget(target, time);
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
      }
    } else {
      // Follow Player
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      
      if (distanceToPlayer > 100) {
        const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        this.body.setVelocity(Math.cos(angleToPlayer) * this.moveSpeed, Math.sin(angleToPlayer) * this.moveSpeed);
      } else {
        this.body.setVelocity(0, 0);
      }
    }
  }

  biteTarget(target, time) {
    if (time < this.lastBiteAt + this.biteCooldown) {
      return;
    }
    
    this.lastBiteAt = time;

    if (this.scene.combat) {
        this.scene.combat.damageZombie(target, this.biteDamage, { source: 'dog-bite', hitZone: 'body' });
        
        // Visual effect on bite
        const spark = this.scene.add.circle(target.x, target.y - 15, 8, 0xef4444, 0.8);
        this.scene.tweens.add({
            targets: spark,
            scale: 2.5,
            alpha: 0,
            duration: 150,
            onComplete: () => spark.destroy()
        });
    }
  }

  destroy(fromScene) {
    this.aura?.destroy();
    this.dogGroup?.destroy(true); // destroys children as well
    return super.destroy(fromScene);
  }
}
