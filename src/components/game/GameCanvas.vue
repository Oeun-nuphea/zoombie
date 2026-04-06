<template>
  <div
    ref="gameRoot"
    class="phaser-stage"
  ></div>
</template>

<script setup>
import { ref } from 'vue'

import { useGame } from '../../composables/useGame'

const gameRoot = ref(null)

const gameApi = useGame(gameRoot)

defineExpose(gameApi)
</script>
