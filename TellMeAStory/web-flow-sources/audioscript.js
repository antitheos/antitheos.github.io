$.ajax({
    url: 'https://antitheos.github.io/TellMeAStory/web-flow-sources/themes.json',
    dataType: 'json',
    success: function (data) {
        var el = $("#theme-selector");
        for (var x in data) {
            console.log(data[x]);
            var op = el.add("option");
            op.text(data[x]);

        }
    }
});
