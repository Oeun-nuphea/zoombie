import Phaser from 'phaser';

// Companion Dog upgrade tiers — unlocked by wave
const DOG_TIERS = [
  {
    wave: 5,
    label: 'DOG ONLINE',
    biteCooldown: 500,
    biteDamage: 2,
    scanRange: 600,
    moveSpeed: 450,
    auraColor: 0x4ade80,
    auraAlpha: 0.38,
  },
  {
    wave: 11,
    label: 'DOG UPGRADED',
    biteCooldown: 400,
    biteDamage: 3,
    scanRange: 700,
    moveSpeed: 550,
    auraColor: 0x38bdf8,
    auraAlpha: 0.5,
  },
  {
    wave: 14,
    label: 'DOG OVERCLOCKED',
    biteCooldown: 300,
    biteDamage: 5,
    scanRange: 800,
    moveSpeed: 650,
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

    // --- Back Legs --- (longer)
    const legBL = scene.add.ellipse(-14, 10, 8, 30, tan).setOrigin(0.5, 0.1);
    const legFL = scene.add.ellipse(14, 10, 8, 30, tan).setOrigin(0.5, 0.1);
    
    // --- Tail --- (bushy and angled down)
    const tail = scene.add.ellipse(-24, -4, 10, 36, dark).setOrigin(0.5, 0.1).setAngle(-45);
    
    // --- Neck ---
    const neck = scene.add.ellipse(18, -10, 14, 24, tan).setAngle(40);

    // --- Body --- (slimmer torso, less round)
    const bodyTan = scene.add.ellipse(0, 2, 48, 16, tan);
    const bodyDark = scene.add.ellipse(-4, -6, 46, 18, dark); // Saddle 
    
    // --- Head --- (protruding and pointed)
    const head = scene.add.ellipse(28, -22, 16, 16, tan);
    const snout = scene.add.ellipse(38, -20, 14, 8, black); 
    const earL = scene.add.triangle(25, -34, 0, 14, 4, 0, 8, 14, dark);
    const earR = scene.add.triangle(31, -34, 0, 14, 4, 0, 8, 14, dark);

    // --- Front Legs ---
    const legBR = scene.add.ellipse(-14, 10, 9, 30, tan).setOrigin(0.5, 0.1);
    const legFR = scene.add.ellipse(14, 10, 9, 30, tan).setOrigin(0.5, 0.1);

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
      const bounce = Math.abs(Math.sin(stride * 1.5)) * 6;

      this.parts.bodyDark.y = -6 + bounce;
      this.parts.bodyTan.y = 2 + bounce;
      this.parts.neck.y = -10 + bounce * 0.9;
      this.parts.head.y = -22 + bounce * 0.7;
      this.parts.snout.y = -20 + bounce * 0.7;
      this.parts.earL.y = -34 + bounce * 0.7;
      this.parts.earR.y = -34 + bounce * 0.7;
      this.parts.tail.y = -4 + bounce;

      // Leg swings
      this.parts.legFR.angle = Math.sin(stride) * 55;
      this.parts.legBL.angle = Math.sin(stride) * 55;
      
      this.parts.legFL.angle = Math.sin(stride + Math.PI) * 55;
      this.parts.legBR.angle = Math.sin(stride + Math.PI) * 55;
      
      // Wag tail while running
      this.parts.tail.angle = -45 + Math.sin(stride * 3) * 20;
    } else {
      // Idle breathing animation
      const breathe = Math.sin(time * 0.003) * 2;
      
      this.parts.bodyDark.y = -6 + breathe;
      this.parts.bodyTan.y = 2 + breathe;
      this.parts.neck.y = -10 + breathe * 0.5;
      this.parts.head.y = -22 + breathe * 0.3;
      this.parts.snout.y = -20 + breathe * 0.3;
      this.parts.earL.y = -34 + breathe * 0.3;
      this.parts.earR.y = -34 + breathe * 0.3;
      this.parts.tail.y = -4 + breathe;

      this.parts.legFR.angle = 0;
      this.parts.legBL.angle = 0;
      this.parts.legFL.angle = 0;
      this.parts.legBR.angle = 0;

      // Happy idle tail wag
      this.parts.tail.angle = -45 + Math.sin(time * 0.01) * 12;
    }

    // Bite animation override
    if (time < this.lastBiteAt + 200) {
      this.parts.head.angle = 15;
      this.parts.snout.angle = 15;
      this.parts.snout.y += 2;
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

  steerTowards(targetX, targetY) {
    let steerX = targetX;
    let steerY = targetY;

    if (this.scene.obstacles) {
      let avoidX = 0;
      let avoidY = 0;

      const toTargetX = steerX - this.x;
      const toTargetY = steerY - this.y;
      const toTargetLen = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY) || 1;
      const dirX = toTargetX / toTargetLen;
      const dirY = toTargetY / toTargetLen;

      this.scene.obstacles.children.iterate((obs) => {
        if (!obs || !obs.active) return;

        const obsBodyW = obs.body?.width ?? 60;
        const obsBodyH = obs.body?.height ?? 60;
        const obsRadius = Math.max(obsBodyW, obsBodyH) * 0.5;
        const avoidanceRadius = obsRadius + 45; // dog is smaller than zombie
        const avoidanceRadiusSq = avoidanceRadius * avoidanceRadius;

        const dx = this.x - obs.x;
        const dy = this.y - obs.y;
        const distSq = dx * dx + dy * dy;

        if (distSq >= avoidanceRadiusSq || distSq <= 0) return;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        const proximityForce = ((avoidanceRadius - dist) / avoidanceRadius);
        const pushStrength = proximityForce * proximityForce * 200;

        avoidX += nx * pushStrength;
        avoidY += ny * pushStrength;

        const cross = dx * (targetY - this.y) - dy * (targetX - this.x);
        const slideDir = cross > 0 ? 1 : -1;
        const tangentX = -ny * slideDir;
        const tangentY = nx * slideDir;
        const slideStrength = proximityForce * 180;

        avoidX += tangentX * slideStrength;
        avoidY += tangentY * slideStrength;
      });

      const velSq = (this.body.velocity.x || 0) ** 2 + (this.body.velocity.y || 0) ** 2;
      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      
      // Stuck detection - apply strong lateral force if speed is unexpectedly low
      if (velSq < 100 && distance > 50) {
        avoidX += -dirY * 180;
        avoidY += dirX * 180;
      }

      steerX += avoidX;
      steerY += avoidY;
    }

    this.scene.physics.moveTo(this, steerX, steerY, this.moveSpeed);
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
        this.steerTowards(target.x, target.y);
      }
    } else {
      // Follow Player
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      
      if (distanceToPlayer > 100) {
        this.steerTowards(this.player.x, this.player.y);
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
