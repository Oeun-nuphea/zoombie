<template>
  <Transition name="modal-fade">
    <div
      v-if="visible"
      class="go-overlay"
      :class="victory ? 'go-overlay--victory' : 'go-overlay--defeat'"
    >
      <div class="go-card" :class="victory ? 'go-card--victory' : 'go-card--defeat'">

        <!-- ── Outcome header ── -->
        <div class="go-header">
          <span class="go-header__kicker">
            {{ victory ? '🏆  Mission Complete' : '💀  Run Ended' }}
          </span>
          <h2 class="go-header__title">
            {{ victory ? 'Area Secured.' : 'You Got Swarmed.' }}
          </h2>
          <p class="go-header__subtitle">
            {{ victory
              ? 'The boss is down. Endless Mode unlocked.'
              : 'Rebuild and hit the next wave harder.' }}
          </p>
        </div>

        <!-- ── Performance grade ── -->
        <div class="go-grade" :class="`go-grade--${grade.tier}`">
          <span class="go-grade__letter">{{ grade.letter }}</span>
          <span class="go-grade__label">{{ grade.label }}</span>
        </div>

        <!-- ── Stat grid ── -->
        <div class="go-stats">
          <div class="go-stat">
            <span class="go-stat__icon">🌊</span>
            <span class="go-stat__label">Wave</span>
            <strong class="go-stat__value">{{ gameStore.lastWave }}</strong>
          </div>
          <div class="go-stat go-stat--highlight">
            <span class="go-stat__icon">⭐</span>
            <span class="go-stat__label">Score</span>
            <strong class="go-stat__value">{{ formatScore(gameStore.lastScore) }}</strong>
          </div>
          <div class="go-stat">
            <span class="go-stat__icon">☠️</span>
            <span class="go-stat__label">Kills</span>
            <strong class="go-stat__value">{{ gameStore.lastKills }}</strong>
          </div>
          <div class="go-stat">
            <span class="go-stat__icon">🎯</span>
            <span class="go-stat__label">Headshots</span>
            <strong class="go-stat__value">{{ gameStore.lastHeadshots }}</strong>
          </div>
          <div class="go-stat">
            <span class="go-stat__icon">📡</span>
            <span class="go-stat__label">Accuracy</span>
            <strong class="go-stat__value">{{ accuracy }}</strong>
          </div>
          <div class="go-stat">
            <span class="go-stat__icon">⏱️</span>
            <span class="go-stat__label">Survived</span>
            <strong class="go-stat__value">{{ formatDuration(gameStore.lastSurvivalTimeMs) }}</strong>
          </div>
        </div>

        <!-- ── Souls earned ── -->
        <div v-if="soulsEarned > 0" class="go-souls">
          <span class="go-souls__icon">🔮</span>
          <span class="go-souls__text">+{{ soulsEarned }} Souls Earned</span>
        </div>

        <!-- ── Actions ── -->
        <div class="go-actions">
          <button
            v-if="victory"
            id="go-btn-endless"
            class="go-btn go-btn--accent"
            type="button"
            @click="$emit('endless')"
          >
            ⚡ Enter Endless
          </button>

          <button
            id="go-btn-restart"
            class="go-btn go-btn--primary"
            type="button"
            @click="$emit('restart')"
          >
            {{ victory ? '🔄 Play Again' : '🔄 Restart Run' }}
          </button>

          <button
            id="go-btn-quit"
            class="go-btn go-btn--ghost"
            type="button"
            @click="$emit('quit')"
          >
            ← Main Menu
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { formatDuration, formatScore } from '../../utils/helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
  victory: { type: Boolean, default: false },
  gameStore: { type: Object, required: true },
})

defineEmits(['restart', 'quit', 'endless'])

// ── Computed stats ────────────────────────────────────────────────────────
const accuracy = computed(() => {
  const kills = props.gameStore.lastKills ?? 0
  const heads = props.gameStore.lastHeadshots ?? 0
  if (kills <= 0) return '—'
  return `${Math.round((heads / kills) * 100)}%`
})

const soulsEarned = computed(() =>
  Math.max(1, Math.floor((props.gameStore.lastScore ?? 0) / 15)),
)

// ── Performance grade ─────────────────────────────────────────────────────
const grade = computed(() => {
  const score  = props.gameStore.lastScore ?? 0
  const wave   = props.gameStore.lastWave ?? 1
  const kills  = props.gameStore.lastKills ?? 0
  const rating = score + wave * 80 + kills * 4 + (props.victory ? 2000 : 0)

  if (rating >= 3500) return { tier: 's', letter: 'S', label: 'Flawless' }
  if (rating >= 2200) return { tier: 'a', letter: 'A', label: 'Excellent' }
  if (rating >= 1200) return { tier: 'b', letter: 'B', label: 'Solid' }
  if (rating >= 600)  return { tier: 'c', letter: 'C', label: 'Average' }
  return               { tier: 'd', letter: 'D', label: 'Keep Trying' }
})
</script>

<style scoped>
/* ── Overlay ────────────────────────────────────────────────────────────── */
.go-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(14px);
}

.go-overlay--defeat {
  background: radial-gradient(ellipse at center, rgba(69, 10, 10, 0.55) 0%, rgba(2, 6, 10, 0.72) 100%);
}

.go-overlay--victory {
  background: radial-gradient(ellipse at center, rgba(5, 46, 22, 0.55) 0%, rgba(2, 6, 10, 0.72) 100%);
}

/* ── Card ───────────────────────────────────────────────────────────────── */
.go-card {
  width: 100%;
  max-width: 30rem;
  padding: 2rem 1.75rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(8, 14, 24, 0.97);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.035),
    0 32px 80px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 92vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.go-card--defeat {
  border-top: 3px solid #ef4444;
  box-shadow:
    0 0 40px rgba(239, 68, 68, 0.12),
    0 32px 80px rgba(0,0,0,0.7);
}

.go-card--victory {
  border-top: 3px solid #34d399;
  box-shadow:
    0 0 40px rgba(52, 211, 153, 0.12),
    0 32px 80px rgba(0,0,0,0.7);
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.go-header {
  text-align: center;
}

.go-header__kicker {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #fcd34d;
  margin-bottom: 0.5rem;
}

.go-header__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 900;
  color: #f8fafc;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.go-header__subtitle {
  margin: 0;
  font-size: 0.84rem;
  color: rgba(148, 163, 184, 0.9);
  line-height: 1.5;
}

/* ── Grade ──────────────────────────────────────────────────────────────── */
.go-grade {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(15,23,42,0.6);
}

.go-grade__letter {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
  min-width: 2.5rem;
  text-align: center;
  text-shadow: 0 0 20px currentColor;
}

.go-grade__label {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(226,232,240,0.7);
}

.go-grade--s .go-grade__letter { color: #fbbf24; }
.go-grade--a .go-grade__letter { color: #34d399; }
.go-grade--b .go-grade__letter { color: #60a5fa; }
.go-grade--c .go-grade__letter { color: #a78bfa; }
.go-grade--d .go-grade__letter { color: #94a3b8; }

/* ── Stats grid ─────────────────────────────────────────────────────────── */
.go-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}

.go-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.04);
  text-align: center;
  transition: background 0.15s;
}

.go-stat--highlight {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.18);
}

.go-stat__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.go-stat__label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(252, 211, 77, 0.75);
}

.go-stat__value {
  font-size: 1.1rem;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

/* ── Souls ──────────────────────────────────────────────────────────────── */
.go-souls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.go-souls__icon {
  font-size: 1rem;
}

.go-souls__text {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c4b5fd;
}

/* ── Actions ────────────────────────────────────────────────────────────── */
.go-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.go-btn {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.go-btn:hover  { opacity: 0.88; transform: translateY(-1px); }
.go-btn:active { transform: translateY(0); }

.go-btn--primary {
  background: linear-gradient(160deg, #fbbf24 0%, #f97316 100%);
  color: #190d06;
}

.go-btn--accent {
  background: linear-gradient(160deg, #34d399 0%, #059669 100%);
  color: #04110d;
}

.go-btn--ghost {
  background: rgba(15, 23, 42, 0.8);
  color: rgba(226,232,240,0.75);
  border: 1px solid rgba(255,255,255,0.07);
  font-size: 0.78rem;
}

/* ── Transition ─────────────────────────────────────────────────────────── */
.modal-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
}

.modal-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(12px);
}

/* ── Mobile tweaks ──────────────────────────────────────────────────────── */
@media (max-width: 480px), (max-height: 700px) {
  .go-card {
    padding: 1.3rem 1.1rem;
    gap: 0.9rem;
    border-radius: 1.2rem;
  }

  .go-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .go-stat {
    padding: 0.6rem 0.35rem;
    border-radius: 0.75rem;
  }

  .go-stat__value {
    font-size: 0.95rem;
  }

  .go-grade__letter {
    font-size: 1.9rem;
  }

  .go-btn {
    padding: 0.72rem 1rem;
    font-size: 0.75rem;
  }
}

/* Landscape mobile - 2 column compact layout */
@media (orientation: landscape) and (max-height: 600px) {
  .go-card {
    max-width: 42rem;
    padding: 0.75rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    grid-template-rows: auto 1fr auto;
    row-gap: 0.5rem;
    column-gap: 1.5rem;
    align-items: center;
  }

  .go-header {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 0;
  }

  .go-header__title {
    font-size: 1.3rem;
    margin-bottom: 0.2rem;
  }

  .go-grade {
    grid-column: 1;
    grid-row: 2;
    padding: 0.5rem;
  }

  .go-stats {
    grid-column: 2;
    grid-row: 2;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }

  .go-stat {
    padding: 0.4rem 0.2rem;
  }

  .go-souls {
    grid-column: 1 / -1;
    padding: 0.35rem;
  }

  .go-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
  }

  .go-btn {
    padding: 0.65rem 1rem;
    font-size: 0.7rem;
  }
}
</style>
