/**
* @file Contains all renderer code
* @author yafp
* @namespace renderer
*/

'use strict'

// ----------------------------------------------------------------------------
// IMPORT MODULES
// ----------------------------------------------------------------------------
require('v8-compile-cache')

// ----------------------------------------------------------------------------
// IMPORT MEDIA-DUPES MODULES
// ----------------------------------------------------------------------------
const utils = require('./js/modules/utils.js')
const ffmpeg = require('./js/modules/ffmpeg.js')
const ui = require('./js/modules/ui.js')
const settings = require('./js/modules/settings.js')
const youtubeDl = require('./js/modules/youtubeDl.js')
const sentry = require('./js/modules/sentry.js')
const crash = require('./js/modules/crashReporter.js') // crashReporter
const unhandled = require('./js/modules/unhandled.js') // electron-unhandled

// ----------------------------------------------------------------------------
// ERROR HANDLING
// ----------------------------------------------------------------------------
// crash.initCrashReporter() // since electron9: crashReporter.start is deprecated in the renderer process. Call it from the main process instead.
unhandled.initUnhandled()

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------

// Settings variables
//
var ytdlBinaryVersion = '0.0.0'
var youtubeDlBinaryDetailsVersion
var youtubeDlBinaryDetailsPath
var youtubeDLBinaryDetailsExec

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
* @description Triggered from the mainWindow. Starts the add url function from the module ui
* @memberof renderer
*/
function windowMainClickButtonAddUrl () {
    ui.windowMainAddUrl()
}

/**
* @function windowMainClickButtonVideo
* @summary Handles the click on the video button
* @description Triggered from the mainWindow. Starts the video download function from the module ui
* @memberof renderer
*/
function windowMainClickButtonVideo () {
    ui.windowMainDownloadContent('video')
    sentry.countEvent('usageButtonVideoExec')
}

/**
* @function windowMainClickButtonVideoV2
* @summary Handles the click on the video button
* @description Triggered from the mainWindow. Starts the video download function from the module ui
* @memberof renderer
*/
function windowMainClickButtonVideoV2 () {
    ui.windowMainDownloadVideo()
}

/**
* @function windowMainClickButtonAudio
* @summary Handles the click on the audio button
* @description Triggered from the mainWindow. Starts the audio download function from the module ui
* @memberof renderer
*/
function windowMainClickButtonAudio () {
    ui.windowMainDownloadContent('audio')
    sentry.countEvent('usageButtonAudioExec')
}

/**
* @function windowMainClickButtonSettings
* @summary Handles the click on the settings button
* @description Triggered from the mainWindow. Starts the settings UI from the module ui
* @memberof renderer
*/
function windowMainClickButtonSettings () {
    ui.windowMainSettingsUiLoad()
}

/**
* @function windowMainClickButtonIntro
* @summary Handles the click on the intro button
* @description Triggered from the mainWindow. Starts the application intro from the module ui
* @memberof renderer
*/
function windowMainClickButtonIntro () {
    ui.windowMainIntroShow()
}

/**
* @function windowMainClickButtonDownloads
* @summary Handles the click on the Downloads button
* @description Triggered from the mainWindow. Starts the open-download-folder function from the module ui
* @memberof renderer
*/
function windowMainClickButtonDownloads () {
    ui.windowMainOpenDownloadFolder()
}

/**
* @function windowMainClickButtonLogReset
* @summary Handles the click on the log-reset button
* @description Triggered from the mainWindow. Starts the reset-log function from the module ui
* @memberof renderer
*/
function windowMainClickButtonLogReset () {
    ui.windowMainLogReset()
}

/**
* @function windowMainClickButtonUIReset
* @summary Handles the click on the reset-UI button
* @description Triggered from the mainWindow. Starts the reset-UI function from the module ui
* @memberof renderer
*/
function windowMainClickButtonUIReset () {
    ui.windowMainResetAskUser()
}

// ----------------------------------------------------------------------------
// FUNCTIONS - SETTINGS WINDOW CLICKS
// ----------------------------------------------------------------------------
/**
* @function windowSettingsClickIconUserSettingsDir
* @summary Handles the click on the settings icon
* @description Triggered from the settingsWindow. Starts the open-settings-folder function from the module settings
* @memberof renderer
*/
function windowSettingsClickIconUserSettingsDir () {
    settings.settingsFolderOpen()
}

/**
* @function windowSettingsClickButtonChooseDownloadDir
* @summary Handles the click on the choose download dir button. Starts the select-download-dir function from the module settings
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickButtonChooseDownloadDir () {
    settings.settingsSelectDownloadDir()
}

/**
* @function windowSettingsClickCheckboxVerboseMode
* @summary Handles the click on the checkbox verbose mode
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickCheckboxVerboseMode () {
    settings.settingsToggleVerboseMode()
}

/**
* @function windowSettingsClickCheckboxAdditionalParameter
* @summary Handles the click on the checkbox vadditional parameter
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickCheckboxAdditionalParameter () {
    settings.settingsToggleAdditionalParameter()
}

/**
* @function windowSettingsClickButtonAdditionalParameterSave
* @summary Handles the click on the button additional parameter save
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickButtonAdditionalParameterSave () {
    settings.settingsSaveAdditionalParameter()
}

/**
* @function windowSettingsClickCheckboxUpdatePolicy
* @summary Handles the click on the checkbox verbose mode
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickCheckboxUpdatePolicy () {
    settings.settingsTogglePrereleases()
}

/**
* @function windowSettingsClickIconBug
* @summary Handles the click on the bug icon
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickIconBug () {
    settings.settingsOpenDevTools()
}

/**
* @function windowSettingsClickCheckboxErrorReporting
* @summary Handles the click on the checkbox error reporting
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickCheckboxErrorReporting () {
    settings.settingsToggleErrorReporting()
}

/**
* @function windowSettingsClickCheckboxErrorReportingMoreInfo
* @summary Handles the click on the question icon in the error reporting section
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickCheckboxErrorReportingMoreInfo () {
    const { urlGithubSentryUsage } = require('./js/modules/urls.js') // get url
    utils.openURL(urlGithubSentryUsage)
}

/**
* @function windowSettingsClickDropdownAudioFormats
* @summary Handles the click on the dropdown audio formats
* @description Triggered from the settingsWindow.
* @memberof renderer
*/
function windowSettingsClickDropdownAudioFormats () {
    settings.settingsAudioFormatSave()
}

/**
* @function windowSettingsClickOpenUrl
* @summary Handles the click on the dropdown audio formats
* @description Triggered from the settingsWindow.
* @param {string} url - the url
* @memberof renderer
*/
function windowSettingsClickOpenUrl (url) {
    settings.settingsOpenExternal(url)
}

/**
* @function windowSettingsClickYoutubeDlUpdate
* @summary Starts the check for youtube-dl updates routine with feedback to the user
* @description Starts the check for youtube-dl updates routine with feedback to the user
* @memberof renderer
*/
function windowSettingsClickYoutubeDlUpdate () {
    youtubeDl.binaryUpdateCheck(false, false) // If silent = false -> Forces result feedback, even if no update is available
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
    // new customTitlebar.Titlebar({
        titleHorizontalAlignment: 'center', // position of window title
        icon: 'img/icon/icon.png',
        drag: true, // whether or not you can drag the window by holding the click on the title bar.
        backgroundColor: customTitlebar.Color.fromHex('#343a40'),
        minimizable: true,
        maximizable: true,
        closeable: true,
        unfocusEffect: false, // added in 0.9.0
        itemBackgroundColor: customTitlebar.Color.fromHex('#ffe5e5') // menu item -> hover color
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
    var youtubeDlBinaryPath = youtubeDl.binaryPathGet()
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
* @function settingsLoadAllOnAppStart
* @summary Reads all user-setting-files and fills some global variables
* @description Reads all user-setting-files and fills some global variables
* @memberof renderer
*/
function settingsLoadAllOnAppStart () {
    utils.writeConsoleMsg('info', 'settingsLoadAllOnAppStart ::: Gonna read several user config files now ...')
    utils.userSettingRead('enableVerboseMode') // verbose mode
    utils.userSettingRead('enableUrlInformations') // url informations
    utils.userSettingRead('enableAdditionalParameter') // additional parameter
    utils.userSettingRead('additionalYoutubeDlParameter') // additional parameter
    utils.userSettingRead('enablePrereleases') // pre-releases
    utils.userSettingRead('enableErrorReporting') // get setting for error-reporting
    utils.userSettingRead('downloadDir') // download dir
    utils.userSettingRead('audioFormat') // get setting for configured audio format
}

/**
* @function settingsLoadAllOnSettingsUiLoad
* @summary Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @description Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @memberof renderer
*/
function settingsLoadAllOnSettingsUiLoad () {
    utils.writeConsoleMsg('info', 'settingsLoadAllOnAppStart ::: Gonna read several user config files now and adjust the settings UI')
    utils.userSettingRead('enableVerboseMode', true) // verbose mode
    utils.userSettingRead('enableUrlInformations', true) // url informations
    utils.userSettingRead('enableAdditionalParameter', true) // enable or not: additional parameter
    utils.userSettingRead('additionalYoutubeDlParameter', true) // the actual additional youtube-dl parameter
    utils.userSettingRead('enablePrereleases', true) // pre-releases
    utils.userSettingRead('enableErrorReporting', true) // get setting for error-reporting
    utils.userSettingRead('downloadDir', true) // download dir
    utils.userSettingRead('audioFormat', true) // load configured audio format and update the settings UI

    settings.settingsEnableOrDisableYoutubeDLUpdateButton()
}

/**
* @function urlInputFieldOnKeyUp
* @summary On Key up event, checks if the field is empty or not
* @description On Key up event, checks if the field is empty or not
* @memberof renderer
*/
function urlInputFieldOnKeyUp () {
    var currentContentOfUrlInputField = $('#inputNewUrl').val() // get current content of field
    if (currentContentOfUrlInputField === '') {
        utils.writeConsoleMsg('info', 'urlInputFieldOnKeyUp ::: Is now empty, gonna reset the background color')
        ui.inputUrlFieldSetState() // empty = white
    } else {
        ui.inputUrlFieldSetState('unchecked') // unchecked = light red

        var isUrlValid = utils.validURL(currentContentOfUrlInputField)
        if (isUrlValid) {
            utils.writeConsoleMsg('info', 'urlInputFieldOnKeyUp ::: User input is a valid URL (' + currentContentOfUrlInputField + ').')
            ui.inputUrlFieldSetState('valid') // valid = green
        } else {
            // utils.writeConsoleMsg('info', 'urlInputFieldOnKeyUp ::: User input is not a valid URL (' + currentContentOfUrlInputField + ').')
        }
    }
}

/**
* @function urlInputFieldOnKeyPress
* @summary Executed on keypress inside url-input-field
* @description Checks if the key-press was the ENTER-key - if so simulates a press of the button ADD URL
* @memberof renderer
* @event keyCode - The key press event
*/
function urlInputFieldOnKeyPress (event) {
    var code = 0
    code = event.keyCode
    if (code === 13) {
        windowMainClickButtonAddUrl() // simulare click on ADD URL buttom
    }
}

/**
* @function urlInputFieldOnFocus
* @summary Handles auto-pasting urls to url input field
* @description Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
* @memberof renderer
*/
function urlInputFieldOnFocus () {
    utils.writeConsoleMsg('info', 'urlInputFieldOnFocus ::: url input field got focus')

    var currentContentOfUrlInputField = $('#inputNewUrl').val() // get current content of field

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        const { clipboard } = require('electron')
        var currentClipboardContent = clipboard.readText() // get content of clipboard
        currentClipboardContent = currentClipboardContent.trim() // remove leading and trailing blanks

        var isUrlValid = utils.validURL(currentClipboardContent)
        if (isUrlValid) {
            utils.writeConsoleMsg('info', 'urlInputFieldOnFocus ::: Clipboard contains a valid URL: _' + currentClipboardContent + '_.')
            $('#inputNewUrl').val(currentClipboardContent) // paste it
            $('#inputNewUrl').select() // select it entirely
            ui.inputUrlFieldSetState('valid') // valid = green
        } else {
            utils.writeConsoleMsg('warn', 'urlInputFieldOnFocus ::: Clipboard contains a non valid URL: _' + currentClipboardContent + '_.')
        }
    } else {
        // input field is not empty
        // doing nothing at this point
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
    var semver = require('semver')

    ui.windowMainApplicationStateSet('Searching media-dupes updates')

    // check if pre-releases should be included or not
    var curEnablePrereleasesSetting = utils.globalObjectGet('enablePrereleases')

    // get url for github releases / api
    const { urlGithubApiReleases } = require('./js/modules/urls.js') // get API url

    var remoteAppVersionLatest = '0.0.0'
    var remoteAppVersionLatestPrerelease = false
    var localAppVersion = '0.0.0'
    var versions

    // get local version
    //
    localAppVersion = require('electron').remote.app.getVersion()

    // var updateStatus = $.get(urlGithubApiReleases, function (data, status) {
    $.get(urlGithubApiReleases, function (data, status) {
        // 3000 // in milliseconds

        utils.writeConsoleMsg('info', 'searchUpdate ::: Accessing _' + urlGithubApiReleases + '_ ended with: _' + status + '_')

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.tag_name, v1.tag_name);
            // console.error(v1.tag_name)
            // console.error(v2.tag_name)
        })

        if (curEnablePrereleasesSetting === true) {
            // user wants the latest release - ignoring if it is a prerelease or an official one
            utils.writeConsoleMsg('info', 'searchUpdate ::: Including pre-releases in update search')
            remoteAppVersionLatest = versions[0].tag_name // Example: 0.4.2
            remoteAppVersionLatestPrerelease = versions[0].prerelease // boolean
        } else {
            // user wants official releases only
            utils.writeConsoleMsg('info', 'searchUpdate ::: Ignoring pre-releases in update search')
            // find the latest non pre-release build
            // loop over the versions array to find the latest non-pre-release
            // var latestOfficialRelease
            for (var i = 0; i < versions.length; i++) {
                if (versions[i].prerelease === false) {
                    // latestOfficialRelease = i
                    break
                }
            }

            remoteAppVersionLatest = versions[i].tag_name // Example: 0.4.2
            remoteAppVersionLatestPrerelease = versions[i].prerelease // boolean
        }

        // simulate different  update scenarios:
        //
        // localAppVersion = '0.0.1'; //  overwrite variable to simulate
        // remoteAppVersionLatest = 'v0.6.0' //  overwrite variable to simulate

        // strip the v away
        // - up to 0.5.0 the tag used on github did not start with v.
        // - comapring versions without leading chars is much easier.
        localAppVersion = localAppVersion.replace('v', '')
        remoteAppVersionLatest = remoteAppVersionLatest.replace('v', '')

        utils.writeConsoleMsg('info', 'searchUpdate ::: Local media-dupes version: ' + localAppVersion)
        utils.writeConsoleMsg('info', 'searchUpdate ::: Latest media-dupes version: ' + remoteAppVersionLatest)

        // If a stable (not a prelease) update is available - see #73

        // if (localAppVersion < remoteAppVersionLatest) {
        if (semver.lt(localAppVersion, remoteAppVersionLatest)) {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Found update, notify user')

            // prepare the message for the user - depending on the fact if it is a pre-release or not
            var updateText
            if (remoteAppVersionLatestPrerelease === false) {
                updateText = 'A media-dupes update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?'
            } else {
                updateText = 'A media-dupes <b>pre-release</b> update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?'
            }

            // ask user using a noty confirm dialog
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'info',
                    closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                    text: updateText,
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

                            if (remoteAppVersionLatestPrerelease === false) {
                                utils.showNoty('warning', 'Please be aware that not updating <b>media-dupes</b> will result in an <b>outdated youtube-dl version</b> which again will result in download errors.', 0)
                            }
                        })
                    ]
                })

            // show the noty dialog
            n.show()
        } else {
            utils.writeConsoleMsg('info', 'searchUpdate ::: No newer version of media-dupes found.')

            // when executed manually via menu -> user should see result of this search
            if (silent === false) {
                utils.showNoty('info', 'No updates for <b>media-dupes (' + localAppVersion + ')</b> available.')
            }
        }

        utils.writeConsoleMsg('info', 'searchUpdate ::: Successfully checked ' + urlGithubApiReleases + ' for available releases')
    })
        .done(function () {
        // utils.writeConsoleMsg('info', 'searchUpdate ::: Successfully checked ' + urlGithubApiReleases + ' for available releases');
        })

        .fail(function () {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Checking ' + urlGithubApiReleases + ' for available releases failed.')
            utils.showNoty('error', 'Checking <b>' + urlGithubApiReleases + '</b> for available media-dupes releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            utils.writeConsoleMsg('info', 'searchUpdate ::: Finished checking ' + urlGithubApiReleases + ' for available releases')
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
    const { urlGitHubReleases } = require('./js/modules/urls.js')
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
            $('#headerYoutubeDL').html('Installation <small>Version: ' + ytdlBinaryVersion + '</small>')
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
    // utils.writeConsoleMsg('info', 'settingsShowFfmpegInfo ::: Searching ffmpeg ...')
    if (ffmpeg === '') {
        utils.writeConsoleMsg('error', 'settingsShowFfmpegInfo ::: Unable to find ffmpeg')
        utils.showNoty('error', 'Unable to find dependency <b>ffmpeg</b>.', 0)
    } else {
        utils.writeConsoleMsg('info', 'settingsShowFfmpegInfo ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
        $('#userSettingsFfmpegPathInfo').val(ffmpeg.path) // show in UI
    }
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

    var youtubeDlBinaryDetailsPath = youtubeDl.binaryDetailsPathGet() // get path to youtube-dl binary details
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
* @function validateUrlBeforeAdd
* @summary Gets the content of the url field, checks if it is a valid url, if so checks if it is reachable or not
* @description Gets the content of the url field, checks if it is a valid url, if so checks if it is reachable or not
* @memberof renderer
*/
function validateUrlBeforeAdd () {
    var currentContentOfUrlInputField = $('#inputNewUrl').val() // get current content of field

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        utils.writeConsoleMsg('info', 'validateUrlBeforeAdd ::: Empty field')
    } else {
        var isUrlValid = utils.validURL(currentContentOfUrlInputField)
        if (isUrlValid) {
            utils.writeConsoleMsg('info', 'validateUrlBeforeAdd ::: URL seems valid URL (' + currentContentOfUrlInputField + ').')
        } else {
            utils.writeConsoleMsg('info', 'urlInputFieldOnFocus ::: Clipboard contains a non valid URL (' + currentContentOfUrlInputField + ').')
        }
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
/*
require('electron').ipcRenderer.on('startSearchUpdatesSilent', function () {
    searchUpdate(true) // If silent = false -> Forces result feedback, even if no update is available
})
*/

/**
* @name youtubeDlSearchUpdatesSilent
* @summary Triggers the check for youtube-dl updates in silent mode
* @description Called via ipc from main.js on-ready to check the search for youtube-dl updates
* @memberof renderer
*/
/*
require('electron').ipcRenderer.on('youtubeDlSearchUpdatesSilent', function () {
    youtubeDl.binaryUpdateCheck(true, false) // If silent = false -> Forces result feedback, even if no update is available
})
*/

/**
* @name initSettings
* @summary Triggers the check for the application dependencies
* @description Called via ipc from main.js on-ready to check the application dependencies
* @memberof renderer
*/
/*
require('electron').ipcRenderer.on('initSettings', function () {
    settingsLoadAllOnAppStart()
})
*/

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
* @name scheduleUpdateCheckMediaDupes
* @summary Starts the silent search for media-dupes updates
* @description Starts the silent search for media-dupes updates after several seconds (to speed up the application startup)
* @memberof renderer
*/
require('electron').ipcRenderer.on('scheduleUpdateCheckMediaDupes', function () {
    setTimeout(
        function () {
            utils.writeConsoleMsg('info', 'scheduleUpdateCheckMediaDupes ::: Starting scheduled search for new media-dupes updates.')
            searchUpdate(true) // silent
        }, 3000) // after 3 seconds
})

/**
* @name scheduleUpdateCheckYoutubeDl
* @summary Starts the silent search for youtube-dl updates
* @description Starts the silent search for youtube-dl updates after several seconds (to speed up the application startup)
* @memberof renderer
*/
require('electron').ipcRenderer.on('scheduleUpdateCheckYoutubeDl', function () {
    setTimeout(
        function () {
            utils.writeConsoleMsg('info', 'scheduleUpdateCheckYoutubeDl ::: Starting scheduled search for new youtube-dl updates.')
            youtubeDl.binaryUpdateCheck(true, false) // If silent = false -> Forces result feedback, even if no update is available
        }, 3000) // after 3 seconds
})

/**
* @name startDisclaimerCheck
* @summary Triggers the check for disclaimer need
* @description Called via ipc from main.js on-ready to check for the disclaimer need
* @memberof renderer
*/
require('electron').ipcRenderer.on('startDisclaimerCheck', function () {
    utils.disclaimerCheck()
})

/**
* @name todoListCheck
* @summary Triggers the check restoring previosly stored urls
* @description Called via ipc from main.js on-ready-to-show and starts the restore function
* @memberof renderer
*/
require('electron').ipcRenderer.on('todoListCheck', function () {
    // utils.writeConsoleMsg('info', 'todoListCheck ::: main.js forces renderer to check for urls to restore')
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
* @name openYoutubeSuggestDialog
* @summary Triggers a input dialog to search for youtube suggest based on an input string
* @description Called via ipc from main.js / menu to ....
* @memberof renderer
*/
require('electron').ipcRenderer.on('openYoutubeSuggestDialog', function () {
    ui.youtubeSuggest()
})

/**
* @name youtubeDlBinaryUpdate
* @summary Triggers updating the youtube-dl binary
* @description Called via ipc from main.js / menu to update the youtube-dl binary
* @memberof renderer
*/
require('electron').ipcRenderer.on('youtubeDlBinaryUpdate', function () {
    youtubeDl.binaryUpdateCheck(false, true) // silent = false && force = true
})

/**
* @name youtubeDlBinaryPathReset
* @summary Triggers resetting the path to the youtube-dl binary back to default
* @description Called via ipc from main.js / menu to reset the path to the youtube-dl binary
* @memberof renderer
*/
require('electron').ipcRenderer.on('youtubeDlBinaryPathReset', function () {
    var youtubeDlBinaryDetailsPath = youtubeDl.binaryDetailsPathGet() // get path to youtube-dl binary details file

    utils.canWriteFileOrFolder(youtubeDlBinaryDetailsPath, function (error, isWritable) {
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
                            youtubeDl.binaryPathReset(youtubeDlBinaryDetailsPath)
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
            utils.showNoty('error', 'Unable to reset the <b>youtube-dl</b> setup due to permissions issues. The file: ' + youtubeDlBinaryDetailsPath + ' is not writeable.')
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

/**
* @name blurMainUI
* @summary Triggers bluring the UI
* @description Called via ipc from main.js when the main window is ready-to-show
* @memberof renderer
*/
require('electron').ipcRenderer.on('blurMainUI', function () {
    ui.windowMainBlurSet(true)
})

/**
* @name countAppStarts
* @summary ..
* @description Called via ipc from main.js when the main window is ready-to-show
* @memberof renderer
*/
require('electron').ipcRenderer.on('countAppStarts', function () {
    sentry.countEvent('usageApplicationStarted')
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
