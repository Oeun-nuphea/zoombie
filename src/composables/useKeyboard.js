import { onBeforeUnmount, onMounted, reactive } from 'vue'

export function useKeyboard() {
  const keys = reactive({})

  function onKeydown(event) {
    keys[event.code] = true
  }

  function onKeyup(event) {
    keys[event.code] = false
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('keyup', onKeyup)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('keyup', onKeyup)
  })

  return { keys }
}
