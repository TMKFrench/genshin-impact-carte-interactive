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
  var statueIcon = L.icon({ iconUrl: 'assets/img/statue.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var teleporterIcon = L.icon({ iconUrl: 'assets/img/teleporter.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var anemoculusIcon = L.icon({ iconUrl: 'assets/img/anemoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var geoculusIcon = L.icon({ iconUrl: 'assets/img/geoculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var electroculusIcon = L.icon({ iconUrl: 'assets/img/electroculus.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var panoramaIcon = L.icon({ iconUrl: 'assets/img/panorama.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var mondstadtshrineIcon = L.icon({ iconUrl: 'assets/img/mondstadt-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var liyueshrineIcon = L.icon({ iconUrl: 'assets/img/liyue-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
  var inazumashrineIcon = L.icon({ iconUrl: 'assets/img/inazuma-shrine.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -32] });
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
  var testIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [0,-41] });
  var ironIcon = L.icon({ iconUrl: 'assets/img/iron.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var tinplateIcon = L.icon({ iconUrl: 'assets/img/tinplate.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var electrocristalIcon = L.icon({ iconUrl: 'assets/img/electrocristal.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var fragrantCedarIcon = L.icon({ iconUrl: 'assets/img/fragrantcedar.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var waveriderIcon = L.icon({ iconUrl: 'assets/img/waverider.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var bookIcon = L.icon({ iconUrl: 'assets/img/book.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var fishinghookIcon = L.icon({ iconUrl: 'assets/img/fishinghook.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var inazumachestIcon = L.icon({ iconUrl: 'assets/img/inazuma-chest.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var ghostIcon = L.icon({ iconUrl: 'assets/img/ghost.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var electroseelieIcon = L.icon({ iconUrl: 'assets/img/electroseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });

  var sentoutrialIcon = L.icon({ iconUrl: 'assets/img/electroseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var lightguidingceremonyIcon = L.icon({ iconUrl: 'assets/img/electroseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var statuevassalsIcon = L.icon({ iconUrl: 'assets/img/electroseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });



  // Initialisation de la carte
  var map = new L.Map('map', {
      center: [0,0],
      zoom: 3,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'statue', 'teleporter', 'anemoculus', 'geoculus', 'electroculus', 'panorama', 'mondstadtshrine', 'liyueshrine', 'inazumashrine', 'seelie', 'fireseelie',
    'jueyunchili', 'valberry', 'itswarm', 'overlookingview', 'dungeon', 'region', 'quest', 'crimsonagate', 'tsurumighosts',
    'priestprincessscribe', 'challenge', 'unusualhilichurl', 'glacialsteel', 'futileendeavor', 'prodigalsonreturn', 'statuevassals',
    'lostinthesnow', 'treasureguili', 'boss', 'iron', 'tinplate', 'electrocristal', 'remarkablechest', 'electroseelie', 'lightguidingceremony',
    'fir', 'fragrantcedar', 'bamboo', 'sandbearer', 'pine', 'cuihua', 'birch', 'waverider', 'tokialleytales', 'fishing', 'sentoutrial'
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
var markers = [{id:'statue',group:statueGroup,format:'image',title:'Statue des Sept',icon:statueIcon,checkbox:true,markers: [],},{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'01',coords:[1186,543],format:'todo',},{id:'02',coords:[2744,978],format:'todo',},{id:'03',coords:[2353,1622],format:'todo',},{id:'04',coords:[2418,1817],format:'todo',},{id:'05',coords:[1415,1423],format:'todo',},{id:'06',coords:[1735,1751],format:'todo',},{id:'07',coords:[1150,1571],format:'todo',},{id:'08',coords:[1853,2237],format:'todo',},{id:'09',coords:[1661,2362],format:'todo',},{id:'10',coords:[2089,2837],format:'todo',},],},{id:'electroculus',group:electroculusGroup,format:'image',title:'Électroculus',icon:electroculusIcon,checkbox:true,markers: [],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'01',coords:[1024,1817],video:'pdNNHrJpz8o',},{id:'02',coords:[1118,1735],video:'4yXX10GECzA',},{id:'03',coords:[1202,1754],video:'EPWs0hhjxf8',},{id:'04',coords:[1125,1691],video:'kZ7hyqiI8JA',},{id:'05',coords:[1264,1474],video:'wbKsts9NQL0',},{id:'06',coords:[1319,1440],video:'LogO2ceiU9g',},{id:'07',coords:[2202,1600],video:'doksQOUSrhw',},{id:'08',coords:[2198,1629],video:'J8EFV8cbC_U',},{id:'09',coords:[2269,1643],video:'Vskjx_hR42I',},{id:'10',coords:[2395,1673],video:'WZ46I03nFlY',},{id:'11',coords:[2385,1836],video:'h6nYFV52tqI',},{id:'12',coords:[2492,1851],video:'94mi9rr49B0',},{id:'13',coords:[1507,2522],format:'todo',},{id:'14',coords:[1524,2639],format:'todo',},],},{id:'overlookingview',group:overlookingviewGroup,format:'image',title:'Succès - Splendide vue',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',checkbox:true,markers: [],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'01',coords:[1323,1400],text:'Tuez tous les ennemis en 240 secondes.',video:'M0z6YR_UoJ4',},{id:'02',coords:[1531,1378],text:'Récupérez toutes les particules en 40 secondes',video:'KCPVZITiJTo',},{id:'03',coords:[1462,1435],text:'Tuez tous les ennemis en 150 secondes.',video:'nI8sylnxSgs ',},{id:'04',coords:[1418,1448],text:'Tuez tous les ennemis en 180 secondes.',video:'U2Sh_t4gKUw',},{id:'05',coords:[1386,1462],text:'Récupérez toutes les particules en 90 secondes.',video:'P1QlKiFZymw',},{id:'06',coords:[1390,1500],text:'Détruisez tous les barils en 45 secondes.',video:'R9p5grroW3k',},{id:'07',coords:[1113,1597],text:'Récupérez toutes les particules en 180 secondes.',video:'yNKaYhV0dgM',},{id:'08',coords:[1156,1739],text:'Tuez tous les ennemis en 240 secondes.',video:'vrkBeapwwCM',},{id:'09',coords:[2100,1606],text:'Récupérez toutes les particules en 40 secondes.',video:'K_rPZhmh8tU',},{id:'10',coords:[2205,1580],text:'Récupérez toutes les particules en 60 secondes.',video:'30H3loS8vIs',},{id:'11',coords:[2233,1599],text:'Ramenez les 3 fées environnantes pour accéder au défi puis tuez tous les ennemis en 120  secondes.',video:'A4wConEEWmo',},{id:'12',coords:[2447,1466],text:'Récupérez toutes les particules en 60 secondes.',video:'UGk9tVZicdY',},{id:'13',coords:[2257,1695],text:'Tuez tous les ennemis en 60  secondes.',video:'t8G_dfvDteo',},{id:'14',coords:[2335,1684],text:'Détruisez tous les barils en 60 secondes.',video:'0ZJIOKq6_Fw',},{id:'15',coords:[2305,1755],text:'Récupérez toutes les particules en 75 secondes.',video:'C0dLWjgK6QI',},{id:'16',coords:[2462,1825],text:'Tuez tous les ennemis en 120 secondes',video:'BjV1O984WUw',},{id:'17',coords:[1892,2141],format:'todo',},{id:'18',coords:[1701,2188],format:'todo',},{id:'19',coords:[1533,2192],format:'todo',},{id:'20',coords:[1638,2378],format:'todo',},{id:'21',coords:[1675,2389],format:'todo',},{id:'22',coords:[1510,2580],format:'todo',},{id:'23',coords:[1588,2576],format:'todo',},{id:'24',coords:[1671,1707],text:'Tuez tous les ennemis en 120 secondes.',video:'bBg5-V5cUtM',},],},{id:'boss',group:bossGroup,format:'image',markers: [],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [],},{id:'remarkablechest',group:remarkablechestGroup,format:'image',title:'Coffre étrange',icon:inazumachestIcon,checkbox:true,markers: [],},{id:'electroseelie',group:electroseelieGroup,format:'video',icon:electroseelieIcon,checkbox:true,markers: [{id:'01',coords:[1215,694],video:'l6ZGVOZYju8',},{id:'02',coords:[2726,914],video:'ra7H-3ROh3k',},{id:'03',coords:[1096,1734],video:'1JDWp6wHSdE',},{id:'04',coords:[1143,1778],video:'G-lovdtRsSU ',},{id:'05',coords:[1188,1670],video:'7LNbjhWu3Z0',},{id:'06',coords:[1765,2019],format:'todo',},{id:'07',coords:[2240,1600],video:'GJYvWgCfSIU',},{id:'08',coords:[2282,1647],video:'fuIP7V-oJSg',},{id:'09',coords:[2362,1826],video:'cb6YS73jHFY',},{id:'10',coords:[2473,1924],video:'XQndavL7ru4',},{id:'11',coords:[1689,2277],format:'todo',},{id:'12',coords:[1819,2181],format:'todo',},{id:'13',coords:[1873,2207],format:'todo',},{id:'14',coords:[1917,2330],format:'todo',},{id:'15',coords:[2130,2855],format:'todo',},],},{id:'sentoutrial',group:sentoutrialGroup,format:'video',title:'Épreuves des mille lumières',icon:sentoutrialIcon,checkbox:true,markers: [{id:'01',coords:[1092,1664],format:'todo',},{id:'02',coords:[1311,1521],format:'todo',},{id:'03',coords:[2328,1601],format:'todo',},{id:'04',coords:[2478,1862],format:'todo',},{id:'05',coords:[1891,2274],format:'todo',},{id:'06',coords:[1697,2351],format:'todo',},],},{id:'lightguidingceremony',group:lightguidingceremonyGroup,format:'video',title:'Cérémonies de guidage de la lumière',icon:lightguidingceremonyIcon,checkbox:true,markers: [{id:'01',coords:[1172,1747],format:'todo',},{id:'02',coords:[1186,1488],format:'todo',},{id:'03',coords:[1500,1514],format:'todo',},{id:'04',coords:[2518,1461],format:'todo',},{id:'05',coords:[2533,1475],format:'todo',},{id:'06',coords:[2529,1492],format:'todo',},{id:'07',coords:[2481,1841],format:'todo',},{id:'08',coords:[1895,2137],format:'todo',},{id:'09',coords:[1801,2223],format:'todo',},{id:'10',coords:[1620,2195],format:'todo',},{id:'11',coords:[1676,2529],format:'todo',},],},{id:'statuevassals',group:statuevassalsGroup,format:'image',title:'Statue de vassal',icon:statuevassalsIcon,checkbox:true,markers: [{id:'01',coords:[1714,1765],format:'todo',},],},];



// Création de la carte
  L.tileLayer('assets/img/tiles-trois-royaumes/{z}/{x}/{y}.jpg', {
      attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
      maxZoom: 4,
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

      g.markers.forEach(function(m) {
        var checkbox = '', icon, format, title = '', text = '', guide = '', countdown, timer, finished = false,
            color = '#3388ff', region;

        if ((typeof m.checkbox !== 'undefined' && m.checkbox) || (typeof g.checkbox !== 'undefined' && g.checkbox))
          checkbox = '<label><input type="checkbox" id="user-marker" data-id="' + g.id + m.id + '" /><span>Terminé</span></label>';

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
          marker.bindPopup(title+'<a href="assets/img/medias/'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/'+g.id+m.id+'" /></a>'+text+guide+checkbox);
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox);
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();
        else if(format === 'todo')
          marker.bindPopup('<h4>' + g.id+m.id  + '</h4>'+'<p><em>Information pour ce marqueur prochainement disponible...</em></p>'+checkbox);
        else if(format === 'gif')
          marker.bindPopup(title+'<a href="assets/img/medias/'+g.id+m.id+'.gif" class="image" data-lity><img src="assets/img/medias/'+g.id+m.id+'.gif" /></a>'+text+guide+checkbox);




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

    var zoom = (params.z && ['3', '4'].indexOf(params.z) >= 0) ? params.z : 4;

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
