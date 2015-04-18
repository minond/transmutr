'use strict';

/**
 * @example get_track_info
 * sample.get_track_info('http://service/track/6rqhFgbbKwnb9MLmUQDhG6', function (track) {
 *     console.log('%s by %s on %s', track.name, track.artist, track.album);
 * });
 * 
 * @example find_track_info
 * sample.find_track_info('Broken Bells', 'The High Road', function (url) {
 *     console.log('url to play this song: %s', url);
 * });
 */
var sample = {
    /**
     * a label for this service. this is what is used to identify a service
     * @type {String}
     */
    label: 'spotify',

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
     * @param {String} artist
     * @param {String} track
     * @param {Function} callback
     */
    find_track_info: function (artist, track, callback) {
    }
};
