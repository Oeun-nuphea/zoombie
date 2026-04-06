import { GAME_DIMENSIONS } from './constants'
import { getGameRuntimeProfile } from './device'

function getBrowserViewportSize() {
  if (typeof window === 'undefined') {
    return {
      width: GAME_DIMENSIONS.width,
      height: GAME_DIMENSIONS.height,
    }
  }

  return {
    width: Math.max(window.innerWidth || 0, 1),
    height: Math.max(window.innerHeight || 0, 1),
  }
}

export function isLandscapeViewport(size = getBrowserViewportSize()) {
  return size.width > size.height
}

export function shouldUseFullscreenLandscapeLayout(size = getBrowserViewportSize()) {
  return getGameRuntimeProfile().isMobile && isLandscapeViewport(size)
}

export function getRuntimeGameDimensions(size = getBrowserViewportSize()) {
  if (!shouldUseFullscreenLandscapeLayout(size)) {
    return {
      width: GAME_DIMENSIONS.width,
      height: GAME_DIMENSIONS.height,
    }
  }

  return {
    width: Math.max(
      GAME_DIMENSIONS.width,
      Math.round(GAME_DIMENSIONS.height * (size.width / Math.max(size.height, 1))),
    ),
    height: GAME_DIMENSIONS.height,
  }
}

export function getSceneGameDimensions(scene) {
  return {
    width: scene?.scale?.width || GAME_DIMENSIONS.width,
    height: scene?.scale?.height || GAME_DIMENSIONS.height,
  }
}
