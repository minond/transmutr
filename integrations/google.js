'use strict';

integration('google', {
    urls: ['*://play.google.com/music/*'],
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
            var wrapper = document.createElement('div');
            wrapper.innerHTML = res.responseText;

            var title_info = wrapper.querySelector('meta[property="og:title"]')
                .getAttribute('content').split(' - ');

            callback({
                title: title_info[0],
                artist: title_info[1]
            });
        });
    }
});
