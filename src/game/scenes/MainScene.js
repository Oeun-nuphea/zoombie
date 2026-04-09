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
import { createUpgradeDirector } from "../systems/upgradeSystem";
import { createWaveDirector } from "../systems/waveSystem";
import { createWeaponDirector } from "../systems/weaponSystem";
import { createRadarSystem } from "../systems/radarSystem";
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

    this.player = new Player(this, width * 0.5, height * 0.56, {
      getRunStats: () => this.gameStore.playerCombatStats,
      getHealth: () => this.gameStore.health,
    });
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
    this.waveDirector.startWave(this.gameStore.wave);
  }

  update(time, delta) {
    if (this.combat.isGameOver) {
      return;
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

    if (
      this.gameStore.phase === "running" ||
      this.gameStore.phase === "spawning"
    ) {
      this.playerController.update(time, delta);
    }

    if (isActiveCombatPhase) {
      this.upgradeDirector.update(time, delta);
      this.bossDirector.update(time, delta);

      this.zombies.children.iterate((zombie) => {
        zombie?.chase(this.player);
      });

      this.combat.update();
    }

    this.hud.update();
    this.radar.update();
    this.dropDirector.update(time);
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
