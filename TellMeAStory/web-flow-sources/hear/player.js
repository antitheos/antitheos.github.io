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
        audio = $("#" + parent + " #audioitem")[0];
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}


function findThemesData(themes) {
    var playList = themesData[themes[0].key].list;
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
        $("#" + key + " .audio").attr("src", "https://antitheos.github.io/TellMeAStory/" + story.audio);
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
function showStory(themes, playlist, stopAutoPlay) {


    currentThemes = themes;
    cummulatedThemes = {};
    lastCalculated = 0;
    currentPlayList = playlist.slice(); //randomize order

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
        top = nextObject.position().top - nextStory.outerHeight() - 40;
    }
    console.log(playKey + ", top:" + top);
    window.scrollTo(0, top);
    setTimeout(function () {
        var items = $("#" + playKey + " .audio");
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
    $(".playingstory").removeClass("playingstory");
    var obj = $("#" + key)
    obj.addClass("playingstory");

    var ls = $("#" + key + " .audio");
    if (ls.length > 0) {
        if (stopAutoPlay != true) {
            ls[0].play();
        }

    } else if (obj.hasClass("howtocontinue")) {
        loadNowPlayingThemes(cummulatedThemes);
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
