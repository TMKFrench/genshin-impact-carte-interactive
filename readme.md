# Genshin Impact &bull; Carte interactive

Sources du projet de carte interactive de Genshin Impact, par Le Bus Magique.

## Comment utiliser

### Ajouter des marqueurs

Les groupes et les marqueurs sont dans la base de données SQLite `markers.db`.
Les données des marqueurs outrepassent celles des groupes (format, icon, title, text, ...).

Si une image doit être associée à un marqueur, le nom du fichier doit être composé de l'UID du groupe suivi de l'UID du marqueur, au format JPEG.
Exemple : `assets/img/medias/statuemondstadt01.jpg`

### Générer les marqueurs

Pour générer le tableau javascript de ces marqueurs, lancer l'URL ./generate, puis copier-coller le résulat en remplacement du précédent.

### Paramètres d'URL

* **hide-menu** : masquer le menu et afficher la carte en grand
* **markers=id1,id2,id3** : marqueurs à activer au chargement de la carte
* **x=0&y=0** : centrer la carte à la position [x,y]
* **x=0&y=0&z=5** : centrer la carte à la position [x,y] et définir le zoom à z (4 ou 5)

## Mise à jour de tiles

La mise à jour des tiles occasionne dans la plupart des cas un décalage des marqueurs.
Après la génération des nouvelles tiles, il faut recalculer les nouvelles coordonnées.

Lancer l'URL ./update avec les paramères suivant :
* **op** : l'opérateur, `plus` ou `minus`
* **qt** : la quantité

Utiliser le contenu généré pour mettre à jour la base de données des marqueurs.

## Sources

### Scripts / Styles

* [Google Maps Tile Cutter](https://github.com/bramus/photoshop-google-maps-tile-cutter/)
* [jQuery 3.5.1](https://jquery.com/)
* [Leaflet 1.7.1](https://leafletjs.com/)
* [Leaflet.EasyButton 2.4.0](https://github.com/CliffCloud/Leaflet.EasyButton)
* [Lity 2.4.1](https://sorgalla.com/lity/)
* [Tailwind 2.0.2](https://tailwindcss.com/)

### Images

* [Le Bus Magique](https://gaming.lebusmagique.fr)
* [TMK French](https://genshin.tmkfrench.fr/)

### Vidéos

* [TMK French](https://www.youtube.com/channel/UCbg8iC6Tw7de2URdwp3pyZQ)
