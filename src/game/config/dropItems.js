export const DROP_SYSTEM_CONFIG = {
  maxActiveItems: 10,
}

export const HEALTH_DROP_CONFIG = {
  smallChance: 0.2,
  bigChance: 0.05,
}

export const HEALTH_DROP_DEFINITIONS = {
  small: {
    id: 'small',
    name: 'Small Health',
    restoreMode: 'flat',
    restoreAmount: 1,
    lifetimeMs: 6200,
    scale: 0.92,
    glowColor: 0xfb7185,
    accentColor: 0xef4444,
    bannerColor: '#fda4af',
    pickupText: 'HP +1',
  },
  big: {
    id: 'big',
    name: 'Big Health',
    restoreMode: 'full',
    restoreAmount: null,
    lifetimeMs: 7600,
    scale: 1.08,
    glowColor: 0xfca5a5,
    accentColor: 0xf8fafc,
    bannerColor: '#fca5a5',
    pickupText: 'FULL RECOVERY',
  },
  large: {
    id: 'large',
    name: 'Large Health',
    restoreMode: 'flat',
    restoreAmount: 3,
    lifetimeMs: 9200,
    scale: 1.12,
    glowColor: 0xfbbf24,
    accentColor: 0xfb923c,
    bannerColor: '#fdba74',
    pickupText: 'HP +3',
  },
  full: {
    id: 'full',
    name: 'Full Recovery',
    restoreMode: 'full',
    restoreAmount: null,
    lifetimeMs: 9800,
    scale: 1.18,
    glowColor: 0xfde68a,
    accentColor: 0xfef3c7,
    bannerColor: '#fde68a',
    pickupText: 'FULL RECOVERY',
  },
}

export function getHealthDropDefinition(dropId) {
  return HEALTH_DROP_DEFINITIONS[dropId] ?? HEALTH_DROP_DEFINITIONS.small
}

export function getHealthDropTextureKey(dropId) {
  return `health-drop-${dropId}`
}
