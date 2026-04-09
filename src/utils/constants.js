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
}

export const CHALLENGES = {
  none: { id: 'none', label: 'Standard Run', desc: 'A regular survival run with default rules.' },
  vampire: { id: 'vampire', label: 'Vampire Mode', desc: 'You take 1 damage every 3 seconds, but you gain +25% Lifesteal.' },
  pistolOnly: { id: 'pistolOnly', label: 'Purist (Pistol Only)', desc: 'Zero weapon drops. Rely entirely on your Pistol and upgrades.' },
}
