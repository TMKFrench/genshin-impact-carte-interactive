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
  var testIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [0,-41] });
  var ironIcon = L.icon({ iconUrl: 'assets/img/iron.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var tinplateIcon = L.icon({ iconUrl: 'assets/img/tinplate.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var electrocristalIcon = L.icon({ iconUrl: 'assets/img/electrocristal.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var fragrantCedarIcon = L.icon({ iconUrl: 'assets/img/fragrantcedar.png', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-15] });
  var waveriderIcon = L.icon({ iconUrl: 'assets/img/waverider.png?v2', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var bookIcon = L.icon({ iconUrl: 'assets/img/book.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });
  var fishinghookIcon = L.icon({ iconUrl: 'assets/img/fishinghook.png', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32] });


  // Initialisation de la carte
  var map = new L.Map('map', {
      center: [0,0],
      zoom: 3,
      zoomControl: false
  });



  // Générer les layers
  var groups = [
    'statue', 'teleporter', 'anemoculus', 'geoculus', 'electroculus', 'panorama', 'mondstadtshrine', 'liyueshrine', 'inazumashrine', 'seelie', 'fireseelie',
    'jueyunchili', 'valberry', 'itswarm', 'overlookingview', 'dungeon', 'region', 'quest', 'crimsonagate',
    'priestprincessscribe', 'challenge', 'unusualhilichurl', 'glacialsteel', 'futileendeavor', 'prodigalsonreturn',
    'lostinthesnow', 'treasureguili', 'boss', 'iron', 'tinplate', 'electrocristal',
    'fir', 'fragrantcedar', 'bamboo', 'sandbearer', 'pine', 'cuihua', 'birch', 'waverider', 'tokialleytales', 'fishing'
  ];
  groups.forEach(function(e) {
    window[e+'Group'] = L.layerGroup();
  });



  // Liste des marqueurs
  var markers = [{id:'statue',group:statueGroup,format:'image',title:'Statue des Sept',icon:statueIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7472,4604],},{id:'mondstadt02',coords:[7409,5250],},{id:'mondstadt03',coords:[6721,5317],},{id:'mondstadt04',coords:[5975,4532],},{id:'liyue01',coords:[5892,5895],},{id:'liyue02',coords:[5895,7173],},{id:'liyue03',coords:[4672,6404],},{id:'liyue04',coords:[5158,7515],},{id:'liyue05',coords:[6401,6541],},{id:'dragonspine01',coords:[7168,5991],},{id:'inazuma01',coords:[10045,9599],},{id:'inazuma02',coords:[9383,10701],},{id:'inazuma03',coords:[8362,10870],},{id:'inazuma04',coords:[6721,11006],},{id:'inazuma05',coords:[10177,11602],},],},{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7774,4336],},{id:'mondstadt02',coords:[7786,4492],},{id:'mondstadt03',coords:[7271,4971],},{id:'mondstadt04',coords:[7020,4892],},{id:'mondstadt05',coords:[6593,4599],},{id:'mondstadt06',coords:[6235,4378],},{id:'mondstadt07',coords:[6028,4517],},{id:'mondstadt08',coords:[5798,4594],},{id:'mondstadt09',coords:[6107,4795],},{id:'mondstadt10',coords:[6352,5308],},{id:'mondstadt11',coords:[6668,4990],},{id:'mondstadt12',coords:[6524,4885],},{id:'mondstadt13',coords:[5876,4248],},{id:'mondstadt14',coords:[7016,5175],},{id:'mondstadt15',coords:[7060,5373],},{id:'mondstadt16',coords:[7419,4453],},{id:'mondstadt17',coords:[7680,5198],},{id:'mondstadt18',coords:[7585,5707],},{id:'mondstadt19',coords:[8148,5728],},{id:'mondstadt20',coords:[7651,4872],},{id:'mondstadt21',coords:[6893,4908],format:'video',video:'9aaU23xfqGA',},{id:'liyue01',coords:[5943,5599],},{id:'liyue02',coords:[5816,6292],},{id:'liyue03',coords:[5346,5375],},{id:'liyue04',coords:[4345,6453],},{id:'liyue05',coords:[4540,6127],},{id:'liyue06',coords:[6335,6200],},{id:'liyue07',coords:[5308,6928],},{id:'liyue08',coords:[4997,7030],},{id:'liyue09',coords:[4880,7233],},{id:'liyue10',coords:[6119,7278],},{id:'liyue11',coords:[6809,7255],},{id:'liyue12',coords:[4714,6331],},{id:'liyue13',coords:[4754,6652],},{id:'liyue14',coords:[5107,7729],},{id:'liyue15',coords:[5020,8160],},{id:'liyue16',coords:[5433,7936],},{id:'liyue17',coords:[5315,7749],},{id:'liyue18',coords:[5621,7789],},{id:'liyue19',coords:[6090,7030],},{id:'liyue20',coords:[6198,6504],},{id:'liyue21',coords:[6619,6726],},{id:'liyue22',coords:[5656,6940],},{id:'liyue23',coords:[5594,5407],},{id:'liyue24',coords:[5856,7418],},{id:'liyue25',coords:[5804,6623],},{id:'liyue26',coords:[5249,6589],},{id:'liyue27',coords:[4966,6547],},{id:'liyue28',coords:[5874,7827],},{id:'liyue29',coords:[5777,7680],},{id:'liyue32',coords:[5657,5722],},{id:'liyue31',coords:[5301,5639],},{id:'liyue32',coords:[4872,5593],},{id:'liyue33',coords:[5100,6223],},{id:'liyue34',coords:[4700,6136],},{id:'liyue35',coords:[4478,6769],},{id:'liyue36',coords:[5423,6104],},{id:'liyue37',coords:[5029,5986],},{id:'liyue38',coords:[6301,5988],},{id:'liyue39',coords:[5852,5493],},{id:'liyue40',coords:[5534,7448],},{id:'dragonspine01',coords:[7272,5581],},{id:'dragonspine02',coords:[6720,5715],},{id:'dragonspine03',coords:[7155,5838],},{id:'dragonspine04',coords:[6991,5904],},{id:'dragonspine05',coords:[6700,5939],},{id:'dragonspine06',coords:[6551,6017],},{id:'dragonspine07',coords:[6937,6138],},{id:'dragonspine08',coords:[7157,6148],},{id:'dragonspine09',coords:[6848,6251],},{id:'dragonspine10',coords:[6632,6316],},{id:'dragonspine11',coords:[7151,6318],},{id:'dragonspine12',coords:[7478,6339],},{id:'inazuma01',coords:[9777,9698],},{id:'inazuma02',coords:[9951,9718],},{id:'inazuma03',coords:[10180,9810],},{id:'inazuma04',coords:[10267,9919],},{id:'inazuma05',coords:[10363,10171],},{id:'inazuma06',coords:[10543,10220],},{id:'inazuma07',coords:[10633,10383],},{id:'inazuma08',coords:[10571,9969],},{id:'inazuma09',coords:[10726,9752],},{id:'inazuma10',coords:[10528,9670],},{id:'inazuma11',coords:[10359,9564],},{id:'inazuma12',coords:[10268,8934],},{id:'inazuma13',coords:[8881,10576],},{id:'inazuma14',coords:[8682,10711],},{id:'inazuma15',coords:[8550,11089],},{id:'inazuma16',coords:[9381,10329],},{id:'inazuma17',coords:[8342,10656],},{id:'inazuma18',coords:[9300,11058],},{id:'inazuma19',coords:[8540,11298],},{id:'inazuma20',coords:[8102,10741],},{id:'inazuma21',coords:[9542,10721],},{id:'inazuma22',coords:[9170,10788],},{id:'inazuma23',coords:[9433,10821],},{id:'inazuma24',coords:[9620,10923],},{id:'inazuma25',coords:[10513,9341],},{id:'inazuma26',coords:[9582,10484],},{id:'inazuma27',coords:[6910,10735],},{id:'inazuma28',coords:[6903,10970],},{id:'inazuma29',coords:[7462,10944],},{id:'inazuma30',coords:[7204,11119],},{id:'inazuma31',coords:[6900,11167],},{id:'inazuma32',coords:[9844,11860],},{id:'inazuma33',coords:[10334,11420],},{id:'inazuma35',coords:[9823,11458],},{id:'inazuma36',coords:[10034,11561],},{id:'inazuma37',coords:[10624,11747],},{id:'inazuma38',coords:[10398,11966],},{id:'inazuma39',coords:[10312,11738],},{id:'inazuma40',coords:[10589,11453],},],},{id:'anemoculus',group:anemoculusGroup,format:'image',icon:anemoculusIcon,checkbox:true,markers: [{id:'01',coords:[7417,5094],},{id:'02',coords:[7416,5204],},{id:'03',coords:[6563,4819],format:'video',video:'6_6zJaa7QBs',},{id:'04',coords:[6469,4776],format:'video',video:'x5FvBXcp3DQ',},{id:'05',coords:[7568,5539],},{id:'06',coords:[7262,5436],},{id:'07',coords:[6687,5170],format:'video',video:'ZAL2fY71RxM',},{id:'08',coords:[6548,5391],},{id:'09',coords:[7270,5480],format:'video',video:'JFUIB4B-p0M',},{id:'10',coords:[7707,4931],},{id:'11',coords:[7896,4844],},{id:'12',coords:[7781,4673],},{id:'13',coords:[7407,4863],},{id:'14',coords:[6648,5544],format:'video',video:'Xzp2unJgKhk',},{id:'15',coords:[8435,4534],format:'video',video:'l7hTqD1sKec',},{id:'16',coords:[7255,4281],},{id:'17',coords:[7344,4405],format:'video',video:'e2OmKND20Hs',},{id:'18',coords:[7738,4359],},{id:'19',coords:[7941,4208],},{id:'20',coords:[6824,4514],format:'video',video:'OhOu0m-Ts9s',},{id:'21',coords:[7327,5607],},{id:'22',coords:[7248,5229],},{id:'23',coords:[7374,5337],format:'video',video:'vLAplVUXMIA',},{id:'24',coords:[7405,5279],format:'video',video:'HVdPVfN3r-8',},{id:'25',coords:[6500,4638],},{id:'26',coords:[6575,4687],},{id:'27',coords:[6588,4628],text:'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',},{id:'28',coords:[7497,5306],},{id:'29',coords:[7545,5155],},{id:'30',coords:[7532,5641],text:'Utilisez les trois esprits du vent pour faire apparaître une colonne d\'air et accéder à cet anémoculus.',},{id:'31',coords:[7714,5794],text:'Vous devez terminer le succès <b>La meilleure de toutes les épées</b> pour accéder à cet anémoculus.',},{id:'32',coords:[7598,5954],},{id:'33',coords:[7839,5840],format:'video',video:'sWrcwJLE4r4',},{id:'34',coords:[7749,5685],},{id:'35',coords:[8055,5679],},{id:'36',coords:[8812,5528],format:'video',video:'qxncclUsFt0',},{id:'37',coords:[6891,5073],format:'video',video:'hEA_A5KRYTU',},{id:'38',coords:[7176,5404],},{id:'39',coords:[7094,5239],},{id:'40',coords:[6985,5246],format:'video',video:'EpnPeTBGwFs',},{id:'41',coords:[6839,5318],format:'video',video:'PWqxlUhudc4',},{id:'42',coords:[6873,4569],format:'video',video:'RCrg2TOUxhI',},{id:'43',coords:[7513,5439],format:'video',video:'h2xHNcGpJe4',},{id:'44',coords:[6425,5483],format:'video',video:'D2OlfK1CMRo',},{id:'45',coords:[6567,4980],},{id:'46',coords:[6608,5084],text:'Détruisez les ronces avec une attaque Pyro et grimpez sur le pilier.',},{id:'47',coords:[6638,4527],},{id:'48',coords:[6529,4537],},{id:'49',coords:[6524,4476],text:'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',},{id:'50',coords:[6203,4854],},{id:'51',coords:[6120,4984],},{id:'52',coords:[6018,4510],},{id:'53',coords:[6165,4345],},{id:'54',coords:[6053,4310],},{id:'55',coords:[5848,4292],},{id:'56',coords:[5753,4604],},{id:'57',coords:[5875,4694],},{id:'58',coords:[5815,4570],format:'video',video:'eZTB79akfAc',},{id:'59',coords:[5975,4418],},{id:'60',coords:[5911,4463],},{id:'61',coords:[5962,4484],},{id:'62',coords:[6179,4235],format:'video',video:'SZ0-4fZBFx8',},{id:'63',coords:[6333,4512],format:'video',video:'lrokJSPyY2o',},],},{id:'geoculus',group:geoculusGroup,format:'image',icon:geoculusIcon,checkbox:true,markers: [{id:'001',coords:[4492,6227],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'002',coords:[4564,5931],},{id:'003',coords:[4846,5944],},{id:'004',coords:[5604,5378],},{id:'005',coords:[5673,5337],},{id:'006',coords:[5525,5225],},{id:'007',coords:[5562,5449],},{id:'008',coords:[5455,5396],},{id:'009',coords:[5427,5317],},{id:'010',coords:[5274,6540],},{id:'011',coords:[4970,6602],},{id:'012',coords:[5066,6523],},{id:'013',coords:[4485,6441],},{id:'014',coords:[6166,7229],},{id:'015',coords:[5054,7710],},{id:'016',coords:[4861,7682],},{id:'017',coords:[5328,6767],},{id:'018',coords:[6362,7797],format:'video',video:'NPFJ3s2DhZo',},{id:'019',coords:[5686,5690],},{id:'020',coords:[5559,5654],},{id:'021',coords:[5250,5556],},{id:'022',coords:[4751,6544],},{id:'023',coords:[4845,5724],},{id:'024',coords:[4898,5774],},{id:'025',coords:[6713,7291],},{id:'026',coords:[7160,7378],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'027',coords:[6892,7509],},{id:'028',coords:[7042,7274],},{id:'029',coords:[6909,6767],},{id:'030',coords:[5675,5758],},{id:'031',coords:[5695,5864],format:'video',video:'9nXo8Xe8cGw',},{id:'032',coords:[5776,5622],},{id:'033',coords:[5499,5810],},{id:'034',coords:[5269,5425],},{id:'035',coords:[5377,5466],},{id:'036',coords:[4904,6215],},{id:'037',coords:[4821,6179],},{id:'038',coords:[4849,6438],},{id:'039',coords:[4835,6422],},{id:'040',coords:[4609,6280],},{id:'041',coords:[4400,6209],},{id:'042',coords:[4296,6390],},{id:'043',coords:[4347,6493],},{id:'044',coords:[4288,6509],},{id:'045',coords:[4455,6447],format:'video',video:'THhpu38aWFw',},{id:'046',coords:[6419,6571],},{id:'047',coords:[6645,6548],},{id:'048',coords:[6595,6681],},{id:'049',coords:[6568,6704],},{id:'050',coords:[6117,6511],},{id:'051',coords:[6071,6626],},{id:'052',coords:[6247,6903],},{id:'053',coords:[5947,5587],},{id:'054',coords:[5948,5889],},{id:'055',coords:[5805,6271],},{id:'056',coords:[5774,6264],},{id:'057',coords:[5868,6339],},{id:'058',coords:[5917,7140],},{id:'059',coords:[5928,6835],},{id:'060',coords:[6003,6927],},{id:'061',coords:[5677,6889],},{id:'062',coords:[5353,5658],},{id:'063',coords:[5390,5632],},{id:'064',coords:[5790,5931],},{id:'065',coords:[5981,6219],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'066',coords:[5517,5715],},{id:'067',coords:[5714,6100],},{id:'068',coords:[6278,5944],},{id:'069',coords:[6285,7127],format:'video',video:'kA5Anc17mRw',},{id:'070',coords:[5237,6016],},{id:'071',coords:[5114,5753],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'072',coords:[5359,8009],},{id:'073',coords:[5447,7755],},{id:'074',coords:[5494,7599],format:'video',video:'Tmkw4w__EjI',},{id:'075',coords:[5514,7689],format:'video',video:'PXfpJwdAn9U',},{id:'076',coords:[5263,7667],},{id:'077',coords:[5706,5484],},{id:'078',coords:[4886,6514],},{id:'079',coords:[4534,6283],format:'video',video:'5GLMu91EMJ4',},{id:'080',coords:[4386,6424],},{id:'081',coords:[5834,5795],text:'Utilisez la compétence du Voyageur Géo pour atteindre ce Géoculus.',},{id:'082',coords:[6379,6217],},{id:'083',coords:[6430,6429],},{id:'084',coords:[5424,7063],},{id:'085',coords:[6595,6490],},{id:'086',coords:[4528,6191],},{id:'087',coords:[5590,6253],},{id:'088',coords:[5105,7326],},{id:'089',coords:[6229,6347],},{id:'090',coords:[5401,5004],text:'Terminez la quête \"Le Secret de Chi\" pour accéder à ce Géoculus.<br />Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/secret-de-chi/',},{id:'091',coords:[5296,5214],},{id:'092',coords:[5310,5279],text:'Entrez dans la petite grotte pour y trouver ce Géoculus.',},{id:'093',coords:[5626,5490],},{id:'094',coords:[5770,5731],},{id:'095',coords:[5183,5817],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'096',coords:[4493,6058],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'097',coords:[4704,6875],},{id:'098',coords:[4710,7011],text:'En haut de la tour, à l\'extérieur.',},{id:'099',coords:[4898,7412],},{id:'100',coords:[5000,7502],},{id:'101',coords:[4866,7816],},{id:'102',coords:[4873,8044],},{id:'103',coords:[5205,8008],},{id:'104',coords:[5549,7576],text:'Utilisez la compétence Géo du voyageur sur la plaque, pour faire apparaître des plateformes. Utilisez sa compétence, une seconde fois, sur la dernière plateforme pour atteindre ce Géoculus.',},{id:'105',coords:[5191,7338],text:'Après avoir fait descendre le niveau de l\'eau en activant les braséros et l\'intérupteur Géo, ramenez les fées (deux dans le bâtiment à l\'est et une dans le bâtiment ouest après avoir terminé le défi) jusqu\'à leur cour pour faire disparaître le bouclier. Ouvrez le coffre luxueux pour faire apparaître un vent ascendant et récupérer ce Géoculus.',},{id:'106',coords:[5250,7324],},{id:'107',coords:[4713,6331],text:'Ce Géoculus est accessible avec le succès \"Splendide vue\". Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',},{id:'108',coords:[4924,6426],text:'Accessible en résolvant l\'énigme pour déverrouiller l\'accès au Manoir Taishen.',},{id:'109',coords:[4942,6145],title:'Géoculus 109',},{id:'110',coords:[4980,5563],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'111',coords:[5484,6339],format:'video',video:'nE1ZIKxWsUY',},{id:'112',coords:[5616,6386],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'113',coords:[5464,6426],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'114',coords:[5195,6388],},{id:'115',coords:[5415,6823],},{id:'116',coords:[5663,6713],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'117',coords:[5797,7044],},{id:'118',coords:[5931,6894],text:'Détruisez le rocher qui obstrue les escaliers puis tuer le gardien des ruines qui protège la porte pour accéder au Géoculus.',},{id:'120',coords:[6340,6800],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'121',coords:[6365,6594],},{id:'122',coords:[6380,6322],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'123',coords:[6218,6420],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'124',coords:[6276,6276],},{id:'125',coords:[7267,7546],text:'Escaladez la plus haute montagne et planez en direction du bateau. Le Géoculus se trouve en haut du plus long mât.',},{id:'126',coords:[5636,7925],text:'Dans les buissons aux pieds de la statue se situe l\'entrée d\'une petite grotte où vous récupérez ce Géoculus.',},{id:'127',coords:[5595,7839],text:'Entrez dans le couloir, là où se trouve le flambeau et récupérez le Géoculus au bout de celui-ci.',},{id:'128',coords:[5671,7390],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'129',coords:[5804,7329],text:'Allumez la torche pour faire apparaître un vent ascendant, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'130',coords:[5893,7296],},{id:'131',coords:[5567,6028],text:'Prennez de la hauteur pour passer par dessus le champ de force.',},{id:'132',coords:[5535,5576],},],},{id:'electroculus',group:electroculusGroup,format:'image',title:'Électroculus',icon:electroculusIcon,checkbox:true,markers: [{id:'01',coords:[10289,9938],},{id:'02',coords:[10315,10100],},{id:'03',coords:[10601,9928],},{id:'04',coords:[10787,9732],},{id:'05',coords:[10648,9682],},{id:'06',coords:[10593,9739],},{id:'07',coords:[10532,9655],},{id:'08',coords:[10399,9495],},{id:'09',coords:[10136,9805],},{id:'10',coords:[10753,10518],text:'L\'accès à cet électroculus se fait via une caverne dont l\'entrée se situe au niveau de la mer.',},{id:'11',coords:[10766,9642],},{id:'12',coords:[10504,9798],},{id:'13',coords:[10486,9734],},{id:'14',coords:[8952,10810],},{id:'15',coords:[8927,10707],},{id:'16',coords:[8784,10653],},{id:'17',coords:[8567,11111],text:'L\'entrée de la grotte se situe à la Mine Jakotsu.',},{id:'18',coords:[9416,10434],},{id:'19',coords:[8231,10928],},{id:'20',coords:[8330,10684],text:'Utilisez l\'électrogranum que l\'on aperçoit en haut à droite pour traverser la bulle et atteindre l\'électroculus.',},{id:'21',coords:[10184,10185],},{id:'22',coords:[10033,9679],text:'Près de la statue, grimpez dans l\'arbre et planez jusqu\'au toit. Continuez votre progression jusqu\'à atteindre cet électroculus.',},{id:'23',coords:[10489,9883],text:'Après avoir terminé le rituel de purification, en vous approchant de la grille, vous pouvez utiliser une clé pour l\'ouvrir et accéder à cet électroculus.',},{id:'24',coords:[10226,9999],text:'Après avoir récupéré la clé du puits dans la quête \"Rituel de purification du cerisier sacré\", explorez le puits pour trouver cet électroculus.',},{id:'25',coords:[10207,9991],text:'Après avoir récupéré la clé du puits dans la quête \"Rituel de purification du cerisier sacré\", explorez le puits pour trouver cet électroculus.',},{id:'26',coords:[10080,10417],},{id:'27',coords:[10116,9880],format:'video',video:'7vGX7hQonLM',},{id:'28',coords:[9182,11051],text:'L\'entrée se situe au niveau de la plage un peu plus à l\'ouest.',},{id:'29',coords:[9140,11056],text:'Grimpez sur les rochers à l\'est pour atteindre la cime de l\'arbre, car vous ne pouvez pas l\'escalader.',},{id:'30',coords:[8323,10789],},{id:'31',coords:[8421,11194],format:'video',video:'_a1NntGBqWE',},{id:'32',coords:[8540,11248],},{id:'33',coords:[8146,10778],},{id:'34',coords:[8113,10672],},{id:'35',coords:[9633,10373],},{id:'36',coords:[8492,11301],},{id:'37',coords:[8596,11032],},{id:'38',coords:[9343,10781],},{id:'39',coords:[10618,9819],},{id:'40',coords:[10635,9265],text:'Vous accédez à cette partie de la carte grâce à la quête \"Rituel de purification du cerisier sacré\".',},{id:'41',coords:[10934,9516],},{id:'42',coords:[10538,9708],text:'Vous devez être à la dernière étape de la quête \"Rituel de purification du cerisier sacré\" pour accéder à cet électroculus.',},{id:'43',coords:[8387,11297],},{id:'44',coords:[8469,10853],format:'video',video:'JyFwY6EqErY',},{id:'45',coords:[8178,11032],},{id:'46',coords:[9183,10627],},{id:'47',coords:[9137,10834],},{id:'48',coords:[9123,10928],},{id:'49',coords:[9132,10572],format:'video',video:'blSno1glbxo',},{id:'50',coords:[8337,10965],},{id:'51',coords:[8606,11245],},{id:'52',coords:[9347,10157],format:'video',video:'_0m89hKm8lg',},{id:'53',coords:[10503,9542],},{id:'54',coords:[9601,10499],format:'video',video:'pG7jtnZoJSw',},{id:'56',coords:[9611,9322],text:'Grimpez dans l\'arbre pour l’attraper.',},{id:'57',coords:[7945,10984],},{id:'58',coords:[10401,9708],},{id:'59',coords:[8527,10974],},{id:'60',coords:[8582,10955],},{id:'61',coords:[8583,10807],format:'video',video:'5KLlYWK6JJc',},{id:'62',coords:[10431,9598],},{id:'63',coords:[10309,9660],text:'L\'accès à la grotte ce fait depuis la plage, au nord-ouest.',},{id:'64',coords:[10250,9637],},{id:'65',coords:[10615,9618],},{id:'66',coords:[8249,11195],},{id:'67',coords:[8321,11144],},{id:'68',coords:[7758,10891],format:'video',video:'U9r_fnYLRvo',},{id:'69',coords:[9781,10756],},{id:'70',coords:[9281,10522],},{id:'71',coords:[8571,11188],},{id:'72',coords:[10366,10535],format:'video',video:'LDkSRXvQTKY',},{id:'73',coords:[8700,10925],format:'video',video:'UIaxl3K1hg0',},{id:'74',coords:[8415,11059],format:'video',video:'MdjV8pq1JKo',},{id:'75',coords:[8600,11137],format:'video',video:'LkGerCHBvm0',},{id:'76',coords:[8647,11498],},{id:'77',coords:[9372,11031],text:'Vous devez d\'abord avoir débloqué l\'accès au donjon \"Pavillon Shakkei\", en utilisant le canon sur la petite île au nord-est où se trouve aussi un téléporteur.',},{id:'78',coords:[9367,10971],},{id:'79',coords:[9263,10863],},{id:'80',coords:[9282,10880],},{id:'81',coords:[9299,10862],},{id:'82',coords:[9209,10847],},{id:'83',coords:[9201,10954],},{id:'84',coords:[9303,10771],},{id:'85',coords:[9401,10797],text:'L\'entrée de la grotte se situe au sud-ouest, vous n\'avez qu\'à suivre le chemin jusqu\'à la position de l\'électroculus, puis escalader le mur à votre gauche.',},{id:'86',coords:[9844,10541],format:'video',video:'PSnFAEx4ypI',},{id:'87',coords:[10410,9351],},{id:'88',coords:[10782,9260],text:'Utilisez la lentille de réminiscence pour scanner les petites statuettes et faire apparaître tout ce qui sera nécessaire à récupérer cet électroculus.',format:'video',video:'3mlFNweBKMg',},{id:'89',coords:[10563,10082],format:'video',video:'wuUyOrSLhVE',},{id:'90',coords:[10723,10547],format:'video',video:'dORLKBW872o',},{id:'92',coords:[6967,11152],},{id:'94',coords:[9217,10956],text:'Récupérez 3 clés dans la zone de Tatarasuna pour ouvrir la grille.',format:'video',video:'dLViekHkcNg',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/espadon-de-nagamasa/',},{id:'95',coords:[9147,10965],},{id:'96',coords:[9266,11029],format:'video',video:'NrrAWNQcVV0',},{id:'97',coords:[11100,9375],text:'Nécessite d\'avoir récupéré la lentille de réminiscence dans la quête \"Rituel de purification\" du Cerisier sacré.',format:'video',video:'srcem0oAHp4',},{id:'98',coords:[6690,10713],text:'Utiliser l\'électrogranum proche pour atteindre cet électroculus.',},{id:'99',coords:[9868,11843],},{id:'100',coords:[10067,11658],},{id:'101',coords:[7178,10969],},{id:'102',coords:[7201,10981],text:'Nécessite d\'avoir brisé le sceau du Cœur de Watatsumi dans la quête \"Les profondeurs baignées de lune\". Voir le guide.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/les-profondeurs-baignees-de-lune/',},{id:'91',coords:[6894,10996],},{id:'103',coords:[6814,10963],},{id:'93',coords:[6622,11036],text:'Utilisez l\'Électrogranum pour atteindre cet électroculus.',},{id:'104',coords:[7075,11155],text:'Utilisez l\'Électrogranum pour atteindre cet électroculus.',},{id:'105',coords:[10116,11603],text:'Vous débloquez l\'accès à cet électroculus grâce à la quête \"Reliques de Seirai\". Voir le guide.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/reliques-de-seirai/',},{id:'106',coords:[6946,10826],format:'video',video:'w7D5UDtLAtQ',},{id:'107',coords:[6979,10645],},{id:'108',coords:[7106,10765],},{id:'109',coords:[9861,11608],text:'Cet électroculus se trouve à l\'intérieur de l\'épave du bateau.',},{id:'110',coords:[9911,11602],text:'Cet électroculus se trouve à l\'intérieur de l\'épave du bateau.',},{id:'111',coords:[9881,11599],},{id:'112',coords:[10165,11522],text:'Utilisez l\'électrogranum pour atteindre cet électroculus.',},{id:'113',coords:[7171,11308],},{id:'114',coords:[6958,11230],},{id:'115',coords:[7127,11073],},{id:'116',coords:[6884,11060],text:'Brisez le rocher avec une attaque pyro.',},{id:'117',coords:[7043,10863],text:'Utilisez l\'électrogranum pour passer le champ de force. <b>Requiert le cerisier sacré au niveau 17&nbsp;!</b>',},{id:'118',coords:[10622,11422],},{id:'119',coords:[7295,10704],format:'video',video:'RhfBGuOD2YI',},{id:'120',coords:[7014,11232],format:'video',video:'gXEn_GgtBQ0',},{id:'121',coords:[7003,10763],format:'video',video:'bbLZN4_hL8Q',},{id:'122',coords:[6836,10860],},{id:'123',coords:[6729,10917],},],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7361,4758],title:'Cité du Vent',},{id:'mondstadt02',coords:[7566,4672],title:'Marais des gardiens célestes',},{id:'mondstadt03',coords:[7238,5123],title:'Terres du Vent',},{id:'mondstadt04',coords:[6964,5149],title:'Pays aux fontaines',},{id:'mondstadt05',coords:[6472,5294],title:'Manoir de l\'aube',},{id:'mondstadt06',coords:[6826,4811],title:'Cathédrale, Ordre de Favonius',},{id:'mondstadt07',coords:[6908,4929],title:'Bibliothèque, Ordre de Favonius',},{id:'mondstadt08',coords:[7909,4753],title:'Ancien Temple des Mille vents',},{id:'mondstadt09',coords:[7596,5754],title:'Cimetière d\'épées oublié',},{id:'mondstadt10',coords:[6341,4455],title:'Capitale des vents oubliés',},{id:'liyue01',coords:[5942,7381],title:'Pays des navires et du Commerce',},{id:'liyue02',coords:[5826,7771],title:'Pente Feigun',},{id:'liyue03',coords:[5947,7860],title:'Falaise Chihu',},{id:'liyue04',coords:[5707,7611],title:'Terrasse Yujing',format:'video',video:'YvF2VWtOiAc',},{id:'liyue05',coords:[5887,5985],title:'Poste d\'Observation',},{id:'liyue06',coords:[5911,5640],title:'Marais aux Roseaux',},{id:'liyue07',coords:[5859,6721],title:'Vestiges de Guili',},{id:'liyue08',coords:[5342,5310],title:'Monts Qingce',},{id:'liyue09',coords:[5046,6496],title:'Pics entre les nuages',},{id:'liyue10',coords:[4533,6480],title:'Arbre au clair de lune',},{id:'liyue11',coords:[4680,6322],title:'Forêt de Pierre Embrumée',},{id:'liyue12',coords:[5329,6923],title:'Jardin aux Sanglots',},{id:'liyue13',coords:[6366,7290],title:'Goutte dans l\'océan',},{id:'liyue14',coords:[4960,7854],title:'Derrière le Gouffre',},{id:'liyue15',coords:[4920,7512],title:'Ruines de Dunyu',},{id:'liyue16',coords:[4985,8056],title:'Tour solitaire de Qingxu',},{id:'liyue17',coords:[5367,6751],title:'Neuf Pilliers',},{id:'inazuma01',coords:[8825,10583],title:'Marée basse au milieu des flammes de la guerre',},{id:'inazuma02',coords:[10523,9670],title:'Sanctuaire de Narukami, Mont Yougou',},{id:'inazuma03',coords:[9782,9697],title:'Ritou, île de Narukami',},{id:'inazuma04',coords:[9583,10489],title:'Poste d\'observation des îles de Tatara',},{id:'inazuma05',coords:[10580,9970],title:'La forêt sacrée au clair de lune',},{id:'inazuma06',coords:[10397,10185],title:'Périphérie d\'Inazuma',},{id:'inazuma07',coords:[8504,10755],title:'Vallée de la fosse, île de Yashiori',},{id:'inazuma08',coords:[8304,10932],title:'Surplomb de la tête de serpent',},{id:'inazuma09',coords:[10098,11407],title:'Là où les nuages se rencontrent',},{id:'inazuma10',coords:[10139,11532],title:'Le village de pêcheurs silencieux',},{id:'inazuma11',coords:[9812,11560],title:'Le vaisseau amiral échoué',},{id:'inazuma12',coords:[7168,11124],title:'Le palais nacré',},{id:'inazuma13',coords:[6976,11079],title:'Les profondeurs baignées de lune',},{id:'inazuma14',coords:[6986,11124],title:'Le village du peuple des tréfonds',},],},{id:'mondstadtshrine',group:mondstadtshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Mondstadt.',icon:mondstadtshrineIcon,checkbox:true,markers: [{id:'01',coords:[7338,4289],},{id:'02',coords:[7823,4574],},{id:'03',coords:[7653,5570],},{id:'04',coords:[7424,5782],},{id:'05',coords:[7346,5453],},{id:'06',coords:[7131,5181],},{id:'07',coords:[6778,5164],},{id:'08',coords:[6343,5586],},{id:'09',coords:[6426,5014],},{id:'10',coords:[6672,4412],},],},{id:'liyueshrine',group:liyueshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Liyue.',icon:liyueshrineIcon,checkbox:true,markers: [{id:'01',coords:[6420,6154],},{id:'02',coords:[6064,5643],title:'Liyue Shrine 02',format:'popup',},{id:'03',coords:[5619,5540],title:'Liyue Shrine 03',format:'popup',},{id:'04',coords:[4834,5715],},{id:'05',coords:[4846,5951],},{id:'06',coords:[4725,6106],},{id:'07',coords:[4589,6726],},{id:'08',coords:[5061,7230],title:'Liyue Shrine 08',format:'popup',},{id:'09',coords:[5249,7806],title:'Liyue Shrine 09',format:'popup',},{id:'10',coords:[6826,7779],},],},{id:'inazumashrine',group:inazumashrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs d\'Inazuma.',icon:inazumashrineIcon,checkbox:true,markers: [{id:'01',coords:[9271,11093],},{id:'02',coords:[8509,11076],},{id:'03',coords:[9150,10905],},{id:'04',coords:[8380,11242],},{id:'05',coords:[10659,9980],},{id:'06',coords:[9703,9469],},{id:'07',coords:[7070,10809],},{id:'08',coords:[9939,11536],},],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7696,5193],video:'TZB-uZuNvac',},{id:'mondstadt02',coords:[7447,5535],video:'PVpHrmzbLQE',},{id:'mondstadt03',coords:[6525,4819],video:'eplX5l7ngbE',},{id:'mondstadt04',coords:[7250,5426],video:'8qtVWkC7bO8',},{id:'mondstadt05',coords:[7745,4716],video:'c-X9r7vfjao',},{id:'mondstadt06',coords:[7905,4993],video:'lY2HX7YUUWA',},{id:'mondstadt07',coords:[7615,4860],video:'E8GOZ0nAU0c',},{id:'mondstadt08',coords:[7448,4979],video:'BAs6r_iiUeg',},{id:'mondstadt09',coords:[7549,4550],video:'r7c3zcIY-v4',},{id:'mondstadt010',coords:[7320,5114],video:'f6_G22FH9dw',},{id:'mondstadt11',coords:[7227,4508],video:'p_Xvn5hqACo',},{id:'mondstadt12',coords:[7461,4467],video:'V4O-TFPGxFY',},{id:'mondstadt13',coords:[7872,4269],video:'6dPYfTIguPY',},{id:'mondstadt14',coords:[7446,5292],video:'k82yijP8paU',},{id:'mondstadt15',coords:[7658,5777],video:'MrK1dFs8FtU',},{id:'mondstadt16',coords:[6565,4756],video:'8U-ZwGZ8uLI',},{id:'mondstadt17',coords:[6581,4664],video:'Qa0ORWhLwBg',},{id:'mondstadt18',coords:[7039,5431],video:'QsVK4EJq9_8',},{id:'mondstadt19',coords:[7881,5844],video:'2-fGTrJN85U',},{id:'mondstadt20',coords:[7015,5262],video:'8JwURhH-nCY',},{id:'mondstadt21',coords:[7102,5212],video:'6M3yxiRyEEo',},{id:'mondstadt22',coords:[6682,5433],video:'VHQjkYNj0Oc',},{id:'mondstadt23',coords:[6348,5305],video:'IGFumD1ZSBk',},{id:'mondstadt24',coords:[6662,5046],video:'fjJpahjTLEE',},{id:'mondstadt25',coords:[6323,4796],video:'nhP4xoHcREQ',},{id:'mondstadt26',coords:[6416,4609],video:'0HA_TTPgvvg',},{id:'mondstadt27',coords:[6492,4477],video:'eP1dr5g0Byc',},{id:'mondstadt28',coords:[6591,4495],video:'Xf4qcPL4Sxw',},{id:'mondstadt29',coords:[6205,4546],video:'RkRKS6N4qjw',},{id:'mondstadt30',coords:[5915,4664],video:'CVRj-04WnXo',},{id:'mondstadt31',coords:[6095,4417],video:'E60LRd6cbAc',},{id:'mondstadt32',coords:[7936,4295],video:'m2x9bAzSc8Q',},{id:'mondstadt33',coords:[5798,4539],video:'6appAY6Cyk0',},{id:'mondstadt34',coords:[5855,4337],video:'NLsF0VsYa_4',},{id:'mondstadt35',coords:[5773,4622],video:'ndADX_rsmDc',},{id:'mondstadt36',coords:[5993,4320],video:'3ZaParP1YnY',},{id:'mondstadt37',coords:[6121,4467],video:'0AL-_onB6yA',},{id:'mondstadt38',coords:[7653,6017],video:'MPO_MK96SKc',},{id:'liyue01',coords:[5428,5262],video:'eQrfEC7b6CE',},{id:'liyue02',coords:[5532,5397],video:'FMxuTJn-duM',},{id:'liyue03',coords:[5473,5377],video:'taH6kWMYiss',},{id:'liyue04',coords:[4744,6415],video:'pMddbiH5pF0',},{id:'liyue05',coords:[6598,7357],video:'a1sfn6x21r0',},{id:'liyue06',coords:[7171,7442],video:'yJPHSllYB08',},{id:'liyue07',coords:[7167,7353],video:'RWPImzEXz4M',},{id:'liyue08',coords:[6868,7537],video:'wr8_EANVU44',},{id:'liyue09',coords:[5717,5639],video:'rjJKg2oLHuc',},{id:'liyue10',coords:[4327,6477],video:'jkxNv0CBSqY',},{id:'liyue11',coords:[4430,6565],video:'hc4Xe-oICZc',},{id:'liyue12',coords:[4443,6551],video:'TPh9vWYzNu0',},{id:'liyue13',coords:[5431,6114],video:'SDFp2cMtP4s',},{id:'liyue14',coords:[5343,5681],video:'J3d_cu03bt8',},{id:'liyue15',coords:[5899,6053],video:'SetGcCBsUWY',},{id:'liyue16',coords:[5852,6245],video:'sG7kimUcxcw',},{id:'liyue17',coords:[5389,5758],video:'3rEII58ORQU',},{id:'liyue18',coords:[5921,5916],video:'cKKo4F15mJY',},{id:'liyue19',coords:[4811,6509],video:'EqzAvKr8GKE',},{id:'liyue20',coords:[5505,7901],video:'xsEcIWJrRrA',},{id:'liyue21',coords:[5455,7878],video:'zSbq9UXA_jo',},{id:'liyue22',coords:[5554,7742],video:'Y89ibWX8yVc',},{id:'liyue23',coords:[5259,7721],video:'0lLnN2BW7zU',},{id:'liyue24',coords:[4749,5912],video:'6euAMTzB5vY',},{id:'liyue25',coords:[5759,5449],video:'7gA02wg4lU8',},{id:'liyue26',coords:[6402,6464],video:'L8silP0r_KA',},{id:'liyue27',coords:[4404,6478],video:'MkFyqDMmGzs',},{id:'liyue28',coords:[4607,6547],video:'8tJcCGUNW28',},{id:'liyue29',coords:[4717,6503],video:'IpR4W1TnYxQ',},{id:'liyue30',coords:[5609,7555],video:'6knIjmpAZaU',},{id:'liyue31',coords:[5067,6648],video:'LoqV3GXvTso',},{id:'liyue32',coords:[5247,6540],video:'8b-dkoR90nk',},{id:'liyue33',coords:[5493,6253],video:'Pp9x6mfk9cM',},{id:'liyue34',coords:[5066,7724],video:'ci30v-Ehdos',},{id:'liyue3536',coords:[5008,5721],video:'2cE2w-E3_0A',},{id:'liyue37',coords:[4530,6304],video:'BtBev75avRI',},{id:'liyue38',coords:[4509,6237],video:'nqIe9Ahd8Lo',},{id:'liyue39',coords:[5683,5570],video:'5R_JHFbO_gs',},{id:'liyue40',coords:[6494,6467],video:'YKvzeL0zzwg',},{id:'liyue41',coords:[5627,6581],video:'tS-nrJ2ntEE',},{id:'liyue42',coords:[5651,5735],video:'wft4maj2L7c',},{id:'liyue43',coords:[6034,7293],video:'SxX_jqWzmTk',},{id:'liyue44',coords:[6061,7000],video:'Mf2exHVcN7s',},{id:'liyue45',coords:[5415,5019],video:'ddvpebbfmyA',},{id:'liyue46',coords:[4477,6872],video:'Kg_ftFxI6M8',},{id:'liyue47',coords:[6219,6330],video:'AH88NAC9Ejc',},{id:'liyue48',coords:[6296,6437],video:'aKtEf66nfiU',},{id:'liyue49',coords:[5796,6074],video:'6-6cJTNNabA',},{id:'liyue50',coords:[5622,5358],video:'BH3AVQr2zWg',},{id:'liyue51',coords:[5354,7859],video:'BFTs6XKpE6o',},{id:'liyue52',coords:[5438,8084],video:'mjgjTvhoZXU',},{id:'liyue53',coords:[5308,5428],video:'W8OV-oi07XE',},{id:'liyue54',coords:[5250,6712],video:'90mH0UfrKEY',},{id:'liyue55',coords:[5748,5744],video:'kURwSiYOUYM',},{id:'liyue56',coords:[4907,7436],video:'gcBJw9HA5ms',},{id:'liyue57',coords:[6283,6576],video:'giBeA0r38_E',},{id:'liyue58',coords:[6373,6239],video:'2g9oV0GKbZI',},{id:'liyue59',coords:[6073,5688],video:'BdPIlluGfAo',},{id:'liyue60',coords:[5559,5819],video:'hm8KxuohkII',},{id:'liyue61',coords:[5023,6019],video:'ReCDiaIhk4A',},{id:'liyue62',coords:[5319,6181],video:'IVgw0Cc6EJY',},{id:'liyue63',coords:[4559,6219],video:'C25uSRKHkQc',},{id:'liyue64',coords:[4933,6333],video:'MKSsJwA4ufk',},{id:'liyue65',coords:[5782,6550],video:'7NkRr9_Ywfw',},{id:'liyue66',coords:[5736,6695],video:'FFNg0Bw34gA',},{id:'liyue67',coords:[5819,6960],video:'ttZlSMhPBmc',},{id:'liyue68',coords:[5820,7210],video:'E_OAdyxhzj0',},{id:'liyue69',coords:[5026,8006],video:'l72UAiowmsQ',},{id:'liyue70',coords:[5634,7921],video:'HB6DkdMsbRo',},{id:'liyue71',coords:[5524,7653],video:'vEpDtV50ga4',},{id:'liyue72',coords:[5656,7489],video:'22HuP42ODeg',},{id:'liyue73',coords:[5177,7554],video:'ldXRAPv3WT0',},{id:'liyue74',coords:[5249,7418],video:'sbmT59ngFQw',},{id:'liyue75',coords:[4960,7578],video:'ZIlH24HUoNg',},{id:'liyue76',coords:[4844,8027],video:'F5dL0-m05wg',},],},{id:'fireseelie',group:fireseelieGroup,format:'video',icon:fireseelieIcon,checkbox:true,markers: [{id:'01',coords:[6766,6286],video:'2gjfTudQqfE',},{id:'02',coords:[6922,5679],video:'bDogNZ_QHmI',},{id:'03',coords:[6730,5827],video:'fod0Cqx8pBM',},{id:'04',coords:[7155,6022],video:'VtLkjOZs3BA',},{id:'05',coords:[6820,6225],video:'jj6WOhL6u7E',},{id:'06',coords:[7206,5807],video:'QVoCEF8XoR8',},{id:'07',coords:[7217,5937],video:'rILFfWIEfyk',},{id:'08',coords:[6597,5832],video:'e4QwjqVre-4',},{id:'09',coords:[7453,6267],video:'bmDtGK8sUXg',},{id:'10',coords:[7445,6122],video:'2uKhRyzb9dc',},{id:'11',coords:[7212,6431],video:'wo5BKCJNWF4',},{id:'12',coords:[6597,6136],video:'jRT7pYvpRtw',},{id:'13',coords:[6691,5985],video:'-JX7fyk_gxY',},{id:'14',coords:[6704,5995],video:'XZtRiBFBCsM',},{id:'15',coords:[6736,5981],video:'Rk_ge8GnTUg',},{id:'16',coords:[6487,6258],video:'vIFY0Jg0thg',},{id:'17',coords:[6628,6241],video:'HrlufjrQS2g',},{id:'18',coords:[7083,5851],video:'s4yakU2egBo',},{id:'19',coords:[7268,6204],video:'ecpS-CwCjsU',},{id:'20',coords:[7036,6154],video:'gttSS-qlo_0',},{id:'21',coords:[7091,6128],video:'t9T4R7ZkHXY',},{id:'22',coords:[7065,6213],video:'w0AZ5eE-QTo',},{id:'23',coords:[7013,6106],video:'_Nh2kU-ctXA',},{id:'24',coords:[6992,6026],video:'_3pPfuoi5N4',},{id:'25',coords:[6884,6240],video:'bB19m0CDDhU',},{id:'26',coords:[6682,6367],video:'I1YXpeZQWEQ',},{id:'27',coords:[7109,6251],video:'qXgG1uG5788',},{id:'28',coords:[7130,6158],video:'YRkjqFY1ePE',},{id:'29',coords:[7079,6138],video:'9SwlGp8Z6BA',},{id:'30',coords:[7027,6233],video:'WxJe3J2FMzk',},],},{id:'overlookingview',group:overlookingviewGroup,format:'image',title:'Succès - Splendide vue',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',checkbox:true,markers: [{id:'01',coords:[4714,6331],text:'Point de départ du succès.',icon:circleIcon,},{id:'02',coords:[4698,6449],text:'Oiseau numéro 1.',icon:oneIcon,},{id:'03',coords:[4349,6388],text:'Oiseau numéro 2.',icon:twoIcon,},{id:'04',coords:[4544,6103],text:'Oiseau numéro 3.',icon:threeIcon,},],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [{id:'spiralabyss',coords:[8812,5528],title:'Profondeurs spiralées',text:'Selon la légende, ceux qui mènent à l\'Île du ciel, aux yeux de Dieu en vision, voient l\'échelle sous une telle forme de spirale. Nous nous dirigeons vers l\'univers, ou ver l\'abîme. Cela ne fait aucune différence, car tout est inconnnu.',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/profondeurs-spiralees/',icon:spiralabyssIcon,},{id:'midsummercourtyard',coords:[7702,4674],title:'Jardin estival',text:'Suivant la chute d\'une antique civilisation, le domaine autrefois luxuriant du palais d\'été qui occupait ces lieux s\'enfonça dans le sol, pour finir par y disparaître à son tour, ne laissant comme témoins de son ancienne gloire que les arbres et les pierres centenaires.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Colère de tonnerre, Dompteur de tonnerre.</strong>',},{id:'forsakenrift',coords:[7034,5499],title:'Gorge de l\'oubli',text:'Dans les temps anciens, des personnes s\'aventuraient dans la vallée à la recherche de l\'arbre ancien de l\'autel. Ils chuchotaient leurs secrets en son creux, se délestant de leur fardeau. La Gorge de l\'oubli regorge de ces confidences.',format:'image',},{id:'valleyofremembrance',coords:[6807,5470],title:'Vallée de la réminiscence',text:'Le temps passa&nbsp;; le peuple du continent oublia les histoires du passé. Les hommes voulurent creuser la terre, pour retrouver les souvenirs qu\'ils avaient perdus. De l\'autre côté de l\'arbre ancien, les secrets d\'hier sont devenus les trésors d\'aujourd\'hui.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Ombre de la Verte chasseuse, Amour chéri.</strong>',},{id:'ceciliagarden',coords:[6378,4910],title:'Pépinière de cécilias',text:'Les cécilias qui d\'habitude fleurissent sur les hautes falaises poussaient autrefois ici dans la chaleur des serres. La civilisation qui aimait tant ces fleurs disparut, et avec elle leur doux parfum.',format:'image',},{id:'hiddenpalaceofzhouformula',coords:[5746,5476],title:'Palais secret de la Formule Zhou',text:'Le rituel qui scelle une des huit portes permet d\'endiguer les forces du mal. Il a été exécuté autrefois pour sceller dans ce dédale un dragon sans cornes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Sorcière des flammes ardentes, Sage de la traverse de feu.</strong>',},{id:'hiddenpalaceoflianshanformula',coords:[6561,6434],title:'Palais secret de Lianshan',text:'On raconte que les montages, de par leur regroupement, sont la demeure d\'incessantes tempêtes, et que les sourds grondements que l\'on peut parfois entendre à l\'entrée du domaine attirent les âmes curieuses.',format:'image',},{id:'domainofguyun',coords:[7101,7458],title:'Au-dessus des nuages',text:'Les illusions et les lamentations de ceux qui souhaitaient autrefois guider l\'humanité convergent ici. Bien qu\'ils hantent la Forêt de pierre de Guyun et que leur ambition soit toujours démesurée, ils ne peuvent que déverser leur rancune dans des cavernes souterraines désormais.',},{id:'taishanmansion',coords:[4972,6510],title:'Manoir Taishan',text:'Autrefois, les personnes désireuses d\'obtenir une audience avec les Adeptes devaient passer les épreuves du Ciel et de la Terre. Cette dernière se déroulait au Manoir Taishan qui est devenu un repaire de trésors depuis le départ de ses maîtres.',format:'image',},{id:'clearpoolandmounntaincavern',coords:[4718,5883],title:'Lagunes et montagnes',text:'Le Mont Aozang est une montagne qui cache trésors et secrets. Son lac semble ordinaire à première vue, mais à proximité se trouve une grotte qui connecte la terre au ciel, et dont des nuages émergent. Cet ensemble forme un paysage très particulier.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Chevalerie ensanglantée, Ancien rituel royal.</strong>',},{id:'eaglesgate',coords:[8014,5844],title:'Porte du Faucon',text:'Les âmes nobles aspirent à la quiétude au-dessus du monde ordinaire, semblables au faucon volant dans les cieux. Ceux qui, tel le faucon méprisaient les mortels et leurs querelles inutiles pouvaient trouver la paix à la Porte du Faucon.',icon:trouncedomainIcon,},{id:'templeofthewolf',coords:[7785,5002],title:'Temple du Loup',text:'Un temple qui fut autrefois dédié au Loup du Nord. On raconte que son esprit veille toujours sur Mondstadt dans un lieu lointain. Des monstres l\'occupent depuis son abandon.',icon:trouncedomainIcon,},{id:'templeofthelion',coords:[7580,5501],title:'Temple du Lion',text:'Un temple qui fut autrefois dédié au Lion du Sud. Abandonné depuis longtemps, les pissenlits transportés par les vents de Mondstadt sont le signe de sa bénédiction.',icon:trouncedomainIcon,},{id:'templeofthefalcon',coords:[7317,5023],title:'Temple du Faucon',text:'Un temple qui fut autrefois dédié au Faucon de l\'Ouest qui veilla sur Mondstadt pendant des millénaires. Ses courants d\'airs traversent encore les couleurs du bâtiment.',icon:trouncedomainIcon,},{id:'confrontstormterror',coords:[6012,4512],title:'Pénétrez dans l\'Antre de Stormterror',text:'Les tours brisées qui se dressent encore fièrement en disent long sur l\'histoire de ce lieu. Ses salles parcourues par des bourrasques sont toujours pleins de souvenirs et de songes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',icon:trouncedomainIcon,},{id:'enterthegoldenhouse',coords:[5884,8071],title:'Entrer dans la Chambre d\'Or',text:'Les sombres nuages couvant sur Liyue se sont enfin dispersés. Le complot qui s\'était emparé de ces terres a été exposé au grand jour, grâce aux efforts combinés des Sept Étoiles, des Adeptes et de vous-même. Le souvenir de votre combat contre Tartaglia le Fatui est encore frais dans votre mémoire. Revivez vos souvenirs et plongez-vous à nouveau dans la bataille. Peut-être apprendrez-vous quelque chose de nouveau, qui sait&nbsp;?<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',icon:trouncedomainIcon,},{id:'domainofthewaywardpath',coords:[5254,7750],title:'Chemin sinueux',text:'Bien que les Pilleurs de trésors aient eu vent des richesses cachées ici, la localisation de ce lieu leur échappe encore. La convoitise excessive n\'apporte jamais rien de bon dans ce monde. Ce n\'est qu\'en lâchant prise qu\'un chemin se dessinera.',icon:trouncedomainIcon,},{id:'hiddenpalaceofguizangformula',coords:[5616,7068],title:'Palais secret de Guizang',text:'Le lac parait limpide, mais cache en réalité des trésors si nombreux qui feraient perdre la raison à certains. Malheureusement, peu sont capables de révéler ses secrets.',icon:trouncedomainIcon,},{id:'domainofforsakenruins',coords:[5966,6786],title:'Ruines abandonnées',text:'La plupart des personnes qui venaient ici convoitaient seulement des trésors qui se trouvaient à proximité. Aujourd\'hui, cet endroit, autrefois prospère, est abandonné.',icon:trouncedomainIcon,},{id:'peakofvindagnyr',coords:[6964,6126],title:'Pic de Vindagnyr',text:'Cette cité enterrée sous la glace répondait autrefois à quelque nom fier et romantique, tout comme la montagne était autrefois luxuriante. Mais suite à la chute de la gigantesque pointe gelée tombée du ciel appelée &laquo;&nbsp;Mandrin céleste&nbsp;&raquo;, la voix des cieux s\'est tue, et ce lieu où les prêtres s\'assemblaient autrefois lors de leurs célébrations est aujourd\'hui vide de leur présence.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Briseur de glace, Âme du naufragé.</strong>',},{id:'ridgewatch',coords:[6465,5702],title:'Garde de la montagne',text:'Se dressant fièrement au commencement de la crète, ces ruines antiques dominent le nord comme le sud, veillant sur les montagnes et les marais. On prétend que ses portes ne s\'ouvrent que pour ceux dont le c&oelig;urbrûle d\'un feu inextinguible.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Ténacité du Millelithe, Flamme blème.</strong>',},{id:'emptyboatofathousandgates',coords:[10610,9348],title:'Navire aux mille portes',text:'Cette demeure annexe tengu qui flotte sur la mer comme un bateau solitaire abritait autrefois les célèbres «&nbsp;Trois Yougou&nbsp;», et elle deviendrait plus tard la cage dans laquelle, désespérés, ils passèrent le reste de leurs jours.',icon:trouncedomainIcon,},{id:'courtofflowingsand',coords:[10550,9570],title:'Cour des sables mouvants',text:'En des temps immémoriaux, un souverain idiot rêvait de construire un haut jardin en hommage à l\'arbre sacré blanc plutôt qu\'aux sables antiques. Aujourd\'hui, seule la mort habite le royaume bâti sur le sable, mais cette volonté absurde du passé survit.<br><strong>Matériau d\'amélioration d\'arme.</strong>',},{id:'violetcourt',coords:[10079,10375],title:'Cour violette',text:'Jadis, dans un lointain passé, des montagnes s\'élevaient parfois plus haut que le ciel, et la terre était plus vaste que son dôme. Mais arriva un jour où le miroir se brisa, provoquant la montée des océans. Selon la légende, c\'est ainsi que ce jardin de cerisiers antiques s\'est séparé du reste des autres îles.<br /><strong>Matériau d\'amélioration d\'aptitude.</strong>',},{id:'shakkeipavilion',coords:[9372,11042],title:'Pavillon Shakkei',text:'Cette magnifique demeure a été construite par un guerrier reclus des temps anciens dans les profondeurs de la terre, en empruntant un paysage hors de ce monde. Un vieil excentrique désillusionné y a été retrouvé quelque temps plus tard.<br /><strong>Suivez le guide pour débloquer l\'accès à ce donjon.</strong>',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/les-contes-de-tatara/',icon:trouncedomainIcon,},{id:'formationestate',coords:[8372,11167],title:'Domaine de formation',text:'Cette demeure appartenait jadis à un haut-gradé de l\'armée d\'Orobashi no Mikoto, jusqu\'à ce que lui, sa divinité et le ciel soient déchirés par la foudre.<br /><strong>Nécessite d\'avoir complété la quête de l\'Héritage d\'Orobashi. Suivez le guide&nbsp;!</strong>',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/lheritage-dorobashi/',icon:trouncedomainIcon,},{id:'momijidyedcourt',coords:[8514,10947],title:'Cour Momiji',text:'Ce jardin a toujours vu la chute d\'innombrables feuilles rouges. Les causes perdues et les amours inoubliables du passé ont peut-être convergé vers les veines de la terre pour se condenser au sein des fruits de l\'arbre blanc.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Réminiscence nostalgique, Emblème du destin brisé.</strong>',},{id:'palaceinapool',coords:[7278,10770],title:'Palais de l\'étang',text:'En des temps où la lune brillait davantage, ce bassin qui donnait accès à la porte du palais n\'était pas rempli par l\'eau de mer. Il baignait dans le clair de lune qui luisait comme du mercure.',format:'video',video:'wjLKw37x_xM',icon:trouncedomainIcon,},],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [{id:'undefined',coords:[5517,6964],title:'Lac Luhua',},{id:'undefined',coords:[5321,6741],title:'Pente Cuijue',},{id:'undefined',coords:[4902,7015],title:'Vallée Tianqiu',},{id:'undefined',coords:[4453,6789],title:'Mont Nantianmen',},{id:'undefined',coords:[4247,6453],title:'Mont Hulao',},{id:'undefined',coords:[4386,6247],title:'Forêt de pierre<br>Huaguang',},{id:'undefined',coords:[4612,6335],title:'Pic Qingyun',},{id:'undefined',coords:[4562,6029],title:'Mont Aozang',},{id:'undefined',coords:[4959,6439],title:'Karst Jueyun',},{id:'undefined',coords:[5212,7382],title:'Tombeau Dunyu',},{id:'undefined',coords:[4970,7657],title:'Passe de Lingju',},{id:'undefined',coords:[5524,7656],title:'Mont Tianheng',},{id:'undefined',coords:[4842,8025],title:'Ravine Qingxu',},{id:'undefined',coords:[5947,7602],title:'Port de Liyue',},{id:'undefined',coords:[5893,6648],title:'Plaines Guili',},{id:'undefined',coords:[6336,6714],title:'Bancs de Yaoguang',},{id:'undefined',coords:[6396,6410],title:'Village Mingyun',},{id:'undefined',coords:[5792,6385],title:'Auberge Wangshu',},{id:'undefined',coords:[6856,7384],title:'Forêt de pierre<br>de Guyun',},{id:'undefined',coords:[5771,5974],title:'Marais Dihua',},{id:'undefined',coords:[6288,5872],title:'Sal Terrae',},{id:'undefined',coords:[5896,5690],title:'Porte de pierre',},{id:'undefined',coords:[5698,5587],title:'Pente Wuwang',},{id:'undefined',coords:[5483,5405],title:'Village de Qingce',},{id:'undefined',coords:[6540,5362],title:'Domaine de l\'Aurore',},{id:'undefined',coords:[6978,5266],title:'Deauclaire',},{id:'undefined',coords:[6561,5021],title:'Territoire des Loups',},{id:'undefined',coords:[6544,4430],title:'Canyon de<br>Brillecouronne',},{id:'undefined',coords:[5999,4416],title:'Antre de Stormterror',},{id:'undefined',coords:[6976,4503],title:'Lac de Cidre',},{id:'undefined',coords:[6949,4749],title:'Cité de Mondstadt',},{id:'undefined',coords:[7320,4706],title:'Bois des Murmures',},{id:'undefined',coords:[7479,4562],title:'Lac Tombétoile',},{id:'undefined',coords:[7410,4362],title:'Montagnes du Guet',},{id:'undefined',coords:[7913,4245],title:'Coin du Guet',},{id:'undefined',coords:[7866,4609],title:'Falaise Arrachétoile',},{id:'undefined',coords:[7854,4850],title:'Temple des Mille Vents',},{id:'undefined',coords:[7409,5183],title:'Ventlevé',},{id:'undefined',coords:[7721,5785],title:'Vallée Dadaupa',},{id:'undefined',coords:[8172,5671],title:'Cap de la Promesse',},{id:'undefined',coords:[8761,5615],title:'Récif de Musk',},{id:'undefined',coords:[7819,5384],title:'Côte du Faucon',},{id:'undefined',coords:[6556,6147],title:'Périphérie<br>de la Cité enfouie',},{id:'undefined',coords:[6817,5842],title:'Vallée Ronfledragon',},{id:'undefined',coords:[7137,5749],title:'Route enneigée',},{id:'undefined',coords:[7132,6052],title:'Palais antique<br>de la Cité enfouie',},{id:'undefined',coords:[7055,6186],title:'Mandrin céleste',},{id:'undefined',coords:[6959,6310],title:'Grotte Luminétoile',},],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [{id:'dragonspine01',coords:[7245,5573],title:'La créature des montagnes',},{id:'dragonspine02',coords:[7229,5587],title:'Richesses de Dosdragon',},{id:'dragonspine03',coords:[6741,5673],title:'Enquête alpestre',},{id:'inazuma01',coords:[10202,9806],title:'Rituel de purification du cerisier sacré / Une histoire étrange à Konda',},{id:'inazuma02',coords:[10378,10182],title:'Le Jeu de Temari',},{id:'inazuma03',coords:[10539,10177],title:'L\'invitation de la Chambre Yae',},{id:'inazuma04',coords:[10559,10259],title:'Catherine à Inazuma ?',},{id:'inazuma05',coords:[10434,10188],title:'Le récit d\'un voyage international',},{id:'inazuma06',coords:[8495,11229],title:'Contempler trois mille lieues au loin',},{id:'inazuma07',coords:[8377,10765],title:'L\'héritage d\'Orobashi',},{id:'inazuma08',coords:[8294,10831],title:'Traitement de l\'île',},{id:'inazuma09',coords:[9242,10987],title:'Rêves d\'un épéiste',},{id:'inazuma10',coords:[5992,7760],title:'Une demeure au-dessus de l\'océan',},{id:'inazuma11',coords:[10502,10167],title:'Pizza d\'un autre monde',},{id:'inazuma12',coords:[8787,10631],title:'Le destin d\'un guerrier',},{id:'inazuma13',coords:[6619,10990],title:'Les profondeurs baignées de la lune',text:'Série de quatre quêtes&nbsp;:<br>&bull; L\'&oelig;il de Watatsumi<br>&bull; Croc de Watatsumi<br>&bull; Nageoire de Watatsumi<br>&bull; Queue de Watatsumi',},{id:'inazuma14',coords:[6650,11068],title:'Créature des mers solitaire',},{id:'inazuma15',coords:[7046,11146],title:'La plante divine des profondeurs',},{id:'inazuma16',coords:[10086,11551],title:'Reliques de Seirai',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/reliques-de-seirai/',},],},{id:'crimsonagate',group:crimsonagateGroup,format:'image',icon:crimsonagateIcon,checkbox:true,markers: [{id:'01',coords:[6778,5655],},{id:'02',coords:[6677,5761],text:'Dans l\'eau se trouvent 3 esprits de vent. <b>Faites celui sur la plaque de glace en dernier&nbsp;!</b> Une fois que la plaque a disparu, elle met du temps à revenir...',},{id:'03',coords:[6629,5780],text:'Tuez les Fatui aux alentours du coffre pour le déverrouiller. Interagissez avec pour obtenir l\'agate pourpre.',},{id:'04',coords:[6513,5917],text:'D\'abord, dégagez la plaque sous la glace (5) en récupérant l\'effet d\'un cristal de sang, puis marchez sur les plaques dans l\'ordre indiqué sur l\'image. Un coffre apparaît lorsque vous avez résolu l\'énigme. L\'agate pourpre se trouve à l\'intérieur.',},{id:'05',coords:[6635,5915],text:'Récupérez d\'abord un cristal de sang qui se trouve en bas du mont et tapez la glace.',},{id:'06',coords:[6705,5986],text:'Après avoir résolu l\'énigme avec les pilliers Cryo et tué les 3 gardiens, vous débloquez l\'accès à une grotte où se trouve l\'agate pourpre.',},{id:'07',coords:[6691,5997],text:'Faites apparaître un coffre en résolvant l\'énigme avec les pilliers Cryo. L\'agate pourpre se trouve à l\'intérieur.',},{id:'08',coords:[6659,6081],},{id:'09',coords:[6578,6090],text:'Terminez le défi pour faire apparaître le coffre contenant l\'agate pourpre. Prévoyez une équipe Pyro pour vous faciliter la tâche.',},{id:'10',coords:[6515,6091],},{id:'11',coords:[6499,6089],text:'Tuez les Brutocollinus devant la cabane pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'12',coords:[6537,6182],text:'Tuez le Chef Brutogivré pour faire appraitre le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'13',coords:[6685,6249],format:'video',video:'afYxkHMwUD0',},{id:'14',coords:[6702,6264],format:'video',video:'jZIL9zOgcx8',},{id:'15',coords:[6716,6226],},{id:'16',coords:[6730,6205],text:'Tuez les Fatui aux alentours pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'17',coords:[6753,6436],text:'Montez sur le flanc de la montagne et utilisez votre planeur pour atteindre cette agate pourpre.',},{id:'18',coords:[6803,6346],text:'Après avoir résolu la petite énigme avec les fées ardentes et tué le gardien, une grille s\'ouvre sur 3 coffres. Le coffre de droite donne l\'agate pourpre.',},{id:'19',coords:[6889,6272],},{id:'20',coords:[6889,6237],},{id:'21',coords:[6933,6297],text:'Ce coffre précieux qui contient une agate pourpre, se trouve derrière un mur de glace, à proximité l\'entrée de la Grotte Luminétoile. Il est également possible d\'y accéder depuis les hauteurs, grâce au planeur.',},{id:'22',coords:[6834,6026],},{id:'23',coords:[6868,6035],},{id:'24',coords:[6851,6077],text:'Après avoir tué le Chef Brutogivré. le coffre apparaît. L\'agate pourpre est à l\'intérieur.',},{id:'25',coords:[6866,5801],},{id:'26',coords:[6974,5754],},{id:'27',coords:[6960,5850],},{id:'28',coords:[7107,5862],},{id:'29',coords:[7082,5809],text:'Utilsez le cristal de sang qui se trouve au sud, pour briser la glace.',},{id:'30',coords:[7187,5889],},{id:'31',coords:[7203,5957],},{id:'32',coords:[7244,5931],},{id:'33',coords:[7375,5880],text:'Tuez les ennemis pour débloquer le coffre qui contient l\'agate pourpre.',},{id:'34',coords:[7280,5978],},{id:'35',coords:[7105,5988],text:'L\'agate pourpre se trouve dans le coffre disponible après avoir tué le gardien et vidé la salle grâce à l\'interrupteur.',},{id:'36',coords:[7139,6019],},{id:'37',coords:[7028,6009],},{id:'38',coords:[6989,6031],text:'Après avoir tué le Chef Brutogivré, le coffre apparait. L\'agate pourpre se trouve à l\'intérieur.',},{id:'39',coords:[6943,6061],},{id:'40',coords:[6928,6119],},{id:'41',coords:[6977,6132],},{id:'42',coords:[6994,6201],},{id:'43',coords:[7015,6184],},{id:'44',coords:[7027,6136],},{id:'45',coords:[7024,6106],},{id:'46',coords:[7035,6105],},{id:'47',coords:[7040,6268],},{id:'48',coords:[7055,6233],},{id:'49',coords:[7094,6237],text:'Marchez sur la zone de glace plus clair pour la rompre et accéder à l\'agate pourpre en dessous.',},{id:'50',coords:[7096,6230],text:'Terminez le défi pour obtenir le coffre de récompenses. L\'agate pourpre se trouve à l\'intérieur.',},{id:'51',coords:[7059,6195],title:'Agate pourpre 51',},{id:'52',coords:[7043,6170],},{id:'53',coords:[7058,6160],},{id:'54',coords:[7080,6181],},{id:'55',coords:[7054,6344],text:'Vous avez deux agates poupres à cette position. La première à l\'extérieur, sur le toit. La seconde dans le coffre dans la cabane, après avoir tué le Chef brutogivré.',},{id:'56',coords:[7018,6514],},{id:'57',coords:[7306,6548],text:'Tuez le gardien pour ouvrir le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'58',coords:[7251,6449],text:'Utilisez les esprits du vent sur le côté est du pic, pour le gravir plus rapidement. Vous en trouverez plusieurs le long de votre ascension.',},{id:'59',coords:[7330,6269],},{id:'60',coords:[7447,6263],},{id:'61',coords:[7518,6319],},{id:'62',coords:[7597,6161],text:'Depuis la falaise au sud de la Vallée Dadaupa, descendez vers un petit escarpement au nord de l\'île pour trouver un cristal de sang. Brisez-le puis dirigez-vous en planeur sur l\'île. Briser la glace éternelle sur place pour faire apparaître un coffre luxueux contenant l\'agate pourpre.',},{id:'63',coords:[7417,6076],text:'Utilisez les esprits du vent dans l\'ordre indiqué pour récupérer l\'agate pourpre dans les airs.',},{id:'64',coords:[7364,6099],},{id:'65',coords:[7332,6067],text:'Tuez les ennemis pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'66',coords:[7310,6125],},{id:'67',coords:[7263,6168],text:'L\'agate pourpre se trouve dans le coffre accessible après avoir tué le roi des sangliers.',},{id:'68',coords:[7221,6120],},{id:'69',coords:[7118,6076],text:'Ce coffre précieux est disponible dans la salle secrète après avoir lu les 8 stèles. Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',},{id:'70',coords:[7168,6180],text:'Ce coffre précieux qui contient une agate pourpre est accessible après avoir complété le succès «&nbsp;Prêtre, princesse et scribe&nbsp;».',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',},{id:'71',coords:[7189,6241],},{id:'72',coords:[7246,6419],text:'Tuez les brutocollinus des alentours pour déverouiller l\'accès à ce coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'73',coords:[7006,6221],},{id:'74',coords:[6963,6133],text:'Accessible uniquement après avoir débloqué le donjon du Pic de Vindagnyr.',},{id:'75',coords:[7064,6060],text:'Nourrissez les renards avec deux baies en les déposant dans le bol près de la tente pendant cinq (vrais) jours. Le sixième jour, un coffre précieux contenant l\'agate pourpre apparait.',},{id:'76',coords:[7018,6136],text:'À droite de la grille, il faut taper la glace éternelle en étant sous l\'effet d\'un cristal de sang et activez l\'interrupteur en dessous. L\'agate pourpre se trouve dans le coffre.',},{id:'77',coords:[6700,5950],},{id:'78',coords:[6646,6117],},{id:'79',coords:[7305,6267],},],},{id:'priestprincessscribe',group:priestprincessscribeGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',checkbox:true,markers: [{id:'priest',coords:[6831,5972],title:'Coffre de prêtre',icon:priestIcon,},{id:'princess',coords:[7317,5835],title:'Coffre de princesse',text:'Touchez l\'épée pour lancer le défi. Une fois terminé, le coffre apparaît.',icon:princessIcon,},{id:'scribe',coords:[6825,6231],title:'Coffre de scribe',text:'Déposez 3&nbsp;Cécilias pour obtenir le coffre de scribe.',icon:scribeIcon,},{id:'door',coords:[7159,6152],text:'Une fois que vous avez ramassez les 3 coffres (prêtre, princesse et scribe) vous pouvez ouvrir la porte.',icon:doorIcon,},],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[6604,5207],text:'Ouvrez le coffre en moins de 30s.',video:'CEgU79_TBpI',},{id:'mondstadt02',coords:[7836,4643],text:'Ouvrez le coffre en moins de 60s.',video:'M8PVB6xzTFg',},{id:'mondstadt03',coords:[7550,4826],text:'Explosez les 4 tonneaux en moins de 20s.',video:'gVJ2wFUxmLs',},{id:'mondstadt04',coords:[7262,4505],text:'Tuez tous les ennemis en 30s.',video:'2Wt4GiS3m9M',},{id:'mondstadt05',coords:[7473,4393],text:'Tuez tous les ennemis en 60s.',video:'7mIc69g84ps',},{id:'mondstadt06',coords:[7650,4402],text:'Allumez tous les braseros et ouvrez le coffre en 30s.',video:'QAliyQcjZnQ',},{id:'mondstadt07',coords:[7723,4350],text:'Ouvrez le coffre en moins de 60s.',video:'O1ntwm61sTY',},{id:'mondstadt08',coords:[7736,4277],text:'Ouvrez le coffre en moins de 30s.',video:'8m2i0QQnIs4',},{id:'mondstadt09',coords:[6477,4707],text:'Tuez tous les ennemis en 20s.',video:'zkRXJYy5Xno',},{id:'mondstadt10',coords:[7137,5288],text:'Tuez tous les ennemis en 60s.',video:'_nDnHNluwLY',},{id:'mondstadt11',coords:[6957,5314],text:'Ouvrez le coffre en moins de 30s.',video:'uQZxXQY3AWU',},{id:'mondstadt12',coords:[6512,4910],text:'Ouvrez le coffre en moins de 20s.',video:'s2CQ4Ms4lbE',},{id:'mondstadt13',coords:[6201,4870],text:'Tuez tous les ennemis en 30s.',video:'ewteF9VNmrA',},{id:'mondstadt14',coords:[6055,4285],text:'Tuez tous les ennemis en 50s.',video:'EOJLR0_HX6o',},{id:'mondstadt15',coords:[6239,4618],text:'Tuez tous les ennemis en 30s.',video:'ZJo7JD4PJ_A',},{id:'mondstadt16',coords:[5773,4353],text:'Tuez tous les ennemis en 30s.',video:'ekGBUrJXAgA',},{id:'mondstadt17',coords:[5747,4408],text:'Ouvrez le coffre en moins de 50s.',video:'cCdHlxM9vQI',},{id:'mondstadt18',coords:[6765,5733],text:'Ouvrez le coffre en moins de 30s.',video:'jkZ5FrdO1jo',},{id:'mondstadt19',coords:[6942,5648],text:'Explosez les 3 tonneaux en moins de 30s.',video:'y9SkYCW8H-M',},{id:'mondstadt21',coords:[7399,6289],text:'Explosez les 5 tonneaux en moins de 30s.',video:'fkH9RxiwsbA',},{id:'mondstadt22',coords:[7325,6625],text:'Ouvrez le coffre en moins de 16s.',video:'GzHhQauia3g',},{id:'mondstadt23',coords:[7089,6517],text:'Ramassez 8 particules Anémo en moins de 50s.',video:'Otq1FHm-8QY',},{id:'mondstadt24',coords:[7094,6227],text:'Tuez tous les ennemis en 180s.',video:'LB27Cg3VVFA',},{id:'mondstadt25',coords:[7031,5853],text:'Tuez tous les ennemis en 60s.',video:'s6_DTpfCq7U',},{id:'mondstadt26',coords:[7179,6159],text:'Ramassez 8 particules Anémo en moins de 40s.',video:'_ZvpOhy1sAI',},{id:'mondstadt27',coords:[6582,6076],text:'Tuez tous les ennemis en 180s.',video:'dafebp9OHw8',},{id:'mondstadt28',coords:[7083,6171],text:'Ramassez 8 particules Anémo en moins de 90s.',video:'Br_EgHkBgi4',},{id:'mondstadt29',coords:[6917,6327],text:'Ramassez 8 particules Anémo en moins de 60s.',video:'FIh3-KW0msw',},{id:'mondstadt30',coords:[7265,6044],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'aK36viVPF7Y',},{id:'mondstadt31',coords:[6560,5824],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'el4GWAKYR8o',},{id:'mondstadt32',coords:[6638,6118],text:'Ramassez 12 particules Anemo en moins de 90s.',video:'yxPqcqZJjv4',},{id:'mondstadt33',coords:[6892,5873],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'l6D9_HMnGrk',},{id:'mondstadt34',coords:[6969,5801],text:'Explosez les 3 tonneaux en 30s.',video:'Iug37KvN6Ig',},{id:'liyue01',coords:[5494,5278],text:'Tuez tous les ennemis en 30s.',video:'WziDtNmzLJs',},{id:'liyue02',coords:[5552,5431],text:'Explosez les 5 tonneaux en moins de 60s.',video:'j_bXfT81rGI',},{id:'liyue03',coords:[6366,5872],text:'Explosez les 5 tonneaux en moins de 15s.',video:'3EDE6sVWo0E',},{id:'liyue04',coords:[6104,5933],text:'Tuez tous les ennemis en 45s.',video:'0FEn7bu1L5U',},{id:'liyue05',coords:[5526,7817],text:'Tuez tous les ennemis en 50s.',video:'7-S5hlf4x7g',},{id:'liyue06',coords:[5525,7686],text:'Tuez tous les ennemis en 120s.',video:'hI7o0nAknI4',},{id:'liyue07',coords:[5986,6529],text:'Tuez tous les ennemis en 45s.',video:'HGLc8MbzV78',},{id:'liyue08',coords:[7101,7438],text:'Tuez tous les ennemis en 45s.',video:'paTQhEX5xfg',},{id:'liyue09',coords:[4274,6316],text:'Tuez tous les ennemis en 30s.',video:'9T9SNniy_QI',},{id:'liyue10',coords:[4207,6495],text:'Tuez tous les ennemis en 30s.',video:'NCXRp1fAwJI',},{id:'liyue11',coords:[4522,6493],text:'Tuez tous les ennemis en 30s.',video:'yLAvPbLl3tE',},{id:'liyue12',coords:[4598,5824],text:'Ouvrez le coffre en moins de 45s.',video:'JosesYBjnFs',},{id:'liyue13',coords:[5971,5831],text:'Tuez tous les ennemis en 30s.',video:'fCU6_w1WjY4',},{id:'liyue14',coords:[4569,6431],text:'Tuez tous les ennemis en 45s.',video:'MchxMKPL8HM',},{id:'liyue15',coords:[6547,6453],text:'Tuez tous les ennemis en 60s.',video:'5PLcwdPCMj8',},{id:'liyue16',coords:[5728,5704],text:'Tuez tous les ennemis en 60s.',video:'8h7uku-mzQ0',},{id:'liyue17',coords:[5151,7339],text:'Tuez tous les ennemis en 60s.',video:'Ry_cmN8d458',},{id:'liyue18',coords:[5989,5480],text:'Explosez les 3 tonneaux en 40s.',video:'ht7Byu-vQHQ',},{id:'liyue19',coords:[5077,5666],text:'Tuez tous les ennemis en 60s.',video:'E5uxaP5Alkc',},{id:'liyue20',coords:[4591,5943],text:'Tuez tous les ennemis en 45s.',video:'sqqj6jDEg60',},{id:'liyue21',coords:[4611,6868],text:'Ouvrez le coffre en moins de 10s.',video:'QVaamsfMYbg',},{id:'liyue22',coords:[4488,6811],text:'Ouvrez le coffre en moins de 15s.',video:'QamwKZhAcoM',},{id:'liyue23',coords:[6271,6449],text:'Tuez tous les ennemis en 60s.',video:'ze55XkHGaJs',},{id:'liyue24',coords:[4959,7122],text:'Tuez tous les ennemis en 30s.',video:'noHy6OJvE68',},{id:'liyue25',coords:[6595,6725],text:'Tuez tous les ennemis en 30s.',video:'1fwIumFImo8',},{id:'liyue26',coords:[5324,7078],text:'Explosez les 3 tonneaux en 15s.',video:'MZ7mIrDfUEs',},{id:'liyue27',coords:[4912,7337],text:'Tuez tous les ennemis en 60s.',video:'H8Rn4xkV_HQ',},{id:'liyue28',coords:[6563,6685],text:'Explosez les 3 tonneaux en 25s.',video:'WS32im-CGQM',},{id:'liyue29',coords:[4496,6111],text:'Tuez tous les ennemis en 45s.',video:'KrliK1l9lNY',},{id:'liyue30',coords:[4632,6173],text:'Ouvrez le coffre en moins de 38s.',video:'-NBpUVa3xxc',},{id:'liyue31',coords:[4573,6276],text:'Tuez tous les ennemis en 30s.',video:'kqBaV3x8W1s',},{id:'liyue32',coords:[4625,6288],text:'Ouvrez le coffre en moins de 18s.',video:'aQuLCJ95ZLk',},{id:'liyue33',coords:[4763,6277],text:'Tuez tous les ennemis en 50s.',video:'RW8aafDfrKU',},{id:'liyue34',coords:[4969,6389],text:'Tuez tous les ennemis en 30s.',video:'T5ILVhvfwE0',},{id:'liyue35',coords:[5320,6585],text:'Tuez tous les ennemis en 60s.',video:'Gm2J0MSo_6M',},{id:'liyue36',coords:[5272,6812],text:'Tuez tous les ennemis en 30s.',video:'XpdzdjGwZCA',},{id:'liyue37',coords:[4988,7204],text:'Tuez tous les ennemis en 50s.',video:'cMjdQxGRruk',},{id:'liyue38',coords:[4855,8036],text:'Ouvrez le coffre en moins de 60s.',video:'aw2-YywoxRg',},{id:'liyue39',coords:[5142,8042],text:'Tuez tous les ennemis en 60s.',video:'EXUrFc7WiQw',},{id:'liyue40',coords:[5649,7390],text:'Explosez les 4 tonneaux en 30s.',video:'O-GVDdA1rw8',},{id:'liyue41',coords:[6244,6618],text:'Ouvrez le coffre en moins de 20s.',video:'xkF9Hq8V2YI',},],},{id:'unusualhilichurl',group:unusualhilichurlGroup,format:'simple',title:'Brutocollinus étranges',guide:'https://gaming.lebusmagique.fr/genshin-impact/succes/au-defi/#bruto-etrange',icon:unusualhilichurlIcon,markers: [{id:'01',coords:[6456,5170],},{id:'02',coords:[5940,4588],},{id:'03',coords:[7346,4314],},{id:'04',coords:[7408,5264],},{id:'05',coords:[7689,5706],},{id:'06',coords:[8269,5535],},{id:'07',coords:[5969,5591],},{id:'08',coords:[5522,5260],},{id:'09',coords:[4687,6309],},{id:'10',coords:[4966,6517],},{id:'11',coords:[4816,7010],},{id:'12',coords:[5275,6752],},{id:'13',coords:[5082,7821],},{id:'14',coords:[6005,7333],},{id:'15',coords:[6532,6505],},],},{id:'glacialsteel',group:glacialsteelGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',icon:glacialsteelIcon,checkbox:true,markers: [{id:'01',coords:[7261,5792],title:'Stèle n°&nbsp;1',},{id:'02',coords:[6854,5945],title:'Stèle n°&nbsp;2',},{id:'03',coords:[6796,6326],title:'Stèle n°&nbsp;3',},{id:'04',coords:[6668,6022],title:'Stèle n°&nbsp;4',text:'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',},{id:'05',coords:[6995,6262],title:'Stèle n°&nbsp;5',},{id:'06',coords:[7169,6186],title:'Stèle n°&nbsp;6',text:'Vous devez d\'abord terminer le succès \"Prêtre, Princesse et Scribe\" pour accéder à cette stèle. Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',},{id:'07',coords:[6953,6130],title:'Stèle n°&nbsp;7',},{id:'08',coords:[7132,6052],title:'Stèle n°&nbsp;8 et porte',},],},{id:'futileendeavor',group:futileendeavorGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/futile-expedition/',icon:futileendeavorIcon,checkbox:true,markers: [{id:'01',coords:[7309,6562],title:'Gardiens n°1 et 2',},{id:'02',coords:[7079,5868],title:'Gardiens n°3 et 4',},{id:'03',coords:[7061,6374],title:'Gardien n°5',},{id:'04',coords:[6720,5989],title:'Gardien n°6',text:'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',},{id:'05',coords:[7103,5986],title:'Gardien n°7',},{id:'06',coords:[7134,6162],title:'Gardien n°8',},{id:'07',coords:[6633,6130],title:'Gardien n°9',},],},{id:'prodigalsonreturn',group:prodigalsonreturnGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-retour-du-fils-prodigue/',icon:prodigalsonreturnIcon,checkbox:true,markers: [{id:'01',coords:[6701,6268],title:'Notes abîmées n°&nbsp;1',},{id:'02',coords:[6638,6142],title:'Notes abîmées n°&nbsp;2',},{id:'03',coords:[7295,6222],title:'Notes abîmées n°&nbsp;3',},],},{id:'lostinthesnow',group:lostinthesnowGroup,format:'popup',title:'Royaumes sous les neiges',text:'Journal d’inspection ancien',icon:lostinthesnowIcon,checkbox:true,markers: [{id:'01',coords:[7129,6055],text:'Journal d’inspection ancien –&nbsp;<b>Partie I</b>.',},{id:'02',coords:[6943,6288],text:'Journal d’inspection ancien –&nbsp;<b>Partie III</b>.',},{id:'03',coords:[6789,6339],text:'Journal d’inspection ancien –&nbsp;<b>Partie II</b>.',},],},{id:'treasureguili',group:treasureguiliGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-tresor-des-plaines-guili/',icon:treasureguili01Icon,checkbox:true,markers: [{id:'01',coords:[5868,6814],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 1',},{id:'02',coords:[5957,6794],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 2',},{id:'03',coords:[6030,6881],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 3',},{id:'04',coords:[5968,6864],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 4',},{id:'05',coords:[5920,6889],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 5',},{id:'06',coords:[5653,6917],title:'<em>Le trésor des Plaines Guili</em><br />Étape 2 - Stèle en pierre 1',icon:treasureguili02Icon,},{id:'07',coords:[6047,6982],title:'<em>Le trésor des Plaines Guili</em><br />Étape 2 - Stèle en pierre 2',text:'Tuez les ennemis et brûlez les ronces pour entrer dans le bâtiment et interagir avec la stèle.',icon:treasureguili02Icon,},{id:'08',coords:[5743,6478],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 1',text:'Approchez du champ de force pour faire apparaître des monstres. Tuez-les pour le désactiver et interagir avec le disque.',icon:treasureguili03Icon,},{id:'09',coords:[6005,6684],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 2',text:'Tuez les pilleurs pour pouvoir interagir avec le disque.',icon:treasureguili03Icon,},{id:'10',coords:[6068,6976],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 3',icon:treasureguili03Icon,},{id:'11',coords:[5690,6860],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 4',icon:treasureguili03Icon,},{id:'12',coords:[5906,6728],title:'<em>Le trésor des Plaines Guili</em><br />Étape 4 - Trésor et succès',text:'Activez le disque au nord et tuez les 3 gardiens des ruines pour accéder aux coffres.',icon:treasureguili04Icon,},],},{id:'boss',group:bossGroup,format:'image',markers: [{id:'stormterror',coords:[6012,4512],title:'Stormterror',icon:bossStormterrorIcon,},{id:'andrius',coords:[6407,5172],title:'Andros',icon:bossAndriusIcon,},{id:'hypostasisanemo',coords:[7443,4260],title:'Hypostase Anémo',icon:bossHypostasisAnemoIcon,},{id:'hypostasiselectro',coords:[8083,5858],title:'Hypostase Électro',icon:bossHypostasisElectroIcon,},{id:'regisvinecryo',coords:[7820,5067],title:'Arbre congelé',icon:bossRegisvineCryoIcon,},{id:'hypostasisgeo',coords:[6995,7120],title:'Hypostase Géo',icon:bossHypostasisGeoIcon,},{id:'regisvinepyro',coords:[5189,7016],title:'Arbre enflammé',icon:bossRegisvinePyroIcon,},{id:'oceanid',coords:[5864,5371],title:'Esprit des eaux',icon:bossOceanidIcon,},{id:'tartaglia',coords:[5895,8072],title:'Tartaglia',icon:bossTartagliaIcon,},{id:'primogeovishap',coords:[4678,6933],title:'Géolézard antique',icon:bossPrimoGeovishapIcon,},{id:'hypostasiscryo',coords:[6694,5994],title:'Hypostase Cryo',icon:bossHypostasisCryoIcon,},{id:'hypostasispyro',coords:[9324,10206],title:'Hypostase Pyro',icon:bossHypostasisPyroIcon,},{id:'azhdaha',coords:[4391,6553],title:'Azhdaha',icon:bossAzhdahaIcon,},{id:'maguukenki',coords:[8477,11111],title:'Lame Oni',icon:bossMaguuKenkiIcon,},{id:'permecarr',coords:[10612,9301],title:'Matrice mécanique perpétuelle',icon:bossPmaIcon,},{id:'signora',coords:[10704,10521],title:'Signora',icon:bossSignoraIcon,},{id:'thundermanifestation',coords:[10404,11871],title:'Manifestation du tonnerre',text:'Nécessite d\'avoir complété la quête \"Chasseurs d\'orage de Seirai\". Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/chasseurs-d-orage-de-seirai/',icon:bossThunderManifestationIcon,},{id:'hypostasishydro',coords:[7121,10714],title:'Hypostase Hydro',icon:bossHypostasisHydroIcon,},],},{id:'iron',group:ironGroup,format:'popup',title:'Fer',icon:ironIcon,checkbox:true,markers: [{id:'01',coords:[7561,4654],title:'Fer #01',},{id:'02',coords:[7659,5132],title:'Fer #02',},{id:'03',coords:[7474,5411],title:'Fer #03',},{id:'04',coords:[5817,4539],title:'Fer #04',},{id:'05',coords:[5996,5514],title:'Fer #05',},{id:'06',coords:[6306,4982],title:'Fer #06',},{id:'07',coords:[6333,6306],title:'Fer #07',},{id:'08',coords:[6905,5415],title:'Fer #08',},{id:'09',coords:[5720,6721],title:'Fer #09',},{id:'10',coords:[5997,7110],title:'Fer #10',},],},{id:'tinplate',group:tinplateGroup,format:'popup',title:'Fer blanc',icon:tinplateIcon,checkbox:true,markers: [{id:'01',coords:[6522,4497],title:'Fer blanc #01',},{id:'02',coords:[6498,4969],title:'Fer blanc #02',},{id:'03',coords:[7515,4436],title:'Fer blanc #03',},{id:'04',coords:[7778,4255],title:'Fer blanc #04',},{id:'05',coords:[8764,5524],title:'Fer blanc #05',},{id:'06',coords:[6110,5552],title:'Fer blanc #06',},{id:'07',coords:[5600,5994],title:'Fer blanc #07',},{id:'08',coords:[6367,6300],title:'Fer blanc #08',},{id:'09',coords:[4543,6060],title:'Fer blanc #09',},{id:'10',coords:[5149,6486],title:'Fer blanc #10',},{id:'11',coords:[4927,7012],title:'Fer blanc #11',},{id:'12',coords:[5085,7827],title:'Fer blanc #12',},{id:'13',coords:[5343,7451],title:'Fer blanc #13',},{id:'14',coords:[6337,7264],title:'Fer blanc #14',},{id:'15',coords:[6160,6744],title:'Fer blanc #15',},],},{id:'electrocristal',group:electrocristalGroup,format:'popup',title:'Électrocristal',icon:electrocristalIcon,checkbox:true,markers: [{id:'01',coords:[6018,4358],title:'Électrocristal #01',},{id:'02',coords:[6445,5002],title:'Électrocristal #02',},{id:'03',coords:[7512,4501],title:'Électrocristal #03',},{id:'04',coords:[7821,4712],title:'Électrocristal #04',},{id:'05',coords:[7701,5304],title:'Électrocristal #05',},{id:'06',coords:[8225,5627],title:'Électrocristal #06',},{id:'07',coords:[7832,5730],title:'Électrocristal #07',},{id:'08',coords:[7727,5910],title:'Électrocristal #08',},{id:'09',coords:[6609,5581],title:'Électrocristal #09',},{id:'10',coords:[6025,5374],title:'Électrocristal #10',},{id:'11',coords:[5817,5582],title:'Électrocristal #11',},{id:'12',coords:[5551,5775],title:'Électrocristal #12',},{id:'13',coords:[4773,5745],title:'Électrocristal #13',},{id:'14',coords:[5005,6684],title:'Électrocristal #14',},{id:'15',coords:[5387,6761],title:'Électrocristal #15',},{id:'16',coords:[5531,7063],title:'Électrocristal #16',},{id:'17',coords:[5986,6968],title:'Électrocristal #17',},{id:'18',coords:[6237,6625],title:'Électrocristal #18',},{id:'19',coords:[6757,7456],title:'Électrocristal #19',},],},{id:'fragrantcedar',group:fragrantcedarGroup,format:'popup',icon:fragrantCedarIcon,markers: [{id:'01',coords:[7822,4307],title:'Bois de cèdre parfumé 01',},{id:'02',coords:[7473,4646],title:'Bois de cèdre parfumé 02',},{id:'03',coords:[7362,5028],title:'Bois de cèdre parfumé 03',},{id:'04',coords:[7706,4968],title:'Bois de cèdre parfumé 04',},{id:'05',coords:[7474,5386],title:'Bois de cèdre parfumé 05',},{id:'06',coords:[7723,5793],title:'Bois de cèdre parfumé 06',},],},{id:'waverider',group:waveriderGroup,format:'image',title:'Téléporteur de barge',icon:waveriderIcon,checkbox:true,markers: [{id:'inazuma01',coords:[10424,9318],},{id:'inazuma02',coords:[10456,10105],},{id:'inazuma03',coords:[10842,9632],},{id:'inazuma04',coords:[7955,10812],},{id:'inazuma05',coords:[9607,10940],},{id:'inazuma06',coords:[10054,10163],format:'video',video:'hZfHrLu6xJU',},{id:'inazuma07',coords:[8188,11014],},{id:'inazuma08',coords:[9994,9522],},{id:'inazuma09',coords:[7095,11243],},{id:'inazuma10',coords:[6506,10936],},{id:'inazuma11',coords:[7379,10693],},{id:'inazuma12',coords:[9678,11847],},{id:'inazuma13',coords:[10245,11343],},{id:'inazuma14',coords:[9815,11427],},],},{id:'tokialleytales',group:tokialleytalesGroup,format:'image',icon:bookIcon,checkbox:true,markers: [{id:'01',coords:[10349,9012],title:'Contes de l\'Allée Toki - Prologue',text:'Dans une des cages de l\'Île de Jinren. Nécessite une clé en métal trouvée sur l\'île.',},{id:'02',coords:[9234,10972],title:'Contes de l\'Allée Toki - Tome I',text:'Obtenue dans la grotte verrouillée par une grille. Voir le guide de l\'Espadon de Nagamasa.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/espadon-de-nagamasa/',},{id:'03',coords:[9509,10913],title:'Contes de l\'Allée Toki - Tome I',},{id:'04',coords:[10309,9660],title:'Contes de l\'Allée Toki - Prologue',text:'L\'entrée se fait par une grotte sur la plage à l\'ouest.',},{id:'05',coords:[8779,10587],title:'Contes de l\'Allée Toki - Tome II',},{id:'06',coords:[9306,10885],title:'Contes de l\'Allée Toki - Tome I',},{id:'07',coords:[10428,9444],title:'Contes de l\'Allée Toki - Prologue',},{id:'08',coords:[9594,10492],title:'Contes de l\'Allée Toki - Tome I',},{id:'09',coords:[9414,10437],title:'Contes de l\'Allée Toki - Tome I',},{id:'10',coords:[7747,10820],title:'Contes de l\'Allée Toki - Tome II',},{id:'11',coords:[10247,9936],title:'Contes de l\'Allée Toki - Prologue',},{id:'12',coords:[10019,9738],title:'Contes de l\'Allée Toki - Prologue',},{id:'13',coords:[6636,11016],title:'Contes de l\'Allée Toki - Tome IV',},{id:'14',coords:[7205,11084],title:'Contes de l\'Allée Toki - Tome IV',},{id:'15',coords:[7466,10953],title:'Contes de l\'Allée Toki - Tome IV',},{id:'16',coords:[9874,11596],title:'Contes de l\'Allée Toki - Tome III',},{id:'17',coords:[11063,9389],title:'Contes de l\'Allée Toki - Prologue',},{id:'18',coords:[10226,9982],title:'Contes de l\'Allée Toki - Prologue',text:'Dans le puit du village de Konda.',},{id:'19',coords:[8443,11147],title:'Contes de l\'Allée Toki - Tome II',},{id:'20',coords:[8542,10776],title:'Contes de l\'Allée Toki - Tome II',},{id:'21',coords:[8321,10911],title:'Contes de l\'Allée Toki - Tome II',},{id:'22',coords:[10527,9642],title:'Contes de l\'Allée Toki - Prologue',text:'Requiert le cerisier sacré au niveau 17 pour franchir la barrière électro.',},{id:'23',coords:[10485,9438],title:'Contes de l\'Allée Toki - Prologue',},{id:'24',coords:[6944,10809],title:'Contes de l\'Allée Toki - Tome V',text:'Attrapé pendant une partie de pêche.',},{id:'25',coords:[7300,10702],title:'Contes de l\'Allée Toki - Tome IV',},{id:'26',coords:[8384,10845],title:'Contes de l\'Allée Toki - Tome II',},{id:'27',coords:[8433,11213],title:'Contes de l\'Allée Toki - Tome II',},{id:'28',coords:[7096,11266],title:'Contes de l\'Allée Toki - Tome IV',},],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [{id:'01',coords:[6943,5111],text:'&bull; Médaka sucrant et bleuté<br>&bull; &Eacute;pinoche dovenin<br>&bull; Akai maou<br>&bull; Poisson-papillon vert<br>&bull; Poisson-globe et poisson-globe amer',},{id:'02',coords:[7209,4892],text:'&bull; Médaka bleuté<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche dovenin<br>&bull; Koï rouillé<br>&bull; Poisson-papillon vert',},{id:'03',coords:[7462,4415],text:'&bull; Médaka sucrant et bleuté<br>&bull; Poisson cristal<br>&bull; Attrape-aube<br>&bull; &Eacute;pinoche dovenin<br>&bull; Koï doré<br>&bull; Poisson-papillon vert',},{id:'04',coords:[6015,4676],text:'&bull; Médaka sucrant et bleuté<br>&bull; Attrape-aube<br>&bull; Poisson-papillon vert',},{id:'05',coords:[6071,4281],text:'&bull; Médaka sucrant et bleuté<br>&bull; Attrape-aube<br>&bull; Poisson cristal',},{id:'06',coords:[7404,5308],text:'&bull; Médaka sucrant et bleuté<br>&bull; &Eacute;pinoche dovenin<br>&bull; Poisson-papillon vert',},{id:'07',coords:[6390,5457],text:'&bull; Médaka bleuté<br>&bull; Attrape-aube<br>&bull; &Eacute;pinoche dovenin<br>&bull; Akai maou<br>&bull; Poisson-papillon vert<br>&bull; Poisson-globe et poisson-globe amer',},{id:'08',coords:[5663,5345],text:'&bull; Médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron<br>&bull; Poisson-globe amer',},{id:'09',coords:[5715,5834],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson-papillon marron',},{id:'10',coords:[5585,6224],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'11',coords:[6083,6516],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'12',coords:[5004,5637],text:'&bull; Médaka<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron',},{id:'13',coords:[4487,6473],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron',},{id:'14',coords:[5579,7030],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'15',coords:[4809,7022],text:'&bull; Médaka<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante',},{id:'16',coords:[6226,7919],text:'&bull; Médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-globe',},{id:'17',coords:[9838,9718],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Akai maou<br>&bull; Poisson-globe et poisson-globe amer',},{id:'18',coords:[10091,10417],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet',},{id:'19',coords:[8776,10561],text:'&bull; Médaka<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet<br>&bull; Poisson-globe amer',},{id:'20',coords:[6948,10808],text:'&bull; Médaka et médaka verni<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet',},{id:'21',coords:[7402,10732],text:'&bull; Médaka et médaka verni<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet',},{id:'22',coords:[10199,11584],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon violet',},{id:'23',coords:[10285,11617],text:'&bull; Médaka<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; Poisson-papillon violet<br>&bull; Poisson-globe',},{id:'24',coords:[6751,6182],text:'&bull; Médaka<br>&bull; &Eacute;pinoche dovenin<br>&bull; Arpente-neige<br>&bull; Poisson-papillon vert',},{id:'25',coords:[4568,6021],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; Scalaire chousei',},{id:'26',coords:[9781,10760],text:'Le scalaire raimei n\'apparait qu\'entre 18h et 6h, heure en jeu.',},],},];



// Création de la carte
  L.tileLayer('assets/img/map-2.1/{z}/{x}/{y}.jpg', {
      attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
      maxZoom: 6,
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

        var marker = L.marker(unproject([(m.coords[0]), (m.coords[1])]), {icon: icon});

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
  map.setMaxBounds(new L.LatLngBounds(unproject([3072,3072]), unproject([13312, 13312])));



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

    var zoom = (params.z && ['2', '3', '4', '5', '6'].indexOf(params.z) >= 0) ? params.z : 4;

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
