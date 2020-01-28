/**
* @file Contains all renderer code
* @author yafp
* @namespace renderer
*/

'use strict'

// ----------------------------------------------------------------------------
// IMPORT MEDIA-DUPES MODULES
// ----------------------------------------------------------------------------
const utils = require('./js/modules/utils.js')
const ffmpeg = require('./js/modules/ffmpeg.js')
const sentry = require('./js/modules/sentry.js')
const ui = require('./js/modules/ui.js')

const youtube = require('./js/modules/youtubeDl.js')

// ----------------------------------------------------------------------------
// ERROR HANDLING
// ----------------------------------------------------------------------------
const errorReporting = require('./js/errorReporting.js')
// myUndefinedFunctionFromRenderer();

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------
var arrayUserUrls = [] // contains the urls which should be downloaded
var arrayUrlsThrowingErrors = [] // coontains urls which throws errors while trying to download

// Settings variables
//
var ytdlBinaryVersion = '0.0.0'
var youtubeDlBinaryDetailsVersion
var youtubeDlBinaryDetailsPath
var youtubeDLBinaryDetailsExec

// distract
var distractEnabler = 0

// ----------------------------------------------------------------------------
// FUNCTIONS - MAIN WINDOW CLICKS
// ----------------------------------------------------------------------------

/**
* @function windowMainClickDistract
* @summary Handles the click on the app icon
* @description Triggered from the mainWindow. Starts the easteregg / distract function
* @memberof renderer
*/
function windowMainClickDistract () {
    ui.windowMainDistract()
}

/**
* @function windowMainClickButtonAddUrl
* @summary Handles the click on the AddUrl button
* @description Triggered from the mainWindow. Starts the add url function
* @memberof renderer
*/
function windowMainClickButtonAddUrl () {
    ui.windowMainAddUrl()
}

/**
* @function windowMainClickButtonVideo
* @summary Handles the click on the video button
* @description Triggered from the mainWindow. Starts the video download function
* @memberof renderer
*/
function windowMainClickButtonVideo () {
    ui.windowMainDownloadContent('video')
}

/**
* @function windowMainClickButtonAudio
* @summary Handles the click on the audio button
* @description Triggered from the mainWindow. Starts the audio download function
* @memberof renderer
*/
function windowMainClickButtonAudio () {
    ui.windowMainDownloadContent('audio')
}

/**
* @function windowMainClickButtonSettings
* @summary Handles the click on the settings button
* @description Triggered from the mainWindow. Starts the settings UI
* @memberof renderer
*/
function windowMainClickButtonSettings () {
    ui.windowMainSettingsUiLoad()
}

/**
* @function windowMainClickButtonIntro
* @summary Handles the click on the intro button
* @description Triggered from the mainWindow. Starts the application intro
* @memberof renderer
*/
function windowMainClickButtonIntro () {
    ui.windowMainIntroShow()
}

/**
* @function windowMainClickButtonExtrators
* @summary Handles the click on the extractors button
* @description Triggered from the mainWindow. Starts the show supported extractors function
* @memberof renderer
*/
function windowMainClickButtonExtrators () {
    ui.windowMainShowSupportedExtractors()
}

/**
* @function windowMainClickButtonDownloads
* @summary Handles the click on the Downloads button
* @description Triggered from the mainWindow. Starts the open-download-folder function
* @memberof renderer
*/
function windowMainClickButtonDownloads () {
    ui.windowMainOpenDownloadFolder()
}

/**
* @function windowMainClickButtonLogReset
* @summary Handles the click on the log-reset button
* @description Triggered from the mainWindow. Starts the reset-log function
* @memberof renderer
*/
function windowMainClickButtonLogReset () {
    ui.windowMainLogReset()
}

/**
* @function windowMainClickButtonUIReset
* @summary Handles the click on the reset-UI button
* @description Triggered from the mainWindow. Starts the reset-UI function
* @memberof renderer
*/
function windowMainClickButtonUIReset () {
    ui.windowMainResetAskUser()
}

// ----------------------------------------------------------------------------
// FUNCTIONS - OTHERS
// ----------------------------------------------------------------------------

/**
* @function titlebarInit
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
* @memberof renderer
*/
function titlebarInit () {
    const customTitlebar = require('custom-electron-titlebar')

    const myTitlebar = new customTitlebar.Titlebar({
        titleHorizontalAlignment: 'center', // position of window title
        icon: 'img/icon/icon.png',
        drag: true, // whether or not you can drag the window by holding the click on the title bar.
        backgroundColor: customTitlebar.Color.fromHex('#171717'),
        minimizable: true,
        maximizable: true,
        closeable: true,
        itemBackgroundColor: customTitlebar.Color.fromHex('#525252') // hover color
    })

    // Be aware: the font-size of .window-title (aka application name) is set by app/css/core.css
    utils.writeConsoleMsg('info', 'titlebarInit ::: Initialized custom titlebar')
}

/**
* @function checkApplicationDependencies
* @function checkApplicationDependencies
* @summary Checks for missing dependencies
* @description Checks on startup for missing dependencies (youtube-dl and ffmpeg). Both are bundles and should be find
* @memberof renderer
*/
function checkApplicationDependencies () {
    var countErrors = 0

    // youtube-dl
    //
    var youtubeDlBinaryPath = youtube.youtubeDlBinaryPathGet()
    if (utils.pathExists(youtubeDlBinaryPath) === true) {
        utils.writeConsoleMsg('info', 'checkApplicationDependencies ::: Found youtube-dl in: _' + youtubeDlBinaryPath + '_.')
    } else {
        countErrors = countErrors + 1
        utils.writeConsoleMsg('error', 'checkApplicationDependencies ::: Unable to find youtube-dl in: _' + youtubeDlBinaryPath + '_.')
        utils.showNoty('error', 'Unable to find dependency <b>youtube-dl</b>. Please report this.', 0)
    }

    // ffmpeg
    //
    var ffmpegBinaryPath = ffmpeg.ffmpegGetBinaryPath()
    if (utils.pathExists(ffmpegBinaryPath) === true) {
        utils.writeConsoleMsg('info', 'checkApplicationDependencies ::: Found ffmpeg in: _' + ffmpegBinaryPath + '_.')
    } else {
        countErrors = countErrors + 1
        utils.writeConsoleMsg('error', 'checkApplicationDependencies ::: Unable to find ffmpeg in: _' + ffmpegBinaryPath + '_.')
        utils.showNoty('error', 'Unable to find dependency <b>ffmpeg</b>. Please report this', 0)
    }

    // if errors occured - disable / hide the action buttons
    //
    if (countErrors !== 0) {
        $('#buttonStartVideoExec').hide() // hide video button
        $('#buttonStartVideo').hide() // hide video button
        $('#buttonStartAudioExec').hide() // hide audio button
        utils.showNoty('error', 'Download buttons are now hidden. Please contact the developers via github.', 0)
    }

    utils.writeConsoleMsg('info', 'checkApplicationDependencies ::: Finished checking dependencies. Found overall _' + countErrors + '_ problems.')
}

/**
* @function settingsOpenDevTools
* @summary Tells the main process to open devTools for settings UI
* @description Tells the main process to open devTools for settings UI
* @memberof renderer
*/
function settingsOpenDevTools () {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsToggleDevTools')
}

/**
* @function settingsSelectDownloadDir
* @summary Let the user choose a custom download target directory
* @description Is triggered via button on settings.html.
* @memberof renderer
*/
function settingsSelectDownloadDir () {
    const options = { properties: ['openDirectory'] }
    const { dialog } = require('electron').remote

    utils.writeConsoleMsg('info', 'settingsSelectDownloadDir ::: User wants to set a custom download directory. Now opening dialog to select a new download target')
    dialog.showOpenDialog(options).then(res => {
        utils.writeConsoleMsg('warn', '_' + res.filePaths + '_')

        if (res.filePaths.length === 0) {
            utils.writeConsoleMsg('warn', 'settingsSelectDownloadDir ::: User aborted selecting a custom download directory path in settings')
            utils.showNoty('info', 'No changes applied.')
        } else {
            var newDownloadDirectory = res.filePaths.toString()
            userSettingWrite('downloadDir', newDownloadDirectory) // save the value to user-config
            $('#inputCustomTargetDir').val(newDownloadDirectory) // show it in the UI
            utils.writeConsoleMsg('info', 'settingsSelectDownloadDir ::: User selected the following directory: _' + newDownloadDirectory + '_ as download target.')

            // FIXME - is this needed?
            // utils.globalObjectSet('downloadDir', newDownloadDirectory)
        }
    })
}

/**
* @function settingsAudioFormatSave
* @summary Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @description Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @memberof renderer
*/
function settingsAudioFormatSave () {
    var userSelectedAudioFormat = $('#inputGroupSelectAudio').val() // get value from UI select inputGroupSelectAudio
    utils.writeConsoleMsg('info', 'settingsAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')
    userSettingWrite('audioFormat', userSelectedAudioFormat) // store this value in a json file
}

/**
* @function settingsLoadAllOnAppStart
* @summary Reads all user-setting-files and fills some global variables
* @description Reads all user-setting-files and fills some global variables
* @memberof renderer
*/
function settingsLoadAllOnAppStart () {
    utils.writeConsoleMsg('info', 'settingsLoadAllOnAppStart ::: Gonna read several user config files now ...')
    userSettingRead('enableVerboseMode') // verbose mode
    userSettingRead('enableErrorReporting') // get setting for error-reporting
    userSettingRead('downloadDir') // download dir
    userSettingRead('audioFormat') // get setting for configured audio format
}

/**
* @function settingsLoadAllOnSettingsUiLoad
* @summary Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @description Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @memberof renderer
*/
function settingsLoadAllOnSettingsUiLoad () {
    utils.writeConsoleMsg('info', 'settingsLoadAllOnAppStart ::: Gonna read several user config files now and adjust the settings UI')
    userSettingRead('enableVerboseMode', true) // verbose mode
    userSettingRead('enableErrorReporting', true)
    userSettingRead('downloadDir', true) // download dir
    userSettingRead('audioFormat', true) // load configured audio format and update the settings UI
}

/**
* @function settingsFolderOpen
* @summary Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
* @description Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
* @memberof renderer
*/
function settingsFolderOpen () {
    utils.writeConsoleMsg('info', 'settingsFolderOpen ::: User wants to open the folder with user config files.')
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsFolderOpen')
}

/**
* @function userSettingWrite
* @summary Write a user setting to file
* @description Writes a value for a given key to electron-json-storage
* @memberof renderer
* @param {String} key - Name of storage key
* @param {String} value - New value
* @throws Exception when writing a file failed
*/
function userSettingWrite (key, value) {
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
            utils.writeConsoleMsg('error', 'userSettingWrite ::: Unable to write setting with key: _' + key + '_ - and new value: _' + value + '_. Error: ' + error)
            throw error
        }
        utils.writeConsoleMsg('info', 'userSettingWrite ::: key: _' + key + '_ - new value: _' + value + '_')
        utils.globalObjectSet(key, value)
        utils.showNoty('success', 'Set <b>' + key + '</b> to <b>' + value + '</b>.')
    })
}

/**
* @function defaultDownloadFolderGet
* @summary Validates if the default download directory of the user is useable.
* @description Validates if the default download directory of the user is useable.
* @memberof renderer
* @retun {boolean} boolean - Is the folder useable
* @return {String} defaultTargetPath - The path to the folder
*/
function defaultDownloadFolderGet () {
    utils.writeConsoleMsg('warn', 'defaultDownloadFolderGet ::: Searching the default download directory for this user ....')
    var defaultTargetPath = utils.globalObjectGet('downloadDir') // use the default download target - which was configured in main.js

    utils.writeConsoleMsg('warn', 'defaultDownloadFolderGet ::: Got' + defaultTargetPath + ' from global object')

    // check if that directory still exists
    if (utils.isDirectoryAvailable(defaultTargetPath)) {
        utils.writeConsoleMsg('info', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists') // the default download folder exists

        // check if it is writeable
        if (utils.isDirectoryWriteable(defaultTargetPath)) {
            utils.writeConsoleMsg('info', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists and is writeable. We are all good and gonna use it now')
            return [true, defaultTargetPath]
        } else {
            // folder exists but is not writeable
            utils.writeConsoleMsg('error', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists but is not writeable. This is a major problem')
            utils.showNoty('error', 'Your configured custom download directory <b>' + defaultTargetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
            return [false, '']
        }
    } else {
        // was unable to detect a download folder
        utils.writeConsoleMsg('error', 'defaultDownloadFolderGet ::: Was unable to detect an existing default download location')
        // should force the user to set a custom one
        utils.showNoty('error', 'Unable to detect an existing default download location. Please configure a  download directory in the application settings', 0)
        return [false, '']
    }
}

/**
* @function userSettingRead
* @summary Read a user setting from file
* @description Reads a value stored in local storage (for a given key)
* @memberof renderer
* @param {String} key - Name of local storage key
* @param {Boolean} [optionalUpdateSettingUI] Boolean used for an ugly hack
*/
function userSettingRead (key, optionalUpdateSettingUI = false) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    utils.writeConsoleMsg('info', 'userSettingRead ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            utils.writeConsoleMsg('error', 'userSettingRead ::: Unable to read user setting. Error: ' + error)
            throw error
        }
        var value = data.setting
        utils.writeConsoleMsg('info', 'userSettingRead ::: key: _' + key + '_ - got value: _' + value + '_.')

        // Setting: enableVerboseMode
        //
        if (key === 'enableVerboseMode') {
            var settingVerboseMode

            // if it is not yet configured
            if ((value === null) || (value === undefined)) {
                settingVerboseMode = false // set the default default
                utils.writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingVerboseMode + '_.')
                userSettingWrite('enableVerboseMode', settingVerboseMode) // write the setting
            } else {
                settingVerboseMode = value // update global var
                utils.writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingVerboseMode + '_.')
            }

            // update the global object
            utils.globalObjectSet('enableVerboseMode', settingVerboseMode)

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

        // Setting: enableErrorReporting
        //
        if (key === 'enableErrorReporting') {
            var settingEnableErrorReporting

            // not configured
            if ((value === null) || (value === undefined)) {
                settingEnableErrorReporting = true
                utils.writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingEnableErrorReporting + '_.')
                userSettingWrite('enableErrorReporting', true) // write the setting
                sentry.enableSentry()
            } else {
                settingEnableErrorReporting = value
                utils.writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingEnableErrorReporting + '_.')

                if (settingEnableErrorReporting === true) {
                    sentry.enableSentry()
                } else {
                    sentry.disableSentry()
                }
            }

            // update the global object
            utils.globalObjectSet('enableErrorReporting', settingEnableErrorReporting)

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
                utils.writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initial run - lets set the defaut dir.')
                var detectedDefaultDownloadDir = defaultDownloadFolderGet() // lets set it do the users default folder dir
                if (detectedDefaultDownloadDir[0]) {
                    settingDownloadDir = detectedDefaultDownloadDir[1]
                    userSettingWrite('downloadDir', settingDownloadDir)
                    utils.writeConsoleMsg('info', 'userSettingRead ::: key: _' + key + '_ - got initial value: _' + settingDownloadDir + '_.')
                    // utils.globalObjectSet('downloadDir', settingDownloadDir)
                }
            } else {
                // there is a setting
                settingDownloadDir = value
                utils.writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingDownloadDir + '_.')

                // check if directory exists
                if (utils.isDirectoryAvailable(settingDownloadDir)) {
                    // check if directory is writeable
                    if (utils.isDirectoryWriteable(settingDownloadDir)) {
                        // dir is available and writeable - seems like everything is ok
                        utils.globalObjectSet('downloadDir', settingDownloadDir)
                    } else {
                        utils.writeConsoleMsg('error', 'userSettingRead ::: Configured download dir _' + settingDownloadDir + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        settingDownloadDir = ''
                        utils.globalObjectSet('downloadDir', settingDownloadDir)

                        // delete the config
                        storage.remove('downloadDir', function (error) {
                            if (error) {
                                utils.writeConsoleMsg('error', 'userSettingRead ::: Unable to delete config. Error: ' + error)
                                throw error
                            }
                        })
                    }
                } else {
                    // dir does not exists
                    settingDownloadDir = ''
                    utils.writeConsoleMsg('error', 'userSettingRead ::: Configured download dir _' + settingDownloadDir + '_ does not exists. Gonna reset the user-setting.')
                    utils.globalObjectSet('downloadDir', settingDownloadDir)

                    // delete the config
                    storage.remove('downloadDir', function (error) {
                        if (error) {
                            utils.writeConsoleMsg('error', 'userSettingRead ::: Unable to delete config. Error: ' + error)
                            throw error
                        }
                    })
                }

                // Update UI select
                if (optionalUpdateSettingUI === true) {
                    $('#inputCustomTargetDir').val(settingDownloadDir)
                }
            }
            utils.writeConsoleMsg('info', 'userSettingRead ::: Key: ' + key + ' with value: ' + settingDownloadDir)
        }
        // end: downloadDir

        // Setting: audioFormat
        //
        if (key === 'audioFormat') {
            var settingAudioFormat
            // not configured
            if ((value === null) || (value === undefined)) {
                settingAudioFormat = 'mp3'
                utils.writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Initializing it now with the default value: _' + settingAudioFormat + '_.')
                userSettingWrite('audioFormat', settingAudioFormat) // write the setting
            } else {
                settingAudioFormat = value
                utils.writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingAudioFormat + '_.')
                utils.globalObjectSet('audioFormat', settingAudioFormat)
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
            var settingConfirmedDisclaimer
            // not configured
            if ((value === null) || (value === undefined)) {
                utils.writeConsoleMsg('warn', 'userSettingRead ::: No user setting found for: _' + key + '_. Gonna show the disclaimer now')
                disclaimerShow()
            } else {
                settingConfirmedDisclaimer = true
                utils.globalObjectSet('confirmedDisclaimer', settingConfirmedDisclaimer)
                utils.writeConsoleMsg('info', 'userSettingRead ::: Found configured _' + key + '_ with value: _' + settingConfirmedDisclaimer + '_.')
            }
        }
        // end: enableErrorReporting
    })
}

/**
* @function checkUrlInputField
* @summary Handles auto-pasting urls to url input field
* @description Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
* @memberof renderer
*/
function checkUrlInputField () {
    utils.writeConsoleMsg('info', 'checkUrlInputField ::: Triggered on focus')
    var currentContentOfUrlInputField = $('#inputNewUrl').val() // get current content of field

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        const { clipboard } = require('electron')
        var currentClipboardContent = clipboard.readText() // get content of clipboard
        currentClipboardContent = currentClipboardContent.trim() // remove leading and trailing blanks

        // check if it is a valid url - if so paste it
        var isUrlValid = utils.validURL(currentClipboardContent)
        if (isUrlValid) {
            $('#inputNewUrl').val(currentClipboardContent) // paste it
            $('#inputNewUrl').select() // select it entirely
            utils.writeConsoleMsg('info', 'checkUrlInputField ::: Clipboard contains a valid URL (' + currentClipboardContent + '). Pasted it into the input field.')
        } else {
            utils.writeConsoleMsg('info', 'checkUrlInputField ::: Clipboard contains a non valid URL (' + currentClipboardContent + ').')
        }
    }
}

/**
* @function onEnter
* @summary Executed on keypress inside url-input-field
* @description Checks if the key-press was the ENTER-key - if so simulates a press of the button ADD URL
* @memberof renderer
* @event keyCode - The key press event
*/
function onEnter (event) {
    var code = 0
    code = event.keyCode
    if (code === 13) {
        windowMainClickButtonAddUrl() // simulare click on ADD URL buttom
    }
}

/**
* @function searchUpdate
* @summary Checks if there is a new media-dupes release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available. Is executed on app launch NOT on reload.
* @memberof renderer
* @param {booean} [silent] - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
    ui.windowMainApplicationStateSet('Searching media-dupes updates')

    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    const { urlGitHubRepoTags } = require('./js/modules/githubUrls.js') // get API url

    utils.writeConsoleMsg('info', 'searchUpdate ::: Start checking _' + urlGitHubRepoTags + '_ for available releases')

    var updateStatus = $.get(urlGitHubRepoTags, function (data) {
        3000 // in milliseconds

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        // remoteAppVersionLatest = '66.6.6' // overwrite variable to simulate available updates

        // get local version
        //
        localAppVersion = require('electron').remote.app.getVersion()
        // localAppVersion = '0.0.1'; //  overwrite variable to simulate

        utils.writeConsoleMsg('info', 'searchUpdate ::: Local media-dupes version: ' + localAppVersion)
        utils.writeConsoleMsg('info', 'searchUpdate ::: Latest media-dupes version: ' + remoteAppVersionLatest)

        // Update available
        if (localAppVersion < remoteAppVersionLatest) {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Found update, notify user')

            // ask user using a noty confirm dialog
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'info',
                    closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                    text: 'A media-dupes update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?',
                    buttons: [
                        Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                            n.close()
                            openReleasesOverview()
                        },
                        {
                            id: 'button1', 'data-status': 'ok'
                        }),

                        Noty.button('No', 'btn btn-secondary mediaDupes_btnDefaultWidth float-right', function () {
                            n.close()
                        })
                    ]
                })

            // show the noty dialog
            n.show()
        } else {
            utils.writeConsoleMsg('info', 'searchUpdate ::: No newer version of media-dupes found.')

            // when executed manually via menu -> user should see result of this search
            if (silent === false) {
                utils.showNoty('success', 'No media-dupes updates available')
            }
        }

        utils.writeConsoleMsg('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // utils.writeConsoleMsg('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Checking ' + urlGitHubRepoTags + ' for available releases failed.')
            utils.showNoty('error', 'Checking <b>' + urlGitHubRepoTags + '</b> for available media-dupes releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Finished checking ' + urlGitHubRepoTags + ' for available releases')
            ui.windowMainButtonsOthersEnable()
            ui.windowMainApplicationStateSet()
        })
}

/**
* @function openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
* @memberof renderer
*/
function openReleasesOverview () {
    const { urlGitHubReleases } = require('./js/modules/githubUrls.js')
    utils.writeConsoleMsg('info', 'openReleasesOverview ::: Opening _' + urlGitHubReleases + '_ to show available releases.')
    utils.openURL(urlGitHubReleases)
}

/**
* @function settingsShowYoutubeDLInfo
* @summary Searches the youtube-binary and shows it in the settings UI
* @description Searches the youtube-binary and shows it in the settings UI
* @memberof renderer
*/
function settingsShowYoutubeDLInfo () {
    const youtubedl = require('youtube-dl')

    settingsGetYoutubeDLBinaryVersion(function () {
        utils.writeConsoleMsg('info', 'settingsShowYoutubeDLInfo ::: Searching youtube-dl ...')
        var youtubeDl = youtubedl.getYtdlBinary()
        if (youtubeDl === '') {
            utils.writeConsoleMsg('error', 'settingsShowYoutubeDLInfo ::: Unable to find youtube-dl')
            utils.showNoty('error', 'Unable to find dependency <b>youtube-dl</b>.', 0)
        } else {
            utils.writeConsoleMsg('info', 'settingsShowYoutubeDLInfo ::: Found youtube-dl in: _' + youtubeDl + '_.')
            $('#userSettingsYouTubeDLPathInfo').val(youtubeDl) // show in UI
            $('#headerYoutubeDL').html('<i class="fab fa-youtube"></i> youtube-dl <small>Version: ' + ytdlBinaryVersion + '</small>')
        }
    })
}

/**
* @function settingsShowFfmpegInfo
* @summary Searches the ffmpeg-binary and shows it in the settings UI
* @description Searches the ffmpeg-binary and shows it in the settings UI
* @memberof renderer
*/
function settingsShowFfmpegInfo () {
    var ffmpeg = require('ffmpeg-static-electron')
    utils.writeConsoleMsg('info', 'settingsShowFfmpegInfo ::: Searching ffmpeg ...')
    if (ffmpeg === '') {
        utils.writeConsoleMsg('error', 'settingsShowFfmpegInfo ::: Unable to find ffmpeg')
        utils.showNoty('error', 'Unable to find dependency <b>ffmpeg</b>.', 0)
    } else {
        utils.writeConsoleMsg('info', 'settingsShowFfmpegInfo ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
        $('#userSettingsFfmpegPathInfo').val(ffmpeg.path) // show in UI
    }
}

/**
* @function settingsToggleVerboseMode
* @summary Enables or disabled the verbose mode
* @description Sentry is used for log output. It is disabled by default. Enables or disabled the verbode mode
* @memberof renderer
*/
function settingsToggleVerboseMode () {
    if ($('#checkboxEnableVerbose').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleVerboseMode ::: Verbose Mode is now enabled')
        userSettingWrite('enableVerboseMode', true)
    } else {
        utils.writeConsoleMsg('info', 'settingsToggleVerboseMode ::: Verbose Mode is now disabled')
        userSettingWrite('enableVerboseMode', false)
    }
}

/**
* @function settingsToggleErrorReporting
* @summary Enables or disabled the error reporting function
* @description Sentry is used for error reporting. It is enabled by default. Enables or disabled the error reporting function
* @memberof renderer
*/
function settingsToggleErrorReporting () {
    if ($('#checkboxEnableErrorReporting').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleErrorReporting ::: Error reporting is now enabled')
        userSettingWrite('enableErrorReporting', true)
        sentry.enableSentry()
    } else {
        // ask if user really wants to disable error-reporting (using a confirm dialog)
        const Noty = require('noty')
        var n = new Noty(
            {
                theme: 'bootstrap-v4',
                layout: 'bottom',
                type: 'info',
                closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                text: '<b>Do you really want to disable error-reporting?</b><br><br>* We don\'t track users<br>* We don\'t store any IP addresses<br>* We only collect error reports<br><br>This helps us finding and fixing bugs in media-dupes',
                buttons: [
                    Noty.button('Yes', 'btn btn-success mediaDupes_btnDownloadActionWidth', function () {
                        n.close()
                        utils.writeConsoleMsg('warn', 'settingsToggleErrorReporting ::: Error reporting is now disabled')
                        userSettingWrite('enableErrorReporting', false)
                        sentry.disableSentry()
                        // myUndefinedFunctionFromRendererAfterDisable()
                    },
                    {
                        id: 'button1', 'data-status': 'ok'
                    }),

                    Noty.button('No', 'btn btn-secondary mediaDupes_btnDownloadActionWidth float-right', function () {
                        n.close()
                        $('#checkboxEnableErrorReporting').prop('checked', true) // revert state of checkbox
                        utils.showNoty('success', '<b>Thanks</b> for supporting media-dupes development with your error reports.')
                        utils.writeConsoleMsg('warn', 'settingsToggleErrorReporting ::: User cancelled disabling of error-reporting')
                    })
                ]
            })

        n.show() // show the noty dialog
    }
}

/**
* @function canWriteFileOrFolder
* @summary Checks if a file or folder is writeable
* @description Checks if a file or folder is writeable
* @memberof renderer
* @param {String} path - Path which should be checked
*/
function canWriteFileOrFolder (path, callback) {
    const fs = require('fs')
    fs.access(path, fs.W_OK, function (err) {
        callback(null, !err)
    })
}

/**
* @function searchYoutubeDLUpdate
* @summary Checks if there is a new release  for the youtube-dl binary available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @memberof renderer
* @param {boolean} [silent] - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchYoutubeDLUpdate (silent = true) {
    ui.windowMainLoadingAnimationShow()
    ui.windowMainApplicationStateSet('Searching updates for youtube-dl binary')

    // check if we could update in general = is details file writeable?
    // if not - we can cancel right away
    var youtubeDlBinaryDetailsPath = youtube.youtubeDlBinaryDetailsPathGet()
    canWriteFileOrFolder(youtubeDlBinaryDetailsPath, function (error, isWritable) {
        if (error) {
            utils.writeConsoleMsg('error', 'searchYoutubeDLUpdate ::: Error while trying to read the youtube-dl details file. Error: ' + error)
            throw error
        }

        if (isWritable === true) {
            // technically we could execute an update if there is one.
            // so lets search for updates
            // check if there is an update
            utils.writeConsoleMsg('info', 'searchYoutubeDLUpdate ::: Updating youtube-dl binary is technically possible - so start searching for avaulable updates.')
            var isYoutubeBinaryUpdateAvailable = youtube.youtubeDlBinaryUpdateSearch(silent)
        } else {
            // details file cant be resetted due to permission issues
            utils.writeConsoleMsg('warn', 'searchYoutubeDLUpdate ::: Updating youtube-dl binary is not possible on this setup due to permission issues.')
        }
    })
}

/**
* @function settingsGetYoutubeDLBinaryVersion
* @summary Gets the youtube-dl binary version and displays it in settings ui
* @description Reads the youtube-dl binary version from 'node_modules/youtube-dl/bin/details'
* @memberof renderer
* @return ytdlBinaryVersion - The youtube-dl binary version string
*/
function settingsGetYoutubeDLBinaryVersion (_callback) {
    const fs = require('fs')

    var youtubeDlBinaryDetailsPath = youtube.youtubeDlBinaryDetailsPathGet() // get path to youtube-dl binary details
    fs.readFile(youtubeDlBinaryDetailsPath, 'utf8', function (error, contents) {
        if (error) {
            utils.writeConsoleMsg('error', 'settingsGetYoutubeDLBinaryVersion ::: Unable to detect youtube-dl binary version. Error: ' + error + '.')
            utils.showNoty('error', 'Unable to detect local youtube-dl binary version number. Error: ' + error, 0) // see sentry issue: MEDIA-DUPES-5A
            throw error
        } else {
            const data = JSON.parse(contents)
            ytdlBinaryVersion = data.version // extract and store the version number
            utils.writeConsoleMsg('info', 'settingsGetYoutubeDLBinaryVersion ::: youtube-dl binary is version: _' + ytdlBinaryVersion + '_.')
            _callback()
        }
    })
}

/**
* @function settingsOpenExternal
* @summary Gets an url from the settings ui and forwards this to the openURL function
* @description Gets an url from the settings ui and forwards this to the openURL function
* @memberof renderer
* @param {string} url - the actual url
*/
function settingsOpenExternal (url) {
    utils.openURL(url)
}

/**
* @function disclaimerCheck
* @summary Checks if the disclaimer should be shown or not
* @description Is using userSettingRead() to read the user setting confirmedDisclaimer.json. If it exists the user previously confirmed it.
* @memberof renderer
*/
function disclaimerCheck () {
    utils.writeConsoleMsg('info', 'disclaimerCheck ::: check if the disclaimer must be shown.')
    userSettingRead('confirmedDisclaimer')
}

/**
* @function disclaimerShow
* @summary Opens the disclaimer as dialog
* @description Displays a disclaimer regarding app usage. User should confirm it once. Setting is saved in UserSettings
* @memberof renderer
*/
function disclaimerShow () {
    const dialog = require('electron').remote.dialog

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
        utils.writeConsoleMsg('info', 'disclaimerShow ::: User confirmed the disclaimer.')
        userSettingWrite('confirmedDisclaimer', true)
    }
}

// ----------------------------------------------------------------------------
// IPC
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// IPC - on ready-to-show
// ----------------------------------------------------------------------------

/**
* @name startSearchUpdatesSilent
* @summary Triggers the check for media-dupes updates in silent mode
* @description Called via ipc from main.js on-ready to start the search for media-dupes updates
* @memberof renderer
*/
require('electron').ipcRenderer.on('startSearchUpdatesSilent', function () {
    searchUpdate(true) // If silent = false -> Forces result feedback, even if no update is available
})

/**
* @name youtubeDlSearchUpdatesSilent
* @summary Triggers the check for youtube-dl updates in silent mode
* @description Called via ipc from main.js on-ready to check the search for youtube-dl updates
* @memberof renderer
*/
require('electron').ipcRenderer.on('youtubeDlSearchUpdatesSilent', function () {
    searchYoutubeDLUpdate(true) // If silent = false -> Forces result feedback, even if no update is available
})

/**
* @name startCheckingDependencies
* @summary Triggers the check for the application dependencies
* @description Called via ipc from main.js on-ready to check the application dependencies
* @memberof renderer
*/
require('electron').ipcRenderer.on('startCheckingDependencies', function () {
    checkApplicationDependencies()
})

/**
* @name startDisclaimerCheck
* @summary Triggers the check for disclaimer need
* @description Called via ipc from main.js on-ready to check for the disclaimer need
* @memberof renderer
*/
require('electron').ipcRenderer.on('startDisclaimerCheck', function () {
    disclaimerCheck()
})

/**
* @name todoListCheck
* @summary Triggers the check restoring previosly stored urls
* @description Called via ipc from main.js on-ready-to-show and starts the restore function
* @memberof renderer
*/
require('electron').ipcRenderer.on('todoListCheck', function () {
    utils.writeConsoleMsg('info', 'todoListCheck ::: main.js forces renderer to check for urls to restore')
    ui.windowMainToDoListRestore()
})

// ----------------------------------------------------------------------------
// IPC - by menu
// ----------------------------------------------------------------------------

/**
* @name startSearchUpdatesVerbose
* @summary Start searching for updates in non-silent mode
* @description Called via ipc from main.js / menu to search for applicatipn updates
* @memberof renderer
*/
require('electron').ipcRenderer.on('startSearchUpdatesVerbose', function () {
    searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})

/**
* @name openSettings
* @summary Triggers loading the settings UI
* @description Called via ipc from main.js / menu to open the Settings UI
* @memberof renderer
*/
require('electron').ipcRenderer.on('openSettings', function () {
    ui.windowMainSettingsUiLoad()
})

/**
* @name youtubeDlBinaryUpdate
* @summary Triggers updating the youtube-dl binary
* @description Called via ipc from main.js / menu to update the youtube-dl binary
* @memberof renderer
*/
require('electron').ipcRenderer.on('youtubeDlBinaryUpdate', function () {
    youtube.youtubeDlBinaryUpdate()
})

/**
* @name youtubeDlBinaryPathReset
* @summary Triggers resetting the path to the youtube-dl binary back to default
* @description Called via ipc from main.js / menu to reset the path to the youtube-dl binary
* @memberof renderer
*/
require('electron').ipcRenderer.on('youtubeDlBinaryPathReset', function () {
    var youtubeDlBinaryDetailsPath = youtube.youtubeDlBinaryDetailsPathGet() // get path to youtube-dl binary details file

    canWriteFileOrFolder(youtubeDlBinaryDetailsPath, function (error, isWritable) {
        if (error) {
            utils.writeConsoleMsg('error', 'youtubeDlBinaryPathReset ::: Error while trying to check if the youtube-dl details file is writeable or not. Error: ' + error)
            throw error
        }

        if (isWritable === true) {
            utils.writeConsoleMsg('info', 'youtubeDlBinaryPathReset ::: :  Found the youtube-dl details file and it is writeable. Gonna ask the user now if he wants to reset the path now')

            // ask the user if he wants to update using a confirm dialog
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'info',
                    closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                    text: 'Do you really want to reset the youtube-dl binary path back to its default value?',
                    buttons: [
                        Noty.button('Yes', 'btn btn-success mediaDupes_btnDownloadActionWidth', function () {
                            n.close()
                            youtube.youtubeDlBinaryPathReset(youtubeDlBinaryDetailsPath)
                        },
                        {
                            id: 'button1', 'data-status': 'ok'
                        }),

                        Noty.button('No', 'btn btn-secondary mediaDupes_btnDownloadActionWidth float-right', function () {
                            n.close()
                        })
                    ]
                })

            n.show() // show the noty dialog
        } else {
            // details file cant be resetted due to permission issues
            utils.writeConsoleMsg('warn', 'youtubeDlBinaryPathReset ::: Found youtube-dl binary update, but unable to execute update due to permissions')
        }
    })

    utils.writeConsoleMsg('info', 'youtubeDlBinaryPathReset ::: Finished re-setting the binary path for youtube-dl')
})

// ----------------------------------------------------------------------------
// IPC - by power-state
// ----------------------------------------------------------------------------

/**
* @name powerMonitorNotification
* @summary Triggers power specific notifications to the UI
* @description Called via ipc from main.js to trigger a notification about the powerState
* @memberof renderer
*/
require('electron').ipcRenderer.on('powerMonitorNotification', function (event, messageType, messageText, messageDuration) {
    utils.writeConsoleMsg('warn', 'powerMonitorNotification ::: Main wants to show a notification of the type: _' + messageType + '_ and the message: _' + messageText + '_ with the duration: _' + messageDuration + '_.')
    utils.showNoty(messageType, messageText, messageDuration)
})

// ----------------------------------------------------------------------------
// IPC - by settings window closed
// ----------------------------------------------------------------------------

/**
* @name unblurMainUI
* @summary Triggers unbluring the UI
* @description Called via ipc from main.js when the settings UI got closed to trigger unblur'ing the main UI
* @memberof renderer

*/
require('electron').ipcRenderer.on('unblurMainUI', function () {
    ui.windowMainBlurSet(false)
})

// ----------------------------------------------------------------------------
// IPC - by mainwindow close event
// ----------------------------------------------------------------------------

/**
* @name todoListTryToSave
* @summary Triggers saving of the current todoList
* @description Called via ipc from main.js  when the application gets closed Should save existing todoList entries
* @memberof renderer
*/
require('electron').ipcRenderer.on('todoListTryToSave', function () {
    ui.windowMainToDoListSave()
})
