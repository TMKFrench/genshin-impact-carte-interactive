function onMapClick(e) {
  var txt = map.project([e.latlng.lat, e.latlng.lng], map.getMaxZoom());
  var uid = generateSerial(10);
  L.marker([e.latlng.lat, e.latlng.lng], {uid: uid, icon: window['dot'+color+'Icon']}).bindPopup('<input type="text" value="['+txt.x+','+txt.y+']" class="py-2 px-4 border rounded text-xs w-full text-center" onclick="select()" /><input type="text" value="['+e.latlng.lat+','+e.latlng.lng+']" class="py-2 px-4 border rounded text-xs w-full text-center mt-2" onclick="select()" /><a class="delete-point underline mt-2 font-bold inline-block" style="color:red!important;" href="#!">Supprimer</a>').on('click', updateCurrentMarker).addTo(map);

  addUserMarker(uid, txt.x, txt.y, e.latlng.lat, e.latlng.lng, color);
}

function generateSerial(len) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 10;
  var randomstring = '';

  for (var x=0;x<string_length;x++) {

    var letterOrNumber = Math.floor(Math.random() * 2);
    if (letterOrNumber == 0) {
      var newNum = Math.floor(Math.random() * 9);
      randomstring += newNum;
    } else {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum,rnum+1);
    }

  }
  return randomstring;
}

  function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
  }

  function updateCurrentMarker() {
    currentMarker = this;
  }

  function searchId(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
      if (myArray[i].uid === nameKey) {
        return i;
      }
    }

    return -1;
  }

  function addUserMarker(uid, x, y, lat, lng, color) {
    var markers = getUserMarkers();
    markers.push({uid: uid, x: x, y: y, lat: lat, lng: lng, color: color});

    localStorage.setItem('devMarkers', JSON.stringify(markers));
    userMarkers = JSON.stringify(markers);

    $('#menu a.export').attr('href', URL.createObjectURL( new Blob([userMarkers]) ));
  }

  function getUserMarkers() {
    var markers = localStorage.getItem('devMarkers');

    if(!markers) {
      markers = [];
    } else {
      markers = JSON.parse(markers);
    }

    return markers;
  }



  var currentMarker;
  var userMarkers = getUserMarkers();
  var color = 'red';



  // Initialisation de la carte
  var map = new L.Map('map', {
      center : [0,0],
      zoom : 4,
      zoomControl: false
  });


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

  var toolbarResetMarkers = L.easyBar([
    L.easyButton( '<img src="assets/img/reset.png" alt="Réinitialiser" title="Réinitialiser le suivi de vos marqueurs">',  function(control, map){
      if(confirm('Êtes-vous sûr de vouloir supprimer le suivi de vos marqueurs ?')) {
          localStorage.removeItem('devMarkers');
          window.location.reload();
      }
    }),
  ]);

  toolbarZoom.addTo(map);
  toolbarResetMarkers.addTo(map);


  // Icons

  var dotredIcon = L.icon({ iconUrl: 'assets/img/dotred.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotorangeIcon = L.icon({ iconUrl: 'assets/img/dotorange.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotyellowIcon = L.icon({ iconUrl: 'assets/img/dotyellow.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotpurpleIcon = L.icon({ iconUrl: 'assets/img/dotpurple.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotblueIcon = L.icon({ iconUrl: 'assets/img/dotblue.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotgreenIcon = L.icon({ iconUrl: 'assets/img/dotgreen.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });
  var dotgrayIcon = L.icon({ iconUrl: 'assets/img/dotgray.png', iconSize: [10,10], iconAnchor: [5,5], popupAnchor: [0, -5] });

  // Génération des marqueurs
  function initMarkers() {

    $('#menu a.export').attr('href', URL.createObjectURL( new Blob([JSON.stringify(getUserMarkers())]) ));

    userMarkers.forEach(function(g, i) {

      var marker = L.marker(unproject([g.x, g.y]), {uid: g.uid, icon: window['dot'+g.color+'Icon']})
          .bindPopup('<input type="text" value="['+g.x+','+g.y+']" class="py-2 px-4 border rounded text-xs w-full text-center" onclick="select()" /><input type="text" value="['+g.lat+','+g.lng+']" class="py-2 px-4 border rounded text-xs w-full text-center mt-2" onclick="select()" /><a class="delete-point underline mt-2 font-bold inline-block" style="color:red!important;" href="#!">Supprimer</a>')
          .on('click', updateCurrentMarker).addTo(map);

      });

  }




  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([1024,1024]), unproject([7168, 7168])));



  // Créer un marqueur au clic
  map.on('click', onMapClick);





  $(document).ready(function() {

    initMarkers();

    $(document).on('click', 'a.delete-point', function(e) {
      e.preventDefault();

      var markers = getUserMarkers();
      var i = searchId(currentMarker.options.uid, markers);
      if(i >= 0) {
        markers.splice(i, 1);
      }

      localStorage.setItem('devMarkers', JSON.stringify(markers));
      userMarkers = JSON.stringify(markers);
      $('#menu a.export').attr('href', URL.createObjectURL( new Blob([userMarkers]) ));

      map.removeLayer(currentMarker);

    })

    $('#menu a[data-type]').on('click', function(e){
      e.preventDefault();

      var type = $(this).data('type');

      $('#menu a.active').removeClass('active');
      $(this).addClass('active');
      color = type;
    });

    $(document).on('click', '#import button', function(e) {
      e.preventDefault();

      var data = $('#import #importdata').val();

      if(data.length > 0) {
        var userMarkers = getUserMarkers();
        var markers = JSON.parse(data);
        markers.forEach(function(m) {
          var uid = (typeof m.uid !== 'undefined') ? m.uid : null;
          var x = (typeof m.x !== 'undefined') ? m.x : null;
          var y = (typeof m.y !== 'undefined') ? m.y : null;
          var lat = (typeof m.lat !== 'undefined') ? m.lat : null;
          var lng = (typeof m.lng !== 'undefined') ? m.lng : null;
          var color = (typeof m.color !== 'undefined') ? m.color : null;

          if(uid && x && y && lat && lng && color) {
            var i = searchId(uid, userMarkers);
            if(i < 0) {
              addUserMarker(uid, x, y, lat, lng, color);
            }
          }
        });

        window.location.reload();
      }

    });

  });



