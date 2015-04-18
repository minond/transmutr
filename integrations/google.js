'use strict';

integration('google', {
    urls: ['*://play.google.com/music/*'],
    checker: /play.google/,
    id: /preview\/([\w\d]+)/,

    get_track_info: function (url, callback) {
        var track_url = 'https://play.google.com/music/m/',
            parts = url.match(this.id);

        if (!parts) {
            callback(null);
            return;
        }

        http_get(track_url + parts[1], function (res) {
            console.log('response from google:', res.responseText);
            var wrapper = document.createElement('div');
            wrapper.innerHTML = res.responseText;

            var title_info = wrapper.querySelector('meta[property="og:title"]')
                .getAttribute('content').split(' - ');

            callback({
                title: title_info[0],
                artist: title_info[1]
            });
        });
    },

    get_track_url: function (track, callback) {
        var search_url = 'https://play.google.com/store/search?q=',
            search_end = '&c=music',
            track_url = 'https://play.google.com/music/m/';

        search_url += encodeURIComponent(track.artist + ' ');
        search_url += encodeURIComponent(track.title);

        http_get(search_url + search_end, function (res) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = res.responseText;
            var song_info = wrapper
                .querySelector('div.card.no-rationale.square-cover.music.small')

            callback(track_url + song_info.getAttribute('data-docid').slice(5))
        });
    }
});
