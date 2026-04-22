import Phaser from 'phaser'

import { createAbilitySystem } from './abilitySystem'
import { createGameEventSystem } from './eventSystem'
import {
  getBossRewardUpgradeChoices,
  getRandomUpgradeChoices,
  getUpgradeDefinition,
  shouldOfferUpgradeForWave,
  UPGRADE_SELECTION_CONFIG,
} from '../config/upgrades'

const UPGRADE_EVENT_OWNER = 'upgrade-runtime'

export function createUpgradeDirector(scene, config) {
  const {
    player,
    zombies,
    gameStore,
    hud,
    soundManager,
    weaponDirector,
  } = config
  const eventSystem = createGameEventSystem(scene)
  const abilitySystem = createAbilitySystem(scene, {
    player,
    gameStore,
    hud,
    soundManager,
  })
  let api = null
  let selectionPollEvent = null
  let autoPickEvent = null

  function getStats() {
    return gameStore.playerCombatStats
  }

  function getUpgradeCount(upgradeId) {
    return gameStore.upgradeCounts?.[upgradeId] ?? 0
  }

  function hasUpgrade(upgradeId) {
    return getUpgradeCount(upgradeId) > 0
  }

  function buildContext(extra = {}) {
    return {
      scene,
      player,
      zombies,
      gameStore,
      hud,
      soundManager,
      weaponDirector,
      abilitySystem,
      eventSystem,
      upgrades: api,
      stats: getStats(),
      hasUpgrade,
      getUpgradeCount,
      ...extra,
    }
  }

  function registerUpgradeEventHooks() {
    eventSystem.clearByOwner(UPGRADE_EVENT_OWNER)

    Object.entries(gameStore.upgradeCounts ?? {}).forEach(([upgradeId, count]) => {
      if (!count) {
        return
      }

      const definition = getUpgradeDefinition(upgradeId)
      const events = definition?.events ?? null

      if (!events) {
        return
      }

      Object.entries(events).forEach(([eventName, handler]) => {
        eventSystem.on(
          eventName,
          (payload = {}) => {
            handler(buildContext({
              ...payload,
              stacks: count,
            }))
          },
          {
            owner: UPGRADE_EVENT_OWNER,
            priority: definition.priority ?? 0,
          },
        )
      })
    })
  }

  function applySlowAura() {
    const stats = getStats()
    const slowRadius = Math.max(0, stats.slowAuraRadius ?? 0)
    const slowStrength = Phaser.Math.Clamp(stats.slowAuraStrength ?? 0, 0, 0.55)
    const hasAura = slowRadius > 0 && slowStrength > 0

    zombies.children.iterate((zombie) => {
      if (!zombie?.active || zombie.isDead) {
        return
      }

      if (!hasAura) {
        zombie.setSpeedModifier?.(1)
        return
      }

      const distance = Phaser.Math.Distance.Between(player.x, player.y, zombie.x, zombie.y)
      zombie.setSpeedModifier?.(distance <= slowRadius ? 1 - slowStrength : 1)
    })
  }

  function shouldOfferSelection(waveConfig, options = {}) {
    return shouldOfferUpgradeForWave(waveConfig, options)
  }

  function clearSelectionFlow() {
    selectionPollEvent?.remove(false)
    autoPickEvent?.remove(false)
    selectionPollEvent = null
    autoPickEvent = null
  }

  function showSelection(waveConfig, onComplete, options = {}) {
    if (
      !shouldOfferUpgradeForWave(waveConfig, {
        lastSelectionWave: options.lastSelectionWave,
      })
      || ['game-over', 'restarting'].includes(gameStore.phase)
    ) {
      return false
    }

    clearSelectionFlow()

    const choices = options.bossReward
      ? getBossRewardUpgradeChoices(gameStore.upgradeCounts)
      : getRandomUpgradeChoices(gameStore.upgradeCounts)

    if (choices.length === 0) {
      return false
    }

    let resolved = false
    const autoPickDelayMs = Math.max(0, options.autoPickDelayMs ?? UPGRADE_SELECTION_CONFIG.autoPickDelayMs)

    function finalizeSelection(selectedUpgradeId, forceComplete = false) {
      if (resolved) {
        return
      }

      if (!selectedUpgradeId) {
        // If forceComplete is true, we must call onComplete even with no upgrade
        // to avoid leaving the game permanently stuck in upgrade-select phase.
        if (forceComplete) {
          resolved = true
          clearSelectionFlow()
          gameStore.clearUpgradeChoices()
          onComplete?.(null)
        }
        return
      }

      resolved = true
      clearSelectionFlow()
      gameStore.clearUpgradeChoices()
      const upgrade = gameStore.applyUpgrade(selectedUpgradeId) ?? getUpgradeDefinition(selectedUpgradeId)

      registerUpgradeEventHooks()

      if (upgrade) {
        hud.flashBanner(`${upgrade.name.toUpperCase()} APPLIED`, upgrade.accentColor ?? '#bef264')
      }

      onComplete?.(upgrade ?? null)
    }

    gameStore.setUpgradeChoices(choices, {
      autoPickEndsAt: autoPickDelayMs > 0 ? Date.now() + autoPickDelayMs : 0,
    })
    gameStore.setPhase('upgrade-select')

    selectionPollEvent = scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        const selectedUpgradeId = gameStore.consumePendingUpgradeChoice()

        if (!selectedUpgradeId) {
          return
        }

        finalizeSelection(selectedUpgradeId)
      },
    })

    if (autoPickDelayMs > 0) {
      autoPickEvent = scene.time.delayedCall(autoPickDelayMs, () => {
        // Try to find a valid fallback choice with an id
        const fallbackChoice = choices.find(c => c?.id) ?? Phaser.Utils.Array.GetRandom(choices)
        finalizeSelection(fallbackChoice?.id ?? null, true)
      })
    }

    return true
  }

  function hide() {
    clearSelectionFlow()
    gameStore.clearUpgradeChoices()
  }

  function getBulletConfig(payload = {}) {
    const { playerStats = getStats() } = payload

    return {
      pierceCount: Math.max(0, Math.floor(playerStats.pierceCount ?? 0)),
      ricochetCount: Math.max(0, Math.floor(playerStats.ricochetCount ?? 0)),
      ricochetRange: Math.max(0, Math.floor(playerStats.ricochetRange ?? 0)),
      ricochetDamageMultiplier: Phaser.Math.Clamp(playerStats.ricochetDamageMultiplier ?? 0.72, 0.2, 1),
    }
  }

  function handleInput(context = {}) {
    abilitySystem.handleInput(buildContext(context))
  }

  function update(time, delta) {
    applySlowAura()
    abilitySystem.update(time, delta)
  }

  function emit(eventName, payload = {}) {
    return eventSystem.emit(eventName, buildContext(payload))
  }

  registerUpgradeEventHooks()

  api = {
    hide,
    showSelection,
    shouldOfferSelection,
    getBulletConfig,
    handleInput,
    handleShot(shot) {
      emit('onShoot', {
        shot,
      })
    },
    handleEnemyHit(payload = {}) {
      emit('onHitEnemy', payload)
    },
    handleEnemyKilled(payload = {}) {
      emit('onKillEnemy', payload)
    },
    handlePlayerDamaged(payload = {}) {
      emit('onPlayerDamaged', payload)
    },
    update,
    hasUpgrade,
    getUpgradeCount,
    getStats,
  }

  return api
}
