document.addEventListener("DOMContentLoaded", windowReady);

function windowReady() {
    if ($ == null || $ == undefined) {
        setTimeout(windowReady, 1000);
        return
    }

    $.ajax({
        url: 'https://antitheos.github.io/TellMeAStory/web-flow-sources/themes.json',
        dataType: 'json',
        success: function (data) {
            var el = $("#theme-selector");
            for (var x in data) {
                el.append("<option>" + data[x] + "</option>");

            }
        }
    });
}
