  function onMapClick(e) {
    console.log("Position @ " + map.project([e.latlng.lat, e.latlng.lng], map.getMaxZoom()));
  }

  function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
  }

  function updateCurrentMarker() {
    currentMarker = this;
  }

  function saveUserMarker(uid, checked) {
    var markers = getUserMarkers();

    if(checked) {
      $.post('api/addmarker/'+uid, function(res) {
        if(typeof(res.error) !== 'undefined') {
          alert('Vous avez été déconnecté. La page va se rafraîchir.');
          window.location.reload();
        }

        currentMarker.setOpacity(.66);
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

  function saveUserMarkers(uid, checked) {
    var markers = getUserMarkers();

    if(checked) {
      if(markers.indexOf(uid) < 0) {
        markers.push(uid);
      }
      currentMarker.setOpacity(.66);
    } else {
      if(markers.indexOf(uid) >= 0) {
        markers.splice(markers.indexOf(uid), 1);
      }
      currentMarker.setOpacity(1);
    }

    localStorage.setItem('userMarkers', JSON.stringify(markers));
    userMarkers = JSON.stringify(markers);
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
  var debugMarkers = [];
  var userLocal = true;



  // Liste des icons
  var statueIcon = L.icon({ iconUrl: 'assets/img/statue.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var teleporterIcon = L.icon({ iconUrl: 'assets/img/teleporter.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var anemoculusIcon = L.icon({ iconUrl: 'assets/img/anemoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var geoculusIcon = L.icon({ iconUrl: 'assets/img/geoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var panoramaIcon = L.icon({ iconUrl: 'assets/img/panorama.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var mondstadtshrineIcon = L.icon({ iconUrl: 'assets/img/mondstadt-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var liyueshrineIcon = L.icon({ iconUrl: 'assets/img/liyue-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var seelieIcon = L.icon({ iconUrl: 'assets/img/seelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var fireseelieIcon = L.icon({ iconUrl: 'assets/img/fireseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var debugIcon = L.icon({ iconUrl: 'assets/img/debug.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var circleIcon = L.icon({ iconUrl: 'assets/img/circle.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var oneIcon = L.icon({ iconUrl: 'assets/img/one.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });
  var twoIcon = L.icon({ iconUrl: 'assets/img/two.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });
  var threeIcon = L.icon({ iconUrl: 'assets/img/three.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0, -12] });
  var spiralabyssIcon = L.icon({ iconUrl: 'assets/img/spiralabyss.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var domainIcon = L.icon({ iconUrl: 'assets/img/domain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var trouncedomainIcon = L.icon({ iconUrl: 'assets/img/trouncedomain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var blankIcon = L.icon({ iconUrl: 'assets/img/blank.png', iconSize: [2,2], iconAnchor: [1,1], popupAnchor: [1, 1] });
  var questIcon = L.icon({ iconUrl: 'assets/img/quest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var crimsonagateIcon = L.icon({ iconUrl: 'assets/img/crimsonagate.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var priestIcon = L.icon({ iconUrl: 'assets/img/priest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var princessIcon = L.icon({ iconUrl: 'assets/img/princess.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var scribeIcon = L.icon({ iconUrl: 'assets/img/scribe.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var doorIcon = L.icon({ iconUrl: 'assets/img/door.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var challengeIcon = L.icon({ iconUrl: 'assets/img/challenge.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var unusualhilichurlIcon = L.icon({ iconUrl: 'assets/img/unusualhilichurl.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-32] });
  var glacialsteelIcon = L.icon({ iconUrl: 'assets/img/glacialsteel.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var futileendeavorIcon = L.icon({ iconUrl: 'assets/img/futileendeavor.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var prodigalsonreturnIcon = L.icon({ iconUrl: 'assets/img/prodigalsonreturn.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var lostinthesnowIcon = L.icon({ iconUrl: 'assets/img/lostinthesnow.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-32] });


  // Initialisation de la carte
  var map = new L.Map('map', {
      center : [0,0],
      zoom : 4,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'statue', 'teleporter', 'anemoculus', 'geoculus', 'panorama', 'mondstadtshrine', 'liyueshrine', 'seelie', 'fireseelie',
    'jueyunchili', 'valberry', 'itswarm', 'overlookingview', 'dungeon', 'region', 'quest', 'crimsonagate',
    'priestprincessscribe', 'challenge', 'unusualhilichurl', 'glacialsteel', 'futileendeavor', 'prodigalsonreturn',
    'lostinthesnow'
  ];
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
      checkbox: true,
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
        {
          id: 'dragonspine01',
          coords: [5120, 3943]
        }
      ]

    },
    {
      id: 'teleporter',
      group: teleporterGroup,
      icon: teleporterIcon,
      format: 'image',
      checkbox: true,
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
        {
          id: 'dragonspine01',
          coords: [5224, 3533]
        },
        {
          id: 'dragonspine02',
          coords: [4672, 3667]
        },
        {
          id: 'dragonspine03',
          coords: [5107, 3790]
        },
        {
          id: 'dragonspine04',
          coords: [4943, 3856]
        },
        {
          id: 'dragonspine05',
          coords: [4652, 3891]
        },
        {
          id: 'dragonspine06',
          coords: [4503, 3969]
        },
        {
          id: 'dragonspine07',
          coords: [4889, 4090]
        },
        {
          id: 'dragonspine08',
          coords: [5109, 4100]
        },
        {
          id: 'dragonspine09',
          coords: [4800, 4203]
        },
        {
          id: 'dragonspine10',
          coords: [4584, 4268]
        },
        {
          id: 'dragonspine11',
          coords: [5103, 4270]
        },
        {
          id: 'dragonspine12',
          coords: [5430, 4291]
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
          id: '02',
          coords: [5368, 3156],
        },
        {
          id: '03',
          coords: [4515, 2771],
          format: 'video',
          video: '6_6zJaa7QBs',
        },
        {
          id: '04',
          coords: [4421, 2728],
          format: 'video',
          video: 'x5FvBXcp3DQ',
        },
        {
          id: '05',
          coords: [5520, 3491]
        },
        {
          id: '06',
          coords: [5214, 3388]
        },
        {
          id: '07',
          coords: [4639, 3122],
          format: 'video',
          video: 'ZAL2fY71RxM'
        },
        {
          id: '08',
          coords: [4500, 3343],
        },
        {
          id: '09',
          coords: [5222, 3432],
          format: 'video',
          video: 'JFUIB4B-p0M'
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
          id: '14',
          coords: [4600, 3496],
          format: 'video',
          video: 'Xzp2unJgKhk'
        },
        {
          id: '15',
          coords: [6387, 2486],
          format: 'video',
          video: 'l7hTqD1sKec'
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
          id: '20',
          coords: [4776, 2466],
          format: 'video',
          video: 'OhOu0m-Ts9s'
        },
        {
          id: '21',
          coords: [5279, 3559],
        },
        {
          id: '22',
          coords: [5200, 3181],
        },
        {
          id: '23',
          coords: [5326, 3289],
          format: 'video',
          video: 'vLAplVUXMIA',
        },
        {
          id: '24',
          coords: [5357, 3231],
          format: 'video',
          video: 'HVdPVfN3r-8',
        },
        {
          id: '25',
          coords: [4452, 2590]
        },
        {
          id: '26',
          coords: [4527, 2639]
        },
        {
          id: '27',
          text: 'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',
          coords: [4540, 2580]
        },
        {
          id: '28',
          coords: [5449, 3258]
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
        {
          id: '37',
          coords: [4843, 3025],
          format: 'video',
          video: 'hEA_A5KRYTU'
        },
        {
          id: '38',
          coords: [5128, 3356],
        },
        {
          id: '39',
          coords: [5046, 3191],
        },
        {
          id: '40',
          coords: [4937, 3198],
          format: 'video',
          video: 'EpnPeTBGwFs'
        },
        {
          id: '41',
          coords: [4791, 3270],
          format: 'video',
          video: 'PWqxlUhudc4'
        },
        {
          id: '42',
          coords: [4825, 2521],
          format: 'video',
          video: 'RCrg2TOUxhI'
        },
        {
          id: '43',
          coords: [5465, 3391],
          format: 'video',
          video: 'h2xHNcGpJe4'
        },
        {
          id: '44',
          coords: [4377, 3435],
          format: 'video',
          video: 'D2OlfK1CMRo'
        },
        {
          id: '45',
          coords: [4519, 2932],
        },
        {
          id: '46',
          text: 'Détruisez les ronces avec une attaque Pyro et grimpez sur le pilier.',
          coords: [4560, 3036],
        },
        {
          id: '47',
          coords: [4590, 2479],
        },
        {
          id: '48',
          coords: [4481, 2489],
        },
        {
          id: '49',
          text: 'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',
          coords: [4476, 2428],
        },
        {
          id: '50',
          coords: [4155, 2806],
        },
        {
          id: '51',
          coords: [4072, 2936],
        },
        {
          id: '52',
          coords: [3970, 2462],
        },
        {
          id: '53',
          coords: [4117, 2297],
        },
        {
          id: '54',
          coords: [4005, 2262],
        },
        {
          id: '55',
          coords: [3800, 2244],
        },
        {
          id: '56',
          coords: [3705, 2556],
        },
        {
          id: '57',
          coords: [3827, 2646],
        },
        {
          id: '58',
          coords: [3767, 2522],
          format: 'video',
          video: 'eZTB79akfAc',
        },
        {
          id: '59',
          coords: [3927, 2370],
        },
        {
          id: '60',
          coords: [3863, 2415],
        },
        {
          id: '61',
          coords: [3914, 2436],
        },
        {
          id: '62',
          coords: [4131, 2187],
          format: 'video',
          video: 'SZ0-4fZBFx8'
        },
        {
          id: '63',
          coords: [4285, 2464],
          format: 'video',
          video: 'lrokJSPyY2o'
        },
      ]
    },
    {
      id: 'geoculus',
      group: geoculusGroup,
      icon: geoculusIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: '001',
          text: 'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',
          coords: [2444, 4179],
        },
        {
          id: '002',
          coords: [2516, 3883],
        },
        {
          id: '003',
          coords: [2798, 3896],
        },
        {
          id: '004',
          coords: [3556, 3330],
        },
        {
          id: '005',
          coords: [3625, 3289],
        },
        {
          id: '006',
          coords: [3477, 3177],
        },
        {
          id: '007',
          coords: [3514, 3401],
        },
        {
          id: '008',
          coords: [3407, 3348],
        },
        {
          id: '009',
          coords: [3379, 3269],
        },
        {
          id: '010',
          coords: [3226, 4492],
        },
        {
          id: '011',
          coords: [2922, 4554],
        },
        {
          id: '012',
          coords: [3018, 4475],
        },
        {
          id: '013',
          coords: [2437, 4393],
        },
        {
          id: '014',
          coords: [4118, 5181],
        },
        {
          id: '015',
          coords: [3006, 5662],
        },
        {
          id: '016',
          coords: [2813, 5634],
        },
        {
          id: '017',
          coords: [3280, 4719],
        },
        {
          id: '018',
          format: 'video',
          video: 'NPFJ3s2DhZo',
          coords: [4314, 5749],
        },
        {
          id: '019',
          coords: [3638, 3642],
        },
        {
          id: '020',
          coords: [3511, 3606],
        },
        {
          id: '021',
          coords: [3202, 3508],
        },
        {
          id: '022',
          coords: [2703, 4496],
        },
        {
          id: '023',
          coords: [2797, 3676],
        },
        {
          id: '024',
          coords: [2850, 3726],
        },
        {
          id: '025',
          coords: [4665, 5243],
        },
        {
          id: '026',
          text: 'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',
          coords: [5112, 5330],
        },
        {
          id: '027',
          coords: [4844, 5461],
        },
        {
          id: '028',
          coords: [4994, 5226],
        },
        {
          id: '029',
          coords: [4861, 4719],
        },
        {
          id: '030',
          coords: [3627, 3710],
        },
        {
          id: '031',
          format: 'video',
          video: '9nXo8Xe8cGw',
          coords: [3647, 3816],
        },
        {
          id: '032',
          coords: [3728, 3574],
        },
        {
          id: '033',
          coords: [3451, 3762],
        },
        {
          id: '034',
          coords: [3221, 3377],
        },
        {
          id: '035',
          coords: [3329, 3418],
        },
        {
          id: '036',
          coords: [2856, 4167],
        },
        {
          id: '037',
          coords: [2773, 4131],
        },
        {
          id: '038',
          coords: [2801, 4390],
        },
        {
          id: '039',
          coords: [2787, 4374],
        },
        {
          id: '040',
          coords: [2561, 4232],
        },
        {
          id: '041',
          coords: [2352, 4161],
        },
        {
          id: '042',
          coords: [2248, 4342],
        },
        {
          id: '043',
          coords: [2299, 4445],
        },
        {
          id: '044',
          coords: [2240, 4461],
        },
        {
          id: '045',
          format: 'video',
          video: 'THhpu38aWFw',
          coords: [2407, 4399],
        },
        {
          id: '046',
          coords: [4371, 4523],
        },
        {
          id: '047',
          coords: [4597, 4500],
        },
        {
          id: '048',
          coords: [4547, 4633],
        },
        {
          id: '049',
          coords: [4520, 4656],
        },
        {
          id: '050',
          coords: [4069, 4463],
        },
        {
          id: '051',
          coords: [4023, 4578],
        },
        {
          id: '052',
          coords: [4199, 4855],
        },
        {
          id: '053',
          coords: [3899, 3539],
        },
        {
          id: '054',
          coords: [3900, 3841],
        },
        {
          id: '055',
          coords: [3757, 4223],
        },
        {
          id: '056',
          coords: [3726, 4216],
        },
        {
          id: '057',
          coords: [3820, 4291],
        },
        {
          id: '058',
          coords: [3869, 5092],
        },
        {
          id: '059',
          coords: [3880, 4787],
        },
        {
          id: '060',
          coords: [3956, 4977],
        },
        {
          id: '061',
          coords: [3629, 4841],
        },
        {
          id: '062',
          coords: [3305, 3610],
        },
        {
          id: '063',
          coords: [3342, 3584],
        },
        {
          id: '064',
          coords: [3742, 3883],
        },
        {
          id: '065',
          text: 'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',
          coords: [3933, 4171],
        },
        {
          id: '066',
          coords: [3469, 3667],
        },
        {
          id: '067',
          coords: [3666, 4052],
        },
        {
          id: '068',
          coords: [4230, 3896],
        },
        {
          id: '069',
          format: 'video',
          video: 'kA5Anc17mRw',
          coords: [4237, 5079],
        },
        {
          id: '070',
          coords: [3189, 3968],
        },
        {
          id: '071',
          text: 'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',
          coords: [3066, 3705],
        },
        {
          id: '072',
          coords: [3311, 5961],
        },
        {
          id: '073',
          coords: [3399, 5707],
        },
        {
          id: '074',
          format: 'video',
          video: 'Tmkw4w__EjI',
          coords: [3446, 5551],
        },
        {
          id: '075',
          format: 'video',
          video: 'PXfpJwdAn9U',
          coords: [3466, 5641],
        },
        {
          id: '076',
          coords: [3215, 5619],
        },
        {
          id: '077',
          coords: [3658, 3436],
        },
        {
          id: '078',
          coords: [2838, 4466],
        },
        {
          id: '079',
          format: 'video',
          video: '5GLMu91EMJ4',
          coords: [2488, 4204],
        },
        {
          id: '080',
          coords: [2338, 4376],
        },
        {
          id: '081',
          text: 'Utilisez la compétence du Voyageur Géo pour atteindre ce Géoculus.',
          coords: [3786, 3747],
        },
        {
          id: '082',
          coords: [4331, 4169],
        },
        {
          id: '083',
          coords: [4382, 4381],
        },
        {
          id: '084',
          coords: [3376, 5015],
        },
        {
          id: '085',
          coords: [4547, 4442],
        },
        {
          id: '086',
          coords: [2480, 4143],
        },
        {
          id: '087',
          coords: [3542, 4205],
        },
        {
          id: '088',
          coords: [3057, 5278],
        },
        {
          id: '089',
          coords: [4181, 4299],
        },
        {
          id: '090',
          title: 'Géoculus 90',
          coords: [3337, 2988],
        },
        {
          id: '091',
          title: 'Géoculus 91',
          coords: [3248, 3166],
        },
        {
          id: '092',
          title: 'Géoculus 92',
          coords: [3262, 3231],
        },
        {
          id: '093',
          title: 'Géoculus 93',
          coords: [3557, 3429],
        },
        {
          id: '094',
          title: 'Géoculus 94',
          coords: [3722, 3683],
        },
        {
          id: '095',
          title: 'Géoculus 95',
          coords: [3135, 3769],
        },
        {
          id: '096',
          title: 'Géoculus 96',
          coords: [2445, 4010],
        },
        {
          id: '097',
          title: 'Géoculus 97',
          coords: [2656, 4827],
        },
        {
          id: '098',
          title: 'Géoculus 98',
          coords: [2662, 4963],
        },
        {
          id: '099',
          title: 'Géoculus 99',
          coords: [2850, 5364],
        },
        {
          id: '100',
          title: 'Géoculus 100',
          coords: [2952, 5454],
        },
        {
          id: '101',
          title: 'Géoculus 101',
          coords: [2810, 5754],
        },
        {
          id: '102',
          title: 'Géoculus 102',
          coords: [2822, 5986],
        },
        {
          id: '103',
          title: 'Géoculus 103',
          coords: [3157, 5960],
        },
        {
          id: '104',
          title: 'Géoculus 104',
          coords: [3501, 5528],
        },
        {
          id: '105',
          title: 'Géoculus 105',
          coords: [3143, 5290],
        },
        {
          id: '106',
          title: 'Géoculus 106',
          coords: [3202, 5276],
        },
        {
          id: '107',
          title: 'Géoculus 107',
          coords: [2665, 4283],
        },
        {
          id: '108',
          title: 'Géoculus 108',
          coords: [2876, 4378],
        },
        {
          id: '109',
          title: 'Géoculus 109',
          coords: [2894, 4097],
        },
        {
          id: '110',
          title: 'Géoculus 110',
          coords: [2932, 3515],
        },
        {
          id: '111',
          title: 'Géoculus 111',
          coords: [3436, 4291],
        },
        {
          id: '112',
          title: 'Géoculus 112',
          coords: [3568, 4338],
        },
        {
          id: '113',
          title: 'Géoculus 113',
          coords: [3416, 4378],
        },
        {
          id: '114',
          title: 'Géoculus 114',
          coords: [3147, 4340],
        },
        {
          id: '115',
          title: 'Géoculus 115',
          coords: [3367, 4775],
        },
        {
          id: '116',
          title: 'Géoculus 116',
          coords: [3615, 4665],
        },
        {
          id: '117',
          title: 'Géoculus 117',
          coords: [3749, 4996],
        },
        {
          id: '118',
          title: 'Géoculus 118',
          coords: [3883, 4846],
        },
        {
          id: '119',
          title: 'Géoculus 119',
          coords: [3955, 4879],
        },
        {
          id: '120',
          title: 'Géoculus 120',
          coords: [4253, 4888],
        },
        {
          id: '121',
          title: 'Géoculus 121',
          coords: [4317, 4546],
        },
        {
          id: '122',
          title: 'Géoculus 122',
          coords: [4332, 4274],
        },
        {
          id: '123',
          title: 'Géoculus 123',
          coords: [4170, 4372],
        },
        {
          id: '124',
          title: 'Géoculus 124',
          coords: [4228, 4228],
        },
        {
          id: '125',
          title: 'Géoculus 125',
          coords: [5219, 5498],
        },
        {
          id: '126',
          title: 'Géoculus 126',
          coords: [3588, 5877],
        },
        {
          id: '127',
          title: 'Géoculus 127',
          coords: [3547, 5791],
        },
        {
          id: '128',
          title: 'Géoculus 128',
          coords: [3623, 5342],
        },
        {
          id: '129',
          title: 'Géoculus 129',
          coords: [3756, 5281],
        },
        {
          id: '130',
          title: 'Géoculus 130',
          coords: [3845, 5248],
        },
        {
          id: '131',
          title: 'Géoculus 131',
          coords: [3519, 3980],
        },
        {
          id: '132',
          title: 'Géoculus 132',
          coords: [3487, 3528],
        },
      ]
    },
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
    {
      id: 'fireseelie',
      group: fireseelieGroup,
      icon: fireseelieIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: '01',
          coords: [4716, 4212],
        },
        {
          id: '02',
          coords: [4868, 3644],
        },
        {
          id: '03',
          coords: [4655, 3801],
        },
        {
          id: '04',
          coords: [5092, 3957],
        },
        {
          id: '05',
          coords: [4776, 4171],
        },
        {
          id: '06',
          coords: [5166, 3751]
        }
      ]
    },
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
      ],
    },
    {
      id: 'dungeon',
      group: dungeonGroup,
      guide: '/genshin-impact/fonctionnalites/donjons/',
      icon: domainIcon,
      format: 'banner',
      markers: [
        {
          id: 'spiralabyss',
          title: 'Profondeurs spiralées',
          text: 'Selon la légende, ceux qui mènent à l\'Île du ciel, aux yeux de Dieu en vision, voient l\'échelle sous une telle forme de spirale. Nous nous dirigeons vers l\'univers, ou ver l\'abîme. Cela ne fait aucune différence, car tout est inconnnu.',
          guide: '/genshin-impact/fonctionnalites/profondeurs-spiralees/',
          coords: [6764, 3480],
          icon: spiralabyssIcon,
        },
        {
          id: 'midsummercourtyard',
          title: 'Jardin estival',
          text: 'Suivant la chute d\'une antique civilisation, le domaine autrefois luxuriant du palais d\'été qui occupait ces lieux s\'enfonça dans le sol, pour finir par y disparaître à son tour, ne laissant comme témoins de son ancienne gloire que les arbres et les pierres centenaires.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Colère de tonnerre, Dompteur de tonnerre.</strong>',
          coords: [5654, 2626],
        },
        {
          id: 'forsakenrift',
          title: 'Gorge de l\'oubli',
          text: 'Dans les temps anciens, des personnes s\'aventuraient dans la vallée à la recherche de l\'arbre ancien de l\'autel. Ils chuchotaient leurs secrets en son creux, se délestant de leur fardeau. La Gorge de l\'oubli regorge de ces confidences.',
          coords: [4986, 3451],
          format: 'image'
        },
        {
          id: 'valleyofremembrance',
          title: 'Vallée de la réminiscence',
          text: 'Le temps passa&nbsp;; le peuple du continent oublia les histoires du passé. Les hommes voulurent creuser la terre, pour retrouver les souvenirs qu\'ils avaient perdus. De l\'autre côté de l\'arbre ancien, les secrets d\'hier sont devenus les trésors d\'aujourd\'hui.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Ombre de la Verte chasseuse, Amour chéri.</strong>',
          coords: [4759, 3422],
        },
        {
          id: 'ceciliagarden',
          title: 'Pépinière de cécilias',
          text: 'Les cécilias qui d\'habitude fleurissent sur les hautes falaises poussaient autrefois ici dans la chaleur des serres. La civilisation qui aimait tant ces fleurs disparut, et avec elle leur doux parfum.',
          coords: [4330, 2862],
          format: 'image'
        },
        {
          id: 'hiddenpalaceofzhouformula',
          title: 'Palais secret de la Formule Zhou',
          text: 'Le rituel qui scelle une des huit portes permet d\'endiguer les forces du mal. Il a été exécuté autrefois pour sceller dans ce dédale un dragon sans cornes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Sorcière des flammes ardentes, Sage de la traverse de feu.</strong>',
          coords: [3698, 3428],
        },
        {
          id: 'hiddenpalaceoflianshanformula',
          title: 'Palais secret de Lianshan',
          text: 'On raconte que les montages, de par leur regroupement, sont la demeure d\'incessantes tempêtes, et que les sourds grondements que l\'on peut parfois entendre à l\'entrée du domaine attirent les âmes curieuses.',
          coords: [4513, 4386],
          format: 'image'
        },
        {
          id: 'domainofguyun',
          title: 'Au-dessus des nuages',
          text: 'Les illusions et les lamentations de ceux qui souhaitaient autrefois guider l\'humanité convergent ici. Bien qu\'ils hantent la Forêt de pierre de Guyun et que leur ambition soit toujours démesurée, ils ne peuvent que déverser leur rancune dans des cavernes souterraines désormais.',
          coords: [5053, 5410],
        },
        {
          id: 'taishanmansion',
          title: 'Manoir Taishan',
          text: 'Autrefois, les personnes désireuses d\'obtenir une audience avec les Adeptes devaient passer les épreuves du Ciel et de la Terre. Cette dernière se déroulait au Manoir Taishan qui est devenu un repaire de trésors depuis le départ de ses maîtres.',
          coords: [2924, 4462],
          format: 'image'
        },
        {
          id: 'clearpoolandmounntaincavern',
          title: 'Lagunes et montagnes',
          text: 'Le Mont Aozang est une montagne qui cache trésors et secrets. Son lac semble ordinaire à première vue, mais à proximité se trouve une grotte qui connecte la terre au ciel, et dont des nuages émergent. Cet ensemble forme un paysage très particulier.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Chevalerie ensanglantée, Ancien rituel royal.</strong>',
          coords: [2670, 3835],
        },
        {
          id: 'eaglesgate',
          title: 'Porte du Faucon',
          text: 'Les âmes nobles aspirent à la quiétude au-dessus du monde ordinaire, semblables au faucon volant dans les cieux. Ceux qui, tel le faucon méprisaient les mortels et leurs querelles inutiles pouvaient trouver la paix à la Porte du Faucon.',
          coords: [5966, 3796],
          icon: trouncedomainIcon
        },
        {
          id: 'templeofthewolf',
          title: 'Temple du Loup',
          text: 'Un temple qui fut autrefois dédié au Loup du Nord. On raconte que son esprit veille toujours sur Mondstadt dans un lieu lointain. Des monstres l\'occupent depuis son abandon.',
          coords: [5737, 2954],
          icon: trouncedomainIcon
        },
        {
          id: 'templeofthelion',
          title: 'Temple du Lion',
          text: 'Un temple qui fut autrefois dédié au Lion du Sud. Abandonné depuis longtemps, les pissenlits transportés par les vents de Mondstadt sont le signe de sa bénédiction.',
          coords: [5532, 3453],
          icon: trouncedomainIcon
        },
        {
          id: 'templeofthefalcon',
          title: 'Temple du Faucon',
          text: 'Un temple qui fut autrefois dédié au Faucon de l\'Ouest qui veilla sur Mondstadt pendant des millénaires. Ses courants d\'airs traversent encore les couleurs du bâtiment.',
          coords: [5269, 2975],
          icon: trouncedomainIcon
        },
        {
          id: 'confrontstormterror',
          title: 'Pénétrez dans l\'Antre de Stormterror',
          text: 'Les tours brisées qui se dressent encore fièrement en disent long sur l\'histoire de ce lieu. Ses salles parcourues par des bourrasques sont toujours pleins de souvenirs et de songes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',
          coords: [3964, 2464],
          icon: trouncedomainIcon
        },
        {
          id: 'enterthegoldenhouse',
          title: 'Entrer dans la Chambre d\'Or',
          text: 'Les sombres nuages couvant sur Liyue se sont enfin dispersés. Le complot qui s\'était emparé de ces terres a été exposé au grand jour, grâce aux efforts combinés des Sept Étoiles, des Adeptes et de vous-même. Le souvenir de votre combat contre Tartaglia le Fatui est encore frais dans votre mémoire. Revivez vos souvenirs et plongez-vous à nouveau dans la bataille. Peut-être apprendrez-vous quelque chose de nouveau, qui sait&nbsp;?<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',
          coords: [3836, 6023],
          icon: trouncedomainIcon
        },
        {
          id: 'domainofthewaywardpath',
          title: 'Chemin sinueux',
          text: 'Bien que les Pilleurs de trésors aient eu vent des richesses cachées ici, la localisation de ce lieu leur échappe encore. La convoitise excessive n\'apporte jamais rien de bon dans ce monde. Ce n\'est qu\'en lâchant prise qu\'un chemin se dessinera.',
          coords: [3206, 5702],
          icon: trouncedomainIcon
        },
        {
          id: 'hiddenpalaceofguizangformula',
          title: 'Palais secret de Guizang',
          text: 'Le lac parait limpide, mais cache en réalité des trésors si nombreux qui feraient perdre la raison à certains. Malheureusement, peu sont capables de révéler ses secrets.',
          coords: [3568, 5020],
          icon: trouncedomainIcon
        },
        {
          id: 'domainofforsakenruins',
          title: 'Ruines abandonnées',
          text: 'La plupart des personnes qui venaient ici convoitaient seulement des trésors qui se trouvaient à proximité. Aujourd\'hui, cet endroit, autrefois prospère, est abandonné.',
          coords: [3918, 4738],
          icon: trouncedomainIcon
        },
        {
          id: 'peakofvindagnyr',
          title: 'Pic de Vindagnyr',
          text: 'Cette cité enterrée sous la glace répondait autrefois à quelque nom fier et romantique, tout comme la montagne était autrefois luxuriante. Mais suite à la chute de la gigantesque pointe gelée tombée du ciel appelée &laquo;&nbsp;Mandrin céleste&nbsp;&raquo;, la voix des cieux s\'est tue, et ce lieu où les prêtres s\'assemblaient autrefois lors de leurs célébrations est aujourd\'hui vide de leur présence.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Briseur de glace, Âme du naufragé.</strong>',
          coords: [4916, 4078],

        }
      ]
    },
    {
      id: 'region',
      group: regionGroup,
      format: 'region',
      icon: blankIcon,
      markers: [
        {
          title: 'Lac Luhua',
          coords: [3469, 4916]
        },
        {
          title: 'Pente Cuijue',
          coords: [3273, 4693]
        },
        {
          title: 'Vallée Tianqiu',
          coords: [2854, 4967]
        },
        {
          title: 'Mont Nantianmen',
          coords: [2405, 4741]
        },
        {
          title: 'Mont Hulao',
          coords: [2199, 4405]
        },
        {
          title: 'Forêt de pierre<br>Huaguang',
          coords: [2338, 4199]
        },
        {
          title: 'Pic Qingyun',
          coords: [2564, 4287]
        },
        {
          title: 'Mont Aozang',
          coords: [2514, 3981]
        },
        {
          title: 'Karst Jueyun',
          coords: [2911, 4391]
        },
        {
          title: 'Tombeau Dunyu',
          coords: [3164, 5334]
        },
        {
          title: 'Passe de Lingju',
          coords: [2922, 5609]
        },
        {
          title: 'Mont Tianheng',
          coords: [3476, 5608]
        },
        {
          title: 'Ravine Qingxu',
          coords: [2794, 5977]
        },
        {
          title: 'Port de Liyue',
          coords: [3899, 5554]
        },
        {
          title: 'Plaines Guili',
          coords: [3845, 4600]
        },
        {
          title: 'Bancs de Yaoguang',
          coords: [4288, 4666]
        },
        {
          title: 'Village Mingyun',
          coords: [4348, 4362]
        },
        {
          title: 'Auberge Wangshu',
          coords: [3744, 4337]
        },
        {
          title: 'Forêt de pierre<br>de Guyun',
          coords: [4808, 5336]
        },
        {
          title: 'Marais Dihua',
          coords: [3723, 3926]
        },
        {
          title: 'Sal Terrae',
          coords: [4240, 3824]
        },
        {
          title: 'Porte de pierre',
          coords: [3848, 3642]
        },
        {
          title: 'Pente Wuwang',
          coords: [3650, 3539]
        },
        {
          title: 'Village de Qingce',
          coords: [3435, 3357]
        },
        {
          title: 'Domaine de l\'Aurore',
          coords: [4492, 3314]
        },
        {
          title: 'Deauclaire',
          coords: [4930, 3218]
        },
        {
          title: 'Territoire des Loups',
          coords: [4513, 2973]
        },
        {
          title: 'Canyon de<br>Brillecouronne',
          coords: [4496, 2382]
        },
        {
          title: 'Antre de Stormterror',
          coords: [3951, 2368]
        },
        {
          title: 'Lac de Cidre',
          coords: [4928, 2455]
        },
        {
          title: 'Cité de Mondstadt',
          coords: [4901, 2701]
        },
        {
          title: 'Bois des Murmures',
          coords: [5272, 2658]
        },
        {
          title: 'Lac Tombétoile',
          coords: [5431, 2514]
        },
        {
          title: 'Montagnes du Guet',
          coords: [5362, 2314]
        },
        {
          title: 'Coin du Guet',
          coords: [5865, 2197]
        },
        {
          title: 'Falaise Arrachétoile',
          coords: [5818, 2561]
        },
        {
          title: 'Temple des Mille Vents',
          coords: [5806, 2802]
        },
        {
          title: 'Ventlevé',
          coords: [5361, 3135]
        },
        {
          title: 'Vallée Dadaupa',
          coords: [5673, 3737]
        },
        {
          title: 'Cap de la Promesse',
          coords: [6124, 3623]
        },
        {
          title: 'Récif de Musk',
          coords: [6713, 3567]
        },
        {
          title: 'Côte du Faucon',
          coords: [5771, 3336]
        },
        {
          title: 'Périphérie<br>de la Cité enfouie',
          coords: [4508, 4099]
        },
        {
          title: 'Vallée Ronfledragon',
          coords: [4769, 3794]
        },
        {
          title: 'Route enneigée',
          coords: [5089, 3701]
        },
        {
          title: 'Palais antique<br>de la Cité enfouie',
          coords: [5084, 4004]
        },
        {
          title: 'Mandrin céleste',
          coords: [5007, 4138]
        },
        {
          title: 'Grotte Luminétoile',
          coords: [4911, 4262]
        },
      ]
    },
    {
      id: 'quest',
      group: questGroup,
      icon: questIcon,
      format: 'image',
      checkbox: true,
      markers: [
        {
          id: 'dragonspine01',
          title: 'La créature des montagnes',
          coords: [5197, 3525]
        },
        {
          id: 'dragonspine02',
          title: 'Richesses de Dosdragon',
          coords: [5181, 3539]
        },
        {
          id: 'dragonspine03',
          title: 'Enquête alpestre',
          coords: [4693, 3625]
        },
      ]
    },
    {
      id: 'crimsonagate',
      group: crimsonagateGroup,
      icon: crimsonagateIcon,
      checkbox: true,
      format: 'image',
      markers: [
        {
          id: '01',
          coords: [4730, 3607]
        },
        {
          id: '02',
          text: 'Dans l\'eau se trouvent 3 esprits de vent. <b>Faites celui sur la plaque de glace en dernier&nbsp;!</b> Une fois que la plaque a disparu, elle met du temps à revenir...',
          coords: [4629, 3713]
        },
        {
          id: '03',
          text: 'Tuez les Fatui aux alentours du coffre pour le déverrouiller. Interagissez avec pour obtenir l\'agate pourpre.',
          coords: [4581, 3732]
        },
        {
          id: '04',
          text: 'D\'abord, dégagez la plaque sous la glace (5) en récupérant l\'effet d\'un cristal de sang, puis marchez sur les plaques dans l\'ordre indiqué sur l\'image. Un coffre apparaît lorsque vous avez résolu l\'énigme. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4465,3869]
        },
        {
          id: '05',
          text: 'Récupérez d\'abord un cristal de sang qui se trouve en bas du mont et tapez la glace.',
          coords: [4587, 3867]
        },
        {
          id: '06',
          text: 'Après avoir résolu l\'énigme avec les pilliers Cryo et tué les 3 gardiens, vous débloquez l\'accès à une grotte où se trouve l\'agate pourpre.',
          coords: [4657,3938]
        },
        {
          id: '07',
          text: 'Faites apparaître un coffre en résolvant l\'énigme avec les pilliers Cryo. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4643,3949]
        },
        {
          id: '08',
          coords: [4611,4033]
        },
        {
          id: '09',
          text: 'Terminez le défi pour faire apparaître le coffre contenant l\'agate pourpre. Prévoyez une équipe Pyro pour vous faciliter la tâche.',
          coords: [4530, 4042]
        },
        {
          id: '10',
          coords: [4467, 4043]
        },
        {
          id: '11',
          text: 'Tuez les Brutocollinus devant la cabane pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4451, 4041]
        },
        {
          id: '12',
          text: 'Tuez le Chef Brutogivré pour faire appraitre le coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4489, 4134]
        },
        {
          id: '13',
          format: 'video',
          video: 'afYxkHMwUD0',
          coords: [4637, 4201]
        },
        {
          id: '14',
          format: 'video',
          video: 'jZIL9zOgcx8',
          coords: [4654, 4216]
        },
        {
          id: '15',
          coords: [4668, 4178]
        },
        {
          id: '16',
          text: 'Tuez les Fatui aux alentours pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4682, 4157]
        },
        {
          id: '17',
          text: 'Montez sur le flanc de la montagne et utilisez votre planeur pour atteindre cette agate pourpre.',
          coords: [4705, 4388]
        },
        {
          id: '18',
          text: 'Après avoir résolu la petite énigme avec les fées ardentes et tué le gardien, une grille s\'ouvre sur 3 coffres. Le coffre de droite donne l\'agate pourpre.',
          coords: [4755, 4298]
        },
        {
          id: '19',
          coords: [4841, 4224]
        },
        {
          id: '20',
          coords: [4841, 4189]
        },
        {
          id: '21',
          text: 'Ce coffre précieux qui contient une agate pourpre, se trouve derrière un mur de glace, à proximité l\'entrée de la Grotte Luminétoile. Il est également possible d\'y accéder depuis les hauteurs, grâce au planeur.',
          coords: [4885, 4249]
        },
        {
          id: '22',
          coords: [4786, 3978]
        },
        {
          id: '23',
          coords: [4820, 3987]
        },
        {
          id: '24',
          text: 'Après avoir tué le Chef Brutogivré. le coffre apparaît. L\'agate pourpre est à l\'intérieur.',
          coords: [4803, 4029]
        },
        {
          id: '25',
          coords: [4818, 3753]
        },
        {
          id: '26',
          coords: [4926, 3706]
        },
        {
          id: '27',
          coords: [4912, 3802]
        },
        {
          id: '28',
          coords: [5059, 3814]
        },
        {
          id: '29',
          text: 'Utilsez le cristal de sang qui se trouve au sud, pour briser la glace.',
          coords: [5034, 3761]
        },
        {
          id: '30',
          coords: [5139, 3841]
        },
        {
          id: '31',
          coords: [5155, 3909]
        },
        {
          id: '32',
          coords: [5196, 3883]
        },
        {
          id: '33',
          text: 'Tuez les ennemis pour débloquer le coffre qui contient l\'agate pourpre.',
          coords: [5327, 3832]
        },
        {
          id: '34',
          coords: [5232, 3930]
        },
        {
          id: '35',
          text: 'L\'agate pourpre se trouve dans le coffre disponible après avoir tué le gardien et vidé la salle grâce à l\'interrupteur.',
          coords: [5057, 3940]
        },
        {
          id: '36',
          coords: [5091, 3971]
        },
        {
          id: '37',
          coords: [4980, 3961]
        },
        {
          id: '38',
          text: 'Après avoir tué le Chef Brutogivré, le coffre apparait. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [4941, 3983]
        },
        {
          id: '39',
          coords: [4895, 4013]
        },
        {
          id: '40',
          coords: [4880, 4071]
        },
        {
          id: '41',
          coords: [4929, 4084]
        },
        {
          id: '42',
          title: 'Agate pourpre 42',
          coords: [4946, 4153]
        },
        {
          id: '43',
          coords: [4967, 4136]
        },
        {
          id: '44',
          coords: [4979, 4088]
        },
        {
          id: '45',
          coords: [4976, 4058]
        },
        {
          id: '46',
          coords: [4987, 4057]
        },
        {
          id: '47',
          coords: [4992, 4220]
        },
        {
          id: '48',
          title: 'Agate pourpre 48',
          coords: [5007, 4185]
        },
        {
          id: '49',
          text: 'Marchez sur la zone de glace plus clair pour la rompre et accéder à l\'agate pourpre en dessous.',
          coords: [5046, 4189]
        },
        {
          id: '50',
          text: 'Terminez le défi pour obtenir le coffre de récompenses. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [5048, 4182]
        },
        {
          id: '51',
          title: 'Agate pourpre 51',
          coords: [5011, 4147]
        },
        {
          id: '52',
          coords: [4995, 4122]
        },
        {
          id: '53',
          coords: [5010, 4112]
        },
        {
          id: '54',
          coords: [5032, 4133]
        },
        {
          id: '55',
          text: 'Vous avez deux agates poupres à cette position. La première à l\'extérieur, sur le toit. La seconde dans le coffre dans la cabane, après avoir tué le Chef brutogivré.',
          coords: [5006, 4296]
        },
        {
          id: '56',
          coords: [4970,4466]
        },
        {
          id: '57',
          text: 'Tuez le gardien pour ouvrir le coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [5258, 4500]
        },
        {
          id: '58',
          text: 'Utilisez les esprits du vent sur le côté est du pic, pour le gravir plus rapidement. Vous en trouverez plusieurs le long de votre ascension.',
          coords: [5203, 4401]
        },
        {
          id: '59',
          coords: [5282, 4221]
        },
        {
          id: '60',
          coords: [5399, 4215]
        },
        {
          id: '61',
          coords: [5470, 4271]
        },
        {
          id: '62',
          text: 'Depuis la falaise au sud de la Vallée Dadaupa, descendez vers un petit escarpement au nord de l\'île pour trouver un cristal de sang. Brisez-le puis dirigez-vous en planeur sur l\'île. Briser la glace éternelle sur place pour faire apparaître un coffre luxueux contenant l\'agate pourpre.',
          coords: [5549, 4113]
        },
        {
          id: '63',
          text: 'Utilisez les esprits du vent dans l\'ordre indiqué pour récupérer l\'agate pourpre dans les airs.',
          coords: [5369, 4028]
        },
        {
          id: '64',
          coords: [5316, 4051]
        },
        {
          id: '65',
          text: 'Tuez les ennemis pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [5284, 4019]
        },
        {
          id: '66',
          coords: [5262, 4077]
        },
        {
          id: '67',
          text: 'L\'agate pourpre se trouve dans le coffre accessible après avoir tué le roi des sangliers.',
          coords: [5215, 4120]
        },
        {
          id: '68',
          coords: [5173, 4072]
        },
        {
          id: '69',
          text: 'Ce coffre précieux est disponible dans la salle secrète après avoir lu les 8 stèles. Suivez le guide&nbsp;!',
          guide: '/genshin-impact/guides/froides-sapeques/',
          coords: [5070, 4028]
        },
        {
          id: '70',
          text: 'Ce coffre précieux qui contient une agate pourpre est accessible après avoir complété le succès «&nbsp;Prêtre, princesse et scribe&nbsp;».',
          guide: '/genshin-impact/guides/pretre-princesse-et-scribe/',
          coords: [5120, 4132]
        },
        {
          id: '71',
          coords: [5141, 4193]
        },
        {
          id: '72',
          text: 'Tuez les brutocollinus des alentours pour déverouiller l\'accès à ce coffre. L\'agate pourpre se trouve à l\'intérieur.',
          coords: [5198, 4371]
        },
        {
          id: '73',
          coords: [4958, 4173]
        },
        {
          id: '74',
          text: 'Accessible uniquement après avoir débloqué le donjon du Pic de Vindagnyr.',
          coords: [4915, 4085]
        },
        {
          id: '75',
          text: 'Nourrissez les renards avec deux baies en les déposant dans le bol près de la tente pendant cinq (vrais) jours. Le sixième jour, un coffre précieux contenant l\'agate pourpre apparait.',
          coords: [5016, 4012]
        },
        {
          id: '76',
          text: 'À droite de la grille, il faut taper la glace éternelle en étant sous l\'effet d\'un cristal de sang et activez l\'interrupteur en dessous. L\'agate pourpre se trouve dans le coffre.',
          coords: [4970, 4088]
        },
        {
          id: '77',
          coords: [4652,3902]
        },
      ]
    },
    {
      id: 'priestprincessscribe',
      group: priestprincessscribeGroup,
      checkbox: true,
      format: 'image',
      guide: '/genshin-impact/guides/pretre-princesse-et-scribe/',
      markers: [
        {
          id: 'priest',
          title: 'Coffre de prêtre',
          icon: priestIcon,
          coords: [4783, 3924]
        },
        {
          id: 'princess',
          title: 'Coffre de princesse',
          text: 'Touchez l\'épée pour lancer le défi. Une fois terminé, le coffre apparaît.',
          icon: princessIcon,
          coords: [5269, 3787]
        },
        {
          id: 'scribe',
          title: 'Coffre de scribe',
          icon: scribeIcon,
          text: 'Déposez 3&nbsp;Cécilias pour obtenir le coffre de scribe.',
          coords: [4777, 4183]
        },
        {
          id: 'door',
          text: 'Une fois que vous avez ramassez les 3 coffres (prêtre, princesse et scribe) vous pouvez ouvrir la porte.',
          icon: doorIcon,
          coords: [5111, 4104]
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
          id: 'mondstadt01',
          text: 'Ouvrez le coffre en moins de 30s.',
          video: 'CEgU79_TBpI',
          coords: [4556,3159]
        },
        {
          id: 'mondstadt02',
          text: 'Ouvrez le coffre en moins de 60s.',
          video: 'M8PVB6xzTFg',
          coords: [5788,2595]
        },
        {
          id: 'mondstadt03',
          text: 'Explosez les 4 tonneaux en moins de 20s.',
          video: 'gVJ2wFUxmLs',
          coords: [5502,2778]
        },
        {
          id: 'mondstadt04',
          text: 'Tuez tous les ennemis en 30s.',
          video: '2Wt4GiS3m9M',
          coords: [5214,2457]
        },
        {
          id: 'mondstadt05',
          text: 'Tuez tous les ennemis en 60s.',
          video: '7mIc69g84ps',
          coords: [5425,2345]
        },
        {
          id: 'mondstadt06',
          text: 'Allumez tous les braseros et ouvrez le coffre en 30s.',
          video: 'QAliyQcjZnQ',
          coords: [5602,2354]
        },
        {
          id: 'mondstadt07',
          text: 'Ouvrez le coffre en moins de 60s.',
          video: 'O1ntwm61sTY',
          coords: [5675,2302]
        },
        {
          id: 'mondstadt08',
          text: 'Ouvrez le coffre en moins de 30s.',
          video: '8m2i0QQnIs4',
          coords: [5688,2229]
        },
        {
          id: 'mondstadt09',
          text: 'Tuez tous les ennemis en 20s.',
          video: 'zkRXJYy5Xno',
          coords: [4429,2659]
        },
        {
          id: 'mondstadt10',
          text: 'Tuez tous les ennemis en 60s.',
          video: '_nDnHNluwLY',
          coords: [5089,3240]
        },
        {
          id: 'mondstadt11',
          text: 'Ouvrez le coffre en moins de 30s.',
          video: 'uQZxXQY3AWU',
          coords: [4909,3266]
        },
        {
          id: 'mondstadt12',
          text: 'Ouvrez le coffre en moins de 20s.',
          video: 's2CQ4Ms4lbE',
          coords: [4464,2862]
        },
        {
          id: 'mondstadt13',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'ewteF9VNmrA',
          coords: [4153,2822]
        },
        {
          id: 'mondstadt14',
          text: 'Tuez tous les ennemis en 50s.',
          video: 'EOJLR0_HX6o',
          coords: [4007,2237]
        },
        {
          id: 'mondstadt15',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'ZJo7JD4PJ_A',
          coords: [4191,2570]
        },
        {
          id: 'mondstadt16',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'ekGBUrJXAgA',
          coords: [3725,2305]
        },
        {
          id: 'mondstadt17',
          text: 'Ouvrez le coffre en moins de 50s.',
          video: 'cCdHlxM9vQI',
          coords: [3699,2360]
        },
        {
          id: 'mondstadt18',
          text: 'Ouvrez le coffre en moins de 30s.',
          video: 'jkZ5FrdO1jo',
          coords: [4717,3685]
        },
        {
          id: 'mondstadt19',
          text: 'Explosez les 3 tonneaux en moins de 30s.',
          video: 'y9SkYCW8H-M',
          coords: [4894,3600]
        },
        {
          id: 'mondstadt21',
          text: 'Explosez les 5 tonneaux en moins de 30s.',
          video: 'fkH9RxiwsbA',
          coords: [5351,4241]
        },
        {
          id: 'mondstadt22',
          text: 'Ouvrez le coffre en moins de 16s.',
          video: 'GzHhQauia3g',
          coords: [5277, 4577]
        },
        {
          id: 'mondstadt23',
          text: 'Ramassez 8 particules Anémo en moins de 50s.',
          video: 'Otq1FHm-8QY',
          coords: [5041,4469]
        },
        {
          id: 'mondstadt24',
          text: 'Tuez tous les ennemis en 180s.',
          video: 'LB27Cg3VVFA',
          coords: [5046,4179]
        },
        {
          id: 'mondstadt25',
          text: 'Tuez tous les ennemis en 60s.',
          video: 's6_DTpfCq7U',
          coords: [4983,3805]
        },
        {
          id: 'mondstadt26',
          text: 'Ramassez 8 particules Anémo en moins de 40s.',
          video: '_ZvpOhy1sAI',
          coords: [5131,4111]
        },
        {
          id: 'mondstadt27',
          text: 'Tuez tous les ennemis en 180s.',
          video: 'dafebp9OHw8',
          coords: [4534,4028]
        },
        {
          id: 'mondstadt28',
          text: 'Ramassez 8 particules Anémo en moins de 90s.',
          video: 'Br_EgHkBgi4',
          coords: [5035,4123]
        },
        {
          id: 'mondstadt29',
          text: 'Ramassez 8 particules Anémo en moins de 60s.',
          video: 'FIh3-KW0msw',
          coords: [4869,4279]
        },
        {
          id: 'liyue01',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'WziDtNmzLJs',
          coords: [3446,3230]
        },
        {
          id: 'liyue02',
          text: 'Explosez les 5 tonneaux en moins de 60s.',
          video: 'j_bXfT81rGI',
          coords: [3504,3383]
        },
        {
          id: 'liyue03',
          text: 'Explosez les 5 tonneaux en moins de 15s.',
          video: '3EDE6sVWo0E',
          coords: [4318,3824]
        },
        {
          id: 'liyue04',
          text: 'Tuez tous les ennemis en 45s.',
          video: '0FEn7bu1L5U',
          coords: [4056,3885]
        },
        {
          id: 'liyue05',
          text: 'Tuez tous les ennemis en 50s.',
          video: '7-S5hlf4x7g',
          coords: [3478,5769]
        },
        {
          id: 'liyue06',
          text: 'Tuez tous les ennemis en 120s.',
          video: 'hI7o0nAknI4',
          coords: [3477,5638]
        },
        {
          id: 'liyue07',
          text: 'Tuez tous les ennemis en 45s.',
          video: 'HGLc8MbzV78',
          coords: [3938,4481]
        },
        {
          id: 'liyue08',
          text: 'Tuez tous les ennemis en 45s.',
          video: 'paTQhEX5xfg',
          coords: [5053,5390]
        },
        {
          id: 'liyue09',
          text: 'Tuez tous les ennemis en 30s.',
          video: '9T9SNniy_QI',
          coords: [2226,4268]
        },
        {
          id: 'liyue10',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'NCXRp1fAwJI',
          coords: [2159,4447]
        },
        {
          id: 'liyue11',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'yLAvPbLl3tE',
          coords: [2474,4445]
        },
        {
          id: 'liyue12',
          text: 'Ouvrez le coffre en moins de 45s.',
          video: 'JosesYBjnFs',
          coords: [2550,3776]
        },
        {
          id: 'liyue13',
          text: 'Tuez tous les ennemis en 30s.',
          video: 'fCU6_w1WjY4',
          coords: [3923,3783]
        },
        {
          id: 'liyue14',
          text: 'Tuez tous les ennemis en 45s.',
          video: 'MchxMKPL8HM',
          coords: [2521,4383]
        },
        {
          id: 'liyue15',
          text: 'Tuez tous les ennemis en 60s.',
          video: '5PLcwdPCMj8',
          coords: [4499,4405]
        }
      ]
    },
    {
      id: 'unusualhilichurl',
      format: 'simple',
      group: unusualhilichurlGroup,
      icon: unusualhilichurlIcon,
      title: 'Brutocollinus étranges',
      guide: '/genshin-impact/succes/au-defi/#bruto-etrange',
      markers: [
        {
          id: '01',
          coords: [4408, 3122]
        },
        {
          id: '02',
          coords: [3892, 2540]
        },
        {
          id: '03',
          coords: [5298, 2266]
        },
        {
          id: '04',
          coords: [5360, 3216]
        },
        {
          id: '05',
          coords: [5641, 3658]
        },
        {
          id: '06',
          coords: [6221, 3487]
        },
        {
          id: '07',
          coords: [3921, 3543]
        },
        {
          id: '08',
          coords: [3474, 3212]
        },
        {
          id: '09',
          coords: [2639, 4261]
        },
        {
          id: '10',
          coords: [2918, 4469]
        },
        {
          id: '11',
          coords: [2768, 4962]
        },
        {
          id: '12',
          coords: [3227, 4704]
        },
        {
          id: '13',
          coords: [3034, 5773]
        },
        {
          id: '14',
          coords: [3957, 5285]
        },
        {
          id: '15',
          coords: [4484, 4457]
        },
      ]
    },
    {
      id: 'glacialsteel',
      group: glacialsteelGroup,
      icon: glacialsteelIcon,
      format: 'image',
      guide: '/genshin-impact/guides/froides-sapeques/',
      checkbox: 'true',
      markers: [
        {
          id: '01',
          title: 'Stèle n°&nbsp;1',
          coords: [5213, 3744]
        },
        {
          id: '02',
          title: 'Stèle n°&nbsp;2',
          coords: [4806, 3897]
        },
        {
          id: '03',
          title: 'Stèle n°&nbsp;3',
          coords: [4748, 4278]
        },
        {
          id: '04',
          title: 'Stèle n°&nbsp;4',
          text: 'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',
          coords: [4620, 3974]
        },
        {
          id: '05',
          title: 'Stèle n°&nbsp;5',
          coords: [4947, 4214]
        },
        {
          id: '06',
          title: 'Stèle n°&nbsp;6',
          text: 'Vous devez d\'abord terminer le succès "Prêtre, Princesse et Scribe" pour accéder à cette stèle. Suivez le guide&nbsp;!',
          guide: '/genshin-impact/guides/pretre-princesse-et-scribe/',
          coords: [5121, 4138]
        },
        {
          id: '07',
          title: 'Stèle n°&nbsp;7',
          coords: [4905, 4082]
        },
        {
          id: '08',
          title: 'Stèle n°&nbsp;8 et porte',
          coords: [5084, 4004]
        },
      ]
    },
    {
      id: 'futileendeavor',
      group: futileendeavorGroup,
      icon: futileendeavorIcon,
      checkbox: true,
      guide: '/genshin-impact/guides/futile-expedition/',
      format: 'image',
      markers: [
        {
          id: '01',
          title: 'Gardiens n°1 et 2',
          coords: [5261,4514]
        },
        {
          id: '02',
          title: 'Gardiens n°3 et 4',
          coords: [5031,3820]
        },
        {
          id: '03',
          title: 'Gardien n°5',
          coords: [5013,4326]
        },
        {
          id: '04',
          title: 'Gardien n°6',
          text: 'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',
          coords: [4672,3941]
        },
        {
          id: '05',
          title: 'Gardien n°7',
          coords: [5055,3938]
        },
        {
          id: '06',
          title: 'Gardien n°8',
          coords: [5086,4114]
        },
        {
          id: '07',
          title: 'Gardien n°9',
          coords: [4585,4082]
        },
      ]
    },
    {
      id: 'prodigalsonreturn',
      group: prodigalsonreturnGroup,
      icon: prodigalsonreturnIcon,
      format: 'image',
      guide: '/genshin-impact/guides/le-retour-du-fils-prodigue/',
      checkbox: true,
      markers: [
        {
          id: '01',
          title: 'Notes abîmées n°&nbsp;1',
          coords: [4653, 4220]
        },
        {
          id: '02',
          title: 'Notes abîmées n°&nbsp;2',
          coords: [4590, 4094]
        },
        {
          id: '03',
          title: 'Notes abîmées n°&nbsp;3',
          coords: [5247, 4174]
        },
      ]
    },
    {
      id: 'lostinthesnow',
      group: lostinthesnowGroup,
      icon: lostinthesnowIcon,
      format: 'popup',
      checkbox: true,
      title: 'Royaumes sous les neiges',
      text: 'Journal d’inspection ancien',
      markers: [
        {
          id: '01',
          text: 'Journal d’inspection ancien –&nbsp;<b>Partie I</b>.',
          coords: [5081, 4007]
        },
        {
          id: '02',
          text: 'Journal d’inspection ancien –&nbsp;<b>Partie III</b>.',
          coords: [4895, 4240]
        },
        {
          id: '03',
          text: 'Journal d’inspection ancien –&nbsp;<b>Partie II</b>.',
          coords: [4741, 4291]
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
          window.location.reload();
        } else {
          $.post('api/resetmarkers', function(res) {
            if(typeof(res.error) !== 'undefined') {
              alert('Vous avez été déconnecté. La page va se rafraîchir.');
            }

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
          marker.bindPopup(title+'<a href="assets/img/medias/'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/'+g.id+m.id+'" /></a>'+text+guide+checkbox);
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox);
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();

        if(checkbox)
          marker.on('click', updateCurrentMarker);

        marker.addTo(g.group);
        total++;


        if(userMarkers.indexOf(g.id+m.id) >= 0)
          marker.setOpacity(.66);

        if(params['debug'] && g.id !== 'region')
          debugMarkers.push({name: g.id+m.id, marker: marker, coords: m.coords, icon: icon});

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

    var updateDiscord = localStorage.getItem('update-discord');
    if(!updateDiscord) {
      var lightbox = lity('#update-discord');
      localStorage.setItem('update-discord', '1');
    }


    $.get('api/user', function(res) {
      if(typeof res.login !== 'undefined') {
        $('#discord').attr('href', res.login);
        initMarkers();
      }

      if(typeof res.uid !== 'undefined') {
        $('#discord')
            .toggleClass('bg-indigo-400 bg-white text-white text-gray-900 border-indigo-400 border-gray-400 text-xs')
            .html('<img src="'+res.avatar+'" onerror="this.src=\''+res.avatar_default+'\'" class="mr-2 h-6 rounded-full" /><strong>'+res.username+'</strong>')
            .attr('href', res.logout);
        userLocal = false;
        userMarkers = res.markers;
        initMarkers();

        if(res.menu) {
          $(res.menu).each(function(key, type) {
            $('#menu a[data-type="'+type+'"]').addClass('active');
            map.addLayer(window[type+'Group']);
          });
        }
      }
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
