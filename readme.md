# Genshin Impact &bull; Carte interactive

Sources du projet de carte interactive de Genshin Impact, par Le Bus Magique.

## Comment utiliser

### Ajouter des marqueurs

```
var markers = [
    {                                   // --- Groupe de marqueurs
        id: 'teleporter',               // Identifiant pour le suivi [1]
        group: teleporterGroup,         // Variable L.LayerGroup
        icon: teleporterIcon,           // Variable L.icon
        format: 'simple',               // Formats : simple, popup, image, video
        checkbox: true,                 // Activer une checkbox pour tous les marqueurs [2]
        guide: 'https://domain.ext',    // Activer un bouton vers cette adresse
        markers: [
            {                           // --- Marqueur PopUp
                id: '01',               // Identifiant pour le suivi [1]
                format: 'popup'         // Override du format
                guide: '#anchor',       // (facultatif) Override de l'adresse du guide [3]
                icon: differentIcon,    // (facultatif) Override de l'icone du groupe
                title: 'Mon titre',     // (facultatif) Titre affiché dans la popup
                text: 'Mon<br>text',    // (facultatif) Texte affiché après le média ou le titre
                coords: [5726, 2288],   // Coordonnées
            },
            {                           // --- Marqueur vidéo
                id: '02',               // Identifiant pour le suivi [1]
                format: 'video'         // Override du format de la catégorie
                video: 'id-youtube',    // Identifiant unique de la vidéo YouTube
                coords: [5726, 2288],   // Coordonnées
            },
            {                           // --- Marqueur image [4]
                id: '03',               // Identifiant pour le suivi [1]
                format: 'image'         // Override du format de la catégorie
                coords: [5726, 2288],   // Coordonnées
            },
        ],
    },
]
```

[1] L'identifiant pour le suivi est composé du l'id du groupe et du marqueur.

[2] Si vous ne souhaitez pas activer pour tous les marqueurs de la catégorie, supprimez cette ligne et définissez là pour chaque marqueur où vous en avez besoin.

[3] Si le premier caractère est un '#', l'URL sera constituée de celle du guide et du marqueur, sinon seulement du marqueur.

[4] Le script va chercher deux images dans le dossier "assets/img/medias/", comme suit : 
* assets/img/medias/{id-group}{id-marker}-thumb.jpg (300&times;300)
* assets/img/medias/{id-group}{id-marker}.jpg

### Paramètres d'URL

* **hide-menu** : masquer le menu et afficher la carte en grand
* **markers=id1,id2,id3** : marqueurs à activer au chargement de la carte
* **x=0&y=0** : centrer la carte à la position [x,y]
* **x=0&y=0&z=5** : centrer la carte à la position [x,y] et définir le zoom à z (4 ou 5)

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
