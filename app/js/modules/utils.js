/**
 * @file Contains all helper and utility functions
 * @author yafp
 * @module utils
 */

'use strict'

/**
* @name openURL
* @summary Opens an url in browser
* @description Opens a given url in default browser. This is pretty slow, but got no better solution so far.
* @param url - URL string which contains the target url
*/
function openURL (url) {
    const { shell } = require('electron')
    // doLogToConsole('info', 'openURL ::: Trying to open the url: _' + url + '_.')
    shell.openExternal(url)
}

/**
* @name validURL
* @summary checks if a given string is a valid url
* @description checks if a given string is a valid url
* @param str - Given url
* @return boolean
*/
function validURL (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
    return !!pattern.test(str)
}

/**
* @name formatBytes
* @summary Calculate bytes to...
* @description Calculate bytes to...
* @param bytes - Incoming bytes value
* @param decimals (optimal, defaults to 2)
* @return Human readable value
*/
function formatBytes (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
* @name isEncoded
* @summary Helper method for fullyDecodeURI
* @description Helper method for fullyDecodeURI
* @param uri
* @return uri
*/
function isEncoded (uri) {
    uri = uri || ''
    return uri !== decodeURIComponent(uri)
}

/**
* @name fullyDecodeURI
* @summary Used to decode URLs
* @description Used to decode URLs
* param uri - The incoming uri
* @return uri - a decoded url
*/
function fullyDecodeURI (uri) {
    while (isEncoded(uri)) {
        uri = decodeURIComponent(uri)
    }
    return uri
}

/**
* @name pathExists
* @summary Checks if a given filepath exists
* @description Checks if a given filepath exists using fs. Returns a boolean
* param path - The path which should be checked for existance
* @return boolean -If path exists or not
*/
function pathExists (path) {
    const fs = require('fs')
    if (fs.existsSync(path)) {
        return true // path exists
    } else {
        return false // path does not exists
    }
}

module.exports.openURL = openURL
module.exports.validURL = validURL
module.exports.formatBytes = formatBytes
module.exports.isEncoded = isEncoded
module.exports.fullyDecodeURI = fullyDecodeURI
module.exports.pathExists = pathExists
