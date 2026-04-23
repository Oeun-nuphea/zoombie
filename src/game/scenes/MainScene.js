import Phaser from "phaser";

import Bullet from "../entities/Bullet";
import CompanionDog from "../entities/CompanionDog";
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
import { createWeatherSystem } from "../systems/weatherSystem";
import { pinia } from "../../stores";
import { useGameStore } from "../../stores/gameStore";
import { getSceneGameDimensions } from "../../utils/gameViewport";
import { getWaveDefinition } from "../config/gameplayConfig";
import { MAP_CONFIG } from "../../utils/constants";

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
    // When a tilemap is loaded (including adventure's tiled arena1),
    // the physics world bounds reflect the full world size.
    // Fall back to screen dimensions only for fallback (procedural) arenas.
    if (this.arena?.map) {
      return {
        width: this.physics.world.bounds.width || this.arena.map.widthInPixels,
        height: this.physics.world.bounds.height || this.arena.map.heightInPixels,
      };
    }
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
    const screenDimensions = getSceneGameDimensions(this);

    this.worldDimensions = dimensions;

    // Physics world = full tilemap/arena size
    this.physics.world.setBounds(0, 0, dimensions.width, dimensions.height);

    // Camera scrolls through the full world and is bounded to it
    this.cameras.main.setBounds(0, 0, dimensions.width, dimensions.height);

    // Only re-center camera on initial layout (if player not yet following)
    if (!this._cameraFollowing) {
      this.cameras.main.centerOn(dimensions.width * 0.5, dimensions.height * 0.5);
    }

    this.arena?.resize?.(screenDimensions);
    this.fogOfWar?.resize?.();
    this.hud?.refreshLayout?.(screenDimensions);
    this.radar?.refreshLayout?.(screenDimensions);
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
        // Boost the frequency of trees!
        const types = ['obstacle-tree-1', 'obstacle-tree-2', 'obstacle-tree-3', 'obstacle-tree-4', 'obstacle-tree-5', 'obstacle-tree-6'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const obs = this.obstacles.create(x, y, type);
        
        const scale = Phaser.Math.FloatBetween(0.7, 1.8);
        obs.setScale(scale);
        obs.setDepth(24);
        obs.setRotation(Phaser.Math.FloatBetween(-0.06, 0.06));

        // collision on the trunk
        // Since we scale the sprite, let's keep the circle size fixed relative to the unscaled texture
        // or we can adjust it by scale. 
        obs.body.setCircle(16 * scale);
        // setOffset takes unscaled pixel values for coordinates. To center the circle (radius 16 * scale) at unscaled (48, 60),
        obs.body.setOffset((48 - 16) / scale, (60 - 16) / scale); // actually phaser offset on scaled circles is weird, standard offset is (32, 44)
        // A safer way is to just use default offset and adjust geometry:
        // Actually since we changed scale, we should just use:
        obs.body.setOffset(32, 44);

        // However, standard workaround for Phaser 3 scaled static circles is to not use setScale on the body, just let body follow display origin if we don't scale it?
        // Let's just use:
        obs.refreshBody();
        obs.body.setCircle(16 * scale, (48 * scale - 16 * scale), (60 * scale - 16 * scale));
      }
    }
    // No need to refresh again since refreshBody was called on each, but it's safe.
    this.obstacles.refresh();
  }

  create() {
    this.gameStore = useGameStore(pinia);

    // ── Adventure map: 4× world, force endless ─────────────────────────
    const mapConfig = MAP_CONFIG[this.gameStore.currentRunMap];
    if (mapConfig?.endless && this.gameStore.runMode !== 'endless') {
      this.gameStore.setRunMode('endless');
    }
    this._adventureMap = Boolean(mapConfig?.endless);
    this._worldScale = mapConfig?.worldScale ?? 1;

    const { width, height } = this.getWorldDimensions();

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
    // More obstacles on the big adventure map
    const obstacleCount = this._adventureMap ? 60 : 18;
    this.spawnObstacles(obstacleCount);

    // Spawn player at the center of the WORLD (tilemap), not the screen
    const worldDims = this.getWorldDimensions();
    this.player = new Player(this, worldDims.width * 0.5, worldDims.height * 0.5, {
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
      radius: 700, // Light circle radius in pixels (you can increase this to make it even larger!)
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

    // Adventure map: register wall collisions for the extra 3 tilemap copies
    if (this.arena.extraCopies) {
      for (const copy of this.arena.extraCopies) {
        if (!copy.wallLayer) continue;
        copy.wallLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, copy.wallLayer);
        this.physics.add.collider(this.zombies, copy.wallLayer);
        this.physics.add.collider(this.bullets, copy.wallLayer, (bullet) => {
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
      dimensions: this.getWorldDimensions(),
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
    this.weather = createWeatherSystem(this, {
      fogOfWar: this.fogOfWar,
      soundManager: this.soundManager,
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
      onCampaignVictory: () => {
        this.gameStore.finishVictory();
        this.scheduleVictory();
      },
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

    // Camera follows the player through the world
    this._cameraFollowing = true;
    this.cameras.main.startFollow(
      this.player,
      false,         // round pixels for crisp tiles -> must be false to avoid micro-jitter with lerp!
      0.12,          // lerp X — smooth follow
      0.12,          // lerp Y — smooth follow
    );
    // slightly zoom out to give player more peripheral tactical vision
    this.cameras.main.setZoom(0.82);

    this.turretDirector = createTurretDirector(this, {
      zombies: this.zombies,
      combat: this.combat,
    });

    this.waveDirector.startWave(this.gameStore.wave);
  }

  update(time, delta) {
    // Always update visual/HUD systems regardless of pause state
    this.hud?.update();
    this.radar?.update();
    this.weather?.update();
    this.fogOfWar?.update(delta);

    if (this.isEnding || this.combat?.isGameOver) {
      return;
    }

    // Safety watchdog: detect stuck physics-pause states.
    // If physics is paused but we're NOT in a legitimate pause phase
    // (paused, upgrade-select, victory, game-over, restarting),
    // force-resume after 15 seconds to prevent permanent freezes.
    if (this.physics.world.isPaused) {
      const legitimatePausePhases = ['paused', 'upgrade-select', 'victory', 'game-over', 'restarting', 'starting', 'idle'];
      const currentPhase = this.gameStore?.phase;
      if (!legitimatePausePhases.includes(currentPhase)) {
        if (!this._stuckPauseSince) {
          this._stuckPauseSince = time;
        } else if (time - this._stuckPauseSince > 15000) {
          console.warn('[MainScene] Force-resuming stuck physics pause. Phase:', currentPhase);
          this._stuckPauseSince = 0;
          this.physics.resume();
        }
      } else {
        this._stuckPauseSince = 0;
      }
      return;
    }

    this._stuckPauseSince = 0;

    this.pathfinding?.update(time);
    this.playerController?.update(time, delta);
    if (this.weaponDirector && this.weaponDirector.update) {
      this.weaponDirector.update(time, delta);
    }

    // Spawn companion dog at wave 3
    if (this.gameStore.wave >= 3 && !this.companionBot) {
      this.companionBot = new CompanionDog(
        this,
        this.player.x,
        this.player.y,
        this.player,
      );
      this.physics.add.collider(this.companionBot, this.obstacles);
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

    this.dropDirector?.update(time);
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

  startExtractionPhase() {
    if (this.isEnding || this.gameStore.phase === "extraction") {
      return;
    }

    this.gameStore.setPhase("extraction");
    this.hud.flashBanner("EVAC ZONE INBOUND", "#3b82f6");
    
    // Pick random location for extracting
    const { width, height } = this.getWorldDimensions();
    const x = Phaser.Math.Between(200, width - 200);
    const y = Phaser.Math.Between(200, height - 200);

    // Create EVAC ZONE graphic
    this.evacZone = this.add.circle(x, y, 160, 0x10b981, 0.2);
    this.evacZone.setStrokeStyle(4, 0x10b981, 0.8);
    this.evacZone.setDepth(1);
    
    // Animate evac zone
    this.tweens.add({
      targets: this.evacZone,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.extractionTimeLeft = 45; // 45s to reach
    this.inZoneTimeElapsed = 0;
    this.extractionRequiredTime = 30; // 30s to hold
    
    // Start infinite zombie spawning (much faster spawn rate)
    this.extractionSpawnTimer = this.time.addEvent({
      delay: 350,
      loop: true,
      callback: () => {
        // Cap zombies
        if (this.zombies.countActive() > 25) return;
        const waveConfig = getWaveDefinition(10, { mode: this.gameStore.runMode });
        this.spawnDirector.spawnZombie(waveConfig);
      }
    });

    const screenDims = getSceneGameDimensions(this);
    this.evacText = this.add.text(screenDims.width / 2, 80, "REACH EVAC ZONE: 45s", {
      fontSize: "32px",
      fontFamily: "Trebuchet MS",
      fontStyle: "bold",
      color: "#fca5a5"
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    // Update loop text
    this.evacUpdateTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.evacZone.x, this.evacZone.y);
        
        if (dist <= 160) {
          this.inZoneTimeElapsed++;
          
          this.evacText.setText(`HOLD ZONE: ${this.extractionRequiredTime - this.inZoneTimeElapsed}s`);
          this.evacText.setColor("#86efac");
          
          if (this.inZoneTimeElapsed >= this.extractionRequiredTime) {
            this.successExtraction();
          }
        } else {
          this.extractionTimeLeft--;
          this.evacText.setText(`REACH EVAC ZONE: ${this.extractionTimeLeft}s`);
          this.evacText.setColor("#fca5a5");
          
          if (this.extractionTimeLeft <= 0) {
            this.failedExtraction();
          }
        }
      }
    });

    // Optional: guide marker pointing to evac zone if outside camera
  }

  successExtraction() {
    this.evacUpdateTimer?.remove();
    this.extractionSpawnTimer?.remove();
    this.evacText?.destroy();
    this.evacZone?.destroy();
    
    this.hud.flashBanner("EXTRACTION SUCCESS", "#3b82f6");
    
    this.time.delayedCall(2000, () => {
       this.gameStore.finishVictory();
       this.scheduleVictory();
    });
  }

  failedExtraction() {
    this.evacUpdateTimer?.remove();
    this.extractionSpawnTimer?.remove();
    this.evacText?.destroy();
    this.evacZone?.destroy();
    
    // Player failed to extract in time
    this.player.takeDamage(9999);
  }
}
