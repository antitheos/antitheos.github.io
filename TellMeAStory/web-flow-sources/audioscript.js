$.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/1DRi3DjB8YC2AURscSgNhfSEhEdQb3Ehh-5uIaR-CmDo/1/public/values?alt=json-in-script',
    dataType: 'jsonp',
    success: function (dataWeGotViaJsonp) {
        var ls = dataWeGotViaJsonp.feed.entry;
        for (var i in ls) {
            var p = ls[i];
            var person = p.gsx$participant.$t;
            if (partipants[person] == null) {
                partipants[person] = {
                    personName: person,
                    color: p.gsx$color.$t,
                    mapObjects: []
                };
            }
        }
        participantsReady = true;
    }
});