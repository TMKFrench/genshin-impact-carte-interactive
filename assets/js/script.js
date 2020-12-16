  function onMapClick(e) {
    console.log("Position @ " + map.project([e.latlng.lat, e.latlng.lng], map.getMaxZoom()));
  }

  function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
  }

  function updateCurrentMarker() {
    currentMarker = this;
  }

  function saveUserMarkers(uid, checked) {
    var markers = getUserMarkers();

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
      var userMarkers = getUserMarkers();
      if(userMarkers.indexOf( $(content).find('input#user-marker').first().data('id') ) >= 0) {
        $('input#user-marker[data-id="'+$(content).find('input#user-marker').first().data('id')+'"]').prop('checked', 'checked');
      }
    }
  }



  var currentMarker;
  var total = 0;
  var params = getParamsURL();
  var userMarkers = getUserMarkers();



  // Liste des icons
  var statueIcon = L.icon({ iconUrl: 'assets/img/statue.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var teleporterIcon = L.icon({ iconUrl: 'assets/img/teleporter.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var anemoculusIcon = L.icon({ iconUrl: 'assets/img/anemoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var geoculusIcon = L.icon({ iconUrl: 'assets/img/geoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var panoramaIcon = L.icon({ iconUrl: 'assets/img/panorama.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var mondstadtshrineIcon = L.icon({ iconUrl: 'assets/img/mondstadt-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var liyueshrineIcon = L.icon({ iconUrl: 'assets/img/liyue-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var seelieIcon = L.icon({ iconUrl: 'assets/img/seelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var itswarmIcon = L.icon({ iconUrl: 'assets/img/itswarm.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var debugIcon = L.icon({ iconUrl: 'assets/img/debug.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievementIcon = L.icon({ iconUrl: 'assets/img/achievement.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement01Icon = L.icon({ iconUrl: 'assets/img/achievement01.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement02Icon = L.icon({ iconUrl: 'assets/img/achievement02.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement03Icon = L.icon({ iconUrl: 'assets/img/achievement03.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement04Icon = L.icon({ iconUrl: 'assets/img/achievement04.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement05Icon = L.icon({ iconUrl: 'assets/img/achievement05.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement06Icon = L.icon({ iconUrl: 'assets/img/achievement06.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement07Icon = L.icon({ iconUrl: 'assets/img/achievement07.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement08Icon = L.icon({ iconUrl: 'assets/img/achievement08.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var achievement09Icon = L.icon({ iconUrl: 'assets/img/achievement09.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var circleIcon = L.icon({ iconUrl: 'assets/img/circle.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var oneIcon = L.icon({ iconUrl: 'assets/img/one.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });
  var twoIcon = L.icon({ iconUrl: 'assets/img/two.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });
  var threeIcon = L.icon({ iconUrl: 'assets/img/three.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });



  // Initialisation de la carte
  var map = new L.Map('map', {
      center : [0,0],
      zoom : 4,
      zoomControl: false
  });



  // Générer les layers
  var groups = ['statue', 'teleporter', 'anemoculus', 'geoculus', 'panorama', 'mondstadtshrine', 'liyueshrine', 'seelie', 'jueyunchili', 'valberry', 'itswarm', 'overlookingview'];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
  var markers = [
    {
      id: 'statue',
      group: statueGroup,
      icon: statueIcon,
      format: 'image',
      title: 'Statue des Sept',
      markers: [
        {
          id: 'mondstadt01',
          coords: [5424, 2556],
        },
        {
          id: 'mondstadt02',
          coords: [5361, 3202],
        },
        {
          id: 'mondstadt03',
          coords: [4673, 3269]
        },
        {
          id: 'mondstadt04',
          coords: [3927, 2484]
        },
        {
          id: 'liyue01',
          coords: [3844, 3847]
        },
        {
          id: 'liyue02',
          coords: [3847, 5125]
        },
        {
          id: 'liyue03',
          coords: [2624, 4356]
        },
        {
          id: 'liyue04',
          coords: [3110, 5467]
        },
        {
          id: 'liyue05',
          coords: [4353, 4493]
        },
      ]

    },
    {
      id: 'teleporter',
      group: teleporterGroup,
      icon: teleporterIcon,
      format: 'image',
      markers: [
        {
          id: 'mondstadt01',
          coords: [5726, 2288],
        },
        {
          id: 'mondstadt02',
          coords: [5738, 2444],
        },
        {
          id: 'mondstadt03',
          coords: [5223, 2923],
        },
        {
          id: 'mondstadt04',
          coords: [4972, 2844],
        },
        {
          id: 'mondstadt05',
          coords: [4545, 2551],
        },
        {
          id: 'mondstadt06',
          coords: [4187, 2330],
        },
        {
          id: 'mondstadt07',
          coords: [3980, 2469],
        },
        {
          id: 'mondstadt08',
          coords: [3750, 2546],
        },
        {
          id: 'mondstadt09',
          coords: [4059, 2747],
        },
        {
          id: 'mondstadt10',
          coords: [4304, 3260],
        },
        {
          id: 'mondstadt11',
          coords: [4620, 2942],
        },
        {
          id: 'mondstadt12',
          coords: [4476, 2837],
        },
        {
          id: 'mondstadt13',
          coords: [3828, 2200],
        },
        {
          id: 'mondstadt14',
          coords: [4968, 3127],
        },
        {
          id: 'mondstadt15',
          coords: [5012, 3325],
        },
        {
          id: 'mondstadt16',
          coords: [5371, 2405],
        },
        {
          id: 'mondstadt17',
          coords: [5632, 3150],
        },
        {
          id: 'mondstadt18',
          coords: [5537, 3659],
        },
        {
          id: 'mondstadt19',
          coords: [6100, 3680],
        },
        {
          id: 'mondstadt20',
          coords: [5603, 2824],
        },
        {
          id: 'mondstadt21',
          coords: [4845, 2860],
          format: 'video',
          video: '9aaU23xfqGA'
        },
        {
          id: 'liyue01',
          coords: [3895, 3551],
        },
        {
          id: 'liyue02',
          coords: [3768, 4244],
        },
        {
          id: 'liyue03',
          coords: [3298, 3327],
        },
        {
          id: 'liyue04',
          coords: [2297, 4405],
        },
        {
          id: 'liyue05',
          coords: [2492, 4079],
        },
        {
          id: 'liyue06',
          coords: [4287, 4152],
        },
        {
          id: 'liyue07',
          coords: [3260, 4880],
        },
        {
          id: 'liyue08',
          coords: [2949, 4982],
        },
        {
          id: 'liyue09',
          coords: [2832, 5185],
        },
        {
          id: 'liyue10',
          coords: [4071, 5230],
        },
        {
          id: 'liyue11',
          coords: [4761, 5207],
        },
        {
          id: 'liyue12',
          coords: [2666, 4283],
        },
        {
          id: 'liyue13',
          coords: [2706, 4604],
        },
        {
          id: 'liyue14',
          coords: [3059, 5681],
        },
        {
          id: 'liyue15',
          coords: [2972, 6112],
        },
        {
          id: 'liyue16',
          coords: [3385, 5888],
        },
        {
          id: 'liyue17',
          coords: [3267, 5701],
        },
        {
          id: 'liyue18',
          coords: [3573, 5741],
        },
        {
          id: 'liyue19',
          coords: [4042, 4982],
        },
        {
          id: 'liyue20',
          coords: [4150, 4456],
        },
        {
          id: 'liyue21',
          coords: [4571, 4678],
        },
        {
          id: 'liyue22',
          coords: [3608, 4892],
        },
        {
          id: 'liyue23',
          coords: [3546, 3359],
        },
        {
          id: 'liyue24',
          coords: [3808, 5370],
        },
        {
          id: 'liyue25',
          coords: [3756, 4575],
        },
        {
          id: 'liyue26',
          coords: [3201, 4541],
        },
        {
          id: 'liyue27',
          coords: [2918, 4499],
        },
        {
          id: 'liyue28',
          coords: [3826, 5779],
        },
        {
          id: 'liyue29',
          coords: [3729, 5632],
        },
        {
          id: 'liyue32',
          coords: [3609, 3674],
        },
        {
          id: 'liyue31',
          coords: [3253, 3591],
        },
        {
          id: 'liyue32',
          coords: [2824, 3545],
        },
        {
          id: 'liyue33',
          coords: [3052, 4175],
        },
        {
          id: 'liyue34',
          coords: [2652, 4088],
        },
        {
          id: 'liyue35',
          coords: [2430, 4721],
        },
        {
          id: 'liyue36',
          coords: [3375, 4056],
        },
        {
          id: 'liyue37',
          coords: [2981, 3938],
        },
        {
          id: 'liyue38',
          coords: [4253, 3940],
        },
        {
          id: 'liyue39',
          coords: [3804, 3445],
        },
        {
          id: 'liyue40',
          coords: [3486, 5400],
        },
      ]
    },
    {
      id: 'anemoculus',
      group: anemoculusGroup,
      icon: anemoculusIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: '01',
          coords: [5369, 3046],
        },
        {
          id: '15',
          coords: [6387, 2486],
          format: 'video',
          video: 'l7hTqD1sKec'
        },
        {
          id: '10',
          coords: [5659, 2883]
        },
        {
          id: '11',
          coords: [5848, 2796]
        },
        {
          id: '12',
          coords: [5733, 2625]
        },
        {
          id: '13',
          coords: [5359, 2815]
        },
        {
          id: '16',
          coords: [5207, 2233]
        },
        {
          id: '17',
          coords: [5296, 2357],
          format: 'video',
          video: 'e2OmKND20Hs',
        },
        {
          id: '18',
          coords: [5690, 2311]
        },
        {
          id: '19',
          coords: [5893, 2160]
        },
        {
          id: '29',
          coords: [5497, 3107]
        },
        {
          id: '30',
          coords: [5484, 3593],
          text: 'Utilisez les trois esprits du vent pour faire apparaître une colonne d\'air et accéder à cet anémoculus.',
        },
        {
          id: '31',
          coords: [5666, 3746],
          text: 'Vous devez terminer le succès <b>La meilleure de toutes les épées</b> pour accéder à cet anémoculus.',
        },
        {
          id: '32',
          coords: [5550, 3906]
        },
        {
          id: '33',
          coords: [5791, 3792],
          format: 'video',
          video: 'sWrcwJLE4r4',
        },
        {
          id: '34',
          coords: [5701, 3637],
        },
        {
          id: '35',
          coords: [6007, 3631],
        },
        {
          id: '36',
          coords: [6764, 3480],
          format: 'video',
          video: 'qxncclUsFt0'
        },
      ]
    },
    {
      id: 'itswarm',
      group: itswarmGroup,
      icon: itswarmIcon,
      checkbox: true,
      format: 'video',
      guide: '/devenez-livreur-dans-levenement-servir-chaud/',
      markers: [
        {
          id: '01',
          title: 'Servir chaud - Jour 1 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [5983, 2280],
          video: '-8Q4nWG5rk8'
        },
        {
          id: '02',
          title: 'Servir chaud - Jour 1 - Auberge&nbsp;Wanqshu',
          coords: [3696, 3897],
          video: 'vfmWK8CEgq8'
        },
        {
          id: '03',
          title: 'Servir chaud - Jour 1 - Restaurant&nbsp;Wanmin',
          coords: [3129, 5239],
          video: 'e0ZRpUkaWbk'
        },
        {
          id: '04',
          title: 'Servir chaud - Jour 2 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [4167, 3326],
          video: 'bXZCnJPL8L4'
        },
        {
          id: '05',
          title: 'Servir chaud - Jour 2 - Auberge&nbsp;Wanqshu',
          coords: [3171, 4061],
          video: 'S115ZH4jsiA'
        },
        {
          id: '06',
          title: 'Servir chaud - Jour 2 - Restaurant&nbsp;Wanmin',
          coords: [4713, 5424],
          video: 'FoKqrl1gFP0'
        },
        {
          id: '07',
          title: 'Servir chaud - Jour 3 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [4604, 2423],
          video: 'ctwHOlgqliM'
        },
        {
          id: '08',
          title: 'Servir chaud - Jour 3 - Auberge&nbsp;Wanqshu',
          coords: [4256, 3724],
          video: 'TAM9eDxuwlY'
        },
        {
          id: '09',
          title: 'Servir chaud - Jour 3 - Restaurant&nbsp;Wanmin',
          coords: [3500, 4844],
          video: 'v24-FD5dwns'
        },
        {
          id: '10',
          title: 'Servir chaud - Jour 4 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [4414, 2636],
          video: '19e5NybJ9dc'
        },
        {
          id: '11',
          title: 'Servir chaud - Jour 4 - Auberge&nbsp;Wanqshu',
          coords: [3248, 4371],
          video: 'RgY_Vt838Po'
        },
        {
          id: '12',
          title: 'Servir chaud - Jour 4 - Restaurant&nbsp;Wanmin',
          coords: [3559, 5032],
          video: 'rRcYZvb0HuA'
        },
        {
          id: '13',
          title: 'Servir chaud - Jour 5 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [4272, 3468],
          video: 'TiVH8oOKe5s'
        },
        {
          id: '14',
          title: 'Servir chaud - Jour 5 - Auberge&nbsp;Wanqshu',
          coords: [3422, 3183],
          video: '37T4NusBUG0'
        },
        {
          id: '15',
          title: 'Servir chaud - Jour 5 - Restaurant&nbsp;Wanmin',
          coords: [2723, 4398],
          video: '0fWejB8k7MY'
        },
        {
          id: '16',
          title: 'Servir chaud - Jour 6 - Le&nbsp;Bon&nbsp;Chasseur',
          coords: [4008, 2243],
          video: 'O3Nis0fSX0E'
        },
        {
          id: '17',
          title: 'Servir chaud - Jour 6 - Auberge&nbsp;Wanqshu',
          coords: [2659, 3598],
          video: 'Wl2u9FrL6i0'
        },
        {
          id: '18',
          title: 'Servir chaud - Jour 6 - Restaurant&nbsp;Wanmin',
          coords: [4948, 5118],
          video: 'eBwUGaFIElU'
        },
      ]
    },
    // {
    //   id: 'geoculus',
    //   group: geoculusGroup,
    //   icon: geoculusIcon,
    //   format: 'image',
    //   checkbox: true,
    //   markers: [
    //     {
    //       id: '01',
    //       coords: [6298, 2422],
    //     },
    //   ]
    // },
    {
      id: 'panorama',
      group: panoramaGroup,
      icon: panoramaIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: 'mondstadt01',
          title: 'Cité du Vent',
          coords: [5313, 2710],
        },{
          id: 'mondstadt02',
          title: 'Marais des gardiens célestes',
          coords: [5518, 2624],
        },
        {
          id: 'mondstadt03',
          title: 'Terres du Vent',
          coords: [5190, 3075],
        },
        {
          id: 'mondstadt04',
          title: 'Pays aux fontaines',
          coords: [4916, 3101],
        },
        {
          id: 'mondstadt05',
          title: 'Manoir de l\'aube',
          coords: [4424, 3246],
        },
        {
          id: 'mondstadt06',
          title: 'Cathédrale, Ordre de Favonius',
          coords: [4778, 2763],
        },
        {
          id: 'mondstadt07',
          title: 'Bibliothèque, Ordre de Favonius',
          coords: [4860, 2881],
        },
        {
          id: 'mondstadt08',
          title: 'Ancien Temple des Mille vents',
          coords: [5861, 2705],
        },
        {
          id: 'mondstadt09',
          title: 'Cimetière d\'épées oublié',
          coords: [5548, 3706],
        },
        {
          id: 'mondstadt10',
          title: 'Capitale des vents oubliés',
          coords: [4293, 2407],
        },
        {
          id: 'liyue01',
          title: 'Pays des navires et du Commerce',
          coords: [3894, 5333],
        },
        {
          id: 'liyue02',
          title: 'Pente Feigun',
          coords: [3778, 5723],
        },
        {
          id: 'liyue03',
          title: 'Falaise Chihu',
          coords: [3899, 5812],
        },
        {
          id: 'liyue04',
          title: 'Terrasse Yujing',
          coords: [3659, 5563],
          format: 'video',
          video: 'YvF2VWtOiAc',
        },
        {
          id: 'liyue05',
          title: 'Poste d\'Observation',
          coords: [3839, 3937],
        },
        {
          id: 'liyue06',
          title: 'Marais aux Roseaux',
          coords: [3863, 3592],
        },
        {
          id: 'liyue07',
          title: 'Vestiges de Guili',
          coords: [3811, 4673],
        },
        {
          id: 'liyue08',
          title: 'Monts Qingce',
          coords: [3294, 3262],
        },
        {
          id: 'liyue09',
          title: 'Pics entre les nuages',
          coords: [2998, 4448],
        },
        {
          id: 'liyue10',
          title: 'Arbre au clair de lune',
          coords: [2485, 4432],
        },
        {
          id: 'liyue11',
          title: 'Forêt de Pierre Embrumée',
          coords: [2632, 4274],
        },
        {
          id: 'liyue12',
          title: 'Jardin aux Sanglots',
          coords: [3281, 4875],
        },
        {
          id: 'liyue13',
          title: 'Goutte dans l\'océan',
          coords: [4318, 5242],
        },
        {
          id: 'liyue14',
          title: 'Derrière le Gouffre',
          coords: [2912, 5806],
        },
        {
          id: 'liyue15',
          title: 'Ruines de Dunyu',
          coords: [2872, 5464],
        },
        {
          id: 'liyue16',
          title: 'Tour solitaire de Qingxu',
          coords: [2937, 6008],
        },
        {
          id: 'liyue17',
          title: 'Neuf Pilliers',
          coords: [3319, 4703],
        },
      ]
    },
    {
      id: 'mondstadtshrine',
      group: mondstadtshrineGroup,
      icon: mondstadtshrineIcon,
      format: 'image',
      checkbox: true,
      text: 'Requiert une Clé de Sanctuaire des Profondeurs de Mondstadt.',
      markers: [
        {
          id: '01',
          coords: [5290, 2241],
        },
        {
          id: '02',
          coords: [5775, 2526],
        },
        {
          id: '03',
          coords: [5605, 3522],
        },
        {
          id: '04',
          coords: [5376, 3734],
        },
        {
          id: '05',
          coords: [5298, 3405],
        },
        {
          id: '06',
          coords: [5083, 3133],
        },
        {
          id: '07',
          coords: [4730, 3116],
        },
        {
          id: '08',
          coords: [4295, 3538],
        },
        {
          id: '09',
          coords: [4378, 2966],
        },
        {
          id: '10',
          coords: [4624, 2364],
        },
      ]
    },
    {
      id: 'liyueshrine',
      group: liyueshrineGroup,
      icon: liyueshrineIcon,
      format: 'image',
      checkbox: true,
      text: 'Requiert une Clé de Sanctuaire des Profondeurs de Liyue.',
      markers: [
        {
          id: '01',
          coords: [4372, 4106],
        },
        {
          id: '02',
          title: 'Liyue Shrine 02',
          format: 'popup',
          coords: [4016, 3595],
        },
        {
          id: '03',
          title: 'Liyue Shrine 03',
          format: 'popup',
          coords: [3571, 3492],
        },
        {
          id: '04',
          coords: [2786, 3667],
        },
        {
          id: '05',
          coords: [2798, 3903],
        },
        {
          id: '06',
          coords: [2677, 4058],
        },
        {
          id: '07',
          coords: [2541, 4678],
        },
        {
          id: '08',
          title: 'Liyue Shrine 08',
          format: 'popup',
          coords: [3013, 5182],
        },
        {
          id: '09',
          title: 'Liyue Shrine 09',
          format: 'popup',
          coords: [3201, 5758],
        },
        {
          id: '10',
          coords: [4778, 5731],
        },
      ]
    },
    // {
    //   id: 'seelie',
    //   group: seelieGroup,
    //   icon: seelieIcon,
    //   format: 'image',
    //   checkbox: true,
    //   markers: [
    //     {
    //       id: '01',
    //       coords: [6442, 2542],
    //     },
    //   ]
    // },
    // {
    //   id: 'jueyunchili',
    //   group: jueyunchiliGroup,
    //   icon: jueyunchiliIcon,
    //   format: 'simple',
    //   markers: [
    //     {
    //       coords: [6150, 2718],
    //     },
    //   ]
    // },
    // {
    //   id: 'valberry',
    //   group: valberryGroup,
    //   icon: valberryIcon,
    //   format: 'popup',
    //   markers: [
    //     {
    //       id: '01',
    //       coords: [6250, 2718],
    //     },
    //   ]
    // },
    {
      id: 'overlookingview',
      group: overlookingviewGroup,
      format: 'image',
      checkbox: true,
      guide: '/genshin-impact/guides/splendide-vue/',
      title: 'Succès - Splendide vue',
      markers: [
        {
          id: '01',
          coords: [2666, 4283],
          text: 'Point de départ du succès.',
          icon: circleIcon,
        },
        {
          id: '02',
          coords: [2650, 4401],
          text: 'Oiseau numéro 1.',
          icon: oneIcon,
        },
        {
          id: '03',
          coords: [2301, 4340],
          text: 'Oiseau numéro 2.',
          icon: twoIcon,
        },
        {
          id: '04',
          coords: [2496, 4055],
          text: 'Oiseau numéro 3.',
          icon: threeIcon,
        },
      ]
    }
  ];


  // Création de la carte
  L.tileLayer('assets/img/tiles/{z}/{x}/{y}.jpg', {
      attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
      maxZoom: 5,
      minZoom: 3,
      continuousWorld: true,
  }).addTo(map);

  var toolbarZoom = L.easyBar([
    L.easyButton( '<img src="assets/img/plus.png">',  function(control, map){map.setZoom(map.getZoom()+1);}),
    L.easyButton( '<img src="assets/img/minus.png">',  function(control, map){map.setZoom(map.getZoom()-1);}),
  ]);

  var toolbarMenu = L.easyBar([
    L.easyButton( '<img src="assets/img/menu.png">',  function(control, map){
      $('body').toggleClass('show-menu');
      map.invalidateSize();
    }),
  ]);

  var toolbarResetMarkers = L.easyBar([
    L.easyButton( '<img src="assets/img/reset.png">',  function(control, map){
      if(confirm('Êtes-vous sûr de vouloir supprimer le suivi de vos marqueurs ?')) {
        localStorage.removeItem('userMarkers');
        window.location.reload();
      }
    }),
  ]);

  var toolbarInfo = L.easyBar([
    L.easyButton( '<img src="assets/img/info.png">',  function(control, map){var lightbox = lity('#info');}),
  ]);

  toolbarZoom.addTo(map);
  toolbarMenu.addTo(map);
  toolbarResetMarkers.addTo(map);
  toolbarInfo.addTo(map);



  // Génération des marqueurs
  markers.forEach(function(g) {

    g.markers.forEach(function(m){
      var checkbox = '', icon, format, title = '', text = '', guide = '';

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

      var marker = L.marker(unproject(m.coords), {icon: icon});

      if(format === 'popup')
        marker.bindPopup(title+text+guide+checkbox);
      else if(format === 'video')
        marker.bindPopup(title+'<a class="video" href="//www.youtube.com/watch?v='+m.video+'" data-lity><img src="https://i.ytimg.com/vi/'+m.video+'/hqdefault.jpg" /></a>'+text+guide+checkbox);
      else if(format === 'image')
        marker.bindPopup(title+'<a href="assets/img/medias/'+g.id+m.id+'.jpg" class="image" data-lity><img src="assets/img/medias/'+g.id+m.id+'-thumb.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" /></a>'+text+guide+checkbox);

      if(checkbox)
        marker.on('click', updateCurrentMarker);

      marker.addTo(g.group);
      total++;

      if(userMarkers.indexOf(g.id+m.id) >= 0)
        marker.setOpacity(.5);

    });

  });

  $('#total').text(total);



  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([1024,1024]), unproject([7168, 7168])));



  // Afficher les coordonnées du clic
  map.on('click', onMapClick);



  // Masquer tous les layers
  groups.forEach(function(e) {
    map.removeLayer(window[e+'Group']);
  });



  // Gérer le contenu de la popup
  map.on('popupopen', popUpOpen);



  $(document).ready(function() {

    var w = window.innerWidth;
    if(w <= 500) {
      $('body').removeClass('show-menu');
      map.invalidateSize();
    }

    if(params.x && params.y) {
      var zoom = (params.z && ['4', '5'].indexOf(params.z) >= 0) ? params.z : 4;
      map.setView(unproject([params.x, params.y]), zoom);
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
      saveUserMarkers($(this).data('id'), $(this).is(':checked'));
    });

    $('#menu a[data-type]').on('click', function(e){
      e.preventDefault();

      var type = $(this).data('type');

      if($(this).hasClass('active')) {
        map.removeLayer(window[type+'Group']);
      } else {
        map.addLayer(window[type+'Group']);
      }

      $(this).toggleClass('active');
    });
  });
