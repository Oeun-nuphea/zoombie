<template>
  <BaseCard title="Session State">
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div class="rounded-2xl bg-slate-950/60 p-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Phase</p>
          <p class="mt-2 text-lg font-bold text-white">{{ game.phase }}</p>
        </div>
        <div class="rounded-2xl bg-slate-950/60 p-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Wave</p>
          <p class="mt-2 text-lg font-bold text-white">{{ game.wave }}</p>
        </div>
        <div class="rounded-2xl bg-slate-950/60 p-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
          <p class="mt-2 text-lg font-bold text-white">{{ formatScore(game.score) }}</p>
        </div>
        <div class="rounded-2xl bg-slate-950/60 p-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Health</p>
          <p class="mt-2 text-lg font-bold text-white">{{ game.health }}</p>
        </div>
      </div>

      <div class="rounded-2xl bg-slate-950/60 p-3 text-center">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Zombies Left</p>
        <p class="mt-2 text-lg font-bold text-white">{{ game.zombiesRemaining }}</p>
      </div>

      <BaseButton @click="game.requestRestart()">
        {{ game.phase === 'game-over' ? 'Restart Run' : 'Reset Session' }}
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup>
import { useGameStore } from '../../stores/gameStore'
import { formatScore } from '../../utils/helpers'
import BaseButton from '../ui/BaseButton.vue'
import BaseCard from '../ui/BaseCard.vue'

const game = useGameStore()
</script>
