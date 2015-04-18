'use strict';

var google = {
    label: 'google',
    checker: /play.google/,
    id: /preview\/([\w\d]+)/,

    get_track_info: function (id) {
        var req = new XMLHttpRequest();
        var url = 'https://play.google.com/music/m/' + id;

        req.onload = function (resp) {
            var result = JSON.parse(req.responseText);

            console.log(result);
            // complete_url = result.external_urls.spotify;
        };

        req.open('GET', url, true);
        req.send();
    }
};
