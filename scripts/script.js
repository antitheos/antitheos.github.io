var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.6782,
            lng: -73.9442
        },
        zoom: 12,
        // zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        //draggable: false,
        scrollwheel: false
    });

    for (var pIndex in data) {
        var person = data[pIndex];
        var color = person.color;
        for (var lIndex in person.locations) {
            var location = person.locations[lIndex];
            var myLatlng = new google.maps.LatLng(location.latitude, location.longitude);

            var marker = new Marker({
                map: map,
                position: myLatlng,
                icon: {
                    path: SQUARE_PIN,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0,
                    width: 30,
                    height: 30
                },
                map_icon_label: '<span class="map-icon ' + location.icon + '"></span>'
            });
            marker.person = person.name;
            markers.push(marker);




            //console.log(marker);
            /* var marker = new google.maps.Marker({
                 position: myLatlng,
                 title: location.category,
                 map: map
             });*/

        }
    }

    $(".sidebar div").click(function () {
        buttonClicked(this);
    });


}

function buttonClicked(e) {
    var ele = $(e);
    var hasItem = ele.hasClass("selected");
    $(".sidebar div.selected").removeClass("selected");
    selectedAttr = null;
    if (!hasItem) {
        ele.addClass("selected");
        selectedAttr = ele.text();


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
var data = [{
        "name": "Carmen",
        "color": "#0091EA",
        "locations": [{ //40.,-73.
                "latitude": "40.6551599",
                "longitude": "-73.9449971",
                "category": "Hospital",
                "icon": "map-icon-health"
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
    {
        "name": "Barbara",
        "color": "#F4511E",
        "locations": [{
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
    }
];

var markers = [];