/**
 * @file Contains all renderer code
 * @author yafp
 */

'use strict'

// ----------------------------------------------------------------------------
// IMPORT
// ----------------------------------------------------------------------------
const utils = require('./js/modules/utils.js')
const youtube = require('./js/modules/youtubeDl.js')
const ffmpeg = require('./js/modules/ffmpeg.js')

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
var settingAudioFormat = 'mp3' // default is set to mp3
var settingCustomDownloadDir = '' // default
var settingEnableErrorReporting = true
var ytdlBinaryVersion = '0.0.0'

var youtubeDlBinaryDetailsVersion
var youtubeDlBinaryDetailsPath
var youtubeDLBinaryDetailsExec

/**
* @name titlebarInit
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
*/
function titlebarInit () {
    // NOTE:
    // there exists:
    // - 'custom-electron-titlebar'
    // - 'pj-custom-electron-titlebar' (fork)
    //
    const customTitlebar = require('custom-electron-titlebar')
    // const customTitlebar = require('pj-custom-electron-titlebar')

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
* @name disclaimerCheck
* @summary Checks if the disclaimer should be shown or not
* @description Is using readLocalUserSetting() to read the user setting confirmedDisclaimer.json. If it exists the user previously confirmed it.
*/
function disclaimerCheck () {
    utils.writeConsoleMsg('info', 'disclaimerCheck ::: check if the disclaimer must be shown.')
    readLocalUserSetting('confirmedDisclaimer')
}

/**
* @name disclaimerShow
* @summary Opens the disclaimer as dialog
* @description Displays a disclaimer regarding app usage. User should confirm it once. Setting is saved in UserSettings
*/
function disclaimerShow () {
    var dialog = require('dialog')

    var disclaimerTitle = 'media-dupes disclaimer'
    var disclaimerText = 'THIS SOFTWARE IS PROVIDED BY THE DEVELOPERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\nPlease confirm this by pressing the OK button.'

    // show dialog
    dialog.warn(disclaimerText, disclaimerTitle, function (exitCode) {
        if (exitCode === 1) {
            utils.writeConsoleMsg('warn', 'disclaimerShow ::: User did not confirm the disclaimer. Lets loop ...')
            disclaimerCheck()
        } else {
            utils.writeConsoleMsg('info', 'disclaimerShow ::: User confirmed the disclaimer.')
            writeLocalUserSetting('confirmedDisclaimer', true)
        }
    })
}

/**
* @name applicationStateSet
* @summary Writes console output for the renderer process
* @description Writes console output for the renderer process
* @param type - String which defines the log type
*/
function applicationStateSet (newState) {
    utils.writeConsoleMsg('info', 'applicationStateSet ::: Setting application state to: _' + newState + '_.')
    if (newState === '') {
        newState = '&nbsp;'
        uiLoadingAnimationHide()
    } else {
        uiLoadingAnimationShow()
    }
    $('#applicationState').html(newState) // update the main ui
}

/**
* @name showDialog
* @summary Shows a dialog
* @description Displays a dialog
* @param dialogType - Can be "none", "info", "error", "question" or "warning"
* @param dialogTitle - The title text
* @param dialogMessage - The message of the dialog
* @param dialogDetail - The detail text
*/
function showDialog (dialogType, dialogTitle, dialogMessage, dialogDetail) {
    // Documentatiion: https://electronjs.org/docs/api/dialog
    const { dialog } = require('electron').remote

    const options = {
        type: dialogType,
        buttons: ['OK'],
        defaultId: 2,
        title: dialogTitle,
        message: dialogMessage,
        detail: dialogDetail
    }

    dialog.showMessageBox(null, options, (response, checkboxChecked) => {
        // utils.writeConsoleMsg('info', response);
    })
}

/**
* @name uiLoadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner
*/
function uiLoadingAnimationShow () {
    utils.writeConsoleMsg('info', 'uiLoadingAnimationShow ::: Showing spinner')
    $('#md_spinner').attr('hidden', false)
}

/**
* @name uiLoadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner
*/
function uiLoadingAnimationHide () {
    utils.writeConsoleMsg('info', 'uiLoadingAnimationHide ::: Hiding spinner')
    $('#md_spinner').attr('hidden', true)
}

/**
* @name logScrollToEnd
* @summary Scrolls the UI log to the end / latest entry
* @description Scrolls the UI log to the end / latest entry
*/
function logScrollToEnd () {
    $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight) // scroll log textarea to the end
}

/**
* @name logReset
* @summary Resets the content of the ui log
* @description Resets the content of the ui log
*/
function logReset () {
    document.getElementById('textareaLogOutput').value = ''
    utils.writeConsoleMsg('info', 'logReset ::: Did reset the log-textarea')
}

/**
* @name logAppend
* @summary Appends text to the log textarea
* @description Appends text to the log textarea
*/
function logAppend (newLine) {
    $('#textareaLogOutput').val(function (i, text) {
        return text + newLine + '\n'
    })
    logScrollToEnd() // scroll log textarea to the end
}

/**
* @name checkApplicationDependencies
* @summary Checks for missing dependencies
* @description Checks on startup for missing dependencies (youtube-dl and ffmpeg). Both are bundles and should be find
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
* @name uiResetAskUser
* @summary Ask the user if he wants to execute the UI reset function
* @description Shows a confirm dialog and asks if the user wants to execute the UI reset function
*/
function uiResetAskUser () {
    // confirm
    const Noty = require('noty')
    var n = new Noty(
        {
            theme: 'bootstrap-v4',
            layout: 'bottom',
            type: 'info',
            closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
            text: 'Do you really want to reset the UI?',
            buttons: [
                Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                    n.close()
                    uiReset()
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
}

/**
* @name uiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function uiReset () {
    // TODO:
    // check if there are downloads in progress
    // if so - should show yet another confirm dialog

    utils.writeConsoleMsg('info', 'uiReset ::: Starting to reset the UI')
    $('#inputNewUrl').val('') // empty the URL input field
    uiStartButtonsDisable() // disable start button
    uiOtherButtonsEnable() // ensure some buttons are enabled
    toDoListReset() // empty todo-list textarea
    logReset() // empty log textarea
    applicationStateSet('') // reset application state
    utils.writeConsoleMsg('info', 'uiReset ::: Finished resetting the UI')
}

/**
* @name uiStartButtonsEnable
* @summary Enabled the 2 start buttons
* @description Is executed when the todo-list contains at least 1 item
*/
function uiStartButtonsEnable () {
    // enable start buttons
    $('#buttonStartVideoExec').prop('disabled', false)
    $('#buttonStartVideo').prop('disabled', false)
    $('#buttonStartAudioExec').prop('disabled', false)
    utils.writeConsoleMsg('info', 'uiStartButtonsEnable ::: Did enable both start buttons')
}

/**
* @name uiStartButtonsDisable
* @summary Disables the 2 start buttons
* @description Is executed when a download task is started by the user
*/
function uiStartButtonsDisable () {
    // disable start buttons
    $('#buttonStartVideoExec').prop('disabled', true)
    $('#buttonStartVideo').prop('disabled', true)
    $('#buttonStartAudioExec').prop('disabled', true)
    utils.writeConsoleMsg('info', 'uiStartButtonsDisable ::: Did disable both start buttons')
}

/**
* @name uiOtherButtonsEnable
* @summary Enables some of the footer buttons when a download is finished
* @description Is executed when a download task has ended by the user
*/
function uiOtherButtonsEnable () {
    // enable some buttons
    $('#inputNewUrl').prop('disabled', false) // url input field
    $('#buttonAddUrl').prop('disabled', false) // add url
    $('#buttonShowHelp').prop('disabled', false) // help / intro
    $('#buttonShowExtractors').prop('disabled', false) // showExtractors
    utils.writeConsoleMsg('info', 'uiOtherButtonsEnable ::: Did enable some other UI elements')
}

/**
* @name uiOtherButtonsDisable
* @summary Disables some of the footer buttons while a download is running
* @description Is executed when a download task is started by the user
*/
function uiOtherButtonsDisable () {
    // disable some buttons
    $('#inputNewUrl').prop('disabled', true) // url input field
    $('#buttonAddUrl').prop('disabled', true) // add url
    $('#buttonShowHelp').prop('disabled', true) // help / intro
    $('#buttonShowExtractors').prop('disabled', true) // showExtractors
    utils.writeConsoleMsg('info', 'uiOtherButtonsDisable ::: Did disable some other UI elements')
}

/**
* @name uiMakeUrgent
* @summary Tells the main process to mark the application as urgent (blinking in task manager)
* @description Is used to inform the user about an important state-change (all downloads finished). Triggers code in main.js which does the actual work
*/
function uiMakeUrgent () {
    // make window urgent after having finished downloading. See #7
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('makeWindowUrgent')
}

/**
* @name settingsSelectCustomTargetDir
* @summary Let the user choose a custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsSelectCustomTargetDir () {
    const options = { properties: ['openDirectory'] }
    const { dialog } = require('electron').remote

    utils.writeConsoleMsg('info', 'settingsSelectCustomTargetDir ::: User wants to set a custom download directory. Now opening dialog to select a new download target')
    dialog.showOpenDialog(options).then(res => {
        utils.writeConsoleMsg('warn', '_' + res.filePaths + '_')

        if (res.filePaths.length === 0) {
            utils.writeConsoleMsg('warn', 'settingsSelectCustomTargetDir ::: User aborted selecting a custom download directory path in settings')
            utils.showNoty('warning', 'You aborted the definition of a custom download directory')
        } else {
            var newDownloadDirectory = res.filePaths.toString()
            writeLocalUserSetting('CustomDownloadDir', newDownloadDirectory) // save the value to user-config
            $('#inputCustomTargetDir').val(newDownloadDirectory) // show it in the UI
            settingCustomDownloadDir = newDownloadDirectory // store to the global var
            utils.writeConsoleMsg('info', 'settingsSelectCustomTargetDir ::: User selected the following directory: _' + newDownloadDirectory + '_ as download target.')

            const { remote } = require('electron')
            remote.getGlobal('sharedObj').downloadFolder = newDownloadDirectory // update the global object
        }
    })
}

/**
* @name settingsResetCustomTargetDir
* @summary Let the user reset the custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsResetCustomTargetDir () {
    var newValue = ''
    writeLocalUserSetting('CustomDownloadDir', newValue) // save the value
    $('#inputCustomTargetDir').val(newValue) // show it in the UI
    settingCustomDownloadDir = newValue // update global var
    utils.writeConsoleMsg('warn', 'settingsResetCustomTargetDir ::: Resetted the custom download target.')
}

/**
* @name settingsUiLoad
* @summary Navigate to setting.html
* @description Is triggered via button on index.html. Calls method on main.js which loads setting.html to the application window
*/
function settingsUiLoad () {
    // load settings UI
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsUiLoad')
}

/**
* @name settingAudioFormatSave
* @summary Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @description Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
*/
function settingAudioFormatSave () {
    var userSelectedAudioFormat = $('#inputGroupSelectAudio').val() // get value from UI select inputGroupSelectAudio
    utils.writeConsoleMsg('info', 'settingAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')
    writeLocalUserSetting('AudioFormat', userSelectedAudioFormat) // store this value in a json file

    const { remote } = require('electron')
    remote.getGlobal('sharedObj').audioFormat = userSelectedAudioFormat // update the global object
}

/**
* @name settingsLoadAllOnAppStart
* @summary Reads all user-setting-files and fills some global variables
* @description Reads all user-setting-files and fills some global variables
*/
function settingsLoadAllOnAppStart () {
    readLocalUserSetting('CustomDownloadDir') // get setting for Custom download dir
    readLocalUserSetting('AudioFormat') // get setting for configured audio format
    readLocalUserSetting('enableErrorReporting')
}

/**
* @name settingsLoadAllOnSettingsUiLoad
* @summary Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @description Reads all user-setting-files and fills some global variables and adjusts the settings UI
*/
function settingsLoadAllOnSettingsUiLoad () {
    readLocalUserSetting('CustomDownloadDir', true) // Custom download dir
    readLocalUserSetting('AudioFormat', true) // load configured audio format and update the settings UI
    readLocalUserSetting('enableErrorReporting', true)
}

/**
* @name settingsFolderOpen
* @summary Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
* @description Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
*/
function settingsFolderOpen () {
    utils.writeConsoleMsg('info', 'settingsFolderOpen ::: User wants to open its config folder.')
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsFolderOpen')
}

/**
* @name writeLocalUserSetting
* @summary Write to electron-json-storage
* @description Writes a value for a given key to electron-json-storage
* @param key - Name of storage key
* @param value - New value
*/
function writeLocalUserSetting (key, value) {
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
            utils.writeConsoleMsg('error', 'writeLocalUserSetting ::: Unable to write setting with key: _' + key + '_ - and new value: _' + value + '_. Error: ' + error)
            throw error
        }
        utils.writeConsoleMsg('info', 'writeLocalUserSetting ::: key: _' + key + '_ - new value: _' + value + '_')
        utils.showNoty('success', 'Set <b>' + key + '</b> to <b>' + value + '</b>.')
    })
}

/**
* @name defaultDownloadFolderGet
* @summary Validates if the default download directory of the user is useable.
* @description Validates if the default download directory of the user is useable.
* @retun boolean - Is the folder useable
* @return defaultTargetPath - The path to the folder
*/
function defaultDownloadFolderGet () {
    utils.writeConsoleMsg('warn', 'defaultDownloadFolderGet ::: Searching the default download directory for this user ....')

    // use the default download target - which was configured in main.js
    const { remote } = require('electron')
    var defaultTargetPath = remote.getGlobal('sharedObj').downloadFolder

    // check if that directory still exists
    if (isDirectoryAvailable(defaultTargetPath)) {
        utils.writeConsoleMsg('info', 'defaultDownloadFolderGet ::: The default download location _' + defaultTargetPath + '_ exists') // the default download folder exists

        // check if it is writeable
        if (isDirectoryWriteable(defaultTargetPath)) {
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
* @name readLocalUserSetting
* @summary Read from local storage
* @description Reads a value stored in local storage (for a given key)
* @param key - Name of local storage key
* @param optional Boolean used for an ugly hack
*/
function readLocalUserSetting (key, optionalUpdateSettingUI = false) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            utils.writeConsoleMsg('error', 'readLocalUserSetting ::: Unable to read user setting. Error: ' + error)
            throw error
        }
        var value = data.setting
        utils.writeConsoleMsg('info', 'readLocalUserSetting ::: key: _' + key + '_ - got value: _' + value + '_.')

        // Setting: CustomDownloadDir
        //
        if (key === 'CustomDownloadDir') {
            // not yet set - seems like initial run
            if ((value === null) || (value === undefined)) {
                utils.writeConsoleMsg('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_. Initial run - lets set the defaut dir.')
                var detectedDefaultDownloadDir = defaultDownloadFolderGet() // lets set it do the users default folder dir
                if (detectedDefaultDownloadDir[0]) {
                    writeLocalUserSetting('CustomDownloadDir', detectedDefaultDownloadDir[1])
                    utils.writeConsoleMsg('info', 'readLocalUserSetting ::: key: _' + key + '_ - got initial value: _' + detectedDefaultDownloadDir[1] + '_.')
                }
                settingCustomDownloadDir = detectedDefaultDownloadDir[1] // default
            } else {
                // there is a setting
                utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')

                // check if directory exists
                if (isDirectoryAvailable(value)) {
                    // check if directory is writeable
                    if (isDirectoryWriteable(value)) {
                        // dir is available and writeable - seems like everything is ok
                        const { remote } = require('electron')
                        remote.getGlobal('sharedObj').downloadFolder = value // update the global object
                    } else {
                        utils.writeConsoleMsg('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        value = ''

                        const { remote } = require('electron')
                        remote.getGlobal('sharedObj').downloadFolder = '' // update the global object

                        // delete the config
                        storage.remove('CustomDownloadDir', function (error) {
                            if (error) {
                                utils.writeConsoleMsg('error', 'readLocalUserSetting ::: Unable to delete config. Error: ' + error)
                                throw error
                            }
                        })
                    }
                } else {
                    // dir does not exists
                    utils.writeConsoleMsg('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ does not exists. Gonna reset the user-setting.')
                    value = ''

                    const { remote } = require('electron')
                    remote.getGlobal('sharedObj').downloadFolder = '' // update the global object

                    // delete the config
                    storage.remove('CustomDownloadDir', function (error) {
                        if (error) {
                            utils.writeConsoleMsg('error', 'readLocalUserSetting ::: Unable to delete config. Error: ' + error)
                            throw error
                        }
                    })
                }

                // Update UI select
                if (optionalUpdateSettingUI === true) {
                    $('#inputCustomTargetDir').val(value)
                }
            }
            utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Key: ' + key + ' with value: ' + settingCustomDownloadDir)
        }
        // end: CustomDownloadDir

        // Setting: AudioFormat
        //
        if (key === 'AudioFormat') {
            // not configured
            if ((value === null) || (value === undefined)) {
                utils.writeConsoleMsg('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                const { remote } = require('electron')
                remote.getGlobal('sharedObj').audioFormat = 'mp3' // update the global object
                writeLocalUserSetting('AudioFormat', 'mp3') // write the setting
            } else {
                utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
                const { remote } = require('electron')
                remote.getGlobal('sharedObj').audioFormat = value // update the global object

                if (optionalUpdateSettingUI === true) {
                    $('#inputGroupSelectAudio').val(value) // Update UI select
                }
            }
        }
        // end: AudioFormat

        // Setting: enableErrorReporting
        //
        if (key === 'enableErrorReporting') {
            // not configured
            if ((value === null) || (value === undefined)) {
                utils.writeConsoleMsg('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingEnableErrorReporting = true // default
                writeLocalUserSetting('enableErrorReporting', true) // write the setting
                // errorReporting.enableSentry()
                enableSentry()
            } else {
                utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
                settingEnableErrorReporting = value // update global var

                if (settingEnableErrorReporting === true) {
                    enableSentry()
                } else {
                    disableSentry()
                }

                if (optionalUpdateSettingUI === true) {
                    // Update UI select
                    if (settingEnableErrorReporting === true) {
                        $('#checkboxEnableErrorReporting').prop('checked', true)
                    } else {
                        $('#checkboxEnableErrorReporting').prop('checked', false)
                    }
                }
            }
        }
        // end: enableErrorReporting

        // Setting: confirmedDisclaimer
        //
        if (key === 'confirmedDisclaimer') {
            // not configured
            if ((value === null) || (value === undefined)) {
                utils.writeConsoleMsg('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_. Gonna show the disclaimer now')
                disclaimerShow()
            } else {
                utils.writeConsoleMsg('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
            }
        }
        // end: enableErrorReporting
    })
}

/**
* @name checkUrlInputField
* @summary Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
* @description Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
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
* @name onEnter
* @summary Executed on keypress inside url-input-field
* @description Checks if the key-press was the ENTER-key - if so simulates a press of the button ADD URL
* @event keyCode - The key press event
*/
function onEnter (event) {
    var code = 0
    code = event.keyCode
    if (code === 13) {
        addURL() // simulare click on ADD URL buttom
    }
}

/**
* @name addURL
* @summary Handles the url add click of the user
* @description Handles the url add click of the user
*/
function addURL () {
    var newUrl = $('#inputNewUrl').val() // get content of input
    newUrl = newUrl.trim() // trim the url to remove blanks

    if (newUrl !== '') {
        var isUrlValid = utils.validURL(newUrl)
        if (isUrlValid) {
            utils.writeConsoleMsg('info', 'addURL ::: Adding new url: _' + newUrl + '_.')
            arrayUserUrls.push(newUrl) // append to array
            toDoListUpdate() // update todo list
            $('#inputNewUrl').val('') // reset input
        } else {
            // invalid url
            utils.writeConsoleMsg('warn', 'addURL ::: Detected invalid url: _' + newUrl + '_.')
            utils.showNoty('warning', 'Please insert a valid url (reason: unable to dectect a valid url)')
            $('#inputNewUrl').focus() // focus to input field
            $('#inputNewUrl').select() // select it entirely
        }
    } else {
        // empty
        utils.writeConsoleMsg('warn', 'addURL ::: Detected empty url.')
        utils.showNoty('warning', 'Please insert a valid url (reason: was empty)')
        $('#inputNewUrl').focus() // focus to input field
    }
}

/**
* @name toDoListUpdate
* @summary Updates the todo-list after a user added an url
* @description Updates the todo-list after a user added an url
*/
function toDoListUpdate () {
    arrayUserUrls = $.unique(arrayUserUrls) // remove duplicate entries in array

    // write the now unique url array content to textarea
    var textarea = document.getElementById('textareaTodoList')
    textarea.value = arrayUserUrls.join('\n')

    // if array size > 0 -> enable start button
    var arrayLength = arrayUserUrls.length
    if (arrayLength > 0) {
        uiStartButtonsEnable()
    }
    utils.writeConsoleMsg('info', 'toDoListUpdate ::: Updated the todo-list')
}

/**
* @name toDoListReset
* @summary Resets the todo-list textarea
* @description Resets the todo-list textarea
*/
function toDoListReset () {
    arrayUserUrls = [] // reset the array
    arrayUrlsThrowingErrors = [] // reset the array
    document.getElementById('textareaTodoList').value = '' // reset todo-list in UI
    utils.writeConsoleMsg('info', 'toDoListReset ::: Did reset the todolist-textarea')
}

/**
* @name downloadContent
* @summary Does the actual download
* @description Does the actual download
*/
function downloadContent (mode) {
    const { remote } = require('electron') // needed to access the global object

    utils.writeConsoleMsg('info', 'downloadContent ::: Start with mode set to: _' + mode + '_.')

    // some example urls for tests
    //
    // VIDEO:
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA                      // 11 sec       less then 1 MB
    //                  https://www.youtube.com/watch?v=cmiXteWLNw4                     // 1 hour
    // VIMEO:           https://vimeo.com/315670384                                     // 48 sec       bigger 600 MB
    //                  https://vimeo.com/274478457                                     // 6 sec        around 4MB
    //
    // AUDIO:
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // What is the target dir
    var configuredDownloadFolder = remote.getGlobal('sharedObj').downloadFolder
    utils.writeConsoleMsg('info', 'downloadContent ::: Download target directory is set to: _' + configuredDownloadFolder + '_.')

    if (isDirectoryAvailable(configuredDownloadFolder)) {
        // the default download folder exists

        // check if it is writeable
        if (isDirectoryWriteable(configuredDownloadFolder)) {
            // Prepare UI
            uiStartButtonsDisable() // disable the start buttons
            uiOtherButtonsDisable() // disables some other buttons
            applicationStateSet('Download in progress')

            // require some stuff
            const youtubedl = require('youtube-dl')
            const { remote } = require('electron')
            const path = require('path')

            // youtube-dl
            var youtubeDlParameter = ''
            utils.writeConsoleMsg('info', 'downloadContent ::: Using youtube.dl from: _' + youtube.youtubeDlBinaryPathGet() + '_.')

            // ffmpeg
            var ffmpegPath = ffmpeg.ffmpegGetBinaryPath()
            utils.writeConsoleMsg('info', 'downloadContent ::: Detected bundled ffmpeg at: _' + ffmpegPath + '_.')

            var finishedDownloads = 0 // used to count finished downloads

            // Define the youtube-dl parameters depending on the mode (audio vs video)
            switch (mode) {
            case 'audio':

                // get configured audio format
                var settingAudioFormat = remote.getGlobal('sharedObj').audioFormat
                utils.writeConsoleMsg('info', 'downloadContent ::: AudioFormat is set to: _' + settingAudioFormat + '_')

                // generic parameter / flags
                youtubeDlParameter = [
                    // '--verbose',
                    '--format', 'bestaudio',
                    '--extract-audio', // Convert video files to audio-only files (requires ffmpeg or avconv and ffprobe or avprobe)
                    '--audio-format', settingAudioFormat, //  Specify audio format: "best", "aac", "flac", "mp3", "m4a", "opus", "vorbis", or "wav"; "best" by default; No effect without -x
                    '--audio-quality', '0', // Specify ffmpeg/avconv audio quality, insert a value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5)
                    // '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                    '--output', path.join(configuredDownloadFolder, 'Audio', '%(artist)s-%(album)s-%(title)s-%(id)s.%(ext)s'), // output path
                    '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath // ffmpeg location
                ]

                // prepend/add some case-specific parameter / flag
                if (settingAudioFormat === 'mp3') {
                    youtubeDlParameter.unshift('--embed-thumbnail') // prepend
                }
                break

            case 'video':
                youtubeDlParameter = [
                    // '--verbose',
                    '--format', 'best',
                    '--output', path.join(configuredDownloadFolder, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                    '--add-metadata',
                    // '--ignore-errors',
                    '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath // ffmpeg location
                ]
                break

            default:
                utils.writeConsoleMsg('error', 'downloadContent ::: Unspecified mode. This should never happen.')
                utils.showNoty('error', 'Unexpected download mode. Please report this issue', 0)
                return
            }

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadContent(). Please report this', 0)
                return
            }

            arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors

            logAppend('Set download mode to: ' + mode) // Show mode in log

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            var arrayLength = arrayUserUrls.length
            for (var i = 0; i < arrayLength; i++) {
                var url = arrayUserUrls[i] // get url

                url = utils.fullyDecodeURI(url) // decode url - see #25

                // utils.writeConsoleMsg('info', 'downloadContent ::: Processing URL: _' + url + '_ (' + mode + ') with the following parameters: _' + youtubeDlParameter + '_.')
                // logAppend('Processing: ' + url) // append url to log

                // Download
                //
                const newDownload = youtubedl.exec(url, youtubeDlParameter, {}, function (error, output) {
                    if (error) {
                        utils.showNoty('error', 'Downloading <b>' + url + '</b> failed with error: ' + error, 0)
                        utils.writeConsoleMsg('error', 'downloadContent ::: Problems downloading url _' + url + ' with the following parameters: _' + youtubeDlParameter + '_. Error: ' + error)
                        arrayUrlsThrowingErrors.push(url) // remember troublesome url
                        throw error
                    }

                    // finish
                    //
                    finishedDownloads = finishedDownloads + 1
                    // Show processing output for this download task
                    utils.writeConsoleMsg('info', output.join('\n'))
                    logAppend(output.join('\n'))
                    // inform user
                    utils.showNoty('success', 'Finished 1 download')

                    // Final notification
                    // TODO
                    // FIX ME - this detection of no more running downloads does not work
                    if (i === finishedDownloads) {
                        utils.showNotification('media-dupes', 'Finished downloading all urls (' + finishedDownloads + ').')
                        logAppend('\nAll downloads finished (' + finishedDownloads + ').')
                        toDoListReset() // empty the todo list
                        uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                        uiLoadingAnimationHide() // stop download animation / spinner
                        uiOtherButtonsEnable() // enable some of the buttons again
                        applicationStateSet('')
                    }
                })
            }
        }
    }
}

/**
* @name downloadVideo
* @summary Does the actual video download
* @description Does the actual video download (without using youtube-dl.exec)
*/
function downloadVideo () {
    // http://www.youtube.com/watch?v=90AiXO1pAiA
    // https://www.youtube.com/watch?v=sJgDYdA8dio
    // https://vimeo.com/315670384
    // https://vimeo.com/274478457

    // FIXME:
    // This method now seems to work good for youtube urls
    // BUT not for non-youtube urls

    // What is the target dir
    const { remote } = require('electron') // needed to access the global object

    var configuredDownloadFolder = remote.getGlobal('sharedObj').downloadFolder
    utils.writeConsoleMsg('info', 'downloadVideo ::: Download target directory is set to: _' + configuredDownloadFolder + '_.')

    if (isDirectoryAvailable(configuredDownloadFolder)) {
        // the default download folder exists

        if (isDirectoryWriteable(configuredDownloadFolder)) {
            // check if it is writeable

            // Prepare UI
            uiStartButtonsDisable() // disable the start buttons
            uiOtherButtonsDisable() // disables some other buttons
            uiLoadingAnimationShow() // start download animation / spinner

            // require some stuff
            const youtubedl = require('youtube-dl')
            const path = require('path')
            const fs = require('fs')

            // ffmpeg
            var ffmpegPath = ffmpeg.ffmpegGetBinaryPath()
            utils.writeConsoleMsg('info', 'downloadContent ::: Detected bundled ffmpeg at: _' + ffmpegPath + '_.')

            var youtubeDlParameter = ''
            youtubeDlParameter = [
                '--format', 'best',
                '--add-metadata',
                '--ignore-errors',
                '--no-mtime', // added in 0.4.0
                // '--output', path.join(targetPath, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath // ffmpeg location
            ]

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadVideo(). Please report this', 0)
                return
            }

            utils.writeConsoleMsg('info', 'downloadVideo ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')

            // prepare array for urls which are throwing errors
            arrayUrlsThrowingErrors = []

            var finishedDownloads = 0 // to count the amount of finished downloads
            var downloadUrlTargetName = []

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            var arrayLength = arrayUserUrls.length
            logAppend('Queue contains ' + arrayLength + ' urls.')
            logAppend('Starting to download items from queue ... ')
            for (var i = 0; i < arrayLength; i++) {
                var url = arrayUserUrls[i] // get url

                // decode url - see #25
                //
                // url = decodeURI(url);
                url = utils.fullyDecodeURI(url)

                // show url
                utils.writeConsoleMsg('info', 'downloadVideo ::: Processing URL: _' + url + '_.')
                logAppend('Starting to process the url: ' + url + ' ...')

                // show parameters
                utils.writeConsoleMsg('info', 'downloadVideo ::: Using the following parameters: _' + youtubeDlParameter + '_.')

                const video = youtubedl(url, youtubeDlParameter)

                // Variables for progress of each download
                let size = 0
                let pos = 0
                let progress = 0

                // When the download fetches info - start writing to file
                //
                video.on('info', function (info) {
                    downloadUrlTargetName[i] = path.join(configuredDownloadFolder, 'Video', info._filename) // define the final name & path

                    size = info.size // needed to handle the progress later on('data'

                    console.log('filename: ' + info._filename)
                    logAppend('Filename: ' + info._filename)

                    console.log('size: ' + info.size)
                    logAppend('Size: ' + utils.formatBytes(info.size))

                    // start the actual download & write to file
                    var writeStream = fs.createWriteStream(downloadUrlTargetName[i])
                    video.pipe(writeStream)
                })

                // updating progress
                //
                video.on('data', (chunk) => {
                    // console.log('Getting another chunk: _' + chunk.length + '_.')
                    pos += chunk.length
                    if (size) {
                        progress = (pos / size * 100).toFixed(2) // calculate progress
                        console.log('Download-progress is: _' + progress + '_.')
                        logAppend('Download progress: ' + progress + '%')
                    }
                })

                // If download was already completed and there is nothing more to download.
                //
                /*
                video.on('complete', function complete (info) {
                    console.warn('filename: ' + info._filename + ' already downloaded.')
                    logAppend('Filename: ' + info._filename + ' already downloaded.')
                })
                */

                // Download finished
                //
                video.on('end', function () {
                    console.log('Finished downloading 1 url')
                    logAppend('Finished downloading url')

                    finishedDownloads = finishedDownloads + 1

                    // if all downloads finished
                    if (finishedDownloads === arrayLength) {
                        utils.showNotification('media-dupes', 'Finished downloading ' + finishedDownloads + ' url(s). Queue is now empty.')
                        logAppend('Finished downloading ' + finishedDownloads + ' url(s). Queue is now empty.')
                        toDoListReset() // empty the todo list
                        uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                        uiLoadingAnimationHide() // stop download animation / spinner
                        uiOtherButtonsEnable() // enable some of the buttons again
                    }
                })
            }
        }
    }
}

/**
* @name showSupportedExtractors
* @summary Shows a list of all currently supported extractors of youtube-dl
* @description Shows a list of all currently supported extractors of youtube-dl
*/
function showSupportedExtractors () {
    applicationStateSet('Loading extractors list')

    utils.writeConsoleMsg('info', 'showSupportedExtractors ::: Loading list of all supported extractors...')
    logAppend('\nLoading list of supported media-services extractors')

    uiOtherButtonsDisable()

    const youtubedl = require('youtube-dl')
    youtubedl.getExtractors(true, function (error, list) {
        if (error) {
            utils.showNoty('error', 'Unable to get youtube-dl extractor list.', 0)
            utils.writeConsoleMsg('error', 'showSupportedExtractors ::: Unable to get youtube-dl extractors. Error: _' + error + '_.')
            throw error
        }

        utils.writeConsoleMsg('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors')

        // show all extractors in console
        for (let i = 0; i < list.length; i++) {
            // utils.writeConsoleMsg('info', 'showSupportedExtractors ::: ' + list[i])
        }

        // show all extractors in Ui log
        // document.getElementById('textareaLogOutput').value = list.join('\n')
        logAppend(list.join('\n'))

        utils.writeConsoleMsg('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors') // summary in console.
        logAppend('\nFound ' + list.length + ' extractors for media-services')
        uiOtherButtonsEnable()
        applicationStateSet('')
    })

    utils.writeConsoleMsg('info', 'showSupportedExtractors ::: Finished.')
}

/**
* @name searchUpdate
* @summary Checks if there is a new media-dupes release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available. Is executed on app launch NOT on reload.
* @param {booean} [silent=true] - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
    applicationStateSet('Searching media-dupes updates')

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
            uiOtherButtonsEnable()
            applicationStateSet('')
        })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
    const { urlGitHubReleases } = require('./js/modules/githubUrls.js')
    utils.writeConsoleMsg('info', 'openReleasesOverview ::: Opening _' + urlGitHubReleases + '_ to show available releases.')
    utils.openURL(urlGitHubReleases)
}

/**
* @name openUserDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function openUserDownloadFolder () {
    const { remote } = require('electron')
    const { ipcRenderer } = require('electron')

    var configuredDownloadFolder = remote.getGlobal('sharedObj').downloadFolder
    utils.writeConsoleMsg('info', 'openUserDownloadFolder ::: Seems like we should use the following dir: _' + configuredDownloadFolder + '_.')
    ipcRenderer.send('openUserDownloadFolder', configuredDownloadFolder)
}

/**
* @name startIntro
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function startIntro () {
    utils.writeConsoleMsg('info', 'startIntro ::: User wants to see the intro. Here you go!')
    const introJs = require('intro.js')
    introJs().start()
}

/**
* @name isDirectoryAvailable
* @summary Checks if a given directory exists
* @description Checks if a given directory exists
* @param dirPath The directory path which should be checked
* @return boolean
*/
function isDirectoryAvailable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')
        if (fs.existsSync(dirPath)) {
            utils.writeConsoleMsg('info', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ exists')
            return true
        } else {
            utils.writeConsoleMsg('error', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ does not exist')
            return false
        }
    } else {
        utils.writeConsoleMsg('error', 'isDirectoryAvailable ::: Should check if a directory exists but the supplied parameter _' + dirPath + '_ was empty')
    }
}

/**
* @name isDirectoryWriteable
* @summary Checks if a given directory is writeable
* @description Checks if a given directory is writeable
* @param dirPath The directory path which should be checked
* @return boolean
*/
function isDirectoryWriteable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')

        // sync: check if folder is writeable
        try {
            fs.accessSync(dirPath, fs.constants.W_OK)
            utils.writeConsoleMsg('info', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is writeable')
            return true
        } catch (err) {
            utils.writeConsoleMsg('error', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        utils.writeConsoleMsg('error', 'isDirectoryWriteable ::: Should check if a directory is writeable but the supplied parameter _' + dirPath + '_ was empty.')
    }
}

/**
* @name settingsShowYoutubeDLInfo
* @summary Searches the youtube-binary and shows it in the settings dialog
* @description Searches the youtube-binary and shows it in the settings dialog
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
* @name settingsShowFfmpegInfo
* @summary Searches the ffmpeg-binary and shows it in the settings dialog
* @description Searches the ffmpeg-binary and shows it in the settings dialog
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
* @name settingsToggleErrorReporting
* @summary Enables or disabled the error reporting function
* @description Enables or disabled the error reporting function
*/
function settingsToggleErrorReporting () {
    if ($('#checkboxEnableErrorReporting').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleErrorReporting ::: Error reporting is now enabled')
        writeLocalUserSetting('enableErrorReporting', true)
        enableSentry()
        // myUndefinedFunctionFromRendererAfterEnable()
    } else {
        // ask if user really wants to disable error-reporting
        // using a confirm dialog
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
                        writeLocalUserSetting('enableErrorReporting', false)
                        disableSentry()
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
* @name canWriteFileOrFolder
* @summary Checks if a file or folder is writeable
* @description Checks if a file or folder is writeable
* @param path - Path which should be checked
*/
function canWriteFileOrFolder (path, callback) {
    const fs = require('fs')
    fs.access(path, fs.W_OK, function (err) {
        callback(null, !err)
    })
}

/**
* @name searchYoutubeDLUpdate
* @summary Checks if there is a new release  for the youtube-dl binary available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchYoutubeDLUpdate (silent = true) {
    uiLoadingAnimationShow()
    applicationStateSet('Searching updates for youtube-dl binary')

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
* @name settingsGetYoutubeDLBinaryVersion
* @summary Gets the youtube-dl binary version and displays it in settings ui
* @description Reads the youtube-dl binary version from node_modules/youtube-dl/bin/details
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
* @name settingOpenExternal
* @summary Gets an url from the settings ui and forwards this to the openURL function
* @description Gets an url from the settings ui and forwards this to the openURL function
* @param url - url string
*/
function settingOpenExternal (url) {
    utils.openURL(url)
}

// Executed from on-ready
//
//
// Call from main.js ::: on-ready - startSearchUpdates
require('electron').ipcRenderer.on('startSearchUpdatesSilent', function () {
    searchUpdate(true) // If silent = false -> Forces result feedback, even if no update is available
})

// Call from main.js ::: on-ready - youtubeDlSearchUpdatesSilent - verbose
require('electron').ipcRenderer.on('youtubeDlSearchUpdatesSilent', function () {
    searchYoutubeDLUpdate(true) // If silent = false -> Forces result feedback, even if no update is available
})

// Call from main.js ::: on-ready - startCheckingDependencies
require('electron').ipcRenderer.on('startCheckingDependencies', function () {
    checkApplicationDependencies()
})

// Call from main.js ::: on-ready - startDisclaimerCheck
require('electron').ipcRenderer.on('startDisclaimerCheck', function () {
    disclaimerCheck()
})

// Executed from menu
//
//
// Call from main.js ::: from menu - startSearchUpdates - verbose
require('electron').ipcRenderer.on('startSearchUpdatesVerbose', function () {
    searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})

// Call from main.js ::: from menu - openSettings
require('electron').ipcRenderer.on('openSettings', function () {
    settingsUiLoad()
})

// Call from main.js ::: from menu - youtubeDL reset binary path
require('electron').ipcRenderer.on('youtubeDlBinaryUpdate', function () {
    youtube.youtubeDlBinaryUpdate()
})

// Call from main.js ::: youtubeDL reset binary path
require('electron').ipcRenderer.on('youtubeDlBinaryPathReset', function () {
    var youtubeDlBinaryDetailsPath = youtube.youtubeDlBinaryDetailsPathGet()

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
