var themesData = [];

function initializePage() {
    //set the begining volume levels
    $("#audioitem")[0].volume = 0.4;

    //load themes
    $.getJSON("data/themes.json", function (json) {

            var menu = $("#mainmenu");
            for (var i in json) {
                // themeData.push(json[i]);
                menu.append("<div class='menuitem' onclick='showStory(this)'>" + json[i] + "</div>")

            }


        })
        //load featured
    $.getJSON("data/featuredstories.json", function (json) {

        var data = $("#featuredstories .data");
        for (var i in json) {
            // themeData.push(json[i]);
            data.append("<div class='featuredstory' onclick='showStory(this)'><div>" + json[i].name + "</div></div>")

        }


    })
}


function togglePlay() {
    var audio = $("#audioitem")[0];
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}


//handle select topic or story
function showStory(e) {
    $("#SelectedStory").text($(e).text());
    $("#body").addClass("showstory");
    $("#audioitem")[0].play();

}

function returnHome() {
    $("#body").removeClass("showstory");
    $("#audioitem")[0].pause();
    $("#audioitem")[0].load();
}

function setVolume(event) {
    var vol = $(event.srcElement).attr("data-level");
    $("#audioitem")[0].volume = vol;
}

function volumeChanged(event) {
    var o = event.srcElement;
    var vol = o.volume;


    $(".volumelevel").each(function () {
        if ($(this).attr('data-level') <= vol) {
            $(this).addClass('active'); // Or whatever
        } else {
            $(this).removeClass('active');
        }
    });

    console.log(event);
}

function timeChanged(event) {
    var t = event.srcElement.currentTime;
    var d = event.srcElement.duration;
    var pct = t / d;
    pct = Math.round(pct * 100) + "%"

    $("#astory .progressindicatorinner").css("width", pct);
}

function playbackPaused(event) {

    var o = event.srcElement;
    $("#audioplaypause").text("play_circle_filled");
}

function playbackStarted(event) {
    $("#audioplaypause").text("pause_circle_filled");
    var o = event.srcElement;
}

function playbackEnd(event) {
    console.log("ended")
}