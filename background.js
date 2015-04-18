// https://developer.chrome.com/extensions/background_pages
chrome.webRequest.onBeforeRequest.addListener(function (req) {
    console.log('%s => %s', req.method, req.url);
}, {
    urls: [
        "*://*.spotify.com/track/*",
        "*://play.google.com/music/*"
    ]
}, []);
