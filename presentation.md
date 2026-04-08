# 🧟 Zoombie - Game Presentation

## 🎮 Game Overview
**Zoombie** is a browser-based 2D top-down zombie survival game. You play as a lone survivor in a dark arena, where your goal is to survive as many increasingly brutal waves of zombies as possible, collecting weapons and power-ups, taking down terrifying bosses across 15 waves of relentless combat, racking up the highest score, or trying to survive endlessly.

## 🛠️ Technologies Used
The game is built using modern web development technologies:
- **Vue 3**: For the UI framework and routing.
- **Phaser 3**: The 2D game engine powering the core gameplay mechanics.
- **Pinia**: Global state management to tie the game stats and Vue components together.
- **TailwindCSS v4**: For rapid and beautiful styling of the user interface.
- **Vite**: Fast build tool and frontend development server.

## 🕹️ How to Play (Basics)
- `W` `A` `S` `D`: Move the player character.
- `Mouse`: Aim your weapon towards incoming zombies.
- `Left Mouse Button`: Shoot.
- `M`: Toggle audio mute.
- **Headshot mechanic**: Aiming directly at the zombies' heads will deal 2.5× damage!

## 🧟 Zombie Types
Surviving requires understanding the different types of zombies:
- **Walker**: Standard zombie with balanced health and speed.
- **Runner**: Fast and fragile zombie. Low HP but covers ground quickly.
- **Tank**: Slow but heavily armored. Deals double damage on contact.
- **Toxic**: Average stats but applies a poison damage-over-time (DoT) effect on hit.
- **Mini Boss**: Large, tough zombie with bonus health and damage. Spawns every 5 waves alongside support zombies. Drops a weapon reward upon death!
- **Giant Boss (Final)**: The ultimate threat appearing on Wave 15. Uses an AoE Ground Smash attack and summons reinforcements mid-fight.

## 🌊 Wave System
The map and difficulty scale incrementally based on a wave structure:
- **Normal Mode**: Consists of 15 waves, ending with the Final Boss encounter.
- **Endless Mode**: Unlocked after beating Normal Mode, where waves scale indefinitely.
- Each passing wave increases the zombie count, movement speed, spawn point locations, and spawn rates. Zombie Health gets tougher every 2 waves.
- Players are offered **Upgrades every 3 waves**.
- A **Mini Boss** will spawn **every 5 waves**.

## 💊 Objects & Items (Drops)
When defeating zombies, you can find the following floor loot:
- **Small Health Pack**: Restores a small amount of HP.
- **Large Health Pack**: Restores a larger amount of HP (Mini Bosses may drop these if your HP is critically low).
- **Weapon Drop**: Grants a random weapon (Shotgun, Rifle, or SMG) with random ammo. Always guaranteed to drop from defeated Mini Bosses!

## 🏗️ Folder Structure Explanation
The codebase structure cleanly separates core Phaser 3 game logic from the surrounding Vue UI components:
- `src/game/`: Contains all Phaser 3 logic including scenes (Menu, Main, etc.), entities (Player, Zombie), systems (Combat, Spawn, HUD), and game configurations.
- `src/components/`: Houses Vue components such as the `GameCanvas`, interactive menus, cards, buttons, and HUD elements.
- `src/stores/`: Contains Pinia stores managing game state, storing the player statistics and keeping the Vue UI in sync.
- `src/views/`: Vue Router pages (Home, Game, About routes).
- `src/services/`: Specific services like localStorage managers or Audio controllers.
- `src/utils/`: Common reusable helper functions and configuration constants.
