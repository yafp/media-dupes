/**
 * @file Contains all settings functions
 * @author yafp
 * @module settings
 */
'use strict'

// ----------------------------------------------------------------------------
// REQUIRE MODULES
// ----------------------------------------------------------------------------
//
const utils = require('./utils.js')
const sentry = require('./sentry.js')
const youtubeDl = require('./youtubeDl.js')

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
* @function settingsOpenDevTools
* @summary Tells the main process to open devTools for settings UI
* @description Tells the main process to open devTools for settings UI
*/
function settingsOpenDevTools () {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsToggleDevTools')
}

/**
* @function settingsSelectDownloadDir
* @summary Let the user choose a custom download target directory
* @description Is triggered via button on settings.html.
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
            utils.userSettingWrite('downloadDir', newDownloadDirectory) // save the value to user-config
            $('#inputCustomTargetDir').val(newDownloadDirectory) // show it in the UI
            utils.writeConsoleMsg('info', 'settingsSelectDownloadDir ::: User selected the following directory: _' + newDownloadDirectory + '_ as download target.')

            // FIXME - is this needed?
            // utils.globalObjectSet('downloadDir', newDownloadDirectory)
        }
    })
}

/**
* @function settingsToggleVerboseMode
* @summary Enables or disabled the verbose mode
* @description Sentry is used for log output. It is disabled by default. Enables or disabled the verbode mode
*/
function settingsToggleVerboseMode () {
    if ($('#checkboxEnableVerbose').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleVerboseMode ::: Verbose Mode is now enabled')
        utils.userSettingWrite('enableVerboseMode', true)
        sentry.countEvent('usageSettingsVerboseModeEnabled')
    } else {
        utils.writeConsoleMsg('info', 'settingsToggleVerboseMode ::: Verbose Mode is now disabled')
        utils.userSettingWrite('enableVerboseMode', false)
        sentry.countEvent('usageSettingsVerboseModeDisabled')
    }
}

/**
* @function settingsToggleAdditionalParameter
* @summary Enables or disabled the verbose mode
* @description Sentry is used for log output. It is disabled by default. Enables or disabled the verbode mode
*/
function settingsToggleAdditionalParameter () {
    if ($('#checkboxEnableAdditionalParameter').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleAdditionalParameter ::: Additional parameter is now enabled')
        utils.userSettingWrite('enableAdditionalParameter', true)
        sentry.countEvent('usageSettingsAdditionalParameterEnabled')
    } else {
        utils.writeConsoleMsg('info', 'settingsToggleAdditionalParameter ::: Additional parameter is now disabled')
        utils.userSettingWrite('enableAdditionalParameter', false)
        sentry.countEvent('usageSettingsAdditionalParameterEnabled')
    }
}

/**
* @function settingsSaveAdditionalParameter
* @summary Saves the content of the input field for additional parameters
* @description Saves the content of the input field for additional parameters
*/
function settingsSaveAdditionalParameter () {
    const youtubeDlUnsupportedParameter = youtubeDl.blacklistedParameter // get the blacklisted parameters

    var inputContainsErrors = false // used to remember if an error occured

    var newAdditionalUserParameters = $('#textInputAdditionalParameter').val() // get value from UI
    var splittedParameters = newAdditionalUserParameters.split(' ') // split the input string into single elements
    if (splittedParameters.length > 0) { // If there are elements
        for (var j = 0; j < splittedParameters.length; j++) { // check for each element
            if ($.inArray(splittedParameters[j], youtubeDlUnsupportedParameter) > -1) { // if it is blacklistet
                utils.writeConsoleMsg('warn', 'settingsSaveAdditionalParameter ::: The additional parameter: _' + splittedParameters[j] + '_ is blacklisted.')
                utils.showNoty('error', 'The additional parameter <b>' + splittedParameters[j] + '</b> is blacklisted. Please remove it and try it again.', 0)
                inputContainsErrors = true
            } else { // or not
                utils.writeConsoleMsg('info', 'settingsSaveAdditionalParameter ::: The additional parameter: _' + splittedParameters[j] + '_ is not blacklisted.')
            }
        }
    }

    if (inputContainsErrors === false) {
        utils.writeConsoleMsg('info', 'settingsSaveAdditionalParameter ::: Saving additional parameters - new value is: _' + newAdditionalUserParameters + '_.')
        utils.userSettingWrite('additionalYoutubeDlParameter', newAdditionalUserParameters)
    }
}

/**
* @function settingsTogglePrereleases
* @summary Enables or disables the support for pre-releases
* @description  Enables or disables the setting to include pre-releases into the update -search
*/
function settingsTogglePrereleases () {
    if ($('#checkboxEnablePreReleases').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsTogglePrereleases ::: Update-Search will now include pre-releases')
        utils.userSettingWrite('enablePrereleases', true)
        sentry.countEvent('usageSettingsPrereleasesEnabled')
    } else {
        utils.writeConsoleMsg('info', 'settingsTogglePrereleases ::: Update-Search will ignore pre-releases')
        utils.userSettingWrite('enablePrereleases', false)
        sentry.countEvent('usageSettingsPrereleasesDisabled')
    }
}

/**
* @function settingsToggleUrlInformations
* @summary Enables or disables the fetch-url-informations function
* @description Enables or disables the setting to fetch-url-informations using .getInfo on each added url
*/
function settingsToggleUrlInformations () {
    if ($('#checkboxEnableUrlInformations').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleUrlInformations ::: Url Informations are now enabled')
        utils.userSettingWrite('enableUrlInformations', true)
        sentry.countEvent('usageSettingsUrlInformationsEnabled')
    } else {
        utils.writeConsoleMsg('info', 'settingsToggleUrlInformations ::: Url Informations are now disabled')
        utils.userSettingWrite('enableUrlInformations', false)
        sentry.countEvent('usageSettingsUrlInformationsDisabled')
    }
}

/**
* @function settingsToggleErrorReporting
* @summary Enables or disabled the error reporting function
* @description Sentry is used for error reporting. It is enabled by default. Enables or disabled the error reporting function
*/
function settingsToggleErrorReporting () {
    if ($('#checkboxEnableErrorReporting').is(':checked')) {
        utils.writeConsoleMsg('info', 'settingsToggleErrorReporting ::: Error reporting is now enabled')
        utils.userSettingWrite('enableErrorReporting', true)
        sentry.enableSentry()
        sentry.countEvent('usageSettingsErrorReportingEnabled')
    } else {
        // ask if user really wants to disable error-reporting (using a confirm dialog)
        const Noty = require('noty')
        var n = new Noty(
            {
                theme: 'bootstrap-v4',
                layout: 'bottom',
                type: 'info',
                closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                text: '<b>Do you really want to disable reporting?</b><br><br>* We don\'t track users<br>* We don\'t store any IP informations<br>* We only collect error reports and event counts<br><br>This helps improving media-dupes',
                buttons: [
                    Noty.button('Yes', 'btn btn-danger mediaDupes_btnDownloadActionWidth', function () {
                        n.close()
                        utils.writeConsoleMsg('info', 'settingsToggleErrorReporting ::: Error reporting is now disabled')
                        utils.userSettingWrite('enableErrorReporting', false)
                        sentry.disableSentry()
                        sentry.countEvent('usageSettingsErrorReportingDisabled')
                        // myUndefinedFunctionFromRendererAfterDisable()
                    },
                    {
                        id: 'button1', 'data-status': 'ok'
                    }),

                    Noty.button('No', 'btn btn-success mediaDupes_btnDownloadActionWidth float-right', function () {
                        n.close()
                        $('#checkboxEnableErrorReporting').prop('checked', true) // revert state of checkbox
                        utils.showNoty('success', '<b>Thanks</b> for supporting media-dupes development with your error reports.')
                        utils.writeConsoleMsg('info', 'settingsToggleErrorReporting ::: User cancelled disabling of error-reporting')
                    })
                ]
            })

        n.show() // show the noty dialog
    }
}

/**
* @function settingsAudioFormatSave
* @summary Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @description Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
*/
function settingsAudioFormatSave () {
    var userSelectedAudioFormat = $('#inputGroupSelectAudio').val() // get value from UI select inputGroupSelectAudio
    utils.writeConsoleMsg('info', 'settingsAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')
    utils.userSettingWrite('audioFormat', userSelectedAudioFormat) // store this value in a json file
}

/**
* @function settingsOpenExternal
* @summary Gets an url from the settings ui and forwards this to the openURL function
* @description Gets an url from the settings ui and forwards this to the openURL function
* @param {string} url - the actual url
*/
function settingsOpenExternal (url) {
    utils.openURL(url)
}

function settingsEnableOrDisableYoutubeDLUpdateButton () {
    // check if youtube details file is writeable
    // if not - disable thje update button
    var youtubeDlBinaryDetailsPath = youtubeDl.binaryDetailsPathGet()
    utils.canWriteFileOrFolder(youtubeDlBinaryDetailsPath, function (error, isWritable) {
        if (error) {
            utils.writeConsoleMsg('error', 'settingsEnableOrDisableYoutubeDLUpdateButton ::: Error while trying to read the youtube-dl details file. Error: ' + error)
            throw error
        }

        if (isWritable === true) {
            // technically we could execute an update if there is one - so lets search for updates
            utils.writeConsoleMsg('info', 'settingsEnableOrDisableYoutubeDLUpdateButton ::: Updating youtube-dl binary is technically possible. Button can stay enabled')
        } else {
            // details file cant be resetted due to permission issues
            utils.writeConsoleMsg('warn', 'settingsEnableOrDisableYoutubeDLUpdateButton ::: Updating youtube-dl binary is not possible on this setup due to permission issues.')
            $('#buttonSettingsYoutubeDLStartUpdate').prop('disabled', true) // disable the button
        }
    })
}

// ----------------------------------------------------------------------------
// EXPORT THE MODULE FUNCTIONS
// ----------------------------------------------------------------------------
//
module.exports.settingsFolderOpen = settingsFolderOpen
module.exports.settingsOpenDevTools = settingsOpenDevTools
module.exports.settingsSelectDownloadDir = settingsSelectDownloadDir
module.exports.settingsToggleVerboseMode = settingsToggleVerboseMode
module.exports.settingsToggleAdditionalParameter = settingsToggleAdditionalParameter
module.exports.settingsSaveAdditionalParameter = settingsSaveAdditionalParameter
module.exports.settingsTogglePrereleases = settingsTogglePrereleases
module.exports.settingsToggleUrlInformations = settingsToggleUrlInformations
module.exports.settingsToggleErrorReporting = settingsToggleErrorReporting
module.exports.settingsAudioFormatSave = settingsAudioFormatSave
module.exports.settingsOpenExternal = settingsOpenExternal
module.exports.settingsEnableOrDisableYoutubeDLUpdateButton = settingsEnableOrDisableYoutubeDLUpdateButton
