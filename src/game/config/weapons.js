export const DEFAULT_WEAPON_ID = 'pistol'

export const WEAPON_DROP_CONFIG = {
  baseDropChance: 0.3,
  lifetimeMs: 7200,
}

export const WEAPON_DEFINITIONS = {
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    description: 'Fast shots, low damage, and infinite reserve.',
    fireRate: 130,
    pellets: 1,
    damage: 1,
    bulletSpeed: 900,
    bulletLifetime: 560,
    spread: 0.016,
    bulletScale: 0.95,
    bulletTint: 0xfff1b8,
    infiniteAmmo: true,
    loadoutAmmo: null,
    pickupAmmoRange: null,
    selectionEnabled: true,
    dropEnabled: false,
    dropWeight: 0,
    dropColor: 0xbfc7d5,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Heavy burst, low shells, wide spread.',
    fireRate: 460,
    pellets: 5,
    damage: 1,
    bulletSpeed: 760,
    bulletLifetime: 300,
    spread: 0.18,
    bulletScale: 0.9,
    bulletTint: 0xffd27a,
    infiniteAmmo: false,
    loadoutAmmo: 10,
    pickupAmmoRange: [8, 12],
    selectionEnabled: true,
    dropEnabled: true,
    dropWeight: 34,
    dropColor: 0xf59e0b,
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    description: 'Balanced pressure with solid range and control.',
    fireRate: 175,
    pellets: 1,
    damage: 2,
    bulletSpeed: 980,
    bulletLifetime: 620,
    spread: 0.03,
    bulletScale: 1.05,
    bulletTint: 0xfff7cc,
    infiniteAmmo: false,
    loadoutAmmo: 24,
    pickupAmmoRange: [20, 30],
    selectionEnabled: true,
    dropEnabled: true,
    dropWeight: 38,
    dropColor: 0x60a5fa,
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    description: 'Fast fire, large mag, light bullet damage.',
    fireRate: 80,
    pellets: 1,
    damage: 1,
    bulletSpeed: 860,
    bulletLifetime: 460,
    spread: 0.055,
    bulletScale: 0.88,
    bulletTint: 0xffefad,
    infiniteAmmo: false,
    loadoutAmmo: 48,
    pickupAmmoRange: [40, 60],
    selectionEnabled: false,
    dropEnabled: true,
    dropWeight: 28,
    dropColor: 0x34d399,
  },
}

export const WEAPON_ORDER = Object.keys(WEAPON_DEFINITIONS)

function normalizeAmmo(ammo) {
  if (!Number.isFinite(ammo)) {
    return {
      ammo: null,
      maxAmmo: null,
    }
  }

  const roundedAmmo = Math.max(0, Math.floor(ammo))

  return {
    ammo: roundedAmmo,
    maxAmmo: roundedAmmo,
  }
}

export function getWeaponDefinition(weaponId) {
  return WEAPON_DEFINITIONS[weaponId] ?? WEAPON_DEFINITIONS[DEFAULT_WEAPON_ID]
}

export function getWeaponChoices() {
  return WEAPON_ORDER.filter((weaponId) => WEAPON_DEFINITIONS[weaponId].selectionEnabled).map((weaponId) => WEAPON_DEFINITIONS[weaponId])
}

export function getWeaponDropTable() {
  return WEAPON_ORDER.filter((weaponId) => WEAPON_DEFINITIONS[weaponId].dropEnabled)
    .map((weaponId) => ({
      id: weaponId,
      weight: WEAPON_DEFINITIONS[weaponId].dropWeight,
    }))
    .filter((entry) => entry.weight > 0)
}

export function getWeaponDropTextureKey(weaponId) {
  return `weapon-drop-${weaponId}`
}

export function resolveWeaponAmmo(weaponId, source = 'loadout', randomInt = null) {
  const weapon = getWeaponDefinition(weaponId)

  if (weapon.infiniteAmmo) {
    return {
      ammo: null,
      maxAmmo: null,
    }
  }

  if (source === 'drop') {
    const [minAmmo, maxAmmo] = weapon.pickupAmmoRange ?? [weapon.loadoutAmmo, weapon.loadoutAmmo]
    const roll = randomInt ? randomInt(minAmmo, maxAmmo) : minAmmo
    return normalizeAmmo(roll)
  }

  return normalizeAmmo(weapon.loadoutAmmo)
}

export function formatWeaponAmmo(ammo, ammoMax) {
  if (!Number.isFinite(ammo) || !Number.isFinite(ammoMax)) {
    return 'INF'
  }

  return `${String(ammo).padStart(2, '0')} / ${String(ammoMax).padStart(2, '0')}`
}
