(function() {

    mapboxgl.accessToken = 'pk.eyJ1IjoiZGZsb3Jlc2NwciIsImEiOiJjajdidzR2dHUweWtwMnZtamhpcGRqYjIzIn0.UTOUFTmg3TWCblnGKKqc7Q';

    var buttonIds = ['hamptonroads', 'richmond', 'fullextent'];
    var beforeMap = new mapboxgl.Map({
        container: 'before',
        style: 'mapbox://styles/dflorescpr/cje4cxx4g7hbz2rp7u620aosw',
        center: [0, 0],
        zoom: 0
    });

    var afterMap = new mapboxgl.Map({
        container: 'after',
        style: 'mapbox://styles/dflorescpr/cje4hfmaz3isv2snsivdxt6a1',
        center: [0, 0],
        zoom: 0
    });

    

    var maps = [{
            mapObject: beforeMap,
            layer: "trump-properties"
        },
        {
            mapObject: afterMap,
            layer: "trump-properties"
        }
    ];

    var compareMap = new mapboxgl.Compare(beforeMap, afterMap, {});

    maps.forEach(function(map) {

        map.mapObject.on('click', function(e) {

            console.log(e, map.layer, [e.target.style._layers[map.layer]].id);

            var features = map.mapObject.queryRenderedFeatures(e.point, {
                layers: [map.layer] // replace this with the name of the layer
            });

            if (!features.length) {
                return;
            }

            var feature = features[0];

            var popup = new mapboxgl.Popup({
                    offset: [0, -15]
                })
                .setHTML(buildPopup(map.layer, feature))
                .setLngLat(feature.geometry.coordinates)
                .addTo(map.mapObject);
        });

        map.mapObject.scrollZoom.disable();

        map.mapObject.addControl(new MapboxGeocoder({
            accessToken: mapboxgl.accessToken
        }));


        map.mapObject.addControl(new mapboxgl.NavigationControl());

        buttonIds.forEach(function(button) {

            flyHandler(button, map.mapObject);

        });

    });

    function flyHandler(id, map) {
        var button = document.getElementById(id);
        if (!button) return;


        button.addEventListener('click', function() {

            var zoom = +this.dataset.zoom,
                longitude = +this.dataset.longitude,
                latitude = +this.dataset.latitude;
            console.log('buttonclicked', this, zoom, latitude, longitude);

            map.flyTo({
                center: [longitude, latitude],
                zoom: zoom
            });
        });
    }

    function buildPopup(mapId, feature) {

        var popupContent;

        switch (mapId) {

            case 'trump-properties':
                popupContent = '<span>' + feature.properties.name + '</span>' +
                    '<img src=\"' + feature.properties.Image + '\" width=\"256\" height=\"256\"/>' +
                    '<span>' + feature.properties.Address + '</span>';
                break;

            case 'trump-properties':
                popupContent = '<span>' + feature.properties.name + '</span>' +
                    '<img src=\"' + feature.properties.Image + '\" width=\"256\" height=\"256\"/>' +
                    '<span>' + feature.properties.Address + '</span>';
                break;

            default:
                break;
        }

        return popupContent;
    }

}());