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
    $("#body").animate({
        "scrollTop": "0px"
    }, 300);
    $("#stories").html("");

}


function themeSelected(e) {
    var val = $(e).val();
    if (themesData[val]) {
        return;
    }


    $("body").addClass("active");


}
