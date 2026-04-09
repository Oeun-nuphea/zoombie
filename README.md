# 🧟 Zoombie - Comprehensive Game Design Document

Welcome to the definitive guide for **Zoombie**. This document covers absolutely everything about the game: mechanics, content, progression, config data, and architecture.

---

## 🎮 1. The Core Loop
**Zoombie** is a top-down, wave-based zombie survival shooter built in the browser.
Survive waves of zombies, collect drops from fallen enemies, pick tactical upgrades between waves, and defeat bosses.
- **Controls**: `W A S D` to move, `Mouse` to aim, `Left Click` to shoot, `M` to mute audio, `Space` for Dash (if unlocked), `Q` for Shield (if unlocked).
- **Headshots**: Aiming at zombie heads directly multiplies damage dealt by **2.5x**. Hitting a headshot will also grant bonus score.
- **Run Modes**:
  - **Normal Mode**: 15 Waves, ending with a Final Boss fight.
  - **Endless Mode**: Unlocked after beating Normal Mode. Waves scale infinitely.

---

## 🔫 2. Weapon Arsenal
The game features 4 weapons. You pick one between waves, but can find others as temporary floor loot. 

| Weapon | Fire Rate (ms) | Bullets | Base Damage | Bullet Speed | Description & Traits |
|---|---|---|---|---|---|
| **Pistol** | 130 | 1 | 1 | 900 | Fast shots, low damage. Has **infinite ammo**. |
| **Shotgun** | 460 | 5 | 1 (per pellet) | 760 | Heavy burst, wide spread. finite loadout (10 ammo). |
| **Rifle** | 175 | 1 | 2 | 980 | Solid control and range. Finite loadout (24 ammo). |
| **SMG** | 80 | 1 | 1 | 860 | Fast fire, large magazine. Finite loadout (48 ammo). |

> **Ammo Mechanics**: When your selected or dropped weapon runs dry, you instantly auto-swap back to the infinite-ammo Pistol.
> Weapons drop globally with a 30% base chance, lasting 7.2 seconds on the floor. Shotgun, Rifle, and SMG are in the drop pool.

---

## 🧟 3. Bestiary (Zombie Types)
Zombie scaling changes base speed and health continuously. Their stats compound wave-over-wave. 

1. **Walker** (Wave 1): The baseline zombie. Standard size. Values 10 points. 
2. **Runner** (Wave 2): 158% movement speed, but only 72% health of a Walker. Small and chaotic. Values 15 points.
3. **Tank** (Wave 4): 340% baseline health, only 66% speed. Massive size. Deals 2 base damage. Values 24 points.
4. **Toxic** (Wave 5): Drops poison on hit (deals 1 DoT every 800ms for 2200ms). Values 18 points.
5. **Boomer** (Wave 6): Small, somewhat fast. **Explodes on death** (160 range, 2 damage) and leaves an Acid Pool for 3 seconds.
6. **Riot Guard / Shield** (Wave 7): Large size. **Blocks frontal hit damage.** Only vulnerable from behind or via penetrative attacks. 28 points.
7. **Mini Boss** (Every 5 Waves): 
   - Has **1200% baseline health**. Damage and speed increase drastically per boss tier. 
   - At 50% health, enters **Enraged Phase** (+40% speed, +1 damage).
   - Skills include: Summoning horde, Plague Spitting (ranged splash attack), Charge, and Ground Slam (AoE).
8. **Giant Zombie (Final Boss - Wave 15)**: 
   - Massive 300 Fixed HP (scales up drastically with multipliers).
   - At 50% health, enters **Enraged Phase** (+16% speed, +1 damage).
   - Skills: Acid Spit, Summoning walkers/runners, and Massive Ground Smash (deals 2 damage, massive knockback within 178 radius).

---

## ⬆️ 4. Upgrade Synergies
Offered every 3 waves or after Boss waves. Most upgrades can stack explicitly to amplify their effects!

### Passives
- **Hollow Point (+18% DMG)**: Boosts base bullet damage. Stacks 4 times.
- **Rapid Cycling (+14% Fire Rate)**: Increases attack speed. Stacks 4 times.
- **Combat Stims (+8% Move Speed)**: Boosts movement speed. Stacks 3 times.
- **Field Conditioning (+10% Max HP)**: Immediately grants max HP and heals you. Stacks 3 times.
- **Blood Drive (+4% Lifesteal)**: Converts damage into health. Stacks 3 times.
- **Cryo Field (Slow Aura)**: Surrounds player in frost, slowing enemies. Additional stacks increase radius and slow intensity.
- **Piercing Rounds**: Shots pierce an extra target. Boss featured reward. Stacks 2 times.
- **Ricochet Lattice**: Spent bullets bounce toward nearby targets. Boss featured reward. Stacks 2 times.

### Events / Triggers
- **Volatile Finish (Blast on kill)**: Bullet kills detonate the corpse, damaging nearby enemies. Stacks 2 times.
- **Execution Loop (Headshot Reload)**: Headshot kills restore ammo padding directly to the current reserve. Stacks 2 times.

### Actives (Boss Features)
- **Burst Step (Dash)**: Press `Space` to dive. Unlocks Dash with invulnerability frames. Stacks increase distance, lower cooldown (from 2400ms down to 1100ms).
- **Aegis Pulse (Shield)**: Press `Q` to pop a damage-negating shield. Stacks increase duration and lower cooldown.

---

## 🌊 5. Wave & Pacing Configurations
Survival pacing gets rougher as time goes on:
- Zombies increase by 2 total per wave.
- Maximum Alive limit increases every 2 waves.
- Spawn intervals get 24ms faster every wave, down to a cap of a blazing fast 140ms between zombie spawns!
- Zombie spawn points open up aggressively: Starting with 1 active side, moving to 2 sides (Wave 3), 3 sides (Wave 5), and surrounding the player completely on all 4 sides by Wave 7.
- **Boss Guarantees**: A Mini Boss will always drop a full Weapon refill. If your health drops below 30%, the Boss has an 80% chance to drop a Full Heal instead.

---

## 💊 6. Wave Rewards / Floor Drops
When defeating standard enemies, they may occasionally drop:
- **Heals**: Restores 1 HP point.
- **Ammo**: Restores chunks of missing ammo (minimum 6).
- **Temporary Buffs**: "Battle Rush" drop grants 18 seconds of +12% damage, +10% fire rate, and +8% speed.
- **Minor Passives**: Droppable stat nudges like Steadier Rounds (+6% DMG), Faster Hands (+5% Fire Rate), Lighter Feet (+4% SPD), Field Leech (+2% Lifesteal).

---

## 🏗️ 7. Code Architecture
The project combines **Phaser 3** (Heavy Lifting) and **Vue 3** (User Interface).

| Directory Path | Purpose |
|---|---|
| `src/game/config/` | Balances the game. `weapons.js`, `upgrades.js`, `gameplayConfig.js` hold raw arrays of scaling math and definitions. |
| `src/game/entities/` | Object-oriented logic for `Player`, `Zombie`, and `Bullet` classes within the Phaser engine. |
| `src/game/systems/` | The core behavior loops: `BossSystem`, `CombatSystem`, `DropSystem`, `WaveSystem`, `EffectsSystem`. |
| `src/components/` | Vue SFCs for rendering the `<canvas>` wrapper, Upgrades Cards, and Health/Ammo overlays tightly over the game instance. |
| `src/stores/` | `Pinia` tracks externalized data like Player State, Score, and run modifiers. Bridging Phaser events back to Vue reactivity. |

### Build Tools
- Formatted gracefully using modern Vite, with CSS tailored via TailwindCSS v4.
- End-to-end routing using standard Vue Router History. Easy deployments configurations ready with `vercel.json` rewrites. 

### Pick UP
- Yellow is shortgun
- Blue is rifle
- Green is SMG
