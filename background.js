'use strict';

/**
 * execute a single callback after multiple funcitons that take callsbacks are
 * done
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
    async_import_script.bind(null, 'lib.js'),
    async_import_script.bind(null, 'integrations/spotify.js'),
    async_import_script.bind(null, 'integrations/google.js'),
], function () {
    // https://developer.chrome.com/extensions/background_pages
    chrome.webRequest.onBeforeRequest.addListener(incoming_request, {
        urls: [
            '*://*.spotify.com/track/*',
            '*://play.google.com/music/*'
        ]
    }, []);

    // XXX
    set_user_info({ service: 'spotify' });
});
