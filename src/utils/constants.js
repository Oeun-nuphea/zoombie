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
}

export const MAP_CONFIG = {
  arena1: { id: 'arena1', label: 'Training Field', desc: 'A wide open field with scattered crates.', cost: 0, default: true },
  angkor: { id: 'angkor', label: 'Angkor Temple', desc: 'Ancient temple layout. Fast paths, dangerous slow moats.', cost: 500, default: false },
  pagoda: { id: 'pagoda', label: 'Serene Pagoda', desc: 'A tranquil shrine over deep mud. Heavily restricts movement.', cost: 750, default: false },
  palace: { id: 'palace', label: 'Royal Palace', desc: 'Grand concrete plaza with intricate brick corridors.', cost: 1000, default: false },
}

export const CHALLENGES = {
  none: { id: 'none', label: 'Standard Run', desc: 'A regular survival run with default rules.' },
  vampire: { id: 'vampire', label: 'Vampire Mode', desc: 'You take 1 damage every 3 seconds, but you gain +25% Lifesteal.' },
  pistolOnly: { id: 'pistolOnly', label: 'Pistol Only', desc: 'Zero weapon drops. Rely entirely on your Pistol and upgrades.' },
  glassCannon: { id: 'glassCannon', label: 'Glass Cannon', desc: 'You deal 2× damage but also take 2× damage. High risk, high reward.' },
  overtime: { id: 'overtime', label: 'Overtime', desc: 'Enemies spawn 40% faster. Score is multiplied by 1.75×.' },
  noMercy: { id: 'noMercy', label: 'No Mercy', desc: 'No health drops spawn and no healing rewards between waves. Survive on skill alone.' },
}
