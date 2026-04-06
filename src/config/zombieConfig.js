function buildRowFrames(rowIndex, count, columns, startColumn = 0) {
  return Array.from({ length: count }, (_, index) => rowIndex * columns + startColumn + index)
}

export const zombieAnimationClips = {
  idle: {
    frames: buildRowFrames(0, 6, 6),
    fps: 5,
    loop: true,
  },
  walk: {
    frames: buildRowFrames(1, 6, 6),
    fps: 8,
    loop: true,
  },
  attack: {
    // The public preview-derived sheet has two dirty frames in the attack row.
    // Reuse only the clean frames so the renderer never shows neighboring sprite fragments.
    frames: [12, 15, 16, 17, 16, 15],
    fps: 10,
    loop: false,
  },
  hurt: {
    frames: [15],
    fps: 12,
    loop: false,
  },
  death: {
    frames: [16, 17],
    fps: 6,
    loop: false,
  },
}

export const zombieConfig = {
  sprite: {
    src: '/assets/sprites/zombie-topdown-sheet.png',
    frameWidth: 192,
    frameHeight: 192,
    columns: 6,
    rows: 3,
    drawScale: 0.72,
    anchorX: 0.5,
    anchorY: 0.62,
    transparentColor: { r: 236, g: 236, b: 236 },
    transparentTolerance: 18,
  },
  animations: zombieAnimationClips,
  maxHealth: 3,
  moveSpeed: 62,
  aggroRadius: 420,
  attackRange: 38,
  attackCooldownMs: 620,
  attackDamageFrame: 3,
  hurtRecoverMs: 140,
  hitRadius: 18,
  contactDamage: 1,
  debug: false,
}

export const zombieTypePresets = {
  normal: {},
  fast: {
    maxHealth: 2,
    moveSpeed: 86,
    attackCooldownMs: 500,
  },
  tank: {
    maxHealth: 7,
    moveSpeed: 38,
    attackCooldownMs: 860,
    hitRadius: 22,
    contactDamage: 2,
  },
}

export function createZombieConfig(overrides = {}) {
  return {
    ...zombieConfig,
    ...overrides,
    sprite: {
      ...zombieConfig.sprite,
      ...(overrides.sprite ?? {}),
    },
    animations: {
      ...zombieConfig.animations,
      ...(overrides.animations ?? {}),
    },
  }
}
