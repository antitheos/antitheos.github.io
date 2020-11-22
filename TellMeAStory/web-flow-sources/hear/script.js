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
            var e = el.append("<div class='option' onclick='playThisTheme(e)'>" + data[x].text + "</div>");
            e.data("theme", data[x]);
        }

        loadCollections();
    });

}


function returnToHome() {
    stopAudio();
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

function toggleThemesList() {
    $("#theme-selector").toggleClass("showOptions");
}

function playThisTheme(e) {

    $("#theme-selector").removeClass("showOptions");
    var dt = $(e).data("theme");
    playTheme(dt);

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


function loadCollections() {
    var el = $("#collection-selector");
    for (var x in collection) {
        el.append("<div class='collection-item' onclick='playCollectionElement(this)'>" + x + "</div>");

    }
}

function playCollectionElement(e) {
    var val = $(e).text()
    playCollection(val)
}

function playCollection(val) {
    var themesText = collection[val];
    if (!themesText || themesText.length == 0) {
        return;
    }

    var themes = themesText.map(e => e.toLowerCase().trim());
    var fh = themes[0];

    var data = themesData[fh];
    if (data == null || data == undefined) {
        return;
    }
    var checkList = themes.splice(0, 1);
    data = data.list.filter(function (e) {
        var ethemes = e.themes.map(e => e.key);
        for (var th in checkList) {
            if (!ethemes.find(e => e == th)) {
                return false;
            }
        }
        return true;
    });
    console.log(data)
    if (data.length == 0) {
        return;
    }

    showStory(normalizeThemes(themesText), data, false);



}

function showRelatedStory(e) {
    var themes = $(e).data("themes");
    var playList = $(e).data("playList").slice(); //randomize order 

    showStory(themes, playList, false);

}


function toggleRelatedItems() {
    $("#storiessection").toggleClass("displayRelated");
}
var collection = {
    "How can we center women in the history of HIV/AIDS?": ["Knowledge about HIV/AIDS", "Contracting HIV/AIDS from a male partner", "In the streets", "HIV saved my life", "Future"],
    "How does family matter in the history of HIV / AIDS ?": ["Childhood", "Migrations", "Trauma", "Talking about HIV in families", "Children"],
    "How do institutions impact women living with HIV / AIDS ?": ["Schooling", "Nowhere to go", "Incarceration", "Surveillance", "Women’ s Interagency HIV Study"],
    "How is health more than the absence of disease ?": ["Partnerships", "Addiction and recovery", "Getting and giving support", "Living with HIV", "Healing"],
    "How do women build healthy worlds ?": ["Healthcare", "Family dynamics", "Taking charge of health and wellness", "Work", "Religion and spirituality"],
}
