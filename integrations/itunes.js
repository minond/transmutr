'use strict';

integration('itunes', {

    urls: ['*://itunes.apple.com/us/album*'],
    checker: /itunes.apple/,
    id: /album\/.+\/([\w\d]+)(.{0,}[&|\?]i=([\w\d]+))?/,

    get_track_info: function (url, callback) {
        var id = url.match(this.id)[3];
        var track_url = 'https://itunes.apple.com/lookup?id=' + id;

        http_get(track_url, function (res) {
            var result = JSON.parse(res.responseText).results[0];
            callback({
                title: result.trackName,
                artist: result.artistName,
                album: result.collectionName
            });
        });
    },

    get_track_url: function (track, callback) {
        var search_url = 'https://itunes.apple.com/search?entity=song&limit=1&term=' +
            encodeURIComponent(track.artist) + '+' +
            encodeURIComponent(track.title);

        http_get(search_url, function (res) {
            var result = JSON.parse(res.responseText);
            callback(result.results[0].trackViewUrl);
        });
    }
});
