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
 * takes a url string and returns an object containing each of the url parts
 * http://www.abeautifulsite.net/parsing-urls-in-javascript/
 * @param {String} url
 * @return {Object}
 */
function explode_url(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;

    // Let the browser do the work
    parser.href = url;

    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }

    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
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
 * @return {Boolean}
 */
function has_user_info() {
    return !!localStorage.getItem('user');
}

/**
 * @return {Object}
 */
function get_user_info() {
    return JSON.parse(localStorage.getItem('user'));
}

/**
 * options:
 * - service: {String} prefered service (eg. google)
 * - open_in: {String} how to open new url (eg. current, new)
 * @param {Object} user info object
 */
function set_user_info(info) {
    localStorage.setItem('user', JSON.stringify(info));
}

/**
 * @param {Boolean} [val]
 * @return {Boolean}
 */
function is_enabled(val) {
    return val === undefined ?
        localStorage.getItem('enabled') !== 'false' :
        localStorage.setItem('enabled', val);
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
    if (!is_enabled()) return;
    if (req.tabId === -1) return;

    var info = parse(req.url),
        user = get_user_info();

    if (!assert(info, 'parsed information from url')) return;
    if (!assert(user, 'retrieved user information')) return;

    var requested_service = get_integration_for(info.service),
        prefered_service = get_integration_for(user.service);

    if (!assert(requested_service, 'not able to find requested_service')) return;
    if (!assert(prefered_service, 'not able to find prefered_service')) return;
    if (!assert(requested_service !== prefered_service, 'cannot link to same service')) return;

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

            switch (user.open_in) {
                case 'new':
                    chrome.tabs.getSelected(null, function (tab) {
                        chrome.tabs.create({
                            url: url,
                            index: tab.index + 1
                        });
                    });
                    break;

                case 'current':
                    chrome.tabs.update({ url: url });
                    break;
            }
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

/**
 * helper for updating the extension's icon
 */
function set_extension_icon() {
    if (is_enabled()) {
        chrome.browserAction.setIcon({
            path: '/img/38.png'
        });
    } else {
        chrome.browserAction.setIcon({
            path: '/img/38-disabled.png'
        });
    }
}

// init
set_extension_icon();

if (!has_user_info()) {
    chrome.tabs.create({
        url: 'chrome://extensions/?options=' + chrome.runtime.id
    });

    set_user_info({ opened: true });
}

callbacks([
    async_import_script.bind(null, 'integrations/rdio.js'),
    async_import_script.bind(null, 'integrations/spotify.js'),
    async_import_script.bind(null, 'integrations/google.js'),
    async_import_script.bind(null, 'integrations/lastfm.js'),
    async_import_script.bind(null, 'integrations/itunes.js'),
    async_import_script.bind(null, 'integrations/beats.js'),
], function () {
    chrome.webRequest.onBeforeRequest.addListener(incoming_request, {
        urls: integration.url_filters
    }, []);

    chrome.browserAction.onClicked.addListener(function(tab) {
        is_enabled(!is_enabled());
        set_extension_icon();
    });
});
