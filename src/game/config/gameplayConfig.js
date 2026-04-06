import { GAME_DIMENSIONS } from '../../utils/constants'
export {
  DEFAULT_WEAPON_ID,
  WEAPON_DEFINITIONS,
  WEAPON_DROP_CONFIG,
  WEAPON_ORDER,
  formatWeaponAmmo,
  getWeaponChoices,
  getWeaponDefinition,
  getWeaponDropTable,
  getWeaponDropTextureKey,
  resolveWeaponAmmo,
} from './weapons'

export const PLAYER_CONFIG = {
  maxHealth: 5,
  maxSpeed: 250,
  moveAcceleration: 0.22,
  moveDeceleration: 0.34,
  contactCooldown: 650,
  knockbackForce: 250,
  knockbackDecay: 0.82,
  muzzleLocalX: 53,
  muzzleLocalY: -45,
}

export const WEAPON_POOL_CONFIG = {
  bulletLifetime: 520,
  bulletDamage: 1,
  bulletSpeed: 880,
  spread: 0.02,
}

export const ZOMBIE_CONFIG = {
  baseSpeed: 80,
  speedPerWave: 5,
  maxSpeed: 175,
  baseHealth: 1,
  healthStepEvery: 2,
}

export const HEADSHOT_CONFIG = {
  damageMultiplier: 2.5,
  debugHitboxes: false,
  text: 'HEADSHOT!',
  textColor: 0xfacc15,
  impactColor: 0xef4444,
  headshotFlashColor: 0xffd24a,
  minHeadRadius: 12,
  minBodyRadius: 18,
  defaultHeadRadiusScale: 0.14,
  defaultHeadOffsetYScale: 0.58,
}

export const MINI_BOSS_CONFIG = {
  typeId: 'miniBoss',
  waveInterval: 5,
  supportCountBase: 6,
  supportCountPerTier: 2,
  supportCountMax: 10,
  spawnDelayMs: 420,
  bannerText: 'MINI BOSS INCOMING',
  deathBannerText: 'MINI BOSS DOWN',
  activeLabel: 'MINI BOSS',
  statusLabel: 'MINI BOSS ACTIVE',
}

export const BOSS_BEHAVIOR_CONFIG = {
  'mini-boss': {
    phaseTwoThreshold: 0.5,
    phaseTwoSpeedMultiplier: 1.4,
    phaseTwoDamageBonus: 1,
    phaseTwoScaleMultiplier: 1.04,
    phaseTwoHitStunScale: 0.78,
    phaseTwoBannerText: 'MINI BOSS ENRAGED',
    phaseTwoStatusLabel: 'ENRAGED MINI BOSS',
    summon: {
      cooldownMs: 4600,
      cooldownVarianceMs: 850,
      count: 3,
      radius: 126,
      maxConcurrent: 4,
      maxAliveBonus: 2,
      spawnTypes: ['walker', 'runner', 'toxic'],
      bannerText: 'CALLING THE HORDE',
      warningText: 'SUMMONING',
    },
    ranged: {
      cooldownMs: 3200,
      cooldownVarianceMs: 540,
      warningMs: 640,
      triggerRangeMax: 420,
      damage: 1,
      speed: 420,
      lifetimeMs: 2200,
      splashRadius: 54,
      splashDamage: 1,
      knockbackScale: 1.25,
      tint: 0xa3e635,
      warningText: 'PLAGUE SPIT',
    },
    charge: {
      unlockPhase: 2,
      cooldownMs: 5100,
      cooldownVarianceMs: 720,
      warningMs: 720,
      durationMs: 420,
      speed: 560,
      triggerRangeMin: 96,
      triggerRangeMax: 320,
      damage: 2,
      knockbackScale: 2.2,
      warningText: 'CHARGE',
    },
    slam: {
      unlockPhase: 2,
      cooldownMs: 6200,
      cooldownVarianceMs: 860,
      warningMs: 960,
      triggerRange: 188,
      radius: 142,
      damage: 2,
      knockbackScale: 2.15,
      warningText: 'GROUND SLAM',
    },
  },
  'final-boss': {
    phaseTwoThreshold: 0.5,
    phaseTwoSpeedMultiplier: 1.16,
    phaseTwoDamageBonus: 1,
    phaseTwoScaleMultiplier: 1.03,
    phaseTwoHitStunScale: 0.72,
    phaseTwoBannerText: 'FINAL BOSS ENRAGED',
    phaseTwoStatusLabel: 'ENRAGED FINAL BOSS',
    summon: {
      cooldownMs: 7600,
      cooldownVarianceMs: 1400,
      count: 2,
      radius: 120,
      maxConcurrent: 3,
      maxAliveBonus: 2,
      spawnTypes: ['walker', 'runner'],
      bannerText: 'REINFORCEMENTS',
      warningText: 'SUMMONING',
    },
    ranged: {
      cooldownMs: 2400,
      cooldownVarianceMs: 400,
      warningMs: 500,
      triggerRangeMax: 620,
      damage: 2,
      speed: 620,
      lifetimeMs: 3000,
      splashRadius: 76,
      splashDamage: 2,
      knockbackScale: 1.6,
      tint: 0xd946ef,
      warningText: 'ACID SPIT',
    },
    slam: {
      cooldownMs: 5400,
      cooldownVarianceMs: 1200,
      warningMs: 1100,
      triggerRange: 260,
      radius: 178,
      damage: 2,
      knockbackScale: 2.1,
      warningText: 'GROUND SMASH',
    },
  },
}

export const RUN_MODE_CONFIG = {
  normal: {
    id: 'normal',
    label: 'Normal Mode',
    maxWaves: 15,
  },
  endless: {
    id: 'endless',
    label: 'Endless Mode',
    maxWaves: null,
  },
}

export const FINAL_BOSS_CONFIG = {
  typeId: 'giantBoss',
  wave: 15,
  bannerText: 'FINAL BOSS INCOMING',
  deathBannerText: 'FINAL BOSS DOWN',
  activeLabel: 'GIANT ZOMBIE',
  statusLabel: 'FINAL BOSS ACTIVE',
  supportCount: 4,
  spawnDelayMs: 640,
  summonIntervalMs: 7600,
  summonIntervalVarianceMs: 1400,
  summonCount: 2,
  summonRadius: 120,
  maxConcurrentSummons: 3,
  maxAliveBonus: 2,
  smashWarningMs: 1100,
  smashCooldownMs: 5400,
  smashCooldownVarianceMs: 1200,
  smashTriggerRange: 260,
  smashRadius: 178,
  smashDamage: 2,
  smashKnockbackScale: 2.1,
  smashWarningText: 'GROUND SMASH',
}

export const MINI_BOSS_REWARD_CONFIG = {
  fullHealThreshold: 0.3,
  fullHealChanceWhenLow: 0.8,
  fullHealChanceBase: 0.22,
  rewardLifetimeMs: 10800,
}

export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    name: 'Walker',
    healthMultiplier: 1.15,
    speedMultiplier: 0.94,
    size: 0.84,
    damage: 1,
    scoreReward: 10,
    spawnWeight: 72,
    unlockWave: 1,
    weightRamp: -5,
    attackRange: 68,
    damageCooldownMs: 500,
    hitStunMs: 130,
    wobbleAmount: 8,
    wobbleSpeed: 0.006,
    bodyWidth: 36,
    bodyHeight: 44,
    bodyOffsetX: 46,
    bodyOffsetY: 70,
    shadowWidth: 34,
    shadowHeight: 18,
    shadowAlpha: 0.24,
    shadowColor: 0x000000,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.23,
    hurtOffsetYScale: 0.42,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    healthMultiplier: 0.72,
    speedMultiplier: 1.58,
    size: 0.74,
    damage: 1,
    scoreReward: 15,
    spawnWeight: 18,
    unlockWave: 2,
    weightRamp: 4,
    attackRange: 60,
    damageCooldownMs: 420,
    hitStunMs: 80,
    wobbleAmount: 28,
    wobbleSpeed: 0.014,
    bodyWidth: 30,
    bodyHeight: 40,
    bodyOffsetX: 49,
    bodyOffsetY: 73,
    shadowWidth: 30,
    shadowHeight: 14,
    shadowAlpha: 0.22,
    shadowColor: 0x000000,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.2,
    hurtOffsetYScale: 0.44,
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    healthMultiplier: 3.4,
    speedMultiplier: 0.66,
    size: 1.08,
    damage: 2,
    scoreReward: 24,
    spawnWeight: 10,
    unlockWave: 4,
    weightRamp: 3,
    attackRange: 76,
    damageCooldownMs: 700,
    hitStunMs: 155,
    wobbleAmount: 8,
    wobbleSpeed: 0.005,
    bodyWidth: 50,
    bodyHeight: 58,
    bodyOffsetX: 39,
    bodyOffsetY: 58,
    shadowWidth: 44,
    shadowHeight: 24,
    shadowAlpha: 0.28,
    shadowColor: 0x000000,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.26,
    hurtOffsetYScale: 0.38,
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    healthMultiplier: 1.22,
    speedMultiplier: 1.08,
    size: 0.9,
    damage: 1,
    scoreReward: 18,
    spawnWeight: 12,
    unlockWave: 5,
    weightRamp: 4,
    attackRange: 70,
    damageCooldownMs: 560,
    hitStunMs: 105,
    wobbleAmount: 16,
    wobbleSpeed: 0.01,
    bodyWidth: 38,
    bodyHeight: 46,
    bodyOffsetX: 45,
    bodyOffsetY: 67,
    shadowWidth: 38,
    shadowHeight: 20,
    shadowAlpha: 0.3,
    shadowColor: 0x203514,
    poisonDamage: 1,
    poisonDuration: 2200,
    poisonTickInterval: 800,
    hurtRadiusScale: 0.22,
    hurtOffsetYScale: 0.41,
  },
  boomer: {
    id: 'boomer',
    name: 'Boomer',
    healthMultiplier: 0.58,
    speedMultiplier: 1.42,
    size: 0.88,
    damage: 1,
    scoreReward: 22,
    spawnWeight: 9,
    unlockWave: 6,
    weightRamp: 3,
    attackRange: 64,
    damageCooldownMs: 600,
    hitStunMs: 80,
    wobbleAmount: 18,
    wobbleSpeed: 0.012,
    bodyWidth: 34,
    bodyHeight: 44,
    bodyOffsetX: 47,
    bodyOffsetY: 70,
    shadowWidth: 32,
    shadowHeight: 16,
    shadowAlpha: 0.28,
    shadowColor: 0x1a1000,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.21,
    hurtOffsetYScale: 0.43,
    tintColor: 0xfbbf24,      // golden-yellow tint to stand out
    animationType: 'runner',  // reuse runner animations (same zombie body shape)
    explodes: true,           // triggers AoE on death
    explosionRadius: 160,
    explosionDamage: 2,
    explosionKnockback: 800,
    acidPoolDurationMs: 3000, // toxic ground remains after explosion
  },
  shield: {
    id: 'shield',
    name: 'Riot Guard',
    healthMultiplier: 2.8,
    speedMultiplier: 0.62,
    size: 0.96,
    damage: 2,
    scoreReward: 28,
    spawnWeight: 7,
    unlockWave: 7,
    weightRamp: 2,
    attackRange: 72,
    damageCooldownMs: 700,
    hitStunMs: 200,
    wobbleAmount: 4,
    wobbleSpeed: 0.004,
    bodyWidth: 44,
    bodyHeight: 54,
    bodyOffsetX: 42,
    bodyOffsetY: 64,
    shadowWidth: 40,
    shadowHeight: 22,
    shadowAlpha: 0.32,
    shadowColor: 0x0a0a1a,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.24,
    hurtOffsetYScale: 0.40,
    tintColor: 0x6b7ff0,      // blue-purple tinted
    animationType: 'tank',    // reuse tank animations (bulky body)
    shielded: true,           // blocks frontal hits, vulnerable from behind
  },
  miniBoss: {
    id: 'miniBoss',
    name: 'Mini Boss',
    bossOnly: true,
    bossKind: 'mini-boss',
    healthMultiplier: 12.0,
    healthBonusPerTier: 20,
    speedMultiplier: 1.05,
    speedBonusPerTier: 6,
    size: 1.66,
    damage: 3,
    damagePerTier: 1,
    damageTierInterval: 2,
    scoreReward: 120,
    scorePerTier: 35,
    attackRange: 86,
    damageCooldownMs: 480,
    hitStunMs: 92,
    wobbleAmount: 5,
    wobbleSpeed: 0.0045,
    bodyWidth: 62,
    bodyHeight: 72,
    bodyOffsetX: 33,
    bodyOffsetY: 44,
    shadowWidth: 58,
    shadowHeight: 30,
    shadowAlpha: 0.34,
    shadowColor: 0x20050a,
    hurtRadiusScale: 0.29,
    hurtOffsetYScale: 0.36,
    shadowOffsetX: 8,
    shadowOffsetY: 12,
    hitFlashColor: 0xffb374,
    auraColor: 0xf97316,
    knockbackForceScale: 1.35,
  },
  giantBoss: {
    id: 'giantBoss',
    name: 'Giant Zombie',
    bossOnly: true,
    bossKind: 'final-boss',
    fixedHealth: 300,
    healthMultiplier: 20.0,
    healthBonusPerTier: 30,
    speedMultiplier: 0.85,
    speedBonusPerTier: 4,
    size: 2.04,
    damage: 4,
    damagePerTier: 1,
    damageTierInterval: 2,
    scoreReward: 320,
    scorePerTier: 100,
    attackRange: 108,
    damageCooldownMs: 650,
    hitStunMs: 78,
    wobbleAmount: 3,
    wobbleSpeed: 0.0032,
    bodyWidth: 78,
    bodyHeight: 92,
    bodyOffsetX: 27,
    bodyOffsetY: 34,
    shadowWidth: 74,
    shadowHeight: 36,
    shadowAlpha: 0.42,
    shadowColor: 0x160709,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.32,
    hurtOffsetYScale: 0.34,
    bodyHitRadiusScale: 0.31,
    bodyHitOffsetYScale: 0.34,
    headHitRadiusScale: 0.18,
    headHitOffsetYScale: 0.52,
    minHeadHitRadius: 16,
    minBodyHitRadius: 24,
    shadowOffsetX: 10,
    shadowOffsetY: 14,
    hitFlashColor: 0xffc17d,
    headshotFlashColor: 0xffdd6c,
    auraColor: 0xef4444,
    knockbackForceScale: 1.65,
  },
}

export function getSpawnPointDefinitions(dimensions = GAME_DIMENSIONS) {
  return [
    {
      id: 'east_perimeter',
      label: 'East Perimeter',
      x: dimensions.width - 48,
      y: dimensions.height * 0.5,
      radius: 64,
    },
    {
      id: 'west_breach',
      label: 'West Breach',
      x: 48,
      y: dimensions.height * 0.5,
      radius: 64,
    },
  ]
}

export const SPAWN_POINT_DEFINITIONS = getSpawnPointDefinitions()

export const WAVE_CONFIG = {
  startCount: 5,
  countIncreasePerWave: 2,
  spawnBatchSize: 2,
  baseSpawnInterval: 460,
  spawnIntervalDecay: 24,
  minSpawnInterval: 140,
  baseAliveCap: 4,
  aliveCapIncreaseEvery: 2,
  interWaveDelay: 360,
  upgradeDelay: 780,
  startDelay: 260,
}

export const WAVE_REWARD_CONFIG = {
  normalRewardDelay: 620,
  healAmount: 1,
  ammoRestoreRatio: 0.55,
  ammoRestoreMinimum: 6,
  temporaryBuff: {
    durationMs: 18000,
    damage: 0.12,
    fireRate: 0.1,
    moveSpeed: 0.08,
    bannerText: 'BATTLE RUSH',
    bannerColor: '#93c5fd',
  },
  rewardWeights: {
    heal: 2.4,
    ammo: 2.1,
    temporaryBuff: 1.8,
    minorPassive: 1.5,
  },
  minorPassives: [
    {
      id: 'minorDamage',
      stat: 'damage',
      add: 0.06,
      max: 2.1,
      precision: 2,
      bannerText: 'STEADIER ROUNDS',
      bannerColor: '#fb923c',
    },
    {
      id: 'minorFireRate',
      stat: 'fireRate',
      add: 0.05,
      max: 1.95,
      precision: 2,
      bannerText: 'FASTER HANDS',
      bannerColor: '#60a5fa',
    },
    {
      id: 'minorMoveSpeed',
      stat: 'moveSpeed',
      add: 0.04,
      max: 1.3,
      precision: 2,
      bannerText: 'LIGHTER FEET',
      bannerColor: '#34d399',
    },
    {
      id: 'minorLifesteal',
      stat: 'lifesteal',
      add: 0.02,
      max: 0.14,
      precision: 2,
      bannerText: 'FIELD LEECH',
      bannerColor: '#c084fc',
    },
  ],
}

function getSpawnPointCount(wave) {
  if (wave >= 7) {
    return 4
  }

  if (wave >= 5) {
    return 3
  }

  if (wave >= 3) {
    return 2
  }

  return 1
}

export function getModeDefinition(mode = RUN_MODE_CONFIG.normal.id) {
  return RUN_MODE_CONFIG[mode] ?? RUN_MODE_CONFIG.normal
}

function getMiniBossTier(wave) {
  return Math.max(0, Math.floor(wave / MINI_BOSS_CONFIG.waveInterval) - 1)
}

function getMiniBossSupportCount(wave) {
  return Math.min(
    MINI_BOSS_CONFIG.supportCountMax,
    MINI_BOSS_CONFIG.supportCountBase + getMiniBossTier(wave) * MINI_BOSS_CONFIG.supportCountPerTier,
  )
}

function getBaseSupportZombieCount(wave) {
  const earlyWaveRelief = wave <= 3 ? 1 : 0

  return Math.max(4, WAVE_CONFIG.startCount + (wave - 1) * WAVE_CONFIG.countIncreasePerWave - earlyWaveRelief)
}

function getBossEncounter(wave, mode = RUN_MODE_CONFIG.normal.id) {
  if (mode !== RUN_MODE_CONFIG.endless.id && wave === FINAL_BOSS_CONFIG.wave) {
    return {
      kind: 'final-boss',
      typeId: FINAL_BOSS_CONFIG.typeId,
      tier: 0,
      supportCount: FINAL_BOSS_CONFIG.supportCount,
      spawned: false,
      spawnDelayMs: FINAL_BOSS_CONFIG.spawnDelayMs,
      bannerText: FINAL_BOSS_CONFIG.bannerText,
      deathBannerText: FINAL_BOSS_CONFIG.deathBannerText,
      healthBarLabel: FINAL_BOSS_CONFIG.activeLabel,
      statusLabel: FINAL_BOSS_CONFIG.statusLabel,
      bannerColor: '#f87171',
    }
  }

  if (wave < MINI_BOSS_CONFIG.waveInterval || wave % MINI_BOSS_CONFIG.waveInterval !== 0) {
    return null
  }

  return {
    kind: 'mini-boss',
    typeId: MINI_BOSS_CONFIG.typeId,
    tier: getMiniBossTier(wave),
    supportCount: getMiniBossSupportCount(wave),
    spawned: false,
    spawnDelayMs: MINI_BOSS_CONFIG.spawnDelayMs,
    bannerText: MINI_BOSS_CONFIG.bannerText,
    deathBannerText: MINI_BOSS_CONFIG.deathBannerText,
    healthBarLabel: MINI_BOSS_CONFIG.activeLabel,
    statusLabel: MINI_BOSS_CONFIG.statusLabel,
    bannerColor: '#fb923c',
  }
}

export function getZombieTypeWeights(wave) {
  return Object.values(ZOMBIE_TYPES)
    .map((type) => {
      if (type.bossOnly || wave < type.unlockWave) {
        return null
      }

      const weight = Math.max(0, type.spawnWeight + (wave - type.unlockWave) * type.weightRamp)

      return weight > 0
        ? {
            id: type.id,
            weight,
          }
        : null
    })
    .filter(Boolean)
}

export function getWaveDefinition(wave, options = {}) {
  const mode = options.mode ?? RUN_MODE_CONFIG.normal.id
  const modeDefinition = getModeDefinition(mode)
  const resolvedWave = modeDefinition.maxWaves
    ? Math.min(Math.max(1, wave), modeDefinition.maxWaves)
    : Math.max(1, wave)
  const boss = getBossEncounter(resolvedWave, mode)
  const isBossWave = Boolean(boss)
  const baseZombieSpeed = Math.min(
    ZOMBIE_CONFIG.maxSpeed,
    ZOMBIE_CONFIG.baseSpeed + resolvedWave * ZOMBIE_CONFIG.speedPerWave,
  )
  const baseZombieHealth = ZOMBIE_CONFIG.baseHealth + Math.floor((resolvedWave - 1) / ZOMBIE_CONFIG.healthStepEvery)
  const supportZombieCount = isBossWave
    ? boss.supportCount
    : getBaseSupportZombieCount(resolvedWave)
  const baseMaxAlive = WAVE_CONFIG.baseAliveCap + Math.floor((resolvedWave - 1) / WAVE_CONFIG.aliveCapIncreaseEvery)

  return {
    number: resolvedWave,
    mode,
    modeLabel: modeDefinition.label,
    totalZombies: supportZombieCount + (isBossWave ? 1 : 0),
    supportZombieCount,
    isBossWave,
    isMiniBossWave: boss?.kind === 'mini-boss',
    isFinalBossWave: boss?.kind === 'final-boss',
    boss,
    baseZombieSpeed,
    baseZombieHealth,
    spawnInterval: Math.max(
      WAVE_CONFIG.minSpawnInterval,
      WAVE_CONFIG.baseSpawnInterval - (resolvedWave - 1) * WAVE_CONFIG.spawnIntervalDecay,
    ),
    maxAlive: boss?.kind === 'final-boss'
      ? Math.min(baseMaxAlive, 7)
      : baseMaxAlive + (boss?.kind === 'mini-boss' ? 1 : 0),
    spawnPointCount: getSpawnPointCount(resolvedWave),
    zombieTypeWeights: getZombieTypeWeights(resolvedWave),
    endsCampaign: mode !== RUN_MODE_CONFIG.endless.id && resolvedWave === RUN_MODE_CONFIG.normal.maxWaves,
  }
}

export function buildZombieConfig(typeId, waveConfig) {
  const type = ZOMBIE_TYPES[typeId] ?? ZOMBIE_TYPES.walker
  const bossTier = type.bossOnly ? waveConfig.boss?.tier ?? 0 : 0
  const maxHealth = type.fixedHealth ?? Math.max(
    1,
    Math.round(waveConfig.baseZombieHealth * type.healthMultiplier + bossTier * (type.healthBonusPerTier ?? 0)),
  )
  const contactDamage = Math.max(
    1,
    type.damage + Math.floor(bossTier / Math.max(1, type.damageTierInterval ?? Number.MAX_SAFE_INTEGER)) * (type.damagePerTier ?? 0),
  )
  const bodyHitRadiusScale = type.bodyHitRadiusScale ?? type.hurtRadiusScale
  const bodyHitOffsetYScale = type.bodyHitOffsetYScale ?? type.hurtOffsetYScale
  const headHitRadiusScale = type.headHitRadiusScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadRadiusScale, bodyHitRadiusScale * 0.62)
  const headHitOffsetYScale = type.headHitOffsetYScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadOffsetYScale, bodyHitOffsetYScale + 0.17)

  return {
    typeId: type.id,
    typeName: type.name,
    animationType: type.animationType ?? type.id,
    speed: Math.round(waveConfig.baseZombieSpeed * type.speedMultiplier + bossTier * (type.speedBonusPerTier ?? 0)),
    health: maxHealth,
    maxHealth,
    contactDamage,
    scoreValue: type.scoreReward + bossTier * (type.scorePerTier ?? 0),
    scale: type.size,
    attackRange: type.attackRange,
    damageCooldownMs: type.damageCooldownMs,
    hitStunMs: type.hitStunMs,
    wobbleAmount: type.wobbleAmount,
    wobbleSpeed: type.wobbleSpeed,
    bodyWidth: type.bodyWidth,
    bodyHeight: type.bodyHeight,
    bodyOffsetX: type.bodyOffsetX,
    bodyOffsetY: type.bodyOffsetY,
    shadowWidth: type.shadowWidth,
    shadowHeight: type.shadowHeight,
    shadowAlpha: type.shadowAlpha,
    shadowColor: type.shadowColor,
    poisonDamage: type.poisonDamage,
    poisonDuration: type.poisonDuration,
    poisonTickInterval: type.poisonTickInterval,
    hurtRadiusScale: type.hurtRadiusScale,
    hurtOffsetYScale: type.hurtOffsetYScale,
    bodyHitRadiusScale,
    bodyHitOffsetYScale,
    headHitRadiusScale,
    headHitOffsetYScale,
    minHeadHitRadius: type.minHeadHitRadius ?? HEADSHOT_CONFIG.minHeadRadius,
    minBodyHitRadius: type.minBodyHitRadius ?? HEADSHOT_CONFIG.minBodyRadius,
    headshotMultiplier: type.headshotMultiplier ?? HEADSHOT_CONFIG.damageMultiplier,
    headshotFlashColor: type.headshotFlashColor ?? HEADSHOT_CONFIG.headshotFlashColor,
    shadowOffsetX: type.shadowOffsetX,
    shadowOffsetY: type.shadowOffsetY,
    hitFlashColor: type.hitFlashColor,
    auraColor: type.auraColor,
    isBoss: Boolean(type.bossOnly),
    isMiniBoss: type.id === MINI_BOSS_CONFIG.typeId,
    isFinalBoss: type.id === FINAL_BOSS_CONFIG.typeId,
    bossKind: type.bossKind ?? null,
    bossLabel: waveConfig.boss?.healthBarLabel ?? type.name,
    bossStatusLabel: waveConfig.boss?.statusLabel ?? null,
    deathBannerText: waveConfig.boss?.deathBannerText ?? null,
    bossBehavior: type.bossOnly ? BOSS_BEHAVIOR_CONFIG[type.bossKind ?? 'mini-boss'] ?? null : null,
    bossTier,
    knockbackForceScale: type.knockbackForceScale ?? 1,
    // Boomer-type explosive properties
    tintColor: type.tintColor ?? null,
    explodes: type.explodes ?? false,
    explosionRadius: type.explosionRadius ?? 160,
    explosionDamage: type.explosionDamage ?? 2,
    explosionKnockback: type.explosionKnockback ?? 800,
    acidPoolDurationMs: type.acidPoolDurationMs ?? 2500,
    // Shield zombie
    shielded: type.shielded ?? false,
  }
}
