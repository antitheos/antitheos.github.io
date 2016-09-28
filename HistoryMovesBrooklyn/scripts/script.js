var map;
var center;
var centerLatLong;
var results;
var data;
var neighbourhoodIndex = {};
var markers = [];
var mapReady = false;
var neigborHoodsReady = false;
var dataReady = false;
var selectedAttr = null;
var mapInfoWindow = null;

function loadNeighbourHoods() {
    if (!neigborHoodsReady || !mapReady || !dataReady) {
        //neighborboods and map are not ready, let us wait
        setTimeout(loadNeighbourHoods, 800);
        return;
    }

    var sidebar = $("#sidebar");
    for (var name in data) {
        var person = data[name];
        var color = person.color;
        person.mapObjects = [];
        for (var lIndex in person.neighborhoods) {
            var area = person.neighborhoods[lIndex];
            if (area == undefined) {
                console.log(name + " not found: [" + area + "] property: [" + lIndex + "]")
                continue;
            }

            var areaObject = neighbourhoodIndex[area];
            if (areaObject != null && areaObject != undefined) {
                var area = drawAreaShape(areaObject.googleLatLongs, color);
                person.mapObjects.push(area);
                area.person = name;
                markers.push(area);
            } else {
                console.log("Not found: " + area)
            }
        }

        for (var lIndex in person.locations) {
            var location = person.locations[lIndex];
            var myLatlng = new google.maps.LatLng(location.latitude, location.longitude);


            var marker = new google.maps.Marker({
                position: myLatlng,
                visible: false,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: color,
                    fillOpacity: 0.8,
                    strokeWeight: 1,
                    strokeOpacity: 0.9,
                    strokeColor: color
                },
                title: location.category,
                map: map
            });
            marker.person = name;
            marker.location = location;
            person.mapObjects.push(marker);
            markers.push(marker);
            marker.addListener('click', function () {
                var loc = this.location;
                var text = "";
                if (loc.extract != undefined) {
                    var text = '<div class="mapwindow">' +
                        '<div class="mapwindowheader">' + loc.name + " - " + loc.time + '</div>' +
                        '<div>' + loc.extract + '</div>' +
                        '</div>'

                } else {
                    var text = '<div style="width:200px;height:100px;">' +
                        '<div>' + this.person + '</div>' +
                        '<div>' + loc.category + '</div>' +
                        '</div>'
                }

                mapInfoWindow.setContent(text);
                mapInfoWindow.open(map, this);
            });

        }
        var isactive = person.mapObjects.length == 0 ? "" : "active";
        var text = '<div class="personselector ' + isactive + '" data-name=' + name + '"><span class = "indicator" style = "background-color:' + color + '"></span><span class="name ">' + name + '</span></div>';
        var obj = sidebar.append(text);


    }

    $(".personselector.active").click(function () {
        buttonClicked(this);
    });

    sidebar.css("display", "");
    $("#allselector").click();
}

$.getJSON("Data/participants.json", function (json) {
    data = json;
    dataReady = true;

});

$.getJSON("Data/pediacities-nyc-neighborhoods.json", function (json) {
    for (var i in json.features) {
        var obj = json.features[i];

        var key = obj.properties.neighborhood;
        var borough = obj.properties.borough;
        if (borough == "Brooklyn" || borough == null || borough == undefined) {
            var coordinates = obj.geometry.coordinates[0];
            var latLongs = [];
            for (var l in coordinates) {
                var point = coordinates[l];
                var newLatLong = {
                    "lng": point[0],
                    "lat": point[1]
                };
                latLongs.push(newLatLong);
            }
            obj.googleLatLongs = latLongs;
            neighbourhoodIndex[key] = obj;
        }
    }
    neigborHoodsReady = true;

});

function initMap() {
    center = {
        lat: 40.6782,
        lng: -73.9442
    };
    centerLatLong = new google.maps.LatLng(center.lat, center.lng);

    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 12,
        // zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        //draggable: false,
        scrollwheel: false
    });

    mapInfoWindow = new google.maps.InfoWindow({});
    mapReady = true;
    //call method in async format!
    setTimeout(loadNeighbourHoods, 800);
}

function drawAreaShape(coordinates, color) {
    var area = new google.maps.Polygon({
        visible: false,
        paths: [coordinates],
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.35
    });
    //console.log(coordinates)
    //console.log(area)
    area.setMap(map);
    return area;
}

function buttonClicked(e) {
    var ele = $(e);
    if (ele.hasClass("selected")) {
        return; // selected nothing todo
    }

    $("#sidebar .personselector.selected").removeClass("selected");

    ele.addClass("selected");

    selectedAttr = null;

    selectedAttr = $(ele).find(".name").text();
    if (selectedAttr == "All") {
        selectedAttr = null;
    }

    var latlngbounds = new google.maps.LatLngBounds();


    for (var i in markers) {
        var m = markers[i];
        var isVisible = (selectedAttr == null || selectedAttr == m.person)
        m.setVisible(isVisible);
        if (isVisible) {
            if (m.position != undefined) {
                latlngbounds.extend(m.position);
            } else if (m.latLngs != undefined) {
                m.getPath().forEach(function (e) {
                    latlngbounds.extend(e);
                })
            }
        }

    }

    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
}



var iconIndex = {
    "School": "map-icon-university",
    "Health Center": "map-icon-health",
    "Hospital": "map-icon-health",
    "Prison": "",
    "Home": "map-icon-lodging"
}