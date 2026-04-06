const DEFAULT_PROFILE = Object.freeze({
  isMobile: false,
  inputMode: 'desktop',
  preferredOrientation: 'landscape',
  performance: Object.freeze({
    enemyCountScale: 1,
    maxAliveScale: 1,
    spawnIntervalScale: 1,
    particleScale: 1,
    autoAimIntervalMs: 0,
  }),
})

let cachedProfile = null

function hasCoarsePointer() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches
}

export function detectMobileDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  return (
    (navigator.maxTouchPoints ?? 0) > 0
    && hasCoarsePointer()
  )
}

export function getGameRuntimeProfile() {
  if (cachedProfile) {
    return cachedProfile
  }

  if (!detectMobileDevice()) {
    cachedProfile = DEFAULT_PROFILE
    return cachedProfile
  }

  cachedProfile = Object.freeze({
    isMobile: true,
    inputMode: 'mobile',
    preferredOrientation: 'landscape',
    performance: Object.freeze({
      enemyCountScale: 0.88,
      maxAliveScale: 0.84,
      spawnIntervalScale: 1.08,
      particleScale: 0.68,
      autoAimIntervalMs: 96,
    }),
  })

  return cachedProfile
}

export function isMobileInputPreferred() {
  return getGameRuntimeProfile().isMobile
}

export function clearRuntimeProfileCache() {
  cachedProfile = null
}
