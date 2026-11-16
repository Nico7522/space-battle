# Démarrage du mini-jeu

## 1. Générer le projet Phaser

```bash
npm create @phaserjs/game@latest
```

Choisir le template Web Bundler, Vite et TypeScript. Puis :

```bash
cd nom-du-projet
npm install
```

## 2. Ajouter les fichiers de configuration

Copier `AGENTS.md`, `tsconfig.json`, `vite.config.ts`, `.gitignore` et `.editorconfig` à la racine du projet.

Le générateur peut fournir ses propres réglages TypeScript/Vite. Comparer les fichiers avant de remplacer ceux du template et conserver ses réglages spécifiques si nécessaire.

## 3. Lancer le jeu

```bash
npm run dev
```

Vérifier les scripts disponibles dans `package.json`.

## 4. Première demande à OpenCode

Lis entièrement AGENTS.md et inspecte le projet existant avant de modifier quoi que ce soit.

Commence par le MVP :
- zone de jeu verticale ;
- personnage placé en bas ;
- déplacement horizontal avec les flèches et A/D ;
- personnage limité aux bords de la zone ;
- tir laser automatique vers le haut.

Pour cette première étape, n'implémente pas encore les ennemis, les collisions, les menus ou les skins. Utilise Phaser 3 et TypeScript, respecte l'architecture existante et garde le projet compilable. À la fin, lance le build et explique les fichiers modifiés ainsi que la façon de tester.
