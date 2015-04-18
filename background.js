'use strict';

/**
 * takes an integration string and returns an integration object
 * @see integrations/*.js
 * @param {String} service
 * @return {Object}
 */
function get_integration_for(service) {
    switch (service) {
        case spotify.label: return spotify;
        case google.label: return google;
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
        case spotify.checker.test(url): return packet(spotify.label, spotify.id);
        case google.checker.test(url): return packet(google.label, google.id);
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

function assert(val, message) {
    return !!val || console.warn('WARNING: %s', message);
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

    if (!assert(info, 'parsed information from url')) return;
    if (!assert(user, 'retrieved user information')) return;

    var requested_service = get_integration_for(info.service),
        prefered_service = get_integration_for(user.service);

    if (!assert(requested_service, 'not able to find requested_service')) return;
    if (!assert(prefered_service, 'not able to find prefered_service')) return;

    console.info('info', info)
    console.info('user', user)
    console.info('requested_service', requested_service);
    console.info('prefered_service', prefered_service);

    requested_service.get_track_info(info.id, function (track) {
        if (!assert(track, 'unable to find track results')) return;
        console.info(track);

        prefered_service.find_track_info(track.artist, track.title, function (url) {
            if (!assert(url, 'unable to find track url')) return;
            console.info('url', url);
        });
    });
}

// https://developer.chrome.com/extensions/background_pages
chrome.webRequest.onBeforeRequest.addListener(incoming_request, {
    urls: [
        '*://*.spotify.com/track/*',
        '*://play.google.com/music/*'
    ]
}, []);

async_import_script('integrations/spotify.js');
async_import_script('integrations/google.js');

// XXX
set_user_info({ service: 'spotify' });
