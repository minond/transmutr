'use strict';

var SERVICE_URLS = [
    '*://*.spotify.com/track/*',
    '*://play.google.com/music/*'
]

var CHECK_GOOGLE = /play.google/,
    CHECK_SPOTIFY = /play.spotify/;

var ID_GOOGLE = /preview\/([\w\d]+)/,
    ID_SPOTIFY = /track\/([\w\d]+)/;

var SERVICE_GOOGLE = 'google',
    SERVICE_SPOTIFY = 'spotify';

/**
 * takes an integration string and returns an integration object
 * @see integrations/*.js
 * @param {String} service
 * @return {Object}
 */
function get_integration_for(service) {
    switch (service) {
        case SERVICE_SPOTIFY: return spotify_api;
    }
}

/**
 * takes a url and returns the service it's from and the id of the track
 *
 * example input:
 * https://play.spotify.com/track/1m85PpnCEa9EaU2z6lGwmO
 * https://play.google.com/music/preview/Th73lqpq5emphzzyg4mqgt4fwnu
 *
 * example output:
 * { service: 'spotify', id: '1m85PpnCEa9EaU2z6lGwmO' }
 * { service: 'google', id: 'Th73lqpq5emphzzyg4mqgt4fwnu' }
 *
 * @param {String} url
 * @return {Object}
 */
function parse(url) {
    function id(parser) {
        var parts = url.match(parser);
        return parts && parts.pop();
    }

    function packet(service, parser) {
        return {
            service: service,
            id: id(parser)
        };
    }

    switch (true) {
        case CHECK_SPOTIFY.test(url): return packet(SERVICE_SPOTIFY, ID_SPOTIFY);
        case CHECK_GOOGLE.test(url): return packet(SERVICE_GOOGLE, ID_GOOGLE);
    }
}

/**
 * @return {Object}
 */
function get_user_info() {
    return JSON.parse(localStorage.getItem('user'));
}

/**
 * @param {Object} user info object. right now just a `service` is required
 */
function set_user_info(info) {
    localStorage.setItem('user', JSON.stringify(info));
}

/**
 * async loads a js file
 * @param {String} script url
 */
function async_import_script(url) {
    var script = document.createElement('script');
    script.src = chrome.extension.getURL(url);
    document.head.appendChild(script);
}

/**
 * handles requests the browser is about to make that match the specified
 * filters.
 * @see SERVICE_URLS
 * @param {Object} req
 */
function incoming_request(req) {
    var info = parse(req.url),
        user = get_user_info();

    var requested_service = get_integration_for(info.service),
        prefered_service = get_integration_for(user.service);

    console.log('info', info)
    console.log('user', user)

    console.log('requested_service', requested_service);
    console.log('prefered_service', prefered_service);

    requested_service.get_track_info(info.id, function (track) {
        console.log(track);

        prefered_service.find_track_info(track.artist, track.title, function (url) {
            console.log('url', url);
        });
    });
}

// https://developer.chrome.com/extensions/background_pages
chrome.webRequest.onBeforeRequest.addListener(incoming_request, { urls: SERVICE_URLS }, []);
async_import_script('integrations/spotify.js');

// XXX
set_user_info({ service: SERVICE_SPOTIFY });
