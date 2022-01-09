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
  var treasureguili01Icon = L.icon({ iconUrl: 'assets/img/treasureguili01.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var treasureguili02Icon = L.icon({ iconUrl: 'assets/img/treasureguili02.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var treasureguili03Icon = L.icon({ iconUrl: 'assets/img/treasureguili03.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var treasureguili04Icon = L.icon({ iconUrl: 'assets/img/treasureguili04.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var bossStormterrorIcon = L.icon({ iconUrl: 'assets/img/bossstormterror.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossAndriusIcon = L.icon({ iconUrl: 'assets/img/bossandrius.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisAnemoIcon = L.icon({ iconUrl: 'assets/img/bosshypostasisanemo.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisElectroIcon = L.icon({ iconUrl: 'assets/img/bosshypostasiselectro.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisGeoIcon = L.icon({ iconUrl: 'assets/img/bosshypostasisgeo.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossOceanidIcon = L.icon({ iconUrl: 'assets/img/bossoceanid.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossPrimoGeovishapIcon = L.icon({ iconUrl: 'assets/img/bossprimogeovishap.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossRegisvineCryoIcon = L.icon({ iconUrl: 'assets/img/bossregisvinecryo.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossRegisvinePyroIcon = L.icon({ iconUrl: 'assets/img/bossregisvinepyro.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossTartagliaIcon = L.icon({ iconUrl: 'assets/img/bosstartaglia.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossAzhdahaIcon = L.icon({ iconUrl: 'assets/img/bossazhdaha.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisCryoIcon = L.icon({ iconUrl: 'assets/img/bosshypostasiscryo.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisPyroIcon = L.icon({ iconUrl: 'assets/img/bosshypostasispyro.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossHypostasisHydroIcon = L.icon({ iconUrl: 'assets/img/bosshypostasishydro.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossPmaIcon = L.icon({ iconUrl: 'assets/img/bosspma.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossMaguuKenkiIcon = L.icon({ iconUrl: 'assets/img/bossmaguukenki.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossSignoraIcon = L.icon({ iconUrl: 'assets/img/bosssignora.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossThunderManifestationIcon = L.icon({ iconUrl: 'assets/img/bossthundermanifestation.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
  var bossGoldenWolfLordIcon = L.icon({ iconUrl: 'assets/img/bossgoldenwolflord.png', iconSize: [40,40], iconAnchor: [20,20], popupAnchor: [0,-20] });
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
  var blueghostIcon = L.icon({ iconUrl: 'assets/img/blueghost.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var greenghostIcon = L.icon({ iconUrl: 'assets/img/greenghost.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var orangeghostIcon = L.icon({ iconUrl: 'assets/img/orangeghost.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var purpleghostIcon = L.icon({ iconUrl: 'assets/img/purpleghost.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var electroseelieIcon = L.icon({ iconUrl: 'assets/img/electroseelie.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var sigilkeyoneIcon = L.icon({ iconUrl: 'assets/img/sigilkeyone.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigilkeytwoIcon = L.icon({ iconUrl: 'assets/img/sigilkeytwo.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigilkeythreeIcon = L.icon({ iconUrl: 'assets/img/sigilkeythree.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigilkeyfourIcon = L.icon({ iconUrl: 'assets/img/sigilkeyfour.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigilkeyfiveIcon = L.icon({ iconUrl: 'assets/img/sigilkeyfive.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigillockoneIcon = L.icon({ iconUrl: 'assets/img/sigillockone.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigillocktwoIcon = L.icon({ iconUrl: 'assets/img/sigillocktwo.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigillockthreeIcon = L.icon({ iconUrl: 'assets/img/sigillockthree.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigillockfourIcon = L.icon({ iconUrl: 'assets/img/sigillockfour.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });
  var sigillockfiveIcon = L.icon({ iconUrl: 'assets/img/sigillockfive.png', iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16] });


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
    'sigil'
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
var markers = [{id:'statue',group:statueGroup,format:'image',title:'Statue des Sept',icon:statueIcon,checkbox:true,markers: [],},{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'01',coords:[640,2519],},{id:'02',coords:[470,2163],},{id:'03',coords:[922,1911],},{id:'04',coords:[1202,1709],},{id:'05',coords:[1326,1575],},{id:'06',coords:[1189,1483],},{id:'07',coords:[1417,1422],},{id:'08',coords:[1763,1631],},{id:'09',coords:[1669,1682],},{id:'10',coords:[1764,1771],},{id:'11',coords:[1946,1807],},{id:'12',coords:[1673,1951],},{id:'13',coords:[2417,1813],},{id:'14',coords:[2349,1627],},{id:'15',coords:[2184,1578],},{id:'16',coords:[2448,1474],},{id:'17',coords:[2018,2152],},{id:'18',coords:[1852,2231],},{id:'19',coords:[1596,2168],},{id:'20',coords:[1659,2385],},{id:'21',coords:[1570,2584],},{id:'22',coords:[1187,540],format:'todo',},{id:'23',coords:[2737,975],format:'todo',},{id:'24',coords:[2091,2840],format:'todo',},],},{id:'anemoculus',group:anemoculusGroup,format:'image',icon:anemoculusIcon,checkbox:true,markers: [],},{id:'geoculus',group:geoculusGroup,format:'image',icon:geoculusIcon,checkbox:true,markers: [],},{id:'electroculus',group:electroculusGroup,format:'image',title:'Électroculus',icon:electroculusIcon,checkbox:true,markers: [],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [],},{id:'mondstadtshrine',group:mondstadtshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Mondstadt.',icon:mondstadtshrineIcon,checkbox:true,markers: [],},{id:'liyueshrine',group:liyueshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Liyue.',icon:liyueshrineIcon,checkbox:true,markers: [],},{id:'inazumashrine',group:inazumashrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs d\'Inazuma.',icon:inazumashrineIcon,checkbox:true,markers: [],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'01',coords:[464,2286],video:'uNeKBKcA08A',},{id:'02',coords:[666,2046],video:'hYTFpCS8sO4',},{id:'03',coords:[711,1971],video:'HtVX5269m80',},{id:'04',coords:[415,2145],video:'24qpFC_Eu3w',},{id:'05',coords:[1170,1685],video:'qoo_zjsCjlE',},{id:'06',coords:[1164,1542],video:'mdsJ5eUc-l0',},{id:'07',coords:[1264,1467],video:'LTpnHbU-VOs',},{id:'08',coords:[1251,1489],video:'fC8OUsi3HEk',},{id:'09',coords:[1370,1500],video:'hAV9AVHnUdY',},{id:'10',coords:[1413,1376],video:'omWCYMCgJkQ',},{id:'11',coords:[1388,1401],video:'DXDzNniOa1w',},],},{id:'fireseelie',group:fireseelieGroup,format:'video',icon:fireseelieIcon,checkbox:true,markers: [],},{id:'overlookingview',group:overlookingviewGroup,format:'image',title:'Succès - Splendide vue',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',checkbox:true,markers: [],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [],},{id:'crimsonagate',group:crimsonagateGroup,format:'image',icon:crimsonagateIcon,checkbox:true,markers: [],},{id:'priestprincessscribe',group:priestprincessscribeGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',checkbox:true,markers: [],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'01',coords:[550,2430],text:'Collectez toutes les particules en 40&nbsp;secondes.',video:'no2lgJZNtNQ',},{id:'02',coords:[421,2232],text:'Détruisez tous les barils en 50&nbsp;secondes.',video:'lsY-wclpTzo',},{id:'03',coords:[541,2147],text:'Collectez toutes les particules en 60&nbsp;secondes.',video:'tC3A7qbjwng',},{id:'04',coords:[667,2057],text:'Collectez toutes les particules en 40&nbsp;secondes.',video:'53J3IXx2mmI',},{id:'05',coords:[1120,1717],text:'Collectez toutes les particules en 40 secondes.',video:'SGNlzdW_aS0',},{id:'06',coords:[1580,1543],format:'todo',},{id:'07',coords:[1731,1747],format:'todo',},{id:'08',coords:[1694,1856],format:'todo',},{id:'09',coords:[1947,1771],format:'todo',},{id:'10',coords:[1957,1672],format:'todo',},{id:'11',coords:[2333,1496],format:'todo',},{id:'12',coords:[2365,1757],format:'todo',},{id:'13',coords:[2309,1852],format:'todo',},{id:'14',coords:[2027,2067],format:'todo',},{id:'15',coords:[1944,2167],format:'todo',},{id:'16',coords:[1851,2194],format:'todo',},{id:'17',coords:[1683,2185],format:'todo',},{id:'18',coords:[1669,2257],format:'todo',},],},{id:'unusualhilichurl',group:unusualhilichurlGroup,format:'simple',title:'Brutocollinus étranges',guide:'https://gaming.lebusmagique.fr/genshin-impact/succes/au-defi/#bruto-etrange',icon:unusualhilichurlIcon,markers: [],},{id:'glacialsteel',group:glacialsteelGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',icon:glacialsteelIcon,checkbox:true,markers: [],},{id:'futileendeavor',group:futileendeavorGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/futile-expedition/',icon:futileendeavorIcon,checkbox:true,markers: [],},{id:'prodigalsonreturn',group:prodigalsonreturnGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-retour-du-fils-prodigue/',icon:prodigalsonreturnIcon,checkbox:true,markers: [],},{id:'lostinthesnow',group:lostinthesnowGroup,format:'popup',title:'Royaumes sous les neiges',text:'Journal d’inspection ancien',icon:lostinthesnowIcon,checkbox:true,markers: [],},{id:'treasureguili',group:treasureguiliGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-tresor-des-plaines-guili/',icon:treasureguili01Icon,checkbox:true,markers: [],},{id:'boss',group:bossGroup,format:'image',markers: [],},{id:'iron',group:ironGroup,format:'popup',title:'Fer',icon:ironIcon,checkbox:true,markers: [],},{id:'tinplate',group:tinplateGroup,format:'popup',title:'Fer blanc',icon:tinplateIcon,checkbox:true,markers: [],},{id:'electrocristal',group:electrocristalGroup,format:'popup',title:'Électrocristal',icon:electrocristalIcon,checkbox:true,markers: [],},{id:'fragrantcedar',group:fragrantcedarGroup,format:'popup',icon:fragrantCedarIcon,markers: [],},{id:'waverider',group:waveriderGroup,format:'image',title:'Téléporteur de barge',icon:waveriderIcon,checkbox:true,markers: [],},{id:'tokialleytales',group:tokialleytalesGroup,format:'image',icon:bookIcon,checkbox:true,markers: [],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [],},{id:'remarkablechest',group:remarkablechestGroup,format:'image',title:'Coffre étrange',icon:inazumachestIcon,checkbox:true,markers: [],},{id:'tsurumighosts',group:tsurumighostsGroup,format:'image',title:'Les fantômes de Tsurumi',icon:ghostIcon,checkbox:true,markers: [],},{id:'electroseelie',group:electroseelieGroup,format:'video',icon:electroseelieIcon,checkbox:true,markers: [],},{id:'sigil',group:sigilGroup,format:'image',icon:sigilkeyoneIcon,checkbox:true,markers: [{id:'key01',coords:[1198,1767],title:'Sigil-clé 1',format:'todo',},{id:'key02',coords:[1083,1685],title:'Sigil-clé 1',format:'todo',},{id:'key03',coords:[1106,1569],title:'Sigil-clé 1',format:'todo',},{id:'key04',coords:[1356,1417],title:'Sigil-clé 1',format:'todo',},{id:'key05',coords:[1420,1366],title:'Sigil-clé 1',format:'todo',},{id:'key06',coords:[1515,1534],title:'Sigil-clé 1',format:'todo',},{id:'key07',coords:[1747,1710],title:'Sigil-clé 1',format:'todo',},{id:'key08',coords:[1760,1881],title:'Sigil-clé 1',format:'todo',},{id:'key09',coords:[1794,1833],title:'Sigil-clé 1',format:'todo',},{id:'key10',coords:[1967,1855],title:'Sigil-clé 1',format:'todo',},{id:'key11',coords:[2224,1685],title:'Sigil-clé 1',format:'todo',},{id:'key12',coords:[2567,1471],title:'Sigil-clé 1',format:'todo',},{id:'key13',coords:[2364,1869],title:'Sigil-clé 1',format:'todo',},{id:'key14',coords:[1904,2207],title:'Sigil-clé 1',format:'todo',},{id:'key15',coords:[1680,2370],title:'Sigil-clé 1',format:'todo',},{id:'key16',coords:[1692,2534],title:'Sigil-clé 1',format:'todo',},{id:'key17',coords:[1399,1447],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key18',coords:[1422,1373],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key19',coords:[1749,1606],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key20',coords:[1872,1851],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key21',coords:[2374,1503],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key22',coords:[1702,2152],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key23',coords:[1749,2262],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key24',coords:[2221,2787],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key25',coords:[2838,770],title:'Sigil-clé 2',format:'todo',icon:sigilkeytwoIcon,},{id:'key26',coords:[1389,1365],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key27',coords:[1559,1417],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key28',coords:[1610,1800],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key29',coords:[2340,1577],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key30',coords:[1534,2179],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key31',coords:[2267,2888],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key32',coords:[1230,736],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key33',coords:[2023,1092],title:'Sigil-clé 3',format:'todo',icon:sigilkeythreeIcon,},{id:'key34',coords:[1254,693],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key35',coords:[1175,1537],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key36',coords:[1526,1330],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key37',coords:[1959,1795],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key38',coords:[1596,2227],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key39',coords:[1592,2271],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key40',coords:[1833,2251],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key41',coords:[2047,2073],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key42',coords:[1614,2573],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key43',coords:[2267,1640],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key44',coords:[2424,1859],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key45',coords:[2506,1850],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key46',coords:[2470,1504],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key47',coords:[1909,1090],title:'Sigil-clé 4',format:'todo',icon:sigilkeyfourIcon,},{id:'key48',coords:[1400,1448],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key49',coords:[1414,1529],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key50',coords:[1565,1488],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key51',coords:[1807,1715],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key52',coords:[1686,1886],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key53',coords:[1847,2170],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key54',coords:[1617,2404],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key55',coords:[1898,2342],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key56',coords:[2266,1711],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key57',coords:[2357,1811],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key58',coords:[2347,1855],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},{id:'key59',coords:[2681,872],title:'Sigil-clé 5',format:'todo',icon:sigilkeyfiveIcon,},],},];



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
