import Phaser from 'phaser'

// ─────────────────────────────────────────────────────────────────────────────
// Per-skin particle configurations
//
// Each layer supports:
//   count        – particles per tick
//   intervalMs   – ms between ticks
//   color        – primary hex color (0xRRGGBB)
//   altColor     – secondary color chosen randomly 40% of the time
//   size         – [min, max] radius / half-size
//   spread       – random spawn offset radius around gun pos
//   drift        – { x:[min,max], y:[min,max] } final target offset
//   lifetime     – [min, max] tween duration in ms
//   alphaStart   – starting opacity
//   shape        – 'circle' | 'diamond' | 'petal' | 'star' | 'lightning'
//                  | 'ring' | 'snowflake' | 'cross' | 'droplet' | 'spark'
//   blendMode    – Phaser.BlendModes.*
//
// Optional behaviours (booleans):
//   spin         – rotate during tween
//   spinFull     – full 2π spin (override the ±π default)
//   shrink       – scale toward 0
//   grow         – scale from 0 to 1 (fade-in feel)
//   growThenShrink – scale up then back (uses chainTween)
//   wisp         – Sine ease for dreamy movement
//   orbit        – circular orbit around muzzle
//   gravity      – additional downward y offset
//   float        – sinusoidal horizontal oscillation during lifetime
//   pulse        – ring expands outward (only for 'ring' shape)
//   chainDelay   – ms before chained second phase starts
//   chainDrift   – { x, y } second-phase drift offset (piggybacks on chain)
//   chainAlpha   – final alpha at end of chain (default 0)
// ─────────────────────────────────────────────────────────────────────────────

const SKIN_PARTICLE_CONFIG = {
  // ── standard ─────────────────────────────────────────────────────────────
  standard: null,

  // ── special (Arctic Blue) ─────────────────────────────────────────────────
  special: {
    layers: [
      // Large slow ice shard drifts upward, then cracks apart (chain fade)
      {
        count: 1,
        intervalMs: 220,
        color: 0x93c5fd,
        altColor: 0xbae6fd,
        size: [4, 9],
        spread: 14,
        drift: { x: [-10, 10], y: [-28, -14] },
        lifetime: [600, 900],
        alphaStart: 0.95,
        shape: 'diamond',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        growThenShrink: true,
        chainDelay: 0,
        chainDrift: { x: 0, y: -8 },
        chainAlpha: 0,
      },
      // Quick glinting ice specks
      {
        count: 2,
        intervalMs: 130,
        color: 0xe0f2fe,
        altColor: 0x7dd3fc,
        size: [1, 3],
        spread: 20,
        drift: { x: [-16, 16], y: [-20, -6] },
        lifetime: [280, 440],
        alphaStart: 0.8,
        shape: 'star',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        shrink: true,
      },
      // Slow icy mist rings
      {
        count: 1,
        intervalMs: 480,
        color: 0x38bdf8,
        altColor: 0x0ea5e9,
        size: [6, 16],
        spread: 4,
        drift: { x: [-4, 4], y: [-8, 0] },
        lifetime: [400, 600],
        alphaStart: 0.2,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
    ],
  },

  // ── epic (Void Walker) ────────────────────────────────────────────────────
  epic: {
    layers: [
      // Orbiting purple energy motes — long float
      {
        count: 1,
        intervalMs: 110,
        color: 0xc084fc,
        altColor: 0xd8b4fe,
        size: [3, 7],
        spread: 24,
        drift: { x: [-10, 10], y: [-20, 8] },
        lifetime: [700, 1000],
        alphaStart: 0.9,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        orbit: true,
        float: true,
        growThenShrink: true,
      },
      // Void tendrils — thin wisps curling upward
      {
        count: 1,
        intervalMs: 180,
        color: 0xa855f7,
        altColor: 0x7c3aed,
        size: [2, 5],
        spread: 18,
        drift: { x: [-14, 14], y: [-30, -10] },
        lifetime: [500, 800],
        alphaStart: 0.7,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
        spin: true,
      },
      // Periodic void ring pulse
      {
        count: 1,
        intervalMs: 320,
        color: 0x6d28d9,
        altColor: 0x9333ea,
        size: [8, 18],
        spread: 3,
        drift: { x: [-3, 3], y: [-3, 3] },
        lifetime: [300, 450],
        alphaStart: 0.3,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
      // Tiny sparkle stars
      {
        count: 1,
        intervalMs: 260,
        color: 0xe9d5ff,
        altColor: 0xfaf5ff,
        size: [1, 3],
        spread: 22,
        drift: { x: [-8, 8], y: [-18, 4] },
        lifetime: [400, 650],
        alphaStart: 0.8,
        shape: 'star',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        shrink: true,
      },
    ],
  },

  // ── sakura (Sakura Bloom) ─────────────────────────────────────────────────
  sakura: {
    layers: [
      // Large flagship petals — slow spin, long drift, chain second drift
      {
        count: 1,
        intervalMs: 160,
        color: 0xfda4af,
        altColor: 0xfce7f3,
        size: [6, 12],
        spread: 22,
        drift: { x: [-20, 20], y: [-12, 8] },
        lifetime: [1100, 1600],
        alphaStart: 0.9,
        shape: 'petal',
        blendMode: Phaser.BlendModes.NORMAL,
        spin: true,
        spinFull: true,
        gravity: 28,
        chainDelay: 800,
        chainDrift: { x: 14, y: 32 },
        chainAlpha: 0,
      },
      // Medium petals with gentle float
      {
        count: 1,
        intervalMs: 280,
        color: 0xf472b6,
        altColor: 0xfda4af,
        size: [4, 8],
        spread: 18,
        drift: { x: [-16, 16], y: [-8, 18] },
        lifetime: [900, 1300],
        alphaStart: 0.75,
        shape: 'petal',
        blendMode: Phaser.BlendModes.NORMAL,
        spin: true,
        float: true,
        gravity: 20,
      },
      // Small blossom petals fluttering up then drifting
      {
        count: 2,
        intervalMs: 200,
        color: 0xfce7f3,
        altColor: 0xfbcfe8,
        size: [2, 5],
        spread: 16,
        drift: { x: [-18, 18], y: [-24, -4] },
        lifetime: [700, 1000],
        alphaStart: 0.65,
        shape: 'petal',
        blendMode: Phaser.BlendModes.NORMAL,
        spin: true,
        gravity: 12,
      },
      // Pink glitter dust sparks
      {
        count: 2,
        intervalMs: 140,
        color: 0xf9a8d4,
        altColor: 0xfce7f3,
        size: [1, 3],
        spread: 14,
        drift: { x: [-10, 10], y: [-22, -8] },
        lifetime: [400, 650],
        alphaStart: 0.8,
        shape: 'star',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        shrink: true,
      },
      // Soft rose bloom rings
      {
        count: 1,
        intervalMs: 500,
        color: 0xf472b6,
        altColor: 0xec4899,
        size: [5, 14],
        spread: 4,
        drift: { x: [-4, 4], y: [-10, 2] },
        lifetime: [450, 700],
        alphaStart: 0.18,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
    ],
  },

  // ── phantom (Ghost Protocol) ───────────────────────────────────────────────
  phantom: {
    layers: [
      // Big emerald ghost wisps — long sinusoidal float
      {
        count: 1,
        intervalMs: 140,
        color: 0x34d399,
        altColor: 0x6ee7b7,
        size: [4, 9],
        spread: 18,
        drift: { x: [-12, 12], y: [-28, -8] },
        lifetime: [700, 1100],
        alphaStart: 0.7,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
        float: true,
        growThenShrink: true,
      },
      // Teal smoke trails curling upward
      {
        count: 1,
        intervalMs: 200,
        color: 0x10b981,
        altColor: 0x059669,
        size: [3, 6],
        spread: 14,
        drift: { x: [-16, 16], y: [-36, -14] },
        lifetime: [500, 800],
        alphaStart: 0.5,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
        spin: true,
      },
      // Ectoplasm drip (downward)
      {
        count: 1,
        intervalMs: 350,
        color: 0x6ee7b7,
        altColor: 0xa7f3d0,
        size: [3, 7],
        spread: 6,
        drift: { x: [-6, 6], y: [10, 28] },
        lifetime: [500, 800],
        alphaStart: 0.6,
        shape: 'droplet',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
        gravity: 20,
      },
      // Ghost ring pulses
      {
        count: 1,
        intervalMs: 420,
        color: 0x34d399,
        altColor: 0x10b981,
        size: [6, 14],
        spread: 4,
        drift: { x: [-3, 3], y: [-3, 3] },
        lifetime: [350, 550],
        alphaStart: 0.22,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
    ],
  },

  // ── inferno (Hellfire) ────────────────────────────────────────────────────
  inferno: {
    layers: [
      // Primary rising fireballs — float upward, grow then shrink
      {
        count: 2,
        intervalMs: 90,
        color: 0xfb923c,
        altColor: 0xfef08a,
        size: [3, 7],
        spread: 14,
        drift: { x: [-10, 10], y: [-36, -18] },
        lifetime: [400, 650],
        alphaStart: 0.95,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        growThenShrink: true,
        chainDelay: 250,
        chainDrift: { x: 6, y: -20 },
        chainAlpha: 0,
      },
      // Deep crimson secondary embers
      {
        count: 1,
        intervalMs: 130,
        color: 0xef4444,
        altColor: 0xfca5a5,
        size: [2, 5],
        spread: 18,
        drift: { x: [-14, 14], y: [-26, -8] },
        lifetime: [500, 750],
        alphaStart: 0.7,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      // Tiny gold spark trails
      {
        count: 3,
        intervalMs: 100,
        color: 0xfde68a,
        altColor: 0xfbbf24,
        size: [1, 2],
        spread: 12,
        drift: { x: [-12, 12], y: [-30, -10] },
        lifetime: [250, 400],
        alphaStart: 1.0,
        shape: 'spark',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      // Periodic heat wave ring
      {
        count: 1,
        intervalMs: 300,
        color: 0xf97316,
        altColor: 0xea580c,
        size: [7, 16],
        spread: 3,
        drift: { x: [-3, 3], y: [-6, 0] },
        lifetime: [280, 420],
        alphaStart: 0.28,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
    ],
  },

  // ── thunder (Thunderstrike) ───────────────────────────────────────────────
  thunder: {
    layers: [
      // Lightning bolt strikes — sharp and brief
      {
        count: 2,
        intervalMs: 80,
        color: 0xfacc15,
        altColor: 0xfef9c3,
        size: [3, 6],
        spread: 16,
        drift: { x: [-16, 16], y: [-34, -14] },
        lifetime: [200, 350],
        alphaStart: 1.0,
        shape: 'lightning',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      // Yellow electric sparks flying outward
      {
        count: 3,
        intervalMs: 100,
        color: 0xfde047,
        altColor: 0xfef08a,
        size: [1, 3],
        spread: 20,
        drift: { x: [-20, 20], y: [-18, 10] },
        lifetime: [250, 400],
        alphaStart: 1.0,
        shape: 'spark',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      // Electric arc chain (longer, drifts far horizontally)
      {
        count: 1,
        intervalMs: 160,
        color: 0xfbbf24,
        altColor: 0xf59e0b,
        size: [4, 8],
        spread: 8,
        drift: { x: [-24, 24], y: [-20, -6] },
        lifetime: [350, 550],
        alphaStart: 0.8,
        shape: 'lightning',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        shrink: true,
      },
      // Slow expanding electric ring pulse
      {
        count: 1,
        intervalMs: 220,
        color: 0xfde047,
        altColor: 0xfbbf24,
        size: [8, 20],
        spread: 4,
        drift: { x: [-4, 4], y: [-4, 4] },
        lifetime: [180, 280],
        alphaStart: 0.5,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
    ],
  },

  // ── galaxy (Cosmic Galaxy) ────────────────────────────────────────────────
  galaxy: {
    layers: [
      // Slowly drifting 5-point stars — very long lifetime
      {
        count: 1,
        intervalMs: 150,
        color: 0xa5b4fc,
        altColor: 0xe0e7ff,
        size: [3, 7],
        spread: 26,
        drift: { x: [-18, 18], y: [-24, 8] },
        lifetime: [1000, 1500],
        alphaStart: 0.95,
        shape: 'star',
        blendMode: Phaser.BlendModes.ADD,
        spin: true,
        spinFull: true,
        float: true,
        growThenShrink: true,
      },
      // Nebula wisps — large soft circles that float
      {
        count: 1,
        intervalMs: 200,
        color: 0x818cf8,
        altColor: 0x6366f1,
        size: [6, 14],
        spread: 14,
        drift: { x: [-10, 10], y: [-20, -4] },
        lifetime: [700, 1100],
        alphaStart: 0.4,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
        float: true,
      },
      // Tiny cosmic dust particles
      {
        count: 3,
        intervalMs: 120,
        color: 0xc7d2fe,
        altColor: 0xfaf5ff,
        size: [1, 2],
        spread: 28,
        drift: { x: [-14, 14], y: [-16, 8] },
        lifetime: [500, 900],
        alphaStart: 0.8,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
      // Wide nebula ring bursts
      {
        count: 1,
        intervalMs: 380,
        color: 0x4338ca,
        altColor: 0x6366f1,
        size: [10, 22],
        spread: 4,
        drift: { x: [-4, 4], y: [-4, 4] },
        lifetime: [400, 650],
        alphaStart: 0.22,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
      // Shooting micro-stars (fast horizontal drift)
      {
        count: 1,
        intervalMs: 280,
        color: 0xfaf5ff,
        altColor: 0xe0e7ff,
        size: [1, 3],
        spread: 10,
        drift: { x: [-32, 32], y: [-6, 6] },
        lifetime: [300, 500],
        alphaStart: 0.9,
        shape: 'spark',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
    ],
  },

  // ── venom (Venom Strike) ──────────────────────────────────────────────────
  venom: {
    layers: [
      // Acid drips falling downward — drip + splat chain
      {
        count: 2,
        intervalMs: 100,
        color: 0x84cc16,
        altColor: 0xbef264,
        size: [3, 6],
        spread: 12,
        drift: { x: [-8, 8], y: [14, 36] },
        lifetime: [500, 800],
        alphaStart: 0.95,
        shape: 'droplet',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
        gravity: 30,
        chainDelay: 300,
        chainDrift: { x: 0, y: 10 },
        chainAlpha: 0,
      },
      // Rising toxic fume wisps
      {
        count: 1,
        intervalMs: 200,
        color: 0x65a30d,
        altColor: 0x4d7c0f,
        size: [4, 10],
        spread: 16,
        drift: { x: [-12, 12], y: [-30, -12] },
        lifetime: [700, 1100],
        alphaStart: 0.45,
        shape: 'circle',
        blendMode: Phaser.BlendModes.ADD,
        wisp: true,
        float: true,
        growThenShrink: true,
      },
      // Toxic bubble pop rings
      {
        count: 1,
        intervalMs: 280,
        color: 0x84cc16,
        altColor: 0xa3e635,
        size: [5, 12],
        spread: 6,
        drift: { x: [-4, 4], y: [4, 14] },
        lifetime: [280, 450],
        alphaStart: 0.35,
        shape: 'ring',
        blendMode: Phaser.BlendModes.ADD,
        pulse: true,
      },
      // Spatter sparks outward
      {
        count: 2,
        intervalMs: 140,
        color: 0xbef264,
        altColor: 0xd9f99d,
        size: [1, 3],
        spread: 18,
        drift: { x: [-18, 18], y: [-4, 20] },
        lifetime: [300, 500],
        alphaStart: 0.85,
        shape: 'spark',
        blendMode: Phaser.BlendModes.ADD,
        shrink: true,
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Shape drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

function drawShape(gfx, shape, size, color) {
  switch (shape) {
    case 'diamond':
      gfx.fillStyle(color, 1)
      gfx.fillTriangle(-size * 0.5, 0, 0, -size, size * 0.5, 0)
      gfx.fillTriangle(-size * 0.5, 0, 0, size, size * 0.5, 0)
      break

    case 'petal':
      gfx.fillStyle(color, 1)
      gfx.fillEllipse(0, 0, size * 0.65, size * 1.6)
      // Highlight vein
      gfx.lineStyle(Math.max(0.5, size * 0.06), 0xffffff, 0.25)
      gfx.beginPath()
      gfx.moveTo(0, -size * 0.7)
      gfx.lineTo(0, size * 0.7)
      gfx.strokePath()
      break

    case 'star': {
      const outerR = size
      const innerR = size * 0.42
      gfx.fillStyle(color, 1)
      gfx.beginPath()
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const a = (i * Math.PI) / 5 - Math.PI / 2
        if (i === 0) gfx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
        else gfx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      gfx.closePath()
      gfx.fillPath()
      break
    }

    case 'lightning': {
      const h = size * 2.6
      const w = size
      gfx.lineStyle(Math.max(1, w * 0.45), color, 1)
      gfx.beginPath()
      gfx.moveTo(0,       -h)
      gfx.lineTo(w * 0.7, -h * 0.28)
      gfx.lineTo(w * 0.2, -h * 0.28)
      gfx.lineTo(w * 0.9,  h)
      gfx.lineTo(-w * 0.1, h * 0.05)
      gfx.lineTo(w * 0.35, h * 0.05)
      gfx.strokePath()
      break
    }

    case 'ring':
      gfx.lineStyle(Math.max(1, size * 0.22), color, 1)
      gfx.strokeCircle(0, 0, size)
      break

    case 'droplet':
      gfx.fillStyle(color, 1)
      gfx.fillCircle(0, 0, size * 0.7)
      gfx.fillTriangle(-size * 0.45, 0, size * 0.45, 0, 0, -size * 1.1)
      break

    case 'spark':
      // Thin elongated streak
      gfx.fillStyle(color, 1)
      gfx.fillRect(-size * 0.15, -size * 1.4, size * 0.3, size * 2.8)
      break

    default: // 'circle'
      gfx.fillStyle(color, 1)
      gfx.fillCircle(0, 0, size)
      break
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Spawn a single particle graphic with tween animation
// ─────────────────────────────────────────────────────────────────────────────

function spawnParticle(scene, x, y, config, layer) {
  const size     = Phaser.Math.Between(layer.size[0], layer.size[1])
  const color    = Math.random() > 0.4 ? layer.color : layer.altColor
  const driftX   = Phaser.Math.Between(layer.drift.x[0], layer.drift.x[1])
  const driftY   = Phaser.Math.Between(layer.drift.y[0], layer.drift.y[1])
  const lifetime = Phaser.Math.Between(layer.lifetime[0], layer.lifetime[1])
  const offsetX  = Phaser.Math.Between(-layer.spread, layer.spread)
  const offsetY  = Phaser.Math.Between(-Math.abs(layer.spread * 0.5), Math.abs(layer.spread * 0.5))

  const gfx = scene.add.graphics({ x: x + offsetX, y: y + offsetY })
  gfx.setDepth(config.depthBase ?? 22)
  gfx.setBlendMode(layer.blendMode)

  drawShape(gfx, layer.shape, size, color)

  const startRot = (layer.spin || layer.shape === 'petal' || layer.shape === 'spark')
    ? Phaser.Math.FloatBetween(0, Math.PI * 2)
    : 0
  gfx.setRotation(startRot)
  gfx.setAlpha(layer.alphaStart ?? 1)

  // Starting scale — grow variants start tiny
  if (layer.grow || layer.growThenShrink) {
    gfx.setScale(0.05)
  }

  // Orbit: circular target around muzzle
  let targetX = x + offsetX + driftX
  let targetY = y + offsetY + driftY

  if (layer.orbit) {
    const orbitRadius = Phaser.Math.Between(16, 30)
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
    targetX = x + Math.cos(angle) * orbitRadius
    targetY = y + Math.sin(angle) * orbitRadius
  }

  // Extra downward gravity push
  if (layer.gravity) {
    targetY += Phaser.Math.Between(layer.gravity * 0.5, layer.gravity)
  }

  const phase1Duration = layer.growThenShrink ? Math.floor(lifetime * 0.55) : lifetime

  const tweenProps = {
    targets: gfx,
    x: targetX,
    y: targetY,
    alpha: layer.growThenShrink ? layer.alphaStart : 0,
    duration: phase1Duration,
    ease: layer.wisp ? 'Sine.easeInOut' : 'Quad.easeOut',
  }

  // Rotation
  if (layer.spin) {
    const rotDelta = layer.spinFull
      ? Phaser.Math.FloatBetween(Math.PI * 1.5, Math.PI * 2.5)
      : Phaser.Math.FloatBetween(-Math.PI, Math.PI)
    tweenProps.rotation = startRot + rotDelta
  }

  // Scale modifiers
  if (layer.shrink) {
    tweenProps.scaleX = 0.05
    tweenProps.scaleY = 0.05
  } else if (layer.grow || layer.growThenShrink) {
    tweenProps.scaleX = 1
    tweenProps.scaleY = 1
  }

  // Ring pulse — expand outward
  if (layer.shape === 'ring' && layer.pulse) {
    tweenProps.scaleX = 4.5
    tweenProps.scaleY = 4.5
  }

  // Float — sinusoidal horizontal oscillation via timeline
  if (layer.float) {
    const floatAmp = Phaser.Math.Between(8, 18)
    const dir = Math.random() > 0.5 ? 1 : -1
    tweenProps.x = {
      value: targetX + floatAmp * dir,
      ease: 'Sine.easeInOut',
    }
  }

  if (layer.growThenShrink) {
    // Phase 1: grow + move
    scene.tweens.add({
      ...tweenProps,
      onComplete: () => {
        const phase2 = {
          targets: gfx,
          x: targetX + (layer.chainDrift?.x ?? 0),
          y: targetY + (layer.chainDrift?.y ?? 0),
          alpha: layer.chainAlpha ?? 0,
          scaleX: 0.05,
          scaleY: 0.05,
          duration: Math.floor(lifetime * 0.45),
          ease: 'Quad.easeIn',
          onComplete: () => gfx.destroy(),
        }
        if (layer.spin) {
          const currentRot = gfx.rotation
          const rotDelta2 = layer.spinFull
            ? Phaser.Math.FloatBetween(Math.PI, Math.PI * 2)
            : Phaser.Math.FloatBetween(-Math.PI * 0.5, Math.PI * 0.5)
          phase2.rotation = currentRot + rotDelta2
        }
        scene.tweens.add(phase2)
      },
    })
    return
  }

  // Chain second phase (e.g. sakura petal falls further after first drift)
  if (layer.chainDelay !== undefined && !layer.growThenShrink) {
    tweenProps.onComplete = () => {
      if (!gfx.active) return
      scene.tweens.add({
        targets: gfx,
        x: gfx.x + (layer.chainDrift?.x ?? 0),
        y: gfx.y + (layer.chainDrift?.y ?? 0),
        alpha: layer.chainAlpha ?? 0,
        duration: Math.floor(lifetime * 0.35),
        delay: layer.chainDelay,
        ease: 'Quad.easeIn',
        onComplete: () => gfx.destroy(),
      })
    }
    scene.tweens.add(tweenProps)
    return
  }

  tweenProps.onComplete = () => gfx.destroy()
  scene.tweens.add(tweenProps)
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

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

    const skinId  = getSkinId()
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
    for (const t of timers) t.remove(false)
    timers = []
  }

  function destroy() {
    stopEmitters()
  }

  startEmitters()

  return { startEmitters, stopEmitters, destroy, getSkinId }
}
