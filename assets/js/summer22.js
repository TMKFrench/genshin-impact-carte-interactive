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

  function updateislandmarkers (ileId, ilever, old) {
    hidelayer = window['l'+ileId+old];
    hidelayer.forEach(function(e) {
      map.removeLayer(window[ileId+old+e+'Group']);
    });
    showlayer = window['l'+ileId+ilever];
    window['menuActive'].forEach(function(e) {
      if (showlayer.indexOf(e) >=0) {
        map.addLayer(window[ileId+ilever+e+'Group']);
      }
    });
  }

  function updateislandmarkersmenu (type, add) {
    for (let i =1; i < 4; i++) {
      currentver = window['oldile'+i];
      if (window['lile'+i+currentver].indexOf(type) >=0) {
        if (add) {
          map.addLayer(window['ile'+i+currentver+type+'Group'])
        } else {
          map.removeLayer(window['ile'+i+currentver+type+'Group']);
        }
      };
    }
  }

  function updateislandmarkersinit () {
    for (let i =1; i < 4; i++) {
      window['menuActive'].forEach(function(e) {
        if (window['lile'+i+'1'].indexOf(e) >=0) {
          map.addLayer(window['ile'+i+'1'+e+'Group'])
        }
      });
    }
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
    };

  }

  function popUpOpen2(e) {
    var content = e.popup.getContent();
    island = $(content).find('input.item-ile').first().data('id');
    $('input[data-id="'+island+'"][data-ver="'+window['old'+island]+'"]').prop('checked', 'checked');
  }


  var currentMarker;
  var total = 0;
  var params = getParamsURL();
  var userMarkers = getUserMarkers();
  var userCountdowns = getUserCountdowns();
  var debugMarkers = [];
  var userLocal = true;
  var allMarkers = [];
  var oldile1 = 1, oldile2 = 1, oldile3 = 1;
  var menuActive = [];
  var lile11 = ['challenge'], lile12 = ['challenge','animauxtranslucide'], lile13 = ['challenge','animauxtranslucide'], lile14 = ['challenge','animauxtranslucide'], lile15 = ['challenge'], lile16 = ['challenge','animauxtranslucide'], lile17 = ['challenge','animauxtranslucide'], lile18 = ['challenge'], lile19 = ['challenge','animauxtranslucide'];
  var lile21 = ['challenge','animauxtranslucide'], lile22 = ['challenge','animauxtranslucide'];
  var lile31 = ['challenge','animauxtranslucide'], lile32 = ['challenge','animauxtranslucide'];

  // Initialisation de la carte
  var map = new L.Map('map', {
      center: [5,-15],
      zoom: 3,
      zoomControl: false
  });

  // Création de la carte
  L.tileLayer('assets/img/tiles-summer22/{z}/{x}/{y}.png', {
      attribution: '<a href="https://gaming.lebusmagique.fr">Le Bus Magique Gaming</a>',
      maxZoom: 5,
      minZoom: 2,
      continuousWorld: true,
      maxBoundsViscosity: 0.8,
      noWrap: true
  }).addTo(map);
 
  // var latLngBounds = L.latLngBounds([unproject([0,0])], [unproject([8192, 8192])]);
  var latLngBoundsile1 = L.latLngBounds([unproject([4953,4493])], [unproject([5774, 5181])]);
  var latLngBoundsile2 = L.latLngBounds([unproject([3186,5113])], [unproject([4706, 6054])]);
  var latLngBoundsile3 = L.latLngBounds([unproject([2840,3113])], [unproject([4114, 4054])]);

  for (let i = 1; i < 10; i++) {
    window['imageOverlayile1'+i] = L.imageOverlay('assets/img/tiles-summer22/ile1-'+i+'.png', latLngBoundsile1);   
  };

  for (let i = 1; i < 3; i++) {
    window['imageOverlayile2'+i] = L.imageOverlay('assets/img/tiles-summer22/ile2-'+i+'.png', latLngBoundsile2);   
  };

  for (let i = 1; i < 3; i++) {
    window['imageOverlayile3'+i] = L.imageOverlay('assets/img/tiles-summer22/ile3-'+i+'.png', latLngBoundsile3);   
  };
  
  imageOverlayile11.addTo(map);
  imageOverlayile21.addTo(map);
  imageOverlayile31.addTo(map);
  
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
          checkbox = '<label><input type="checkbox" id="user-marker" data-id="summer22' + g.id + m.id + '" /><span>Terminé</span></label>';

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
          marker.bindPopup(title+text+guide+checkbox, {className : 'normpop'});
        else if(format === 'video')
          marker.bindPopup(title+'<a class="video" href="//www.youtube.com/watch?v='+m.video+'" data-lity><img src="https://i.ytimg.com/vi/'+m.video+'/hqdefault.jpg" /></a>'+text+guide+checkbox, {className : 'normpop'});
        else if(format === 'image')
          marker.bindPopup(title+'<a href="assets/img/medias/sum22'+g.id+m.id+'.jpg" class="image" data-lity><img src="thumb/sum22'+g.id+m.id+'" /></a>'+text+guide+checkbox, {className : 'normpop'});
        else if(format === 'banner')
          marker.bindPopup(title+'<img src="assets/img/medias/sum22'+g.id+m.id+'.jpg" onerror="this.src=\'assets/img/medias/default.jpg\'" />'+text+guide+checkbox, {className : 'normpop'});
        else if(format === 'region')
          marker.bindTooltip(m.title, {permanent: true, className: 'region', offset: [0, 13], direction: 'top'}).openTooltip();
        else if(format === 'todo')
          marker.bindPopup('<h4>sum22' + g.id+m.id  + '</h4>'+'<p><em>Information pour ce marqueur prochainement disponible...</em></p>'+checkbox, {className : 'normpop'});
        else if(format === 'gif')
          marker.bindPopup(title+'<a href="assets/img/medias/sum22'+g.id+m.id+'.gif" class="image" data-lity><img src="assets/img/medias/sum22'+g.id+m.id+'.gif" /></a>'+text+guide+checkbox, {className : 'normpop'});


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

        if(userMarkers.indexOf('summer22'+g.id+m.id) >= 0 && !finished)
          marker.setOpacity(.5);

        if(params['debug'] && g.id !== 'region')
          debugMarkers.push({name: g.id+m.id, marker: marker, coords: m.coords, icon: icon});

        allMarkers[g.id+m.id] = marker;

      });

    });

    $('#total').text(total);

  }

  L.marker(unproject([5404, 4550]), {icon: layersIcon, riseOnHover: true}).on('click', updateCurrentMarker).bindTooltip("Changer la configuration de l'île", {offset : [20,0], direction : 'right'}).bindPopup('<form><input type="radio" class="item-ile radioile" id="ile11" name="configile1" data-id="ile1" data-ver="1"><label for="ile11"><span><img src="assets/img/config11.png" /> Rocaille sereine + Rocaille sereine</span></label><br><input type="radio" class="radioile" id="ile12" name="configile1" data-id="ile1" data-ver="2"><label for="ile12"><span><img src="assets/img/config12.png" /> Rocaille sereine + Rocaille lumineuse</span></label><br><input type="radio" class="radioile" id="ile13" name="configile1" data-id="ile1" data-ver="3"><label for="ile13"><span><img src="assets/img/config13.png" /> Rocaille sereine + Rocaille inflexible</span></label><br><input type="radio" class="radioile" id="ile14" name="configile1" data-id="ile1" data-ver="4"><label for="ile14"><span><img src="assets/img/config14.png" /> Rocaille lumineuse + Rocaille sereine</span></label><br><input type="radio" class="radioile" id="ile15" name="configile1" data-id="ile1" data-ver="5"><label for="ile15"><span><img src="assets/img/config15.png" /> Rocaille lumineuse + Rocaille lumineuse</span></label><br><input type="radio" class="radioile" id="ile16" name="configile1" data-id="ile1" data-ver="6"><label for="ile16"><span><img src="assets/img/config16.png" /> Rocaille lumineuse + Rocaille inflexible</span></label><br><input type="radio" class="radioile" id="ile17" name="configile1" data-id="ile1" data-ver="7"><label for="ile17"><span><img src="assets/img/config17.png" /> Rocaille inflexible + Rocaille sereine</span></label><br><input type="radio" class="radioile" id="ile18" name="configile1" data-id="ile1" data-ver="8"><label for="ile18"><span><img src="assets/img/config18.png" /> Rocaille inflexible + Rocaille lumineuse</span></label><br><input type="radio" class="radioile" id="ile19" name="configile1" data-id="ile1" data-ver="9"><label for="ile19"><span><img src="assets/img/config19.png" /> Rocaille inflexible + Rocaille inflexible</span></label></form>', {maxHeight : 350, minWidth : 350, className : 'radiopop'}).on('popupopen', popUpOpen2).addTo(map);
  L.marker(unproject([4206, 5318]), {icon: layersIcon, riseOnHover: true}).on('click', updateCurrentMarker).bindTooltip("Changer la configuration de l'île", {offset : [20,0], direction : 'right'}).bindPopup('<form><input type="radio" class="item-ile radioile" id="ile21" name="configile2" data-id="ile2" data-ver="1"><label for="ile21"><span><img src="assets/img/config21.png" /> Îles funestes - Configuration 1</span></label><br><input type="radio" class="radioile" id="ile22" name="configile2" data-id="ile2" data-ver="2"><label for="ile22"><span><img src="assets/img/config22.png" /> Îles funestes - Configuration 2</span></label></form>', {maxHeight : 350, minWidth : 350, className : 'radiopop'}).on('popupopen', popUpOpen2).addTo(map);
  L.marker(unproject([3688, 3812]), {icon: layersIcon, riseOnHover: true}).on('click', updateCurrentMarker).bindTooltip("Changer la configuration de l'île", {offset : [20,0], direction : 'right'}).bindPopup('<form><input type="radio" class="item-ile radioile" id="ile31" name="configile3" data-id="ile3" data-ver="1"><label for="ile31"><span><img src="assets/img/config31.png" /> Îles brisées - Montagnes hautes</span></label><br><input type="radio" class="radioile" id="ile32" name="configile3" data-id="ile3" data-ver="2"><label for="ile32"><span><img src="assets/img/config32.png" /> Îles brisées - Montagnes basses</span></label></form>', {maxHeight : 350, minWidth : 350, className : 'radiopop'}).on('popupopen', popUpOpen2).addTo(map);

  // Limites de la carte
  map.setMaxBounds(new L.LatLngBounds(unproject([0,0]), unproject([8192, 8192])));

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
            if(typeof window[type+'Group'] !== 'undefined') {
              $('#menu a[data-type="'+type+'"]').addClass('active');
              map.addLayer(window[type+'Group']);
              menuActive.push(type);
            }
          });
          updateislandmarkersinit();
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
      window['menuActive'] = [];
      groups.forEach(function(e) {
        map.removeLayer(window[e+'Group']);
      });    
      pmarkers.forEach(function(e) {
        if(typeof window[e+'Group'] !== 'undefined') {
          $('#menu a[data-type="'+e+'"]').addClass('active');
          map.addLayer(window[e+'Group']);
          window['menuActive'].push(e);
        }
      });
      updateislandmarkersinit();
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

    $(document).on('change', 'input[type="radio"]', function() {
      var ileId = $(this).data('id');
      var ilever = $(this).data('ver');
      old=window['old'+ileId];
      window['imageOverlay'+ileId+old].removeFrom(map);
      window['imageOverlay'+ileId+ilever].addTo(map);
      updateislandmarkers (ileId, ilever, old);
      window['old'+ileId]=ilever;
      currentMarker.closePopup();
    });

    $('#menu a[data-type]').on('click', function(e){
      e.preventDefault();

      var type = $(this).data('type');

      if($(this).hasClass('active')) {
        map.removeLayer(window[type+'Group']);
        window['menuActive'].splice(window['menuActive'].indexOf(type), 1);
        updateislandmarkersmenu (type, false);
        if(!userLocal)
          $.post('api/removemenu/'+type);
      } else {
        map.addLayer(window[type+'Group']);
        window['menuActive'].push(type);
        updateislandmarkersmenu (type, true);
        if(!userLocal)
          $.post('api/addmenu/'+type);
      }

      $(this).toggleClass('active');
    });

  });