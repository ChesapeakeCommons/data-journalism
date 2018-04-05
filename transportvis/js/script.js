var timeFactor = 2;

var tweenToggle = 0;

var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

var topLeft, bottomRight;

var time = moment();

var map = L.map('map', {
        zoomControl: false,
        maxZoom: 10,
        minZoom: 10
    })
    .addLayer(tiles)
    .setView([38.827, -75.946], 11);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

var transform = d3.geo.transform({
        point: projectPoint
    }),
    d3path = d3.geo.path().projection(transform);

d3.json('./paths.json', function(data) {

    console.log(data);

    var feature = g.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", function(d, i) {

            return "trip" + i + " " + true;

        })
        .attr("style", "opacity:0");

    console.log('feature', feature);

    var originArray = [],
        destinationArray = [];

    var origin_points = g.selectAll(".point--origin")
        .data(originArray);

    var destination_points = g.selectAll(".point--destination")
        .data(destinationArray);

    var origin_marker = g.append("circle"),
        destination_marker = g.append("circle");

    origin_marker.attr("r", 20)
        .attr("id", "marker--origin");

    destination_marker.attr("r", 5)
        .attr("id", "marker--destination");

    map.on("viewreset", reset);
    reset();

    var i = 0;

    function iterate() {

        var path = svg.select("path.trip" + i)
            .attr("style", "opacity:.7")
            .call(transition);

        console.log('pathbase', path);

        function pathEndPoints(path) {

            var d = path.attr('d');

            var splits = d.split('L');

            var first = splits[0].slice(1).split(",");

            var last = splits[splits.length - 1].slice(1).split(",");

            console.log('split', first, last);

            var points = {
                'start_': [],
                'end': []
            };

            points.start_[0] = +first[0];

            points.start_[1] = +first[1];

            points.end[0] = +last[0];

            points.end[1] = +last[1];

            return points;

        }

        var points_ = pathEndPoints(path);

        var origin = points_.start_;

        var destination = points_.end;

        console.log(points_, origin, destination);

        origin_marker.attr("transform", "translate(" + origin[0] + "," + origin[1] + ")")
            .transition()
            .duration(300)
            .attr("r", 20);

        destination_marker.attr("transform", "translate(" + destination[0] + "," + destination[1] + ")");

        path.each(function(d) {

            //add the translation of the map's g element
            origin[0] = origin[0];
            origin[1] = origin[1];
            var originLatLng = coordToLatLon(origin);

            originArray.push([originLatLng.lng, originLatLng.lat]);

            origin_points = g.selectAll(".point--origin")
                .data(originArray)
                .enter()
                .append('circle')
                .attr("r", 5)
                .attr("class", "point--origin")
                .attr("transform", function(d) {

                    console.log('d', d);

                    return translatePoint(d);

                });

            console.log('pathdata', d);

            $('#sender').text(" " + d.properties.source.properties.farm_name);

            $('#tons-exported').text(" " + d.properties.source.properties.manure_exported);

            $('#recipient').text(" " + d.properties.destination.properties.name);

            $('#distance').text(" " + Math.ceil(d.properties.distance) + " miles");

        });


        function transition(path) {

            console.log('path', path);

            path.transition()
                .duration(function(d) {
                    //calculate seconds
                    var start = Date.now(),
                        finish = start + 120000,
                        duration = 600000;

                    duration = duration / 60000; //convert to minutes

                    duration = duration * (1 / timeFactor) * 1000;

                    return (duration);
                    
                })
                .attrTween("stroke-dasharray", tweenDash)
                .each("end", function(d) {

                    var l = path.node().getTotalLength();

                    var dst = path.node().getPointAtLength(l);

                    console.log(dst);

                    var destLatLng = coordToLatLon([dst.x, dst.y]);

                    destinationArray.push([destLatLng.lng, destLatLng.lat]);

                    destination_points = g.selectAll(".point--destination")
                        .data(destinationArray)
                        .enter()
                        .append('circle')
                        .attr("r", 5)
                        .attr("class", "point--destination")
                        .attr("transform", function(d) {

                            return translatePoint(d);

                        });

                    origin_marker
                        .transition()
                        .duration(300)
                        .attr("r", 5);

                    i++;

                    var nextPath = svg.select("path.trip" + i);

                    if (nextPath[0][0] === null) {

                        //

                    } else {

                        setTimeout(iterate, 1000);

                    }

                });

        }

        function tweenDash(d) {

            var l = path.node().getTotalLength();

            var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

            return function(t) {

                var o = d3.select("#marker--origin");

                var p = path.node().getPointAtLength(t * l);

                o.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker

                if (tweenToggle === 0) {

                    tweenToggle = 1;

                    var newCenter = map.layerPointToLatLng(new L.Point(p.x, p.y));

                    map.panTo(newCenter, {
                        animate: true,
                        duration: 0.8,
                        easeLinearity: 0.8
                    });

                } else {

                    tweenToggle = 0;

                }

                return i(t);

            };

        }

    }

    iterate();

    // Reposition the SVG to cover the features.
    function reset() {

        var bounds = d3path.bounds(data);

        topLeft = bounds[0];

        bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0] + 100)
            .attr("height", bottomRight[1] - topLeft[1] + 100)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");

        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");

        feature.attr("d", d3path);

        //TODO: Figure out why this doesn't work as points.attr...
        g.selectAll(".point--origin")
            .attr("transform", function(d) {
                return translatePoint(d);
            });

        g.selectAll(".point--destination")
            .attr("transform", function(d) {
                return translatePoint(d);
            });

    }

});

// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function translatePoint(d) {
    var point = map.latLngToLayerPoint(new L.LatLng(d[1], d[0]));

    return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
    var point = map.layerPointToLatLng(new L.Point(coord[0], coord[1]));
    return point;
}