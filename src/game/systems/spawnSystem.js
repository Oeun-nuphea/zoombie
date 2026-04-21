import Phaser from 'phaser'

import { buildZombieConfig, getSpawnPointDefinitions } from '../config/gameplayConfig'
import Boss from '../entities/Boss'
import Zombie from '../entities/Zombie'
import { getSceneGameDimensions } from '../../utils/gameViewport'

function pickWeightedZombieType(weightTable) {
  const totalWeight = weightTable.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Phaser.Math.Between(1, totalWeight)

  for (const entry of weightTable) {
    roll -= entry.weight

    if (roll <= 0) {
      return entry.id
    }
  }

  return weightTable[0]?.id ?? 'z1'
}

function projectSpawnPoint(basePoint, dimensions) {
  return {
    x: Phaser.Math.Clamp(
      basePoint.x + Phaser.Math.Between(-basePoint.radius, basePoint.radius),
      24,
      dimensions.width - 24,
    ),
    y: Phaser.Math.Clamp(
      basePoint.y + Phaser.Math.Between(-basePoint.radius, basePoint.radius),
      24,
      dimensions.height - 24,
    ),
  }
}

export function createSpawnDirector(scene, config) {
  const { zombies } = config

  function getCurrentDimensions() {
    // Always use the physics world bounds (= tilemap size when a map is loaded)
    const wb = scene.physics.world.bounds
    return { width: wb.width, height: wb.height }
  }

  let activeSpawnPoints = [getSpawnPointDefinitions(getCurrentDimensions())[0]]

  function getAvailableSpawnPoints() {
    return getSpawnPointDefinitions(getCurrentDimensions())
  }

  function remapActiveSpawnPoints(nextSpawnPoints = getAvailableSpawnPoints()) {
    const nextPointById = new Map(nextSpawnPoints.map((point) => [point.id, point]))

    activeSpawnPoints = activeSpawnPoints
      .map((point) => nextPointById.get(point.id))
      .filter(Boolean)

    if (activeSpawnPoints.length === 0) {
      activeSpawnPoints = [nextSpawnPoints[0]]
    }

    return activeSpawnPoints
  }

  function selectWaveSpawnPoints(waveConfig) {
    activeSpawnPoints = Phaser.Utils.Array.Shuffle([...getAvailableSpawnPoints()]).slice(0, waveConfig.spawnPointCount)
    return activeSpawnPoints
  }

  function spawnZombie(waveConfig, options = {}) {
    const dimensions = getCurrentDimensions()
    const basePoint = options.basePoint ?? Phaser.Utils.Array.GetRandom(activeSpawnPoints)
    const spawnPoint = projectSpawnPoint(basePoint, dimensions)
    const zombieType = options.typeId ?? pickWeightedZombieType(waveConfig.zombieTypeWeights)
    const zombieConfig = buildZombieConfig(zombieType, waveConfig)
    const speedVariance = options.speedVariance ?? { min: -6, max: 10 }
    const EnemyClass = zombieConfig.isBoss ? Boss : Zombie
    const zombie = new EnemyClass(scene, spawnPoint.x, spawnPoint.y, {
      ...zombieConfig,
      speed: zombieConfig.speed + Phaser.Math.Between(speedVariance.min, speedVariance.max),
      spawnLabel: basePoint.label,
    })

    zombies.add(zombie)

    return zombie
  }

  function spawnBatch(waveConfig, count) {
    const spawned = []

    for (let index = 0; index < count; index += 1) {
      spawned.push(spawnZombie(waveConfig))
    }

    return spawned
  }

  function spawnBoss(waveConfig) {
    const basePoint = Phaser.Utils.Array.GetRandom(activeSpawnPoints)

    return spawnZombie(waveConfig, {
      basePoint,
      typeId: waveConfig.boss?.typeId ?? 'miniBoss',
      speedVariance: {
        min: -1,
        max: 3,
      },
    })
  }

  function getActiveSpawnPoints() {
    return activeSpawnPoints
  }

  function refreshBounds() {
    return remapActiveSpawnPoints()
  }

  return {
    getActiveSpawnPoints,
    refreshBounds,
    selectWaveSpawnPoints,
    spawnBoss,
    spawnBatch,
    spawnMiniBoss: spawnBoss,
    spawnZombie,
  }
}
