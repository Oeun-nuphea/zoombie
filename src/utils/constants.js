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
  arena1: { id: 'arena1', label: 'Training Field', desc: 'Open battlefield with 4 ruined buildings, mud bogs, and scattered cover walls.', cost: 0, default: true },
  angkor: { id: 'angkor', label: 'Sunken Courtyard', desc: 'Layered courtyards with double moats. Narrow causeways create deadly choke points.', cost: 500, default: false },
  pagoda: { id: 'pagoda', label: 'Serene Pagoda', desc: 'Five islands on a vast lake. Bridges funnel enemies — hold the crossing or drown.', cost: 750, default: false },
  palace: { id: 'palace', label: 'Royal Palace', desc: 'Throne room at the heart of a labyrinth. Armoury chambers and grand corridors.', cost: 1000, default: false },
}

export const CHALLENGES = {
  none: { id: 'none', label: 'Standard Run', desc: 'A regular survival run with default rules.' },
  vampire: { id: 'vampire', label: 'Vampire Mode', desc: 'You take 1 damage every 3 seconds, but you gain +25% Lifesteal.' },
  pistolOnly: { id: 'pistolOnly', label: 'Pistol Only', desc: 'Zero weapon drops. Rely entirely on your Pistol and upgrades.' },
  glassCannon: { id: 'glassCannon', label: 'Glass Cannon', desc: 'You deal 2× damage but also take 2× damage.' },
  overtime: { id: 'overtime', label: 'Overtime', desc: 'Enemies spawn 40% faster. Score is multiplied by 1.75×.' },
  noMercy: { id: 'noMercy', label: 'No Mercy', desc: 'No health drops spawn and no healing. Survive on skill alone.' },
}
