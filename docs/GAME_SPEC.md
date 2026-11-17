# GAME SPECIFICATION — Space Duel

## 1. Présentation du projet

### 1.1 Concept

Space Duel est un jeu de combat spatial 2D en temps réel, dans lequel le joueur affronte un adversaire contrôlé par une intelligence artificielle.

Le gameplay repose sur des déplacements horizontaux, des tirs de projectiles, la gestion des points de vie et des munitions, ainsi que sur la difficulté progressive des adversaires.

Le premier mode de jeu disponible est **Campaign** : une campagne de cinq combats successifs contre Sorcerer Space.

Le projet doit être conçu de manière modulaire afin de permettre l'ajout futur de nouveaux personnages, projectiles, capacités spéciales, décors et modes de jeu sans devoir réécrire les systèmes fondamentaux.

### 1.2 Technologies

Le projet utilise les technologies déjà présentes :

- Phaser 3.88.2
- TypeScript en mode strict
- Vite
- HTML et CSS pour l'interface externe au canvas
- Web Audio API pour les effets sonores et la musique
- localStorage pour la sauvegarde locale

Aucun framework frontend supplémentaire, backend, base de données ou nouvelle dépendance ne doit être ajouté sans validation préalable.

---

## 2. Gameplay principal

### 2.1 Arène

Le combat se déroule dans une arène verticale.

- Le joueur se trouve dans la partie inférieure de l'écran.
- L'adversaire se trouve dans la partie supérieure.
- Les deux combattants se font face.
- Le décor est affiché en arrière-plan.
- Les projectiles traversent l'arène verticalement.

La résolution et le système de mise à l'échelle existants doivent être conservés, sauf nécessité technique identifiée.

### 2.2 Déplacement

Le déplacement est exclusivement horizontal.

**Joueur :**

- Déplacement vers la gauche.
- Déplacement vers la droite.
- Le joueur reste dans sa propre moitié de l'arène.
- Le joueur ne peut pas sortir des limites de l'arène.

**Adversaire :**

- Déplacement horizontal automatique.
- L'adversaire reste dans sa propre moitié de l'arène.
- Son comportement dépend de son intelligence artificielle et du niveau de difficulté.

Les vitesses de déplacement doivent être configurables indépendamment pour le joueur et l'adversaire.

### 2.3 Tir

Chaque combattant possède sa propre action de tir.

**Joueur :**

- Une touche permet de tirer.
- Le joueur contrôle le moment où il tire.
- Les projectiles sont dirigés vers le haut.

**Adversaire :**

- L'intelligence artificielle décide du moment où elle tire.
- Les projectiles sont dirigés vers le bas.
- La fréquence des tirs dépend du niveau de difficulté.

Les paramètres de tir doivent être configurables :

- Type de projectile.
- Dégâts.
- Vitesse du projectile.
- Quantité de munitions.
- Cadence de tir.
- Taille et apparence du projectile.

### 2.4 Munitions

Le premier mode utilise une réserve totale de munitions.

- Chaque combattant possède un nombre défini de munitions.
- Chaque tir consomme une munition.
- Les munitions ne se rechargent pas automatiquement.
- Il n'existe pas de chargeur ni de temps de rechargement.
- Le combat continue même lorsque l'un des combattants n'a plus de munitions, tant que le combat n'est pas terminé.
- Si les deux combattants n'ont plus de munitions et qu'aucun projectile n'est encore en vol, le combat s'arrête : celui qui a le plus de PV gagne. En cas d'égalité, le joueur perd.

Les réserves du joueur et de l'adversaire sont indépendantes.

Le nombre de munitions doit être configurable par personnage et par niveau.

### 2.5 Points de vie

Chaque combattant commence avec 100 PV dans le premier mode.

- Chaque combattant possède sa propre barre de vie.
- Lorsqu'un projectile touche un combattant, ses PV diminuent en fonction des dégâts du projectile.
- Les PV ne peuvent jamais être inférieurs à zéro.
- Un combattant atteint zéro PV lorsque sa barre de vie est entièrement vidée.

Les PV maximum, les PV de départ et les dégâts doivent être configurables.

### 2.6 Collisions

Les collisions doivent prendre en compte :

- Les projectiles du joueur avec l'adversaire.
- Les projectiles de l'adversaire avec le joueur.
- Les limites de l'arène.
- Les capacités spéciales éventuellement ajoutées.

Un projectile ne doit pas infliger plusieurs fois ses dégâts après une collision.

Les projectiles qui sortent de l'arène doivent être détruits afin d'éviter une accumulation inutile d'objets.

---

## 3. Personnages

### 3.1 Système de personnages

Les personnages doivent être indépendants de leur logique de combat.

Chaque personnage peut définir :

- Son nom.
- Son apparence.
- Son animation éventuelle.
- Ses PV maximum.
- Sa vitesse de déplacement.
- Son type de projectile.
- Ses dégâts.
- Sa cadence de tir.
- Sa quantité de munitions.
- Ses capacités spéciales éventuelles.

Ces caractéristiques doivent être définies dans des configurations de données plutôt que dispersées dans le code des scènes.

### 3.2 Personnage du joueur

Le personnage de départ du joueur est un vaisseau spatial.

Plusieurs apparences de vaisseaux et variantes de couleurs sont déjà disponibles dans les assets du projet.

Le système doit permettre de sélectionner différents skins sans modifier les caractéristiques fondamentales du personnage, sauf si un futur personnage possède volontairement des statistiques ou capacités différentes.

### 3.3 Sorcerer Space

Sorcerer Space est le premier adversaire de la campagne.

- Il est contrôlé par l'intelligence artificielle.
- Il apparaît dans la partie supérieure de l'arène.
- Il utilise ses propres projectiles.
- Ses statistiques évoluent selon le niveau.
- Il reste l'adversaire des cinq premiers niveaux.

L'asset Sorcerer Space déjà disponible doit être réutilisé.

Sorcerer Space est un adversaire de la campagne, et non un personnage sélectionnable par le joueur dans cette première version.

### 3.4 Futurs personnages

Le système doit pouvoir accueillir différents types de personnages :

- Vaisseaux spatiaux.
- Créatures.
- Animaux.
- Personnages humanoïdes.
- Boss.

Il ne faut pas supposer que tous les personnages auront les mêmes dimensions, animations, statistiques ou capacités.

---

## 4. Projectiles

Les projectiles sont des éléments indépendants des personnages.

Chaque projectile peut définir :

- Son apparence.
- Ses dégâts.
- Sa vitesse.
- Sa taille.
- Sa direction.
- Son comportement en cas de collision.
- Ses éventuels effets visuels.

Le joueur et l'adversaire peuvent utiliser des projectiles différents.

Les assets de projectiles déjà présents dans le projet doivent être inspectés et réutilisés lorsqu'ils correspondent au nouveau gameplay.

Le système doit permettre d'ajouter de nouveaux projectiles sans modifier la logique générale des collisions ou du combat.

---

## 5. Capacités spéciales

Certains personnages pourront disposer de capacités spéciales.

Exemples envisagés :

- **Bouclier :** absorbe un ou plusieurs projectiles.
- **Accélération :** augmente temporairement la vitesse de déplacement.
- **Tir multiple :** permet de tirer plusieurs projectiles simultanément.
- **Téléportation :** déplace instantanément le personnage dans une autre position autorisée.

Les capacités pourront utiliser différents systèmes :

- Temps de recharge.
- Nombre d'utilisations limité.
- Durée d'activation.
- Nombre de projectiles absorbés.
- Conditions particulières d'activation.

Aucune capacité spéciale supplémentaire n'est obligatoire pour la première version du mode Campaign.

L'architecture doit toutefois permettre de les ajouter ultérieurement sans réécrire le système de combat.

---

## 6. Intelligence artificielle

### 6.1 Principes

L'adversaire est contrôlé par une intelligence artificielle hybride.

Elle combine :

- Le déplacement automatique.
- La prise en compte de la position du joueur.
- La visée.
- Des comportements de déplacement prédéfinis.
- Des esquives.
- La gestion de la fréquence des tirs.

L'IA ne doit pas simplement rester immobile et tirer en permanence.

### 6.2 Comportements possibles

L'IA peut notamment :

- Se déplacer horizontalement dans sa zone.
- Changer de direction.
- Se rapprocher de la position horizontale du joueur.
- Anticiper partiellement ses déplacements.
- Tirer lorsque les conditions sont favorables.
- Esquiver certains projectiles.
- Alterner entre des phases offensives et défensives.

### 6.3 Difficulté

Le comportement de l'IA doit être paramétrable indépendamment des statistiques de l'adversaire.

Les paramètres possibles comprennent :

- Vitesse de déplacement.
- Fréquence de changement de direction.
- Fréquence des tirs.
- Précision de la visée.
- Distance de détection des projectiles.
- Probabilité d'esquive.
- Temps de réaction.
- Durée des phases offensives et défensives.

La difficulté doit progresser entre les niveaux sans rendre l'IA artificiellement parfaite ou impossible à toucher.

---

## 7. Mode de jeu : Campaign

### 7.1 Présentation

Campaign est le premier mode de jeu disponible.

La campagne est découpée en **étapes**. Chaque étape oppose le joueur à un même adversaire sur **5 niveaux** de difficulté croissante.

Chaque combat correspond à un niveau.

- Les étapes se jouent dans l'ordre : une étape est débloquée quand tous les niveaux de l'étape précédente sont gagnés.
- Au sein d'une étape, un niveau est débloqué quand le niveau précédent est gagné.
- À la fin d'une étape (victoire au niveau 5), un écran « Stage N complete » propose de passer à l'étape suivante.

### 7.2 Progression

**Étape 1 — Sorcerer Space**

| Niveau | Adversaire     | Difficulté       |
| ------ | -------------- | ---------------- |
| 1      | Sorcerer Space | Facile           |
| 2      | Sorcerer Space | Facile à moyenne |
| 3      | Sorcerer Space | Moyenne          |
| 4      | Sorcerer Space | Difficile        |
| 5      | Sorcerer Space | Très difficile   |

**Étape 2 et suivantes** : à définir (adversaire, niveaux, difficulté).

### 7.3 Progression de la difficulté

Les paramètres de difficulté évoluent selon le niveau :

- Quantité de munitions de l'adversaire.
- Dégâts de ses projectiles.
- Vitesse de déplacement.
- Cadence de tir.
- Comportement de l'intelligence artificielle.
- Capacité à anticiper et esquiver les tirs.

Les valeurs exactes doivent être centralisées dans les données des niveaux et pourront être ajustées pendant les tests.

Le niveau 1 doit permettre au joueur de comprendre les mécaniques de base.

Le niveau 5 doit représenter un véritable défi.

### 7.4 Points de vie entre les niveaux

Les PV du joueur sont réinitialisés à leur maximum au début de chaque nouveau niveau.

Pour la première version :

- Le joueur commence chaque combat avec 100 PV.
- L'adversaire commence chaque combat avec ses PV maximum configurés.
- Les munitions sont réinitialisées au début de chaque combat.
- Les états temporaires et capacités actives sont réinitialisés.

Le mode Campaign ne conserve donc pas les dégâts subis d'un niveau au suivant.

### 7.5 Fin d'un combat

**Victoire :**

- L'adversaire atteint zéro PV.
- Le combat est arrêté.
- Un écran de victoire est affiché.
- Le joueur peut passer au niveau suivant.

**Défaite :**

- Le joueur atteint zéro PV.
- Le combat est arrêté.
- Un écran de défaite est affiché.
- Le joueur peut recommencer le niveau.

**Temps limite :**

- Chaque combat dure au maximum 1 minute (valeur configurable par niveau).
- Un compte à rebours est affiché pendant le combat ; il s'arrête pendant la pause.
- À la fin du temps, le combattant qui a le moins de PV perd. En cas d'égalité, le joueur perd.
- Un combattant qui tombe à 0 PV avant la fin du temps perd immédiatement.
- Si les deux combattants tombent à 0 PV en même temps, c'est une égalité : le joueur perd.

**Début du combat :**

- L'adversaire attend un court instant (1,5 à 3 secondes selon le niveau) avant son premier tir.

### 7.6 Fin de campagne

Lorsque le joueur remporte le dernier niveau de la dernière étape :

- La campagne est terminée.
- Un écran de victoire finale est affiché.
- Le joueur peut retourner au menu principal.
- Le jeu peut enregistrer sa progression et les statistiques de campagne.

---

### 7.7 Lore et dialogues

Le jeu raconte une histoire à travers des dialogues affichés avant certains combats.

**Fonctionnement :**

- Un dialogue est une suite de répliques. Chaque réplique a un locuteur :
  - `narrator` : la voix omnisciente qui raconte l'histoire, sans nom ni portrait, au centre de l'écran ;
  - `player` : le personnage du joueur, avec le portrait du skin sélectionné, en bas de l'écran ;
  - `opponent` : l'adversaire du combat, avec son nom et son portrait, en haut de l'écran.
- Pendant un dialogue, l'arène est visible mais le combat est en pause (pas de tir, pas de déplacement, chrono arrêté).
- Le texte apparaît lettre par lettre. Espace, Entrée ou un clic affichent la réplique entière, puis passent à la suivante. Échap passe le dialogue.
- Un niveau peut avoir un dialogue d'introduction (avant le combat) et un dialogue de conclusion (après une victoire, avant l'écran de victoire).
- Les dialogues sont joués à chaque fois (Échap permet de les passer).
- Un niveau peut indiquer que l'adversaire survit au KO : il n'explose pas et reste visible dans l'arène, par exemple pour parler dans le dialogue de conclusion.

**Dialogues en place :**

- Étape 1, niveau 1 (avant le premier combat) : deux répliques du narrateur, puis une de Sorcerer Space :
  1. « You are a mysterious traveler in search of adventure. You have decided to leave your planet: you have been tired of it ever since you were born. »
  2. « After three days of travel, you come across a mysterious figure... A sorcerer? »
  3. Sorcerer Space : « Ohh, I'm finally going to be able to have some fun! »
- Étape 1, niveau 1 (après la victoire) : Sorcerer Space n'explose pas, il reste dans l'arène et dit :
  1. Sorcerer Space : « Not bad. This is starting to get interesting. »

  L'écran de victoire affiche ensuite « The sorcerer has become interested in your abilities. » à la place de « Sorcerer Space is defeated! ».
- Étape 1, niveau 2 (après la victoire) : Sorcerer Space n'explose pas, il reste dans l'arène et dit :
  1. Sorcerer Space : « You're really not bad. »
- Étape 1, niveau 3 (après la victoire) : Sorcerer Space n'explose pas et dit :
  1. Sorcerer Space : « Let's use 50% of my power. »
- Étape 1, niveau 4 (après la victoire) : Sorcerer Space n'explose pas et dit :
  1. Sorcerer Space : « You're making me angry now... I will show you the full potential of the sorcerer race. »
- Étape 1, niveau 5 (après la victoire contre Sorcerer Space) : il n'explose pas ; après sa réplique, il s'enfuit par le haut de l'écran, puis le joueur parle :
  1. Sorcerer Space : « I'm running out of stamina... I must escape, fast! »
  2. Le joueur : « A space wizard? I've heard of them on my planet. But I thought they'd all been killed. »

**À venir :** l'histoire du personnage du joueur, celle de Sorcerer Space et des futurs boss, et des répliques des personnages eux-mêmes.

### 7.8 Progression visuelle de Sorcerer Space

À chaque niveau de l'étape 1, Sorcerer Space change d'aspect pour montrer qu'il gagne en puissance. Ces effets sont **purement visuels** : ils ne modifient ni les statistiques, ni la hitbox, ni la taille de collision des projectiles.

| Niveau | Aspect |
| ------ | ------ |
| 1 | Aspect de base, sans effet. |
| 2 | Halo violet pâle qui « respire ». |
| 3 | Halo plus marqué et particules violettes s'élevant de la robe. |
| 4 | Halo passant du violet au magenta, plus de particules, deux runes en orbite, traînée lumineuse derrière les orbes. |
| 5 | Sprite « max power » (deux bâtons, yeux rouges), halo sombre et intense avec un contour rouge, étincelles, trois runes plus rapides, traînée d'ombre quand il se déplace, traînée des orbes plus marquée. |

Les réglages de chaque aura sont des données (un bloc par niveau), réutilisables pour les boss des étapes suivantes.

---

## 8. Futurs modes de jeu

Le projet doit être conçu pour permettre l'ajout de nouveaux modes.

Ces modes ne font pas partie du périmètre obligatoire de la première version.

### 8.1 Hardcore

Variante du mode Campaign.

Différence principale :

- Les PV du joueur ne sont pas restaurés entre les niveaux.
- Les dégâts subis sont conservés pendant toute la campagne.

Ce mode nécessitera une gestion spécifique de la progression et de l'état du joueur.

### 8.2 Infini

Le joueur affronte une succession d'adversaires.

- Les combats se succèdent sans fin prédéfinie.
- La difficulté augmente progressivement.
- Le score dépend notamment du nombre de combats remportés.
- Le mode peut introduire de nouveaux adversaires et comportements.

### 8.3 Versus

Mode permettant à deux joueurs de s'affronter.

Il pourra éventuellement prendre en charge :

- Deux joueurs sur le même appareil.
- Un mode multijoueur en ligne dans une version ultérieure.

Aucune infrastructure réseau n'est nécessaire pour la première version.

### 8.4 Extensibilité

Le système de modes doit permettre de définir indépendamment :

- Les conditions de victoire et de défaite.
- Le nombre de combats.
- La progression de la difficulté.
- La restauration ou la conservation des PV.
- La gestion des munitions.
- Les règles de score.
- Les paramètres propres au mode.

Les règles spécifiques à Campaign ne doivent pas être codées directement dans les systèmes fondamentaux du combat.

---

## 9. Skins et personnalisation

Le système de skins existant doit être étudié et conservé lorsqu'il est réutilisable.

Le joueur doit pouvoir sélectionner les skins débloqués.

Les skins peuvent représenter :

- Différents modèles de vaisseaux.
- Différentes couleurs.
- D'autres personnages à ajouter ultérieurement.

Les skins purement visuels ne doivent pas modifier les statistiques du personnage.

Si un personnage possède des caractéristiques ou capacités différentes, il doit être traité comme un personnage distinct plutôt que comme un simple skin.

Les mécanismes de déblocage et de sauvegarde existants doivent être examinés avant toute suppression ou modification.

Les anciennes conditions de déblocage liées à l'ancien gameplay doivent être adaptées au nouveau jeu si elles ne sont plus pertinentes.

---

## 10. Arènes et décors

Le combat se déroule dans une arène dont le décor est indépendant des personnages.

Les arrière-plans doivent pouvoir être remplacés sans modifier le fonctionnement du combat.

Le système doit permettre d'ajouter plusieurs maps à l'avenir.

Chaque map pourra définir :

- Son arrière-plan.
- Ses éventuels éléments décoratifs.
- Sa musique.
- Ses effets visuels.
- Ses limites de combat si elles deviennent personnalisables.

Pour la première version, les déplacements et les limites de l'arène restent identiques quelle que soit la map.

Les éléments de décor purement visuels ne doivent pas interférer avec les collisions.

---

## 11. Interface utilisateur

L'interface doit être adaptée au nouveau gameplay.

### 11.1 Menu principal

Le menu principal doit permettre :

- De lancer Campaign.
- D'accéder à la sélection des skins.
- D'accéder aux paramètres.
- De quitter ou revenir selon les possibilités de la plateforme.

Les futurs modes pourront être ajoutés au menu lorsqu'ils seront implémentés.

### 11.2 Interface de combat

Pendant le combat, l'écran doit afficher :

- Les PV du joueur.
- Les PV de l'adversaire.
- Les munitions restantes du joueur.
- Les munitions restantes de l'adversaire, si leur affichage est retenu.
- Le niveau actuel de la campagne.
- Les éventuelles informations liées aux capacités spéciales.

L'interface doit rester lisible sans masquer les combattants ni les projectiles.

### 11.3 Pause

Le joueur doit pouvoir mettre le combat en pause.

Le menu Pause doit permettre :

- De reprendre le combat.
- De recommencer le niveau.
- De retourner au menu principal.

La pause doit suspendre les éléments de gameplay concernés, notamment les déplacements, tirs, projectiles et comportements de l'IA.

### 11.4 Paramètres

Conserver les paramètres existants lorsqu'ils sont compatibles :

- Activation/désactivation des effets sonores.
- Activation/désactivation de la musique.

Les préférences doivent rester sauvegardées localement.

### 11.5 Écrans de fin

Prévoir des écrans distincts pour :

- La victoire d'un combat.
- La défaite.
- La victoire finale de la campagne.

---

## 12. Sauvegarde et progression

Le système de sauvegarde local existant doit être conservé et adapté.

Les informations pertinentes peuvent comprendre :

- Les paramètres audio.
- Les skins débloqués.
- Le skin sélectionné.
- Le dernier niveau atteint.
- La progression de Campaign.
- Les statistiques générales.

La sauvegarde doit être compatible avec une évolution future du jeu.

Si le format actuel doit être modifié, une migration doit être prévue afin d'éviter de perdre inutilement les données des joueurs.

Les données de progression d'un mode ne doivent pas être mélangées avec celles d'un autre mode.

### Progression de Campaign (implémentée)

- La sauvegarde retient, pour chaque étape, le nombre de niveaux gagnés dans l'ordre. Les étapes sont identifiées par un identifiant stable, si bien que la sauvegarde reste juste quand de nouvelles étapes sont ajoutées.
- Un niveau est débloqué dès la victoire du niveau précédent, même si le joueur quitte depuis l'écran de victoire.
- La progression ne recule jamais : une défaite ou le fait de rejouer un niveau ne la réduit pas.
- Au menu principal, dès qu'un niveau a été gagné :
  - « Continue » reprend au prochain niveau à gagner de la première étape non terminée (ou au dernier niveau de la dernière étape si tout est gagné) ;
  - « Select Level » ouvre l'écran de sélection des niveaux.
- Dans les menus (bouton « Continue » du menu principal, titre des pages de l'écran de sélection), une étape est affichée « Campaign N » ; en combat et sur l'écran de victoire, elle reste affichée « Stage N ».
- Écran de sélection : une page par étape, avec des flèches pour changer d'étape. Les niveaux gagnés sont marqués « Completed » et peuvent être rejoués, le prochain niveau à gagner est marqué « Next challenge », les suivants sont verrouillés. Une étape verrouillée indique quelle étape terminer pour la débloquer.
- Format de sauvegarde v5 : les sauvegardes plus anciennes (v2 à v4) sont reprises automatiquement ; leurs niveaux gagnés sont attribués à l'étape 1.

---

## 13. Architecture et organisation du code

L'architecture doit séparer les responsabilités.

Les noms ci-dessous sont des propositions conceptuelles, pas une obligation de créer tous ces fichiers. Il faut d'abord analyser l'architecture actuelle et réutiliser les éléments compatibles.

### 13.1 Systèmes fondamentaux

Les responsabilités à isoler comprennent :

- Gestion du combat.
- Gestion des personnages.
- Gestion des projectiles.
- Gestion des points de vie.
- Gestion des munitions.
- Gestion des collisions.
- Gestion de l'intelligence artificielle.
- Gestion des capacités spéciales.
- Gestion des modes de jeu.
- Gestion de la progression.

### 13.2 Données configurables

Les caractéristiques des éléments du jeu doivent être centralisées dans des données dédiées lorsque cela est pertinent :

- Personnages.
- Projectiles.
- Niveaux.
- Maps.
- Capacités spéciales.
- Modes de jeu.

L'objectif est de pouvoir équilibrer le jeu ou ajouter du contenu sans modifier les systèmes fondamentaux.

### 13.3 Scènes Phaser

Les scènes existantes doivent être analysées avant modification.

La structure actuelle comprend notamment :

- Boot.
- Preloader.
- MainMenu.
- Game.
- Pause.
- Settings.
- GameOver.
- Victory.
- SkinSelect.

Ces scènes peuvent être adaptées, renommées ou réorganisées si nécessaire, mais il faut éviter de les supprimer sans avoir identifié leurs responsabilités et les fonctionnalités qu'elles contiennent.

Une nouvelle scène ne doit être créée que si elle apporte une séparation utile.

---

## 14. Assets existants et réutilisation

La transition vers le nouveau gameplay doit préserver autant que possible le travail déjà réalisé.

Avant toute suppression ou remplacement, inventorier les assets présents dans `public/assets` et les textures générées dans Preloader.

### 14.1 Éléments à conserver ou à examiner

- Assets des différents vaisseaux.
- Variantes de couleurs.
- Asset Sorcerer Space.
- Projectiles existants.
- Arrière-plans.
- Effets de particules.
- Étoiles et éléments spatiaux.
- Logo et éléments de menu.
- Sons et musique éventuels.

### 14.2 Systèmes à examiner

- AudioManager.
- SaveManager.
- Gestion des skins.
- Gestion des textures.
- Système de pause.
- Gestion des paramètres.
- Interface utilisateur.
- Gestion des scènes.
- Système de mise à l'échelle.

Un système existant doit être conservé lorsqu'il reste pertinent, même si son implémentation doit être adaptée.

### 14.3 Ancien gameplay

Les éléments propres à l'ancien space shooter ne sont plus requis par le nouveau gameplay, notamment :

- Les vagues d'ennemis.
- Le tir automatique du joueur.
- La station spatiale à défendre.
- Les points de vie de la station.
- Les mécaniques de survie liées à la station.

Ces éléments peuvent être supprimés ou réutilisés uniquement après vérification de leurs dépendances et de leur éventuelle utilité dans le nouveau jeu.

Aucun asset ou système ne doit être supprimé uniquement parce qu'il était utilisé par l'ancien gameplay.

---

## 15. Direction artistique et audio

Le jeu conserve son univers spatial.

Les assets existants doivent être privilégiés afin de maintenir une cohérence visuelle.

Les effets visuels peuvent notamment accompagner :

- Les tirs.
- Les impacts.
- Les dégâts.
- La destruction d'un projectile.
- La défaite d'un combattant.
- La victoire d'un combat.
- L'activation d'une capacité spéciale.

L'AudioManager existant doit être conservé si son fonctionnement reste adapté.

Les sons et musiques doivent pouvoir être activés ou désactivés indépendamment.

---

## 16. Performance et qualité

Le jeu doit rester fluide pendant les combats.

Points d'attention :

- Détruire les projectiles hors de l'arène.
- Éviter les objets inutiles.
- Éviter les calculs d'IA trop fréquents.
- Éviter les collisions inutiles.
- Nettoyer correctement les objets et événements lors du changement de scène.
- Éviter les doublons de gestionnaires.
- Préserver le typage strict TypeScript.

Le jeu doit fonctionner dans les navigateurs desktop modernes.

L'interface doit rester utilisable sur différentes résolutions.

---

## 17. Périmètre de la première version

La première version doit uniquement implémenter le mode Campaign.

### Fonctionnalités obligatoires

- Arène verticale.
- Joueur en bas et adversaire en haut.
- Déplacement horizontal des deux combattants.
- Tir manuel du joueur.
- Tir automatique ou décisionnel de l'IA.
- Réserve totale de munitions sans rechargement.
- 100 PV pour le joueur et l'adversaire.
- Dégâts et collisions des projectiles.
- Intelligence artificielle hybride.
- Sorcerer Space comme adversaire.
- Cinq niveaux avec difficulté progressive.
- Restauration des PV entre les niveaux.
- Écrans de victoire et de défaite.
- Pause.
- Menu principal.
- Sélection des skins existants lorsque compatible.
- Paramètres audio.
- Sauvegarde locale de la progression et des préférences.

### Hors périmètre de la première version

- Mode Hardcore.
- Mode Infini.
- Mode Versus.
- Multijoueur en ligne.
- Nouveaux boss.
- Nouveaux personnages obligatoires.
- Capacités spéciales obligatoires.
- Plusieurs maps jouables.

Ces éléments doivent rester envisageables dans l'architecture, mais ne doivent pas retarder la réalisation du premier mode.

---

## 18. Règles de développement

Le développement doit être réalisé progressivement.

Avant chaque nouvelle étape :

1. Analyser le code et les dépendances existantes.
2. Identifier les fonctionnalités réutilisables.
3. Proposer les modifications nécessaires.
4. Attendre la validation explicite avant de commencer l'étape.
5. Implémenter uniquement le périmètre validé.
6. Vérifier la compilation et le typage TypeScript.
7. Présenter les fichiers modifiés et les changements effectués.
8. Donner les instructions pour tester manuellement.
9. Attendre la validation avant de passer à l'étape suivante.

### Vérifications obligatoires

Après chaque étape :

- `npm run build-nolog`
- `npx tsc --noEmit`

Le build seul ne garantit pas la vérification complète du typage TypeScript.

Ne pas ajouter de dépendance, de framework ou de service externe sans validation.

Ne pas modifier les fichiers de configuration Vite sans nécessité identifiée.

Ne pas supprimer les anciens fichiers avant d'avoir vérifié leurs dépendances.

---

## 19. Principes fondamentaux du projet

Les principes suivants doivent guider toutes les évolutions :

1. Le gameplay doit être indépendant des données des personnages.
2. Les projectiles doivent être indépendants des personnages qui les utilisent.
3. Les modes de jeu doivent définir leurs règles sans dupliquer le système de combat.
4. La difficulté doit être configurable.
5. Les assets doivent être réutilisables.
6. Les capacités spéciales doivent pouvoir être ajoutées progressivement.
7. La sauvegarde doit pouvoir évoluer sans perte inutile de données.
8. Les fonctionnalités futures ne doivent pas complexifier inutilement la première version.
9. Le code doit rester maintenable et compréhensible.
10. Aucune étape ne doit être considérée comme validée sans approbation explicite.
