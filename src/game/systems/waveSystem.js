import Phaser from "phaser";

import {
  WAVE_CONFIG,
  WAVE_REWARD_CONFIG,
  getWaveDefinition,
} from "../config/gameplayConfig";
import { getGameRuntimeProfile } from "../../utils/device";

export function createWaveDirector(scene, config) {
  const {
    zombies,
    gameStore,
    hud,
    bossDirector,
    spawnDirector,
    upgradeDirector,
    soundManager,
    onCampaignVictory,
    pauseGameplay,
    resumeGameplay,
  } = config;
  let currentWave = null;
  let remainingToSpawn = 0;
  let currentBoss = null;
  let spawnEvent = null;
  let bossSpawnEvent = null;
  let startEvent = null;
  let nextWaveEvent = null;
  let selectionEvent = null;
  let temporaryBuffEvent = null;
  let transitioning = false;
  let bossRewardActive = false;
  let lastMajorRewardWave = 0;
  let allSpawnedAt = null; // timestamp when remainingToSpawn first hit 0 (used to detect stuck zombies)
  const STUCK_ZOMBIE_TIMEOUT_MS = 12000; // force-kill after 12 s of no wave clear
  const runtimeProfile = getGameRuntimeProfile();

  // ── Per-wave start sound ────────────────────────────────────────────────
  // Each flavor gives a distinct pitch/source combo so every wave sounds unique.
  // Rate < 1 = deeper/slower, rate > 1 = sharper/higher.
  const WAVE_SOUND_FLAVORS = [
    { key: "zombie-hit", volume: 1.0, rate: 1.35 }, // 1 — low sharp snap
    { key: "zombie-hit", volume: 1.1, rate: 1.7 }, // 2 — brighter sting
    { key: "player-hit", volume: 0.9, rate: 1.1 }, // 3 — heavy thud
    { key: "zombie-hit", volume: 1.0, rate: 2.0 }, // 4 — high-pitched flick
    { key: "headshot-hit", volume: 1.1, rate: 0.85 }, // 5 — deep crunch
    { key: "zombie-hit", volume: 1.2, rate: 1.55 }, // 6 — punchy mid sting
    { key: "player-hit", volume: 1.0, rate: 1.3 }, // 7 — dull impact
    { key: "zombie-hit", volume: 1.1, rate: 1.9 }, // 8 — sharp top-end snap
  ];

  function playWaveStartSound(waveNumber, isBossWave) {
    if (!soundManager) return;

    if (isBossWave) {
      // Boss: deep cinematic boom + high sting layered 80 ms later
      soundManager.play("zombie-death", { volume: 1.3, rate: 0.44 });
      scene.time.delayedCall(80, () => {
        soundManager.play("zombie-hit", { volume: 0.85, rate: 1.8 });
      });
      return;
    }

    // Every 5th wave: add a low rumble underneath the sting for a "milestone" feel
    if (waveNumber % 5 === 0) {
      soundManager.play("zombie-death", { volume: 0.75, rate: 0.68 });
      scene.time.delayedCall(55, () => {
        soundManager.play("zombie-hit", { volume: 1.1, rate: 1.5 });
      });
      return;
    }

    // Normal wave: cycle through the 8 flavors
    const flavor =
      WAVE_SOUND_FLAVORS[(waveNumber - 1) % WAVE_SOUND_FLAVORS.length];
    soundManager.play(flavor.key, { volume: flavor.volume, rate: flavor.rate });
  }

  function applyRuntimeBalance(waveConfig) {
    if (!runtimeProfile.isMobile || !waveConfig) {
      return waveConfig;
    }

    const enemyCountScale = runtimeProfile.performance.enemyCountScale ?? 1;
    const maxAliveScale = runtimeProfile.performance.maxAliveScale ?? 1;
    const spawnIntervalScale =
      runtimeProfile.performance.spawnIntervalScale ?? 1;
    const supportZombieCount = Math.max(
      waveConfig.isBossWave ? 3 : 4,
      Math.round(waveConfig.supportZombieCount * enemyCountScale),
    );

    return {
      ...waveConfig,
      supportZombieCount,
      totalZombies: supportZombieCount + (waveConfig.isBossWave ? 1 : 0),
      maxAlive: Math.max(
        waveConfig.isBossWave ? 4 : 3,
        Math.round(waveConfig.maxAlive * maxAliveScale),
      ),
      spawnInterval: Math.round(waveConfig.spawnInterval * spawnIntervalScale),
    };
  }

  function clearEvents() {
    spawnEvent?.remove(false);
    bossSpawnEvent?.remove(false);
    startEvent?.remove(false);
    nextWaveEvent?.remove(false);
    selectionEvent?.remove(false);
    spawnEvent = null;
    bossSpawnEvent = null;
    startEvent = null;
    nextWaveEvent = null;
    selectionEvent = null;
  }

  function clearTemporaryBuffTimer() {
    temporaryBuffEvent?.remove(false);
    temporaryBuffEvent = null;
  }

  function pickWeightedEntry(entries = []) {
    const totalWeight = entries.reduce(
      (sum, entry) => sum + (entry.weight ?? 1),
      0,
    );

    if (!totalWeight) {
      return null;
    }

    let roll = Phaser.Math.FloatBetween(0, totalWeight);

    for (const entry of entries) {
      roll -= entry.weight ?? 1;

      if (roll <= 0) {
        return entry;
      }
    }

    return entries[0] ?? null;
  }

  function scheduleNextWave(delay = WAVE_CONFIG.interWaveDelay) {
    nextWaveEvent?.remove(false);
    nextWaveEvent = scene.time.delayedCall(delay, () => {
      launchNextWave(gameStore.wave + 1);
    });
  }

  function canRestoreAmmoReward() {
    return (
      Number.isFinite(gameStore.weaponAmmo) &&
      Number.isFinite(gameStore.weaponAmmoMax) &&
      gameStore.weaponAmmo < gameStore.weaponAmmoMax
    );
  }

  function grantHealReward() {
    const missingHealth = Math.max(
      0,
      gameStore.maxPlayerHealth - gameStore.health,
    );

    if (missingHealth <= 0) {
      return null;
    }

    const recoveredHealth = Math.min(
      missingHealth,
      WAVE_REWARD_CONFIG.healAmount,
    );
    gameStore.healPlayer(recoveredHealth);
    soundManager?.play("heal");

    return {
      bannerText:
        recoveredHealth > 1 ? `PATCHED +${recoveredHealth}` : "PATCHED UP",
      bannerColor: "#86efac",
    };
  }

  function grantAmmoReward() {
    if (!canRestoreAmmoReward()) {
      return null;
    }

    const missingAmmo = gameStore.weaponAmmoMax - gameStore.weaponAmmo;
    const refillAmount = Math.min(
      missingAmmo,
      Math.max(
        WAVE_REWARD_CONFIG.ammoRestoreMinimum,
        Math.round(
          gameStore.weaponAmmoMax * WAVE_REWARD_CONFIG.ammoRestoreRatio,
        ),
      ),
    );
    const restoredAmmo = gameStore.restoreWeaponAmmo(refillAmount);

    if (!restoredAmmo?.restored) {
      return null;
    }

    soundManager?.play("pickup", {
      volume: 1.05,
      rate: 1.08,
    });

    return {
      bannerText: `AMMO +${restoredAmmo.restored}`,
      bannerColor: "#93c5fd",
    };
  }

  function grantTemporaryBuffReward() {
    clearTemporaryBuffTimer();

    const reward = WAVE_REWARD_CONFIG.temporaryBuff;
    const expiresAt = Date.now() + reward.durationMs;

    gameStore.setTemporaryCombatBuff(
      {
        damage: reward.damage,
        fireRate: reward.fireRate,
        moveSpeed: reward.moveSpeed,
      },
      expiresAt,
      reward.bannerText,
    );

    temporaryBuffEvent = scene.time.delayedCall(reward.durationMs, () => {
      gameStore.clearTemporaryCombatBuff();
      temporaryBuffEvent = null;
    });

    soundManager?.play("pickup", {
      volume: 1.02,
      rate: 1.12,
    });

    return {
      bannerText: reward.bannerText,
      bannerColor: reward.bannerColor,
    };
  }

  function getAvailableMinorPassiveRewards() {
    return (WAVE_REWARD_CONFIG.minorPassives ?? []).filter((reward) => {
      const currentValue = Number(gameStore.playerStats?.[reward.stat]) || 0;
      return currentValue < (reward.max ?? Infinity);
    });
  }

  function grantMinorPassiveReward() {
    const availableRewards = getAvailableMinorPassiveRewards();
    const reward = Phaser.Utils.Array.GetRandom(availableRewards);

    if (!reward) {
      return null;
    }

    const currentValue = Number(gameStore.playerStats?.[reward.stat]) || 0;
    let nextValue = Math.min(
      reward.max ?? Infinity,
      currentValue + (reward.add ?? 0),
    );

    if (Number.isFinite(reward.precision)) {
      nextValue = Number(nextValue.toFixed(reward.precision));
    }

    gameStore.setPlayerStats({
      [reward.stat]: nextValue,
    });

    soundManager?.play("pickup", {
      volume: 1,
      rate: 0.96,
    });

    return {
      bannerText: reward.bannerText,
      bannerColor: reward.bannerColor,
    };
  }

  function grantNormalWaveReward() {
    const rewardPool = [];

    if (
      gameStore.challengeMode !== "noMercy" &&
      gameStore.health < gameStore.maxPlayerHealth
    ) {
      rewardPool.push({
        weight: WAVE_REWARD_CONFIG.rewardWeights.heal,
        apply: grantHealReward,
      });
    }

    if (canRestoreAmmoReward()) {
      rewardPool.push({
        weight: WAVE_REWARD_CONFIG.rewardWeights.ammo,
        apply: grantAmmoReward,
      });
    }

    if (getAvailableMinorPassiveRewards().length > 0) {
      rewardPool.push({
        weight: WAVE_REWARD_CONFIG.rewardWeights.minorPassive,
        apply: grantMinorPassiveReward,
      });
    }

    rewardPool.push({
      weight: WAVE_REWARD_CONFIG.rewardWeights.temporaryBuff,
      apply: grantTemporaryBuffReward,
    });

    const reward = pickWeightedEntry(rewardPool);
    const appliedReward = reward?.apply?.();

    if (!appliedReward) {
      return false;
    }

    hud.flashBanner(appliedReward.bannerText, appliedReward.bannerColor);
    return true;
  }

  function getPendingBossCount() {
    return currentWave?.boss && !currentWave.boss.spawned ? 1 : 0;
  }

  function updateRemaining() {
    gameStore.setZombiesRemaining(
      remainingToSpawn + getPendingBossCount() + zombies.countActive(true),
    );
  }

  function pumpSpawn() {
    if (!currentWave || transitioning || bossRewardActive) {
      return;
    }

    const activeCount = zombies.countActive(true);
    const availableSlots = currentWave.maxAlive - activeCount;

    if (remainingToSpawn <= 0 || availableSlots <= 0) {
      updateRemaining();

      if (remainingToSpawn <= 0) {
        spawnEvent?.remove(false);
        spawnEvent = null;
        // Start the stuck-zombie clock when no more zombies will spawn
        if (allSpawnedAt === null) {
          allSpawnedAt = scene.time.now;
        }
      }

      return;
    }

    const batchSize = Math.min(
      WAVE_CONFIG.spawnBatchSize,
      availableSlots,
      remainingToSpawn,
    );
    spawnDirector.spawnBatch(currentWave, batchSize);
    remainingToSpawn -= batchSize;
    updateRemaining();

    if (remainingToSpawn <= 0) {
      spawnEvent?.remove(false);
      spawnEvent = null;
      if (allSpawnedAt === null) {
        allSpawnedAt = scene.time.now;
      }
    }
  }

  function spawnBoss() {
    if (!currentWave?.boss || currentWave.boss.spawned || transitioning) {
      return null;
    }

    currentWave.boss.spawned = true;
    currentBoss = spawnDirector.spawnBoss(currentWave);
    bossDirector?.setBoss(currentBoss, currentWave);
    hud.setBossTarget(
      currentBoss,
      currentBoss.bossLabel ?? currentBoss.typeName ?? "Boss",
    );
    updateRemaining();

    return currentBoss;
  }

  function restartSpawnLoop() {
    if (!currentWave || transitioning || bossRewardActive) {
      return;
    }

    if (remainingToSpawn <= 0) {
      updateRemaining();
      return;
    }

    pumpSpawn();

    if (!spawnEvent && remainingToSpawn > 0) {
      spawnEvent = scene.time.addEvent({
        delay: currentWave.spawnInterval,
        loop: true,
        callback: pumpSpawn,
      });
    }
  }

  function tryResolveWaveClear() {
    if (bossRewardActive || remainingToSpawn !== 0 || transitioning) {
      return false;
    }

    const activeZombies = zombies.countActive(true);

    // Safety sweep: if all zombies were spawned 12+ s ago but some are still active
    // (wedged in walls, unreachable, etc.), force-destroy them so the wave can progress.
    if (activeZombies > 0 && allSpawnedAt !== null) {
      const elapsed = scene.time.now - allSpawnedAt;
      if (elapsed >= STUCK_ZOMBIE_TIMEOUT_MS) {
        zombies.getChildren().forEach((zombie) => {
          if (zombie?.active && !zombie.isDead && !zombie.isBoss) {
            zombie.die?.();
          }
        });
        // Give the death animations one frame to fire, then re-check
        scene.time.delayedCall(50, () => tryResolveWaveClear());
        allSpawnedAt = null;
        return false;
      }
    }

    if (activeZombies !== 0) {
      return false;
    }

    transitioning = true;
    allSpawnedAt = null;
    resumeGameplay?.(); // safety: ensure physics is running before wave-clear events fire
    gameStore.setPhase("wave-clear");
    hud.flashBanner(
      currentWave?.endsCampaign ? "AREA SECURED" : "AREA CLEAR",
      "#86efac",
    );

    if (currentWave?.endsCampaign && gameStore.runMode !== "endless") {
      selectionEvent = scene.time.delayedCall(WAVE_CONFIG.upgradeDelay, () => {
        gameStore.finishVictory();
        onCampaignVictory?.();
      });
      return true;
    }

    selectionEvent = scene.time.delayedCall(WAVE_CONFIG.upgradeDelay, () => {
      if (
        !currentWave?.bossRewardGranted &&
        upgradeDirector?.shouldOfferSelection(currentWave, {
          lastSelectionWave: lastMajorRewardWave,
        })
      ) {
        showUpgradeSelection();
        return;
      }

      if (!currentWave?.isBossWave) {
        grantNormalWaveReward();
        scheduleNextWave(WAVE_REWARD_CONFIG.normalRewardDelay);
        return;
      }

      scheduleNextWave();
    });

    return true;
  }

  function showBossRewardSelection() {
    if (
      !currentWave?.isMiniBossWave ||
      currentWave?.bossRewardGranted ||
      bossRewardActive
    ) {
      return false;
    }

    bossRewardActive = true;
    currentWave.bossRewardGranted = true;
    spawnEvent?.remove(false);
    spawnEvent = null;
    pauseGameplay?.();

    const selectionOpened = upgradeDirector?.showSelection(
      currentWave,
      () => {
        lastMajorRewardWave = currentWave?.number ?? lastMajorRewardWave;
        bossRewardActive = false;
        const hostilesRemain =
          remainingToSpawn > 0 ||
          zombies.countActive(true) > 0 ||
          getPendingBossCount() > 0;

        if (hostilesRemain) {
          gameStore.setPhase("running");
          resumeGameplay?.();
          restartSpawnLoop();
          updateRemaining();
          return;
        }

        // Always resume physics before handing off to wave-clear logic —
        // if transitioning is stale-true the wave would silently lock otherwise.
        resumeGameplay?.();
        tryResolveWaveClear();
      },
      {
        bossReward: true,
        lastSelectionWave: lastMajorRewardWave,
      },
    );

    if (!selectionOpened) {
      bossRewardActive = false;
      const hostilesRemain =
        remainingToSpawn > 0 ||
        zombies.countActive(true) > 0 ||
        getPendingBossCount() > 0;

      if (hostilesRemain) {
        gameStore.setPhase("running");
        resumeGameplay?.();
        restartSpawnLoop();
      }

      return false;
    }

    return true;
  }

  function launchNextWave(waveNumber) {
    clearEvents();
    transitioning = false;
    currentWave = applyRuntimeBalance(
      getWaveDefinition(waveNumber, {
        mode: gameStore.runMode,
      }),
    );
    currentWave.bossRewardGranted = false;
    currentBoss = null;
    remainingToSpawn =
      currentWave.supportZombieCount ?? currentWave.totalZombies;
    bossRewardActive = false;
    allSpawnedAt = null;
    upgradeDirector?.hide();
    bossDirector?.clearBoss();
    hud.clearBossTarget();
    resumeGameplay?.();

    spawnDirector.selectWaveSpawnPoints(currentWave);
    gameStore.setWave(currentWave.number);
    gameStore.setWaveInfo(currentWave);
    gameStore.setPhase("spawning");
    updateRemaining();

    // Overtime: 40% faster spawns
    if (gameStore.challengeMode === "overtime") {
      currentWave.spawnInterval = Math.max(
        WAVE_CONFIG.minSpawnInterval,
        Math.round(currentWave.spawnInterval * 0.6),
      );
    }
    hud.showWaveSplash(currentWave);
    playWaveStartSound(currentWave.number, currentWave.isBossWave);

    startEvent = scene.time.delayedCall(WAVE_CONFIG.startDelay, () => {
      gameStore.setPhase("running");

      if (currentWave.isBossWave) {
        bossSpawnEvent = scene.time.delayedCall(
          currentWave.boss?.spawnDelayMs ?? 0,
          () => {
            bossSpawnEvent = null;
            spawnBoss();
          },
        );
      }

      pumpSpawn();

      if (remainingToSpawn > 0) {
        spawnEvent = scene.time.addEvent({
          delay: currentWave.spawnInterval,
          loop: true,
          callback: pumpSpawn,
        });
      }
    });
  }

  function showUpgradeSelection() {
    pauseGameplay?.();

    const selectionOpened = upgradeDirector?.showSelection(
      currentWave,
      () => {
        lastMajorRewardWave = currentWave?.number ?? lastMajorRewardWave;
        scheduleNextWave();
      },
      {
        lastSelectionWave: lastMajorRewardWave,
      },
    );

    if (!selectionOpened) {
      // Resume physics since pauseGameplay() was called above but no selection opened
      resumeGameplay?.();

      if (!currentWave?.isBossWave) {
        grantNormalWaveReward();
        scheduleNextWave(WAVE_REWARD_CONFIG.normalRewardDelay);
        return;
      }

      scheduleNextWave();
    }
  }

  function startWave(waveNumber) {
    if (waveNumber <= 1) {
      lastMajorRewardWave = 0;
      clearTemporaryBuffTimer();
      gameStore.clearTemporaryCombatBuff();
    }

    launchNextWave(waveNumber);
  }

  function handleZombieKilled(zombie) {
    if (zombie?.isBoss) {
      currentBoss = null;
      bossDirector?.clearBoss();
      hud.clearBossTarget();
    }

    if (currentBoss && (!currentBoss.active || currentBoss.isDead)) {
      currentBoss = null;
      bossDirector?.clearBoss();
      hud.clearBossTarget();
    }

    updateRemaining();

    if (spawnEvent && remainingToSpawn > 0) {
      pumpSpawn();
    }

    if (zombie?.isMiniBoss && showBossRewardSelection()) {
      return;
    }

    tryResolveWaveClear();
  }

  function stop() {
    transitioning = true;
    currentBoss = null;
    bossRewardActive = false;
    bossDirector?.clearBoss();
    hud.clearBossTarget();
    upgradeDirector?.hide();
    clearEvents();
    clearTemporaryBuffTimer();
    gameStore.clearTemporaryCombatBuff();
  }

  return {
    refreshRemaining: updateRemaining,
    startWave,
    handleZombieKilled,
    stop,
  };
}
