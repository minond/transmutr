'use strict';

integration('lastfm', {
    urls: ['*://*.last.fm/*'],
    checker: /last.fm\/music\/.+\/_\/.+/,
    base_url: 'http://ws.audioscrobbler.com/2.0/',
    api_key: '056227de573c896b4c2a331b713b1df3',

    get_track_info: function (url, callback) {
        var parts = explode_url(url);
        var band_info = parts.pathname.split("/");

        if (!band_info) {
            callback(null);
            return;
        }

        http_get(url, function (res) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = res.responseText;
            var album_name = wrapper.querySelector('a.media-link-reference').innerHTML; 

            // band_info array layout
            // 0: ""
            // 1: "music"
            // 2: "ARTIST"
            // 3: "_"
            // 4: "SONG TITLE"
            callback({
                title: band_info[4],
                artist: band_info[2].replace("+", " "),
                album: album_name
            });
        });
    },

    get_track_url: function (track, callback) {
        var search_url = this.base_url + '?method=track.search';
            search_url += '&artist=' + decodeURIComponent(encodeURIComponent(track.artist));
            search_url += '&track=' + decodeURIComponent(encodeURIComponent(track.title));
            search_url += '&api_key=' + this.api_key;
            search_url += '&format=json';

        http_get(search_url, function (res) {
            var result = JSON.parse(res.responseText),
                tracks = result.results.trackmatches.track,
                track = tracks instanceof Array ? tracks[0] : tracks;

            callback(track.url);
        });
    }
});
