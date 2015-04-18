'use strict';

var spotify = {
    label: 'spotify',
    checker: /(play|open).spotify/,
    id: /track\/([\w\d]+)/,

    get_track_info: function (url, callback) {
        var search_url = 'https://api.spotify.com/v1/tracks/',
            parts = url.match(this.id);

        if (!parts) {
            callback(null);
            return;
        }

        http_get(search_url + parts[1], function (res) {
            var result = JSON.parse(res.responseText);

            callback({
                title: result.name,
                artist: result.artists[0].name,
                album: result.album.name
            });
        });
    },

    find_track_info: function (track, callback) {
        var search_url = 'https://api.spotify.com/v1/search?type=artist,track&q=' +
            encodeURIComponent(track.artist) + '+' +
            encodeURIComponent(track.title);

        http_get(search_url, function (res) {
            var result = JSON.parse(res.responseText);
            callback(result.tracks.items[0].external_urls.spotify);
        });
    }
};
