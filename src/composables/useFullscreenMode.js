import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null
  )
}

export async function requestElementFullscreen(element) {
  if (!element) {
    return
  }

  if (element.requestFullscreen) {
    await element.requestFullscreen()
    return
  }

  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
    return
  }

  if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

export async function requestDocumentFullscreen() {
  if (typeof document === 'undefined') {
    return
  }

  await requestElementFullscreen(document.documentElement)
}

export async function exitDocumentFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }

  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
    return
  }

  if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

export function useFullscreenMode(targetRef) {
  const activeElement = ref(null)
  const isFullscreen = computed(() => activeElement.value !== null)

  function syncFullscreenState() {
    activeElement.value = getFullscreenElement()
  }

  async function toggleFullscreen() {
    if (isFullscreen.value) {
      await exitDocumentFullscreen()
      return
    }

    if (!targetRef.value) {
      return
    }

    await requestElementFullscreen(targetRef.value)
  }

  onMounted(() => {
    syncFullscreenState()
    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('webkitfullscreenchange', syncFullscreenState)
    document.addEventListener('msfullscreenchange', syncFullscreenState)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncFullscreenState)
    document.removeEventListener('webkitfullscreenchange', syncFullscreenState)
    document.removeEventListener('msfullscreenchange', syncFullscreenState)
  })

  return {
    activeElement,
    isFullscreen,
    toggleFullscreen,
  }
}
