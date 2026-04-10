<!-- <template>
  <div class="redirect-screen">
    <div class="redirect-screen__backdrop"></div>
    <div class="redirect-screen__content">
      <p class="redirect-screen__eyebrow">Presentation</p>
      <h1 class="redirect-screen__title">Opening Canva…</h1>
      <p class="redirect-screen__sub">If the page didn't open automatically, tap the button below.</p>
      <a
        class="redirect-screen__btn"
        href="https://canva.link/d64kcta3h0ey7fw"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Presentation ↗
      </a>
      <button class="redirect-screen__back" @click="goHome">← Back to Game</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

onMounted(() => {
  window.open('https://canva.link/d64kcta3h0ey7fw', '_blank', 'noopener,noreferrer')
})
</script>

<style scoped>
.redirect-screen {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(248, 113, 113, 0.18), transparent 34%),
    radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.14), transparent 28%),
    linear-gradient(180deg, #080a0d 0%, #11161c 50%, #060709 100%);
  color: #f8fafc;
  font-family: inherit;
}

.redirect-screen__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7, 9, 12, 0.88) 0%, rgba(7, 9, 12, 0.6) 48%, rgba(7, 9, 12, 0.85) 100%),
    url('/assets/maps/field-map.png') center / cover no-repeat;
  filter: saturate(0.6) brightness(0.35);
  transform: scale(1.05);
}

.redirect-screen__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  max-width: 28rem;
  padding: 2rem;
}

.redirect-screen__eyebrow {
  margin: 0;
  color: #fcd34d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.redirect-screen__title {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.redirect-screen__sub {
  margin: 0;
  color: rgba(226, 232, 240, 0.6);
  font-size: 0.9rem;
  line-height: 1.6;
}

.redirect-screen__btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 100%);
  color: #130b06;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 999px;
  box-shadow: 0 14px 32px rgba(249, 115, 22, 0.28);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.redirect-screen__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}

.redirect-screen__back {
  background: none;
  border: none;
  color: rgba(226, 232, 240, 0.5);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  letter-spacing: 0.08em;
  transition: color 150ms ease;
  padding: 0;
}

.redirect-screen__back:hover {
  color: #f8fafc;
}
</style> -->
