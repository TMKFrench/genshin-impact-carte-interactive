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
  var markers = [{id:'statue',group:statueGroup,format:'image',title:'Statue des Sept',icon:statueIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7472,4092],},{id:'mondstadt02',coords:[7409,4738],},{id:'mondstadt03',coords:[6721,4805],},{id:'mondstadt04',coords:[5975,4020],},{id:'liyue01',coords:[5892,5383],},{id:'liyue02',coords:[5895,6661],},{id:'liyue03',coords:[4672,5892],},{id:'liyue04',coords:[5158,7003],},{id:'liyue05',coords:[6401,6029],},{id:'dragonspine01',coords:[7168,5479],},{id:'inazuma01',coords:[10045,9087],},{id:'inazuma02',coords:[9383,10189],},{id:'inazuma03',coords:[8362,10358],},{id:'inazuma04',coords:[6721,10494],},{id:'inazuma05',coords:[10177,11090],},],},{id:'teleporter',group:teleporterGroup,format:'image',icon:teleporterIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7774,3824],},{id:'mondstadt02',coords:[7786,3980],},{id:'mondstadt03',coords:[7271,4459],},{id:'mondstadt04',coords:[7020,4380],},{id:'mondstadt05',coords:[6593,4087],},{id:'mondstadt06',coords:[6235,3866],},{id:'mondstadt07',coords:[6028,4005],},{id:'mondstadt08',coords:[5798,4082],},{id:'mondstadt09',coords:[6107,4283],},{id:'mondstadt10',coords:[6352,4796],},{id:'mondstadt11',coords:[6668,4478],},{id:'mondstadt12',coords:[6524,4373],},{id:'mondstadt13',coords:[5876,3736],},{id:'mondstadt14',coords:[7016,4663],},{id:'mondstadt15',coords:[7060,4861],},{id:'mondstadt16',coords:[7419,3941],},{id:'mondstadt17',coords:[7680,4686],},{id:'mondstadt18',coords:[7585,5195],},{id:'mondstadt19',coords:[8148,5216],},{id:'mondstadt20',coords:[7651,4360],},{id:'mondstadt21',coords:[6893,4396],format:'video',video:'9aaU23xfqGA',},{id:'liyue01',coords:[5943,5087],},{id:'liyue02',coords:[5816,5780],},{id:'liyue03',coords:[5346,4863],},{id:'liyue04',coords:[4345,5941],},{id:'liyue05',coords:[4540,5615],},{id:'liyue06',coords:[6335,5688],},{id:'liyue07',coords:[5308,6416],},{id:'liyue08',coords:[4997,6518],},{id:'liyue09',coords:[4880,6721],},{id:'liyue10',coords:[6119,6766],},{id:'liyue11',coords:[6809,6743],},{id:'liyue12',coords:[4714,5819],},{id:'liyue13',coords:[4754,6140],},{id:'liyue14',coords:[5107,7217],},{id:'liyue15',coords:[5020,7648],},{id:'liyue16',coords:[5433,7424],},{id:'liyue17',coords:[5315,7237],},{id:'liyue18',coords:[5621,7277],},{id:'liyue19',coords:[6090,6518],},{id:'liyue20',coords:[6198,5992],},{id:'liyue21',coords:[6619,6214],},{id:'liyue22',coords:[5656,6428],},{id:'liyue23',coords:[5594,4895],},{id:'liyue24',coords:[5856,6906],},{id:'liyue25',coords:[5804,6111],},{id:'liyue26',coords:[5249,6077],},{id:'liyue27',coords:[4966,6035],},{id:'liyue28',coords:[5874,7315],},{id:'liyue29',coords:[5777,7168],},{id:'liyue32',coords:[5657,5210],},{id:'liyue31',coords:[5301,5127],},{id:'liyue32',coords:[4872,5081],},{id:'liyue33',coords:[5100,5711],},{id:'liyue34',coords:[4700,5624],},{id:'liyue35',coords:[4478,6257],},{id:'liyue36',coords:[5423,5592],},{id:'liyue37',coords:[5029,5474],},{id:'liyue38',coords:[6301,5476],},{id:'liyue39',coords:[5852,4981],},{id:'liyue40',coords:[5534,6936],},{id:'dragonspine01',coords:[7272,5069],},{id:'dragonspine02',coords:[6720,5203],},{id:'dragonspine03',coords:[7155,5326],},{id:'dragonspine04',coords:[6991,5392],},{id:'dragonspine05',coords:[6700,5427],},{id:'dragonspine06',coords:[6551,5505],},{id:'dragonspine07',coords:[6937,5626],},{id:'dragonspine08',coords:[7157,5636],},{id:'dragonspine09',coords:[6848,5739],},{id:'dragonspine10',coords:[6632,5804],},{id:'dragonspine11',coords:[7151,5806],},{id:'dragonspine12',coords:[7478,5827],},{id:'inazuma01',coords:[9777,9186],},{id:'inazuma02',coords:[9951,9206],},{id:'inazuma03',coords:[10180,9298],},{id:'inazuma04',coords:[10267,9407],},{id:'inazuma05',coords:[10363,9659],},{id:'inazuma06',coords:[10543,9708],},{id:'inazuma07',coords:[10633,9871],},{id:'inazuma08',coords:[10571,9457],},{id:'inazuma09',coords:[10726,9240],},{id:'inazuma10',coords:[10528,9158],},{id:'inazuma11',coords:[10359,9052],},{id:'inazuma12',coords:[10268,8422],},{id:'inazuma13',coords:[8881,10064],},{id:'inazuma14',coords:[8682,10199],},{id:'inazuma15',coords:[8550,10577],},{id:'inazuma16',coords:[9381,9817],},{id:'inazuma17',coords:[8342,10144],},{id:'inazuma18',coords:[9300,10546],},{id:'inazuma19',coords:[8540,10786],},{id:'inazuma20',coords:[8102,10229],},{id:'inazuma21',coords:[9542,10209],},{id:'inazuma22',coords:[9170,10276],},{id:'inazuma23',coords:[9433,10309],},{id:'inazuma24',coords:[9620,10411],},{id:'inazuma25',coords:[10513,8829],},{id:'inazuma26',coords:[9582,9972],},{id:'inazuma27',coords:[6910,10223],},{id:'inazuma28',coords:[6903,10458],},{id:'inazuma29',coords:[7462,10432],},{id:'inazuma30',coords:[7204,10607],},{id:'inazuma31',coords:[6900,10655],},{id:'inazuma32',coords:[9844,11348],},{id:'inazuma33',coords:[10334,10908],},{id:'inazuma35',coords:[9823,10946],},{id:'inazuma36',coords:[10034,11049],},{id:'inazuma37',coords:[10624,11235],},{id:'inazuma38',coords:[10398,11454],},{id:'inazuma39',coords:[10312,11226],},{id:'inazuma40',coords:[10589,10941],},{id:'inazuma41',coords:[10333,11042],},],},{id:'anemoculus',group:anemoculusGroup,format:'image',icon:anemoculusIcon,checkbox:true,markers: [{id:'01',coords:[7417,4582],},{id:'02',coords:[7416,4692],},{id:'03',coords:[6563,4307],format:'video',video:'6_6zJaa7QBs',},{id:'04',coords:[6469,4264],format:'video',video:'x5FvBXcp3DQ',},{id:'05',coords:[7568,5027],},{id:'06',coords:[7262,4924],},{id:'07',coords:[6687,4658],format:'video',video:'ZAL2fY71RxM',},{id:'08',coords:[6548,4879],},{id:'09',coords:[7270,4968],format:'video',video:'JFUIB4B-p0M',},{id:'10',coords:[7707,4419],},{id:'11',coords:[7896,4332],},{id:'12',coords:[7781,4161],},{id:'13',coords:[7407,4351],},{id:'14',coords:[6648,5032],format:'video',video:'Xzp2unJgKhk',},{id:'15',coords:[8435,4022],format:'video',video:'l7hTqD1sKec',},{id:'16',coords:[7255,3769],},{id:'17',coords:[7344,3893],format:'video',video:'e2OmKND20Hs',},{id:'18',coords:[7738,3847],},{id:'19',coords:[7941,3696],},{id:'20',coords:[6824,4002],format:'video',video:'OhOu0m-Ts9s',},{id:'21',coords:[7327,5095],},{id:'22',coords:[7248,4717],},{id:'23',coords:[7374,4825],format:'video',video:'vLAplVUXMIA',},{id:'24',coords:[7405,4767],format:'video',video:'HVdPVfN3r-8',},{id:'25',coords:[6500,4126],},{id:'26',coords:[6575,4175],},{id:'27',coords:[6588,4116],text:'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',},{id:'28',coords:[7497,4794],},{id:'29',coords:[7545,4643],},{id:'30',coords:[7532,5129],text:'Utilisez les trois esprits du vent pour faire apparaître une colonne d\'air et accéder à cet anémoculus.',},{id:'31',coords:[7714,5282],text:'Vous devez terminer le succès <b>La meilleure de toutes les épées</b> pour accéder à cet anémoculus.',},{id:'32',coords:[7598,5442],},{id:'33',coords:[7839,5328],format:'video',video:'sWrcwJLE4r4',},{id:'34',coords:[7749,5173],},{id:'35',coords:[8055,5167],},{id:'36',coords:[8812,5016],format:'video',video:'qxncclUsFt0',},{id:'37',coords:[6891,4561],format:'video',video:'hEA_A5KRYTU',},{id:'38',coords:[7176,4892],},{id:'39',coords:[7094,4727],},{id:'40',coords:[6985,4734],format:'video',video:'EpnPeTBGwFs',},{id:'41',coords:[6839,4806],format:'video',video:'PWqxlUhudc4',},{id:'42',coords:[6873,4057],format:'video',video:'RCrg2TOUxhI',},{id:'43',coords:[7513,4927],format:'video',video:'h2xHNcGpJe4',},{id:'44',coords:[6425,4971],format:'video',video:'D2OlfK1CMRo',},{id:'45',coords:[6567,4468],},{id:'46',coords:[6608,4572],text:'Détruisez les ronces avec une attaque Pyro et grimpez sur le pilier.',},{id:'47',coords:[6638,4015],},{id:'48',coords:[6529,4025],},{id:'49',coords:[6524,3964],text:'Détruisez l\'amas de pierre pour accéder à l\'Anémoculus.',},{id:'50',coords:[6203,4342],},{id:'51',coords:[6120,4472],},{id:'52',coords:[6018,3998],},{id:'53',coords:[6165,3833],},{id:'54',coords:[6053,3798],},{id:'55',coords:[5848,3780],},{id:'56',coords:[5753,4092],},{id:'57',coords:[5875,4182],},{id:'58',coords:[5815,4058],format:'video',video:'eZTB79akfAc',},{id:'59',coords:[5975,3906],},{id:'60',coords:[5911,3951],},{id:'61',coords:[5962,3972],},{id:'62',coords:[6179,3723],format:'video',video:'SZ0-4fZBFx8',},{id:'63',coords:[6333,4000],format:'video',video:'lrokJSPyY2o',},],},{id:'geoculus',group:geoculusGroup,format:'image',icon:geoculusIcon,checkbox:true,markers: [{id:'001',coords:[4492,5715],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'002',coords:[4564,5419],},{id:'003',coords:[4846,5432],},{id:'004',coords:[5604,4866],},{id:'005',coords:[5673,4825],},{id:'006',coords:[5525,4713],},{id:'007',coords:[5562,4937],},{id:'008',coords:[5455,4884],},{id:'009',coords:[5427,4805],},{id:'010',coords:[5274,6028],},{id:'011',coords:[4970,6090],},{id:'012',coords:[5066,6011],},{id:'013',coords:[4485,5929],},{id:'014',coords:[6166,6717],},{id:'015',coords:[5054,7198],},{id:'016',coords:[4861,7170],},{id:'017',coords:[5328,6255],},{id:'018',coords:[6362,7285],format:'video',video:'NPFJ3s2DhZo',},{id:'019',coords:[5686,5178],},{id:'020',coords:[5559,5142],},{id:'021',coords:[5250,5044],},{id:'022',coords:[4751,6032],},{id:'023',coords:[4845,5212],},{id:'024',coords:[4898,5262],},{id:'025',coords:[6713,6779],},{id:'026',coords:[7160,6866],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'027',coords:[6892,6997],},{id:'028',coords:[7042,6762],},{id:'029',coords:[6909,6255],},{id:'030',coords:[5675,5246],},{id:'031',coords:[5695,5352],format:'video',video:'9nXo8Xe8cGw',},{id:'032',coords:[5776,5110],},{id:'033',coords:[5499,5298],},{id:'034',coords:[5269,4913],},{id:'035',coords:[5377,4954],},{id:'036',coords:[4904,5703],},{id:'037',coords:[4821,5667],},{id:'038',coords:[4849,5926],},{id:'039',coords:[4835,5910],},{id:'040',coords:[4609,5768],},{id:'041',coords:[4400,5697],},{id:'042',coords:[4296,5878],},{id:'043',coords:[4347,5981],},{id:'044',coords:[4288,5997],},{id:'045',coords:[4455,5935],format:'video',video:'THhpu38aWFw',},{id:'046',coords:[6419,6059],},{id:'047',coords:[6645,6036],},{id:'048',coords:[6595,6169],},{id:'049',coords:[6568,6192],},{id:'050',coords:[6117,5999],},{id:'051',coords:[6071,6114],},{id:'052',coords:[6247,6391],},{id:'053',coords:[5947,5075],},{id:'054',coords:[5948,5377],},{id:'055',coords:[5805,5759],},{id:'056',coords:[5774,5752],},{id:'057',coords:[5868,5827],},{id:'058',coords:[5917,6628],},{id:'059',coords:[5928,6323],},{id:'060',coords:[6003,6415],},{id:'061',coords:[5677,6377],},{id:'062',coords:[5353,5146],},{id:'063',coords:[5390,5120],},{id:'064',coords:[5790,5419],},{id:'065',coords:[5981,5707],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'066',coords:[5517,5203],},{id:'067',coords:[5714,5588],},{id:'068',coords:[6278,5432],},{id:'069',coords:[6285,6615],format:'video',video:'kA5Anc17mRw',},{id:'070',coords:[5237,5504],},{id:'071',coords:[5114,5241],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'072',coords:[5359,7497],},{id:'073',coords:[5447,7243],},{id:'074',coords:[5494,7087],format:'video',video:'Tmkw4w__EjI',},{id:'075',coords:[5514,7177],format:'video',video:'PXfpJwdAn9U',},{id:'076',coords:[5263,7155],},{id:'077',coords:[5706,4972],},{id:'078',coords:[4886,6002],},{id:'079',coords:[4534,5771],format:'video',video:'5GLMu91EMJ4',},{id:'080',coords:[4386,5912],},{id:'081',coords:[5834,5283],text:'Utilisez la compétence du Voyageur Géo pour atteindre ce Géoculus.',},{id:'082',coords:[6379,5705],},{id:'083',coords:[6430,5917],},{id:'084',coords:[5424,6551],},{id:'085',coords:[6595,5978],},{id:'086',coords:[4528,5679],},{id:'087',coords:[5590,5741],},{id:'088',coords:[5105,6814],},{id:'089',coords:[6229,5835],},{id:'090',coords:[5401,4492],text:'Terminez la quête \"Le Secret de Chi\" pour accéder à ce Géoculus.<br />Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/secret-de-chi/',},{id:'091',coords:[5296,4702],},{id:'092',coords:[5310,4767],text:'Entrez dans la petite grotte pour y trouver ce Géoculus.',},{id:'093',coords:[5626,4978],},{id:'094',coords:[5770,5219],},{id:'095',coords:[5183,5305],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'096',coords:[4493,5546],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'097',coords:[4704,6363],},{id:'098',coords:[4710,6499],text:'En haut de la tour, à l\'extérieur.',},{id:'099',coords:[4898,6900],},{id:'100',coords:[5000,6990],},{id:'101',coords:[4866,7304],},{id:'102',coords:[4873,7532],},{id:'103',coords:[5205,7496],},{id:'104',coords:[5549,7064],text:'Utilisez la compétence Géo du voyageur sur la plaque, pour faire apparaître des plateformes. Utilisez sa compétence, une seconde fois, sur la dernière plateforme pour atteindre ce Géoculus.',},{id:'105',coords:[5191,6826],text:'Après avoir fait descendre le niveau de l\'eau en activant les braséros et l\'intérupteur Géo, ramenez les fées (deux dans le bâtiment à l\'est et une dans le bâtiment ouest après avoir terminé le défi) jusqu\'à leur cour pour faire disparaître le bouclier. Ouvrez le coffre luxueux pour faire apparaître un vent ascendant et récupérer ce Géoculus.',},{id:'106',coords:[5250,6812],},{id:'107',coords:[4713,5819],text:'Ce Géoculus est accessible avec le succès \"Splendide vue\". Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',},{id:'108',coords:[4924,5914],text:'Accessible en résolvant l\'énigme pour déverrouiller l\'accès au Manoir Taishen.',},{id:'109',coords:[4942,5633],title:'Géoculus 109',},{id:'110',coords:[4980,5051],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'111',coords:[5484,5827],format:'video',video:'nE1ZIKxWsUY',},{id:'112',coords:[5616,5874],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'113',coords:[5464,5914],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'114',coords:[5195,5876],},{id:'115',coords:[5415,6311],},{id:'116',coords:[5663,6201],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'117',coords:[5797,6532],},{id:'118',coords:[5931,6382],text:'Détruisez le rocher qui obstrue les escaliers puis tuer le gardien des ruines qui protège la porte pour accéder au Géoculus.',},{id:'120',coords:[6340,6288],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'121',coords:[6365,6082],},{id:'122',coords:[6380,5810],text:'Utilisez la compétence Géo du voyageur pour atteindre ce Géoculus.',},{id:'123',coords:[6218,5908],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'124',coords:[6276,5764],},{id:'125',coords:[7267,7034],text:'Escaladez la plus haute montagne et planez en direction du bateau. Le Géoculus se trouve en haut du plus long mât.',},{id:'126',coords:[5636,7413],text:'Dans les buissons aux pieds de la statue se situe l\'entrée d\'une petite grotte où vous récupérez ce Géoculus.',},{id:'127',coords:[5595,7327],text:'Entrez dans le couloir, là où se trouve le flambeau et récupérez le Géoculus au bout de celui-ci.',},{id:'128',coords:[5671,6878],text:'Activez le moulin à vent avec la compétence Anémo de votre voyageur, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'129',coords:[5804,6817],text:'Allumez la torche pour faire apparaître un vent ascendant, pour pouvoir prendre de la hauteur de vol et récupérer ce Géoculus.',},{id:'130',coords:[5893,6784],},{id:'131',coords:[5567,5516],text:'Prennez de la hauteur pour passer par dessus le champ de force.',},{id:'132',coords:[5535,5064],},],},{id:'electroculus',group:electroculusGroup,format:'image',title:'Électroculus',icon:electroculusIcon,checkbox:true,markers: [{id:'01',coords:[10289,9426],},{id:'02',coords:[10315,9588],},{id:'03',coords:[10601,9416],},{id:'04',coords:[10787,9220],},{id:'05',coords:[10648,9170],},{id:'06',coords:[10593,9227],},{id:'07',coords:[10532,9143],},{id:'08',coords:[10399,8983],},{id:'09',coords:[10136,9293],},{id:'10',coords:[10753,10006],text:'L\'accès à cet électroculus se fait via une caverne dont l\'entrée se situe au niveau de la mer.',},{id:'11',coords:[10766,9130],},{id:'12',coords:[10504,9286],},{id:'13',coords:[10486,9222],},{id:'14',coords:[8952,10298],},{id:'15',coords:[8927,10195],},{id:'16',coords:[8784,10141],},{id:'17',coords:[8567,10599],text:'L\'entrée de la grotte se situe à la Mine Jakotsu.',},{id:'18',coords:[9416,9922],},{id:'19',coords:[8231,10416],},{id:'20',coords:[8330,10172],text:'Utilisez l\'électrogranum que l\'on aperçoit en haut à droite pour traverser la bulle et atteindre l\'électroculus.',},{id:'21',coords:[10184,9673],},{id:'22',coords:[10033,9167],text:'Près de la statue, grimpez dans l\'arbre et planez jusqu\'au toit. Continuez votre progression jusqu\'à atteindre cet électroculus.',},{id:'23',coords:[10489,9371],text:'Après avoir terminé le rituel de purification, en vous approchant de la grille, vous pouvez utiliser une clé pour l\'ouvrir et accéder à cet électroculus.',},{id:'24',coords:[10226,9487],text:'Après avoir récupéré la clé du puits dans la quête \"Rituel de purification du cerisier sacré\", explorez le puits pour trouver cet électroculus.',},{id:'25',coords:[10207,9479],text:'Après avoir récupéré la clé du puits dans la quête \"Rituel de purification du cerisier sacré\", explorez le puits pour trouver cet électroculus.',},{id:'26',coords:[10080,9905],},{id:'27',coords:[10116,9368],format:'video',video:'7vGX7hQonLM',},{id:'28',coords:[9182,10539],text:'L\'entrée se situe au niveau de la plage un peu plus à l\'ouest.',},{id:'29',coords:[9140,10544],text:'Grimpez sur les rochers à l\'est pour atteindre la cime de l\'arbre, car vous ne pouvez pas l\'escalader.',},{id:'30',coords:[8323,10277],},{id:'31',coords:[8421,10682],format:'video',video:'_a1NntGBqWE',},{id:'32',coords:[8540,10736],},{id:'33',coords:[8146,10266],},{id:'34',coords:[8113,10160],},{id:'35',coords:[9633,9861],},{id:'36',coords:[8492,10789],},{id:'37',coords:[8596,10520],},{id:'38',coords:[9343,10269],},{id:'39',coords:[10618,9307],},{id:'40',coords:[10635,8753],text:'Vous accédez à cette partie de la carte grâce à la quête \"Rituel de purification du cerisier sacré\".',},{id:'41',coords:[10934,9004],},{id:'42',coords:[10538,9196],text:'Vous devez être à la dernière étape de la quête \"Rituel de purification du cerisier sacré\" pour accéder à cet électroculus.',},{id:'43',coords:[8387,10785],},{id:'44',coords:[8469,10341],format:'video',video:'JyFwY6EqErY',},{id:'45',coords:[8178,10520],},{id:'46',coords:[9183,10115],},{id:'47',coords:[9137,10322],},{id:'48',coords:[9123,10416],},{id:'49',coords:[9132,10060],format:'video',video:'blSno1glbxo',},{id:'50',coords:[8337,10453],},{id:'51',coords:[8606,10733],},{id:'52',coords:[9347,9645],format:'video',video:'_0m89hKm8lg',},{id:'53',coords:[10503,9030],},{id:'54',coords:[9601,9987],format:'video',video:'pG7jtnZoJSw',},{id:'56',coords:[9611,8810],text:'Grimpez dans l\'arbre pour l’attraper.',},{id:'57',coords:[7945,10472],},{id:'58',coords:[10401,9196],},{id:'59',coords:[8527,10462],},{id:'60',coords:[8582,10443],},{id:'61',coords:[8583,10295],format:'video',video:'5KLlYWK6JJc',},{id:'62',coords:[10431,9086],},{id:'63',coords:[10309,9148],text:'L\'accès à la grotte ce fait depuis la plage, au nord-ouest.',},{id:'64',coords:[10250,9125],},{id:'65',coords:[10615,9106],},{id:'66',coords:[8249,10683],},{id:'67',coords:[8321,10632],},{id:'68',coords:[7758,10379],format:'video',video:'U9r_fnYLRvo',},{id:'69',coords:[9781,10244],},{id:'70',coords:[9281,10010],},{id:'71',coords:[8571,10676],},{id:'72',coords:[10366,10023],format:'video',video:'LDkSRXvQTKY',},{id:'73',coords:[8700,10413],format:'video',video:'UIaxl3K1hg0',},{id:'74',coords:[8415,10547],format:'video',video:'MdjV8pq1JKo',},{id:'75',coords:[8600,10625],format:'video',video:'LkGerCHBvm0',},{id:'76',coords:[8647,10986],},{id:'77',coords:[9372,10519],text:'Vous devez d\'abord avoir débloqué l\'accès au donjon \"Pavillon Shakkei\", en utilisant le canon sur la petite île au nord-est où se trouve aussi un téléporteur.',},{id:'78',coords:[9367,10459],},{id:'79',coords:[9263,10351],},{id:'80',coords:[9282,10368],},{id:'81',coords:[9299,10350],},{id:'82',coords:[9209,10335],},{id:'83',coords:[9201,10442],},{id:'84',coords:[9303,10259],},{id:'85',coords:[9401,10285],text:'L\'entrée de la grotte se situe au sud-ouest, vous n\'avez qu\'à suivre le chemin jusqu\'à la position de l\'électroculus, puis escalader le mur à votre gauche.',},{id:'86',coords:[9844,10029],format:'video',video:'PSnFAEx4ypI',},{id:'87',coords:[10410,8839],},{id:'88',coords:[10782,8748],text:'Utilisez la lentille de réminiscence pour scanner les petites statuettes et faire apparaître tout ce qui sera nécessaire à récupérer cet électroculus.',format:'video',video:'3mlFNweBKMg',},{id:'89',coords:[10563,9570],format:'video',video:'wuUyOrSLhVE',},{id:'90',coords:[10723,10035],format:'video',video:'dORLKBW872o',},{id:'92',coords:[6967,10640],},{id:'94',coords:[9217,10444],text:'Récupérez 3 clés dans la zone de Tatarasuna pour ouvrir la grille.',format:'video',video:'dLViekHkcNg',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/espadon-de-nagamasa/',},{id:'95',coords:[9147,10453],},{id:'96',coords:[9266,10517],format:'video',video:'NrrAWNQcVV0',},{id:'97',coords:[11100,8863],text:'Nécessite d\'avoir récupéré la lentille de réminiscence dans la quête \"Rituel de purification\" du Cerisier sacré.',format:'video',video:'srcem0oAHp4',},{id:'98',coords:[6690,10201],text:'Utiliser l\'électrogranum proche pour atteindre cet électroculus.',},{id:'99',coords:[9868,11331],},{id:'100',coords:[10067,11146],},{id:'101',coords:[7178,10457],},{id:'102',coords:[7201,10469],text:'Nécessite d\'avoir brisé le sceau du Cœur de Watatsumi dans la quête \"Les profondeurs baignées de lune\". Voir le guide.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/les-profondeurs-baignees-de-lune/',},{id:'91',coords:[6894,10484],},{id:'103',coords:[6814,10451],},{id:'93',coords:[6622,10524],text:'Utilisez l\'Électrogranum pour atteindre cet électroculus.',},{id:'104',coords:[7075,10643],text:'Utilisez l\'Électrogranum pour atteindre cet électroculus.',},{id:'105',coords:[10116,11091],text:'Vous débloquez l\'accès à cet électroculus grâce à la quête \"Reliques de Seirai\". Voir le guide.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/reliques-de-seirai/',},{id:'106',coords:[6946,10314],format:'video',video:'w7D5UDtLAtQ',},{id:'107',coords:[6979,10133],},{id:'108',coords:[7106,10253],},{id:'109',coords:[9861,11096],text:'Cet électroculus se trouve à l\'intérieur de l\'épave du bateau.',format:'video',video:'JsMSy-ObkQk',},{id:'110',coords:[9911,11090],text:'Cet électroculus se trouve à l\'intérieur de l\'épave du bateau.',format:'video',video:'YiIvHLlYaPU',},{id:'111',coords:[9881,11087],},{id:'112',coords:[10165,11010],text:'Utilisez l\'électrogranum pour atteindre cet électroculus.',},{id:'113',coords:[7171,10796],},{id:'114',coords:[6958,10718],},{id:'115',coords:[7127,10561],},{id:'116',coords:[6884,10548],text:'Brisez le rocher avec une attaque pyro.',},{id:'117',coords:[7043,10351],text:'Utilisez l\'électrogranum pour passer le champ de force. <b>Requiert le cerisier sacré au niveau 17&nbsp;!</b>',},{id:'118',coords:[10622,10910],},{id:'119',coords:[7295,10192],format:'video',video:'RhfBGuOD2YI',},{id:'120',coords:[7014,10720],format:'video',video:'gXEn_GgtBQ0',},{id:'121',coords:[7003,10251],format:'video',video:'bbLZN4_hL8Q',},{id:'122',coords:[6836,10348],},{id:'123',coords:[6729,10405],},{id:'124',coords:[9962,11091],text:'Ramenez la fée électro jusqu\'à son réceptacle en passant par la porte électro, afin d\'activer la branche de cerisier sacré. Invoquez l\'électrogranum puis utilisez les pierres de foudre pour atteindre l\'électroculus.',format:'video',video:'EkeR_UAkKKI',},{id:'125',coords:[10206,11017],text:'Utilisez la porte électro pour l\'atteindre cet électroculus.',format:'video',video:'5bXproYbzGE',},{id:'126',coords:[10372,11023],text:'Utilisez l\'électrogranum pour atteindre cet électroculus.',format:'video',video:'pQBphoYa3PY',},{id:'127',coords:[10406,11005],},{id:'128',coords:[10304,10970],},{id:'129',coords:[10372,10953],},{id:'130',coords:[10787,11126],format:'video',video:'ql3808ABWmc',},{id:'131',coords:[10653,11198],},{id:'132',coords:[10694,11064],},{id:'133',coords:[10389,11592],format:'video',video:'D7saGDFuBnk',},{id:'134',coords:[10301,11345],format:'video',video:'9YnKYBlquXE',},{id:'135',coords:[9691,10801],format:'video',video:'9Nt36l8_zsU',},{id:'136',coords:[10538,11462],format:'video',video:'YouDLmUEGww',},{id:'137',coords:[10374,11328],format:'video',video:'FjwVKCe3ecY',},{id:'138',coords:[10388,11316],format:'video',video:'N1X_FwDe3Ss',},{id:'139',coords:[10366,11227],format:'video',video:'kF7blG18yYM',},{id:'140',coords:[10800,11474],format:'video',video:'YNnvmkJY9U0',},{id:'141',coords:[10448,11225],format:'video',video:'dYxhqZXMDSE',},{id:'142',coords:[10921,11525],},{id:'143',coords:[10036,11561],text:'Utilisez l\'electrogranum pour récupérer cet électroculus.',},{id:'144',coords:[10250,11350],},{id:'145',coords:[10410,11438],},{id:'146',coords:[10490,11114],text:'Utilisez l\'electrogranum à gauche pour récupérer l\'électroculus à droite.',},{id:'147',coords:[9850,11394],},{id:'148',coords:[9916,11399],},{id:'149',coords:[10392,11338],format:'video',video:'mNDhLnLttIw',},{id:'150',coords:[10386,11302],format:'video',video:'AwUPpV97ze0',},],},{id:'panorama',group:panoramaGroup,format:'image',icon:panoramaIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7361,4246],title:'Cité du Vent',},{id:'mondstadt02',coords:[7566,4160],title:'Marais des gardiens célestes',},{id:'mondstadt03',coords:[7238,4611],title:'Terres du Vent',},{id:'mondstadt04',coords:[6964,4637],title:'Pays aux fontaines',},{id:'mondstadt05',coords:[6472,4782],title:'Manoir de l\'aube',},{id:'mondstadt06',coords:[6826,4299],title:'Cathédrale, Ordre de Favonius',},{id:'mondstadt07',coords:[6908,4417],title:'Bibliothèque, Ordre de Favonius',},{id:'mondstadt08',coords:[7909,4241],title:'Ancien Temple des Mille vents',},{id:'mondstadt09',coords:[7596,5242],title:'Cimetière d\'épées oublié',},{id:'mondstadt10',coords:[6341,3943],title:'Capitale des vents oubliés',},{id:'liyue01',coords:[5942,6869],title:'Pays des navires et du Commerce',},{id:'liyue02',coords:[5826,7259],title:'Pente Feigun',},{id:'liyue03',coords:[5947,7348],title:'Falaise Chihu',},{id:'liyue04',coords:[5707,7099],title:'Terrasse Yujing',format:'video',video:'YvF2VWtOiAc',},{id:'liyue05',coords:[5887,5473],title:'Poste d\'Observation',},{id:'liyue06',coords:[5911,5128],title:'Marais aux Roseaux',},{id:'liyue07',coords:[5859,6209],title:'Vestiges de Guili',},{id:'liyue08',coords:[5342,4798],title:'Monts Qingce',},{id:'liyue09',coords:[5046,5984],title:'Pics entre les nuages',},{id:'liyue10',coords:[4533,5968],title:'Arbre au clair de lune',},{id:'liyue11',coords:[4680,5810],title:'Forêt de Pierre Embrumée',},{id:'liyue12',coords:[5329,6411],title:'Jardin aux Sanglots',},{id:'liyue13',coords:[6366,6778],title:'Goutte dans l\'océan',},{id:'liyue14',coords:[4960,7342],title:'Derrière le Gouffre',},{id:'liyue15',coords:[4920,7000],title:'Ruines de Dunyu',},{id:'liyue16',coords:[4985,7544],title:'Tour solitaire de Qingxu',},{id:'liyue17',coords:[5367,6239],title:'Neuf Pilliers',},{id:'inazuma01',coords:[8825,10071],title:'Marée basse au milieu des flammes de la guerre',},{id:'inazuma02',coords:[10523,9158],title:'Sanctuaire de Narukami, Mont Yougou',},{id:'inazuma03',coords:[9782,9185],title:'Ritou, île de Narukami',},{id:'inazuma04',coords:[9583,9977],title:'Poste d\'observation des îles de Tatara',},{id:'inazuma05',coords:[10580,9458],title:'La forêt sacrée au clair de lune',},{id:'inazuma06',coords:[10397,9673],title:'Périphérie d\'Inazuma',},{id:'inazuma07',coords:[8504,10243],title:'Vallée de la fosse, île de Yashiori',},{id:'inazuma08',coords:[8304,10420],title:'Surplomb de la tête de serpent',},{id:'inazuma09',coords:[10098,10895],title:'Là où les nuages se rencontrent',},{id:'inazuma10',coords:[10139,11020],title:'Le village de pêcheurs silencieux',},{id:'inazuma11',coords:[9812,11048],title:'Le vaisseau amiral échoué',},{id:'inazuma12',coords:[7168,10612],title:'Le palais nacré',},{id:'inazuma13',coords:[6976,10567],title:'Les profondeurs baignées de lune',},{id:'inazuma14',coords:[6986,10612],title:'Le village du peuple des tréfonds',},{id:'inazuma15',coords:[9856,11337],title:'Là où la grande prêtresse suppléante réside',text:'Accessible uniquement après avoir complété la série de quêtes \"Neko est un chat\".',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/neko-est-un-chat/',},],},{id:'mondstadtshrine',group:mondstadtshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Mondstadt.',icon:mondstadtshrineIcon,checkbox:true,markers: [{id:'01',coords:[7338,3777],},{id:'02',coords:[7823,4062],},{id:'03',coords:[7653,5058],},{id:'04',coords:[7424,5270],},{id:'05',coords:[7346,4941],},{id:'06',coords:[7131,4669],},{id:'07',coords:[6778,4652],},{id:'08',coords:[6343,5074],},{id:'09',coords:[6426,4502],},{id:'10',coords:[6672,3900],},],},{id:'liyueshrine',group:liyueshrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs de Liyue.',icon:liyueshrineIcon,checkbox:true,markers: [{id:'01',coords:[6420,5642],},{id:'02',coords:[6064,5131],title:'Liyue Shrine 02',format:'popup',},{id:'03',coords:[5619,5028],title:'Liyue Shrine 03',format:'popup',},{id:'04',coords:[4834,5203],},{id:'05',coords:[4846,5439],},{id:'06',coords:[4725,5594],},{id:'07',coords:[4589,6214],},{id:'08',coords:[5061,6718],title:'Liyue Shrine 08',format:'popup',},{id:'09',coords:[5249,7294],title:'Liyue Shrine 09',format:'popup',},{id:'10',coords:[6826,7267],},],},{id:'inazumashrine',group:inazumashrineGroup,format:'image',text:'Requiert une Clé de Sanctuaire des Profondeurs d\'Inazuma.',icon:inazumashrineIcon,checkbox:true,markers: [{id:'01',coords:[9271,10581],},{id:'02',coords:[8509,10564],},{id:'03',coords:[9150,10393],},{id:'04',coords:[8380,10730],},{id:'05',coords:[10659,9468],},{id:'06',coords:[9703,8957],},{id:'07',coords:[7070,10297],},{id:'08',coords:[9939,11024],},],},{id:'seelie',group:seelieGroup,format:'video',icon:seelieIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[7696,4681],video:'TZB-uZuNvac',},{id:'mondstadt02',coords:[7447,5023],video:'PVpHrmzbLQE',},{id:'mondstadt03',coords:[6525,4307],video:'eplX5l7ngbE',},{id:'mondstadt04',coords:[7250,4914],video:'8qtVWkC7bO8',},{id:'mondstadt05',coords:[7745,4204],video:'c-X9r7vfjao',},{id:'mondstadt06',coords:[7905,4481],video:'lY2HX7YUUWA',},{id:'mondstadt07',coords:[7615,4348],video:'E8GOZ0nAU0c',},{id:'mondstadt08',coords:[7448,4467],video:'BAs6r_iiUeg',},{id:'mondstadt09',coords:[7549,4038],video:'r7c3zcIY-v4',},{id:'mondstadt010',coords:[7320,4602],video:'f6_G22FH9dw',},{id:'mondstadt11',coords:[7227,3996],video:'p_Xvn5hqACo',},{id:'mondstadt12',coords:[7461,3955],video:'V4O-TFPGxFY',},{id:'mondstadt13',coords:[7872,3757],video:'6dPYfTIguPY',},{id:'mondstadt14',coords:[7446,4780],video:'k82yijP8paU',},{id:'mondstadt15',coords:[7658,5265],video:'MrK1dFs8FtU',},{id:'mondstadt16',coords:[6565,4244],video:'8U-ZwGZ8uLI',},{id:'mondstadt17',coords:[6581,4152],video:'Qa0ORWhLwBg',},{id:'mondstadt18',coords:[7039,4919],video:'QsVK4EJq9_8',},{id:'mondstadt19',coords:[7881,5332],video:'2-fGTrJN85U',},{id:'mondstadt20',coords:[7015,4750],video:'8JwURhH-nCY',},{id:'mondstadt21',coords:[7102,4700],video:'6M3yxiRyEEo',},{id:'mondstadt22',coords:[6682,4921],video:'VHQjkYNj0Oc',},{id:'mondstadt23',coords:[6348,4793],video:'IGFumD1ZSBk',},{id:'mondstadt24',coords:[6662,4534],video:'fjJpahjTLEE',},{id:'mondstadt25',coords:[6323,4284],video:'nhP4xoHcREQ',},{id:'mondstadt26',coords:[6416,4097],video:'0HA_TTPgvvg',},{id:'mondstadt27',coords:[6492,3965],video:'eP1dr5g0Byc',},{id:'mondstadt28',coords:[6591,3983],video:'Xf4qcPL4Sxw',},{id:'mondstadt29',coords:[6205,4034],video:'RkRKS6N4qjw',},{id:'mondstadt30',coords:[5915,4152],video:'CVRj-04WnXo',},{id:'mondstadt31',coords:[6095,3905],video:'E60LRd6cbAc',},{id:'mondstadt32',coords:[7936,3783],video:'m2x9bAzSc8Q',},{id:'mondstadt33',coords:[5798,4027],video:'6appAY6Cyk0',},{id:'mondstadt34',coords:[5855,3825],video:'NLsF0VsYa_4',},{id:'mondstadt35',coords:[5773,4110],video:'ndADX_rsmDc',},{id:'mondstadt36',coords:[5993,3808],video:'3ZaParP1YnY',},{id:'mondstadt37',coords:[6121,3955],video:'0AL-_onB6yA',},{id:'mondstadt38',coords:[7653,5505],video:'MPO_MK96SKc',},{id:'liyue01',coords:[5428,4750],video:'eQrfEC7b6CE',},{id:'liyue02',coords:[5532,4885],video:'FMxuTJn-duM',},{id:'liyue03',coords:[5473,4865],video:'taH6kWMYiss',},{id:'liyue04',coords:[4744,5903],video:'pMddbiH5pF0',},{id:'liyue05',coords:[6598,6845],video:'a1sfn6x21r0',},{id:'liyue06',coords:[7171,6930],video:'yJPHSllYB08',},{id:'liyue07',coords:[7167,6841],video:'RWPImzEXz4M',},{id:'liyue08',coords:[6868,7025],video:'wr8_EANVU44',},{id:'liyue09',coords:[5717,5127],video:'rjJKg2oLHuc',},{id:'liyue10',coords:[4327,5965],video:'jkxNv0CBSqY',},{id:'liyue11',coords:[4430,6053],video:'hc4Xe-oICZc',},{id:'liyue12',coords:[4443,6039],video:'TPh9vWYzNu0',},{id:'liyue13',coords:[5431,5602],video:'SDFp2cMtP4s',},{id:'liyue14',coords:[5343,5169],video:'J3d_cu03bt8',},{id:'liyue15',coords:[5899,5541],video:'SetGcCBsUWY',},{id:'liyue16',coords:[5852,5733],video:'sG7kimUcxcw',},{id:'liyue17',coords:[5389,5246],video:'3rEII58ORQU',},{id:'liyue18',coords:[5921,5404],video:'cKKo4F15mJY',},{id:'liyue19',coords:[4811,5997],video:'EqzAvKr8GKE',},{id:'liyue20',coords:[5505,7389],video:'xsEcIWJrRrA',},{id:'liyue21',coords:[5455,7366],video:'zSbq9UXA_jo',},{id:'liyue22',coords:[5554,7230],video:'Y89ibWX8yVc',},{id:'liyue23',coords:[5259,7209],video:'0lLnN2BW7zU',},{id:'liyue24',coords:[4749,5400],video:'6euAMTzB5vY',},{id:'liyue25',coords:[5759,4937],video:'7gA02wg4lU8',},{id:'liyue26',coords:[6402,5952],video:'L8silP0r_KA',},{id:'liyue27',coords:[4404,5966],video:'MkFyqDMmGzs',},{id:'liyue28',coords:[4607,6035],video:'8tJcCGUNW28',},{id:'liyue29',coords:[4717,5991],video:'IpR4W1TnYxQ',},{id:'liyue30',coords:[5609,7043],video:'6knIjmpAZaU',},{id:'liyue31',coords:[5067,6136],video:'LoqV3GXvTso',},{id:'liyue32',coords:[5247,6028],video:'8b-dkoR90nk',},{id:'liyue33',coords:[5493,5741],video:'Pp9x6mfk9cM',},{id:'liyue34',coords:[5066,7212],video:'ci30v-Ehdos',},{id:'liyue3536',coords:[5008,5209],video:'2cE2w-E3_0A',},{id:'liyue37',coords:[4530,5792],video:'BtBev75avRI',},{id:'liyue38',coords:[4509,5725],video:'nqIe9Ahd8Lo',},{id:'liyue39',coords:[5683,5058],video:'5R_JHFbO_gs',},{id:'liyue40',coords:[6494,5955],video:'YKvzeL0zzwg',},{id:'liyue41',coords:[5627,6069],video:'tS-nrJ2ntEE',},{id:'liyue42',coords:[5651,5223],video:'wft4maj2L7c',},{id:'liyue43',coords:[6034,6781],video:'SxX_jqWzmTk',},{id:'liyue44',coords:[6061,6488],video:'Mf2exHVcN7s',},{id:'liyue45',coords:[5415,4507],video:'ddvpebbfmyA',},{id:'liyue46',coords:[4477,6360],video:'Kg_ftFxI6M8',},{id:'liyue47',coords:[6219,5818],video:'AH88NAC9Ejc',},{id:'liyue48',coords:[6296,5925],video:'aKtEf66nfiU',},{id:'liyue49',coords:[5796,5562],video:'6-6cJTNNabA',},{id:'liyue50',coords:[5622,4846],video:'BH3AVQr2zWg',},{id:'liyue51',coords:[5354,7347],video:'BFTs6XKpE6o',},{id:'liyue52',coords:[5438,7572],video:'mjgjTvhoZXU',},{id:'liyue53',coords:[5308,4916],video:'W8OV-oi07XE',},{id:'liyue54',coords:[5250,6200],video:'90mH0UfrKEY',},{id:'liyue55',coords:[5748,5232],video:'kURwSiYOUYM',},{id:'liyue56',coords:[4907,6924],video:'gcBJw9HA5ms',},{id:'liyue57',coords:[6283,6064],video:'giBeA0r38_E',},{id:'liyue58',coords:[6373,5727],video:'2g9oV0GKbZI',},{id:'liyue59',coords:[6073,5176],video:'BdPIlluGfAo',},{id:'liyue60',coords:[5559,5307],video:'hm8KxuohkII',},{id:'liyue61',coords:[5023,5507],video:'ReCDiaIhk4A',},{id:'liyue62',coords:[5319,5669],video:'IVgw0Cc6EJY',},{id:'liyue63',coords:[4559,5707],video:'C25uSRKHkQc',},{id:'liyue64',coords:[4933,5821],video:'MKSsJwA4ufk',},{id:'liyue65',coords:[5782,6038],video:'7NkRr9_Ywfw',},{id:'liyue66',coords:[5736,6183],video:'FFNg0Bw34gA',},{id:'liyue67',coords:[5819,6448],video:'ttZlSMhPBmc',},{id:'liyue68',coords:[5820,6698],video:'E_OAdyxhzj0',},{id:'liyue69',coords:[5026,7494],video:'l72UAiowmsQ',},{id:'liyue70',coords:[5634,7409],video:'HB6DkdMsbRo',},{id:'liyue71',coords:[5524,7141],video:'vEpDtV50ga4',},{id:'liyue72',coords:[5656,6977],video:'22HuP42ODeg',},{id:'liyue73',coords:[5177,7042],video:'ldXRAPv3WT0',},{id:'liyue74',coords:[5249,6906],video:'sbmT59ngFQw',},{id:'liyue75',coords:[4960,7066],video:'ZIlH24HUoNg',},{id:'liyue76',coords:[4844,7515],video:'F5dL0-m05wg',},],},{id:'fireseelie',group:fireseelieGroup,format:'video',icon:fireseelieIcon,checkbox:true,markers: [{id:'01',coords:[6766,5774],video:'2gjfTudQqfE',},{id:'02',coords:[6922,5167],video:'bDogNZ_QHmI',},{id:'03',coords:[6730,5315],video:'fod0Cqx8pBM',},{id:'04',coords:[7155,5510],video:'VtLkjOZs3BA',},{id:'05',coords:[6820,5713],video:'jj6WOhL6u7E',},{id:'06',coords:[7206,5295],video:'QVoCEF8XoR8',},{id:'07',coords:[7217,5425],video:'rILFfWIEfyk',},{id:'08',coords:[6597,5320],video:'e4QwjqVre-4',},{id:'09',coords:[7453,5755],video:'bmDtGK8sUXg',},{id:'10',coords:[7445,5610],video:'2uKhRyzb9dc',},{id:'11',coords:[7212,5919],video:'wo5BKCJNWF4',},{id:'12',coords:[6597,5624],video:'jRT7pYvpRtw',},{id:'13',coords:[6691,5473],video:'-JX7fyk_gxY',},{id:'14',coords:[6704,5483],video:'XZtRiBFBCsM',},{id:'15',coords:[6736,5469],video:'Rk_ge8GnTUg',},{id:'16',coords:[6487,5746],video:'vIFY0Jg0thg',},{id:'17',coords:[6628,5729],video:'HrlufjrQS2g',},{id:'18',coords:[7083,5339],video:'s4yakU2egBo',},{id:'19',coords:[7268,5692],video:'ecpS-CwCjsU',},{id:'20',coords:[7036,5642],video:'gttSS-qlo_0',},{id:'21',coords:[7091,5616],video:'t9T4R7ZkHXY',},{id:'22',coords:[7065,5701],video:'w0AZ5eE-QTo',},{id:'23',coords:[7013,5594],video:'_Nh2kU-ctXA',},{id:'24',coords:[6992,5514],video:'_3pPfuoi5N4',},{id:'25',coords:[6884,5728],video:'bB19m0CDDhU',},{id:'26',coords:[6682,5855],video:'I1YXpeZQWEQ',},{id:'27',coords:[7109,5739],video:'qXgG1uG5788',},{id:'28',coords:[7130,5646],video:'YRkjqFY1ePE',},{id:'29',coords:[7079,5626],video:'9SwlGp8Z6BA',},{id:'30',coords:[7027,5721],video:'WxJe3J2FMzk',},],},{id:'overlookingview',group:overlookingviewGroup,format:'image',title:'Succès - Splendide vue',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/splendide-vue/',checkbox:true,markers: [{id:'01',coords:[4714,5819],text:'Point de départ du succès.',icon:circleIcon,},{id:'02',coords:[4698,5937],text:'Oiseau numéro 1.',icon:oneIcon,},{id:'03',coords:[4349,5876],text:'Oiseau numéro 2.',icon:twoIcon,},{id:'04',coords:[4544,5591],text:'Oiseau numéro 3.',icon:threeIcon,},],},{id:'dungeon',group:dungeonGroup,format:'banner',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/donjons/',icon:domainIcon,markers: [{id:'spiralabyss',coords:[8812,5016],title:'Profondeurs spiralées',text:'Selon la légende, ceux qui mènent à l\'Île du ciel, aux yeux de Dieu en vision, voient l\'échelle sous une telle forme de spirale. Nous nous dirigeons vers l\'univers, ou ver l\'abîme. Cela ne fait aucune différence, car tout est inconnnu.',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/profondeurs-spiralees/',icon:spiralabyssIcon,},{id:'midsummercourtyard',coords:[7702,4162],title:'Jardin estival',text:'Suivant la chute d\'une antique civilisation, le domaine autrefois luxuriant du palais d\'été qui occupait ces lieux s\'enfonça dans le sol, pour finir par y disparaître à son tour, ne laissant comme témoins de son ancienne gloire que les arbres et les pierres centenaires.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Colère de tonnerre, Dompteur de tonnerre.</strong>',},{id:'forsakenrift',coords:[7034,4987],title:'Gorge de l\'oubli',text:'Dans les temps anciens, des personnes s\'aventuraient dans la vallée à la recherche de l\'arbre ancien de l\'autel. Ils chuchotaient leurs secrets en son creux, se délestant de leur fardeau. La Gorge de l\'oubli regorge de ces confidences.',format:'image',},{id:'valleyofremembrance',coords:[6807,4958],title:'Vallée de la réminiscence',text:'Le temps passa&nbsp;; le peuple du continent oublia les histoires du passé. Les hommes voulurent creuser la terre, pour retrouver les souvenirs qu\'ils avaient perdus. De l\'autre côté de l\'arbre ancien, les secrets d\'hier sont devenus les trésors d\'aujourd\'hui.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Ombre de la Verte chasseuse, Amour chéri.</strong>',},{id:'ceciliagarden',coords:[6378,4398],title:'Pépinière de cécilias',text:'Les cécilias qui d\'habitude fleurissent sur les hautes falaises poussaient autrefois ici dans la chaleur des serres. La civilisation qui aimait tant ces fleurs disparut, et avec elle leur doux parfum.',format:'image',},{id:'hiddenpalaceofzhouformula',coords:[5746,4964],title:'Palais secret de la Formule Zhou',text:'Le rituel qui scelle une des huit portes permet d\'endiguer les forces du mal. Il a été exécuté autrefois pour sceller dans ce dédale un dragon sans cornes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Sorcière des flammes ardentes, Sage de la traverse de feu.</strong>',},{id:'hiddenpalaceoflianshanformula',coords:[6561,5922],title:'Palais secret de Lianshan',text:'On raconte que les montages, de par leur regroupement, sont la demeure d\'incessantes tempêtes, et que les sourds grondements que l\'on peut parfois entendre à l\'entrée du domaine attirent les âmes curieuses.',format:'image',},{id:'domainofguyun',coords:[7101,6946],title:'Au-dessus des nuages',text:'Les illusions et les lamentations de ceux qui souhaitaient autrefois guider l\'humanité convergent ici. Bien qu\'ils hantent la Forêt de pierre de Guyun et que leur ambition soit toujours démesurée, ils ne peuvent que déverser leur rancune dans des cavernes souterraines désormais.',},{id:'taishanmansion',coords:[4972,5998],title:'Manoir Taishan',text:'Autrefois, les personnes désireuses d\'obtenir une audience avec les Adeptes devaient passer les épreuves du Ciel et de la Terre. Cette dernière se déroulait au Manoir Taishan qui est devenu un repaire de trésors depuis le départ de ses maîtres.',format:'image',},{id:'clearpoolandmounntaincavern',coords:[4718,5371],title:'Lagunes et montagnes',text:'Le Mont Aozang est une montagne qui cache trésors et secrets. Son lac semble ordinaire à première vue, mais à proximité se trouve une grotte qui connecte la terre au ciel, et dont des nuages émergent. Cet ensemble forme un paysage très particulier.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Chevalerie ensanglantée, Ancien rituel royal.</strong>',},{id:'eaglesgate',coords:[8014,5332],title:'Porte du Faucon',text:'Les âmes nobles aspirent à la quiétude au-dessus du monde ordinaire, semblables au faucon volant dans les cieux. Ceux qui, tel le faucon méprisaient les mortels et leurs querelles inutiles pouvaient trouver la paix à la Porte du Faucon.',icon:trouncedomainIcon,},{id:'templeofthewolf',coords:[7785,4490],title:'Temple du Loup',text:'Un temple qui fut autrefois dédié au Loup du Nord. On raconte que son esprit veille toujours sur Mondstadt dans un lieu lointain. Des monstres l\'occupent depuis son abandon.',icon:trouncedomainIcon,},{id:'templeofthelion',coords:[7580,4989],title:'Temple du Lion',text:'Un temple qui fut autrefois dédié au Lion du Sud. Abandonné depuis longtemps, les pissenlits transportés par les vents de Mondstadt sont le signe de sa bénédiction.',icon:trouncedomainIcon,},{id:'templeofthefalcon',coords:[7317,4511],title:'Temple du Faucon',text:'Un temple qui fut autrefois dédié au Faucon de l\'Ouest qui veilla sur Mondstadt pendant des millénaires. Ses courants d\'airs traversent encore les couleurs du bâtiment.',icon:trouncedomainIcon,},{id:'confrontstormterror',coords:[6012,4000],title:'Pénétrez dans l\'Antre de Stormterror',text:'Les tours brisées qui se dressent encore fièrement en disent long sur l\'histoire de ce lieu. Ses salles parcourues par des bourrasques sont toujours pleins de souvenirs et de songes.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',icon:trouncedomainIcon,},{id:'enterthegoldenhouse',coords:[5884,7559],title:'Entrer dans la Chambre d\'Or',text:'Les sombres nuages couvant sur Liyue se sont enfin dispersés. Le complot qui s\'était emparé de ces terres a été exposé au grand jour, grâce aux efforts combinés des Sept Étoiles, des Adeptes et de vous-même. Le souvenir de votre combat contre Tartaglia le Fatui est encore frais dans votre mémoire. Revivez vos souvenirs et plongez-vous à nouveau dans la bataille. Peut-être apprendrez-vous quelque chose de nouveau, qui sait&nbsp;?<br /><strong>Sets d\'artéfacts 5★&nbsp;: Rideau du gladiateur, Bande vagabonde.</strong>',icon:trouncedomainIcon,},{id:'domainofthewaywardpath',coords:[5254,7238],title:'Chemin sinueux',text:'Bien que les Pilleurs de trésors aient eu vent des richesses cachées ici, la localisation de ce lieu leur échappe encore. La convoitise excessive n\'apporte jamais rien de bon dans ce monde. Ce n\'est qu\'en lâchant prise qu\'un chemin se dessinera.',icon:trouncedomainIcon,},{id:'hiddenpalaceofguizangformula',coords:[5616,6556],title:'Palais secret de Guizang',text:'Le lac parait limpide, mais cache en réalité des trésors si nombreux qui feraient perdre la raison à certains. Malheureusement, peu sont capables de révéler ses secrets.',icon:trouncedomainIcon,},{id:'domainofforsakenruins',coords:[5966,6274],title:'Ruines abandonnées',text:'La plupart des personnes qui venaient ici convoitaient seulement des trésors qui se trouvaient à proximité. Aujourd\'hui, cet endroit, autrefois prospère, est abandonné.',icon:trouncedomainIcon,},{id:'peakofvindagnyr',coords:[6964,5614],title:'Pic de Vindagnyr',text:'Cette cité enterrée sous la glace répondait autrefois à quelque nom fier et romantique, tout comme la montagne était autrefois luxuriante. Mais suite à la chute de la gigantesque pointe gelée tombée du ciel appelée &laquo;&nbsp;Mandrin céleste&nbsp;&raquo;, la voix des cieux s\'est tue, et ce lieu où les prêtres s\'assemblaient autrefois lors de leurs célébrations est aujourd\'hui vide de leur présence.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Briseur de glace, Âme du naufragé.</strong>',},{id:'ridgewatch',coords:[6465,5190],title:'Garde de la montagne',text:'Se dressant fièrement au commencement de la crète, ces ruines antiques dominent le nord comme le sud, veillant sur les montagnes et les marais. On prétend que ses portes ne s\'ouvrent que pour ceux dont le c&oelig;urbrûle d\'un feu inextinguible.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Ténacité du Millelithe, Flamme blème.</strong>',},{id:'emptyboatofathousandgates',coords:[10610,8836],title:'Navire aux mille portes',text:'Cette demeure annexe tengu qui flotte sur la mer comme un bateau solitaire abritait autrefois les célèbres «&nbsp;Trois Yougou&nbsp;», et elle deviendrait plus tard la cage dans laquelle, désespérés, ils passèrent le reste de leurs jours.',icon:trouncedomainIcon,},{id:'courtofflowingsand',coords:[10550,9058],title:'Cour des sables mouvants',text:'En des temps immémoriaux, un souverain idiot rêvait de construire un haut jardin en hommage à l\'arbre sacré blanc plutôt qu\'aux sables antiques. Aujourd\'hui, seule la mort habite le royaume bâti sur le sable, mais cette volonté absurde du passé survit.<br><strong>Matériau d\'amélioration d\'arme.</strong>',},{id:'violetcourt',coords:[10079,9863],title:'Cour violette',text:'Jadis, dans un lointain passé, des montagnes s\'élevaient parfois plus haut que le ciel, et la terre était plus vaste que son dôme. Mais arriva un jour où le miroir se brisa, provoquant la montée des océans. Selon la légende, c\'est ainsi que ce jardin de cerisiers antiques s\'est séparé du reste des autres îles.<br /><strong>Matériau d\'amélioration d\'aptitude.</strong>',},{id:'shakkeipavilion',coords:[9372,10530],title:'Pavillon Shakkei',text:'Cette magnifique demeure a été construite par un guerrier reclus des temps anciens dans les profondeurs de la terre, en empruntant un paysage hors de ce monde. Un vieil excentrique désillusionné y a été retrouvé quelque temps plus tard.<br /><strong>Suivez le guide pour débloquer l\'accès à ce donjon.</strong>',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/les-contes-de-tatara/',icon:trouncedomainIcon,},{id:'formationestate',coords:[8372,10655],title:'Domaine de formation',text:'Cette demeure appartenait jadis à un haut-gradé de l\'armée d\'Orobashi no Mikoto, jusqu\'à ce que lui, sa divinité et le ciel soient déchirés par la foudre.<br /><strong>Nécessite d\'avoir complété la quête de l\'Héritage d\'Orobashi. Suivez le guide&nbsp;!</strong>',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/lheritage-dorobashi/',icon:trouncedomainIcon,},{id:'momijidyedcourt',coords:[8514,10435],title:'Cour Momiji',text:'Ce jardin a toujours vu la chute d\'innombrables feuilles rouges. Les causes perdues et les amours inoubliables du passé ont peut-être convergé vers les veines de la terre pour se condenser au sein des fruits de l\'arbre blanc.<br /><strong>Sets d\'artéfacts 5★&nbsp;: Réminiscence nostalgique, Emblème du destin brisé.</strong>',},{id:'palaceinapool',coords:[7278,10258],title:'Palais de l\'étang',text:'En des temps où la lune brillait davantage, ce bassin qui donnait accès à la porte du palais n\'était pas rempli par l\'eau de mer. Il baignait dans le clair de lune qui luisait comme du mercure.',format:'video',video:'wjLKw37x_xM',icon:trouncedomainIcon,},],},{id:'region',group:regionGroup,format:'region',icon:blankIcon,markers: [{id:'undefined',coords:[5517,6452],title:'Lac Luhua',},{id:'undefined',coords:[5321,6229],title:'Pente Cuijue',},{id:'undefined',coords:[4902,6503],title:'Vallée Tianqiu',},{id:'undefined',coords:[4453,6277],title:'Mont Nantianmen',},{id:'undefined',coords:[4247,5941],title:'Mont Hulao',},{id:'undefined',coords:[4386,5735],title:'Forêt de pierre<br>Huaguang',},{id:'undefined',coords:[4612,5823],title:'Pic Qingyun',},{id:'undefined',coords:[4562,5517],title:'Mont Aozang',},{id:'undefined',coords:[4959,5927],title:'Karst Jueyun',},{id:'undefined',coords:[5212,6870],title:'Tombeau Dunyu',},{id:'undefined',coords:[4970,7145],title:'Passe de Lingju',},{id:'undefined',coords:[5524,7144],title:'Mont Tianheng',},{id:'undefined',coords:[4842,7513],title:'Ravine Qingxu',},{id:'undefined',coords:[5947,7090],title:'Port de Liyue',},{id:'undefined',coords:[5893,6136],title:'Plaines Guili',},{id:'undefined',coords:[6336,6202],title:'Bancs de Yaoguang',},{id:'undefined',coords:[6396,5898],title:'Village Mingyun',},{id:'undefined',coords:[5792,5873],title:'Auberge Wangshu',},{id:'undefined',coords:[6856,6872],title:'Forêt de pierre<br>de Guyun',},{id:'undefined',coords:[5771,5462],title:'Marais Dihua',},{id:'undefined',coords:[6288,5360],title:'Sal Terrae',},{id:'undefined',coords:[5896,5178],title:'Porte de pierre',},{id:'undefined',coords:[5698,5075],title:'Pente Wuwang',},{id:'undefined',coords:[5483,4893],title:'Village de Qingce',},{id:'undefined',coords:[6540,4850],title:'Domaine de l\'Aurore',},{id:'undefined',coords:[6978,4754],title:'Deauclaire',},{id:'undefined',coords:[6561,4509],title:'Territoire des Loups',},{id:'undefined',coords:[6544,3918],title:'Canyon de<br>Brillecouronne',},{id:'undefined',coords:[5999,3904],title:'Antre de Stormterror',},{id:'undefined',coords:[6976,3991],title:'Lac de Cidre',},{id:'undefined',coords:[6949,4237],title:'Cité de Mondstadt',},{id:'undefined',coords:[7320,4194],title:'Bois des Murmures',},{id:'undefined',coords:[7479,4050],title:'Lac Tombétoile',},{id:'undefined',coords:[7410,3850],title:'Montagnes du Guet',},{id:'undefined',coords:[7913,3733],title:'Coin du Guet',},{id:'undefined',coords:[7866,4097],title:'Falaise Arrachétoile',},{id:'undefined',coords:[7854,4338],title:'Temple des Mille Vents',},{id:'undefined',coords:[7409,4671],title:'Ventlevé',},{id:'undefined',coords:[7721,5273],title:'Vallée Dadaupa',},{id:'undefined',coords:[8172,5159],title:'Cap de la Promesse',},{id:'undefined',coords:[8761,5103],title:'Récif de Musk',},{id:'undefined',coords:[7819,4872],title:'Côte du Faucon',},{id:'undefined',coords:[6556,5635],title:'Périphérie<br>de la Cité enfouie',},{id:'undefined',coords:[6817,5330],title:'Vallée Ronfledragon',},{id:'undefined',coords:[7137,5237],title:'Route enneigée',},{id:'undefined',coords:[7132,5540],title:'Palais antique<br>de la Cité enfouie',},{id:'undefined',coords:[7055,5674],title:'Mandrin céleste',},{id:'undefined',coords:[6959,5798],title:'Grotte Luminétoile',},],},{id:'quest',group:questGroup,format:'image',icon:questIcon,checkbox:true,markers: [{id:'dragonspine01',coords:[7245,5061],title:'La créature des montagnes',},{id:'dragonspine02',coords:[7229,5075],title:'Richesses de Dosdragon',},{id:'dragonspine03',coords:[6741,5161],title:'Enquête alpestre',},{id:'inazuma01',coords:[10202,9294],title:'Rituel de purification du cerisier sacré / Une histoire étrange à Konda',},{id:'inazuma02',coords:[10378,9670],title:'Le Jeu de Temari',},{id:'inazuma03',coords:[10539,9665],title:'L\'invitation de la Chambre Yae',},{id:'inazuma04',coords:[10559,9747],title:'Catherine à Inazuma ?',},{id:'inazuma05',coords:[10434,9676],title:'Le récit d\'un voyage international',},{id:'inazuma06',coords:[8495,10717],title:'Contempler trois mille lieues au loin',},{id:'inazuma07',coords:[8377,10253],title:'L\'héritage d\'Orobashi',},{id:'inazuma08',coords:[8294,10319],title:'Traitement de l\'île',},{id:'inazuma09',coords:[9242,10475],title:'Rêves d\'un épéiste',},{id:'inazuma10',coords:[5992,7248],title:'Une demeure au-dessus de l\'océan',},{id:'inazuma11',coords:[10502,9655],title:'Pizza d\'un autre monde',},{id:'inazuma12',coords:[8787,10119],title:'Le destin d\'un guerrier',},{id:'inazuma13',coords:[6619,10478],title:'Les profondeurs baignées de la lune',text:'Série de quatre quêtes&nbsp;:<br>&bull; L\'&oelig;il de Watatsumi<br>&bull; Croc de Watatsumi<br>&bull; Nageoire de Watatsumi<br>&bull; Queue de Watatsumi',},{id:'inazuma14',coords:[6650,10556],title:'Créature des mers solitaire',},{id:'inazuma15',coords:[7046,10634],title:'La plante divine des profondeurs',},{id:'inazuma16',coords:[10086,11039],title:'Reliques de Seirai',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/reliques-de-seirai/',},],},{id:'crimsonagate',group:crimsonagateGroup,format:'image',icon:crimsonagateIcon,checkbox:true,markers: [{id:'01',coords:[6778,5143],},{id:'02',coords:[6677,5249],text:'Dans l\'eau se trouvent 3 esprits de vent. <b>Faites celui sur la plaque de glace en dernier&nbsp;!</b> Une fois que la plaque a disparu, elle met du temps à revenir...',},{id:'03',coords:[6629,5268],text:'Tuez les Fatui aux alentours du coffre pour le déverrouiller. Interagissez avec pour obtenir l\'agate pourpre.',},{id:'04',coords:[6513,5405],text:'D\'abord, dégagez la plaque sous la glace (5) en récupérant l\'effet d\'un cristal de sang, puis marchez sur les plaques dans l\'ordre indiqué sur l\'image. Un coffre apparaît lorsque vous avez résolu l\'énigme. L\'agate pourpre se trouve à l\'intérieur.',},{id:'05',coords:[6635,5403],text:'Récupérez d\'abord un cristal de sang qui se trouve en bas du mont et tapez la glace.',},{id:'06',coords:[6705,5474],text:'Après avoir résolu l\'énigme avec les pilliers Cryo et tué les 3 gardiens, vous débloquez l\'accès à une grotte où se trouve l\'agate pourpre.',},{id:'07',coords:[6691,5485],text:'Faites apparaître un coffre en résolvant l\'énigme avec les pilliers Cryo. L\'agate pourpre se trouve à l\'intérieur.',},{id:'08',coords:[6659,5569],},{id:'09',coords:[6578,5578],text:'Terminez le défi pour faire apparaître le coffre contenant l\'agate pourpre. Prévoyez une équipe Pyro pour vous faciliter la tâche.',},{id:'10',coords:[6515,5579],},{id:'11',coords:[6499,5577],text:'Tuez les Brutocollinus devant la cabane pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'12',coords:[6537,5670],text:'Tuez le Chef Brutogivré pour faire appraitre le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'13',coords:[6685,5737],format:'video',video:'afYxkHMwUD0',},{id:'14',coords:[6702,5752],format:'video',video:'jZIL9zOgcx8',},{id:'15',coords:[6716,5714],},{id:'16',coords:[6730,5693],text:'Tuez les Fatui aux alentours pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'17',coords:[6753,5924],text:'Montez sur le flanc de la montagne et utilisez votre planeur pour atteindre cette agate pourpre.',},{id:'18',coords:[6803,5834],text:'Après avoir résolu la petite énigme avec les fées ardentes et tué le gardien, une grille s\'ouvre sur 3 coffres. Le coffre de droite donne l\'agate pourpre.',},{id:'19',coords:[6889,5760],},{id:'20',coords:[6889,5725],},{id:'21',coords:[6933,5785],text:'Ce coffre précieux qui contient une agate pourpre, se trouve derrière un mur de glace, à proximité l\'entrée de la Grotte Luminétoile. Il est également possible d\'y accéder depuis les hauteurs, grâce au planeur.',},{id:'22',coords:[6834,5514],},{id:'23',coords:[6868,5523],},{id:'24',coords:[6851,5565],text:'Après avoir tué le Chef Brutogivré. le coffre apparaît. L\'agate pourpre est à l\'intérieur.',},{id:'25',coords:[6866,5289],},{id:'26',coords:[6974,5242],},{id:'27',coords:[6960,5338],},{id:'28',coords:[7107,5350],},{id:'29',coords:[7082,5297],text:'Utilsez le cristal de sang qui se trouve au sud, pour briser la glace.',},{id:'30',coords:[7187,5377],},{id:'31',coords:[7203,5445],},{id:'32',coords:[7244,5419],},{id:'33',coords:[7375,5368],text:'Tuez les ennemis pour débloquer le coffre qui contient l\'agate pourpre.',},{id:'34',coords:[7280,5466],},{id:'35',coords:[7105,5476],text:'L\'agate pourpre se trouve dans le coffre disponible après avoir tué le gardien et vidé la salle grâce à l\'interrupteur.',},{id:'36',coords:[7139,5507],},{id:'37',coords:[7028,5497],},{id:'38',coords:[6989,5519],text:'Après avoir tué le Chef Brutogivré, le coffre apparait. L\'agate pourpre se trouve à l\'intérieur.',},{id:'39',coords:[6943,5549],},{id:'40',coords:[6928,5607],},{id:'41',coords:[6977,5620],},{id:'42',coords:[6994,5689],},{id:'43',coords:[7015,5672],},{id:'44',coords:[7027,5624],},{id:'45',coords:[7024,5594],},{id:'46',coords:[7035,5593],},{id:'47',coords:[7040,5756],},{id:'48',coords:[7055,5721],},{id:'49',coords:[7094,5725],text:'Marchez sur la zone de glace plus clair pour la rompre et accéder à l\'agate pourpre en dessous.',},{id:'50',coords:[7096,5718],text:'Terminez le défi pour obtenir le coffre de récompenses. L\'agate pourpre se trouve à l\'intérieur.',},{id:'51',coords:[7059,5683],title:'Agate pourpre 51',},{id:'52',coords:[7043,5658],},{id:'53',coords:[7058,5648],},{id:'54',coords:[7080,5669],},{id:'55',coords:[7054,5832],text:'Vous avez deux agates poupres à cette position. La première à l\'extérieur, sur le toit. La seconde dans le coffre dans la cabane, après avoir tué le Chef brutogivré.',},{id:'56',coords:[7018,6002],},{id:'57',coords:[7306,6036],text:'Tuez le gardien pour ouvrir le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'58',coords:[7251,5937],text:'Utilisez les esprits du vent sur le côté est du pic, pour le gravir plus rapidement. Vous en trouverez plusieurs le long de votre ascension.',},{id:'59',coords:[7330,5757],},{id:'60',coords:[7447,5751],},{id:'61',coords:[7518,5807],},{id:'62',coords:[7597,5649],text:'Depuis la falaise au sud de la Vallée Dadaupa, descendez vers un petit escarpement au nord de l\'île pour trouver un cristal de sang. Brisez-le puis dirigez-vous en planeur sur l\'île. Briser la glace éternelle sur place pour faire apparaître un coffre luxueux contenant l\'agate pourpre.',},{id:'63',coords:[7417,5564],text:'Utilisez les esprits du vent dans l\'ordre indiqué pour récupérer l\'agate pourpre dans les airs.',},{id:'64',coords:[7364,5587],},{id:'65',coords:[7332,5555],text:'Tuez les ennemis pour déverrouiller le coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'66',coords:[7310,5613],},{id:'67',coords:[7263,5656],text:'L\'agate pourpre se trouve dans le coffre accessible après avoir tué le roi des sangliers.',},{id:'68',coords:[7221,5608],},{id:'69',coords:[7118,5564],text:'Ce coffre précieux est disponible dans la salle secrète après avoir lu les 8 stèles. Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',},{id:'70',coords:[7168,5668],text:'Ce coffre précieux qui contient une agate pourpre est accessible après avoir complété le succès «&nbsp;Prêtre, princesse et scribe&nbsp;».',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',},{id:'71',coords:[7189,5729],},{id:'72',coords:[7246,5907],text:'Tuez les brutocollinus des alentours pour déverouiller l\'accès à ce coffre. L\'agate pourpre se trouve à l\'intérieur.',},{id:'73',coords:[7006,5709],},{id:'74',coords:[6963,5621],text:'Accessible uniquement après avoir débloqué le donjon du Pic de Vindagnyr.',},{id:'75',coords:[7064,5548],text:'Nourrissez les renards avec deux baies en les déposant dans le bol près de la tente pendant cinq (vrais) jours. Le sixième jour, un coffre précieux contenant l\'agate pourpre apparait.',},{id:'76',coords:[7018,5624],text:'À droite de la grille, il faut taper la glace éternelle en étant sous l\'effet d\'un cristal de sang et activez l\'interrupteur en dessous. L\'agate pourpre se trouve dans le coffre.',},{id:'77',coords:[6700,5438],},{id:'78',coords:[6646,5605],},{id:'79',coords:[7305,5755],},],},{id:'priestprincessscribe',group:priestprincessscribeGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',checkbox:true,markers: [{id:'priest',coords:[6831,5460],title:'Coffre de prêtre',icon:priestIcon,},{id:'princess',coords:[7317,5323],title:'Coffre de princesse',text:'Touchez l\'épée pour lancer le défi. Une fois terminé, le coffre apparaît.',icon:princessIcon,},{id:'scribe',coords:[6825,5719],title:'Coffre de scribe',text:'Déposez 3&nbsp;Cécilias pour obtenir le coffre de scribe.',icon:scribeIcon,},{id:'door',coords:[7159,5640],text:'Une fois que vous avez ramassez les 3 coffres (prêtre, princesse et scribe) vous pouvez ouvrir la porte.',icon:doorIcon,},],},{id:'challenge',group:challengeGroup,format:'video',icon:challengeIcon,checkbox:true,markers: [{id:'mondstadt01',coords:[6604,4695],text:'Ouvrez le coffre en moins de 30s.',video:'CEgU79_TBpI',},{id:'mondstadt02',coords:[7836,4131],text:'Ouvrez le coffre en moins de 60s.',video:'M8PVB6xzTFg',},{id:'mondstadt03',coords:[7550,4314],text:'Explosez les 4 tonneaux en moins de 20s.',video:'gVJ2wFUxmLs',},{id:'mondstadt04',coords:[7262,3993],text:'Tuez tous les ennemis en 30s.',video:'2Wt4GiS3m9M',},{id:'mondstadt05',coords:[7473,3881],text:'Tuez tous les ennemis en 60s.',video:'7mIc69g84ps',},{id:'mondstadt06',coords:[7650,3890],text:'Allumez tous les braseros et ouvrez le coffre en 30s.',video:'QAliyQcjZnQ',},{id:'mondstadt07',coords:[7723,3838],text:'Ouvrez le coffre en moins de 60s.',video:'O1ntwm61sTY',},{id:'mondstadt08',coords:[7736,3765],text:'Ouvrez le coffre en moins de 30s.',video:'8m2i0QQnIs4',},{id:'mondstadt09',coords:[6477,4195],text:'Tuez tous les ennemis en 20s.',video:'zkRXJYy5Xno',},{id:'mondstadt10',coords:[7137,4776],text:'Tuez tous les ennemis en 60s.',video:'_nDnHNluwLY',},{id:'mondstadt11',coords:[6957,4802],text:'Ouvrez le coffre en moins de 30s.',video:'uQZxXQY3AWU',},{id:'mondstadt12',coords:[6512,4398],text:'Ouvrez le coffre en moins de 20s.',video:'s2CQ4Ms4lbE',},{id:'mondstadt13',coords:[6201,4358],text:'Tuez tous les ennemis en 30s.',video:'ewteF9VNmrA',},{id:'mondstadt14',coords:[6055,3773],text:'Tuez tous les ennemis en 50s.',video:'EOJLR0_HX6o',},{id:'mondstadt15',coords:[6239,4106],text:'Tuez tous les ennemis en 30s.',video:'ZJo7JD4PJ_A',},{id:'mondstadt16',coords:[5773,3841],text:'Tuez tous les ennemis en 30s.',video:'ekGBUrJXAgA',},{id:'mondstadt17',coords:[5747,3896],text:'Ouvrez le coffre en moins de 50s.',video:'cCdHlxM9vQI',},{id:'mondstadt18',coords:[6765,5221],text:'Ouvrez le coffre en moins de 30s.',video:'jkZ5FrdO1jo',},{id:'mondstadt19',coords:[6942,5136],text:'Explosez les 3 tonneaux en moins de 30s.',video:'y9SkYCW8H-M',},{id:'mondstadt21',coords:[7399,5777],text:'Explosez les 5 tonneaux en moins de 30s.',video:'fkH9RxiwsbA',},{id:'mondstadt22',coords:[7325,6113],text:'Ouvrez le coffre en moins de 16s.',video:'GzHhQauia3g',},{id:'mondstadt23',coords:[7089,6005],text:'Ramassez 8 particules Anémo en moins de 50s.',video:'Otq1FHm-8QY',},{id:'mondstadt24',coords:[7094,5715],text:'Tuez tous les ennemis en 180s.',video:'LB27Cg3VVFA',},{id:'mondstadt25',coords:[7031,5341],text:'Tuez tous les ennemis en 60s.',video:'s6_DTpfCq7U',},{id:'mondstadt26',coords:[7179,5647],text:'Ramassez 8 particules Anémo en moins de 40s.',video:'_ZvpOhy1sAI',},{id:'mondstadt27',coords:[6582,5564],text:'Tuez tous les ennemis en 180s.',video:'dafebp9OHw8',},{id:'mondstadt28',coords:[7083,5659],text:'Ramassez 8 particules Anémo en moins de 90s.',video:'Br_EgHkBgi4',},{id:'mondstadt29',coords:[6917,5815],text:'Ramassez 8 particules Anémo en moins de 60s.',video:'FIh3-KW0msw',},{id:'mondstadt30',coords:[7265,5532],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'aK36viVPF7Y',},{id:'mondstadt31',coords:[6560,5312],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'el4GWAKYR8o',},{id:'mondstadt32',coords:[6638,5606],text:'Ramassez 12 particules Anemo en moins de 90s.',video:'yxPqcqZJjv4',},{id:'mondstadt33',coords:[6892,5361],text:'Ramassez 8 particules Anemo en moins de 40s.',video:'l6D9_HMnGrk',},{id:'mondstadt34',coords:[6969,5289],text:'Explosez les 3 tonneaux en 30s.',video:'Iug37KvN6Ig',},{id:'liyue01',coords:[5494,4766],text:'Tuez tous les ennemis en 30s.',video:'WziDtNmzLJs',},{id:'liyue02',coords:[5552,4919],text:'Explosez les 5 tonneaux en moins de 60s.',video:'j_bXfT81rGI',},{id:'liyue03',coords:[6366,5360],text:'Explosez les 5 tonneaux en moins de 15s.',video:'3EDE6sVWo0E',},{id:'liyue04',coords:[6104,5421],text:'Tuez tous les ennemis en 45s.',video:'0FEn7bu1L5U',},{id:'liyue05',coords:[5526,7305],text:'Tuez tous les ennemis en 50s.',video:'7-S5hlf4x7g',},{id:'liyue06',coords:[5525,7174],text:'Tuez tous les ennemis en 120s.',video:'hI7o0nAknI4',},{id:'liyue07',coords:[5986,6017],text:'Tuez tous les ennemis en 45s.',video:'HGLc8MbzV78',},{id:'liyue08',coords:[7101,6926],text:'Tuez tous les ennemis en 45s.',video:'paTQhEX5xfg',},{id:'liyue09',coords:[4274,5804],text:'Tuez tous les ennemis en 30s.',video:'9T9SNniy_QI',},{id:'liyue10',coords:[4207,5983],text:'Tuez tous les ennemis en 30s.',video:'NCXRp1fAwJI',},{id:'liyue11',coords:[4522,5981],text:'Tuez tous les ennemis en 30s.',video:'yLAvPbLl3tE',},{id:'liyue12',coords:[4598,5312],text:'Ouvrez le coffre en moins de 45s.',video:'JosesYBjnFs',},{id:'liyue13',coords:[5971,5319],text:'Tuez tous les ennemis en 30s.',video:'fCU6_w1WjY4',},{id:'liyue14',coords:[4569,5919],text:'Tuez tous les ennemis en 45s.',video:'MchxMKPL8HM',},{id:'liyue15',coords:[6547,5941],text:'Tuez tous les ennemis en 60s.',video:'5PLcwdPCMj8',},{id:'liyue16',coords:[5728,5192],text:'Tuez tous les ennemis en 60s.',video:'8h7uku-mzQ0',},{id:'liyue17',coords:[5151,6827],text:'Tuez tous les ennemis en 60s.',video:'Ry_cmN8d458',},{id:'liyue18',coords:[5989,4968],text:'Explosez les 3 tonneaux en 40s.',video:'ht7Byu-vQHQ',},{id:'liyue19',coords:[5077,5154],text:'Tuez tous les ennemis en 60s.',video:'E5uxaP5Alkc',},{id:'liyue20',coords:[4591,5431],text:'Tuez tous les ennemis en 45s.',video:'sqqj6jDEg60',},{id:'liyue21',coords:[4611,6356],text:'Ouvrez le coffre en moins de 10s.',video:'QVaamsfMYbg',},{id:'liyue22',coords:[4488,6299],text:'Ouvrez le coffre en moins de 15s.',video:'QamwKZhAcoM',},{id:'liyue23',coords:[6271,5937],text:'Tuez tous les ennemis en 60s.',video:'ze55XkHGaJs',},{id:'liyue24',coords:[4959,6610],text:'Tuez tous les ennemis en 30s.',video:'noHy6OJvE68',},{id:'liyue25',coords:[6595,6213],text:'Tuez tous les ennemis en 30s.',video:'1fwIumFImo8',},{id:'liyue26',coords:[5324,6566],text:'Explosez les 3 tonneaux en 15s.',video:'MZ7mIrDfUEs',},{id:'liyue27',coords:[4912,6825],text:'Tuez tous les ennemis en 60s.',video:'H8Rn4xkV_HQ',},{id:'liyue28',coords:[6563,6173],text:'Explosez les 3 tonneaux en 25s.',video:'WS32im-CGQM',},{id:'liyue29',coords:[4496,5599],text:'Tuez tous les ennemis en 45s.',video:'KrliK1l9lNY',},{id:'liyue30',coords:[4632,5661],text:'Ouvrez le coffre en moins de 38s.',video:'-NBpUVa3xxc',},{id:'liyue31',coords:[4573,5764],text:'Tuez tous les ennemis en 30s.',video:'kqBaV3x8W1s',},{id:'liyue32',coords:[4625,5776],text:'Ouvrez le coffre en moins de 18s.',video:'aQuLCJ95ZLk',},{id:'liyue33',coords:[4763,5765],text:'Tuez tous les ennemis en 50s.',video:'RW8aafDfrKU',},{id:'liyue34',coords:[4969,5877],text:'Tuez tous les ennemis en 30s.',video:'T5ILVhvfwE0',},{id:'liyue35',coords:[5320,6073],text:'Tuez tous les ennemis en 60s.',video:'Gm2J0MSo_6M',},{id:'liyue36',coords:[5272,6300],text:'Tuez tous les ennemis en 30s.',video:'XpdzdjGwZCA',},{id:'liyue37',coords:[4988,6692],text:'Tuez tous les ennemis en 50s.',video:'cMjdQxGRruk',},{id:'liyue38',coords:[4855,7524],text:'Ouvrez le coffre en moins de 60s.',video:'aw2-YywoxRg',},{id:'liyue39',coords:[5142,7530],text:'Tuez tous les ennemis en 60s.',video:'EXUrFc7WiQw',},{id:'liyue40',coords:[5649,6878],text:'Explosez les 4 tonneaux en 30s.',video:'O-GVDdA1rw8',},{id:'liyue41',coords:[6244,6106],text:'Ouvrez le coffre en moins de 20s.',video:'xkF9Hq8V2YI',},],},{id:'unusualhilichurl',group:unusualhilichurlGroup,format:'simple',title:'Brutocollinus étranges',guide:'https://gaming.lebusmagique.fr/genshin-impact/succes/au-defi/#bruto-etrange',icon:unusualhilichurlIcon,markers: [{id:'01',coords:[6456,4658],},{id:'02',coords:[5940,4076],},{id:'03',coords:[7346,3802],},{id:'04',coords:[7408,4752],},{id:'05',coords:[7689,5194],},{id:'06',coords:[8269,5023],},{id:'07',coords:[5969,5079],},{id:'08',coords:[5522,4748],},{id:'09',coords:[4687,5797],},{id:'10',coords:[4966,6005],},{id:'11',coords:[4816,6498],},{id:'12',coords:[5275,6240],},{id:'13',coords:[5082,7309],},{id:'14',coords:[6005,6821],},{id:'15',coords:[6532,5993],},],},{id:'glacialsteel',group:glacialsteelGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/froides-sapeques/',icon:glacialsteelIcon,checkbox:true,markers: [{id:'01',coords:[7261,5280],title:'Stèle n°&nbsp;1',},{id:'02',coords:[6854,5433],title:'Stèle n°&nbsp;2',},{id:'03',coords:[6796,5814],title:'Stèle n°&nbsp;3',},{id:'04',coords:[6668,5510],title:'Stèle n°&nbsp;4',text:'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',},{id:'05',coords:[6995,5750],title:'Stèle n°&nbsp;5',},{id:'06',coords:[7169,5674],title:'Stèle n°&nbsp;6',text:'Vous devez d\'abord terminer le succès \"Prêtre, Princesse et Scribe\" pour accéder à cette stèle. Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/pretre-princesse-et-scribe/',},{id:'07',coords:[6953,5618],title:'Stèle n°&nbsp;7',},{id:'08',coords:[7132,5540],title:'Stèle n°&nbsp;8 et porte',},],},{id:'futileendeavor',group:futileendeavorGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/futile-expedition/',icon:futileendeavorIcon,checkbox:true,markers: [{id:'01',coords:[7309,6050],title:'Gardiens n°1 et 2',},{id:'02',coords:[7079,5356],title:'Gardiens n°3 et 4',},{id:'03',coords:[7061,5862],title:'Gardien n°5',},{id:'04',coords:[6720,5477],title:'Gardien n°6',text:'Accessible uniquement après avoir résolu l\'énigme et tué les 3 gardiens, dans la caverne sous la glace qui disparait.',},{id:'05',coords:[7103,5474],title:'Gardien n°7',},{id:'06',coords:[7134,5650],title:'Gardien n°8',},{id:'07',coords:[6633,5618],title:'Gardien n°9',},],},{id:'prodigalsonreturn',group:prodigalsonreturnGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-retour-du-fils-prodigue/',icon:prodigalsonreturnIcon,checkbox:true,markers: [{id:'01',coords:[6701,5756],title:'Notes abîmées n°&nbsp;1',},{id:'02',coords:[6638,5630],title:'Notes abîmées n°&nbsp;2',},{id:'03',coords:[7295,5710],title:'Notes abîmées n°&nbsp;3',},],},{id:'lostinthesnow',group:lostinthesnowGroup,format:'popup',title:'Royaumes sous les neiges',text:'Journal d’inspection ancien',icon:lostinthesnowIcon,checkbox:true,markers: [{id:'01',coords:[7129,5543],text:'Journal d’inspection ancien –&nbsp;<b>Partie I</b>.',},{id:'02',coords:[6943,5776],text:'Journal d’inspection ancien –&nbsp;<b>Partie III</b>.',},{id:'03',coords:[6789,5827],text:'Journal d’inspection ancien –&nbsp;<b>Partie II</b>.',},],},{id:'treasureguili',group:treasureguiliGroup,format:'image',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/le-tresor-des-plaines-guili/',icon:treasureguili01Icon,checkbox:true,markers: [{id:'01',coords:[5868,6302],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 1',},{id:'02',coords:[5957,6282],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 2',},{id:'03',coords:[6030,6369],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 3',},{id:'04',coords:[5968,6352],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 4',},{id:'05',coords:[5920,6377],title:'<em>Le trésor des Plaines Guili</em><br />Étape 1 - Stèle ancienne 5',},{id:'06',coords:[5653,6405],title:'<em>Le trésor des Plaines Guili</em><br />Étape 2 - Stèle en pierre 1',icon:treasureguili02Icon,},{id:'07',coords:[6047,6470],title:'<em>Le trésor des Plaines Guili</em><br />Étape 2 - Stèle en pierre 2',text:'Tuez les ennemis et brûlez les ronces pour entrer dans le bâtiment et interagir avec la stèle.',icon:treasureguili02Icon,},{id:'08',coords:[5743,5966],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 1',text:'Approchez du champ de force pour faire apparaître des monstres. Tuez-les pour le désactiver et interagir avec le disque.',icon:treasureguili03Icon,},{id:'09',coords:[6005,6172],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 2',text:'Tuez les pilleurs pour pouvoir interagir avec le disque.',icon:treasureguili03Icon,},{id:'10',coords:[6068,6464],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 3',icon:treasureguili03Icon,},{id:'11',coords:[5690,6348],title:'<em>Le trésor des Plaines Guili</em><br />Étape 3 - Disque 4',icon:treasureguili03Icon,},{id:'12',coords:[5906,6216],title:'<em>Le trésor des Plaines Guili</em><br />Étape 4 - Trésor et succès',text:'Activez le disque au nord et tuez les 3 gardiens des ruines pour accéder aux coffres.',icon:treasureguili04Icon,},],},{id:'boss',group:bossGroup,format:'image',markers: [{id:'stormterror',coords:[6012,4000],title:'Stormterror',icon:bossStormterrorIcon,},{id:'andrius',coords:[6407,4660],title:'Andros',icon:bossAndriusIcon,},{id:'hypostasisanemo',coords:[7443,3748],title:'Hypostase Anémo',icon:bossHypostasisAnemoIcon,},{id:'hypostasiselectro',coords:[8083,5346],title:'Hypostase Électro',icon:bossHypostasisElectroIcon,},{id:'regisvinecryo',coords:[7820,4555],title:'Arbre congelé',icon:bossRegisvineCryoIcon,},{id:'hypostasisgeo',coords:[6995,6608],title:'Hypostase Géo',icon:bossHypostasisGeoIcon,},{id:'regisvinepyro',coords:[5189,6504],title:'Arbre enflammé',icon:bossRegisvinePyroIcon,},{id:'oceanid',coords:[5864,4859],title:'Esprit des eaux',icon:bossOceanidIcon,},{id:'tartaglia',coords:[5895,7560],title:'Tartaglia',icon:bossTartagliaIcon,},{id:'primogeovishap',coords:[4678,6421],title:'Géolézard antique',icon:bossPrimoGeovishapIcon,},{id:'hypostasiscryo',coords:[6694,5482],title:'Hypostase Cryo',icon:bossHypostasisCryoIcon,},{id:'hypostasispyro',coords:[9324,9694],title:'Hypostase Pyro',icon:bossHypostasisPyroIcon,},{id:'azhdaha',coords:[4391,6041],title:'Azhdaha',icon:bossAzhdahaIcon,},{id:'maguukenki',coords:[8477,10599],title:'Lame Oni',icon:bossMaguuKenkiIcon,},{id:'permecarr',coords:[10612,8789],title:'Matrice mécanique perpétuelle',icon:bossPmaIcon,},{id:'signora',coords:[10704,10009],title:'Signora',icon:bossSignoraIcon,},{id:'thundermanifestation',coords:[10404,11359],title:'Manifestation du tonnerre',text:'Nécessite d\'avoir complété la quête \"Chasseurs d\'orage de Seirai\". Suivez le guide&nbsp;!',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/chasseurs-d-orage-de-seirai/',icon:bossThunderManifestationIcon,},{id:'hypostasishydro',coords:[7121,10202],title:'Hypostase Hydro',icon:bossHypostasisHydroIcon,},],},{id:'iron',group:ironGroup,format:'popup',title:'Fer',icon:ironIcon,checkbox:true,markers: [{id:'01',coords:[7561,4142],title:'Fer #01',},{id:'02',coords:[7659,4620],title:'Fer #02',},{id:'03',coords:[7474,4899],title:'Fer #03',},{id:'04',coords:[5817,4027],title:'Fer #04',},{id:'05',coords:[5996,5002],title:'Fer #05',},{id:'06',coords:[6306,4470],title:'Fer #06',},{id:'07',coords:[6333,5794],title:'Fer #07',},{id:'08',coords:[6905,4903],title:'Fer #08',},{id:'09',coords:[5720,6209],title:'Fer #09',},{id:'10',coords:[5997,6598],title:'Fer #10',},],},{id:'tinplate',group:tinplateGroup,format:'popup',title:'Fer blanc',icon:tinplateIcon,checkbox:true,markers: [{id:'01',coords:[6522,3985],title:'Fer blanc #01',},{id:'02',coords:[6498,4457],title:'Fer blanc #02',},{id:'03',coords:[7515,3924],title:'Fer blanc #03',},{id:'04',coords:[7778,3743],title:'Fer blanc #04',},{id:'05',coords:[8764,5012],title:'Fer blanc #05',},{id:'06',coords:[6110,5040],title:'Fer blanc #06',},{id:'07',coords:[5600,5482],title:'Fer blanc #07',},{id:'08',coords:[6367,5788],title:'Fer blanc #08',},{id:'09',coords:[4543,5548],title:'Fer blanc #09',},{id:'10',coords:[5149,5974],title:'Fer blanc #10',},{id:'11',coords:[4927,6500],title:'Fer blanc #11',},{id:'12',coords:[5085,7315],title:'Fer blanc #12',},{id:'13',coords:[5343,6939],title:'Fer blanc #13',},{id:'14',coords:[6337,6752],title:'Fer blanc #14',},{id:'15',coords:[6160,6232],title:'Fer blanc #15',},],},{id:'electrocristal',group:electrocristalGroup,format:'popup',title:'Électrocristal',icon:electrocristalIcon,checkbox:true,markers: [{id:'01',coords:[6018,3846],title:'Électrocristal #01',},{id:'02',coords:[6445,4490],title:'Électrocristal #02',},{id:'03',coords:[7512,3989],title:'Électrocristal #03',},{id:'04',coords:[7821,4200],title:'Électrocristal #04',},{id:'05',coords:[7701,4792],title:'Électrocristal #05',},{id:'06',coords:[8225,5115],title:'Électrocristal #06',},{id:'07',coords:[7832,5218],title:'Électrocristal #07',},{id:'08',coords:[7727,5398],title:'Électrocristal #08',},{id:'09',coords:[6609,5069],title:'Électrocristal #09',},{id:'10',coords:[6025,4862],title:'Électrocristal #10',},{id:'11',coords:[5817,5070],title:'Électrocristal #11',},{id:'12',coords:[5551,5263],title:'Électrocristal #12',},{id:'13',coords:[4773,5233],title:'Électrocristal #13',},{id:'14',coords:[5005,6172],title:'Électrocristal #14',},{id:'15',coords:[5387,6249],title:'Électrocristal #15',},{id:'16',coords:[5531,6551],title:'Électrocristal #16',},{id:'17',coords:[5986,6456],title:'Électrocristal #17',},{id:'18',coords:[6237,6113],title:'Électrocristal #18',},{id:'19',coords:[6757,6944],title:'Électrocristal #19',},],},{id:'fragrantcedar',group:fragrantcedarGroup,format:'popup',icon:fragrantCedarIcon,markers: [{id:'01',coords:[7822,3795],title:'Bois de cèdre parfumé 01',},{id:'02',coords:[7473,4134],title:'Bois de cèdre parfumé 02',},{id:'03',coords:[7362,4516],title:'Bois de cèdre parfumé 03',},{id:'04',coords:[7706,4456],title:'Bois de cèdre parfumé 04',},{id:'05',coords:[7474,4874],title:'Bois de cèdre parfumé 05',},{id:'06',coords:[7723,5281],title:'Bois de cèdre parfumé 06',},],},{id:'waverider',group:waveriderGroup,format:'image',title:'Téléporteur de barge',icon:waveriderIcon,checkbox:true,markers: [{id:'inazuma01',coords:[10424,8806],},{id:'inazuma02',coords:[10456,9593],},{id:'inazuma03',coords:[10842,9120],},{id:'inazuma04',coords:[7955,10300],},{id:'inazuma05',coords:[9607,10428],},{id:'inazuma06',coords:[10054,9651],format:'video',video:'hZfHrLu6xJU',},{id:'inazuma07',coords:[8188,10502],},{id:'inazuma08',coords:[9994,9010],},{id:'inazuma09',coords:[7095,10731],},{id:'inazuma10',coords:[6506,10424],},{id:'inazuma11',coords:[7379,10181],},{id:'inazuma12',coords:[9678,11335],},{id:'inazuma13',coords:[10245,10831],},{id:'inazuma14',coords:[9815,10915],},],},{id:'tokialleytales',group:tokialleytalesGroup,format:'image',icon:bookIcon,checkbox:true,markers: [{id:'01',coords:[10349,8500],title:'Contes de l\'Allée Toki - Prologue',text:'Dans une des cages de l\'Île de Jinren. Nécessite une clé en métal trouvée sur l\'île.',},{id:'02',coords:[9234,10460],title:'Contes de l\'Allée Toki - Tome I',text:'Obtenue dans la grotte verrouillée par une grille. Voir le guide de l\'Espadon de Nagamasa.',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/espadon-de-nagamasa/',},{id:'03',coords:[9509,10401],title:'Contes de l\'Allée Toki - Tome I',},{id:'04',coords:[10309,9148],title:'Contes de l\'Allée Toki - Prologue',text:'L\'entrée se fait par une grotte sur la plage à l\'ouest.',},{id:'05',coords:[8779,10075],title:'Contes de l\'Allée Toki - Tome II',},{id:'06',coords:[9306,10373],title:'Contes de l\'Allée Toki - Tome I',},{id:'07',coords:[10428,8932],title:'Contes de l\'Allée Toki - Prologue',},{id:'08',coords:[9594,9980],title:'Contes de l\'Allée Toki - Tome I',},{id:'09',coords:[9414,9925],title:'Contes de l\'Allée Toki - Tome I',},{id:'10',coords:[7747,10308],title:'Contes de l\'Allée Toki - Tome II',},{id:'11',coords:[10247,9424],title:'Contes de l\'Allée Toki - Prologue',},{id:'12',coords:[10019,9226],title:'Contes de l\'Allée Toki - Prologue',},{id:'13',coords:[6636,10504],title:'Contes de l\'Allée Toki - Tome IV',},{id:'14',coords:[7205,10572],title:'Contes de l\'Allée Toki - Tome IV',},{id:'15',coords:[7466,10441],title:'Contes de l\'Allée Toki - Tome IV',},{id:'16',coords:[9874,11084],title:'Contes de l\'Allée Toki - Tome III',},{id:'17',coords:[11063,8877],title:'Contes de l\'Allée Toki - Prologue',},{id:'18',coords:[10226,9470],title:'Contes de l\'Allée Toki - Prologue',text:'Dans le puit du village de Konda.',},{id:'19',coords:[8443,10635],title:'Contes de l\'Allée Toki - Tome II',},{id:'20',coords:[8542,10264],title:'Contes de l\'Allée Toki - Tome II',},{id:'21',coords:[8321,10399],title:'Contes de l\'Allée Toki - Tome II',},{id:'22',coords:[10527,9130],title:'Contes de l\'Allée Toki - Prologue',text:'Requiert le cerisier sacré au niveau 17 pour franchir la barrière électro.',},{id:'23',coords:[10485,8926],title:'Contes de l\'Allée Toki - Prologue',},{id:'25',coords:[7300,10190],title:'Contes de l\'Allée Toki - Tome IV',},{id:'26',coords:[8384,10333],title:'Contes de l\'Allée Toki - Tome II',},{id:'27',coords:[8433,10701],title:'Contes de l\'Allée Toki - Tome II',},{id:'28',coords:[7096,10754],title:'Contes de l\'Allée Toki - Tome IV',},{id:'29',coords:[10649,10876],title:'Contes de l\'Allée Toki - Tome III',},{id:'30',coords:[10555,11503],title:'Contes de l\'Allée Toki - Tome III',},{id:'31',coords:[10375,11012],title:'Contes de l\'Allée Toki - Tome III',},{id:'32',coords:[10120,11084],title:'Contes de l\'Allée Toki - Tome III',text:'Accessible pendant la quête \"Reliques de Seirai\".',guide:'https://gaming.lebusmagique.fr/genshin-impact/guides/reliques-de-seirai/',},{id:'33',coords:[8291,10268],title:'Contes de l\'Allée Toki - Tome II',},{id:'34',coords:[6827,10468],title:'Contes de l\'Allée Toki - Tome IV',},{id:'35',coords:[7133,10354],title:'Contes de l\'Allée Toki - Tome IV',},{id:'36',coords:[7833,10406],title:'Contes de l\'Allée Toki - Tome II',},{id:'37',coords:[6987,10624],title:'Contes de l\'Allée Toki - Tome IV',},{id:'38',coords:[6834,10701],title:'Contes de l\'Allée Toki - Tome IV',},{id:'39',coords:[9447,9856],title:'Contes de l\'Allée Toki - Tome I',},{id:'40',coords:[10413,11304],title:'Contes de l\'Allée Toki - Tome III',text:'Cette page énigmatique se trouve dans la grotte du Pic Amakumo.',},{id:'41',coords:[7061,10293],title:'Contes de l\'Allée Toki - Tome IV',},{id:'42',coords:[10565,11251],title:'Contes de l\'Allée Toki - Tome III',},{id:'43',coords:[9874,11409],title:'Contes de l\'Allée Toki - Tome III',},],},{id:'fishing',group:fishingGroup,format:'popup',title:'Point de pêche',guide:'https://gaming.lebusmagique.fr/genshin-impact/fonctionnalites/la-peche/',icon:fishinghookIcon,markers: [{id:'01',coords:[6943,4599],text:'&bull; Médaka sucrant et bleuté<br>&bull; &Eacute;pinoche dovenin<br>&bull; Akai maou<br>&bull; Poisson-papillon vert<br>&bull; Poisson-globe et poisson-globe amer',},{id:'02',coords:[7209,4380],text:'&bull; Médaka bleuté<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche dovenin<br>&bull; Koï rouillé<br>&bull; Poisson-papillon vert',},{id:'03',coords:[7462,3903],text:'&bull; Médaka sucrant et bleuté<br>&bull; Poisson cristal<br>&bull; Attrape-aube<br>&bull; &Eacute;pinoche dovenin<br>&bull; Koï doré<br>&bull; Poisson-papillon vert',},{id:'04',coords:[6015,4164],text:'&bull; Médaka sucrant et bleuté<br>&bull; Attrape-aube<br>&bull; Poisson-papillon vert',},{id:'05',coords:[6071,3769],text:'&bull; Médaka sucrant et bleuté<br>&bull; Attrape-aube<br>&bull; Poisson cristal',},{id:'06',coords:[7404,4796],text:'&bull; Médaka sucrant et bleuté<br>&bull; &Eacute;pinoche dovenin<br>&bull; Poisson-papillon vert',},{id:'07',coords:[6390,4945],text:'&bull; Médaka bleuté<br>&bull; Attrape-aube<br>&bull; &Eacute;pinoche dovenin<br>&bull; Akai maou<br>&bull; Poisson-papillon vert<br>&bull; Poisson-globe et poisson-globe amer',},{id:'08',coords:[5663,4833],text:'&bull; Médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron<br>&bull; Poisson-globe amer',},{id:'09',coords:[5715,5322],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson-papillon marron',},{id:'10',coords:[5585,5712],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'11',coords:[6083,6004],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'12',coords:[5004,5125],text:'&bull; Médaka<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron',},{id:'13',coords:[4487,5961],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-papillon marron',},{id:'14',coords:[5579,6518],text:'&bull; Médaka sucrant<br>&bull; &Eacute;pinoche combattante<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon marron',},{id:'15',coords:[4809,6510],text:'&bull; Médaka<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante',},{id:'16',coords:[6226,7407],text:'&bull; Médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche combattante<br>&bull; Poisson-globe',},{id:'17',coords:[9838,9206],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Akai maou<br>&bull; Poisson-globe et poisson-globe amer<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'18',coords:[10091,9905],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'19',coords:[8776,10049],text:'&bull; Médaka<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet<br>&bull; Poisson-globe amer<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'20',coords:[6948,10296],text:'&bull; Médaka et médaka verni<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'21',coords:[7402,10220],text:'&bull; Médaka et médaka verni<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Poisson-papillon violet<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'22',coords:[10199,11072],text:'&bull; Médaka verni<br>&bull; &Eacute;pinoche pulmonée<br>&bull; Akai maou<br>&bull; Koï doré et rouillé<br>&bull; Poisson-papillon violet<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'23',coords:[10285,11105],text:'&bull; Médaka<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; Poisson-papillon violet<br>&bull; Poisson-globe<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},{id:'24',coords:[6751,5670],text:'&bull; Médaka<br>&bull; &Eacute;pinoche dovenin<br>&bull; Arpente-neige<br>&bull; Poisson-papillon vert',},{id:'25',coords:[4568,5509],text:'&bull; Médaka et médaka sucrant<br>&bull; Attrape-aube<br>&bull; Poisson cristal<br>&bull; Scalaire chousei',},{id:'26',coords:[9781,10248],text:'Le scalaire raimei n\'apparait qu\'entre 18h et 6h, heure en jeu.<br><strong>Vous avez une petite chance de pêcher une page des Contes de l\'Allée Toki -&nbsp;Tome&nbsp;V.</strong>',},],},];



// Création de la carte
  L.tileLayer('assets/img/map-2.2/{z}/{x}/{y}.jpg', {
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
  map.setMaxBounds(new L.LatLngBounds(unproject([3584,3072]), unproject([12032, 14080])));



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
