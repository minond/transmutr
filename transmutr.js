'use strict';

/**
 * @param {String} label
 * @param {Object} api
 */
function integration(label, api) {
    if (!integration.registered) {
        integration.registered = {};
    }

    integration.url_filters = integration.url_filters.concat(api.urls || []);
    integration.registered[ label ] = api;
}

/**
 * known integrations
 * @type {Object}
 */
integration.registered = {};

/**
 * list of urls to listen for
 * @type {Array}
 */
integration.url_filters = ['http://nothing.com/'];

/**
 * @param {String} url
 * @param {Function} callback
 * @return {XMLHttpRequest}
 */
function http_get(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        callback(xhr);
    };

    xhr.open('GET', url, true);
    xhr.send();

    return xhr;
}

function for_in(obj, callback) {
    var ret;

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            ret = callback(obj[key], key);

            if (ret !== undefined) {
                return ret;
            }
        }
    }
}

/**
 * takes an integration string and returns an integration object
 * @see integrations/*.js
 * @param {String} service
 * @return {Object}
 */
function get_integration_for(service) {
    return for_in(integration.registered, function (api, label) {
        if (label === service) {
            return api;
        }
    });
}

/**
 * takes a url and returns the service it's from and the id of the track
 *
 * example input:
 * https://play.spotify.com/track/1m85PpnCEa9EaU2z6lGwmO
 * https://play.google.com/music/preview/Th73lqpq5emphzzyg4mqgt4fwnu
 *
 * example output:
 * { service: 'spotify' }
 * { service: 'google' }
 *
 * @param {String} url
 * @return {Object}
 */
function parse(url) {
    return for_in(integration.registered, function (api, label) {
        if (api.checker.test(url)) {
            return { service: label };
        }
    });
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
 * outputs a warning message and returns false when val is falsy
 * @param {mixed} val
 * @param {String} message
 */
function assert(val, message) {
    return !!val || console.warn('WARNING: %s', message);
}

/**
 * handles requests the browser is about to make that match the specified
 * filters.
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

    requested_service.get_track_info(req.url, function (track) {
        if (!assert(track, 'unable to find track results')) return;
        console.info(track);

        prefered_service.get_track_url(track, function (url) {
            if (!assert(url, 'unable to find track url')) return;
            console.info('url', url);
        });
    });
}

/**
 * execute a single callback after multiple funcitons that take callsbacks are done
 * @param {Function[]} calls
 * @param {Function}
 */
function callbacks(calls, callback) {
    var len = calls.length,
        results = [],
        curr = 0;

    function done(running) {
        return function (res) {
            results[ calls.indexOf(running) ] = res;

            if (++curr === len) {
                callback(results);
            }
        };
    }

    calls.forEach(function (fn) {
        fn(done(fn));
    });
}

/**
 * async loads a js file
 * @param {String} script url
 * @param {Function} [callback]
 */
function async_import_script(url, callback) {
    var script = document.createElement('script');
    script.src = chrome.extension.getURL(url);
    script.addEventListener('load', callback || function () {}, false);
    document.head.appendChild(script);
}

callbacks([
    async_import_script.bind(null, 'integrations/rdio.js'),
    async_import_script.bind(null, 'integrations/spotify.js'),
    async_import_script.bind(null, 'integrations/google.js'),
    async_import_script.bind(null, 'integrations/lastfm.js'),
], function () {
    // https://developer.chrome.com/extensions/background_pages
    chrome.webRequest.onBeforeRequest.addListener(incoming_request, {
        urls: integration.url_filters
    }, []);

    // XXX
    set_user_info({ service: 'lastfm' });
});
