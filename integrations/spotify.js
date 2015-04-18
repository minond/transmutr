'use strict';

var spotify = {
    label: 'spotify',
    checker: /(play|open).spotify/,
    id: /track\/([\w\d]+)/,

    get_track_info: function (url, callback) {
        var id = url.match(this.id)[1];
        var req = new XMLHttpRequest();

        url = 'https://api.spotify.com/v1/tracks/' + id;
        req.onload = function (resp) {
            var result = JSON.parse(req.responseText);
            callback({
                title: result.name,
                artist: result.artists[0].name,
                album: result.album.name
            });
        };

        req.open('GET', url, true);
        req.send();
    },

    find_track_info: function (artist, track, callback) {
        var api_url = 'https://api.spotify.com/v1/search?q=';
        api_url += encodeURIComponent(artist) + '+';
        api_url += encodeURIComponent(track);

        var api_end = '&type=artist,track',

        req = new XMLHttpRequest();

        req.onload = function (resp) {
            var result = JSON.parse(req.responseText);
            callback(result.tracks.items[0].external_urls.spotify);
        };

        req.open('GET', api_url + api_end, true);
        req.send();
    }
};
