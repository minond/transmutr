'use strict';

integration('rdio', {
    urls: ['*://*.rdio.com/artist/*'],
    checker: /www.rdio.com\/artist/,
    id: /rdio.com\/artist\/(.+?)\/album\/(.+?)\/track\/(.+?)\//,

    get_track_info: function (url, callback) {
        var parts = url.match(this.id);

        callback(!parts ? null : {
            title: parts[3],
            artist: parts[1],
            album: parts[2]
        });
    },

    get_track_url: function (track, callback) {
    }
});
