import Phaser from "phaser";

import Bullet from "../entities/Bullet";
import CompanionBot from "../entities/CompanionBot";
import Barrel from "../entities/Barrel";
import Player from "../entities/Player";
import { createArenaBackground } from "../systems/arenaSystem";
import { createBossDirector } from "../systems/bossSystem";
import { createCombatDirector } from "../systems/combatSystem";
import { createDropDirector } from "../systems/dropSystem";
import { createCombatHud } from "../systems/hudSystem";
import { createPlayerController } from "../systems/playerControllerSystem";
import { getSoundManager, registerSoundHotkeys } from "../systems/soundManager";
import { createSpawnDirector } from "../systems/spawnSystem";
import { createTurretDirector } from "../systems/turretSystem";
import { createUpgradeDirector } from "../systems/upgradeSystem";
import { createWaveDirector } from "../systems/waveSystem";
import { createWeaponDirector } from "../systems/weaponSystem";
import { createRadarSystem } from "../systems/radarSystem";
import { createPathfindingSystem } from "../systems/pathfindingSystem";
import { createFogOfWarSystem } from "../systems/fogOfWarSystem";
import { pinia } from "../../stores";
import { useGameStore } from "../../stores/gameStore";
import { getSceneGameDimensions } from "../../utils/gameViewport";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.handleScaleResize = this.handleScaleResize.bind(this);
  }

  pauseGameplay() {
    if (!this.physics.world.isPaused) {
      this.physics.pause();
    }
  }

  resumeGameplay() {
    if (this.physics.world.isPaused && !this.combat?.isGameOver) {
      this.physics.resume();
    }
  }

  getWorldDimensions() {
    return getSceneGameDimensions(this);
  }

  clampEntityToBounds(
    entity,
    dimensions = this.getWorldDimensions(),
    margin = 24,
  ) {
    if (!entity?.active) {
      return;
    }

    entity.setPosition(
      Phaser.Math.Clamp(entity.x, margin, dimensions.width - margin),
      Phaser.Math.Clamp(entity.y, margin, dimensions.height - margin),
    );
  }

  applyViewportLayout() {
    const dimensions = this.getWorldDimensions();

    this.worldDimensions = dimensions;
    this.physics.world.setBounds(0, 0, dimensions.width, dimensions.height);
    this.cameras.main.setBounds(0, 0, dimensions.width, dimensions.height);
    this.cameras.main.centerOn(dimensions.width * 0.5, dimensions.height * 0.5);
    this.arena?.resize?.(dimensions);
    this.fogOfWar?.resize?.();
    this.hud?.refreshLayout?.(dimensions);
    this.radar?.refreshLayout?.(dimensions);
    this.spawnDirector?.refreshBounds?.();

    if (this.player) {
      this.clampEntityToBounds(this.player, dimensions, 48);
    }

    this.zombies?.children?.iterate((zombie) => {
      this.clampEntityToBounds(zombie, dimensions, 28);
    });
  }

  handleScaleResize() {
    this.applyViewportLayout();
  }

  spawnBarrels(count = 3) {
    const { width, height } = this.getWorldDimensions();
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(160, width - 160);
      const y = Phaser.Math.Between(160, height - 160);
      this.barrels.get(x, y);
    }
  }

  spawnObstacles(count = 5) {
    const { width, height } = this.getWorldDimensions();
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    for (let i = 0; i < count; i++) {
      let x, y;
      let valid = false;
      for (let attempts = 0; attempts < 15; attempts++) {
        x = Phaser.Math.Between(200, width - 200);
        y = Phaser.Math.Between(200, height - 200);
        if (Phaser.Math.Distance.Between(x, y, centerX, centerY) > 280) {
          valid = true;
          break;
        }
      }
      
      if (valid) {
        const types = ['obstacle-wall', 'obstacle-pillar', 'obstacle-crate'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const obs = this.obstacles.create(x, y, type);
        obs.setDepth(20);
        obs.setRotation(Phaser.Math.FloatBetween(-0.06, 0.06));

        if (type === 'obstacle-wall') {
          obs.body.setSize(116, 44);
          obs.body.setOffset(2, 2);
        } else if (type === 'obstacle-pillar') {
          obs.body.setSize(48, 48);
          obs.body.setOffset(4, 4);
        } else {
          // obstacle-crate
          obs.body.setSize(60, 60);
          obs.body.setOffset(2, 2);
        }
      }
    }
    this.obstacles.refresh();
  }

  create() {
    const { width, height } = this.getWorldDimensions();

    this.gameStore = useGameStore(pinia);
    this.gameStore.beginRunTimer();
    this.gameStore.setPhase("running");
    this.isEnding = false;
    this.scale.on("resize", this.handleScaleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleScaleResize);
    });
    this.soundManager = getSoundManager(this);
    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 60,
      runChildUpdate: true,
    });
    this.barrels = this.physics.add.group({
      classType: Barrel,
      runChildUpdate: true,
    });
    this.physics.add.overlap(this.bullets, this.barrels, (bullet, barrel) => {
      if (barrel.isDestroyed || !bullet.active || barrel.health <= 0) return;
      barrel.takeDamage(bullet.damage ?? 1);
      bullet.destroy();
    });

    this.zombies = this.physics.add.group();

    this.arena = createArenaBackground(this);

    this.obstacles = this.physics.add.staticGroup();
    this.spawnObstacles(6);

    this.player = new Player(this, width * 0.5, height * 0.56, {
      getRunStats: () => this.gameStore.playerCombatStats,
      getHealth: () => this.gameStore.health,
      getMaxHealth: () => this.gameStore.maxPlayerHealth,
    });
    this.player.setDepth(20);

    this.pathfinding = createPathfindingSystem(this, {
      arena: this.arena,
      target: this.player,
      obstacles: this.obstacles,
      updateIntervalMs: 250, // Run BFS every 250ms
    });

    // Fog of War — created AFTER the player so it renders on top of everything
    this.fogOfWar = createFogOfWarSystem(this, {
      player: this.player,
      visibilityFraction: 0.84, // ~84% of shorter axis — 3× the original vision radius
    });

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.zombies, this.obstacles);
    this.physics.add.collider(this.bullets, this.obstacles, (bullet, obstacle) => {
      if (!bullet.active) return;
      bullet.disableBody(true, true);
      const spark = this.add.circle(bullet.x, bullet.y, 4, 0xfacc15, 0.8);
      spark.setDepth(30);
      this.tweens.add({
        targets: spark,
        scale: 2.5,
        alpha: 0,
        duration: 120,
        onComplete: () => spark.destroy(),
      });
    });

    if (this.arena.wallLayer) {
      this.arena.wallLayer.setCollisionByExclusion([-1]);
      this.physics.add.collider(this.player, this.arena.wallLayer);
      this.physics.add.collider(this.zombies, this.arena.wallLayer);
      this.physics.add.collider(this.bullets, this.arena.wallLayer, (bullet) => {
        if (!bullet.active) return;
        bullet.disableBody(true, true);
        const spark = this.add.circle(bullet.x, bullet.y, 4, 0xfacc15, 0.8);
        spark.setDepth(30);
        this.tweens.add({
          targets: spark,
          scale: 2.5,
          alpha: 0,
          duration: 120,
          onComplete: () => spark.destroy(),
        });
      });
    }

    this.hud = createCombatHud(this, this.gameStore);
    registerSoundHotkeys(this, {
      onMuteChange: (muted) => {
        this.hud.flashBanner(muted ? "AUDIO OFF" : "AUDIO ON", "#cbd5e1");
      },
    });
    this.soundManager.playMusic("bgm");
    this.weaponDirector = createWeaponDirector(this, {
      player: this.player,
      bullets: this.bullets,
      gameStore: this.gameStore,
    });
    this.dropDirector = createDropDirector(this, {
      player: this.player,
      weaponDirector: this.weaponDirector,
      gameStore: this.gameStore,
      hud: this.hud,
      soundManager: this.soundManager,
    });
    this.radar = createRadarSystem(this, {
      player: this.player,
      zombies: this.zombies,
      obstacles: this.obstacles,
      dimensions: { width, height },
    });
    this.upgradeDirector = createUpgradeDirector(this, {
      player: this.player,
      zombies: this.zombies,
      gameStore: this.gameStore,
      hud: this.hud,
      soundManager: this.soundManager,
      weaponDirector: this.weaponDirector,
    });
    this.weaponDirector.setUpgradeDirector(this.upgradeDirector);
    this.spawnDirector = createSpawnDirector(this, {
      zombies: this.zombies,
    });
    this.bossDirector = createBossDirector(this, {
      player: this.player,
      zombies: this.zombies,
      spawnDirector: this.spawnDirector,
      combatDirector: {
        handleBossAttack: (...args) => this.combat?.handleBossAttack(...args),
      },
      hud: this.hud,
      soundManager: this.soundManager,
      onHostilesChanged: () => this.waveDirector?.refreshRemaining?.(),
    });
    this.playerController = createPlayerController(this, {
      player: this.player,
      weaponDirector: this.weaponDirector,
      upgradeDirector: this.upgradeDirector,
      zombies: this.zombies,
      onShot: (shot) => {
        if (shot.weapon && shot.pelletsFired > 0) {
          this.combat.handleShot(shot);
          this.upgradeDirector.handleShot(shot);
        }

        if (shot.autoSwapWeapon) {
          this.hud.flashBanner(
            `${shot.autoSwapWeapon.name.toUpperCase()} READY`,
            "#fef08a",
          );
        }
      },
    });
    this.waveDirector = createWaveDirector(this, {
      zombies: this.zombies,
      gameStore: this.gameStore,
      hud: this.hud,
      bossDirector: this.bossDirector,
      spawnDirector: this.spawnDirector,
      upgradeDirector: this.upgradeDirector,
      soundManager: this.soundManager,
      onCampaignVictory: () => this.scheduleVictory(),
      pauseGameplay: () => this.pauseGameplay(),
      resumeGameplay: () => this.resumeGameplay(),
    });
    this.combat = createCombatDirector(this, {
      player: this.player,
      bullets: this.bullets,
      zombies: this.zombies,
      gameStore: this.gameStore,
      hud: this.hud,
      dropDirector: this.dropDirector,
      soundManager: this.soundManager,
      upgradeDirector: this.upgradeDirector,
      onZombieKilled: (zombie) => this.waveDirector.handleZombieKilled(zombie),
      onGameOver: () => this.scheduleGameOver(),
    });

    this.cameras.main.setBackgroundColor("#020617");
    this.input.mouse?.disableContextMenu();
    this.applyViewportLayout();

    this.turretDirector = createTurretDirector(this, {
      zombies: this.zombies,
      combat: this.combat,
    });

    this.waveDirector.startWave(this.gameStore.wave);
  }

  update(time, delta) {
    if (this.isEnding || this.combat?.isGameOver || this.physics.world.isPaused) {
      return;
    }

    this.pathfinding?.update(time);
    this.playerController?.update(time, delta);
    if (this.weaponDirector && this.weaponDirector.update) {
      this.weaponDirector.update(time, delta);
    }

    // Spawn companion bot at wave 8
    if (this.gameStore.wave >= 8 && !this.companionBot) {
      this.companionBot = new CompanionBot(
        this,
        this.player.x,
        this.player.y,
        this.player,
      );
    }

    // Replenish barrels every 2 waves
    if (this._lastBarrelWave === undefined) this._lastBarrelWave = 1;
    const currentWave = this.gameStore.wave;
    if (
      currentWave > this._lastBarrelWave &&
      currentWave % 2 === 0 &&
      this.barrels.countActive() < 6
    ) {
      this.spawnBarrels(2);
      this._lastBarrelWave = currentWave;
    }

    const isActiveCombatPhase = ["running", "spawning", "wave-clear"].includes(
      this.gameStore.phase,
    );

    if (isActiveCombatPhase) {
      if (this.upgradeDirector && this.upgradeDirector.update) {
        this.upgradeDirector.update(time, delta);
      }
      if (this.bossDirector && this.bossDirector.update) {
        this.bossDirector.update(time, delta);
      }

      const allZombies = this.zombies.getChildren()

      // 1. Clear screamer buffs from last frame
      allZombies.forEach((zombie) => zombie?.clearScreamBuff?.())

      // 2. Chase + apply screamer aura from active screamers
      allZombies.forEach((zombie) => {
        zombie?.chase(this.player);
        zombie?.applyScreamAura?.(allZombies);
      })

      // 3. Apply accumulated scream buffs to movement speed and contact damage
      allZombies.forEach((zombie) => {
        if (!zombie?.active || zombie.isDead) return
        if (zombie.screamBuffed) {
          // Speed: capped by setSpeedModifier (max 1.4), so +35% = 1.35 is within bounds
          zombie.setSpeedModifier(1 + (zombie.screamSpeedBonus ?? 0))
          // Damage: capped at base + 2 to prevent runaway stacking
          zombie.contactDamage = Math.min(
            zombie.baseContactDamage + 2,
            zombie.baseContactDamage + (zombie.screamDmgBonus ?? 0),
          )
        } else {
          // Let upgradeSystem slow aura still control non-scream modifier
          // Only reset if we weren't already slowed by the slow aura
          if ((zombie.speedModifier ?? 1) > 1) {
            zombie.setSpeedModifier(1)
          }
        }
      })

      this.combat.update();
      if (this.turretDirector && this.turretDirector.update) {
        this.turretDirector.update(time);
      }
    }

    this.hud.update();
    this.radar.update();
    this.dropDirector.update(time);
    this.fogOfWar?.update(delta);
  }

  scheduleGameOver() {
    if (this.isEnding) {
      return;
    }

    this.isEnding = true;
    this.waveDirector.stop();
    this.bossDirector.clearBoss();
    this.dropDirector.clear();
    this.companionBot?.destroy();
  }

  scheduleVictory() {
    if (this.isEnding) {
      return;
    }

    this.isEnding = true;
    this.waveDirector.stop();
    this.bossDirector.clearBoss();
    this.dropDirector.clear();
    this.companionBot?.destroy();
    this.pauseGameplay();
  }
}
