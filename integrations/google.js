'use strict';

var google = {
    label: 'google',
    checker: /play.google/,
    id: /preview\/([\w\d]+)/,

    get_track_info: function (url, callback) {
        var search_url = 'https://play.google.com/music/m/',
            parts = url.match(this.id);

        if (!parts) {
            callback(null);
            return;
        }

        http_get(search_url + parts[1], function (res) {
            console.log('response from google:', res.responseText);
            callback(null);
        });
    }
};
