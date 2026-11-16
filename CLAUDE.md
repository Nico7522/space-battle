# CLAUDE.md

# Project Development Guidelines

## 1. Project Overview

This project is a 2D arena combat game developed with Phaser 3, TypeScript and Vite.

The game features a player fighting against an AI-controlled opponent in a vertical arena.

The project must be designed with maintainability, modularity and future expansion in mind.

The initial playable game mode is **Campaign**. The architecture must allow additional game modes to be introduced without requiring major changes to the existing game systems.

### Core technologies

- **Game engine:** Phaser 3.88.2
- **Language:** TypeScript (strict mode)
- **Build tool:** Vite
- **Rendering:** Phaser Canvas/WebGL
- **Architecture:** Modular, object-oriented and event-driven where appropriate

Do not introduce a frontend framework, backend, database or additional game engine unless explicitly requested.

---

## 2. Documentation and Sources of Truth

The project contains two main documentation files.

### GAME_SPEC.md

This file defines the actual game design and gameplay requirements.

It is the primary reference for:

- Gameplay mechanics.
- Player and enemy behavior.
- Combat rules.
- Health and ammunition.
- AI behavior.
- Levels and progression.
- Game modes.
- Difficulty balancing.
- Future gameplay features.

Always consult this document before implementing or modifying gameplay-related features.

Do not invent gameplay rules that contradict the specification.

### CLAUDE.md

This file defines the development guidelines and technical conventions.

It governs:

- Project architecture.
- Coding standards.
- Responsibilities of each system.
- Asset management.
- Development workflow.
- Testing and validation.
- Technical decisions.

If a technical implementation decision is not specified, prefer the simplest maintainable solution that fits the existing architecture.

If documentation and implementation disagree, inspect the code and identify the discrepancy before making changes.

Do not silently change documented gameplay rules.

---

## 3. Current Game Design

The following decisions are confirmed and must be respected.

| Element           | Decision            |
| ----------------- | ------------------- |
| Game type         | 2D arena combat     |
| Arena arrangement | Vertical            |
| Player position   | Bottom of the arena |
| Enemy position    | Top of the arena    |
| Movement          | Horizontal only     |
| Combat            | Player versus AI    |
| Player health     | 100 HP              |
| Enemy health      | 100 HP              |
| Ammunition        | Total ammunition    |
| Bot behavior      | Hybrid              |
| Enemy             | Sorcerer Space      |
| Initial game mode | Campaign            |

### Important gameplay constraints

- The player and enemy occupy opposite sides of the arena.
- Both characters move horizontally.
- Vertical movement is not part of the standard movement system.
- Health is managed independently for the player and enemy.
- Ammunition is limited by a total available quantity, not an unlimited magazine.
- The AI uses a hybrid behavior model combining different decision-making approaches.
- The initial experience must focus on the Campaign mode.

Do not hardcode these gameplay values in multiple classes.

Use centralized configuration or appropriate data structures.

---

## 4. Project Architecture

The existing project uses Phaser scenes to organize the different game states.

The current scene flow is:

Boot → Preloader → MainMenu → Game

Additional overlays and scenes include:

- Pause
- SkinSelect
- Settings
- GameOver
- Victory

Preserve this structure unless there is a concrete technical reason to change it.

### Architecture principles

1. Each class must have a clearly defined responsibility.
2. Avoid placing all gameplay logic inside the main Game scene.
3. Keep rendering, gameplay rules, AI decisions and configuration separate.
4. Prefer composition over unnecessary inheritance.
5. Avoid tightly coupled systems.
6. Use TypeScript types and interfaces to define contracts between systems.
7. Avoid duplicating logic.
8. Keep systems reusable across different game modes.
9. Avoid unnecessary abstractions for features that only require a simple implementation.
10. Do not introduce architectural complexity without a clear benefit.

### Suggested logical organization

The following structure describes the desired separation of responsibilities. It is not an instruction to blindly recreate or rename existing directories.

```text
src/
├── scenes/
│   ├── BootScene.ts
│   ├── PreloaderScene.ts
│   ├── MainMenuScene.ts
│   ├── GameScene.ts
│   ├── GameOverScene.ts
│   ├── VictoryScene.ts
│   ├── PauseScene.ts
│   ├── SkinSelectScene.ts
│   └── SettingsScene.ts
│
├── entities/
│   ├── Player.ts
│   ├── Enemy.ts
│   └── Projectile.ts
│
├── systems/
│   ├── CombatSystem.ts
│   ├── DamageSystem.ts
│   ├── HealthSystem.ts
│   ├── AmmunitionSystem.ts
│   └── CollisionSystem.ts
│
├── ai/
│   ├── BotController.ts
│   ├── BotBehavior.ts
│   └── BotState.ts
│
├── managers/
│   ├── GameManager.ts
│   ├── LevelManager.ts
│   ├── ModeManager.ts
│   ├── AudioManager.ts
│   └── SaveManager.ts
│
├── modes/
│   ├── GameMode.ts
│   └── CampaignMode.ts
│
├── config/
│   ├── GameConfig.ts
│   ├── PlayerConfig.ts
│   ├── EnemyConfig.ts
│   └── WeaponConfig.ts
│
├── data/
│   ├── levels/
│   ├── skins/
│   └── weapons/
│
├── ui/
│   ├── HUD.ts
│   └── components/
│
├── utils/
│
└── main.ts
```

Before changing the architecture:

- Inspect the actual project structure.
- Identify existing classes and their responsibilities.
- Reuse existing implementations where appropriate.
- Avoid creating duplicate managers or systems.
- Do not move files simply to match this example.

---

## 5. Game Modes and Extensibility

The game must support multiple modes in the future.

The Campaign mode is the first implementation.

Potential future modes include:

- Hardcore
- Infinite
- Versus

These future modes must not be implemented unless requested.

However, the architecture must avoid making their future implementation unnecessarily difficult.

### Game mode architecture

Prefer a common game mode contract.

For example:

```typescript
interface GameMode {
  initialize(): void;
  start(): void;
  update(time: number, delta: number): void;
  end(): void;
}
```

Adapt this contract to the actual Phaser architecture and existing lifecycle.

Each game mode should be responsible for its own rules and progression.

Shared systems should handle common mechanics such as:

- Character movement.
- Combat.
- Damage.
- Health.
- Ammunition.
- Projectile handling.
- Collision detection.

Avoid creating separate implementations of these systems for every game mode.

### Campaign mode

Campaign is the initial playable mode.

It must be designed to support:

- Multiple levels.
- Increasing difficulty.
- Different enemy configurations.
- Level-specific data.
- Progression and victory conditions.

Level data should be separated from gameplay logic whenever practical.

Do not hardcode every level directly inside the Game scene.

---

## 6. Entities and Gameplay Systems

### Player

The Player entity is responsible for:

- Player-specific visual representation.
- Horizontal movement.
- Player input.
- Shooting requests.
- Interaction with gameplay systems.

Avoid placing global game rules directly inside the Player class.

### Enemy

The Enemy entity represents the opponent.

The initial enemy is Sorcerer Space.

The Enemy entity should handle:

- Visual representation.
- Position and movement.
- Animation.
- Interaction with AI.
- Combat-related events.

The enemy's decisions must be handled by the AI system rather than mixed into its rendering logic.

### Projectile

Projectile logic must be reusable by both the player and the enemy.

A projectile should support the relevant properties:

- Owner.
- Damage.
- Speed.
- Direction.
- Projectile type.
- Collision behavior.
- Lifetime.

Avoid duplicating projectile logic between characters.

### Health system

Health management must be independent of character rendering.

Responsibilities include:

- Current health.
- Maximum health.
- Receiving damage.
- Death detection.
- Health-related events.

The initial maximum health for both combatants is 100 HP.

### Ammunition system

Ammunition must use a total ammunition model.

Responsibilities include:

- Current ammunition.
- Maximum ammunition.
- Ammunition consumption.
- Shooting validation.
- Ammunition-related events.

Do not implement an unlimited ammunition system or magazine/reload mechanics unless the specification explicitly requires them.

### Combat system

The combat system should coordinate:

- Shooting.
- Projectile creation.
- Collision handling.
- Damage calculation.
- Health updates.
- Combat events.

Keep individual responsibilities separated.

---

## 7. AI Development Guidelines

The enemy uses a hybrid AI behavior model.

AI logic must remain independent of Phaser rendering and animation logic.

The AI should be able to make decisions based on the current game state.

Potential responsibilities include:

- Observing the player's position.
- Evaluating the distance between characters.
- Choosing when to attack.
- Choosing when to move.
- Reacting to combat events.
- Managing behavior transitions.

Use clearly defined states or behaviors when appropriate.

Avoid implementing the entire AI as a large collection of nested conditional statements.

### AI architecture

Prefer separating:

- AI controller: coordinates decisions.
- Behavior logic: determines what the enemy should do.
- Enemy entity: executes movement and actions.
- Configuration: defines AI parameters.

AI parameters should be configurable.

Do not introduce machine learning or external AI services for standard enemy behavior.

---

## 8. Asset Management

Assets are an important part of the existing project and must be preserved.

Before adding, replacing or removing assets, inspect the existing asset structure.

### Asset rules

- Reuse existing character sprites and animations.
- Reuse existing backgrounds and arena elements.
- Reuse existing projectile assets.
- Reuse existing UI graphics.
- Reuse existing audio and sound effects.
- Preserve existing generated Phaser textures when they remain useful.
- Avoid unnecessary asset duplication.
- Avoid replacing working assets with temporary placeholders.

### Asset loading

Use Phaser's asset loading system through the appropriate loading scene.

Keep asset references organized.

Avoid scattering raw asset paths throughout the project.

Where appropriate, centralize asset keys and references.

### Asset creation

When new assets are required:

1. Check whether an equivalent asset already exists.
2. Reuse existing visual resources where possible.
3. Keep naming conventions consistent.
4. Ensure assets are loaded correctly.
5. Verify that animations and spritesheets use the correct frame dimensions.

Never delete an asset simply because it is not currently used by the active Campaign mode. It may be required by an existing feature or future mode.

---

## 9. User Interface and Visual Design

The existing UI and visual effects should be preserved wherever possible.

The interface must remain consistent across scenes and game modes.

Avoid duplicating UI components.

Where practical, create reusable components for:

- Health bars.
- Ammunition indicators.
- Buttons.
- Menus.
- Game notifications.
- Combat feedback.

The HUD should display the information necessary to understand the current combat situation.

Use Phaser containers and appropriate scene-level organization.

Keep UI logic separate from combat calculations.

---

## 10. Configuration and Data Management

Gameplay parameters should be centralized whenever practical.

Avoid magic numbers throughout the codebase.

Examples of configurable values:

- Player health.
- Enemy health.
- Movement speed.
- Projectile speed.
- Damage.
- Total ammunition.
- AI parameters.
- Arena boundaries.
- Level configuration.
- Difficulty settings.

Use TypeScript interfaces or types to define configuration structures.

Prefer data-driven implementations for levels, weapons, skins and enemy configurations.

Do not overengineer configuration systems for simple values.

---

## 11. Save System

The existing SaveManager must be inspected and preserved.

Before modifying save-related logic, identify:

- What information is currently persisted.
- Which systems depend on saved data.
- How settings are stored.
- How skin selections are stored.
- How progression is stored.

New Campaign progression must integrate with the existing save architecture where appropriate.

Do not overwrite or invalidate existing saved data without an explicit requirement.

When changing the save structure:

- Preserve backward compatibility where practical.
- Use versioned data structures when necessary.
- Handle missing or outdated fields safely.
- Avoid assuming that stored data always contains every property.

---

## 12. TypeScript and Coding Standards

Use strict TypeScript.

### General rules

- Avoid `any`.
- Prefer explicit types and interfaces.
- Use meaningful variable and function names.
- Keep functions focused.
- Avoid unnecessarily large classes.
- Avoid duplicated code.
- Avoid deeply nested conditions.
- Handle nullable values correctly.
- Use access modifiers appropriately.
- Prefer `readonly` for values that should not change.
- Use enums or union types where they improve clarity.

### Phaser-specific rules

- Respect the Phaser scene lifecycle.
- Avoid creating duplicate event listeners.
- Clean up resources and listeners when necessary.
- Avoid creating unnecessary objects inside frequently executed update loops.
- Use Phaser physics and collision systems consistently.
- Avoid mixing rendering logic with gameplay rules.
- Ensure timers and tweens are properly managed.

### Comments

Comments should explain why something exists or why a particular implementation is necessary.

Avoid comments that simply repeat what the code already says.

---

## 13. Performance and Optimization

The game should remain performant during combat.

Pay particular attention to:

- Projectile creation and destruction.
- Collision detection.
- Particle effects.
- Repeated object creation.
- Animation management.
- Event listeners.
- Update loops.

Use Phaser Groups or object pooling when there is a measurable benefit.

Do not introduce optimization complexity prematurely.

Prioritize readable and maintainable code.

---

## 14. Development Workflow

Claude Code must follow this workflow before making significant changes.

### Step 1 — Understand

- Read CLAUDE.md.
- Read GAME_SPEC.md.
- Inspect the relevant existing files.
- Understand how the current implementation works.
- Identify dependencies and potential side effects.

Never assume that a feature is missing without checking the existing implementation.

### Step 2 — Plan

Before implementing a significant feature:

- Identify the files that need modification.
- Identify existing systems that can be reused.
- Determine whether new classes or interfaces are necessary.
- Consider compatibility with existing game modes.
- Identify potential regressions.

For small changes, avoid unnecessary planning overhead.

### Step 3 — Implement

- Make focused changes.
- Respect existing conventions.
- Reuse existing systems.
- Avoid unrelated refactoring.
- Avoid replacing entire files when a targeted modification is sufficient.
- Keep documentation synchronized with important architectural changes.

### Step 4 — Validate

After implementation:

- Run TypeScript checks when available.
- Run the production build.
- Fix compilation errors.
- Check for obvious runtime errors.
- Verify that existing functionality still works.
- Check that the new feature behaves as specified.

Use the existing package scripts instead of inventing new commands.

### Step 5 — Report

At the end of the task, summarize:

1. What was implemented.
2. Which files were modified.
3. Which existing systems were reused.
4. Which validation commands were executed.
5. Any remaining issues or limitations.

Never claim that a feature was tested if it was not actually tested.

---

## 15. Git and Code Safety

- Do not delete existing functionality without a clear reason.
- Do not remove assets without verifying their usage.
- Do not overwrite user work unnecessarily.
- Do not modify unrelated files.
- Do not introduce unnecessary dependencies.
- Do not commit changes unless explicitly requested.
- Do not expose API keys, secrets or sensitive configuration.
- Do not replace project configuration files without inspecting their contents first.

When modifying existing functionality, preserve backward compatibility wherever practical.

---

## 16. Important Restrictions

The following rules are mandatory.

1. Do not rebuild the project from scratch.
2. Do not replace Phaser with another engine.
3. Do not introduce React, Angular or Vue.
4. Do not introduce a backend or database.
5. Do not implement future game modes prematurely.
6. Do not duplicate existing gameplay systems.
7. Do not hardcode gameplay values across multiple files.
8. Do not remove reusable assets or existing features.
9. Do not place all gameplay logic inside GameScene.
10. Do not change gameplay behavior without consulting GAME_SPEC.md.
11. Do not refactor unrelated code during feature implementation.
12. Do not make assumptions about existing implementations without inspecting the code.

---

## 17. Main Development Objective

The primary objective is to build a stable, maintainable and extensible 2D arena combat game.

Development must prioritize:

1. Functional and enjoyable gameplay.
2. Stable combat mechanics.
3. Reliable AI behavior.
4. Clean and maintainable architecture.
5. Reusable systems.
6. Preservation of existing assets and features.
7. Future compatibility with additional game modes.

**Always prefer a small, well-integrated implementation over a large, unnecessary architectural rewrite.**

When in doubt, inspect the existing implementation, consult GAME_SPEC.md and choose the solution that introduces the least unnecessary complexity.
