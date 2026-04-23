export const APP_NAME = 'ZOOMBIE'

export const GAME_DIMENSIONS = {
  width: 1920,
  height: 1080,
}

export const ARENA_MAP_ASSETS = [
  { key: 'field-map', url: '/assets/maps/field-map.png' },
  { key: 'forest-map', url: '/assets/maps/forest-map.png' },
  { key: 'angkor-map', url: '/assets/maps/angkor-map.png' },
  { key: 'sea-map', url: '/assets/maps/sea-map.png' },
]

export const STORAGE_KEYS = {
  bestScore: 'zoombie.best-score',
  endlessUnlocked: 'zoombie.endless-unlocked',
  soundMuted: 'zoombie.sound-muted',
  soundVolume: 'zoombie.sound-volume',
  souls: 'zoombie.souls',
  metaUpgrades: 'zoombie.meta-upgrades',
  unlockedMaps: 'zoombie.unlocked-maps',
  selectedMap: 'zoombie.selected-map',
  selectedGunSkin: 'zoombie.selected-gun-skin',
  unlockedGunSkins: 'zoombie.unlocked-gun-skins',
}

export const MAP_CONFIG = {
  arena1: { id: 'arena1', label: 'Training Field', cost: 0, default: true },
  angkor: { id: 'angkor', label: 'Sunken Courtyard', cost: 500, default: false },
  pagoda: { id: 'pagoda', label: 'Serene Pagoda', cost: 750, default: false },
  palace: { id: 'palace', label: 'Royal Palace',cost: 1000, default: false },
  adventure: { id: 'adventure', label: 'Open World', cost: 0, default: true, endless: true, worldScale: 4 },
}

export const CHALLENGES = {
  none: { id: 'none', label: 'Standard Run'},
  vampire: { id: 'vampire', label: 'Vampire Mode'},
  pistolOnly: { id: 'pistolOnly', label: 'Pistol Only'},
  glassCannon: { id: 'glassCannon', label: 'Glass Cannon'},
  overtime: { id: 'overtime', label: 'Overtime',},
  noMercy: { id: 'noMercy', label: 'No Mercy',},
}
