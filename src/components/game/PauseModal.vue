<template>
  <div
    v-if="visible"
    class="game-modal responsive-overlay"
  >
    <div class="game-modal__card responsive-overlay__panel">
      <p class="game-modal__label">Paused</p>
      <h2 class="game-modal__title">Take a breath.</h2>
      <p class="game-modal__copy">The swarm will wait. Resume when you are ready.</p>

      <div class="game-modal__actions">
        <button
          class="game-modal__button game-modal__button--primary"
          type="button"
          @click="$emit('resume')"
        >
          Resume
        </button>
        <button
          class="game-modal__button"
          type="button"
          @click="$emit('restart')"
        >
          Restart Run
        </button>
        <button
          class="game-modal__button"
          type="button"
          @click="$emit('quit')"
        >
          Back to Landing
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['resume', 'restart', 'quit'])
</script>

<style scoped>
.game-modal {
  z-index: 50;
  background: rgba(3, 6, 9, 0.54);
  backdrop-filter: blur(8px);
}

.game-modal__card {
  --overlay-width: 26rem;
  background: rgba(8, 17, 28, 0.95);
}

.game-modal__label {
  margin: 0;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.game-modal__title {
  margin: 0.6rem 0 0;
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 900;
}

.game-modal__copy {
  margin: 0.9rem 0 0;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.6;
}

.game-modal__actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.4rem;
}

.game-modal__button {
  min-height: 3.35rem;
  padding: 0.95rem 1.15rem;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
}

.game-modal__button--primary {
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #190d06;
}

@media (max-width: 640px), (max-height: 760px) {
  .game-modal__title {
    font-size: clamp(1.5rem, 7vw, 1.8rem);
  }

  .game-modal__copy {
    font-size: 0.95rem;
  }
}
</style>
