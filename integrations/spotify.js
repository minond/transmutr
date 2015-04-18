var spotify_api = {
    get_track_info: function (id) {
        var req = new XMLHttpRequest(),
            url = 'https://api.spotify.com/v1/tracks/' + id;

        req.onload = function (resp) {
            console.log(JSON.parse(req.responseText));
        };

        req.open('GET', url, true);
        req.send();
    },

    find_track_info: function (album, track) {
        var api_url = 'https://api.spotify.com/v1/search?q=',
            api_end = '&type=artist,album,track',
            req = new XMLHttpRequest();

        api_url += encodeURIComponent(album) + '+';
        api_url += encodeURIComponent(track);

        req.onload = function (resp) {
            console.log(JSON.parse(req.responseText));
        };

        req.open('GET', api_url + api_end, true);
        req.send();
    }
}

// spotify_api.get_track_info('6rqhFgbbKwnb9MLmUQDhG6');
// spotify_api.find_track_info('Broken Bells', 'The High Road');
