document.addEventListener("DOMContentLoaded", windowReady);
var themesData = {};

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
    var ls = $("#theme-selector option");

    var index = Math.floor(Math.random() * Math.floor(ls.length - 1));
    var rec = ls[index + 1];
    $("#theme-selector").val(rec.value);
    themeSelected($("#theme-selector"))
}


function playCollection(val) {
    var themes = collection[val].map(e => e.toLowerCase().trim());
    var fh = themes.pop();
    var data = themesData[fh].list;
    data = data.filter(function (e) {
        var ethemes = e.themes.map(e => e.key);
        for (var th in themes) {
            if (!ethemes.find(e => e == th)) {
                return false;
            }
        }
        return true;
    });
    console.log(data)



}

function showRelatedStory(e) {
    var themes = $(e).data("themes");
    var playList = $(e).data("playList").slice(); //randomize order 

    showStory(themes, playList, false);

}

var collection = {
    "How can we center women in the history of HIV/AIDS?": ["Knowledge about HIV/AIDS", "Contracting HIV/AIDS from a male partner", "In the streets", "HIV saved my life", "Future"],
    "How does family matter in the history of HIV / AIDS ?": ["Childhood", "Migrations", "Trauma", "Talking about HIV in families", "Children"],
    "How do institutions impact women living with HIV / AIDS ?": ["Schooling", "Nowhere to go", "Incarceration", "Surveillance", "Women’ s Interagency HIV Study"],
    "How is health more than the absence of disease ?": ["Partnerships", "Addiction and recovery", "Getting and giving support", "Living with HIV", "Healing"],
    "How do women build healthy worlds ?": ["Healthcare", "Family dynamics", "Taking charge of health and wellness", "Work", "Religion and spirituality"],
}
