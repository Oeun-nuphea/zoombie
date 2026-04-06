<template>
  <div
    v-if="visible"
    class="game-over-modal responsive-overlay"
  >
    <div class="game-over-modal__card responsive-overlay__panel">
      <p class="game-over-modal__label">{{ victory ? 'Victory' : 'Run Ended' }}</p>
      <h2 class="game-over-modal__title">
        {{ victory ? 'Area secured.' : 'You got swarmed.' }}
      </h2>
      <p class="game-over-modal__copy">
        {{ victory ? 'The boss is down. Endless Mode is live.' : 'Rebuild the run and hit the next wave harder.' }}
      </p>

      <div class="game-over-modal__stats">
        <div>
          <span>Wave</span>
          <strong>{{ gameStore.lastWave }}</strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{{ formatScore(gameStore.lastScore) }}</strong>
        </div>
        <div>
          <span>Kills</span>
          <strong>{{ gameStore.lastKills }}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>{{ formatDuration(gameStore.lastSurvivalTimeMs) }}</strong>
        </div>
      </div>

      <div class="game-over-modal__actions">
        <button
          v-if="victory"
          class="game-over-modal__button game-over-modal__button--accent"
          type="button"
          @click="$emit('endless')"
        >
          Enter Endless
        </button>

        <button
          class="game-over-modal__button game-over-modal__button--primary"
          type="button"
          @click="$emit('restart')"
        >
          {{ victory ? 'Play Again' : 'Restart Run' }}
        </button>

        <button
          class="game-over-modal__button"
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
import { formatDuration, formatScore } from '../../utils/helpers'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  victory: {
    type: Boolean,
    default: false,
  },
  gameStore: {
    type: Object,
    required: true,
  },
})

defineEmits(['restart', 'quit', 'endless'])
</script>

<style scoped>
.game-over-modal {
  z-index: 55;
  background: rgba(2, 6, 10, 0.62);
  backdrop-filter: blur(10px);
}

.game-over-modal__card {
  --overlay-width: 34rem;
  background: rgba(8, 17, 28, 0.96);
}

.game-over-modal__label {
  margin: 0;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.game-over-modal__title {
  margin: 0.6rem 0 0;
  color: #f8fafc;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 900;
}

.game-over-modal__copy {
  margin: 0.85rem 0 0;
  color: rgba(226, 232, 240, 0.82);
  line-height: 1.6;
}

.game-over-modal__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1.35rem;
}

.game-over-modal__stats div {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.72);
}

.game-over-modal__stats span {
  display: block;
  color: rgba(252, 211, 77, 0.82);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.game-over-modal__stats strong {
  display: block;
  margin-top: 0.45rem;
  color: #f8fafc;
  font-size: 1.2rem;
  font-weight: 900;
}

.game-over-modal__actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.game-over-modal__button {
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

.game-over-modal__button--primary {
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #190d06;
}

.game-over-modal__button--accent {
  background: linear-gradient(180deg, #34d399 0%, #059669 100%);
  color: #04110d;
}

@media (max-width: 767px), (max-height: 760px) {
  .game-over-modal__card {
    --overlay-width: 28rem;
    padding: 0.9rem;
    border-radius: 1.05rem;
  }

  .game-over-modal__label {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
  }

  .game-over-modal__title {
    margin-top: 0.45rem;
    font-size: clamp(1.4rem, 6vw, 1.92rem);
    line-height: 1;
  }

  .game-over-modal__copy {
    margin-top: 0.55rem;
    font-size: 0.8rem;
    line-height: 1.42;
  }

  .game-over-modal__stats {
    gap: 0.65rem;
    margin-top: 0.95rem;
  }

  .game-over-modal__stats div {
    padding: 0.68rem 0.78rem;
    border-radius: 0.85rem;
  }

  .game-over-modal__stats span {
    font-size: 0.58rem;
    letter-spacing: 0.16em;
  }

  .game-over-modal__stats strong {
    margin-top: 0.28rem;
    font-size: 1rem;
  }

  .game-over-modal__actions {
    grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
    gap: 0.6rem;
    margin-top: 0.95rem;
  }

  .game-over-modal__button {
    min-height: 2.7rem;
    padding: 0.72rem 0.9rem;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }
}

@media (orientation: landscape) and (max-width: 1023px) {
  .game-over-modal__card {
    --overlay-width: 26rem;
    padding: 0.82rem;
  }

  .game-over-modal__copy {
    font-size: 0.76rem;
  }

  .game-over-modal__stats {
    gap: 0.55rem;
  }

  .game-over-modal__stats div {
    padding: 0.62rem 0.72rem;
  }

  .game-over-modal__button {
    min-height: 2.45rem;
    padding: 0.64rem 0.8rem;
    font-size: 0.68rem;
  }
}

@media (max-width: 420px) {
  .game-over-modal__card {
    --overlay-width: 23rem;
    padding: 0.78rem;
  }

  .game-over-modal__title {
    font-size: clamp(1.22rem, 6vw, 1.6rem);
  }

  .game-over-modal__copy {
    font-size: 0.74rem;
  }

  .game-over-modal__stats {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .game-over-modal__stats strong {
    font-size: 0.94rem;
  }

  .game-over-modal__button {
    min-height: 2.35rem;
    font-size: 0.66rem;
  }
}
</style>
