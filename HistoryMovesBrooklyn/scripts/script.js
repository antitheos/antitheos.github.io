var map;
var center;
var centerLatLong;
var results;
var data = {};
var locationData = {};
var dataReady = false;
var partipants = {};
var participantsReady = false;
var sharedLocations = {};
var sharedLocationsReady = false;
var defaultColor = "green";

var neighbourhoodIndex = {};
var markers = [];
var mapReady = false;
var neigborHoodsReady = false;
var selectedAttr = null;
var mapInfoWindow = null;


function loadNeighbourHoods() {
    if (!neigborHoodsReady || !mapReady || !dataReady || !sharedLocationsReady || !participantsReady) {
        //neighborboods and map are not ready, let us wait
        console.log("not ready");
        setTimeout(loadNeighbourHoods, 800);
        return;
    }



    for (var lName in locationData) {
        var aLoc = locationData[lName];
        aLoc.sharedData = sharedLocations[lName];
        if (aLoc.sharedData != null) {
            aLoc.latitude = aLoc.sharedData.latitude;
            aLoc.longitude = aLoc.sharedData.longitude;
            aLoc.feature = aLoc.sharedData.feature;
            aLoc.category = aLoc.sharedData.category;
        }


        if (aLoc.feature == "Area") {
            var areaObject = neighbourhoodIndex[lName];
            if (areaObject != null && areaObject != undefined) {
                var area = drawAreaShape(areaObject.googleLatLongs, defaultColor);
                aLoc.paths = areaObject.googleLatLongs;
                addMapLocations(area, aLoc, name, person);
            } else {
                console.log("Not found: " + lName)
            }
        } else if (aLoc.feature == "Road") {
            if (aLoc.paths != null) {
                var road = new google.maps.Polyline({
                    path: aLoc.paths,
                    strokeColor: defaultColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    geodesic: true,
                    map: map
                });
                addMapLocations(road, aLoc, name, person);
            }

        } else if (aLoc.feature == "Location" && aLoc.latitude != "" && aLoc.longitude != "") {
            var myLatlng = new google.maps.LatLng(aLoc.latitude, aLoc.longitude);


            var marker = new google.maps.Marker({
                position: myLatlng,
                visible: false,
                icon: getIcon(defaultColor),
                title: aLoc.category,
                map: map
            });
            addMapLocations(marker, aLoc, name, person);
        }

    }


    var sidebar = $("#sidebar");


    var allText = '<div id="allselector" class="personselector active" data-name="All"><span class = "indicator" style = "background-color:' + defaultColor + '"></span><span class="name ">All</span></div>';
    var obj = sidebar.append(allText);

    for (var name in partipants) {


        var person = partipants[name];
        var color = person.color;


        /* var locations = data[name]
         for (var lIndex in locations) {
             var location = locations[lIndex];
             var locName = location.locationName;
             location.sharedData = sharedLocations[locName];
             if (location.sharedData != null) {
                 location.latitude = location.sharedData.latitude;
                 location.longitude = location.sharedData.longitude;
                 location.feature = location.sharedData.feature;
             }

             if (location.feature == "Area") {
                 var areaObject = neighbourhoodIndex[locName];
                 if (areaObject != null && areaObject != undefined) {
                     var area = drawAreaShape(areaObject.googleLatLongs, color);
                     location.paths = areaObject.googleLatLongs;
                     addMapLocations(area, location, name, person);
                 } else {
                     console.log("Not found: " + lIndex)
                 }
             } else if (location.feature == "Road") {
                 if (location.paths != null) {
                     var road = new google.maps.Polyline({
                         path: location.paths,
                         strokeColor: color,
                         strokeOpacity: 0.8,
                         strokeWeight: 3,
                         geodesic: true,
                         map: map
                     });
                     addMapLocations(road, location, name, person);
                 }

             } else if (location.feature == "Location" && location.latitude != "" && location.longitude != "") {
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
                 addMapLocations(marker, location, name, person);


             }


         }*/

        var isactive = data[name] == undefined ? "" : "active";
        var text = '<div class="personselector ' + isactive + '" data-name="' + name + '"><span class = "indicator" style = "background-color:' + color + '"></span><span class="name ">' + name + '</span></div>';
        var obj = sidebar.append(text);
    }

    $(".personselector.active").click(function () {
        buttonClicked(this);
    });

    sidebar.css("display", "");
    $("#allselector").click();
}

function getIcon(color) {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: color,
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeOpacity: 0.9,
        strokeColor: color
    };
}

function addMapLocations(marker, location, name, person) {

    // marker.person = name;
    marker.location = location;
    //person.mapObjects.push(marker);
    markers.push(marker);

    var text = '<div id="mapwindow" class="mapwindow"><div class="mapwindowheader">' + location.locationName + " &bull; " + location.category + '</div><div class="extracts">'
    location.htmlBase = text;




    marker.addListener('click', function () {
        var loc = this.location;
        mapInfoWindow.currentLocation = 1;

        var html = loc.htmlBase;
        var count = 0;
        var selectedItems = loc[getSelectedText()];
        for (var di in selectedItems) {
            var ex = selectedItems[di];
            count++;
            var txt = "<div class='extract'>" +
                "<div class='extractheader'>" +
                ex.person + " | " +
                ex.date + " | " +
                ex.event + "</div><div class='extracttheme'>" +
                ex.themes.toString() + "</div>" +
                "<div class='extractcontent'>";
            var imageurl = ex.imagepath;


            if (imageurl != null && imageurl != "") {
                txt += "<img class='extractimage' src='" + imageurl + "'></img>";

            }


            html += txt + ex.extract + "</div></div>";

        }
        html += "</div>"
        html += "<div count='" + count + "' class='mapmovequote'> <div></div><div class='movecontent'><div id='extractcounter'> 1 of " + count + "</div><div class='maplastquote' onclick='movelast()'>previous</div><div class='mapnextquote' onclick='movenext()'>next</div></div></div>"

        mapInfoWindow.count = count;
        mapInfoWindow.currentLocation = 1;

        // location.count = count;

        html = $.parseHTML(html)[0];




        mapInfoWindow.setContent(html);



        if (loc.feature == "Area" || loc.feature == "Road") {
            mapInfoWindow.setPosition(loc.paths[0]);
            mapInfoWindow.open(map);
        } else {
            mapInfoWindow.open(map, this);
        }


    });
}

/*
function addMapLocations(marker, location, name, person) {

    marker.person = name;
    marker.location = location;
    person.mapObjects.push(marker);
    markers.push(marker);

    var text = '<div class="mapwindow"><div class="mapwindowheader">' + location.locationName + " &bull; " + location.category + '</div><div class="extracts">'

    var count = 0;
    for (var di in location.data) {
        var ex = location.data[di];
        count++;
        var txt = "<div class='extract'>" +
            "<div class='extractheader'>" +
            name + " | " +
            ex.date + " | " +
            ex.event + "</div>" +
            "<div>" + ex.extract + "</div></div>";
        text += txt;

    }
    text += "</div>"
    if (count > 1) {
        text += "<div class='mapmovequote'> <div></div><div class='movecontent'><div id='extractcounter'> 1 of " + count + "</div><div class='maplastquote' onclick='movelast()'>previous</div><div class='mapnextquote' onclick='movenext()'>next</div></div></div>"
    }
    location.count = count;
    location.html = text + "</div>";


    marker.addListener('click', function () {
        var loc = this.location;
        mapInfoWindow.person = this.person;
        mapInfoWindow.count = loc.count;
        mapInfoWindow.currentLocation = 1;
        mapInfoWindow.setContent(loc.html);
        if (loc.feature == "Area" || loc.feature == "Road") {
            mapInfoWindow.setPosition(loc.paths[0]);
            mapInfoWindow.open(map);
        } else {
            mapInfoWindow.open(map, this);
        }
    });
}
*/
$.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/1/public/values?alt=json-in-script',
    dataType: 'jsonp',
    success: function (dataWeGotViaJsonp) {
        var ls = dataWeGotViaJsonp.feed.entry;
        for (var i in ls) {
            var p = ls[i];
            var person = p.gsx$participant.$t;
            if (partipants[person] == null) {
                partipants[person] = {
                    personName: person,
                    color: p.gsx$color.$t,
                    mapObjects: []
                };
            }
        }
        participantsReady = true;
    }
});

$.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/2/public/values?alt=json-in-script',
    dataType: 'jsonp',
    success: function (dataWeGotViaJsonp) {
        var ls = dataWeGotViaJsonp.feed.entry;
        for (var i in ls) {
            var p = ls[i];
            var key = p.gsx$locationname.$t;
            if (sharedLocations[key] == null) {
                sharedLocations[key] = {
                    locationName: p.gsx$locationname.$t,
                    address: p.gsx$address.$t,
                    feature: p.gsx$mapfeature.$t,
                    latitude: p.gsx$latitude.$t,
                    longitude: p.gsx$longitude.$t,
                    category: p.gsx$category.$t
                }
            }
        }
        sharedLocationsReady = true;
    }
});


$.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/3/public/values?alt=json-in-script',
    dataType: 'jsonp',
    success: function (dataWeGotViaJsonp) {

        var ls = dataWeGotViaJsonp.feed.entry;
        for (var i in ls) {
            var p = ls[i];
            var person = p.gsx$participant.$t;
            if (data[person] == null) {
                data[person] = {}
            }
            var locations = data[person];

            var key = p.gsx$locationname.$t;
            if (key == "") {
                key = p.gsx$address.$t;
            }

            var locItem = locationData[key];
            if (locItem == null) {
                locItem = {
                    locationName: p.gsx$locationname.$t,
                    address: p.gsx$address.$t,
                    feature: p.gsx$mapfeature.$t,
                    latitude: p.gsx$latitude.$t,
                    longitude: p.gsx$longitude.$t,
                    category: p.gsx$placecategory.$t,
                    All: []
                };
                locationData[key] = locItem;

            }

            if (locations[key] == null) {

                locations[key] = {
                    locationName: p.gsx$locationname.$t,
                    address: p.gsx$address.$t,
                    feature: p.gsx$mapfeature.$t,
                    latitude: p.gsx$latitude.$t,
                    longitude: p.gsx$longitude.$t,
                    data: []
                }

                if (locations[key].feature == "Road") {
                    var paths = [];
                    var srcLatitude = locations[key].latitude.split("\n");
                    for (var pt in srcLatitude) {
                        var point = srcLatitude[pt].split(",");
                        if (point.length == 2) {
                            paths.push({
                                lat: parseFloat(point[0].trim()),
                                lng: parseFloat(point[1].trim())
                            });
                        } else {
                            console.log("unable to parse item:" + locations[key].latitude);
                            paths = null;
                            break;
                        }

                    }
                    if (paths != null) {
                        locations[key].paths = paths;
                        locationData[key].paths = paths;
                    }
                }
            }

            var loc = locations[key];
            if (loc.category == "") {
                loc.category = locItem.category;
            }

            var itemPoint = {
                category: p.gsx$placecategory.$t,
                event: p.gsx$event.$t,
                date: p.gsx$date.$t,
                people: p.gsx$people.$t,
                things: p.gsx$things.$t,
                extract: p.gsx$extract.$t.replace(/\n/g, "<br>"),
                themes: p.gsx$theme.$t.split("\n"),
                person: person,
                imagepath: p.gsx$image.$t
            }


            if (locItem[person] == null) {
                locItem[person] = [];
            }

            locItem[person].push(itemPoint);
            locItem.All.push(itemPoint);
            loc.data.push(itemPoint);
        }
        dataReady = true;
    }
});

$.getJSON("Data/pediacities-nyc-neighborhoods.json", function (json) {
    for (var i in json.features) {
        var obj = json.features[i];

        var key = obj.properties.neighborhood;
        var borough = obj.properties.borough;
        if (borough == "Queens" || borough == "Brooklyn" || borough == null || borough == undefined) {
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

function movenext() {

    if (mapInfoWindow.currentLocation >= mapInfoWindow.count) {
        return;
    }
    var w = $(".gm-style-iw .mapwindow .extracts").width();
    var left = $(".gm-style-iw .mapwindow .extracts").scrollLeft();
    left += w;
    $(".gm-style-iw .mapwindow .extracts").animate({
        scrollLeft: left
    });
    mapInfoWindow.currentLocation++;
    updateExtractCounterText()
}

function movelast() {
    if (mapInfoWindow.currentLocation <= 1) {
        return;
    }
    var w = $(".gm-style-iw .mapwindow .extracts").width();
    var left = $("#map .mapwindow .extracts").scrollLeft();
    left -= w;

    $("#map .mapwindow .extracts").animate({
        scrollLeft: left
    });
    mapInfoWindow.currentLocation--;
    updateExtractCounterText();
}

function updateExtractCounterText() {
    $("#map #extractcounter").text(mapInfoWindow.currentLocation + " of " + mapInfoWindow.count);
}

function initMap() {
    center = {
        lat: 40.6782,
        lng: -73.9442
    };
    centerLatLong = new google.maps.LatLng(center.lat, center.lng);

    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 12,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
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
    area.setMap(map);
    return area;
}


function getSelectedText() {
    return $("#sidebar .personselector.selected .name").text()
}

function buttonClicked(e) {

    var ele = $(e);
    if (ele.hasClass("selected")) {
        return; // selected nothing todo
    }



    $("#sidebar .personselector.selected").removeClass("selected");

    ele.addClass("selected");

    selectedAttr = null;

    selectedAttr = getSelectedText();
    if (selectedAttr == "All") {
        selectedAttr = null;
    }
    mapInfoWindow.close();

    var latlngbounds = new google.maps.LatLngBounds();

    /*
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

        }*/

    var color = (partipants[selectedAttr] == undefined) ? defaultColor : partipants[selectedAttr].color;



    for (var i in markers) {
        var m = markers[i];
        var isVisible = (selectedAttr == null || m.location[selectedAttr] != null)
        m.setVisible(isVisible);


        if (isVisible) {
            if (m.position != undefined) {
                latlngbounds.extend(m.position);
            } else if (m.latLngs != undefined) {
                m.getPath().forEach(function (e) {
                    latlngbounds.extend(e);
                })
            }


            if (m.location.feature == "Road") {
                m.setOptions({
                    strokeColor: color
                });

            } else if (m.location.feature == "Area") {
                m.setOptions({
                    strokeColor: color,
                    fillColor: color
                });
            } else if (m.location.feature == "Location") {
                m.setIcon(getIcon(color));
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