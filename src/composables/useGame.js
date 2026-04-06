import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

import { createGame } from '../game/managers/gameManager'
import { resetMobileInput } from '../game/input/inputMobile'
import { resetPersistentMovementKeys } from '../game/systems/movementInput'
import { useGameStore } from '../stores/gameStore'
import { getRuntimeGameDimensions } from '../utils/gameViewport'

export function useGame(containerRef) {
  const game = shallowRef(null)
  const gameStore = useGameStore()
  let resizeObserver = null
  let scaleFrameId = 0
  let startFrameId = 0
  let isRestarting = false

  function getMainScene() {
    return game.value?.scene?.keys?.MainScene ?? null
  }

  function clearQueuedFrames() {
    if (scaleFrameId) {
      cancelAnimationFrame(scaleFrameId)
      scaleFrameId = 0
    }

    if (startFrameId) {
      cancelAnimationFrame(startFrameId)
      startFrameId = 0
    }
  }

  function clearGameContainer() {
    if (containerRef.value) {
      containerRef.value.innerHTML = ''
    }
  }

  function refreshScale() {
    if (!game.value) {
      return
    }

    if (scaleFrameId) {
      cancelAnimationFrame(scaleFrameId)
    }

    scaleFrameId = requestAnimationFrame(() => {
      scaleFrameId = 0
      const runtimeDimensions = getRuntimeGameDimensions()

      if (
        game.value?.scale?.width !== runtimeDimensions.width
        || game.value?.scale?.height !== runtimeDimensions.height
      ) {
        game.value?.scale?.setGameSize(runtimeDimensions.width, runtimeDimensions.height)
      }

      game.value?.scale.refresh()
    })
  }

  function syncScenePhase(phase, previousPhase = null) {
    const mainScene = getMainScene()

    if (!mainScene) {
      return
    }

    if (phase === 'paused') {
      mainScene.pauseGameplay?.()
      return
    }

    if (previousPhase === 'paused' && ['running', 'spawning', 'wave-clear'].includes(phase)) {
      mainScene.resumeGameplay?.()
    }
  }

  function stopGame(reason = 'unknown') {
    clearQueuedFrames()
    resetPersistentMovementKeys()
    resetMobileInput()

    if (!game.value) {
      console.debug('[GameLoop] stop skipped', { reason })
      clearGameContainer()
      return
    }

    console.debug('[GameLoop] stop', { reason })
    game.value.destroy(true)
    game.value = null
    clearGameContainer()
  }

  function resetGame(reason = 'unknown') {
    console.debug('[GameReset] reset', { reason })
    resetPersistentMovementKeys()
    resetMobileInput()
    gameStore.startRun()
  }

  function startGame(reason = 'unknown') {
    if (!containerRef.value) {
      console.debug('[GameLoop] start skipped, missing container', { reason })
      isRestarting = false
      return
    }

    clearGameContainer()

    startFrameId = requestAnimationFrame(() => {
      startFrameId = 0

      if (!containerRef.value) {
        console.debug('[GameLoop] start aborted, container removed', { reason })
        isRestarting = false
        return
      }

      console.debug('[GameLoop] start', { reason })
      game.value = createGame(containerRef.value)
      refreshScale()
      isRestarting = false
    })
  }

  function restartGame(reason = 'unknown') {
    if (isRestarting) {
      console.debug('[GameReset] restart ignored, already in progress', { reason })
      return
    }

    isRestarting = true
    console.debug('[GameReset] restart requested', {
      reason,
      runId: gameStore.runId,
    })

    stopGame(`restart:${reason}`)
    resetGame(reason)
    startGame(reason)
  }

  function toggleMute() {
    const nextMuted = getMainScene()?.soundManager?.toggleMuted?.()

    return typeof nextMuted === 'boolean' ? nextMuted : null
  }

  onMounted(() => {
    restartGame('mounted')

    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        refreshScale()
      })
      resizeObserver.observe(containerRef.value)
    }

    window.addEventListener('resize', refreshScale)
    window.addEventListener('orientationchange', refreshScale)
    document.addEventListener('fullscreenchange', refreshScale)
  })

  watch(
    () => gameStore.runId,
    () => {
      restartGame('runId-change')
    },
  )

  watch(
    () => gameStore.phase,
    (phase, previousPhase) => {
      syncScenePhase(phase, previousPhase)
    },
  )

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', refreshScale)
    window.removeEventListener('orientationchange', refreshScale)
    document.removeEventListener('fullscreenchange', refreshScale)
    stopGame('unmount')
    isRestarting = false
    gameStore.setPhase('idle')
  })

  return {
    game,
    resetGame,
    restartGame,
    toggleMute,
  }
}
