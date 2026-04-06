<template>
  <button
    :class="buttonClass"
    type="button"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
})

const buttonClass = computed(() => {
  const baseClass =
    'rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/60'

  if (props.variant === 'ghost') {
    return `${baseClass} border border-white/15 text-slate-200 hover:border-cyan-300 hover:text-cyan-200`
  }

  return `${baseClass} bg-cyan-400 text-slate-950 hover:bg-cyan-300`
})
</script>
