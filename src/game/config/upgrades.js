import Phaser from 'phaser'

import { createFloatingCombatText, createImpactBurst, createLightningArc } from '../systems/effectsSystem'
import { PLAYER_CONFIG } from './gameplayConfig'

export const UPGRADE_SELECTION_CONFIG = {
  waveInterval: 3,
  cardsPerSelection: 2,
  bossCardsPerSelection: 3,
  autoPickDelayMs: 4500,
}

export const UPGRADE_TYPES = Object.freeze({
  passive: 'passive',
  active: 'active',
  event: 'event',
})

export const PLAYER_STAT_DEFAULTS = Object.freeze({
  damage: 1,
  fireRate: 1,
  moveSpeed: 1,
  bulletCount: 0,
  maxHP: PLAYER_CONFIG.maxHealth,
  lifesteal: 0,
  pierceCount: 0,
  ricochetCount: 0,
  ricochetRange: 164,
  ricochetDamageMultiplier: 0.72,
  explosionRadius: 0,
  explosionDamage: 0,
  explosionMaxTargets: 0,
  dashDistance: 0,
  dashSpeed: 0,
  dashDurationMs: 120,
  dashCooldownMs: 2400,
  dashInvulnerabilityMs: 180,
  shieldDurationMs: 0,
  shieldCooldownMs: 12000,
  slowAuraRadius: 0,
  slowAuraStrength: 0,
  headshotAmmoRestore: 0,
  // Chain Lightning
  chainLightningTargets: 0,
  chainLightningDamage: 0,
  // Vampiric Rounds
  vampiricHpPerHit: 0,
  // Frag Grenade
  grenadeCooldownMs: 0,
  grenadeRadius: 0,
  grenadeDamage: 0,
  grenadeMaxTargets: 0,
  // Turret Drop
  turretDurationMs: 0,
})

function clampStatValue(value, effect) {
  let nextValue = value

  if (Number.isFinite(effect.set)) {
    nextValue = effect.set
  }

  if (Number.isFinite(effect.add)) {
    nextValue += effect.add
  }

  if (Number.isFinite(effect.multiply)) {
    nextValue *= effect.multiply
  }

  if (effect.round === 'ceil') {
    nextValue = Math.ceil(nextValue)
  } else if (effect.round === 'floor') {
    nextValue = Math.floor(nextValue)
  } else if (effect.round === 'round') {
    nextValue = Math.round(nextValue)
  }

  if (Number.isFinite(effect.min)) {
    nextValue = Math.max(effect.min, nextValue)
  }

  if (Number.isFinite(effect.max)) {
    nextValue = Math.min(effect.max, nextValue)
  }

  if (Number.isFinite(effect.precision)) {
    nextValue = Number(nextValue.toFixed(effect.precision))
  }

  return nextValue
}

function applyEffectsToStats(baseStats, effects = []) {
  const nextStats = {
    ...baseStats,
  }

  effects.forEach((effect) => {
    const currentValue = nextStats[effect.stat]

    if (!Number.isFinite(currentValue)) {
      return
    }

    nextStats[effect.stat] = clampStatValue(currentValue, effect)
  })

  return nextStats
}

function createUpgradeDefinition(definition) {
  const resolved = {
    type: UPGRADE_TYPES.passive,
    stackable: false,
    maxStacks: 1,
    weight: 1,
    bossFeatured: false,
    effects: [],
    ...definition,
  }

  resolved.maxStacks = resolved.stackable ? Math.max(1, resolved.maxStacks ?? 1) : 1

  if (typeof resolved.apply !== 'function') {
    resolved.apply = ({ stats }) => applyEffectsToStats(stats, resolved.effects)
  }

  return Object.freeze(resolved)
}

export const UPGRADE_DEFINITIONS = {
  damageBoost: createUpgradeDefinition({
    id: 'damageBoost',
    name: 'Hollow Point',
    description: '+18% bullet damage. Keeps direct-hit builds relevant deeper into the run.',
    shortDescription: '+18% bullet damage.',
    quickLabel: '+18% DMG',
    accentColor: '#fb923c',
    stackable: true,
    maxStacks: 4,
    weight: 1.15,
    effects: [
      {
        stat: 'damage',
        add: 0.18,
        max: 2.4,
        precision: 2,
      },
    ],
  }),
  fireRateBoost: createUpgradeDefinition({
    id: 'fireRateBoost',
    name: 'Rapid Cycling',
    description: '+14% fire rate. Good for precision and proc-heavy builds.',
    shortDescription: '+14% fire rate.',
    quickLabel: '+14% FIRE RATE',
    accentColor: '#60a5fa',
    stackable: true,
    maxStacks: 4,
    weight: 1.15,
    effects: [
      {
        stat: 'fireRate',
        add: 0.14,
        max: 2.05,
        precision: 2,
      },
    ],
  }),
  moveSpeedBoost: createUpgradeDefinition({
    id: 'moveSpeedBoost',
    name: 'Combat Stims',
    description: '+8% movement speed. Helps kite, reposition, and extend dash routes.',
    shortDescription: '+8% movement speed.',
    quickLabel: '+8% MOVE SPD',
    accentColor: '#34d399',
    stackable: true,
    maxStacks: 3,
    weight: 1,
    effects: [
      {
        stat: 'moveSpeed',
        add: 0.08,
        max: 1.4,
        precision: 2,
      },
    ],
  }),
  maxHpBoost: createUpgradeDefinition({
    id: 'maxHpBoost',
    name: 'Field Conditioning',
    description: '+10% max HP and immediately grants the added health.',
    shortDescription: '+10% max HP now.',
    quickLabel: '+10% MAX HP',
    accentColor: '#f87171',
    stackable: true,
    maxStacks: 3,
    weight: 0.95,
    effects: [
      {
        stat: 'maxHP',
        multiply: 1.1,
        round: 'round',
        max: 12,
      },
    ],
  }),
  lifestealBoost: createUpgradeDefinition({
    id: 'lifestealBoost',
    name: 'Blood Drive',
    description: '+4% lifesteal. Sustains aggressive bullet-based builds.',
    shortDescription: '+4% lifesteal.',
    quickLabel: '+4% LIFESTEAL',
    accentColor: '#c084fc',
    stackable: true,
    maxStacks: 3,
    weight: 0.9,
    effects: [
      {
        stat: 'lifesteal',
        add: 0.04,
        max: 0.18,
        precision: 2,
      },
    ],
  }),
  pierceShot: createUpgradeDefinition({
    id: 'pierceShot',
    name: 'Piercing Rounds',
    description: 'Bullets pass through enemies before collapsing. Extra stacks add another pierce.',
    shortDescription: 'Shots pierce extra targets.',
    quickLabel: 'PIERCE SHOTS',
    type: UPGRADE_TYPES.passive,
    bossFeatured: true,
    accentColor: '#facc15',
    stackable: true,
    maxStacks: 2,
    weight: 0.9,
    effects: [
      {
        stat: 'pierceCount',
        add: 1,
        max: 2,
      },
    ],
  }),
  ricochetShot: createUpgradeDefinition({
    id: 'ricochetShot',
    name: 'Ricochet Lattice',
    description: 'Spent bullets bounce toward nearby enemies. Extra stacks add one more bounce and more search range.',
    shortDescription: 'Shots ricochet to nearby enemies.',
    quickLabel: 'RICOCHET',
    type: UPGRADE_TYPES.passive,
    bossFeatured: true,
    accentColor: '#67e8f9',
    stackable: true,
    maxStacks: 2,
    weight: 0.78,
    effects: [
      {
        stat: 'ricochetCount',
        add: 1,
        max: 2,
      },
      {
        stat: 'ricochetRange',
        add: 28,
        max: 220,
      },
      {
        stat: 'ricochetDamageMultiplier',
        add: 0.06,
        max: 0.82,
        precision: 2,
      },
    ],
  }),
  explosiveKill: createUpgradeDefinition({
    id: 'explosiveKill',
    name: 'Volatile Finish',
    description: 'Bullet kills detonate and damage nearby enemies. Chain explosions are disabled for balance.',
    shortDescription: 'Kills trigger a small blast.',
    quickLabel: 'BLAST ON KILL',
    type: UPGRADE_TYPES.event,
    bossFeatured: true,
    accentColor: '#fb7185',
    stackable: true,
    maxStacks: 2,
    weight: 0.72,
    effects: [
      {
        stat: 'explosionRadius',
        add: 44,
        max: 128,
      },
      {
        stat: 'explosionDamage',
        add: 1,
        max: 2,
      },
      {
        stat: 'explosionMaxTargets',
        add: 3,
        max: 8,
      },
    ],
    events: {
      onKillEnemy(context) {
        const {
          combat,
          scene,
          soundManager,
          stats,
          source,
          zombie,
        } = context

        if (
          !combat
          || !scene
          || !zombie
          || source === 'explosion'
          || zombie.isBoss
          || !Number.isFinite(stats.explosionDamage)
          || stats.explosionDamage <= 0
        ) {
          return
        }

        const originX = zombie.x
        const originY = zombie.y - 8

        createImpactBurst(scene, originX, originY, {
          color: 0xf97316,
          radius: 28,
          endRadius: Math.max(56, stats.explosionRadius + 10),
          particleCount: 18,
          duration: 260,
          depth: 32,
        })
        createFloatingCombatText(scene, originX, originY - 18, 'BOOM', {
          color: '#fdba74',
          shadowColor: '#4a1205',
          fontSize: '20px',
          duration: 520,
          rise: 18,
          depth: 34,
        })

        soundManager?.play('zombie-hit', {
          volume: 1.05,
          rate: 0.7,
        })

        combat.damageEnemiesInRadius(
          {
            x: originX,
            y: originY,
          },
          stats.explosionRadius,
          {
            damage: stats.explosionDamage,
            maxTargets: Math.max(3, Math.floor(stats.explosionMaxTargets || 0)),
            excludeZombie: zombie,
            source: 'explosion',
            cameraShakeDuration: 60,
            cameraShakeIntensity: 0.0016,
          },
        )
      },
    },
  }),
  dashAbility: createUpgradeDefinition({
    id: 'dashAbility',
    name: 'Burst Step',
    description: 'Press Space to dash. Extra stacks extend range and shorten cooldown.',
    shortDescription: 'Dash through danger.',
    quickLabel: 'UNLOCK DASH',
    type: UPGRADE_TYPES.active,
    bossFeatured: true,
    accentColor: '#93c5fd',
    stackable: true,
    maxStacks: 2,
    weight: 0.8,
    effects: [
      {
        stat: 'dashDistance',
        add: 180,
        max: 360,
      },
      {
        stat: 'dashSpeed',
        add: 640,
        max: 1280,
      },
      {
        stat: 'dashDurationMs',
        add: 10,
        max: 140,
      },
      {
        stat: 'dashInvulnerabilityMs',
        add: 30,
        max: 220,
      },
      {
        stat: 'dashCooldownMs',
        add: -650,
        min: 1100,
      },
    ],
  }),
  temporaryShield: createUpgradeDefinition({
    id: 'temporaryShield',
    name: 'Aegis Pulse',
    description: 'Press Q to project a brief damage-absorbing shield. Extra stacks lengthen uptime and reduce cooldown.',
    shortDescription: 'Gain a brief shield.',
    quickLabel: 'UNLOCK SHIELD',
    type: UPGRADE_TYPES.active,
    bossFeatured: true,
    accentColor: '#c4b5fd',
    stackable: true,
    maxStacks: 2,
    weight: 0.7,
    effects: [
      {
        stat: 'shieldDurationMs',
        add: 1500,
        max: 2400,
      },
      {
        stat: 'shieldCooldownMs',
        add: -2200,
        min: 7000,
      },
    ],
  }),
  slowAura: createUpgradeDefinition({
    id: 'slowAura',
    name: 'Cryo Field',
    description: 'Nearby enemies are slowed around you. Extra stacks widen the field and deepen the slow.',
    shortDescription: 'Slow nearby enemies.',
    quickLabel: 'SLOW AURA',
    type: UPGRADE_TYPES.passive,
    bossFeatured: true,
    accentColor: '#7dd3fc',
    stackable: true,
    maxStacks: 2,
    weight: 0.78,
    effects: [
      {
        stat: 'slowAuraRadius',
        add: 120,
        max: 240,
      },
      {
        stat: 'slowAuraStrength',
        add: 0.14,
        max: 0.34,
        precision: 2,
      },
    ],
  }),
  headshotReload: createUpgradeDefinition({
    id: 'headshotReload',
    name: 'Execution Loop',
    description: 'Headshot kills restore ammo to the current weapon. Extra stacks restore more rounds.',
    shortDescription: 'Headshots reload ammo.',
    quickLabel: 'HEADSHOT RELOAD',
    type: UPGRADE_TYPES.event,
    bossFeatured: true,
    accentColor: '#fde68a',
    stackable: true,
    maxStacks: 2,
    weight: 0.84,
    effects: [
      {
        stat: 'headshotAmmoRestore',
        add: 2,
        max: 5,
      },
    ],
    events: {
      onKillEnemy(context) {
        const {
          impactPoint,
          isHeadshot,
          scene,
          stats,
          weaponDirector,
          zombie,
        } = context

        if (!isHeadshot || !weaponDirector || !scene || !zombie) {
          return
        }

        const restoreAmount = Math.max(0, Math.floor(stats.headshotAmmoRestore ?? 0))

        if (!restoreAmount) {
          return
        }

        const restored = weaponDirector.restoreAmmo(restoreAmount)

        if (!restored?.restored) {
          return
        }

        const textX = impactPoint?.x ?? zombie.x
        const textY = impactPoint?.y ?? zombie.y - 36

        createFloatingCombatText(scene, textX, textY, `+${restored.restored} AMMO`, {
          color: '#bfdbfe',
          shadowColor: '#172554',
          fontSize: '18px',
          duration: 560,
          rise: 22,
          depth: 36,
        })
      },
    },
  }),
  chainLightning: createUpgradeDefinition({
    id: 'chainLightning',
    name: 'Chain Lightning',
    description: 'Bullet kills arc electricity to 2 nearby enemies for partial damage. Extra stacks arc to one more target.',
    shortDescription: 'Kills arc lightning to nearby enemies.',
    quickLabel: 'CHAIN LIGHTNING',
    type: UPGRADE_TYPES.event,
    bossFeatured: true,
    accentColor: '#67e8f9',
    stackable: true,
    maxStacks: 2,
    weight: 0.80,
    effects: [
      { stat: 'chainLightningTargets', add: 2, max: 3 },
      { stat: 'chainLightningDamage', add: 1, max: 2 },
    ],
    events: {
      onKillEnemy(context) {
        const { combat, scene, soundManager, stats, zombie, zombies } = context

        if (
          !combat || !scene || !zombie || zombie.isBoss
          || (stats.chainLightningTargets ?? 0) <= 0
          || (stats.chainLightningDamage ?? 0) <= 0
        ) {
          return
        }

        const chainCount = Math.min(Math.floor(stats.chainLightningTargets ?? 2), 3)
        const chainDamage = Math.max(1, Math.floor(stats.chainLightningDamage ?? 1))
        const searchRadius = 240
        const originX = zombie.x
        const originY = zombie.y

        const targets = (zombies?.getChildren() ?? [])
          .filter((z) => z?.active && !z.isDead && z !== zombie && !z.isBoss)
          .map((z) => ({ z, d: Phaser.Math.Distance.Squared(originX, originY, z.x, z.y) }))
          .filter(({ d }) => d <= searchRadius * searchRadius)
          .sort((a, b) => a.d - b.d)
          .slice(0, chainCount)

        targets.forEach(({ z }) => {
          createLightningArc(scene, originX, originY - 8, z.x, z.y - 8)
          combat.damageZombie(z, chainDamage, { source: 'chain-lightning' })
        })

        if (targets.length > 0) {
          soundManager?.play('headshot-hit', { volume: 0.7, rate: 1.6 })
        }
      },
    },
  }),
  vampiricRounds: createUpgradeDefinition({
    id: 'vampiricRounds',
    name: 'Vampiric Rounds',
    description: 'Each bullet hit restores a flat amount of HP. Extra stacks increase restoration per hit.',
    shortDescription: 'Bullet hits restore HP.',
    quickLabel: 'VAMPIRIC ROUNDS',
    type: UPGRADE_TYPES.event,
    bossFeatured: true,
    accentColor: '#f0abfc',
    stackable: true,
    maxStacks: 2,
    weight: 0.78,
    effects: [
      { stat: 'vampiricHpPerHit', add: 1, max: 2 },
    ],
    events: {
      onHitEnemy(context) {
        const { gameStore, scene, stats, zombie } = context

        if (!scene || !zombie || (stats.vampiricHpPerHit ?? 0) <= 0) {
          return
        }

        if ((gameStore?.health ?? 0) >= (gameStore?.maxPlayerHealth ?? 0)) {
          return
        }

        const amount = Math.max(1, Math.floor(stats.vampiricHpPerHit ?? 1))
        gameStore.healPlayer(amount)

        createFloatingCombatText(scene, zombie.x, zombie.y - 20, `+${amount}`, {
          color: '#f0abfc',
          shadowColor: '#4a004e',
          fontSize: '16px',
          duration: 440,
          rise: 14,
          depth: 36,
        })
      },
    },
  }),
  fragGrenade: createUpgradeDefinition({
    id: 'fragGrenade',
    name: 'Frag Grenade',
    description: 'Press E to throw a grenade that explodes on landing. Extra stacks widen the blast and shorten the cooldown.',
    shortDescription: 'Throw a grenade (E key).',
    quickLabel: 'FRAG GRENADE',
    type: UPGRADE_TYPES.active,
    bossFeatured: true,
    accentColor: '#fbbf24',
    stackable: true,
    maxStacks: 2,
    weight: 0.75,
    effects: [
      { stat: 'grenadeCooldownMs', set: 5000, max: 5000 },
      { stat: 'grenadeRadius', add: 110, max: 180 },
      { stat: 'grenadeDamage', add: 2, max: 4 },
      { stat: 'grenadeMaxTargets', add: 6, max: 12 },
    ],
    apply({ stats, upgrade }) {
      // First stack sets baseline values; second stack improves them
      const stacks = (stats.grenadeRadius > 0) ? 2 : 1
      return {
        ...stats,
        grenadeCooldownMs: stacks === 1 ? 5000 : 3500,
        grenadeRadius: stacks === 1 ? 110 : 180,
        grenadeDamage: stacks === 1 ? 2 : 4,
        grenadeMaxTargets: stacks === 1 ? 6 : 12,
      }
    },
  }),
  turretDrop: createUpgradeDefinition({
    id: 'turretDrop',
    name: 'Turret Drop',
    description: 'Killing a boss deploys a temporary auto-turret that targets nearby enemies. Extra stacks increase turret duration.',
    shortDescription: 'Boss kills spawn a turret.',
    quickLabel: 'TURRET DROP',
    type: UPGRADE_TYPES.event,
    bossFeatured: true,
    accentColor: '#86efac',
    stackable: true,
    maxStacks: 2,
    weight: 0.70,
    effects: [
      { stat: 'turretDurationMs', add: 8000, max: 16000 },
    ],
    events: {
      onKillEnemy(context) {
        const { zombie, stats, scene } = context

        if (!zombie?.isBoss || (stats.turretDurationMs ?? 0) <= 0 || !scene) {
          return
        }

        scene.turretDirector?.spawnTurret(zombie.x, zombie.y, Math.max(1, Math.floor(stats.turretDurationMs ?? 8000)))
      },
    },
  }),
}

export const UPGRADE_ORDER = Object.keys(UPGRADE_DEFINITIONS)

function canOfferUpgrade(definition, upgradeCounts = {}) {
  if (!definition) {
    return false
  }

  const stackCount = upgradeCounts[definition.id] ?? 0

  if (!definition.stackable) {
    return stackCount <= 0
  }

  return stackCount < Math.max(1, definition.maxStacks ?? 1)
}

function pickWeightedUpgrade(pool) {
  const totalWeight = pool.reduce((sum, upgrade) => sum + (upgrade.weight ?? 1), 0)

  if (!totalWeight) {
    return null
  }

  let roll = Phaser.Math.FloatBetween(0, totalWeight)

  for (const upgrade of pool) {
    roll -= upgrade.weight ?? 1

    if (roll <= 0) {
      return upgrade
    }
  }

  return pool[0] ?? null
}

function buildAvailableUpgradePool(upgradeCounts = {}, predicate = null) {
  return UPGRADE_ORDER
    .map((upgradeId) => UPGRADE_DEFINITIONS[upgradeId])
    .filter((upgrade) => canOfferUpgrade(upgrade, upgradeCounts))
    .filter((upgrade) => (typeof predicate === 'function' ? predicate(upgrade) : true))
}

function pickUpgradeChoices(pool, count) {
  const workingPool = [...pool]
  const choices = []

  while (choices.length < count && workingPool.length > 0) {
    const choice = pickWeightedUpgrade(workingPool)

    if (!choice) {
      break
    }

    choices.push(choice)
    const choiceIndex = workingPool.findIndex((entry) => entry.id === choice.id)

    if (choiceIndex >= 0) {
      workingPool.splice(choiceIndex, 1)
    }
  }

  return choices
}

export function createDefaultPlayerStats() {
  return {
    ...PLAYER_STAT_DEFAULTS,
  }
}

export function getUpgradeDefinition(upgradeId) {
  return UPGRADE_DEFINITIONS[upgradeId] ?? null
}

export function getUpgradeTypeLabel(upgradeId) {
  const definition = typeof upgradeId === 'string'
    ? getUpgradeDefinition(upgradeId)
    : upgradeId

  if (!definition) {
    return 'PASSIVE'
  }

  if (definition.type === UPGRADE_TYPES.active) {
    return 'ACTIVE'
  }

  if (definition.type === UPGRADE_TYPES.event) {
    return 'EVENT'
  }

  return 'PASSIVE'
}

export function applyUpgradeToStats(currentStats, upgradeId) {
  const upgrade = getUpgradeDefinition(upgradeId)

  if (!upgrade) {
    return {
      ...currentStats,
    }
  }

  return upgrade.apply({
    stats: {
      ...currentStats,
    },
    upgrade,
  })
}

export function shouldOfferUpgradeForWave(waveConfig, options = {}) {
  if (!waveConfig) {
    return false
  }

  if (waveConfig.isMiniBossWave) {
    return true
  }

  if (waveConfig.isFinalBossWave) {
    return false
  }

  const lastSelectionWave = Math.max(0, Number(options.lastSelectionWave) || 0)
  return waveConfig.number - lastSelectionWave >= UPGRADE_SELECTION_CONFIG.waveInterval
}

export function getRandomUpgradeChoices(
  upgradeCounts = {},
  count = UPGRADE_SELECTION_CONFIG.cardsPerSelection,
) {
  return pickUpgradeChoices(buildAvailableUpgradePool(upgradeCounts), count)
}

export function getBossRewardUpgradeChoices(
  upgradeCounts = {},
  count = UPGRADE_SELECTION_CONFIG.bossCardsPerSelection,
) {
  const featuredPool = buildAvailableUpgradePool(upgradeCounts, (upgrade) => upgrade.bossFeatured)
  const featuredChoices = pickUpgradeChoices(featuredPool, count)

  if (featuredChoices.length >= count) {
    return featuredChoices
  }

  const selectedIds = new Set(featuredChoices.map((upgrade) => upgrade.id))
  const fallbackPool = buildAvailableUpgradePool(upgradeCounts, (upgrade) => !selectedIds.has(upgrade.id))

  return [
    ...featuredChoices,
    ...pickUpgradeChoices(fallbackPool, count - featuredChoices.length),
  ]
}
