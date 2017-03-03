//load themes
var themesData = [];

function initializePage() {


    $.getJSON("data/themes.json", function (json) {

        var menu = $("#mainmenu");
        for (var i in json) {
            // themeData.push(json[i]);
            menu.append("<div class='menuitem'>" + json[i] + "</div>")

        }


    })

    $.getJSON("data/featuredstories.json", function (json) {
        console.log(json);
        var data = $("#featuredstories .data");
        for (var i in json) {
            // themeData.push(json[i]);
            data.append("<div class='featuredstory'><div>" + json[i].name + "</div></div>")

        }


    })
}