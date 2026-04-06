# 🧟 Zoombie

A browser-based 2D top-down zombie survival game built with **Vue 3**, **Phaser 3**, and **Pinia**. Survive increasingly brutal waves of zombies, collect weapons and power-ups, and face terrifying bosses across 15 waves of relentless combat — or go on forever in Endless Mode.

---

## 🎮 Gameplay Overview

You play as a lone survivor in a dark arena. Zombies spawn from the edges of the map and relentlessly chase you. Your goal is to survive as many waves as possible, rack up the highest score, and take down the Final Boss to unlock Endless Mode.

Between waves you choose **upgrades** to power up your stats and **weapons** to change your combat style. Every run is slightly different.

---

## 🕹️ Controls

| Input | Action |
|---|---|
| `W A S D` | Move the player |
| `Mouse` | Aim |
| `Left Mouse Button` | Shoot |
| `M` | Toggle mute |

---

## 🌊 Wave System

The game is structured around waves of escalating difficulty:

- **Normal Mode** — 15 waves, ending with a Final Boss encounter
- **Endless Mode** — Unlocked after completing Normal Mode; waves continue infinitely, scaling forever

Each wave increases:
- **Zombie count** — More hostiles per wave
- **Zombie speed** — Faster movement per wave
- **Zombie health** — Tougher enemies every 2 waves
- **Spawn rate** — Shorter intervals between spawns
- **Spawn points** — More sides of the arena open up (up to 4 directions from wave 7)

Every **3 waves** you are offered an upgrade selection. Every **5 waves** a Mini Boss spawns.

---

## 🧟 Zombie Types

| Type | Description |
|---|---|
| **Walker** | Standard zombie. Balanced health and speed. Unlocked from wave 1. |
| **Runner** | Fast and fragile. Low HP but covers ground quickly. Unlocked from wave 2. |
| **Tank** | Slow but heavily armored. Deals double damage on contact. Unlocked from wave 4. |
| **Toxic** | Average stats but applies a **poison DoT** on hit. Unlocked from wave 5. |
| **Mini Boss** | Large, tough zombie with bonus health and damage. Spawns every 5 waves with support zombies. Drops a weapon reward on death. |
| **Giant Boss** (Final) | The ultimate threat on wave 15. Uses **Ground Smash** (AoE attack with telegraph warning) and **Summons** reinforcements mid-fight. |

---

## 🔫 Weapons

| Weapon | Fire Rate | Pellets | Damage | Ammo | Notes |
|---|---|---|---|---|---|
| **Pistol** | 130ms | 1 | 1 | ∞ | Default fallback weapon, never runs out |
| **Shotgun** | 460ms | 5 | 1 each | 10 | Wide spread, devastating at close range |
| **Rifle** | 175ms | 1 | 2 | 24 | Accurate, solid mid-range damage |
| **SMG** | 80ms | 1 | 1 | 48 | Fastest fire rate, great for hordes |

- Weapons are selected between waves from a pool of choices.
- Weapons can **drop from defeated zombies** as floor pickups with random ammo.
- When your ammo runs out, the game auto-swaps back to the Pistol.
- **Headshotting** a zombie deals **2.5× damage**.

---

## ⬆️ Upgrades

Offered every 3 waves and after boss waves. Choose 1 of 3 random cards:

| Upgrade | Effect | Cap |
|---|---|---|
| **Hollow Point** | +20% bullet damage | ×3.0 |
| **Rapid Cycling** | +15% fire rate | ×2.2 |
| **Combat Stims** | +10% move speed | ×1.75 |
| **Split Chamber** | +1 bullet per shot (all weapons) | +3 bullets |
| **Field Conditioning** | +10% max HP (heals the gained amount) | 12 HP |
| **Blood Drive** | +5% lifesteal on damage dealt | 25% |

---

## 💊 Drops

Zombies can drop floor loot that the player picks up by walking over it:

- **Small Health Pack** — Restores a small amount of HP
- **Large Health Pack** — Restores a larger amount of HP
- **Weapon Drop** — Grants a weapon with random ammo (Shotgun, Rifle, or SMG)

Mini Bosses always drop a guaranteed **weapon reward** with bonus ammo. If your HP is critically low, they may drop a large health pack instead.

---

## 📊 Score & Stats

- Each zombie kill grants **score points** based on type (Walkers = 10, Runners = 15, Mini Bosses = 120+, Final Boss = 320+)
- **Headshots** award bonus score multiplier
- Your **best score** is saved to local storage and displayed on the HUD
- End-of-run stats tracked: Score, Wave reached, Kills, Headshots, Survival time, Run outcome

---

## 🏗️ Project Structure

```
src/
├── game/
│   ├── scenes/          # Phaser scenes (Boot, Menu, Main, GameOver, Victory)
│   ├── entities/        # Player, Zombie, Bullet classes
│   ├── systems/         # Combat, Wave, Boss, Spawn, Drop, Weapon, Upgrade, HUD, Sound, Effects
│   ├── managers/        # Asset loader, Game manager
│   └── config/          # Gameplay balance (waves, zombies, weapons, upgrades, audio)
├── components/
│   ├── game/            # GameCanvas, HUD, ScoreBoard
│   ├── ui/              # BaseButton, BaseCard
│   └── layout/          # Layout components
├── stores/              # Pinia stores (game state, player, UI)
├── views/               # Vue route pages (Home, Game, About)
├── services/            # Storage, Audio services
└── utils/               # Constants, helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`

### Install & Run

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser for best results.

### Build for Production

```sh
npm run build
```

### Preview the Production Build Locally

```sh
npm run preview
```

---

## ▲ Deploying to Vercel

This project is a **Vite SPA** with Vue Router history mode. That means direct requests to routes like `/game` must be rewritten back to `index.html` in production.

That is already configured in `vercel.json`.

### One-time setup

1. Push the repo to GitHub, GitLab, or Bitbucket
2. Import the project into Vercel
3. Use these project settings if Vercel asks:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Why the Vercel config matters

- The app uses `createWebHistory(...)`, so `/game` is a real client-side route
- Without a rewrite, refreshing `/game` on Vercel returns a 404
- `vercel.json` rewrites unmatched requests to `index.html`, so the Vue app can boot and route correctly

### Deploy commands

If you use the Vercel CLI:

```sh
npm i -g vercel
vercel
vercel --prod
```

### Notes

- No environment variables are required for this project
- Node.js is already declared in `package.json`, so Vercel will use a compatible runtime
- The Vite Vue devtools plugin is now limited to local dev, so production builds on Vercel stay cleaner

---

## 🛠️ Tech Stack

| Tool | Version | Role |
|---|---|---|
| [Vue 3](https://vuejs.org/) | beta | UI framework & routing |
| [Phaser 3](https://phaser.io/) | ^3.90 | 2D game engine |
| [Pinia](https://pinia.vuejs.org/) | ^3.0 | Game state management |
| [TailwindCSS](https://tailwindcss.com/) | v4 | Styling |
| [Vite](https://vite.dev/) | ^7.3 | Build tool & dev server |

---

## 🔧 Recommended Browser Setup

- **Chrome / Edge / Brave** — Install [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) + enable Custom Object Formatters in DevTools
- **Firefox** — Install [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) + enable Custom Object Formatters
