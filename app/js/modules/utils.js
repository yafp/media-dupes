/**
 * @file Contains all helper and utility functions
 * @author yafp
 * @module utils
 */
'use strict'

// ----------------------------------------------------------------------------
// REQUIRE MODULES
// ----------------------------------------------------------------------------
//
const sentry = require('./sentry.js')
const ui = require('./ui.js')

/**
* @function writeConsoleMsg
* @summary Writes console output for the renderer process
* @description Writes console output for the renderer process
* @param {string} type - String which defines the log type
* @param {string} message - String which defines the log message
*/
function writeConsoleMsg (type, message) {
    var consoleOutput = globalObjectGet('consoleOutput')
    if (consoleOutput === true) {
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
        text: message,
        animation: {
            open: 'animated fadeIn', // Animate.css class names: default: bounceInRight
            close: 'animated fadeOut' // Animate.css class names: default:bounceOutRight
        }
    }).show()
}

/**
* @function showNotification
* @summary Shows a desktop notification
* @description Shows a desktop notification
* @param {string} message - The notification message text
* @param {string} [title] - The title of the desktop notification
*/
function showNotification (message, title = 'media-dupes') {
    const myNotification = new Notification(title, {
        body: message,
        icon: 'img/notification/icon.png'
    })

    myNotification.onclick = () => {
        writeConsoleMsg('info', 'showNotification ::: Notification clicked')

        const { ipcRenderer } = require('electron')
        ipcRenderer.send('showAndFocusMainUI') // tell main.js to show the main UI
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
    // writeConsoleMsg('info', 'globalObjectGet ::: Property: _' + property + '_ has the value: _' + value + '_.')
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

function isFileWriteable (filePath) {
    if (filePath !== '') {
        const fs = require('fs')

        // sync: check if folder is writeable
        try {
            fs.accessSync(filePath, fs.constants.W_OK)
            writeConsoleMsg('info', 'isFileWriteable ::: File _' + filePath + '_ is writeable')
            return true
        } catch (err) {
            writeConsoleMsg('error', 'isFileWriteable ::: File _' + filePath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        writeConsoleMsg('error', 'isFileWriteable ::: Should check if a file is writeable but the supplied parameter _' + filePath + '_ was empty.')
    }
}

/**
* @function userSettingWrite
* @summary Write a user setting to file
* @description Writes a value for a given key to electron-json-storage
* @param {String} key - Name of storage key
* @param {String} value - New value
* @param {boolean} [silent] - If true - no notification is displayed on initial settingscreation
* @throws Exception when writing a file failed
*/
function userSettingWrite (key, value, silent = false) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    // set new path for userUsettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // write the user setting
    storage.set(key, { setting: value }, function (error) {
        if (error) {
            writeConsoleMsg('error', 'userSettingWrite ::: Unable to write setting _' + key + '_ = _' + value + '_. Error: ' + error)
            throw error
        }
        writeConsoleMsg('info', 'userSettingWrite ::: _' + key + '_ = _' + value + '_')
        globalObjectSet(key, value)

        if (silent === false) {
            showNoty('success', 'Set <b>' + key + '</b> to <b>' + value + '</b>.')
        }
    })
}

/**
* @function userSettingRead
* @summary Read a user setting from file
* @description Reads a value stored in local storage (for a given key)
* @param {String} key - Name of local storage key
* @param {Boolean} [optionalUpdateSettingUI] Boolean used for an ugly hack
*/
function userSettingRead (key, optionalUpdateSettingUI = false) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    // writeConsoleMsg('info', 'userSettingRead ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            writeConsoleMsg('error', 'userSettingRead ::: Unable to read user setting. Error: ' + error)
            throw error
        }
        var value = data.setting
        // writeConsoleMsg('info', 'userSettingRead :::  _' + key + '_ = _' + value + '_.')

        // Setting: enableVerboseMode
        //
        if (key === 'enableVerboseMode') {
            var settingVerboseMode

            // if it is not yet configured
            if ((value === null) || (value === undefined)) {
                settingVerboseMode = false // set the default default
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingVerboseMode + '_.')
                userSettingWrite('enableVerboseMode', settingVerboseMode, true) // write the setting
            } else {
                settingVerboseMode = value // update global var
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingVerboseMode + '_.')
            }
            globalObjectSet('enableVerboseMode', settingVerboseMode) // update the global object

            // Optional: update the settings UI
            if (optionalUpdateSettingUI === true) {
                if (settingVerboseMode === true) {
                    $('#checkboxEnableVerbose').prop('checked', true)
                } else {
                    $('#checkboxEnableVerbose').prop('checked', false)
                }
            }
        }
        // end: enableVerboseMode

        // Setting: enableAdditionalParameter
        //
        if (key === 'enableAdditionalParameter') {
            var settingAdditionalParameter

            // if it is not yet configured
            if ((value === null) || (value === undefined)) {
                settingAdditionalParameter = false // set the default
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingAdditionalParameter + '_.')
                userSettingWrite('enableAdditionalParameter', settingAdditionalParameter, true) // write the setting
            } else {
                settingAdditionalParameter = value // update global var
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingVerboseMode + '_.')
            }
            globalObjectSet('enableAdditionalParameter', settingAdditionalParameter) // update the global object

            // Optional: update the settings UI
            if (optionalUpdateSettingUI === true) {
                if (settingAdditionalParameter === true) {
                    $('#checkboxEnableAdditionalParameter').prop('checked', true)
                } else {
                    $('#checkboxEnableAdditionalParameter').prop('checked', false)
                }
            }
        }
        // end: enableAdditionalParameter

        // Setting: additonalYoutubeDlParameter
        //
        if (key === 'additionalYoutubeDlParameter') {
            var settingAdditionalDefinedParameter

            // if it is not yet configured
            if ((value === null) || (value === undefined)) {
                settingAdditionalDefinedParameter = '' // set the default
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingAdditionalParameter + '_.')
                userSettingWrite('additionalYoutubeDlParameter', settingAdditionalDefinedParameter, true) // write the setting
            } else {
                settingAdditionalDefinedParameter = value // update global var
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingAdditionalDefinedParameter + '_.')
            }
            globalObjectSet('additionalYoutubeDlParameter', settingAdditionalDefinedParameter) // update the global object

            // Optional: update the settings UI
            if (optionalUpdateSettingUI === true) {
                $('#textInputAdditionalParameter').val(settingAdditionalDefinedParameter)
            }
        }
        // end: enableAdditionalParameter

        // Setting: enablePrereleases
        //
        if (key === 'enablePrereleases') {
            var settingPrereleases

            // if it is not yet configured
            if ((value === null) || (value === undefined)) {
                settingPrereleases = false // set the default
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingPrereleases + '_.')
                userSettingWrite('enablePrereleases', settingPrereleases, true) // write the setting
            } else {
                settingPrereleases = value // update global var
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingPrereleases + '_.')
            }
            globalObjectSet('enablePrereleases', settingPrereleases) // update the global object

            // Optional: update the settings UI
            if (optionalUpdateSettingUI === true) {
                if (settingPrereleases === true) {
                    $('#checkboxEnablePreReleases').prop('checked', true)
                } else {
                    $('#checkboxEnablePreReleases').prop('checked', false)
                }
            }
        }
        // end: enablePrereleases

        // Setting: enableErrorReporting
        //
        if (key === 'enableErrorReporting') {
            var settingEnableErrorReporting

            // not configured
            if ((value === null) || (value === undefined)) {
                settingEnableErrorReporting = true
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingEnableErrorReporting + '_.')
                userSettingWrite('enableErrorReporting', true, true) // write the setting
                sentry.enableSentry()
            } else {
                settingEnableErrorReporting = value
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingEnableErrorReporting + '_.')

                if (settingEnableErrorReporting === true) {
                    sentry.enableSentry()
                } else {
                    sentry.disableSentry()
                }
            }
            globalObjectSet('enableErrorReporting', settingEnableErrorReporting) // update the global object

            // Optional: update the settings UI
            if (optionalUpdateSettingUI === true) {
                if (settingEnableErrorReporting === true) {
                    $('#checkboxEnableErrorReporting').prop('checked', true)
                } else {
                    $('#checkboxEnableErrorReporting').prop('checked', false)
                }
            }
        }
        // end: enableErrorReporting

        // Setting: downloadDir
        //
        if (key === 'downloadDir') {
            const { remote } = require('electron')
            var settingDownloadDir

            // not yet set - seems like initial run
            if ((value === null) || (value === undefined)) {
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initial run - lets set the defaut dir.')
                var detectedDefaultDownloadDir = defaultDownloadFolderGet() // lets set it do the users default folder dir
                if (detectedDefaultDownloadDir[0]) {
                    settingDownloadDir = detectedDefaultDownloadDir[1]
                    userSettingWrite('downloadDir', settingDownloadDir, true)
                    writeConsoleMsg('info', 'userSettingRead :::  _' + key + '_ got initial value: _' + settingDownloadDir + '_.')
                }
            } else {
                // there is a setting
                settingDownloadDir = value
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingDownloadDir + '_.')

                // check if directory exists
                if (isDirectoryAvailable(settingDownloadDir)) {
                    // check if directory is writeable
                    if (isDirectoryWriteable(settingDownloadDir)) {
                        // dir is available and writeable - seems like everything is ok
                        globalObjectSet('downloadDir', settingDownloadDir)
                    } else {
                        writeConsoleMsg('error', 'userSettingRead ::: Configured download dir _' + settingDownloadDir + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        settingDownloadDir = ''
                        globalObjectSet('downloadDir', settingDownloadDir)

                        // delete the config
                        storage.remove('downloadDir', function (error) {
                            if (error) {
                                writeConsoleMsg('error', 'userSettingRead ::: Unable to delete config. Error: ' + error)
                                throw error
                            }
                        })
                    }
                } else {
                    // dir does not exists
                    settingDownloadDir = ''
                    writeConsoleMsg('error', 'userSettingRead ::: Configured download dir _' + settingDownloadDir + '_ does not exists. Gonna reset the user-setting.')

                    settingDownloadDir = defaultDownloadFolderGet() // get the default download target
                    globalObjectSet('downloadDir', settingDownloadDir) // update the object
                    userSettingWrite('downloadDir', settingDownloadDir, true) // update the config
                }

                // Update UI select
                if (optionalUpdateSettingUI === true) {
                    $('#inputCustomTargetDir').val(settingDownloadDir)
                }
            }
            writeConsoleMsg('info', 'userSettingRead ::: _' + key + '_ = _' + settingDownloadDir + '_.')
        }
        // end: downloadDir

        // Setting: audioFormat
        //
        if (key === 'audioFormat') {
            var settingAudioFormat
            // not configured
            if ((value === null) || (value === undefined)) {
                settingAudioFormat = 'mp3'
                writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingAudioFormat + '_.')
                userSettingWrite('audioFormat', settingAudioFormat, true) // write the setting
            } else {
                settingAudioFormat = value
                writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingAudioFormat + '_.')
                globalObjectSet('audioFormat', settingAudioFormat)
            }

            // optional: Adjust the UI
            if (optionalUpdateSettingUI === true) {
                $('#inputGroupSelectAudio').val(settingAudioFormat) // Update UI select
            }
        }
        // end: audioFormat

        // Setting: confirmedDisclaimer
        //
        if (key === 'confirmedDisclaimer') {
            // special case - first check the global object - to make the -s startup parameter possible
            var skipDisclaimer = globalObjectGet('confirmedDisclaimer')
            if (skipDisclaimer === true) {
                // nothing to do here - we are skipping the disclaimer handling
            } else {
                var settingConfirmedDisclaimer
                // not configured
                if ((value === null) || (value === undefined)) {
                    writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Gonna show the disclaimer now')
                    disclaimerShow()
                } else {
                    settingConfirmedDisclaimer = true
                    globalObjectSet('confirmedDisclaimer', settingConfirmedDisclaimer)
                    writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingConfirmedDisclaimer + '_.')
                    ui.windowMainBlurSet(false) // unblur the main UI
                }
            }
        }
        // end: confirmedDisclaimer
    })
}

/**
* @function defaultDownloadFolderGet
* @summary Validates if the default download directory of the user is useable.
* @description Validates if the default download directory of the user is useable.
* @retun {boolean} boolean - Is the folder useable
* @return {String} defaultTargetPath - The path to the folder
*/
function defaultDownloadFolderGet () {
    var defaultTargetPath = globalObjectGet('downloadDir') // use the default download target - which was configured in main.js
    writeConsoleMsg('info', 'defaultDownloadFolderGet ::: Searching the default download directory for this user ....')
    writeConsoleMsg('info', 'defaultDownloadFolderGet ::: Got' + defaultTargetPath + ' from global object')

    // check if that directory still exists
    if (isDirectoryAvailable(defaultTargetPath)) {
        writeConsoleMsg('info', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists') // the default download folder exists

        // check if it is writeable
        if (isDirectoryWriteable(defaultTargetPath)) {
            writeConsoleMsg('info', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists and is writeable. We are all good and gonna use it now')
            return [true, defaultTargetPath]
        } else {
            // folder exists but is not writeable
            writeConsoleMsg('error', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists but is not writeable. This is a major problem')
            showNoty('error', 'Your configured custom download directory <b>' + defaultTargetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
            return [false, '']
        }
    } else {
        // was unable to detect a download folder. Should force the user to set a custom one
        writeConsoleMsg('error', 'defaultDownloadFolderGet ::: Was unable to detect an existing default download location')
        showNoty('error', 'Unable to detect an existing default download location. Please configure a  download directory in the application settings', 0)
        return [false, '']
    }
}

/**
* @function disclaimerCheck
* @summary Checks if the disclaimer should be shown or not
* @description Is using userSettingRead() to read the user setting confirmedDisclaimer.json. If it exists the user previously confirmed it.
*/
function disclaimerCheck () {
    userSettingRead('confirmedDisclaimer')
}

/**
* @function disclaimerShow
* @summary Opens the disclaimer as dialog
* @description Displays a disclaimer regarding app usage. User should confirm it once. Setting is saved in UserSettings (.json file)
*/
function disclaimerShow () {
    const dialog = require('electron').remote.dialog
    writeConsoleMsg('warn', 'disclaimerShow ::: Showing the disclaimer now.')
    var disclaimerTitle = 'media-dupes disclaimer'
    var disclaimerText = 'THIS SOFTWARE IS PROVIDED BY THE DEVELOPERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.'

    var choice = dialog.showMessageBoxSync(this,
        {
            type: 'info',
            buttons: ['Confirm'],
            title: disclaimerTitle,
            message: disclaimerText
        })
    if (choice === 0) {
        writeConsoleMsg('info', 'disclaimerShow ::: User confirmed the disclaimer.')
        userSettingWrite('confirmedDisclaimer', true)
        ui.windowMainBlurSet(false) // unblur the main UI
    }
}

/**
* @function downloadStatusCheck
* @summary Checks if all downloads finished
* @description Checks if all downloads finished and creates a final status report using noty
* @param {number} - overall - The amount of overall urls
* @param {number} - succeeded - The amount of succeeded urls
* @param {number} - failed - The amount of failed urls
*/
function downloadStatusCheck (overall = 0, succeeded = 0, failed = 0) {
    var statusReport
    var notificationType
    var notificationTime

    writeConsoleMsg('info', 'downloadStatusCheck ::: Overall: ' + overall)
    writeConsoleMsg('info', 'downloadStatusCheck ::: Succeeded: ' + succeeded)
    writeConsoleMsg('warn', 'downloadStatusCheck ::: Failed: ' + failed)

    if (overall === succeeded + failed) {
        writeConsoleMsg('info', 'downloadStatusCheck ::: All download tasks are finished')

        // everything is fine
        if (overall === succeeded) {
            writeConsoleMsg('info', 'downloadStatusCheck ::: All downloads successfully')
            statusReport = 'Finished entire download queue (' + overall + ') successfully'
            notificationType = 'success'
            notificationTime = 3000
        }

        // some errors
        if ((overall === succeeded + failed) && (succeeded > 0) && (failed > 0)) {
            writeConsoleMsg('warn', 'downloadStatusCheck ::: Some downloads failed')
            statusReport = 'Finished entire download queue (' + overall + ') - ' + succeeded + ' succeeded and ' + failed + ' failed with errors.'
            notificationType = 'warning'
            notificationTime = 0
        }

        // all failed
        if ((overall === failed) && (succeeded === 0)) {
            writeConsoleMsg('error', 'downloadStatusCheck ::: All downloads failed')
            statusReport = 'Finished entire download queue (' + overall + ') - but all downloads failed with errors.'
            notificationType = 'error'
            notificationTime = 0
        }

        showNotification(statusReport) // show an OS notification
        showNoty(notificationType, statusReport, notificationTime) // show an in-app notification
        ui.windowMainLogAppend(statusReport + '', true) // append to log
        ui.windowMainLogAppend('### QUEUE ENDED ###\n\n', true) // Show mode in log
        ui.windowMainDownloadQueueFinished()

        // reset the datatable
        ui.dataTablesReset()
    } else {
        writeConsoleMsg('info', 'downloadStatusCheck ::: Some download tasks are not yet finished')
    }
}

/**
* @function generateTimestamp
* @summary Generates a timestamp
* @description Generates a timestamp using time-stamp
* @return {string} - timestamp - The generates timestamp
*/
function generateTimestamp () {
    const timestamp = require('time-stamp')
    var currentTimestamp = timestamp('HH:mm:ss') // hours : minutes : seconds
    return currentTimestamp
}

/**
* @function canWriteFileOrFolder
* @summary Checks if a file or folder is writeable
* @description Checks if a file or folder is writeable
* @param {String} path - Path which should be checked
*/
function canWriteFileOrFolder (path, callback) {
    const fs = require('fs')
    fs.access(path, fs.W_OK, function (err) {
        callback(null, !err)
    })
}

/**
* @function generateUrlId
* @summary generates an id based on a given url
* @description generates an id based on a given url
* @param {String} url - url
* @return {string} urlId - the generated md5
*/
function generateUrlId (url) {
    var md5 = require('md5')
    var urlId = md5(url)
    return urlId
}

// ----------------------------------------------------------------------------
// EXPORT THE MODULE FUNCTIONS
// ----------------------------------------------------------------------------
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
module.exports.isFileWriteable = isFileWriteable
module.exports.userSettingWrite = userSettingWrite
module.exports.userSettingRead = userSettingRead
module.exports.defaultDownloadFolderGet = defaultDownloadFolderGet
module.exports.disclaimerCheck = disclaimerCheck
module.exports.disclaimerShow = disclaimerShow
module.exports.downloadStatusCheck = downloadStatusCheck
module.exports.generateTimestamp = generateTimestamp
module.exports.canWriteFileOrFolder = canWriteFileOrFolder
module.exports.generateUrlId = generateUrlId
