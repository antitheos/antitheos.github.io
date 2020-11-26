var //themesData = {},
    //featuredStoriesData = {},
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
    lastCalculated = 0,
    audioKeys = {};

function getRandomInt(max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * max); //The maximum is exclusive and the minimum is inclusive
}


function normalizeThemes(themes) {
    var newThemes = [];
    newThemes.data = {};
    $.each(themes, function (index, theme) {
        if (!theme) {
            return;
        }
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
        configRouter();
        $("#body").removeClass("hidden");

    }
}


function togglePlay(event) {
    var o = event.srcElement,
        parent = $(o).attr("data-myparent"),
        audio = $("#audioitem")[0];
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function stopAudio() {
    var audio = $("#audioitem")[0];
    audio.pause();
}


function playAudio() {
    var audio = $("#audioitem")[0];
    var promise = audio.play();


    if (promise !== undefined) {
        promise.then(_ => {
            // Autoplay started!
            $("#storiessection").removeClass("promptplay");
        }).catch(error => {
            // Autoplay was prevented.
            // Show a "Play" button so that user can start playback.
            $("#storiessection").addClass("promptplay");
        });
    }
}
//get all stories with all listed themes
function findThemesData(themes) {
    var playList = [];
    var firstTheme = themes[0];

    if (!themesData[firstTheme.key] || !themesData[firstTheme.key].list) {
        //no data return empty list 
        return playList;
    }
    playList = themesData[firstTheme.key].list;

    var remaingThemes = themes.splice(0, 1);

    $.each(remaingThemes, function (index, ctheme) {
        if (!themesData[ctheme.key] || !themesData[ctheme.key].list) {
            //no data for theme, return to null; 
            playList = [];
            return;
        }

        playList = playList.filter(function (story, index, array) {
            return story.themes.find(th => th.key == ctheme.key) != undefined;

        });
    })

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
        $("#" + key).attr("audiosrc", "https://antitheos.github.io/TellMeAStory/" + story.audio);
        $("#" + key).attr("audio-data-myparent", "astory" + (index));
        $("#" + key).attr("audio-data-next", "astory" + (index + 1));


    }
    var x = $($("#templates .howtocontinue").clone());
    x.attr("id", "hearmore" + $("#stories .astory").length);

    data.append(x);

    if (currentPlayList.length == 0) {
        x.addClass("allstoriesloaded");
    }


}


//handle select topic or story
function showStory(themes, playlist, stopAutoPlay, pTitle) {


    currentThemes = themes;
    cummulatedThemes = {};
    lastCalculated = 0;
    currentPlayList = playlist.slice(); //randomize order 
    var cText = currentThemes.reduce((c = "", r, i) => c + (c == "" ? "" : " and ") + r.text, "")

    $("#header-title").text(pTitle ? pTitle : cText);

    $("#relatedotherthemes").html("");
    $("#relatedcombinedthemes ").html("");
    var data = $("#stories");
    data.html("");


    /*
       var theme = $(e).text();
       $("#SelectedStory").html("");
       var counter = 0;
       $.each(currentThemes, function (index, theme) {
           counter++;
           if (counter > 1 && counter == currentThemes.length) {
               $("#SelectedStory").append("<span> and </span>");
           }
           $("#SelectedStory").append("<span class='theme'>" + theme.text + "</span>");

       });*/


    populateStoriesToScreen();
    $("body").addClass("active");
    $("body").addClass("showstory");
    updateVolume(volume);
    if (stopAutoPlay != true) {
        playNextItem("astory0");
    }

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
    $("#audioitem").each(function (index, audioElement) {
        audioElement.volume = volume;
    });
}

function volumeChanged(event) {
    var o = event.srcElement;
    var vol = o.volume;
    var parent = $(o).attr("data-myparent");



    $("#sharedstoryfooter .volumelevel").each(function () {
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

    $("#sharedstoryfooter .progressindicatorinner").css("width", pct);
}

function playbackPaused(event) {
    //var o = event.srcElement;
    //var parent = $(o).attr("data-myparent");
    $("#audioplaypause").text("");
    $("#audioplaypause").text("play_circle_filled");
}
var currentObject = null;

function playbackStarted(event) {
    var o = event.srcElement;
    var parent = $(o).attr("data-myparent");
    $("#audioplaypause").text("");
    $("#audioplaypause").text("pause_circle_filled");
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

function findRelevantThemes(themes) {
    if (!themes) {
        return [];
    }
    return currentThemes.filter(e => themes.find(x => x.key == e.key) != undefined)
}

function loadNowPlayingThemes(themes) {
    var related = $("#related #relatedotherthemes");
    related.html("");

    var combined = $("#related #relatedcombinedthemes");
    combined.html("");
    var template = $("#templates .relatedstory");

    var remainThemes = findRelevantThemes(themes);
    $.each(themes, function (index, theme) {

        $.each(remainThemes, function (index, cTheme) {
            if (cTheme.key == theme.key) {
                return;
            }

            var cItem = template.clone();
            combined.append(cItem);
            $(cItem).text(cTheme.text + " + " + theme.text);
            var cItemThemes = normalizeThemes([cTheme.text, theme.text]);
            $(cItem).data("playList", findThemesData(cItemThemes));
            $(cItem).data("themes", cItemThemes);

        });


        if (!collectionThemes && (currentThemes.length > 1 || !currentThemes.data[theme.key])) {
            var item = template.clone();
            related.append(item);
            $(item).text(theme.text);
            var itemThemes = normalizeThemes([theme.text]);
            $(item).data("playList", findThemesData(itemThemes));
            $(item).data("themes", itemThemes);
        }

    });

    if (collectionThemes) {
        $.each(collectionThemes, function (index, theme) {
            var item = template.clone();
            related.append(item);
            $(item).text(theme);
            var itemThemes = normalizeThemes([theme]);
            $(item).data("playList", findThemesData(itemThemes));
            $(item).data("themes", itemThemes);
        });
    }
}

function goToNextStory(e) {
    var o = $("#audioitem");

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

function replayAll() {
    var ls = $("#audioitem");
    if (ls.length == 1) {
        ls[0].pause()
    }
    playNextItem("astory0");
}

function replay(event) {
    var ls = $("#audioitem");
    if (ls.length == 1) {
        ls[0].currentTime = 0
    }
}

function playNextItem(key, stopAutoPlay) {
    var playKey = key;
    var current = $("#stories .playingstory");
    var top = $(window).scrollTop();
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

    var nextStory = $(".playingstory .nextstory");
    if (nextStory.length > 0) {
        top = nextObject.position().top - nextStory.outerHeight() - 100;
    }
    console.log(playKey + ", top --> " + top);
    window.scrollTo(0, 0);
    setTimeout(function () {
        var items = $("#audioitem");
        if (items.length > 0) {
            items[0].currentTime = 0;
        }
        if (stopAutoPlay != true) {
            playItem(playKey);
        }
    }, 300);

    /*
        $(window).animate({
            "scrollTop": top + "px"
        }, 300, function () {
            var items = $("#" + playKey + " .audio");
            if (items.length > 0) {
                items[0].currentTime = 0;
            }
            if (stopAutoPlay != true) {
                playItem(playKey);
            }
        })*/
}

function playItem(key, stopAutoPlay) {
    $("#storiessection").removeClass("displayRelated");
    $(".playingstory").removeClass("playingstory");
    var obj = $("#" + key)



    obj.addClass("playingstory");
    $("#storiessection").removeClass("continueprompt");

    var ls = $("#audioitem");
    if (obj.hasClass("howtocontinue")) {
        $("#sharedstoryfooter").attr("disabled", "disabled");
        $("#storiessection").addClass("continueprompt");
        var x = [];
        for (var a in cummulatedThemes) {
            x.push(cummulatedThemes[a])
        };

        loadNowPlayingThemes(x);
    } else if (ls.length > 0) {
        $("#audioitem").attr("src", obj.attr("audiosrc"));
        $("#audioitem").attr("data-myparent", obj.attr("audio-data-myparent"));
        $("#audioplaypause").attr("data-myparent", obj.attr("audio-data-myparent"));
        $("#audioitem").attr("data-next", obj.attr("audio-data-next"));
        var story = obj.data("mystory");
        $("#sharedstoryfooter .person").text(story.subject);
        $("#sharedstoryfooter .city").text(story.city);

        $("#sharedstoryfooter").attr("disabled", null);

        if (stopAutoPlay != true) {
            playAudio();
        }

    }
}

var itemToPlay = null;

function playFromUrl(key) {
    var e = $("#" + key);
    if (e.length == 0) {
        console.log(key + ": not found")
        return;
    }
    itemToPlay = e;
    showStory(e, true);
    $("#overlaymessage").removeClass("hidden");
}

function proceedToContent() {
    $("#overlaymessage").addClass("hidden");
    showStory(itemToPlay);
}

/*todo:
 
 
- mobile, style of back to player from related themes 
- play, how to display mutiple themes selected

QUESTIONS
- collections, nothing matching all 5 themes
- colllections, should related only show other themes in collection
- play, should we show compund related themes
- back button icon, do they have image
- how to deal with font, colors, etc
*/
