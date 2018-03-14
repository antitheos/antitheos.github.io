var themesData = {},
    featuredStoriesData = {},
    dataEntries = [],
    dataLoaded = false,
    themesLoaded = false,
    featuredLoaded = false,
    volume = 0.2,
    currentPlayList = null,
    currentThemes = [],
    cummulatedThemes = {},
    minFeaturedCount = 3,
    maxFeaturedStoriesCount = 6,
    maxPlayingStoriesCount = 3,
    lastCalculated = 0;

function initializePage() {


    /*load themes
    $.getJSON("data/themes.json", function (json) {
        loadThemesToWindow(json);
        var menu = $("#featuredata");
        var template = $("#templates .menuitem");
        for (var i in json) {

            var story = template.clone();
            menu.append(story);
            $(story).text(json[i]);
            var themes = [json[i].trim()];
            $(story).data("themes", normalizeThemes(themes));



        }
        themesLoaded = true;
    })*/


    /*  $.ajax({
         url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/5/public/values?alt=json-in-script',
         dataType: 'jsonp',
         success: function (dataWeGotViaJsonp) {
             processGoogleData(dataWeGotViaJsonp);
         }
         /*
                 url: 'https://fierce-peak-15205.herokuapp.com/api/excerpts/?format=json', //'https://fierce-peak-15205.herokuapp.com/api/excerpts',
                 dataType: 'json',
                 success: function (dataWeGotViaJsonp) {

                     console.log(dataWeGotViaJsonp);
                     processHerokuRobData(dataWeGotViaJsonp);

                 }
     });*/

    var obj = {};
    obj = addOmekaHeaders(obj, 'https://historymovestest.omeka.net/api/items', "processOmekaTranscripts");
    $.ajax(obj);
    enableApp();

}

function addOmekaHeaders(obj, url, callback) {
    obj.url = url;
    /*obj.headers = {
        'key': '9cef49497314b608c12fd8f08d6cc3d9fff6f0b0',
        callback: callback
    };*/

    obj.jsnp = false;
    obj.jsonpCallback = callback;
    obj.cache = true;
    obj.dataType = 'jsonp';
    obj.method = 'GET';

    return obj;
}

function loadThemesToWindow(themesList) {
    var menu = $("#featuredata"),
        template = $("#templates .menuitem");
    for (var i in themesList) {

        var story = template.clone();
        menu.append(story);
        $(story).text(themesList[i]);
        var themes = [themesList[i].trim()];
        $(story).data("themes", normalizeThemes(themes));



    }
    themesLoaded = true;
}
//load featured
/*$.getJSON("data/featuredstories.json", function (json) {
    loadFeaturedStoriesSection(json)
});*/



function loadFeaturedStoriesSection(storiesSource) {

    var stories = [];
    for (var i in storiesSource) {
        if (storiesSource[i].counter > 2) {
            stories.push(storiesSource[i])

        }
    }

    var featured = [];
    while (stories.length > 0 && featured.length < maxFeaturedStoriesCount) {
        var num = getRandomInt(stories.length)
        featured.push(stories[num]);
        stories.splice(num, 1);

    }




    var data = $("#featuredstories .data"),
        template = $("#templates .featuredstory");
    for (var i in featured) {
        var story = template.clone();
        data.append(story);
        var dive =
            // $(story).find(".text").text(featured[i].name);
            $(story).find(".text").append('<div class="themename">' + featured[i].themes[0] + '</div>');
        $(story).find(".text").append('<div class="themeconnector"> + </div>');
        $(story).find(".text").append('<div class="themename">' + featured[i].themes[1] + '</div>');

        // $(story).find(".text").text(featured[i].name);
        //$(story).find(".text").text(featured[i].name);

        $(story).data("themes", normalizeThemes(featured[i].themes));
        $(story).data("originalTheme", featured[i].themes);
    }
    featuredLoaded = true;
}

function processThemeConnections(themeList) {
    //quickly calculate how often things occur together;
    /*
                $.each(themeList, function (findex, theme) {
                    var key = theme.key;

                    $.each(o.themes, function (sindex, stheme) {
                        var skey = stheme.key;
                        if (sindex > findex) { //only if key is not same as other one
                            var newKey = (skey < key) ? skey + "_" + key : key + "_" + skey;
                            if (counter[newKey] == null) {
                                counter[newKey] = 1;
                            } else {
                                counter[newKey]++;
                            }
                        }
                    });

                });*/
    var count = themeList.length;
    for (var i = 0; i < count - 1; i++) {
        var firstTheme = themeList[i].text;
        for (var j = i + 1; j < count; j++) {
            var secondTheme = themeList[j].text;
            if (secondTheme < firstTheme) {
                logThemePair(secondTheme, firstTheme);
            } else {
                logThemePair(firstTheme, secondTheme);
            }
        }
    }

    function logThemePair(first, second) {
        var name = first + " & " + second;
        var key = name.toLowerCase();
        if (featuredStoriesData[key] == null) {
            featuredStoriesData[key] = {
                name: name,
                themes: [first, second],
                counter: 0
            };
        }

        featuredStoriesData[key].counter++;

    }
}


function processGoogleData(dataWeGotViaJsonp) {
    var audioRoot = "https://s3.us-east-2.amazonaws.com/historymovesfiles/audiofiles/";
    var ls = dataWeGotViaJsonp.feed.entry,
        counter = {},
        themesList = [];
    $.each(ls, function (index, data) {
        if (data.gsx$audio.$t != null && data.gsx$audio.$t != undefined && data.gsx$audio.$t.trim().length > 0) {
            var o = {
                "subject": data.gsx$woman.$t,
                "city": data.gsx$city.$t,
                "audio": audioRoot + data.gsx$audio.$t,
                "extract": data.gsx$excerpt.$t,
                "image": "",
                "themes": []
            }

            $.each(data.gsx$themes.$t.trim().split(";"), function (index, theme) {
                var text = theme.trim();

                if (text.length > 0) {
                    var key = text.toLowerCase();
                    o.themes.push({
                        text: text,
                        key: key
                    })

                    if (themesData[key] == null) {
                        themesList.push(text);
                        themesData[key] = [];
                    }
                    themesData[key].push(o);
                }

            });
            processThemeConnections(o.themes);


        }

    });
    //print how many times we see things
    //console.log(counter);


    dataLoaded = true;
    loadThemesToWindow(themesList);
    loadFeaturedStoriesSection(featuredStoriesData);
}

var audioKeys = {};

function processOmekaTranscripts(dataList) {
    audioKeys = {};
    var counter = {},
        themesList = [];
    $.each(dataList.data, function (index, data) {
        if (data.item_type.name != "Audio Extract" || data.files == null || data.files.url == null) {
            return;
        }

        var o = {
            "subject": null,
            "city": null,
            "audio": data.files.url,
            "extract": null,
            "image": null,
            "themesTemp": null,
            "themes": []
        }

        audioKeys[data.url] = o;


        $.each(data.element_texts, function (index, data) {

            if (data.element.name == "Transcription") {
                o.extract = data.text;
            }
            if (data.element.name == "Participants") {
                o.subject = data.text;
            }
            if (data.element.name == "Themes") {
                o.themesTemp = data.text.trim().split("\n");
            }
            if (data.element.name == "City") {
                o.city = data.text;
            }
        });

        if (o.extract == null || o.subject == null || o.city == null || o.themesTemp == null) {
            return;
        }

        $.each(o.themesTemp, function (index, theme) {
            var text = theme.trim();

            if (text.length > 0) {
                var key = text.toLowerCase();
                o.themes.push({
                    text: text,
                    key: key
                })

                if (themesData[key] == null) {
                    themesList.push(text);
                    themesData[key] = [];
                }
                themesData[key].push(o);
            }

        });
    });

    var obj = {};

    loadThemesToWindow(themesList);
    obj = addOmekaHeaders(obj, 'https://historymovestest.omeka.net/api/files', "processOmekaFiles");

    $.ajax(obj);
}

function processOmekaFiles(dataList) {
    $.each(dataList.data, function (index, data) {
        var key = data.item.url;
        audioKeys[key].audio = data.file_urls.original;
    });
    dataLoaded = true;
    loadFeaturedStoriesSection(featuredStoriesData);
}


function processHerokuRobData(dataList) {


    var ls = dataList,
        counter = {},
        themesList = [];
    console.log(dataList);
    $.each(ls, function (index, data) {
        //if (data.gsx$audio.$t != null && data.gsx$audio.$t != undefined && data.gsx$audio.$t.trim().length > 0) {}

        var o = {
            "subject": data.women.name,
            "city": data.women.location.city,
            "audio": "",
            "extract": data.extract,
            "image": data.images,
            "themes": []
        }

        $.each(data.themes, function (index, theme) {
            var text = theme.theme.trim();

            if (text.length > 0) {
                var key = text.toLowerCase();
                o.themes.push({
                    text: text,
                    key: key
                })

                if (themesData[key] == null) {
                    themesList.push(text);
                    themesData[key] = [];
                }
                themesData[key].push(o);
            }

        });
        processThemeConnections(o.themes);


    });
    //print how many times we see things
    //console.log(counter);


    dataLoaded = true;
    loadThemesToWindow(themesList);
    loadFeaturedStoriesSection(featuredStoriesData);
}



function getRandomInt(max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * max); //The maximum is exclusive and the minimum is inclusive
}


function normalizeThemes(themes) {
    var newThemes = [];
    newThemes.data = {};
    $.each(themes, function (index, theme) {
        var t = theme.trim();
        t = {
            text: t,
            key: t.toLowerCase()
        };
        newThemes.push(t);
        newThemes.data[t.key] = true;
    });
    return newThemes;
}

function enableApp() {
    if (themesLoaded == false || dataLoaded == false || featuredLoaded == false) {
        setTimeout(enableApp, 500)
    } else {

        $("#featuredata .menuitem,#featuredstories .featuredstory").each(function (index, element) {
            var themes = $(element).data("themes"),
                playList = findThemesData(themes);
            $(element).data("playList", playList);
            if (playList.length < 1) {
                $(element).addClass("nodata");
            }
        });
        $("#body").removeClass("hidden");

    }
}


function togglePlay(event) {
    var o = event.srcElement,
        parent = $(o).attr("data-myparent"),
        audio = $("#" + parent + " #audioitem")[0];
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}


function findThemesData(themes) {
    var playList = themesData[themes[0].key];
    if (playList == null || playList == undefined) {
        return [];
    }
    if (themes.length > 1) {
        $.each(themes, function (index, ctheme) {

            if (ctheme.key != themes[0].key) { //we have already filtered this, dont waste cycles

                playList = playList.filter(function (story, index, array) {
                    var ary = story.themes.filter(function (storyTheme, index, array) {
                        return storyTheme.key == ctheme.key;
                    });
                    return ary.length > 0;
                });
            }
        });
    }
    return playList;
}


function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


function populateStoriesToScreen() {
    var data = $("#stories");
    var playingList = [];


    var template = $("#templates .astory");
    var storyToPlay = "astory" + $("#stories .astory").length;


    while (currentPlayList.length > 0 && playingList.length < maxPlayingStoriesCount) {
        var num = getRandomInt(currentPlayList.length)
        story = currentPlayList[num];
        playingList.push(story);
        currentPlayList.splice(num, 1);


        var index = $("#stories .astory").length;
        var x = $(template.clone()),
            key = "astory" + index;
        x.attr("id", key);

        data.append(x);
        x.data("mystory", story);

        $("#" + key + " .storytext").text(story.extract);
        $("#" + key + " .audio").attr("src", story.audio);
        $("#" + key + " .audio").attr("data-myparent", "astory" + (index));
        $("#" + key + " #audioplaypause").attr("data-myparent", "astory" + (index));
        $("#" + key + " .audio").attr("data-next", "astory" + (index + 1));

        $("#" + key + " .person").text(story.subject);
        $("#" + key + " .city").text(story.city);
    }
    var x = $($("#templates .howtocontinue").clone());
    x.attr("id", "hearmore" + $("#stories .astory").length);

    data.append(x);

    if (currentPlayList.length == 0) {
        x.addClass("allstoriesloaded");
    }


}

//handle select topic or story
function showStory(e) {
    if ($(e).hasClass("nodata")) {
        return;
    }

    currentThemes = $(e).data("themes");
    cummulatedThemes = {};
    lastCalculated = 0;
    currentPlayList = $(e).data("playList").slice(); //randomize order

    $("#relatedotherthemes").html("");
    $("#relatedcombinedthemes ").html("");
    var data = $("#stories");
    data.html("");



    var theme = $(e).text();
    $("#SelectedStory").html("");
    var counter = 0;
    $.each(currentThemes, function (index, theme) {
        counter++;
        if (counter > 1 && counter == currentThemes.length) {
            $("#SelectedStory").append("<span> and </span>");
        }
        $("#SelectedStory").append("<span class='theme'>" + theme.text + "</span>");

    });


    populateStoriesToScreen();

    $("#body").addClass("showstory");
    updateVolume(volume);
    playNextItem("astory0");



}

function returnHome() {
    $("#body").removeClass("showstory");
    $("#body").animate({
        "scrollTop": "0px"
    }, 300);
    $("#stories").html("");
}

function setVolume(event) {
    var vol = $(event.srcElement).attr("data-level");
    updateVolume(vol);
}

function updateVolume(vol) {
    volume = vol;
    $(".audio").each(function (index, audioElement) {
        audioElement.volume = volume;
    });
}

function volumeChanged(event) {
    var o = event.srcElement;
    var vol = o.volume;
    var parent = $(o).attr("data-myparent");



    $("#" + parent + " .volumelevel").each(function () {
        if ($(this).attr('data-level') <= vol) {
            $(this).addClass('active'); // Or whatever
        } else {
            $(this).removeClass('active');
        }
    });

}

function timeChanged(event) {
    var o = event.srcElement;
    var t = event.srcElement.currentTime;
    var d = event.srcElement.duration;
    var pct = t / d;
    pct = Math.round(pct * 100) + "%"
    var parent = $(o).attr("data-myparent");

    $("#" + parent + " .progressindicatorinner").css("width", pct);
}

function playbackPaused(event) {
    var o = event.srcElement;
    var parent = $(o).attr("data-myparent");
    $("#" + parent + " #audioplaypause").text("play_circle_filled");
}
var currentObject = null;

function playbackStarted(event) {
    var o = event.srcElement;
    var parent = $(o).attr("data-myparent");
    $("#" + parent + " #audioplaypause").text("pause_circle_filled");
    var obj = $("#" + parent);
    var story = obj.data("mystory");
    if (story != currentObject) {
        $.each(story.themes, function (index, theme) {
            if (cummulatedThemes[theme.key] == undefined) {
                cummulatedThemes[theme.key] = theme;
            }
        });

        loadNowPlayingThemes(story.themes);
    }
}


function loadNowPlayingThemes(themes) {
    var related = $("#related #relatedotherthemes");
    related.html("");

    var combined = $("#related #relatedcombinedthemes");
    combined.html("");
    var template = $("#templates .relatedstory");

    $.each(themes, function (index, theme) {

        if (currentThemes.data[theme.key] != true) {
            $.each(currentThemes, function (index, cTheme) {
                var cItem = template.clone();
                combined.append(cItem);
                $(cItem).text(cTheme.text + " + " + theme.text);
                var cItemThemes = normalizeThemes([cTheme.text, theme.text]);
                $(cItem).data("playList", findThemesData(cItemThemes));
                $(cItem).data("themes", cItemThemes);

            });

            var item = template.clone();
            related.append(item);
            $(item).text(theme.text);
            var itemThemes = normalizeThemes([theme.text]);
            $(item).data("playList", findThemesData(itemThemes));
            $(item).data("themes", itemThemes);


        }
    });
}

function goToNextStory(e) {
    var o = $(".playingstory audio");

    if (o.length > 0) {
        var audio = o[0];
        audio.pause();
        playNextItem();
    }

}


function playbackEnd(event) {
    var o = event.srcElement;
    playNextItem();
}


function continuePlaying() {
    cummulatedThemes = {};
    var current = $("#stories .playingstory");
    var nextObject = current.next();
    var nextObjectId = nextObject.attr("id");
    current.remove();
    playItem(nextObjectId);
}

function playNextItem(key) {
    var playKey = key;
    var current = $("#stories .playingstory");
    var top = $("#body").scrollTop();
    var nextObject = null;

    if (playKey != undefined) {
        nextObject = $("#" + playKey);
        top = 0;
    } else if (current.length != 0) {
        nextObject = current.next();
        playKey = nextObject.attr("id");
        if (nextObject.hasClass("howtocontinue") && !nextObject.hasClass("allstoriesloaded")) {
            populateStoriesToScreen();
        }
    }

    console.log(playKey);

    var nextStory = $(".playingstory .nextstory");
    if (nextStory.length > 0) {
        top = nextObject.position().top - nextStory.outerHeight();
    }


    $("#body").animate({
        "scrollTop": top + "px"
    }, 300, function () {
        var items = $("#" + playKey + " .audio");
        if (items.length > 0) {
            items[0].currentTime = 0;
        }
        playItem(playKey);
    })
}

function playItem(key) {
    $(".playingstory").removeClass("playingstory");
    var obj = $("#" + key)
    obj.addClass("playingstory");

    var ls = $("#" + key + " .audio");
    if (ls.length > 0) {
        ls[0].play();
    } else if (obj.hasClass("howtocontinue")) {
        loadNowPlayingThemes(cummulatedThemes);
    }
}
