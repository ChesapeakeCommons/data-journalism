mapboxgl.accessToken = 'pk.eyJ1IjoicmRhd2VzMSIsImEiOiJ0OHNqNUFFIn0.KpaFJHMqmruQ9UFeg2ATeA'; // replace this with your access token


var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rdawes1/cj5y2l67e0tu92rl5e75r9osa'// replace this with your style
   
});

map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['sav-8-4-17-8d5m74'] // replace this with the name of the layer
    });

    if (!features.length) {
        return;
    }

    var feature = features[0];

     var popupContent = '<span>' + feature.properties.owner + '</span>' +
          '<img src=\"' + feature.properties.image + '\" width=\"256\" height=\"256\"/>' + 
          '<span>' + feature.properties.comment + '</span>';

          var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
          });






map.addControl(new mapboxgl.NavigationControl());

function flyHandler(id, options) {
  var button = document.getElementById(id);
  if(!button) return;
  button.addEventListener('click', function() {
    map.flyTo({
      center: options.center,
      zoom: options.zoom || 5
    });
    if (options.startDay) {
      console.log('Play from day', options.startDay);
      play(options.startDay);
    }
    if (options.speed) {
      setSpeed(options.speed);
    }
  });
}

flyHandler('bay', {
    center: [-77.736, 38.246],
    zoom: 7
});

flyHandler('sev', {
center: [-76.576, 39.052],
zoom: 12.2
});

flyHandler('chester', {
center: [-76.261,38.907],
zoom: 11.1
});

flyHandler('wye', {
center: [-76.224,38.698],
zoom: 10.4
});

flyHandler('jamestown', {
center: [-76.853,37.204],
zoom: 11.8
});

flyHandler('claybanklanding', {
center: [-76.876,37.285],
zoom: 12.7
});

flyHandler('richmond', {
center: [-77.496,37.542],
zoom: 11.5
});

flyHandler('palmayra', {
center: [-78.286,37.837],
zoom: 11.3
});


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}


