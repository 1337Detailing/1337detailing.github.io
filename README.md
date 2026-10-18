# 1337 Detailing · Site premium

Site statique en français pour **1337 Detailing**, à Soufflenheim et alentours. HTML, CSS, JavaScript, Sketchfab Viewer API (véritable modèle BMW E39), GSAP et Lenis.

## Site public

https://1337detailing.github.io/

## Tester localement

```sh
cd detailing-premium
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000/`. Le lecteur Sketchfab, GSAP et Lenis ainsi que les polices sont chargés depuis leurs serveurs respectifs et nécessitent Internet. Le contenu, les tarifs et les moyens de contact restent accessibles sans ces scripts.

## Contenu

- `index.html` : titres, services, tableaux des tarifs et coordonnées.
- `styles.css` : couleurs et comportement responsive. Accent ajustable avec `--sand`.
- `app.js` : lecteur Sketchfab officiel et lazy loading du véritable modèle BMW Série 5 E39, réglages de peinture noire et chrome lorsque les noms des matériaux le permettent, démonstration de mousse/rinçage/polissage et repli standard du lecteur si l’API échoue.
- `assets/` : favicon, image OG, illustration de secours si WebGL n'est pas pris en charge.
- `archives/` : copie de l'ancienne page conservée avant refonte.

## Mise en production

Le dépôt `1337Detailing/1337detailing.github.io` publie automatiquement depuis la branche principale. Les projets `Cloudix/` et `Routix/` ne doivent pas être effacés.

## Performance et accessibilité

Lecteur 3D chargé à la demande, textures plafonnées sur mobile, mouvements automatiques supprimés en cas de préférence pour la réduction du mouvement, navigation clavier native du lecteur et image de secours lorsque le modèle ne se charge pas. Un bloqueur réseau ou une politique du navigateur peut empêcher le chargement du modèle externe. La démonstration 3D est illustrative, et non une vidéo de résultat réel.

## Provenance et licence du modèle E39

- Œuvre : [BMW E39 Free](https://sketchfab.com/3d-models/bmw-e39-free-531a5a93da5d493d9918eb36f011c20d)
- Auteur : **Black Snow** (@BlackSnow02)
- Licence : [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
- Modèle hébergé et rendu par Sketchfab ; aucune copie du fichier original n’est redistribuée par ce dépôt.
- Personnalisation du noir et des finitions métalliques **dans le lecteur uniquement**, lorsque les matériaux du modèle sont suffisamment bien nommés. Les jantes ne sont pas remplacées géométriquement : elles restent celles du vrai modèle.

