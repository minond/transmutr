'use strict';

integration('lastfm', {
    urls: ['*://*.last.fm/*'],
    checker: /last.fm\/music\/.+\/_\/.+/,
    base_url: 'http://ws.audioscrobbler.com/2.0/',
    api_key: '056227de573c896b4c2a331b713b1df3',

    parse_url: function (url) {
        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;

        // Let the browser do the work
        parser.href = url;

        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }

        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    },

    get_track_info: function (url, callback) {
        var parts = this.parse_url(url);
        var band_info = parts.pathname.split("/");

        if (!band_info) {
            callback(null);
            return;
        }

        // band_info array layout
        // 0: ""
        // 1: "music"
        // 2: "ARTIST"
        // 3: "_"
        // 4: "SONG TITLE"
        callback({
            title: band_info[4],
            artist: band_info[2],
            album: null
        });
    },

    get_track_url: function (track, callback) {
        var search_url = this.base_url + '?method=track.search';
            search_url += '&artist=' + decodeURIComponent(encodeURIComponent(track.artist));
            search_url += '&track=' + decodeURIComponent(encodeURIComponent(track.title));
            search_url += '&api_key=' + this.api_key;
            search_url += '&format=json';

        http_get(search_url, function (res) {
            var result = JSON.parse(res.responseText);
            callback(result.results.trackmatches.track[0].url);
        });
    }
});
