<template>
  <div :class="['app-shell', isGameRoute ? 'app-shell--game' : 'app-shell--landing']">
    <Transition
      mode="out-in"
      name="screen-fade"
    >
      <main
        :key="route.fullPath"
        :class="['app-main', isGameRoute ? 'app-main--game' : 'app-main--landing']"
      >
        <RouterView />
      </main>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const isGameRoute = computed(() => route.meta.layout === 'game')

watch(
  isGameRoute,
  (value) => {
    document.body.classList.toggle('body--game-route', value)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.classList.remove('body--game-route')
})
</script>
