import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { GAME_DIMENSIONS } from '../utils/constants'
import { shouldUseFullscreenLandscapeLayout } from '../utils/gameViewport'

export function useResponsiveCanvas(containerRef) {
  const bounds = ref({
    width: 0,
    height: 0,
  })
  const aspectRatio = GAME_DIMENSIONS.width / GAME_DIMENSIONS.height
  let resizeObserver = null

  function updateBounds() {
    if (!containerRef?.value) {
      return
    }

    bounds.value = {
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight,
    }
  }

  const stageStyle = computed(() => {
    const { width, height } = bounds.value

    if (!width || !height) {
      return {
        width: '100dvw',
        height: '100dvh',
      }
    }

    if (shouldUseFullscreenLandscapeLayout({ width, height })) {
      return {
        width: `${Math.round(width)}px`,
        height: `${Math.round(height)}px`,
      }
    }

    let stageWidth = width
    let stageHeight = stageWidth / aspectRatio

    if (stageHeight > height) {
      stageHeight = height
      stageWidth = stageHeight * aspectRatio
    }

    return {
      width: `${Math.round(stageWidth)}px`,
      height: `${Math.round(stageHeight)}px`,
    }
  })

  onMounted(() => {
    updateBounds()

    if (containerRef?.value) {
      resizeObserver = new ResizeObserver(() => {
        updateBounds()
      })
      resizeObserver.observe(containerRef.value)
    }

    window.addEventListener('resize', updateBounds)
    document.addEventListener('fullscreenchange', updateBounds)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updateBounds)
    document.removeEventListener('fullscreenchange', updateBounds)
  })

  return {
    stageStyle,
  }
}
