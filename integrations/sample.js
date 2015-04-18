'use strict';

/**
 * @example get_track_info
 * get_track_info('http://service/track/6rqhFgbbKwnb9MLmUQDhG6', function (track) {
 *     console.log('%s by %s on %s', track.name, track.artist, track.album);
 * });
 *
 * @example get_track_url
 * find_track_info({ artist: 'Broken Bells', title: 'The High Road', album: 'X' }, function (url) {
 *     console.log('url to play this song: %s', url);
 * });
 */
integration('sample', {
    /**
     * array of urls to listen for
     * @type {Array}
     */
    urls: ['*://*.spotify.com/track/*'],

    /**
     * pattern for detecting a track url from service X
     * @type {RegExp}
     */
    checker: /(play|open).spotify/,

    /**
     * pattern for matching a track id from service X
     * @type {RegExp}
     */
    id: /track\/([\w\d]+)/,

    /**
     * takes a track url from service X and returns an object with information
     * like: the name of the song; artist; and album.
     * @param {String} url
     * @param {Function} callback
     */
    get_track_info: function (url, callback) {
    },

    /**
     * takes information about a song and returns a url to play that song in
     * service X
     * @param {Object} track
     * @param {Function} callback
     */
    find_track_info: function (track, callback) {
    }
});
