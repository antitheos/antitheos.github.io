var themesData = {};
var dataEntries = [];
var themesLoaded = false;
var dataLoaded = false;
var featuredLoaded = false;
var volume = 0.1;
var currentPlayList = null;

function initializePage() {


    //load themes
    $.getJSON("data/themes.json", function (json) {

        var menu = $("#featuredata");
        for (var i in json) {
            // themeData.push(json[i]);
            menu.append("<div class='menuitem' onclick='showStory(this)'>" + json[i] + "</div>")

        }
        themesLoaded = true;
    })
    //load featured
    $.getJSON("data/featuredstories.json", function (json) {

        var data = $("#featuredstories .data");
        for (var i in json) {
            // themeData.push(json[i]);
            data.append("<div class='featuredstory' onclick='showStory(this)'><div>" + json[i].name + "</div></div>")

        }
        featuredLoaded = true;
    });

    $.ajax({
        url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/5/public/values?alt=json-in-script',
        dataType: 'jsonp',
        success: function (dataWeGotViaJsonp) {
            var ls = dataWeGotViaJsonp.feed.entry;
            $.each(ls, function (index, data) {
                if (data.gsx$audio.$t != null && data.gsx$audio.$t != undefined && data.gsx$audio.$t.trim().length > 0) {
                    var o = {
                        "subject": data.gsx$woman.$t,
                        "city": data.gsx$city.$t,
                        "audio": "audio/" + data.gsx$audio.$t,
                        "extract": data.gsx$excerpt.$t,
                        "image": "",
                        "themes": data.gsx$themes.$t.split(";")
                    }

                    addObjectToTheme(o);
                }
            });
            dataLoaded = true;


        }
    });
    enableApp();

}

function enableApp() {
    if (themesLoaded == false || dataLoaded == false || featuredLoaded == false) {
        setTimeout(enableApp, 500)
    } else {
        $("#body").removeClass("hidden");
    }
}

function addObjectToTheme(obj) {
    $.each(obj.themes, function (index, theme) {
        var t = theme.toLowerCase().trim();
        if (themesData[t] == null) {
            themesData[t] = [];
        }
        themesData[t].push(obj);
    });
}

function togglePlay(event) {
    var o = event.srcElement;
    var parent = $(o).attr("data-myparent");

    var audio = $("#" + parent + " #audioitem")[0];
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}


//handle select topic or story
function showStory(e) {
    var theme = $(e).text();
    $("#SelectedStory").text(theme);
    $("#body").addClass("showstory");

    var template = $("#templates .astory");
    var data = $("#stories");
    data.html("");
    var dt = themesData[theme.toLowerCase().trim()];
    currentPlayList = dt;

    $.each(dt, function (index, story) {

        var x = $(template.clone());
        var key = "astory" + index;
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



    });
    updateVolume(volume);
    playItem("astory0");


}

function returnHome() {
    $("#body").removeClass("showstory");
    $("#audioitem")[0].pause();
    $("#audioitem")[0].load();
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

        var related = $("#related");
        related.html("");

        $.each(story.themes, function (index, theme) {
            related.append("<div>" + theme + "</div>")

        });
    }

}

function playbackEnd(event) {
    var o = event.srcElement;
    var key = $(o).attr("data-next");
    var obj = $("#" + key);
    if (obj.length == 0) {
        return;
    }

    var top = $("#body").scrollTop();
    top = obj.position().top;

    $("#body").animate({
        "scrollTop": top + "px"
    }, 300, function () {
        playItem(key);
    })
}

function playItem(key) {
    var ls = $("#" + key + " .audio");
    if (ls.length > 0) {
        ls[0].play();
    }
}
