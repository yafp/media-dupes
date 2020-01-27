/**
 * @file Contains all helper and utility functions
 * @author yafp
 * @module utils
 */

'use strict'

/**
* @function writeConsoleMsg
* @summary Writes console output for the renderer process
* @description Writes console output for the renderer process
* @param {string} type - String which defines the log type
* @param {string} message - String which defines the log message
*/
function writeConsoleMsg (type, message) {
    const prefix = '[ Renderer ] '
    const log = require('electron-log')
    // electron-log can: error, warn, info, verbose, debug, silly
    switch (type) {
    case 'info':
        log.info(prefix + message)
        break

    case 'warn':
        log.warn(prefix + message)
        break

    case 'error':
        log.error(prefix + message)
        break

    default:
        log.silly(prefix + message)
    }
}

/**
* @function showNoty
* @summary Shows a noty notification
* @description Creates an in-app notification using the noty framework
* @param {string} type - Options: alert, success, warning, error, info/information
* @param {string} message - notification text
* @param {number} [timeout] - Timevalue, defines how long the message should be displayed. Use 0 for no-timeout
*/
function showNoty (type, message, timeout = 3000) {
    const Noty = require('noty')
    new Noty({
        type: type,
        timeout: timeout,
        theme: 'bootstrap-v4',
        layout: 'bottom',
        text: message
    }).show()
}

/**
* @function showNotification
* @summary Shows a desktop notification
* @description Shows a desktop notification
* @param {string} [title] - The title of the desktop notification
* @param {string} message - The notification message text
*/
function showNotification (title = 'media-dupes', message) {
    const myNotification = new Notification(title, {
        body: message,
        icon: 'img/notification/icon.png'
    })

    myNotification.onclick = () => {
        writeConsoleMsg('info', 'showNotification ::: Notification clicked')
    }
}

/**
* @function openURL
* @summary Opens an url in browser
* @description Opens a given url in default browser. This is pretty slow, but got no better solution so far.
* @param {string} url - URL string which contains the target url
*/
function openURL (url) {
    const { shell } = require('electron')
    writeConsoleMsg('info', 'openURL ::: Trying to open the url: _' + url + '_.')
    shell.openExternal(url)
}

/**
* @function validURL
* @summary checks if a given string is a valid url
* @description checks if a given string is a valid url
* @param {string} -str - Given url
* @return {boolean}
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
* @function formatBytes
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
* @function isEncoded
* @summary Helper method for fullyDecodeURI
* @description Helper method for fullyDecodeURI
* @param {string} uri - the uri to check
* @return {string} uri - the decoded uri
*/
function isEncoded (uri) {
    uri = uri || ''
    return uri !== decodeURIComponent(uri)
}

/**
* @function fullyDecodeURI
* @summary Used to decode URLs
* @description Used to decode URLs
* param {string} uri - The incoming uri
* @return {string} uri - a decoded url
*/
function fullyDecodeURI (uri) {
    while (isEncoded(uri)) {
        uri = decodeURIComponent(uri)
    }
    return uri
}

/**
* @function pathExists
* @summary Checks if a given filepath exists
* @description Checks if a given filepath exists using fs. Returns a boolean
* param {string} path - The path which should be checked for existance
* @return {boolean} -If path exists or not
*/
function pathExists (path) {
    const fs = require('fs')
    if (fs.existsSync(path)) {
        return true // path exists
    } else {
        return false // path does not exists
    }
}

/**
* @function globalObjectGet
* @summary Gets a value of a single property from the global object in main.js
* @description Gets a value of a single property from the global object in main.js
* @param {String} property - Name of the property
* @return {string} value - Value of the property
*/
function globalObjectGet (property) {
    const { remote } = require('electron')
    var value = remote.getGlobal('sharedObj')[property]
    writeConsoleMsg('info', 'globalObjectGet ::: Property: _' + property + '_ has the value: _' + value + '_.')
    return value
}

/**
* @function globalObjectSet
* @summary Updates the value of a single property from the global object in main.js
* @description Updates the value of a single property from the global object in main.js
* @param {String} property - Name of the property
* @param {String} value - The new value of the property
*/
function globalObjectSet (property, value) {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('globalObjectSet', property, value)
}

/**
* @function isDirectoryAvailable
* @summary Checks if a given directory exists
* @description Checks if a given directory exists and returns a boolean
* @param {string} dirPath - The directory path which should be checked
* @return {boolean}
*/
function isDirectoryAvailable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')
        if (fs.existsSync(dirPath)) {
            writeConsoleMsg('info', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ exists')
            return true
        } else {
            writeConsoleMsg('error', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ does not exist')
            return false
        }
    } else {
        writeConsoleMsg('error', 'isDirectoryAvailable ::: Should check if a directory exists but the supplied parameter _' + dirPath + '_ was empty')
    }
}

/**
* @function isDirectoryWriteable
* @summary Checks if a given directory is writeable
* @description Checks if a given directory is writeable and returns a boolean
* @param {string} dirPath  - The directory path which should be checked
* @return {boolean}
*/
function isDirectoryWriteable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')

        // sync: check if folder is writeable
        try {
            fs.accessSync(dirPath, fs.constants.W_OK)
            writeConsoleMsg('info', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is writeable')
            return true
        } catch (err) {
            writeConsoleMsg('error', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        writeConsoleMsg('error', 'isDirectoryWriteable ::: Should check if a directory is writeable but the supplied parameter _' + dirPath + '_ was empty.')
    }
}

// Export
//
module.exports.writeConsoleMsg = writeConsoleMsg
module.exports.showNoty = showNoty
module.exports.showNotification = showNotification
module.exports.openURL = openURL
module.exports.validURL = validURL
module.exports.formatBytes = formatBytes
module.exports.isEncoded = isEncoded
module.exports.fullyDecodeURI = fullyDecodeURI
module.exports.pathExists = pathExists
module.exports.globalObjectGet = globalObjectGet
module.exports.globalObjectSet = globalObjectSet
module.exports.isDirectoryAvailable = isDirectoryAvailable
module.exports.isDirectoryWriteable = isDirectoryWriteable
