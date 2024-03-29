function onMapClick(e) {
    console.log("Position @ " + map.project([e.latlng.lat, e.latlng.lng], map.getMaxZoom()));
    console.log("Point @ [" + e.latlng.lat + ", " + e.latlng.lng + "]");
  }

  function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
  }

  function updateCurrentMarker() {
    currentMarker = this;
  }

  function updateUserCountdowns(checked) {
    var countdowns = getUserCountdowns();

    if(typeof(currentMarker._tooltip) !== 'undefined' && currentMarker._tooltip.options.className === 'countdown') {
      var cid = currentMarker._tooltip.options.countdownid;
      if(checked) {
        var nextTime = moment();
        nextTime.add(currentMarker._tooltip.options.countdown, 'hours');
        currentMarker._tooltip.setContent('<div id="countdown-'+currentMarker._tooltip.options.countdownid+'">Prochain reset :</div>');

        // var nextTime = moment().add(10, 'seconds');
        $($('#countdown-'+currentMarker._tooltip.options.countdownid)).countdown(nextTime.toDate(), function(event) {

          if(event.type === 'finish') {
            resetCountdown(cid);
            $(this).html('');
          } else {
            var totalDays = event.offset.weeks * 7 + event.offset.days;
            if(totalDays > 0) {
              $(this).html('Prochain reset :<br />'+event.strftime('%-D j. %H:%M:%S'));
            } else {
              $(this).html('Prochain reset :<br />'+event.strftime('%H:%M:%S'));
            }
          }

        });

        if(searchId(cid, countdowns) <= 0) {
          countdowns.push({id: cid, date: nextTime.format('YYYY-MM-DD HH:mm:ss')});
        }

      } else {
        var i = searchId(cid, countdowns);
        if(i >= 0) {
          countdowns.splice(i, 1);
        }

        currentMarker._tooltip.setContent('<div id="countdown-'+currentMarker._tooltip.options.countdownid+'"></div>');

      }

      localStorage.setItem('userCountdowns', JSON.stringify(countdowns));
      userCountdowns = JSON.stringify(countdowns);
    }
  }

  function saveUserMarker(uid, checked) {
    var markers = getUserMarkers();

    updateUserCountdowns(checked);

    if(checked) {
      $.post('api/addmarker/'+uid, function(res) {
        if(typeof(res.error) !== 'undefined') {
          alert('Vous avez été déconnecté. La page va se rafraîchir.');
          window.location.reload();
        }

        currentMarker.setOpacity(.5);
        userMarkers = res.markers;
      });
    } else {
      $.post('api/removemarker/'+uid, function(res) {
        if(typeof(res.error) !== 'undefined') {
          alert('Vous avez été déconnecté. La page va se rafraîchir.');
          window.location.reload();
        }

        currentMarker.setOpacity(1);
        userMarkers = res.markers;
      });
    }
  }

  function searchId(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return i;
      }
    }

    return -1;
  }

  function resetCountdown(cid) {
    var markers = getUserMarkers();
    var countdowns = getUserCountdowns();
    var i = searchId(cid, countdowns);
    if(i >= 0) {
      allMarkers[cid].setOpacity(1);
      countdowns.splice(i, 1);
    }
    if(markers.indexOf(cid) >= 0) {
      markers.splice(markers.indexOf(cid), 1);
    }
    localStorage.setItem('userCountdowns', JSON.stringify(countdowns));
    userCountdowns = JSON.stringify(countdowns);
    localStorage.setItem('userMarkers', JSON.stringify(markers));
    userMarkers = JSON.stringify(markers);
  }

  function saveUserMarkers(uid, checked) {
    var markers = getUserMarkers();

    updateUserCountdowns(checked);

    if(checked) {
      if(markers.indexOf(uid) < 0) {
        markers.push(uid);
      }
      currentMarker.setOpacity(.5);
    } else {
      if(markers.indexOf(uid) >= 0) {
        markers.splice(markers.indexOf(uid), 1);
      }
      currentMarker.setOpacity(1);
    }

    localStorage.setItem('userMarkers', JSON.stringify(markers));
    userMarkers = JSON.stringify(markers);
  }

  function getUserCountdowns() {
    var countdowns = localStorage.getItem('userCountdowns');

    if(!countdowns) {
      countdowns = [];
    } else {
      countdowns = JSON.parse(countdowns);
    }

    return countdowns;
  }

  function getUserMarkers() {
    var markers = localStorage.getItem('userMarkers');

    if(!markers) {
      markers = [];
    } else {
      markers = JSON.parse(markers);
    }

    return markers;
  }

  function getParamsURL() {
    var url = location.search,
        query = url.substr(1),
        result = {};

    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });

    return result;
  }

  function popUpOpen(e) {
    var content = e.popup.getContent();

    if($(content).find('input#user-marker').length > 0) {
      // var userMarkers = getUserMarkers();
      if(userMarkers.indexOf( $(content).find('input#user-marker').first().data('id') ) >= 0) {
        $('input#user-marker[data-id="'+$(content).find('input#user-marker').first().data('id')+'"]').prop('checked', 'checked');
      }
    }
  }



  var currentMarker;
  var total = 0;
  var params = getParamsURL();
  var userMarkers = getUserMarkers();
  var userCountdowns = getUserCountdowns();
  var debugMarkers = [];
  var userLocal = true;
  var allMarkers = [];



  // Liste des icons
  var teleporterIcon = L.icon({ iconUrl: 'assets/img/teleporter.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var echoshellIcon = L.icon({ iconUrl: 'assets/img/echoshell.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var waveriderIcon = L.icon({ iconUrl: 'assets/img/waverider.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzleIcon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzle01Icon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle01.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzle02Icon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle02.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzle03Icon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle03.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzle04Icon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle04.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var brokenislepuzzle05Icon = L.icon({ iconUrl: 'assets/img/brokenislepuzzle05.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var muralIcon = L.icon({ iconUrl: 'assets/img/mural.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var boatIcon = L.icon({ iconUrl: 'assets/img/boat.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var bossmaguukenkiIcon = L.icon({ iconUrl: 'assets/img/bossmaguukenki.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var challengeIcon = L.icon({ iconUrl: 'assets/img/challenge.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var seelieIcon = L.icon({ iconUrl: 'assets/img/seelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var starboardIcon = L.icon({ iconUrl: 'assets/img/starboard.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });



// Initialisation de la carte
  var map = new L.Map('map', {
      center : [0,0],
      zoom : 4,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'teleporter', 'echoshell', 'waverider', 'brokenislepuzzle', 'mural', 'boat', 'maguukenki', 'challenge', 'seelie', 'starboard'
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
  var markers = [
    {
      id: 'seelie',
      group: seelieGroup,
      icon: seelieIcon,
      format: 'video',
      checkbox: true,
      guide: 'https://gaming.lebusmagique.fr/le-sinueux-chemin-du-retour/',
      markers: [
        {
          id: 'golden01',
          title: 'Le sinueux chemin du retour',
          video: '58dPas2jo4M',
          coords: [4112, 5211]
        }
      ]
    },
    {
      id: 'echoshell',
      group: echoshellGroup,
      icon: echoshellIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: 'I1',
          title: 'Échos du passé - I<br />Au milieu des cinq monts se cache un village',
          coords: [5233, 3441]
        },
        {
          id: 'I2',
          title: 'Échos du passé - I<br />Deux chemins à travers la forêt solitaire',
          coords: [5041, 3517]
        },
        {
          id: 'I3',
          title: 'Échos du passé - I<br />Une rivière coule au milieu',
          coords: [4818, 3476]
        },
        {
          id: 'I4',
          title: 'Échos du passé - I<br />Quatre vents font résonner la joie',
          coords: [4906, 3237]
        },
        {
          id: 'I5',
          title: 'Échos du passé - I<br />Séparation',
          coords: [4728, 3215]
        },
        {
          id: 'II1',
          title: 'Échos du passé - II<br />Complications',
          coords: [5251, 3997]
        },
        {
          id: 'II2',
          title: 'Échos du passé - II<br />Responsabilités',
          coords: [4248, 3315]
        },
        {
          id: 'III1',
          title: 'Échos du passé - III<br />Apparition inattendue',
          coords: [4137, 3330]
        },
        {
          id: 'III2',
          title: 'Échos du passé - III<br />Pensées d\'un père',
          text: 'Il y a trois énormes rochers reliés par une échelle. Empruntez le chemin du pilier à l\'est pour aller sur le second puis le troisième.',
          coords: [3679, 2923]
        },
        {
          id: 'III3',
          title: 'Échos du passé - III<br />Sauveteur mystérieux',
          text: 'Il y a trois énormes rochers reliés par une échelle. Empruntez le chemin du pilier à l\'est pour aller sur le second puis le troisième.',
          coords: [3628, 3063]
        },
        {
          id: 'IV1',
          title: 'Échos du passé - IV<br />Le général',
          coords: [5026, 4626]
        },
        {
          id: 'IV2',
          title: 'Échos du passé - IV<br />Fleur du silence',
          coords: [4325, 3813]
        },
        {
          id: 'IV3',
          title: 'Échos du passé - IV<br />Pays natal',
          coords: [4270, 3966]
        },
        {
          id: 'V1',
          title: 'Échos du passé - V<br />Savoir-faire professionnel',
          coords: [5599, 4549]
        },
        {
          id: 'V2',
          title: 'Échos du passé - V<br />La sortie dans le brouillard',
          text: 'Dans la petite grotte, il y a une pierre à casser pour accéder à cette conque d\'écho.',
          coords: [2618, 4889]
        },
        {
          id: 'V3',
          title: 'Échos du passé - V<br />Lune et vent',
          coords: [4845, 3228]
        },
        {
          id: 'V4',
          title: 'Échos du passé - V<br />Rocher mirage',
          coords: [2770, 2570]
        },
        {
          id: 'V5',
          title: 'Échos du passé - V<br />Navigation et liberation',
          coords: [5300, 2655]
        },
        {
          id: 'VI1',
          title: 'Échos du passé - VI<br />L\'&oelig;uvre d\'un Archon',
          text: 'Vous devez avoir terminé la partie 3 de l\'Odyssée estivale dans les îles pour accéder à cette conque.',
          coords: [4114, 5083]
        },
        {
          id: 'VI2',
          title: 'Échos du passé - VI<br />Souvenirs de bord de mer',
          text: 'Vous devez avoir terminé la partie 3 de l\'Odyssée estivale dans les îles pour accéder à cette conque.',
          coords: [5387, 3960]
        },
        {
          id: 'VI3',
          title: 'Échos du passé - VI<br />Poissons grillés, tortues et innocence',
          text: 'Vous devez avoir terminé la partie 3 de l\'Odyssée estivale dans les îles pour accéder à cette conque.',
          coords: [5095, 4633]
        },
        {
          id: 'VI4',
          title: 'Échos du passé - VI<br />Problèmes de loup',
          text: 'Vous devez avoir terminé la partie 3 de l\'Odyssée estivale dans les îles pour accéder à cette conque.',
          coords: [4375, 3955]
        },
        {
          id: 'VII1',
          title: 'Échos du passé - VII<br />Sagesse des ancêtres ',
          text: 'La conque d\'écho se trouve à l\'intérieur du coquillage.',
          coords: [4677, 3141]
        },
        {
          id: 'VII2',
          title: 'Échos du passé - VII<br />Marée montante',
          coords: [4731, 3421]
        },
        {
          id: 'VII3',
          title: 'Échos du passé - VII<br />Nulle part où aller',
          coords: [4347, 5165]
        },
        {
          id: 'VII4',
          title: 'Échos du passé - VII<br />Le monde extérieur',
          coords: [4449, 5190]
        },
        {
          id: 'VII5',
          title: 'Échos du passé - VII<br />Ruines à l\'envers',
          coords: [4119, 5149]
        },
        {
          id: 'VII6',
          title: 'Échos du passé - VII<br />Le prix d\'avoir essayé',
          coords: [5100, 4584]
        },
        {
          id: 'VII7',
          title: 'Échos du passé - VII<br />Sans retour',
          coords: [3814, 3588]
        },
        {
          id: 'VII8',
          title: 'Échos du passé - VII<br />Persuasion',
          coords: [5331, 4499]
        },
        {
          id: 'VII9',
          title: 'Échos du passé - VII<br />Gardes en faction',
          coords: [3564, 3762]
        },
        {
          id: 'VII10',
          title: 'Échos du passé - VII<br />Alerte',
          coords: [3461, 3548]
        },
      ]
    },
    {
      id: 'waverider',
      group: waveriderGroup,
      icon: waveriderIcon,
      format: 'popup',
      title: 'Téléporteur de barge',
      checkbox: true,
      markers: [
        // {
        //   id: '01',
        //   coords: [5024, 4614]
        // },
        // {
        //   id: '02',
        //   coords: [4744, 3380]
        // },
        // {
        //   id: '03',
        //   coords: [3595, 3750]
        // },
        // {
        //   id: '04',
        //   coords: [4103, 5074]
        // },
        {
          id: '05',
          coords: [5009, 4549]
        },
        {
          id: '06',
          coords: [4435, 3985]
        },
        {
          id: '07',
          coords: [5182, 3945]
        },
        {
          id: '08',
          coords: [4197, 5085]
        },
        {
          id: '09',
          coords: [3417, 4537]
        },
        {
          id: '10',
          coords: [3504, 3914]
        },
        {
          id: '11',
          coords: [3624, 3562]
        },
        {
          id: '11',
          coords: [3792, 3136]
        },
        {
          id: '12',
          coords: [4178, 3234]
        },
        {
          id: '13',
          coords: [4619, 3262]
        },
        {
          id: '14',
          coords: [5174, 3625]
        },
      ]
    },
    {
      id: 'teleporter',
      group: teleporterGroup,
      icon: teleporterIcon,
      format: 'popup',
      title: 'Téléporteur',
      checkbox: true,
      markers: [
        {
          id: 'archipel01',
          coords: [5067, 4607],
        },
        {
          id: 'archipel02',
          coords: [4859, 3218],
        },
        {
          id: 'archipel03',
          coords: [3620, 3788],
        },
        {
          id: 'archipel04',
          coords: [4046, 5030],
        },
        {
          id: 'archipel05',
          coords: [4434, 3833],
        },
        {
          id: 'archipel06',
          coords: [3453, 4523],
        },
        {
          id: 'archipel07',
          coords: [3763, 3105],
        },
      ]
    },
    {
      id: 'brokenislepuzzle',
      group: brokenislepuzzleGroup,
      icon: brokenislepuzzleIcon,
      format: 'image',
      guide: 'https://gaming.lebusmagique.fr/lenigme-des-iles-brisees/',
      checkbox: true,
      markers: [
        {
          id: 'start',
          title: 'Début et entrée de la grotte à la fresque',
          text: 'Terminez le mini-jeu du roi Dodoco pour ouvrir l\'accès à la grotte et découvrir la fresque.',
          coords: [3557, 3831],
        },
        {
          id: '01',
          title: 'Bassin n°1',
          text: 'Remplissez le bassin au niveau 2 (milieu).',
          icon: brokenislepuzzle01Icon,
          coords: [3466, 3560],
        },
        {
          id: '02',
          title: 'Bassin n°2',
          text: 'D\'abord, tapez la pierre Hydro pour que de l\'eau se dépose dans le bassin puis remplissez-le au niveau 3 (haut).',
          icon: brokenislepuzzle02Icon,
          coords: [3447, 3752],
        },
        {
          id: '03',
          title: 'Bassin n°3',
          text: 'Remplissez le bassin au niveau 1 (bas).',
          icon: brokenislepuzzle03Icon,
          coords: [3638, 3802],
        },
        {
          id: '04',
          title: 'Bassin n°4',
          text: 'Remplissez le bassin au niveau 2 (milieu).',
          icon: brokenislepuzzle04Icon,
          coords: [3852, 3770],
        },
        {
          id: '05',
          title: 'Bassin n°5',
          text: 'Escaladez au-dessus du bassin jusqu\'aux pierres qui bloquent la cascade. Cassez-les le bassin puis remplissez-le au niveau 1 (bas).',
          icon: brokenislepuzzle05Icon,
          coords: [3849, 3622],
        },
        {
          id: 'end',
          title: 'Fin et récompenses',
          text: 'Activez les rochers au sol dans l\'ordre qu\'indiquent les piliers (sud, sud-ouest, est, ouest, sud-est).',
          coords: [3620, 3636],
        },
      ]
    },
    {
      id: 'mural',
      group: muralGroup,
      icon: muralIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: '01',
          title: 'Fresque de l’Îlot anonyme',
          text: 'La quête "Un voyage à travers les brumes et le vent" vous amène sur cet Îlot.',
          coords: [5188, 1912],
        },
        {
          id: '02',
          title: 'Fresque des Îles jumelles',
          text: 'Au niveau de la mer, sous l\'arche.',
          coords: [4795, 3454],
        },
        {
          id: '03',
          title: 'Fresque des Îles brisées',
          text: 'Dans la grotte, derrière le mur, à casser avec l\'haspartum.',
          coords: [3557, 3831],
        },
        {
          id: '04',
          title: 'Fresque de l\'Île anonyme',
          coords: [4252, 3277],
        },
        {
          id: '05',
          title: 'Fresque des Îles funestes',
          coords: [4332, 5127],
        },
      ]
    },
    {
      id: 'boat',
      group: boatGroup,
      icon: boatIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: '01',
          title: 'Tête du bateau',
          coords: [4253, 3307],
        },
        {
          id: '02',
          title: 'Poupe du bateau',
          coords: [5214, 3994],
        },
        {
          id: '03',
          title: 'Bulle n°1',
          coords: [4500, 3505],
        },
        {
          id: '04',
          title: 'Bulle n°2',
          coords: [4735, 3670],
        },
        {
          id: '05',
          title: 'Bulle n°3',
          coords: [4997, 3846],
        },
      ]
    },
    {
      id: 'maguu',
      group: maguukenkiGroup,
      icon: bossmaguukenkiIcon,
      format: 'video',
      markers: [
        {
          id: 'kenki',
          title: 'Lame Oni',
          video: 'y8r0JVT4WB4',
          text: 'Vidéo de <a href="https://www.youtube.com/channel/UC71ppkmJKTsBAqCzRC6NrmQ" target="_blank" class="text-blue-500 underline">Herriaus</a>',
          coords: [4346, 3893],
        },
      ]
    },
    {
      id: 'challenge',
      checkbox: true,
      group: challengeGroup,
      icon: challengeIcon,
      format: 'video',
      markers: [
        {
          id: 'golden1',
          text: 'Explosez 6 tonneaux en 20 secondes.',
          video: 'ZQBIJ7oe6f4',
          coords: [4392,4622]
        },
        {
          id: 'golden2',
          text: 'Ramassez 8 particules Anemo en 40 secondes.',
          video: 'pXi5NwZ-ayQ',
          coords: [4187,5159]
        },
        {
          id: 'golden3',
          text: 'Ouvrez le coffre en 60 secondes.',
          video: 'NruKcKDBmr0',
          coords: [4464,5204]
        },
        {
          id: 'golden4',
          text: 'Ouvrez le coffre en 40 secondes.',
          video: '1po99RCOd3A',
          coords: [4985,4666]
        },
        {
          id: 'golden5',
          text: 'Explosez 6 tonneaux en 25 secondes.',
          video: 'xxMsgW_WqKk',
          coords: [5363,4725]
        },
        {
          id: 'golden6',
          text: 'Explosez 6 tonneaux en 60 secondes.',
          video: 'VU9xIurFL34',
          coords: [5230,2987]
        },
        {
          id: 'golden7',
          text: 'Détruire les 3 peintures murale du Roi Dodo en 90 secondes.',
          video: 'cPjFScpkYek',
          coords: [4169,3307]
        },
        {
          id: 'golden8',
          text: 'Explosez 6 tonneaux en 30 secondes.',
          video: 'ftrVPjSZapw',
          coords: [3981,3273]
        },
        {
          id: 'golden9',
          text: 'Explosez 6 tonneaux en 30 secondes.',
          video: 'gQ7Vu9qjvLg',
          coords: [3344,2671]
        },
        {
          id: 'golden10',
          text: 'Ouvrez le coffre en 90 secondes.',
          video: 't0oMKriA2vA',
          coords: [3457,3541]
        },
        {
          id: 'golden11',
          text: 'Explosez 6 tonneaux en 90 secondes.',
          video: 'XNtMgW9wjAY',
          coords: [3449,4865]
        }
      ]
    },
    {
      id: 'starboard',
      group: starboardGroup,
      icon: starboardIcon,
      format: 'video',
      checkbox: true,
      markers: [
        {
          id: '01',
          title: 'Savoir-faire de Capitaine',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'n5cmUCfEQus',
          coords: [3755,3138]
        },
        {
          id: '02',
          title: 'Poisson & brise marine',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'geJuTjFfl08',
          coords: [4791,4404]
        },
        {
          id: '03',
          title: 'Voyage tournoyant',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'l1kedYdvyiA',
          coords: [3686,3947]
        },
        {
          id: '04',
          title: 'Rythme de course',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'faa-_Gb2WKU',
          coords: [4308,4889]
        },
        {
          id: '05',
          title: 'Briseur de vague',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'z6CH48EWamA',
          coords: [5050,4403]
        },
        {
          id: '06',
          title: 'Ruée d\'eau tumultueuse',
          text: 'Ramassez 13 pièces en 3 minutes.',
          video: 'WGJjWm2nTnQ',
          coords: [5217,3645]
        }
      ]
    }
  ];


  // Création de la carte
  L.tileLayer('assets/img/tiles-archipel-pomme-doree-v2/{z}/{x}/{y}.jpg', {
    attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
    maxZoom: 5,
    minZoom: 3,
    continuousWorld: true,
    maxBoundsViscosity: 0.8,
    noWrap: true
  }).addTo(map);

  var toolbarZoom = L.easyBar([
    L.easyButton( '<img src="assets/img/plus.png" alt="Zoom+" title="Zoomer sur la carte">',  function(control, map){map.setZoom(map.getZoom()+1);}),
    L.easyButton( '<img src="assets/img/minus.png" alt="Zoom-" title="Dézoomer sur la carte">',  function(control, map){map.setZoom(map.getZoom()-1);}),
  ]);

  var toolbarMenu = L.easyBar([
    L.easyButton( '<img src="assets/img/menu.png" alt="Menu" title="Afficher/Masquer le menu">',  function(control, map){
      $('body').toggleClass('show-menu');
      map.invalidateSize();
    }),
  ]);

  var toolbarRegion = L.easyBar([
    L.easyButton( '<img src="assets/img/region.png" alt="Region" title="Afficher/Masquer le nom des régions">',  function(control, map){
      if(map.hasLayer(regionGroup)) {
        map.removeLayer(regionGroup);
      } else {
        map.addLayer(regionGroup);
      }
    }),
  ]);

  var toolbarResetMarkers = L.easyBar([
    L.easyButton( '<img src="assets/img/reset.png" alt="Réinitialiser" title="Réinitialiser le suivi de vos marqueurs">',  function(control, map){
      if(confirm('Êtes-vous sûr de vouloir supprimer le suivi de vos marqueurs ?')) {
        if(userLocal) {
          localStorage.removeItem('userMarkers');
          localStorage.removeItem('userCountdowns');
          window.location.reload();
        } else {
          $.post('api/resetmarkers', function(res) {
            if(typeof(res.error) !== 'undefined') {
              alert('Vous avez été déconnecté. La page va se rafraîchir.');
            }
            localStorage.removeItem('userMarkers');
            localStorage.removeItem('userCountdowns');
            window.location.reload();
          });
        }
      }
    }),
  ]);

  var toolbarInfo = L.easyBar([
    L.easyButton( '<img src="assets/img/info.png">',  function(control, map){var lightbox = lity('#info');}),
  ]);

  toolbarZoom.addTo(map);
  toolbarMenu.addTo(map);
  toolbarRegion.addTo(map);
  toolbarResetMarkers.addTo(map);
  toolbarInfo.addTo(map);



  // Génération des marqueurs
  function initMarkers() {
    markers.forEach(function(g) {

      g.markers.forEach(function(m){
        var checkbox = '', icon, format, title = '', text = '', guide = '', countdown, timer, finished = false, color = '#3388ff';

        if((typeof m.checkbox !== 'undefined' && m.checkbox) || (typeof g.checkbox !== 'undefined' && g.checkbox))
          checkbox = '<label><input type="checkbox" id="user-marker" data-id="'+g.id+m.id+'" /><span>Terminé</span></label>';

        if(typeof g.text !== 'undefined')
          text = '<p>'+g.text+'</p>';
        if(typeof m.text !== 'undefined')
          text = '<p>'+m.text+'</p>';

        if(typeof g.title !== 'undefined')
          title = '<h4>'+g.title+'</h4>';
        if(typeof m.title !== 'undefined')
          title = '<h4>'+m.title+'</h4>';

        if(typeof g.guide !== 'undefined')
          guide = '<a href="'+g.guide+'" class="guide" target="_blank">Guide</a>';
        if(typeof m.guide !== 'undefined')
          if(typeof g.guide !== 'undefined' && m.guide.substr(0, 1) === '#')
            guide = '<a href="'+g.guide+m.guide+'" class="guide" target="_blank">Guide</a>';
          else
            guide = '<a href="'+m.guide+'" class="guide" target="_blank">Guide</a>';

        icon = (typeof m.icon !== 'undefined') ? m.icon : g.icon;
        format = (typeof m.format !== 'undefined') ? m.format : g.format;

        if(typeof g.countdown !== 'undefined')
          countdown = g.countdown;
        if(typeof m.countdown !== 'undefined')
          countdown = m.countdown;

        if(typeof g.timer !== 'undefined')
          timer = g.timer;
        if(typeof m.timer !== 'undefined')
          timer = m.timer;

        if(typeof g.color !== 'undefined')
          color = g.color;
        if(typeof m.color !== 'undefined')
          color = m.color;

        var marker = L.marker(unproject(m.coords), {icon: icon});

        if(format === 'popup')
          marker.bindPopup(title+text+guide+checkbox);
        else if(format === 'video')
          marker.bindPopup(title+'<a class="video" href="//www.youtube.com/watch?v='+m.video+'" data-lity><img src="https://i.ytimg.com/vi/'+m.video+'/hqdefault.jpg" /></a>'+text+guide+checkbox);
        else if(format === 'image')
          marker.bindPopup(title+'<a href="assets/img/medias/'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/'+g.id+m.id+'" /></a>'+text+guide+checkbox);
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox);
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();

        if(typeof(timer) !== 'undefined') {
          var nextTime = moment();
          if(nextTime.get('hour') >= 4) {
            nextTime.add(1, 'day');
          }
          nextTime.set({hour: 4, minute: 0, second: 0, millisecond: 0});
          marker.bindTooltip('<div id="timer-'+g.id+m.id+'">Prochain reset :</div>', {timerid: g.id+m.id, timer: nextTime.toDate(), permanent: true, className: 'timer', offset: [0, 0], direction: 'bottom'}).openTooltip();
          marker.on('tooltipopen', function(e) {
            $($('#timer-'+e.tooltip.options.timerid)).countdown(e.tooltip.options.timer, function(event) {
              $(this).html('Prochain reset :<br />'+event.strftime('%H:%M:%S'));
            });
          });
        }

        if(typeof(countdown) !== 'undefined') {

          marker.bindTooltip('', {countdownid: g.id+m.id, countdown: countdown, permanent: true, className: 'countdown', offset: [0, 10], direction: 'bottom'}).openTooltip();

          var i = searchId(g.id+m.id, userCountdowns);
          if(i >= 0) {
            marker._tooltip.setContent('<div id="countdown-'+g.id+m.id+'">Prochain reset :</div>');
            marker.on('tooltipopen', function(e) {
              $($('#countdown-'+g.id+m.id)).countdown(userCountdowns[i]['date'], function(event) {
                if(event.type === 'finish') {
                  resetCountdown(g.id+m.id);
                  $(this).html('');
                } else {
                  var totalDays = event.offset.weeks * 7 + event.offset.days;
                  if(totalDays > 0) {
                    $(this).html('Prochain reset :<br />'+event.strftime('%-D j. %H:%M:%S'));
                  } else {
                    $(this).html('Prochain reset :<br />'+event.strftime('%H:%M:%S'));
                  }

                }
              });
            });
          }
        }

        if(checkbox)
          marker.on('click', updateCurrentMarker);

        if(typeof(m.polygon) !== 'undefined') {
          var polygon = L.polygon(m.polygon, {color: color, fillColor: color}).addTo(g.group);
        }



        marker.addTo(g.group);
        total++;

        if(userMarkers.indexOf(g.id+m.id) >= 0 && !finished)
          marker.setOpacity(.5);

        if(params['debug'] && g.id !== 'region')
          debugMarkers.push({name: g.id+m.id, marker: marker, coords: m.coords, icon: icon});

        allMarkers[g.id+m.id] = marker;

      });

    });

    $('#total').text(total);

  }




  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([1024,1024]), unproject([7168, 7168])));



  // Afficher les coordonnées du clic
  map.on('click', onMapClick);



  // Masquer tous les layers
  groups.forEach(function(e) {
    map.removeLayer(window[e+'Group']);
  });


  // Debug
  if(params['debug']) {
    initMarkers();
      $('#menu ul').html('');
      debugMarkers.forEach(function(m, k) {
          $('#menu ul').append('<li class="marker col-span-2"><a href="#" data-debug-marker="'+m.name+'" class="active"><img src="'+m.icon.options.iconUrl+'" /> <span>'+m.name+'</span></a></li>');
      });

      $('#menu ul li a').on('click', function(e) {
          e.preventDefault();
          var marker = $(this).data('debug-marker');

          //jsObjects.find(x => x.b === 6)
          debugMarkers.find(function(m) {
              if(m.name === marker) {
                  m.marker.openPopup();
                  map.setView(unproject([m.coords[0], m.coords[1]]), 5);
                  console.log(m);
              }
          });
      });

      groups.forEach(function(e) {
          map.addLayer(window[e+'Group']);
      });
  }



  // Gérer le contenu de la popup
  map.on('popupopen', popUpOpen);



  $(document).ready(function() {


    $.get('api/user', function(res) {

      if(typeof res.users !== 'undefined')
        $('#total-users').text(res.users);

      if(typeof res.visits !== 'undefined')
        $('#total-visits').text(res.visits);

      if(typeof res.login !== 'undefined') {
        $('#discord').attr('href', res.login).attr('target', (window.location !== window.parent.location) ? '_blank' : '_self');
      }

      initMarkers();

    });

    var w = window.innerWidth;
    if(w <= 500) {
      $('body').removeClass('show-menu');
      map.invalidateSize();
    }

    var zoom = (params.z && ['3', '4', '5'].indexOf(params.z) >= 0) ? params.z : 4;

    if(params.x && params.y) {
      map.setView(unproject([params.x, params.y]), zoom);
    } else if(params.z) {
      map.setZoom(zoom);
    }

    if(params.markers) {
      var pmarkers = params.markers.split(',');
      pmarkers.forEach(function(e) {
        if(typeof window[e+'Group'] !== 'undefined') {
          $('#menu a[data-type="'+e+'"]').addClass('active');
          map.addLayer(window[e+'Group']);
        }
      });
    }

    if(params['hide-menu']) {
      $('body').removeClass('show-menu');
      map.invalidateSize();
    }

    $(document).on('change', 'input[type="checkbox"]', function() {
      if(userLocal) {
        saveUserMarkers($(this).data('id'), $(this).is(':checked'));
      } else {
        saveUserMarker($(this).data('id'), $(this).is(':checked'));
      }

    });

    $('#menu a[data-type]').on('click', function(e){
      e.preventDefault();

      var type = $(this).data('type');

      if($(this).hasClass('active')) {
        map.removeLayer(window[type+'Group']);
        if(!userLocal)
          $.post('api/removemenu/'+type);
      } else {
        map.addLayer(window[type+'Group']);
        if(!userLocal)
          $.post('api/addmenu/'+type);
      }

      $(this).toggleClass('active');
    });

  });



