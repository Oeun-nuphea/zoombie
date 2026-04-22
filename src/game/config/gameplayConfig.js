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
  maxSpeed: 420,
  moveAcceleration: 0.38,
  moveDeceleration: 0.55,
  contactCooldown: 650,
  knockbackForce: 1000,
  knockbackDecay: 0.88,
  muzzleLocalX: 53,
  muzzleLocalY: -45,
}

export const WEAPON_POOL_CONFIG = {
  bulletLifetime: 800,
  bulletDamage: 1,
  bulletSpeed: 1200,
  spread: 0.02,
}

export const ZOMBIE_CONFIG = {
  baseSpeed: 220,       // was 170 — faster from wave 1
  speedPerWave: 18,     // was 12  — ramps up quicker
  maxSpeed: 420,        // was 340  — higher ceiling
  baseHealth: 4,        // was 2   — takes more firepower to kill
  healthStepEvery: 1,   // was 2   — HP goes up every wave
}

export const ELITE_MUTATIONS = {
  enraged: {
    id: 'enraged',
    name: 'Enraged',
    labelFormat: 'ENRAGED',
    labelColor: '#fca5a5',
    speedMultiplier: 1.6,
    damageMultiplier: 1.5,
    healthMultiplier: 1.0,
    sizeMultiplier: 1.15,
    tintColor: 0xff3b3b,
  },
  armored: {
    id: 'armored',
    name: 'Armored',
    labelFormat: 'ARMORED',
    labelColor: '#fde047',
    speedMultiplier: 0.9,
    damageMultiplier: 1.0,
    healthMultiplier: 1.0,  // We'll manage physical damage reduction differently
    damageReduction: 0.5,   // 50% damage reduction
    sizeMultiplier: 1.25,
    tintColor: 0xfacc15,
  },
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
  waveInterval: 4,
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
      spawnTypes: ['z1', 'z2', 'z3'],
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
      spawnTypes: ['z1', 'z2', 'z3'],
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
  'gatling-boss': {
    phaseTwoThreshold: 0.5,
    phaseTwoSpeedMultiplier: 1.25,
    phaseTwoDamageBonus: 1,
    phaseTwoScaleMultiplier: 1.05,
    phaseTwoHitStunScale: 0.65,
    phaseTwoBannerText: 'GATLING BOSS ENRAGED',
    phaseTwoStatusLabel: 'ENRAGED GATLING BOSS',
    gatling: {
      cooldownMs: 4000,
      cooldownVarianceMs: 600,
      warningMs: 700,
      triggerRangeMax: 700,
      damage: 1,
      speed: 680,
      lifetimeMs: 3000,
      tint: 0xd9f99d,
      warningText: 'GATLING BURST',
      shots: 15,
      shotDelayMs: 90,
    },
    slam: {
      unlockPhase: 2,
      cooldownMs: 6000,
      cooldownVarianceMs: 800,
      warningMs: 1000,
      triggerRange: 220,
      radius: 160,
      damage: 2,
      knockbackScale: 2.1,
      warningText: 'GROUND SLAM',
    },
  },
}

export const RUN_MODE_CONFIG = {
  normal: {
    id: 'normal',
    label: 'Normal Mode',
    maxWaves: 10,
  },
  endless: {
    id: 'endless',
    label: 'Endless Mode',
    maxWaves: null,
  },
}

export const FINAL_BOSS_CONFIG = {
  typeId: 'giantBoss',
  wave: 10,
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
  z1: {
    id: 'z1',
    name: 'Bone Shambler',
    healthMultiplier: 0.9,
    speedMultiplier: 1.72,
    size: 0.78,
    damage: 1,
    scoreReward: 18,
    spawnWeight: 35,
    unlockWave: 1,
    weightRamp: 3,
    attackRange: 60,
    damageCooldownMs: 400,
    hitStunMs: 70,
    wobbleAmount: 32,
    wobbleSpeed: 0.016,
    bodyWidth: 60,
    bodyHeight: 80,
    bodyOffsetX: 128,
    bodyOffsetY: 88,
    shadowWidth: 32,
    shadowHeight: 14,
    shadowAlpha: 0.22,
    shadowColor: 0x000000,
    hurtRadiusScale: 0.2,
    hurtOffsetYScale: 0.44,
    spriteKey: 'z1',
    facesLeft: false,
  },
  z2: {
    id: 'z2',
    name: 'Grave Rot',
    healthMultiplier: 1.45,
    speedMultiplier: 0.88,
    size: 0.86,
    damage: 1,
    scoreReward: 20,
    spawnWeight: 65,
    unlockWave: 1,
    weightRamp: -2,
    attackRange: 68,
    damageCooldownMs: 500,
    hitStunMs: 130,
    wobbleAmount: 14,
    wobbleSpeed: 0.008,
    bodyWidth: 60,
    bodyHeight: 80,
    bodyOffsetX: 128,
    bodyOffsetY: 88,
    shadowWidth: 34,
    shadowHeight: 18,
    shadowAlpha: 0.24,
    shadowColor: 0x000000,
    hurtRadiusScale: 0.23,
    hurtOffsetYScale: 0.42,
    spriteKey: 'z2',
    facesLeft: true,
  },
  z3: {
    id: 'z3',
    name: 'Cinder Maw',
    healthMultiplier: 1.15,
    speedMultiplier: 1.15,
    size: 0.85,
    damage: 1,
    scoreReward: 22,
    spawnWeight: 14,
    unlockWave: 4,
    weightRamp: 3,
    attackRange: 60,
    damageCooldownMs: 400,
    hitStunMs: 80,
    wobbleAmount: 14,
    wobbleSpeed: 0.016,
    bodyWidth: 60,
    bodyHeight: 80,
    bodyOffsetX: 128,
    bodyOffsetY: 88,
    shadowWidth: 32,
    shadowHeight: 14,
    shadowAlpha: 0.2,
    shadowColor: 0x000000,
    hurtRadiusScale: 0.22,
    hurtOffsetYScale: 0.42,
    spriteKey: 'z3',
    facesLeft: true,
    leaps: true,
    leapRangeMin: 100,
    leapRangeMax: 260,
    leapCooldownMs: 2800,
    leapDurationMs: 380,
    leapSpeed: 520,
  },
  z4: {
    id: 'z4',
    name: 'Hollow Walker',
    healthMultiplier: 3.4,
    speedMultiplier: 0.66,
    size: 1.08,
    damage: 2,
    scoreReward: 24,
    spawnWeight: 14,
    unlockWave: 3,
    weightRamp: 3,
    attackRange: 76,
    damageCooldownMs: 700,
    hitStunMs: 155,
    wobbleAmount: 8,
    wobbleSpeed: 0.005,
    bodyWidth: 70,
    bodyHeight: 90,
    bodyOffsetX: 123,
    bodyOffsetY: 82,
    shadowWidth: 44,
    shadowHeight: 24,
    shadowAlpha: 0.28,
    shadowColor: 0x000000,
    hurtRadiusScale: 0.26,
    hurtOffsetYScale: 0.38,
    spriteKey: 'z4',
    facesLeft: true,
  },
  z5: {
    id: 'z5',
    name: 'Flesh Drifter',
    healthMultiplier: 0.85,
    speedMultiplier: 1.35,
    size: 0.82,
    damage: 2,
    scoreReward: 20,
    spawnWeight: 16,
    unlockWave: 5,
    weightRamp: 3,
    attackRange: 64,
    damageCooldownMs: 500,
    hitStunMs: 80,
    wobbleAmount: 14,
    wobbleSpeed: 0.016,
    bodyWidth: 60,
    bodyHeight: 80,
    bodyOffsetX: 128,
    bodyOffsetY: 88,
    shadowWidth: 32,
    shadowHeight: 14,
    shadowAlpha: 0.2,
    shadowColor: 0x000000,
    hurtRadiusScale: 0.22,
    hurtOffsetYScale: 0.42,
    spriteKey: 'z5',
    facesLeft: true,
    leaps: true,
    leapRangeMin: 120,
    leapRangeMax: 280,
    leapCooldownMs: 3000,
    leapDurationMs: 400,
    leapSpeed: 540,
  }
,
  miniBoss: {
    id: 'miniBoss',
    name: 'Mini Boss',
    bossOnly: true,
    bossKind: 'mini-boss',
    healthBase: 100,
    healthBonusPerTier: 100,
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
    bodyWidth: 80,
    bodyHeight: 120,
    bodyOffsetX: 118,
    bodyOffsetY: 60,
    shadowWidth: 58,
    shadowHeight: 30,
    shadowAlpha: 0.34,
    shadowColor: 0x20050a,
    hurtRadiusScale: 0.29,
    hurtOffsetYScale: 0.36,
    spriteKey: 'miniBoss',
    facesLeft: true,
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
    healthBase: 500,
    healthBonusPerTier: 150,
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
    bodyWidth: 100,
    bodyHeight: 160,
    bodyOffsetX: 108,
    bodyOffsetY: 50,
    shadowWidth: 74,
    shadowHeight: 36,
    shadowAlpha: 0.42,
    shadowColor: 0x160709,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.32,
    hurtOffsetYScale: 0.34,
    spriteKey: 'giantBoss',
    facesLeft: false,
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
  gatlingBoss: {
    id: 'gatlingBoss',
    name: 'Giant Gatling Spitter',
    bossOnly: true,
    bossKind: 'gatling-boss',
    healthBase: 250,
    healthBonusPerTier: 150,
    speedMultiplier: 0.75,
    speedBonusPerTier: 3,
    size: 2.3,
    damage: 3,
    damagePerTier: 1,
    damageTierInterval: 2,
    scoreReward: 400,
    scorePerTier: 120,
    attackRange: 100,
    damageCooldownMs: 650,
    hitStunMs: 60,
    wobbleAmount: 4,
    wobbleSpeed: 0.0035,
    bodyWidth: 86,
    bodyHeight: 100,
    bodyOffsetX: 22,
    bodyOffsetY: 30,
    shadowWidth: 80,
    shadowHeight: 40,
    shadowAlpha: 0.44,
    shadowColor: 0x160709,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonTickInterval: 0,
    hurtRadiusScale: 0.35,
    hurtOffsetYScale: 0.36,
    bodyHitRadiusScale: 0.34,
    bodyHitOffsetYScale: 0.36,
    headHitRadiusScale: 0.20,
    headHitOffsetYScale: 0.54,
    minHeadHitRadius: 18,
    minBodyHitRadius: 28,
    shadowOffsetX: 12,
    shadowOffsetY: 16,
    hitFlashColor: 0xa3e635,
    headshotFlashColor: 0xd9f99d,
    auraColor: 0x65a30d,
    knockbackForceScale: 1.8,
    animationType: 'spitter',
    tintColor: 0x4ade80,
    facesLeft: false,
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
  startCount: 10,           // was 7  — more zombies from wave 1
  countIncreasePerWave: 5,  // was 3  — grows faster each wave
  spawnBatchSize: 3,        // was 2  — spawns more at once
  baseSpawnInterval: 240,   // was 330 — spawns faster
  spawnIntervalDecay: 40,   // was 30  — interval shrinks faster
  minSpawnInterval: 80,     // was 120 — can spawn much faster at high waves
  baseAliveCap: 9,          // was 6  — more on screen at once
  aliveCapIncreaseEvery: 1, // was 2  — cap grows every wave
  interWaveDelay: 320,
  upgradeDelay: 700,
  startDelay: 220,
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
  if (wave >= 5) {
    return 4
  }

  if (wave >= 3) {
    return 3
  }

  if (wave >= 2) {
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
  return Math.max(5, WAVE_CONFIG.startCount + (wave - 1) * WAVE_CONFIG.countIncreasePerWave)
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

  if (mode === RUN_MODE_CONFIG.endless.id && wave >= 16 && wave % 5 === 0) {
    return {
      kind: 'gatling-boss',
      typeId: 'gatlingBoss',
      tier: Math.max(0, Math.floor((wave - 16) / 5)),
      supportCount: 6,
      spawned: false,
      spawnDelayMs: 600,
      bannerText: 'GATLING SPITTER INCOMING',
      deathBannerText: 'GATLING SPITTER DOWN',
      healthBarLabel: 'GIANT GATLING SPITTER',
      statusLabel: 'GATLING SPITTER ACTIVE',
      bannerColor: '#4ade80',
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
  const type = ZOMBIE_TYPES[typeId] ?? ZOMBIE_TYPES.goreWalker
  const bossTier = type.bossOnly ? waveConfig.boss?.tier ?? 0 : 0
  const maxHealth = type.fixedHealth
    ?? (type.healthBase != null
      ? Math.max(1, Math.round(type.healthBase + bossTier * (type.healthBonusPerTier ?? 0)))
      : Math.max(1, Math.round(waveConfig.baseZombieHealth * (type.healthMultiplier ?? 1) + bossTier * (type.healthBonusPerTier ?? 0))))
  const contactDamage = Math.max(
    1,
    type.damage + Math.floor(bossTier / Math.max(1, type.damageTierInterval ?? Number.MAX_SAFE_INTEGER)) * (type.damagePerTier ?? 0),
  )
  const bodyHitRadiusScale = type.bodyHitRadiusScale ?? type.hurtRadiusScale
  const bodyHitOffsetYScale = type.bodyHitOffsetYScale ?? type.hurtOffsetYScale
  const headHitRadiusScale = type.headHitRadiusScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadRadiusScale, bodyHitRadiusScale * 0.62)
  const headHitOffsetYScale = type.headHitOffsetYScale ?? Math.max(HEADSHOT_CONFIG.defaultHeadOffsetYScale, bodyHitOffsetYScale + 0.17)

  let mutationId = null
  if (!type.bossOnly && waveConfig.number >= 2) {
    let eliteChance = 0.08
    if (waveConfig.number >= 5) eliteChance += 0.04
    if (waveConfig.number >= 10) eliteChance += 0.04
    
    if (Math.random() <= eliteChance) {
      const keys = Object.keys(ELITE_MUTATIONS)
      mutationId = keys[Math.floor(Math.random() * keys.length)]
    }
  }

  return {
    typeId: type.id,
    typeName: type.name,
    spriteKey: type.spriteKey ?? null,
    facesLeft: type.facesLeft ?? false,
    animationType: type.animationType ?? type.id,
    speed: Math.round(waveConfig.baseZombieSpeed * type.speedMultiplier + bossTier * (type.speedBonusPerTier ?? 0)),
    health: maxHealth,
    maxHealth,
    contactDamage,
    eliteMutation: mutationId,
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
    
    // Leaper properties
    leaps: type.leaps ?? false,
    leapRangeMin: type.leapRangeMin ?? 120,
    leapRangeMax: type.leapRangeMax ?? 280,
    leapCooldownMs: type.leapCooldownMs ?? 3000,
    leapDurationMs: type.leapDurationMs ?? 400,
    leapSpeed: type.leapSpeed ?? 540,

    // Spitter properties
    spits: type.spits ?? false,
    spitRangeMin: type.spitRangeMin ?? 160,
    spitRangeMax: type.spitRangeMax ?? 360,
    spitCooldownMs: type.spitCooldownMs ?? 4000,
    spitSpeed: type.spitSpeed ?? 420,
    spitDamage: type.spitDamage ?? 1,
    spitLifetimeMs: type.spitLifetimeMs ?? 2000,

    // Screamer properties
    screams: type.screams ?? false,
    screamAuraRadius: type.screamAuraRadius ?? 180,
    screamSpeedBonus: type.screamSpeedBonus ?? 0.35,
    screamDamageBonus: type.screamDamageBonus ?? 1,
  }
}
