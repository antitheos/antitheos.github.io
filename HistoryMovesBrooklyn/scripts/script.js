var map;
var center;
var centerLatLong;
var results;
var neighbourhoodIndex = {};
var markers = [];
var mapReady = false;
var neigborHoodsReady = false;

function loadNeighbourHoods() {
    if (!neigborHoodsReady || !mapReady) {
        //neighborboods and map are not ready, let us wait
        setTimeout(loadNeighbourHoods, 800);
        return;
    }


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
            person.mapObjects.push(marker);
            markers.push(marker);

        }
    }

    $(".sidebar div").click(function () {
        buttonClicked(this);
    });
}

$.getJSON("Data/pediacities-nyc-neighborhoods.json", function (json) {
    for (var i in json.features) {
        var obj = json.features[i];

        var key = obj.properties.neighborhood;
        var borough = obj.properties.borough;
        if (borough == "Brooklyn" || borough == null || borough == undefined) {
            if (key == "Parkside") {
                console.log(obj);

            }
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


    mapReady = true;
    //call method in async format!
    setTimeout(loadNeighbourHoods, 800);
}

function drawAreaShape(coordinates, color) {
    var area = new google.maps.Polygon({
        paths: [coordinates],
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
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


    $(".sidebar .personselector.selected").removeClass("selected");

    ele.addClass("selected");

    selectedAttr = null;

    selectedAttr = $(ele).find(".name").text();
    if (selectedAttr == "All") {
        selectedAttr = null;
    }


    for (var i in markers) {
        var m = markers[i];
        if (selectedAttr == null || selectedAttr == m.person) {
            m.setMap(map);
        } else {
            m.setMap(null);
        }
    }


}

var selectedAttr = null;
var data = {
    "Carmen": {
        "name": "Carmen",
        "color": "#0091EA",
        "neighborhoods": ["Park Slope"],
        "locations": [{ //40.,-73.
                "latitude": "40.6551599",
                "longitude": "-73.9449971",
                "category": "Hospital",
                "icon": "map-icon-health",
            },
            { //40.,-74.
                "latitude": "40.67931",
                "longitude": "-74.002098",
                "category": "School",
                "icon": "map-icon-university"
            },
            { //40.6757599,-73.9808751
                "latitude": "40.6757599",
                "longitude": "-73.9808751",
                "category": "Home",
                "icon": "map-icon-lodging"
            },
            { //40.6679966,-73.9791499
                "latitude": "40.6679966",
                "longitude": "-73.9791499",
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": "40.764715",
                "longitude": "-73.940301",
                "category": "Addiction Treatment",
                "icon": "map-icon-place-of-worship"
            },
            { //40.7524819,-73.9914569
                "latitude": "40.7524819",
                "longitude": "-73.9914569",
                "category": "Hospital",
                "icon": "map-icon-health"
            }]
    },
    "Barbara": {
        "name": "Barbara",
        "color": "#F4511E",
        "neighborhoods": ["Bedford-Stuyvesant", "East New York", "Brownsville"],
        "locations": [
            {
                "latitude": "40.6800476",
                "longitude": "-73.9390813",
                "category": "Home",
                "icon": "map-icon-lodging"
            },
            {
                "latitude": "40.659793",
                "longitude": "-73.894784",
                "category": "Home",
                "icon": "map-icon-lodging"
            },
            {
                "latitude": "40.658742",
                "longitude": "-73.894412",
                "category": "Home",
                "icon": "map-icon-lodging"
            },
            { //40.7474495	-73.7456514

                "latitude": "40.7474495",
                "longitude": "-73.7456514",
                "category": "School",
                "icon": "map-icon-university"
            },
            {
                "latitude": "40.6622861",
                "longitude": "-73.89481",
                "category": "School",
                "icon": "map-icon-university"
            },
            {
                "latitude": "40.6548311",
                "longitude": "-73.9123391",
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": "40.7691996",
                "longitude": "-73.9847828",
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": "40.6566016",
                "longitude": "-73.9462274",
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": "40.7187077",
                "longitude": "-73.7704641",
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": "40.6756593",
                "longitude": "-73.9276913",
                "category": "Event",
                "icon": "map-icon-jewelry-store"
            },
            {
                "latitude": "40.6986943",
                "longitude": "-73.9828011",
                "category": "Church",
                "icon": "map-icon-funeral-home"
            },
            {
                "latitude": "40.6800353",
                "longitude": "-73.945657",
                "category": "Addiction Treatment",
                "icon": "map-icon-place-of-worship"
            },
            {
                "latitude": "40.6782113",
                "longitude": "-73.9375313",
                "category": "Hospital",
                "icon": "map-icon-health"
            }]
    },
    "Carol": {
        "name": "Carol",
        "color": "#D500F9",
        neighborhoods: ["Parkside"],
        locations: [
            {
                "latitude": 40.655435,
                "longitude": -73.947912,
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": 40.6708378,
                "longitude": -73.9036833,
                "category": "Home",
                "icon": "map-icon-lodging"
            },
            {
                "latitude": 40.6514007,
                "longitude": -73.9139658,
                "category": "School",
                "icon": "map-icon-university"
            },
            {
                "latitude": 40.6716132,
                "longitude": -73.8933899,
                "category": "School",
                "icon": "map-icon-university"
            },
            {
                "latitude": 40.6738488,
                "longitude": -73.8961726,
                "category": "School",
                "icon": "map-icon-university"
            },
            {
                "latitude": 40.6814452,
                "longitude": -73.9496057,
                "category": "School",
                "icon": "map-icon-university"
            },

            {
                "latitude": 40.6550942,
                "longitude": -73.9126313,
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": 40.6924992,
                "longitude": -73.9865063,
                "category": "Location",
                "icon": "map-icon-health"
            },
            {
                "latitude": .674766,
                "longitude": -73.8748035,
                "category": "Health Center",
                "icon": "map-icon-health"
            },
            {
                "latitude": 40.752473,
                "longitude": -73.9936547,
                "category": "Hospital",
                "icon": "map-icon-health"
            },
            {
                "latitude": 40.692164,
                "longitude": -73.9877646,
                "category": "Health Center",
                "icon": "map-icon-health"
            }
        ]
    }
};