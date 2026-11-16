# Gabarits pour dessiner un personnage

Ces fichiers servent uniquement à dessiner. Ils ne sont pas chargés par le jeu.

| Fichier | Taille d'une case | Affichage en jeu |
| --- | --- | --- |
| `gabarit_32px.png` | 32 × 32 px | agrandi ×2 : style rétro, rapide à dessiner |
| `gabarit_64px.png` | 64 × 64 px | taille réelle (×1) : plus de détails |

Les fichiers `*_apercu.png` montrent le même gabarit agrandi, avec le nom de chaque case.

## Utilisation (Aseprite, LibreSprite, Piskel…)

1. Ouvrir le gabarit : il devient un calque de repères.
2. Ajouter un **nouveau calque au-dessus** et dessiner uniquement dessus.
3. À l'export, **masquer le calque de repères**, puis exporter en PNG avec fond transparent.

## Les cases

Une ligne de 5 cases, de gauche à droite : **repos 1, repos 2, repos 3, repos 4, tir**.

- Les 4 poses de repos tournent en boucle (respiration, cheveux, aura…). Il est possible d'en utiliser moins : laisser les cases vides.
- La pose de tir est affichée brièvement à chaque tir. Le personnage tire vers le **haut**.

## Repères

- **Ligne rouge** (dernière ligne de pixels) : le bas des pieds doit toucher cette ligne sur **toutes** les poses. Sinon le personnage sautille quand la pose change.
- **Axe bleu** : le centre du corps. Garder le bassin et les jambes centrés dessus d'une pose à l'autre.
- **Zone verte** : la largeur recommandée du corps (22 px sur 32, 44 px sur 64). Cheveux, bras ou effets peuvent en sortir, mais le corps doit rester dedans. C'est ce qui permettra une hitbox commune et juste pour tous les personnages.

## Conseils

- Vue de face ou de trois quarts : le joueur est en bas de l'écran et tire vers le haut.
- Un contour sombre d'un pixel aide à rester lisible sur le fond spatial.
- Éviter les couleurs très proches du fond du jeu (bleu nuit `#020617`).
- Un fichier par personnage, nommé par exemple `perso-nom.png`. Le placer dans `public/assets/` au moment de l'intégration.
