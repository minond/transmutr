'use strict';

integration('rdio', {
    urls: ['*://*.rdio.com/artist/*'],
    checker: /www.rdio.com\/artist/,
    id: /rdio.com\/artist\/(.+?)\/album\/(.+?)\/track\/(.+?)\//,

    get_track_info: function (url, callback) {
        var parts = url.match(this.id);

        function clean(str) {
            return str.replace(/_/g, ' ');
        }

        callback(!parts ? null : {
            title: clean(parts[3]),
            artist: clean(parts[1]),
            album: clean(parts[2])
        });
    },

    get_track_url: function (track, callback) {
    }
});
