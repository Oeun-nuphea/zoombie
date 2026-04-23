import Phaser from 'phaser'

/**
 * Per-skin particle configuration.
 * Each skin can define multiple emitter layers for richer effects.
 */
const SKIN_PARTICLE_CONFIG = {
  standard: null, // No particles

  special: {
    // Arctic Blue — icy crystal glints
    layers: [
      {
        count: 1,
        intervalMs: 180,
        color: 0x93c5fd,
        altColor: 0xe0f2fe,
        size: [2, 5],
        spread: 18,
        drift: { x: [-12, 12], y: [-22, -8] },
        lifetime: [380, 560],
        alphaStart: 0.9,
        shape: 'diamond',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
      },
    ],
  },

  epic: {
    // Void Walker — purple orbiting energy motes
    layers: [
      {
        count: 1,
        intervalMs: 120,
        color: 0xc084fc,
        altColor: 0xd8b4fe,
        size: [3, 6],
        spread: 22,
        drift: { x: [-8, 8], y: [-18, 6] },
        lifetime: [500, 720],
        alphaStart: 0.85,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        orbit: true,
      },
    ],
  },

  sakura: {
    // Sakura Bloom — cherry blossom petals
    layers: [
      {
        count: 1,
        intervalMs: 200,
        color: 0xfda4af,
        altColor: 0xfce7f3,
        size: [4, 8],
        spread: 20,
        drift: { x: [-14, 14], y: [-20, 4] },
        lifetime: [600, 900],
        alphaStart: 0.8,
        shape: 'petal',
        blendMode: Phaser.BlendModes.NORMAL,
        spin: true,
        gravity: 18,
      },
      {
        count: 1,
        intervalMs: 400,
        color: 0xf9a8d4,
        altColor: 0xfce7f3,
        size: [2, 4],
        spread: 14,
        drift: { x: [-8, 8], y: [-28, -10] },
        lifetime: [400, 650],
        alphaStart: 0.6,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
      },
    ],
  },

  phantom: {
    // Ghost Protocol — emerald wisps
    layers: [
      {
        count: 1,
        intervalMs: 150,
        color: 0x34d399,
        altColor: 0x6ee7b7,
        size: [3, 7],
        spread: 16,
        drift: { x: [-10, 10], y: [-24, -6] },
        lifetime: [450, 680],
        alphaStart: 0.7,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
      },
    ],
  },

  inferno: {
    // Hellfire — rising ember sparks
    layers: [
      {
        count: 2,
        intervalMs: 100,
        color: 0xfb923c,
        altColor: 0xfef08a,
        size: [2, 5],
        spread: 14,
        drift: { x: [-10, 10], y: [-30, -14] },
        lifetime: [300, 500],
        alphaStart: 0.9,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      {
        count: 1,
        intervalMs: 180,
        color: 0xef4444,
        altColor: 0xfca5a5,
        size: [3, 6],
        spread: 18,
        drift: { x: [-12, 12], y: [-22, -8] },
        lifetime: [400, 600],
        alphaStart: 0.6,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
    ],
  },
}

/**
 * Draw a single particle graphic based on the layer's shape.
 */
function spawnParticle(scene, x, y, config, layer) {
  const size = Phaser.Math.Between(layer.size[0], layer.size[1])
  const color = Math.random() > 0.4 ? layer.color : layer.altColor
  const driftX = Phaser.Math.Between(layer.drift.x[0], layer.drift.x[1])
  const driftY = Phaser.Math.Between(layer.drift.y[0], layer.drift.y[1])
  const lifetime = Phaser.Math.Between(layer.lifetime[0], layer.lifetime[1])
  const offsetX = Phaser.Math.Between(-layer.spread, layer.spread)
  const offsetY = Phaser.Math.Between(-layer.spread * 0.5, layer.spread * 0.5)

  const gfx = scene.add.graphics({ x: x + offsetX, y: y + offsetY })
  gfx.setDepth(config.depthBase ?? 22)
  gfx.setBlendMode(layer.blendMode)

  if (layer.shape === 'diamond') {
    gfx.fillStyle(color, 1)
    gfx.fillTriangle(-size * 0.5, 0, 0, -size, size * 0.5, 0)
    gfx.fillTriangle(-size * 0.5, 0, 0, size, size * 0.5, 0)
  } else if (layer.shape === 'petal') {
    // Simple oval petal
    gfx.fillStyle(color, 1)
    gfx.fillEllipse(0, 0, size * 0.6, size * 1.4)
  } else {
    gfx.fillStyle(color, 1)
    gfx.fillCircle(0, 0, size)
  }

  const startRot = layer.spin || layer.petal ? Phaser.Math.FloatBetween(0, Math.PI * 2) : 0
  gfx.setRotation(startRot)
  gfx.setAlpha(layer.alphaStart)

  // Orbit effect: give a slight circular drift
  let targetX = x + offsetX + driftX
  let targetY = y + offsetY + driftY

  if (layer.orbit) {
    const orbitRadius = Phaser.Math.Between(14, 28)
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
    targetX = x + Math.cos(angle) * orbitRadius
    targetY = y + Math.sin(angle) * orbitRadius
  }

  const tweenProps = {
    targets: gfx,
    x: targetX,
    y: targetY,
    alpha: 0,
    duration: lifetime,
    ease: layer.wisp ? 'Sine.easeInOut' : 'Quad.easeOut',
    onComplete: () => gfx.destroy(),
  }

  if (layer.spin) {
    tweenProps.rotation = startRot + Phaser.Math.FloatBetween(-Math.PI, Math.PI)
  }

  if (layer.shrink) {
    tweenProps.scaleX = 0.1
    tweenProps.scaleY = 0.1
  }

  if (layer.gravity) {
    // Simulate gentle downward drift for petals
    tweenProps.y = targetY + Phaser.Math.Between(10, 24)
  }

  scene.tweens.add(tweenProps)
}

/**
 * Create and return a gun skin particle system attached to a player.
 * Call destroy() when the scene shuts down.
 */
export function createGunSkinParticleSystem(scene, config) {
  const { player, gameStore } = config

  let timers = []

  function getSkinId() {
    return gameStore?.selectedGunSkin ?? 'standard'
  }

  function getDepthBase() {
    // Render just above the carried weapon
    return (player?.depth ?? 20) + 2
  }

  function getGunWorldPos() {
    if (!player?.active) return null
    const transform = player.getCarriedWeaponTransform?.()
    if (!transform) return { x: player.x, y: player.y }
    return transform
  }

  function startEmitters() {
    stopEmitters()

    const skinId = getSkinId()
    const skinCfg = SKIN_PARTICLE_CONFIG[skinId]
    if (!skinCfg) return

    for (const layer of skinCfg.layers) {
      const timer = scene.time.addEvent({
        delay: layer.intervalMs,
        loop: true,
        callback: () => {
          if (!player?.active || scene.physics.world.isPaused) return
          const pos = getGunWorldPos()
          if (!pos) return
          const depthConf = { depthBase: getDepthBase() }
          for (let i = 0; i < layer.count; i++) {
            spawnParticle(scene, pos.x, pos.y, depthConf, layer)
          }
        },
      })
      timers.push(timer)
    }
  }

  function stopEmitters() {
    for (const t of timers) {
      t.remove(false)
    }
    timers = []
  }

  function destroy() {
    stopEmitters()
  }

  // Start immediately
  startEmitters()

  return { startEmitters, stopEmitters, destroy, getSkinId }
}
