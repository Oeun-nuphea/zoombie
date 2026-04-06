import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    name: 'Hunter',
    bestScore: 0,
  }),
  actions: {
    setName(name) {
      this.name = name
    },
    setBestScore(score) {
      this.bestScore = score
    },
  },
})
