'use strict';

integration('beats', {
    //http://on.beatsmusic.com/albums/al8992411/tracks/tr8992441
    urls: ['*://*.beatsmusic.com/*'],
    checker: /on.beatsmusic.com\/albums\/.+\/tracks\/.+/,
    api_url: "https://partner.api.beatsmusic.com/v1/api/",
    api_key: 'dj8nf6xp82aep7kstkkg3mr5',

    //https://partner.api.beatsmusic.com/v1/api/tracks/tr8992441?client_id=dj8nf6xp82aep7kstkkg3mr5
    get_track_info: function (url, callback) {
        var parts = explode_url(url);
        var band_info = parts.pathname.split("/");

        if (!band_info) {
            callback(null);
            return;
        }

        var full_url = this.api_url;
        full_url += "tracks/" + band_info[4];
        full_url += "?client_id=" + this.api_key;

         http_get(full_url, function (res) {
            var result = JSON.parse(res.responseText);
            console.log(result.data);
            console.log("get_track_info results ^");

            callback({
                title: result.data.title,
                artist: result.data.artist_display_name,
                album: null
            });
        });
    },

    get_track_url: function (track, callback) {
        var search_url = this.api_url + 'search?';
            search_url += 'q=' + decodeURIComponent(encodeURIComponent(track.title));
            search_url += '&client_id=' + this.api_key;
            search_url += '&type=track';

        http_get(search_url, function (res) {
            var result = JSON.parse(res.responseText);

            //http://on.beatsmusic.com/albums/al8992411/tracks/tr1139179
            var final_url = "http://on.beatsmusic.com/";
            final_url += "albums/" + track.album;
            final_url += "/tracks/";

            for (var i = 0; i < result.data.length; i++) {

                if (result.data[i].detail == track.artist.replace("+", " ")) {
                    final_url += result.data[i].id;
                    break;
                }
            }

            callback(final_url);
        });
    }
});
