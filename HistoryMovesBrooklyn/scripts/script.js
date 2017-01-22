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
var themes = {};
var themeData = {
    "Unknown": []
};
var themesReady = false;
var mapReady = false;
var neigborHoodsReady = false;
var selectedAttr = null;
var mapInfoWindow = null;

function getThemeColor(theme) {
    var x = themes[theme];
    if (x == null) {
        x = themes["All"];
    }
    return x.color;
}

function loadNeighbourHoods() {
    if (!neigborHoodsReady || !mapReady || !dataReady || !sharedLocationsReady || !themesReady || !participantsReady) {
        //neighborboods and map are not ready, let us wait
        console.log("not ready");
        setTimeout(loadNeighbourHoods, 850);
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

        var theme = "Unknown";

        for (var t in aLoc.themes) {
            theme = t;
            break;
        }
        if (theme == "Unknown") {
            themeData[theme].push(aLoc);
            aLoc.themes[theme] = aLoc.All;
        }

        var color = getThemeColor(theme);


        if (aLoc.feature == "Area") {
            var areaObject = neighbourhoodIndex[lName];
            if (areaObject != null && areaObject != undefined) {
                var area = drawAreaShape(areaObject.googleLatLongs, color);
                aLoc.paths = areaObject.googleLatLongs;
                addMapLocations(area, aLoc, name, person);
            } else {
                console.log("Not found: " + lName)
            }
        } else if (aLoc.feature == "Road") {
            if (aLoc.paths != null) {
                var road = new google.maps.Polyline({
                    path: aLoc.paths,
                    strokeColor: color,
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
                icon: getIcon(color),
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

        var isactive = data[name] == undefined ? "" : "active";
        var text = '<div class="personselector ' + isactive + '" data-name="' + name + '"><span class = "indicator" style = "background-color:' + color + '"></span><span class="name ">' + name + '</span></div>';
        var obj = sidebar.append(text);
    }

    var themebar = $("#themebar");
    for (var name in themes) {


        var theme = themes[name];
        var color = theme.color;
        var isactive = (themeData[name] == undefined && name != "All") ? "" : "active";
        var text = '<div class="themeoption ' + isactive + '" data-name="' + name + '"><span class = "indicator" style = "background-color:' + color + '"></span><span class="name ">' + name + '</span></div>';
        var obj = themebar.append(text);
    }
    $(".personselector.active").click(function () {
        buttonClicked(this);
    });

    $(".themeoption.active").click(function () {
        themeClicked(this);
    });


    themebar.css("display", "");
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

    var shouldHighlight = (location.sharedData != null && location.sharedData.highlightLocation == "Highlight");

    var text = '<div id="mapwindow" class="mapwindow" shouldHighlight="' + shouldHighlight + '"><div><div class="mapwindowheader">' +
        location.locationName + " &bull; " +
        location.category + '</div><div class="person_pin material-icons">person_pin</div><div class="specialicon material-icons">stars</div><div class="extracts">'
    location.htmlBase = text;




    marker.addListener('click', function () {
        var loc = this.location;
        mapInfoWindow.currentLocation = 1;

        var html = loc.htmlBase;

        var count = 0;
        var selectedItems = loc[getSelectedText()];
        for (var di in selectedItems) {
            var ex = selectedItems[di];
            var audiopath = ex.audiopath;
            var hasAudio = (audiopath != null && audiopath != "");

            count++;
            var txt = "<div class='extract' hasaudio='" + hasAudio + "'>" +
                "<div class='extractheader'>" +
                ex.person + " | " +
                ex.date + " | " +
                ex.event + "</div><div class='extracttheme'>" +
                ex.themes.toString() + "</div>" +
                "<div class='extractcontent'>";


            if (hasAudio) {
                txt += '<div class="extractaudiocontainer"><audio class="extractaudio" controls><source src="' + audiopath +
                    '" type="audio/mpeg">Your browser does not support the audio element.</audio></div>'

            }


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


//get people spaces
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

//get public spaces
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
                    category: p.gsx$category.$t,
                    highlightLocation: p.gsx$highlightlocation.$t
                }
            }
        }
        sharedLocationsReady = true;
    }
});

//get the detail for the actual locations
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
                    themes: {},
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
                imagepath: p.gsx$image.$t,
                audiopath: p.gsx$audio.$t
            }



            if (locItem[person] == null) {
                locItem[person] = [];
            }

            locItem[person].push(itemPoint);
            locItem.All.push(itemPoint);
            itemPoint.themes.forEach(function (theme) {
                if (theme.trim().length > 0) {
                    if (locItem.themes[theme] == null) {
                        locItem.themes[theme] = [];
                    }
                    locItem.themes[theme].push(itemPoint);

                    if (themeData[theme] == null) {
                        themeData[theme] = [];
                    }
                    themeData[theme].push(itemPoint);
                }
            });

            loc.data.push(itemPoint);
        }
        dataReady = true;
    }
});

//get geometries for know locations
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


//get themes
$.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/4/public/values?alt=json-in-script',
    dataType: 'jsonp',
    success: function (dataWeGotViaJsonp) {

        var ls = dataWeGotViaJsonp.feed.entry;
        for (var i in ls) {
            var t = ls[i];
            var theme = t.gsx$theme.$t;
            if (themes[theme] == null) {
                themes[theme] = {
                    name: theme,
                    color: t.gsx$color.$t
                };


            }
        }
        themesReady = true;

    }
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
        scrollwheel: false,
        styles: [
            {
                featureType: 'road',
                elementType: 'all',
                stylers: [{
                    visibility: 'off'
                }]

            }, {
                featureType: 'poi',
                elementType: 'all',
                stylers: [{
                    visibility: 'off'

                }]
            }, {
                featureType: 'administrative',
                elementType: 'all',
                stylers: [{
                    visibility: 'off'
                }]
            }, {
                featureType: 'all',
                elementType: 'labels',
                stylers: [{
                    visibility: 'off'
                }]
            }, {
                featureType: 'landscape',
                elementType: 'all',
                stylers: [{
                    visibility: 'off'
                }]
            }, {
                featureType: 'transit',
                elementType: 'all',
                stylers: [{
                    visibility: 'off'
                }]
            }]


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

function getSelectedTheme() {
    var ary = [];
    $.each($("#themebar .themeoption.selected .name"), function (index, obj) {


            var txt = $(obj).text();
            if (txt != "All") {
                ary.push(txt);
            }
        }

    );

    return ary;
}


function themeClicked(e) {

    var ele = $(e);
    if (ele.attr("data-name") == "All") {
        $("#themebar .themeoption.selected").removeClass("selected");
    } else {
        ele.toggleClass("selected");
    }
    filterMapMarkers();
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
    filterMapMarkers();

}


function filterMapMarkers() {

    mapInfoWindow.close();


    var selectedthemes = getSelectedTheme();

    var list = [];


    var allThemes = selectedthemes.length == 0;
    var allPeople = selectedAttr == null;
    for (var i in markers) {
        var m = markers[i];
        var personMatch = (allPeople || m.location[selectedAttr] != null);
        var isVisible = (allThemes && personMatch);

        if (personMatch && !isVisible) {
            selectedthemes.forEach(function (obj) {

                if (m.location.themes[obj] != null) {
                    isVisible = true;
                }

            })
        };

        m.setVisible(isVisible);


        if (isVisible) {
            list.push(m);
            /*if (m.location.feature == "Road") {
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
            }*/
        }

    }
    setMapBounds(list);

}

function setMapBounds(ary) {
    var list = (ary.length == 0) ? markers : ary;
    var latlngbounds = new google.maps.LatLngBounds();

    for (var i in list) {
        var m = list[i];
        if (m.position != undefined) {
            latlngbounds.extend(m.position);
        } else if (m.latLngs != undefined) {
            m.getPath().forEach(function (e) {
                latlngbounds.extend(e);
            })
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