# 1337 Detailing · Site premium

Site statique en français pour **1337 Detailing**, à Soufflenheim et alentours. HTML, CSS, JavaScript, Three.js (scène originale procédurale), GSAP et Lenis.

## Site public

https://1337detailing.github.io/

## Tester localement

```sh
cd detailing-premium
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000/`. Les bibliothèques Three.js, GSAP et Lenis sont chargées depuis jsDelivr et Google Fonts via Internet. Le contenu, les tarifs et les moyens de contact restent accessibles sans ces scripts.

## Contenu

- `index.html` : titres, services, tableaux des tarifs et coordonnées.
- `styles.css` : couleurs et comportement responsive. Accent ajustable avec `--sand`.
- `app.js` : scène 3D de voiture construite avec Three.js (pas de modèle tiers), lance de lavage, mousse instanciée, jet d'eau en particules, finitions, effet souris/scroll et moteur d'animation.
- `assets/` : favicon, image OG, illustration de secours si WebGL n'est pas pris en charge.
- `archives/` : copie de l'ancienne page conservée avant refonte.

## Mise en production

Le dépôt `1337Detailing/1337detailing.github.io` publie automatiquement depuis la branche principale. Les projets `Cloudix/` et `Routix/` ne doivent pas être effacés.

## Performance et accessibilité

WebGL chargé à la demande, réduction de la résolution et du nombre de particules sur mobile, pause quand le rendu sort de l'écran, animations désactivées en cas de préférence pour un mouvement réduit, navigation clavier et fallback image si le script échoue. La démonstration 3D est illustrative, et non une vidéo de résultat réel.
