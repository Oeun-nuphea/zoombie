export const PLAYER_TEXTURE_SIZE = 128

export const PLAYER_BODY_LOCAL_ORIGIN = Object.freeze({
  x: 56,
  y: 58,
})

export const PLAYER_WEAPON_SHOULDER_LOCAL = Object.freeze({
  x: 2,
  y: -10,
})

export const PLAYER_CARRIED_WEAPON_TEXTURE = Object.freeze({
  key: 'player-carried-weapon',
  width: 96,
  height: 48,
  originX: 18,
  originY: 18,
  muzzleOffsetX: 56, // Distance from pivot (18) to the end of the M4 barrel (74)
  muzzleOffsetY: 2,  // Distance from pivot (18) to center of the 4px thick barrel (20)
})

export const PLAYER_FRAME_POSES = Object.freeze({
    'player-idle-0': Object.freeze({ bob: 0, torsoLean: 0.01, headTilt: -0.02, armRear: -0.15, armFront: 0.26, legRear: -0.04, legFront: 0.04, gunKick: 0, gunLift: 0 }),
  'player-idle-1': Object.freeze({ bob: -1, torsoLean: -0.01, headTilt: 0.02, armRear: -0.12, armFront: 0.2, legRear: -0.02, legFront: 0.02, gunKick: 0, gunLift: -1 }),
  'player-walk-0': Object.freeze({ bob: -1, torsoLean: 0.04, headTilt: -0.04, armRear: -0.18, armFront: 0.46, legRear: -0.24, legFront: 0.26, gunKick: 0, gunLift: -1 }),
  'player-walk-1': Object.freeze({ bob: 1, torsoLean: -0.04, headTilt: 0.05, armRear: -0.10, armFront: 0.1, legRear: 0.22, legFront: -0.2, gunKick: 0, gunLift: 1 }),
  'player-aim-0': Object.freeze({ bob: 0, torsoLean: 0.03, headTilt: -0.05, armRear: -0.15, armFront: 0.18, legRear: 0.02, legFront: -0.02, gunKick: 0, gunLift: -2, aim: true }),
  'player-aim-1': Object.freeze({ bob: -1, torsoLean: 0.02, headTilt: -0.02, armRear: -0.12, armFront: 0.16, legRear: 0.03, legFront: -0.01, gunKick: 0, gunLift: -1, aim: true }),
  'player-shoot-0': Object.freeze({ bob: -1, torsoLean: -0.06, headTilt: -0.08, armRear: -0.16, armFront: 0.08, legRear: 0.02, legFront: 0.02, gunKick: 5, gunLift: -2, aim: true, flash: true }),
  'player-shoot-1': Object.freeze({ bob: 0, torsoLean: 0.05, headTilt: 0.02, armRear: -0.12, armFront: 0.2, legRear: 0.04, legFront: 0.02, gunKick: 2, gunLift: -1, aim: true }),
  'player-hit': Object.freeze({ bob: 0, torsoLean: -0.12, headTilt: 0.18, armRear: -0.04, armFront: 0.44, legRear: 0.16, legFront: -0.12, gunKick: -4, gunLift: 2, hit: true }),
  'player-death-0': Object.freeze({ bob: 8, torsoLean: 0.22, headTilt: 0.24, armRear: 0.42, armFront: 0.72, legRear: 0.48, legFront: -0.22, gunKick: -8, gunLift: 4, dead: true }),
  'player-death-1': Object.freeze({ bob: 18, torsoLean: 0.48, headTilt: 0.4, armRear: 1.12, armFront: 1.3, legRear: 0.88, legFront: -0.58, gunKick: -12, gunLift: 9, dead: true }),
})

export const PLAYER_SKINS = {
  swat: {
    id: 'swat',
    name: 'SWAT Operative',
    skin: '#ff9249',
    hair: '#3b4559',
    shirt: '#343841',
    pants: '#4f5b7d',
    sleeve: '#d6a073',
    underShirt: '#edb483'
  },
  ranger: {
    id: 'ranger',
    name: 'Desert Ranger',
    skin: '#e0ac7b',
    hair: '#8b7d6b',
    shirt: '#a8947b',
    pants: '#d4c4b2',
    sleeve: '#e0ac7b',
    underShirt: '#e0ac7b'
  },
  rebel: {
    id: 'rebel',
    name: 'Street Rebel',
    skin: '#ebd2b7',
    hair: '#c93a3a',
    shirt: '#2b2a2e',
    pants: '#374254',
    sleeve: '#2b2a2e',
    underShirt: '#2b2a2e'
  }
}

// Gun skin rarity tiers
export const GUN_SKIN_RARITY = {
  standard: { label: 'Standard', color: '#94a3b8', glow: 'rgba(148,163,184,0.4)' },
  special:  { label: 'Special',  color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  epic:     { label: 'Epic',     color: '#c084fc', glow: 'rgba(192,132,252,0.6)' },
  sakura:   { label: 'Sakura',   color: '#f472b6', glow: 'rgba(244,114,182,0.6)' },
  phantom:  { label: 'Phantom',  color: '#34d399', glow: 'rgba(52,211,153,0.6)'  },
  inferno:  { label: 'Inferno',  color: '#fb923c', glow: 'rgba(251,146,60,0.6)'  },
}

export const GUN_SKINS = {
  standard: {
    id: 'standard',
    name: 'Standard Issue',
    rarity: 'standard',
    cost: 0,
    default: true,
    icon: '🔫',
    desc: 'The default military-grade rifle. Reliable and battle-tested.',
    gunBody:    '#2a2e38',
    gunDark:    '#1a1e24',
    gunAccent:  '#677182',
    gunBarrel:  '#4a5568',
    handguard:  '#1f2128',
    bulletTint: 0xfff1b8,   // warm brass
  },
  special: {
    id: 'special',
    name: 'Arctic Blue',
    rarity: 'special',
    cost: 200,
    default: false,
    icon: '🧊',
    desc: 'Cold-weather spec. Icy blue finish with chrome accents.',
    gunBody:    '#1e3a5f',
    gunDark:    '#0f2440',
    gunAccent:  '#60a5fa',
    gunBarrel:  '#93c5fd',
    handguard:  '#1a3252',
    bulletTint: 0x93c5fd,   // light blue
  },
  epic: {
    id: 'epic',
    name: 'Void Walker',
    rarity: 'epic',
    cost: 500,
    default: false,
    icon: '🔮',
    desc: 'Forged from the void. Purple energy pulses through the frame.',
    gunBody:    '#2e1065',
    gunDark:    '#1e0a45',
    gunAccent:  '#c084fc',
    gunBarrel:  '#a855f7',
    handguard:  '#1a0838',
    bulletTint: 0xd8b4fe,   // lavender
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Bloom',
    rarity: 'sakura',
    cost: 600,
    default: false,
    icon: '🌸',
    desc: 'Cherry blossom pink. Beautiful but deadly.',
    gunBody:    '#4a1942',
    gunDark:    '#2d0a27',
    gunAccent:  '#f472b6',
    gunBarrel:  '#ec4899',
    handguard:  '#3b1535',
    bulletTint: 0xfda4af,   // rose pink
  },
  phantom: {
    id: 'phantom',
    name: 'Ghost Protocol',
    rarity: 'phantom',
    cost: 750,
    default: false,
    icon: '👻',
    desc: 'Stealth-spec emerald. Silent and invisible in the dark.',
    gunBody:    '#042f2e',
    gunDark:    '#021a1a',
    gunAccent:  '#34d399',
    gunBarrel:  '#10b981',
    handguard:  '#053333',
    bulletTint: 0x6ee7b7,   // mint green
  },
  inferno: {
    id: 'inferno',
    name: 'Hellfire',
    rarity: 'inferno',
    cost: 1000,
    default: false,
    icon: '🔥',
    desc: 'Tempered in the flames of war. Burns bright with every shot.',
    gunBody:    '#431407',
    gunDark:    '#2c0a04',
    gunAccent:  '#fb923c',
    gunBarrel:  '#f97316',
    handguard:  '#3a1005',
    bulletTint: 0xfed7aa,   // peach orange
  },
}

/**
 * Returns the bullet tint hex number for the given gun skin ID.
 * Falls back to the standard brass tint if the skin is not found.
 */
export function getActiveBulletTint(skinId) {
  return GUN_SKINS[skinId]?.bulletTint ?? GUN_SKINS.standard.bulletTint
}

// ── Head Skin Rarity Tiers ──────────────────────────────────────────────────
export const HEAD_SKIN_RARITY = {
  none:    { label: 'None',    color: '#94a3b8', glow: 'rgba(148,163,184,0.4)' },
  rare:    { label: 'Rare',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  epic:    { label: 'Epic',    color: '#c084fc', glow: 'rgba(192,132,252,0.6)' },
  mythic:  { label: 'Mythic',  color: '#fb923c', glow: 'rgba(251,146,60,0.7)'  },
  sakura:  { label: 'Sakura',  color: '#f472b6', glow: 'rgba(244,114,182,0.6)' },
  phantom: { label: 'Phantom', color: '#34d399', glow: 'rgba(52,211,153,0.6)'  },
}

// ── Head Skins ──────────────────────────────────────────────────────────────
export const HEAD_SKINS = {
  none: {
    id: 'none',
    name: 'Standard Balaclava',
    rarity: 'none',
    cost: 0,
    default: true,
    icon: '🪖',
    desc: 'Military-issue balaclava. No frills, maximum field readiness.',
    helmetStyle: 'none',
    particles: null,
  },

  skullMask: {
    id: 'skullMask',
    name: 'Skull Mask',
    rarity: 'rare',
    cost: 300,
    default: false,
    icon: '💀',
    desc: 'A menacing skull-painted mask. Fear is the deadliest weapon.',
    helmetColor: '#1a1a1a',
    helmetAccent: '#c0c0c0',
    helmetStyle: 'skull',
    particles: null,
  },

  samuraiHelm: {
    id: 'samuraiHelm',
    name: 'Oni Kabuto',
    rarity: 'epic',
    cost: 600,
    default: false,
    icon: '⛩️',
    desc: 'Ancient horned war helmet. Honour the fallen with every kill.',
    helmetColor: '#7c2d12',
    helmetAccent: '#fde68a',
    helmetStyle: 'samurai',
    particles: null,
  },

  infernoHelm: {
    id: 'infernoHelm',
    name: 'Inferno Crown',
    rarity: 'mythic',
    cost: 900,
    default: false,
    icon: '🔥',
    desc: 'A crown of living fire. Burns with the fury of the damned.',
    helmetColor: '#7f1d1d',
    helmetAccent: '#fbbf24',
    helmetStyle: 'inferno',
    particles: {
      layers: [
        {
          intervalMs: 90,
          count: 2,
          color: 0xfb923c,
          altColor: 0xfef08a,
          size: [3, 7],
          spread: 10,
          drift: { x: [-8, 8], y: [-32, -16] },
          lifetime: [280, 480],
          alphaStart: 0.9,
          shape: 'circle',
          blendMode: 'ADD',
          shrink: true,
          headOffset: true,
        },
        {
          intervalMs: 140,
          count: 1,
          color: 0xef4444,
          altColor: 0xfca5a5,
          size: [2, 5],
          spread: 8,
          drift: { x: [-6, 6], y: [-24, -10] },
          lifetime: [350, 550],
          alphaStart: 0.6,
          shape: 'circle',
          blendMode: 'ADD',
          shrink: true,
          headOffset: true,
        },
      ],
    },
  },

  sakuraCrown: {
    id: 'sakuraCrown',
    name: 'Sakura Crown',
    rarity: 'sakura',
    cost: 750,
    default: false,
    icon: '🌸',
    desc: 'Cherry blossoms in eternal bloom. Beauty and grace in battle.',
    helmetColor: '#831843',
    helmetAccent: '#fda4af',
    helmetStyle: 'crown',
    particles: {
      layers: [
        {
          intervalMs: 220,
          count: 1,
          color: 0xfda4af,
          altColor: 0xfce7f3,
          size: [3, 7],
          spread: 12,
          drift: { x: [-12, 12], y: [4, 22] },
          lifetime: [700, 1100],
          alphaStart: 0.8,
          shape: 'petal',
          blendMode: 'NORMAL',
          shrink: false,
          spin: true,
          headOffset: true,
        },
        {
          intervalMs: 320,
          count: 1,
          color: 0xf472b6,
          altColor: 0xfce7f3,
          size: [2, 4],
          spread: 8,
          drift: { x: [-8, 8], y: [-14, -4] },
          lifetime: [400, 650],
          alphaStart: 0.5,
          shape: 'circle',
          blendMode: 'ADD',
          shrink: true,
          headOffset: true,
        },
      ],
    },
  },

  phantomHelm: {
    id: 'phantomHelm',
    name: 'Wraith Cowl',
    rarity: 'phantom',
    cost: 800,
    default: false,
    icon: '👻',
    desc: 'Woven from the mist of the departed. Ethereal and unseen.',
    helmetColor: '#042f2e',
    helmetAccent: '#34d399',
    helmetStyle: 'phantom',
    particles: {
      layers: [
        {
          intervalMs: 160,
          count: 1,
          color: 0x34d399,
          altColor: 0x6ee7b7,
          size: [3, 8],
          spread: 14,
          drift: { x: [-10, 10], y: [-22, -6] },
          lifetime: [500, 800],
          alphaStart: 0.6,
          shape: 'circle',
          blendMode: 'ADD',
          shrink: false,
          wisp: true,
          headOffset: true,
        },
      ],
    },
  },
}
