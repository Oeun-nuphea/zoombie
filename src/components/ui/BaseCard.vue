<template>
  <article class="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur">
    <h2 class="text-lg font-bold text-white">
      {{ title }}
    </h2>
    <div class="mt-3 text-sm leading-6 text-slate-300">
      <slot />
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>
