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
  var panoramaIcon = L.icon({ iconUrl: 'assets/img/panorama.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var seelieIcon = L.icon({ iconUrl: 'assets/img/seelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var debugIcon = L.icon({ iconUrl: 'assets/img/debug.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var domainIcon = L.icon({ iconUrl: 'assets/img/domain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var trouncedomainIcon = L.icon({ iconUrl: 'assets/img/trouncedomain.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0, -16] });
  var blankIcon = L.icon({ iconUrl: 'assets/img/blank.png', iconSize: [2,2], iconAnchor: [1,1], popupAnchor: [1, 1] });
  var questIcon = L.icon({ iconUrl: 'assets/img/quest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var challengeIcon = L.icon({ iconUrl: 'assets/img/challenge.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var waveriderIcon = L.icon({ iconUrl: 'assets/img/waverider.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var fishinghookIcon = L.icon({ iconUrl: 'assets/img/fishinghook.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var lumensparIcon = L.icon({ iconUrl: 'assets/img/lumenspar.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });

  // Initialisation de la carte
  var map = new L.Map('map', {
      center: [5,-15],
      zoom: 3,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'teleporter', 'panorama', 'seelie', 'dungeon', 'region', 'quest',
    'challenge', 'boss', 'waverider', 'fishing', 'lumenspar',
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
var markers = [{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'01',coords:[1235,2262],format:'todo',},{id:'02',coords:[1348,2056],format:'todo',},{id:'03',coords:[1749,2224],format:'todo',},{id:'04',coords:[1966,2352],format:'todo',},{id:'05',coords:[2207,2375],format:'todo',},{id:'06',coords:[2165,2167],format:'todo',},{id:'07',coords:[2258,2062],format:'todo',},{id:'08',coords:[2036,2035],format:'todo',},{id:'09',coords:[1900,1864],format:'todo',},{id:'10',coords:[1671,1794],format:'todo',},{id:'11',coords:[1660,1550],},{id:'12',coords:[1898,1511],},{id:'13',coords:[2016,1615],},{id:'14',coords:[2228,1590],},{id:'15',coords:[2282,1800],},],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [{id:'01',coords:[2308,1675],title:'Tunnel bloqué',},{id:'02',coords:[2123,1811],format:'todo',},{id:'03',coords:[2208,2056],format:'todo',},{id:'04',coords:[1906,1626],title:'Mines souterraines',},],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'01',coords:[1449,2194],format:'todo',},{id:'02',coords:[1800,2155],format:'todo',},{id:'03',coords:[1830,2359],format:'todo',},{id:'04',coords:[2157,2498],format:'todo',},{id:'05',coords:[2168,2481],format:'todo',},{id:'06',coords:[2177,2496],format:'todo',},{id:'07',coords:[2205,2404],format:'todo',},{id:'08',coords:[2179,2347],format:'todo',},{id:'09',coords:[2246,1938],format:'todo',},{id:'10',coords:[2028,2055],format:'todo',},{id:'11',coords:[2100,2144],format:'todo',},{id:'12',coords:[1796,1889],format:'todo',},{id:'13',coords:[1853,1821],format:'todo',},{id:'14',coords:[1782,1794],format:'todo',},{id:'15',coords:[1581,1745],format:'todo',},{id:'16',coords:[1514,1681],format:'todo',},{id:'17',coords:[1660,1635],video:'6lIWdlZwjYg',},{id:'18',coords:[1651,1494],video:'65z06FGvkrU',},{id:'19',coords:[1934,1606],video:'1EWSA6MPSoQ',},{id:'20',coords:[2011,1595],video:'6Nlt7bd6ldM',},{id:'21',coords:[2025,1584],video:'mil_9kSL3ss',},{id:'22',coords:[1970,1478],video:'2k4ONqUoN8w',},{id:'23',coords:[2177,1536],video:'Nesfor1X7jM',},{id:'24',coords:[2257,1545],video:'9QnCn9MSb1o',},{id:'25',coords:[2226,1730],video:'PSg9z9qobyo',},{id:'26',coords:[2321,1673],video:'_qoWRl8GV_I',},{id:'27',coords:[2352,1847],video:'XWSOm6Lyjvo',},{id:'28',coords:[2080,1696],format:'todo',},{id:'29',coords:[2130,1809],format:'todo',},],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'01',coords:[2156,2421],format:'todo',},{id:'02',coords:[2066,2216],format:'todo',},{id:'03',coords:[1954,2104],format:'todo',},{id:'04',coords:[1800,1952],format:'todo',},{id:'05',coords:[1800,1908],format:'todo',},{id:'06',coords:[1892,1808],format:'todo',},{id:'07',coords:[1915,1707],format:'todo',},{id:'08',coords:[1958,1784],format:'todo',},{id:'09',coords:[2207,1860],format:'todo',},{id:'10',coords:[2193,1810],format:'todo',},{id:'11',coords:[2405,1706],text:'Déverrouillez le défi à l\'aide de l\'Adjuvant et tuez tous les ennemis en 50 secondes.',video:'vRy1P0EcnbU ',},{id:'12',coords:[2098,1551],text:'Déverrouillez le défi à l\'aide de l\'Adjuvant et detruisez tous les barils en 30 secondes.',video:'XK_YxXYPzrQ',},{id:'13',coords:[2015,1569],text:'Déverrouillez le défi à l\'aide de l\'Adjuvant et récupérez toutes les particules en 40 secondes.',video:'oxAGRoxwg8I',},{id:'14',coords:[1889,1529],text:'Déverrouillez le défi à l\'aide de l\'Adjuvant et tuez tous les ennemis en 80 secondes.',video:'uNLpW78bIBU',},{id:'15',coords:[1611,1604],text:'Déverrouillez le défi à l\'aide de l\'Adjuvant et récupérez toutes les particules en 40 secondes.',video:'eSMxlBy7ZWU',},],},{id:'boss',group:bossGroup,format:'image',markers: [],},{id:'waverider',group:waveriderGroup,format:'image',title:'Téléporteur de barge',icon:waveriderIcon,checkbox:true,markers: [],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [{id:'01',coords:[1907,1784],format:'todo',},{id:'02',coords:[1839,2043],format:'todo',},],},{id:'lumenspar',group:lumensparGroup,format:'image',title:'Cristal de lumen',icon:lumensparIcon,checkbox:true,markers: [{id:'01',coords:[1128,2256],format:'todo',},{id:'02',coords:[1231,2250],format:'todo',},{id:'03',coords:[1274,2119],format:'todo',},{id:'04',coords:[1278,2092],format:'todo',},{id:'05',coords:[1395,2040],format:'todo',},{id:'06',coords:[1493,2175],format:'todo',},{id:'07',coords:[1596,2200],format:'todo',},{id:'08',coords:[1615,2202],format:'todo',},{id:'09',coords:[1809,2133],format:'todo',},{id:'10',coords:[1818,2166],format:'todo',},{id:'11',coords:[1767,2327],format:'todo',},{id:'12',coords:[1808,2291],format:'todo',},{id:'13',coords:[1855,2415],format:'todo',},{id:'14',coords:[1946,2396],format:'todo',},{id:'15',coords:[2049,2411],format:'todo',},{id:'16',coords:[2162,2514],format:'todo',},{id:'17',coords:[2189,2475],format:'todo',},{id:'18',coords:[2170,2424],format:'todo',},{id:'19',coords:[2144,2390],format:'todo',},{id:'20',coords:[2246,2378],format:'todo',},{id:'21',coords:[2194,2302],format:'todo',},{id:'22',coords:[1917,2234],format:'todo',},{id:'23',coords:[2104,2178],format:'todo',},{id:'24',coords:[2104,2170],format:'todo',},{id:'25',coords:[2037,2195],format:'todo',},{id:'26',coords:[1991,2162],format:'todo',},{id:'27',coords:[2037,2107],format:'todo',},{id:'28',coords:[1957,2079],format:'todo',},{id:'29',coords:[2205,2202],format:'todo',},{id:'30',coords:[2173,2172],format:'todo',},{id:'31',coords:[2176,2144],format:'todo',},{id:'32',coords:[2213,2145],format:'todo',},{id:'33',coords:[2241,2071],format:'todo',},{id:'34',coords:[2244,2001],format:'todo',},{id:'35',coords:[1846,2103],format:'todo',},{id:'36',coords:[1895,1947],format:'todo',},{id:'37',coords:[1786,1885],format:'todo',},{id:'38',coords:[1858,1846],format:'todo',},{id:'39',coords:[2004,1924],format:'todo',},{id:'40',coords:[1902,1843],format:'todo',},{id:'41',coords:[1948,1828],format:'todo',},{id:'42',coords:[1867,1799],format:'todo',},{id:'43',coords:[1855,1769],format:'todo',},{id:'44',coords:[1838,1703],format:'todo',},{id:'45',coords:[1990,1706],format:'todo',},{id:'46',coords:[1976,1685],},{id:'47',coords:[1659,1791],format:'todo',},{id:'48',coords:[1624,1806],format:'todo',},{id:'49',coords:[1537,1776],format:'todo',},{id:'50',coords:[1495,1704],format:'todo',},{id:'51',coords:[1634,1615],},{id:'52',coords:[1705,1614],},{id:'53',coords:[1643,1495],},{id:'54',coords:[1824,1538],},{id:'55',coords:[1913,1615],},{id:'56',coords:[1963,1569],},{id:'57',coords:[1964,1622],},{id:'58',coords:[1886,1482],format:'todo',},{id:'59',coords:[1914,1482],},{id:'60',coords:[2030,1495],},{id:'61',coords:[2061,1499],},{id:'62',coords:[2022,1530],format:'video',video:'o1LO4dBJMNM',},{id:'63',coords:[2040,1585],},{id:'64',coords:[2045,1393],},{id:'65',coords:[2178,1383],format:'todo',},{id:'66',coords:[2131,1450],},{id:'67',coords:[2157,1498],},{id:'68',coords:[2184,1557],},{id:'69',coords:[2159,1607],},{id:'70',coords:[2265,1500],},{id:'71',coords:[2310,1532],format:'todo',},{id:'72',coords:[2259,1647],},{id:'73',coords:[2348,1598],},{id:'74',coords:[2298,1686],},{id:'75',coords:[2310,1737],},{id:'76',coords:[2258,1765],},{id:'77',coords:[2224,1793],format:'todo',},{id:'78',coords:[2289,1773],},{id:'79',coords:[2400,1805],},{id:'80',coords:[2420,1884],},{id:'81',coords:[2151,1835],format:'todo',},{id:'82',coords:[2065,1799],format:'todo',},{id:'83',coords:[2075,1702],format:'todo',},],},];



// Création de la carte
  L.tileLayer('assets/img/tiles-chasm/{z}/{x}/{y}.jpg', {
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
          checkbox = '<label><input type="checkbox" id="user-marker" data-id="chasm' + g.id + m.id + '" /><span>Terminé</span></label>';

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
          marker.bindPopup(title+'<a href="assets/img/medias/chasm'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/chasm'+g.id+m.id+'" /></a>'+text+guide+checkbox);
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/chasm'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox);
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();
        else if(format === 'todo')
          marker.bindPopup('<h4>chasm' + g.id+m.id  + '</h4>'+'<p><em>Information pour ce marqueur prochainement disponible...</em></p>'+checkbox);
        else if(format === 'gif')
          marker.bindPopup(title+'<a href="assets/img/medias/chasm'+g.id+m.id+'.gif" class="image" data-lity><img src="assets/img/medias/chasm'+g.id+m.id+'.gif" /></a>'+text+guide+checkbox);


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

        if(userMarkers.indexOf('chasm'+g.id+m.id) >= 0 && !finished)
          marker.setOpacity(.5);

        if(params['debug'] && g.id !== 'region')
          debugMarkers.push({name: g.id+m.id, marker: marker, coords: m.coords, icon: icon});

        allMarkers[g.id+m.id] = marker;

      });

    });

    $('#total').text(total);

  }




  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([0,0]), unproject([4096, 4096])));



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