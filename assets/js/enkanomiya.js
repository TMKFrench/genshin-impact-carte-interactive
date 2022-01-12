function onMapClick(e) {
    console.log("Position @ " + map.project([e.latlng.lat, e.latlng.lng], map.getMaxZoom()));
    // console.log("Point @ [" + e.latlng.lat + ", " + e.latlng.lng + "]");
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
  var panoramaIcon = L.icon({ iconUrl: 'assets/img/panorama.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var seelieIcon = L.icon({ iconUrl: 'assets/img/seelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var debugIcon = L.icon({ iconUrl: 'assets/img/debug.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var circleIcon = L.icon({ iconUrl: 'assets/img/circle.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var domainIcon = L.icon({ iconUrl: 'assets/img/domain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var trouncedomainIcon = L.icon({ iconUrl: 'assets/img/trouncedomain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var blankIcon = L.icon({ iconUrl: 'assets/img/blank.png', iconSize: [2,2], iconAnchor: [1,1], popupAnchor: [1, 1] });
  var questIcon = L.icon({ iconUrl: 'assets/img/quest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var priestIcon = L.icon({ iconUrl: 'assets/img/priest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var princessIcon = L.icon({ iconUrl: 'assets/img/princess.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var scribeIcon = L.icon({ iconUrl: 'assets/img/scribe.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var challengeIcon = L.icon({ iconUrl: 'assets/img/challenge.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var glacialsteelIcon = L.icon({ iconUrl: 'assets/img/glacialsteel.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var futileendeavorIcon = L.icon({ iconUrl: 'assets/img/futileendeavor.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var prodigalsonreturnIcon = L.icon({ iconUrl: 'assets/img/prodigalsonreturn.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var bossStormterrorIcon = L.icon({ iconUrl: 'assets/img/bossstormterror.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisGeoIcon = L.icon({ iconUrl: 'assets/img/bosshypostasisgeo.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossRegisvinePyroIcon = L.icon({ iconUrl: 'assets/img/bossregisvinepyro.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossMaguuKenkiIcon = L.icon({ iconUrl: 'assets/img/bossmaguukenki.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var testIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [0,-41] });
  var ironIcon = L.icon({ iconUrl: 'assets/img/iron.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var fragrantCedarIcon = L.icon({ iconUrl: 'assets/img/fragrantcedar.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var waveriderIcon = L.icon({ iconUrl: 'assets/img/waverider.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var fishinghookIcon = L.icon({ iconUrl: 'assets/img/fishinghook.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var inazumachestIcon = L.icon({ iconUrl: 'assets/img/inazuma-chest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var sigilkeyoneIcon = L.icon({ iconUrl: 'assets/img/sigilkeyone.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigilkeytwoIcon = L.icon({ iconUrl: 'assets/img/sigilkeytwo.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigilkeythreeIcon = L.icon({ iconUrl: 'assets/img/sigilkeythree.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigilkeyfourIcon = L.icon({ iconUrl: 'assets/img/sigilkeyfour.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigilkeyfiveIcon = L.icon({ iconUrl: 'assets/img/sigilkeyfive.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigillockoneIcon = L.icon({ iconUrl: 'assets/img/sigillockone.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigillocktwoIcon = L.icon({ iconUrl: 'assets/img/sigillocktwo.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigillockthreeIcon = L.icon({ iconUrl: 'assets/img/sigillockthree.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigillockfourIcon = L.icon({ iconUrl: 'assets/img/sigillockfour.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var sigillockfiveIcon = L.icon({ iconUrl: 'assets/img/sigillockfive.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor: [0,-12] });
  var smashedstoneIcon = L.icon({ iconUrl: 'assets/img/smashedstone.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });


  // Initialisation de la carte
  var map = new L.Map('map', {
      center: [23.07973176244989, -18.720703125000004],
      zoom: 3,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'statue', 'teleporter', 'anemoculus', 'geoculus', 'electroculus', 'panorama', 'mondstadtshrine', 'liyueshrine', 'inazumashrine', 'seelie', 'fireseelie',
    'jueyunchili', 'valberry', 'itswarm', 'overlookingview', 'dungeon', 'region', 'quest', 'crimsonagate', 'tsurumighosts',
    'priestprincessscribe', 'challenge', 'unusualhilichurl', 'glacialsteel', 'futileendeavor', 'prodigalsonreturn',
    'lostinthesnow', 'treasureguili', 'boss', 'iron', 'tinplate', 'electrocristal', 'remarkablechest', 'electroseelie',
    'fir', 'fragrantcedar', 'bamboo', 'sandbearer', 'pine', 'cuihua', 'birch', 'waverider', 'tokialleytales', 'fishing',
    'sigil', 'smashedstone'
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
var markers = [{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'01',coords:[640,2519],},{id:'02',coords:[470,2163],},{id:'03',coords:[922,1911],},{id:'04',coords:[1202,1709],},{id:'05',coords:[1326,1575],},{id:'06',coords:[1189,1483],},{id:'07',coords:[1417,1422],},{id:'08',coords:[1763,1631],},{id:'09',coords:[1669,1682],},{id:'10',coords:[1764,1771],},{id:'11',coords:[1946,1807],},{id:'12',coords:[1673,1951],},{id:'13',coords:[2417,1813],},{id:'14',coords:[2349,1627],},{id:'15',coords:[2184,1578],},{id:'16',coords:[2448,1474],},{id:'17',coords:[2018,2152],},{id:'18',coords:[1852,2231],},{id:'19',coords:[1596,2168],},{id:'20',coords:[1659,2385],},{id:'21',coords:[1570,2584],},{id:'22',coords:[1187,540],format:'todo',},{id:'23',coords:[2737,975],format:'todo',},{id:'24',coords:[2091,2840],format:'todo',},],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'01',coords:[464,2286],video:'uNeKBKcA08A',},{id:'02',coords:[666,2046],video:'hYTFpCS8sO4',},{id:'03',coords:[711,1971],video:'HtVX5269m80',},{id:'04',coords:[415,2145],video:'24qpFC_Eu3w',},{id:'05',coords:[1170,1685],video:'qoo_zjsCjlE',},{id:'06',coords:[1164,1542],video:'mdsJ5eUc-l0',},{id:'07',coords:[1264,1467],video:'LTpnHbU-VOs',},{id:'08',coords:[1251,1489],video:'fC8OUsi3HEk',},{id:'09',coords:[1370,1500],video:'hAV9AVHnUdY',},{id:'10',coords:[1413,1376],video:'omWCYMCgJkQ',},{id:'11',coords:[1388,1401],video:'DXDzNniOa1w',},{id:'12',coords:[1401,1432],format:'todo',},{id:'13',coords:[1409,1444],format:'todo',},{id:'14',coords:[1407,1510],format:'todo',},{id:'15',coords:[1797,1476],format:'todo',},{id:'16',coords:[1771,1574],format:'todo',},{id:'17',coords:[1779,1631],format:'todo',},{id:'18',coords:[1960,1677],format:'todo',},{id:'19',coords:[1622,1726],format:'todo',},{id:'20',coords:[1690,1772],format:'todo',},{id:'21',coords:[1536,2207],format:'todo',},{id:'22',coords:[1728,2152],format:'todo',},{id:'23',coords:[1805,2172],format:'todo',},{id:'24',coords:[1713,2246],format:'todo',},{id:'25',coords:[1615,2271],format:'todo',},{id:'26',coords:[1652,2319],format:'todo',},{id:'27',coords:[1737,2342],format:'todo',},{id:'28',coords:[1876,2299],format:'todo',},{id:'29',coords:[1536,2559],format:'todo',},{id:'30',coords:[2468,1925],format:'todo',},{id:'31',coords:[2355,1812],format:'todo',},{id:'32',coords:[2262,1829],format:'todo',},{id:'33',coords:[2362,1778],format:'todo',},{id:'34',coords:[2259,1745],format:'todo',},{id:'35',coords:[2225,1672],format:'todo',},{id:'36',coords:[2323,1648],format:'todo',},{id:'37',coords:[2248,1643],format:'todo',},{id:'38',coords:[2237,1607],format:'todo',},{id:'39',coords:[2242,1585],format:'todo',},],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [{id:'01',coords:[635,2503],format:'todo',},{id:'02',coords:[918,1898],format:'todo',},{id:'03',coords:[1274,1410],format:'todo',},{id:'04',coords:[1408,1432],format:'todo',},{id:'05',coords:[1877,1064],format:'todo',},{id:'06',coords:[2525,1471],format:'todo',},{id:'07',coords:[2320,1591],format:'todo',},{id:'08',coords:[2273,1794],format:'todo',},{id:'09',coords:[1832,1770],format:'todo',},{id:'10',coords:[1845,1779],format:'todo',},{id:'11',coords:[1830,1786],format:'todo',},{id:'12',coords:[1637,1898],format:'todo',},{id:'13',coords:[1617,2192],format:'todo',},{id:'14',coords:[1651,2162],format:'todo',},{id:'15',coords:[1658,2162],format:'todo',},{id:'16',coords:[1659,2172],format:'todo',},{id:'17',coords:[1651,2173],format:'todo',},{id:'18',coords:[1731,2380],format:'todo',},],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'01',coords:[550,2430],text:'Collectez toutes les particules en 40&nbsp;secondes.',video:'no2lgJZNtNQ',},{id:'02',coords:[421,2232],text:'Détruisez tous les barils en 50&nbsp;secondes.',video:'lsY-wclpTzo',},{id:'03',coords:[541,2147],text:'Collectez toutes les particules en 60&nbsp;secondes.',video:'tC3A7qbjwng',},{id:'04',coords:[667,2057],text:'Collectez toutes les particules en 40&nbsp;secondes.',video:'53J3IXx2mmI',},{id:'05',coords:[1120,1717],text:'Collectez toutes les particules en 40 secondes.',video:'SGNlzdW_aS0',},{id:'06',coords:[1580,1543],text:'Collectez toutes les particules en 60 secondes.',video:'g9edipZMJSA',},{id:'07',coords:[1731,1747],format:'todo',},{id:'08',coords:[1694,1856],format:'todo',},{id:'09',coords:[1947,1771],format:'todo',},{id:'10',coords:[1957,1672],text:'Détruisez tous les barils en 30 secondes.',video:'DFX6x2VvcnY',},{id:'11',coords:[2333,1496],format:'todo',},{id:'12',coords:[2365,1757],format:'todo',},{id:'13',coords:[2309,1852],format:'todo',},{id:'14',coords:[2027,2067],text:'Collectez toutes les particules en 30 secondes.',video:'WAmkKFuq01A',},{id:'15',coords:[1944,2167],format:'todo',},{id:'16',coords:[1851,2194],format:'todo',},{id:'17',coords:[1683,2185],format:'todo',},{id:'18',coords:[1669,2257],format:'todo',},],},{id:'glacialsteel',group:glacialsteelGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',icon:glacialsteelIcon,checkbox:true,markers: [],},{id:'futileendeavor',group:futileendeavorGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/futile-expedition/',icon:futileendeavorIcon,checkbox:true,markers: [],},{id:'prodigalsonreturn',group:prodigalsonreturnGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-retour-du-fils-prodigue/',icon:prodigalsonreturnIcon,checkbox:true,markers: [],},{id:'boss',group:bossGroup,format:'image',markers: [],},{id:'waverider',group:waveriderGroup,format:'image',title:'Téléporteur de barge',icon:waveriderIcon,checkbox:true,markers: [],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [],},{id:'remarkablechest',group:remarkablechestGroup,format:'image',title:'Coffre étrange',icon:inazumachestIcon,checkbox:true,markers: [],},{id:'sigil',group:sigilGroup,format:'image',icon:sigilkeyoneIcon,checkbox:true,markers: [{id:'key01',coords:[1198,1767],title:'Sigil-clé 1',},{id:'key02',coords:[1083,1685],title:'Sigil-clé 1',},{id:'key03',coords:[1106,1569],title:'Sigil-clé 1',},{id:'key04',coords:[1356,1417],title:'Sigil-clé 1',},{id:'key05',coords:[1420,1366],title:'Sigil-clé 1',text:'Sigil-clé caché derrière une porte qui s\'ouvre en activant le mécanisme devant.',},{id:'key06',coords:[1515,1534],title:'Sigil-clé 1',},{id:'key07',coords:[1747,1710],title:'Sigil-clé 1',format:'todo',},{id:'key08',coords:[1760,1881],title:'Sigil-clé 1',format:'todo',},{id:'key09',coords:[1794,1833],title:'Sigil-clé 1',format:'todo',},{id:'key10',coords:[1967,1855],title:'Sigil-clé 1',},{id:'key11',coords:[2224,1685],title:'Sigil-clé 1',format:'todo',},{id:'key12',coords:[2567,1471],title:'Sigil-clé 1',format:'todo',},{id:'key13',coords:[2364,1869],title:'Sigil-clé 1',format:'todo',},{id:'key14',coords:[1904,2207],title:'Sigil-clé 1',format:'todo',},{id:'key15',coords:[1680,2370],title:'Sigil-clé 1',},{id:'key16',coords:[1692,2534],title:'Sigil-clé 1',format:'todo',},{id:'key17',coords:[1397,1447],title:'Sigil-clé 2',icon:sigilkeytwoIcon,},{id:'key18',coords:[1422,1373],title:'Sigil-clé 2',icon:sigilkeytwoIcon,},{id:'key19',coords:[1749,1606],title:'Sigil-clé 2',icon:sigilkeytwoIcon,},{id:'key20',coords:[1872,1851],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key21',coords:[2374,1503],title:'Sigil-clé 2',icon:sigilkeytwoIcon,},{id:'key22',coords:[1702,2152],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key23',coords:[1749,2262],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key24',coords:[2221,2787],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key25',coords:[2838,770],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key26',coords:[1389,1365],title:'Sigil-clé 3',icon:sigilkeythreeIcon,},{id:'key27',coords:[1559,1417],title:'Sigil-clé 3',icon:sigilkeythreeIcon,},{id:'key28',coords:[1610,1800],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key29',coords:[2340,1577],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key30',coords:[1534,2179],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key31',coords:[2267,2888],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key32',coords:[1230,736],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key33',coords:[2023,1092],title:'Sigil-clé 3',icon:sigilkeythreeIcon,},{id:'key34',coords:[1254,693],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key35',coords:[1175,1537],title:'Sigil-clé 4',icon:sigilkeyfourIcon,},{id:'key36',coords:[1526,1330],title:'Sigil-clé 4',icon:sigilkeyfourIcon,},{id:'key37',coords:[1959,1795],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key38',coords:[1596,2227],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key39',coords:[1592,2271],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key40',coords:[1833,2251],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key41',coords:[2047,2073],title:'Sigil-clé 4',icon:sigilkeyfourIcon,},{id:'key42',coords:[1614,2573],title:'Sigil-clé 4',icon:sigilkeyfourIcon,},{id:'key43',coords:[2267,1640],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key44',coords:[2424,1859],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key45',coords:[2506,1850],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key46',coords:[2470,1504],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key47',coords:[1909,1090],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key48',coords:[1403,1447],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key49',coords:[1414,1529],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key50',coords:[1565,1488],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key51',coords:[1807,1715],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key52',coords:[1686,1886],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key53',coords:[1847,2170],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key54',coords:[1617,2404],title:'Sigil-clé 5',icon:sigilkeyfiveIcon,},{id:'key55',coords:[1898,2342],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key56',coords:[2266,1711],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key57',coords:[2357,1811],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key58',coords:[2347,1855],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key59',coords:[2681,872],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'lock01',coords:[1193,1586],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock02',coords:[1266,1428],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock03',coords:[1264,1397],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock04',coords:[1458,1496],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock05',coords:[1695,1772],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock06',coords:[1774,1602],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock07',coords:[2223,1669],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock08',coords:[2315,1599],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock09',coords:[2430,1769],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock10',coords:[1612,2191],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock11',coords:[1621,2190],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock12',coords:[1713,2313],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock13',coords:[1736,2386],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock14',coords:[1913,2284],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock15',coords:[1864,2248],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock16',coords:[1599,2574],title:'Sceau 1',format:'todo',icon:sigillockoneIcon,},{id:'lock17',coords:[1256,1414],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock18',coords:[1692,1752],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock19',coords:[1922,1696],title:'Sceau 2',icon:sigillocktwoIcon,},{id:'lock20',coords:[1714,2381],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock21',coords:[1911,2277],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock22',coords:[2428,1767],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock23',coords:[2222,1676],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock24',coords:[2326,1608],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock25',coords:[2506,1522],title:'Sceau 2',format:'todo',icon:sigillocktwoIcon,},{id:'lock26',coords:[1594,2575],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock27',coords:[1548,2270],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock28',coords:[1860,2246],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock29',coords:[1854,2236],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock30',coords:[1698,1725],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock31',coords:[1910,1686],title:'Sceau 3',icon:sigillockthreeIcon,},{id:'lock32',coords:[1923,1075],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock33',coords:[2510,1535],title:'Sceau 3',format:'todo',icon:sigillockthreeIcon,},{id:'lock34',coords:[2310,1583],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock35',coords:[2331,1589],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock36',coords:[2230,1671],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock37',coords:[2285,1790],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock38',coords:[1726,2367],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock39',coords:[1707,2313],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock40',coords:[1534,2269],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock41',coords:[1611,2200],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock42',coords:[1621,2200],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock43',coords:[1697,1735],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock44',coords:[1472,1525],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock45',coords:[1209,1570],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock46',coords:[1281,1402],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock47',coords:[1902,1069],title:'Sceau 4',format:'todo',icon:sigillockfourIcon,},{id:'lock48',coords:[1286,1419],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock49',coords:[1466,1492],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock50',coords:[1767,1594],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock51',coords:[1686,1768],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock52',coords:[2286,1797],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock53',coords:[2340,1594],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock54',coords:[2340,1596],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock55',coords:[1540,2281],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock56',coords:[1696,2310],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock57',coords:[1738,2368],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock58',coords:[1726,2390],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},{id:'lock59',coords:[1592,2588],title:'Sceau 5',format:'todo',icon:sigillockfiveIcon,},],},{id:'smashedstone',group:smashedstoneGroup,format:'image',title:'Pierre cassée',icon:smashedstoneIcon,checkbox:true,markers: [{id:'01',coords:[1035,1603],format:'todo',},{id:'02',coords:[1190,1761],format:'todo',},{id:'03',coords:[1160,1734],format:'todo',},{id:'04',coords:[1173,1691],format:'todo',},{id:'05',coords:[1160,1579],format:'todo',},{id:'06',coords:[1232,1580],format:'todo',},{id:'07',coords:[1237,1504],format:'todo',},{id:'08',coords:[1320,1554],format:'todo',},{id:'09',coords:[1389,1530],format:'todo',},{id:'10',coords:[1268,1399],format:'todo',},{id:'11',coords:[1325,1379],},{id:'12',coords:[1418,1366],format:'todo',},{id:'13',coords:[1410,1483],format:'todo',},{id:'14',coords:[1405,1455],format:'todo',},{id:'15',coords:[1536,1446],format:'todo',},{id:'16',coords:[1503,1499],format:'todo',},{id:'17',coords:[1844,1808],format:'todo',},{id:'18',coords:[1757,1818],format:'todo',},{id:'19',coords:[1676,1881],format:'todo',},{id:'20',coords:[1686,1887],format:'todo',},{id:'21',coords:[1729,1938],format:'todo',},{id:'22',coords:[1784,2081],format:'todo',},{id:'23',coords:[1583,2208],format:'todo',},{id:'24',coords:[1708,2202],format:'todo',},{id:'25',coords:[1710,2266],format:'todo',},{id:'26',coords:[1834,2263],format:'todo',},{id:'27',coords:[1540,2595],format:'todo',},{id:'28',coords:[1559,2554],format:'todo',},{id:'29',coords:[1581,2518],},{id:'30',coords:[2221,2796],format:'todo',},{id:'31',coords:[2219,2784],format:'todo',},{id:'32',coords:[2457,1922],format:'todo',},{id:'33',coords:[2497,1848],format:'todo',},{id:'34',coords:[2305,1981],format:'todo',},{id:'35',coords:[2356,1849],format:'todo',},{id:'36',coords:[2402,1877],format:'todo',},{id:'37',coords:[2420,1859],format:'todo',},{id:'38',coords:[2268,1826],format:'todo',},{id:'39',coords:[2358,1743],format:'todo',},{id:'40',coords:[2416,1711],format:'todo',},{id:'41',coords:[2470,1506],format:'todo',},{id:'42',coords:[2807,713],format:'todo',},{id:'43',coords:[2830,748],format:'todo',},{id:'44',coords:[1221,738],format:'todo',},{id:'45',coords:[1229,735],format:'todo',},{id:'46',coords:[1253,718],format:'todo',},{id:'47',coords:[1901,1124],format:'todo',},{id:'48',coords:[1876,1154],format:'todo',},{id:'49',coords:[2024,1137],format:'todo',},{id:'50',coords:[2376,1548],},],},];



// Création de la carte
  L.tileLayer('assets/img/tiles-enkanomiya/{z}/{x}/{y}.jpg', {
      attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
      maxZoom: 4,
      minZoom: 2,
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

      g.markers.forEach(function(m) {
        var checkbox = '', icon, format, title = '', text = '', guide = '', countdown, timer, finished = false,
            color = '#3388ff', region;

        if ((typeof m.checkbox !== 'undefined' && m.checkbox) || (typeof g.checkbox !== 'undefined' && g.checkbox))
          checkbox = '<label><input type="checkbox" id="user-marker" data-id="enkanomiya' + g.id + m.id + '" /><span>Terminé</span></label>';

        if (typeof g.text !== 'undefined')
          text = '<p>' + g.text + '</p>';
        if (typeof m.text !== 'undefined')
          text = '<p>' + m.text + '</p>';

        if (typeof g.title !== 'undefined')
          title = '<h4>' + g.title + '</h4>';
        if (typeof m.title !== 'undefined')
          title = '<h4>' + m.title + '</h4>';

        if (typeof g.guide !== 'undefined')
          guide = '<a href="' + g.guide + '" class="guide" target="_blank">Guide</a>';
        if (typeof m.guide !== 'undefined')
          if (typeof g.guide !== 'undefined' && m.guide.substr(0, 1) === '#')
            guide = '<a href="' + g.guide + m.guide + '" class="guide" target="_blank">Guide</a>';
          else
            guide = '<a href="' + m.guide + '" class="guide" target="_blank">Guide</a>';

        icon = (typeof m.icon !== 'undefined') ? m.icon : g.icon;
        format = (typeof m.format !== 'undefined') ? m.format : g.format;

        if (typeof g.countdown !== 'undefined')
          countdown = g.countdown;
        if (typeof m.countdown !== 'undefined')
          countdown = m.countdown;

        if (typeof g.timer !== 'undefined')
          timer = g.timer;
        if (typeof m.timer !== 'undefined')
          timer = m.timer;

        if (typeof g.color !== 'undefined')
          color = g.color;
        if (typeof m.color !== 'undefined')
          color = m.color;

        if(typeof g.region !== 'undefined') {
          region = g.region;
        } else if(typeof m.region !== 'undefined') {
          region = m.region;
        } else {
          region = 'base';
        }

        var marker = L.marker(unproject([(m.coords[0]), (m.coords[1])]), {icon: icon, riseOnHover: true});

        if(format === 'popup')
          marker.bindPopup(title+text+guide+checkbox);
        else if(format === 'video')
          marker.bindPopup(title+'<a class="video" href="//www.youtube.com/watch?v='+m.video+'" data-lity><img src="https://i.ytimg.com/vi/'+m.video+'/hqdefault.jpg" /></a>'+text+guide+checkbox);
        else if(format === 'image')
          marker.bindPopup(title+'<a href="assets/img/medias/enkanomiya'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/enkanomiya'+g.id+m.id+'" /></a>'+text+guide+checkbox);
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/enkanomiya'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox);
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();
        else if(format === 'todo')
          marker.bindPopup('<h4>enkanomiya' + g.id+m.id  + '</h4>'+'<p><em>Information pour ce marqueur prochainement disponible...</em></p>'+checkbox);
        else if(format === 'gif')
          marker.bindPopup(title+'<a href="assets/img/medias/enkanomiya'+g.id+m.id+'.gif" class="image" data-lity><img src="assets/img/medias/enkanomiya'+g.id+m.id+'.gif" /></a>'+text+guide+checkbox);


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

        if(userMarkers.indexOf('enkanomiya'+g.id+m.id) >= 0 && !finished)
          marker.setOpacity(.5);

        if(params['debug'] && g.id !== 'region')
          debugMarkers.push({name: g.id+m.id, marker: marker, coords: m.coords, icon: icon});

        allMarkers[g.id+m.id] = marker;

      });

    });

    $('#total').text(total);

  }




  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([0,0]), unproject([3220, 3220])));



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

    // var updateDiscord = localStorage.getItem('update-discord');
    // if(!updateDiscord) {
    //   var lightbox = lity('#update-discord');
    //   localStorage.setItem('update-discord', '1');
    // }


    $.get('api/user', function(res) {

      if(typeof res.users !== 'undefined')
        $('#total-users').text(res.users);

      if(typeof res.visits !== 'undefined')
        $('#total-visits').text(res.visits);

      if(typeof res.login !== 'undefined') {
        $('#discord').attr('href', res.login).attr('target', (window.location !== window.parent.location) ? '_blank' : '_self');
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

    var zoom = (params.z && ['2', '3', '4'].indexOf(params.z) >= 0) ? params.z : 4;

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
