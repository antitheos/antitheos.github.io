document.addEventListener("DOMContentLoaded", windowReady);
var themesData = {};
var themesDataList = [];

function windowReady() {
    if ($ == null || $ == undefined) {
        setTimeout(windowReady, 1000);
        return
    }
    console.log("fetch data")

    $.ajax({
        url: 'https://antitheos.github.io/TellMeAStory/web-flow-sources/data.json',
        dataType: 'json'
    }).done(function (data) {
        themesData = data

        var el = $("#theme-selector");
        for (var x in themesData) {
            themesDataList.push(data[x])
            el.append("<option value='" + x + "'>" + data[x].text + "</option>");

        }
    });

}


function returnToHome() {
    $("body").removeClass("active");
    window.scrollTo(0, 0);
    $("#stories").html("");

}


function themeSelected(e) {
    var val = $(e).val();
    var th = themesData[val];
    if (th == null) {

        return;
    }

    playTheme(th)

}

function playTheme(th) {
    $("body").addClass("active");
    showStory(normalizeThemes([th.text]), th.list, false);
}

function selectRandomTheme() {
    var index = Math.floor(Math.random() * Math.floor(themesDataList.length));
    var rec = themesDataList[index];
    playTheme(rec)

}

function showRelatedStory(e) {
    var themes = $(e).data("themes");
    var playList = $(e).data("playList").slice(); //randomize order 

    showStory(themes, playList, false);

}
