// ----------------------------------------------------------------------------
// ERROR HANDLING
// ----------------------------------------------------------------------------
require('./js/crashReporting.js')
// myUndefinedFunctionFromRenderer();

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------
var arrayUserUrls = []

// Settings variables
var settingAudioFormat = 'mp3' // default mp3
var settingCustomDownloadDir = '' // default

/**
* @name initTitlebar
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
*/
function initTitlebar () {
    // NOTE:
    // - 'custom-electron-titlebar' is now an archived repo
    // - switched to fork of it 'pj-custom-electron-titlebar'
    const customTitlebar = require('pj-custom-electron-titlebar')

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

    // change font size of application name in titlebar
    $('.window-title').css('font-size', '13px') // https://github.com/AlexTorresSk/custom-electron-titlebar/issues/24

    // Try to change color of menu
    //
    // works - but results in follow error:         myTitlebar.updateBackground('#ff0000');
    // followerror: titleBackground.isLigher is not a function
    // myTitlebar.updateBackground('#ff00ff');

    // Trying to update the title
    //
    // myTitlebar.updateTitle('media-dupes');
}

/**
* @name showNoty
* @summary Shows a noty notification
* @description Creates an in-app notification using the noty framework
* @param type - Options: alert, success, warning, error, info/information
* @param message - notification text
* @param timeout - Timevalue, defines how long the message should be displayed. Use 0 for no-timeout
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
* @name showNotifcation
* @summary Shows a desktop notification
* @description Shows a desktop notification
* @param title - The title of the desktop notification
* @param message - The notification message text
*/
function showNotifcation (title = 'media-dupes', message) {
    const myNotification = new Notification(title, {
        body: message,
        icon: 'img/notification/icon.png'
    })

    myNotification.onclick = () => {
        console.log('showNotification ::: Notification clicked')
    }
}

/**
* @name loadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner
*/
function loadingAnimationShow () {
    console.log('loadingAnimationShow ::: Showing spinner')
    $('#md_spinner').attr('hidden', false)
}

/**
* @name loadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner
*/
function loadingAnimationHide () {
    console.log('loadingAnimationHide ::: Hiding spinner')
    $('#md_spinner').attr('hidden', true)
}

/**
* @name checkForDeps
* @summary Checks for missing dependencies
* @description Checks on startup for missing dependencies
*/
function checkForDeps () {
    var countErrors = 0

    // youtube-dl
    //
    const youtubedl = require('youtube-dl')
    console.log('checkForDeps ::: Searching youtube-dl ...')
    var youtubeDl = youtubedl.getYtdlBinary()
    if (youtubeDl === '') {
        countErrors = countErrors + 1
        console.error('checkForDeps ::: Unable to find youtube-dl')
        showNoty('error', 'Unable to find dependency <b>youtube-dl</b>. All download function are now disabled, sorry', 0)

        // hide both buttons (video and audio)
        $('#buttonStartVideo').hide()
        $('#buttonStartAudio').hide()
    } else {
        console.log('checkForDeps ::: Found youtube-dl in: _' + youtubeDl + '_.')
    }

    // ffmpeg
    //
    console.log('checkForDeps ::: Searching ffmpeg ...')
    var ffmpeg = require('ffmpeg-static-electron')
    if (ffmpeg === '') {
        countErrors = countErrors + 1
        console.error('checkForDeps ::: Unable to find ffmpeg')
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>. Extracting audio is now disabled, sorry', 0)

        // hide audio button
        $('#buttonStartAudio').hide()
    } else {
        console.log('checkForDeps ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
    }

    console.log('checkForDeps ::: Finished checking dependencies. Found overall _' + countErrors + '_ problems.')
}

/**
* @name uiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function uiReset () {
    console.log('uiReset ::: Starting to reset the UI')

    // empty input file
    $('#inputNewUrl').val('')

    // disable start button
    startButtonsDisable()

    // ensure some buttons are enabled
    otherButtonsEnable()

    // empty todo-list textarea
    toDoListReset()

    // empty log textarea
    // TODO

    // animation / spinner hide
    loadingAnimationHide()

    console.log('uiReset ::: Finished resetting the UI')
}

/**
* @name settingsSelectCustomTargetDir
* @summary Let the user choose a custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsSelectCustomTargetDir () {
    console.log('settingsSelectCustomTargetDir ::: Opening dialog to select a new download target ...')

    const options = { properties: ['openDirectory'] }

    const { dialog } = require('electron').remote
    dialog.showOpenDialog(options).then(res => {
        console.log(res.filePaths)

        if (res.filePaths !== '') {
            var newValue = res.filePaths.toString()

            // save the value to user-config
            writeLocalUserSetting('CustomDownloadDir', newValue)

            // show it in the UI
            $('#inputCustomTargetDir').val(newValue)

            console.log('settingsSelectCustomTargetDir ::: User selected the following directory: _' + newValue + '_.')
        }
    })
}

/**
* @name settingsResetCustomTargetDir
* @summary Let the user reset the custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsResetCustomTargetDir () {
    console.log('settingsResetCustomTargetDir ::: Resetting the custom download target.')

    var newValue = ''

    // save the value
    writeLocalUserSetting('CustomDownloadDir', newValue)

    // show it in the UI
    $('#inputCustomTargetDir').val(newValue)

    // update global var
    settingCustomDownloadDir = newValue
}

/**
* @name settingsBackToMain
* @summary Navigate back to index.html
* @description Is triggered via button on settings.html. Calls method on main.js which loads index.html back to the application window
*/
function settingsBackToMain () {
    // reload main UI
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('mainUiLoad')
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
            throw error
        }
        console.log('writeLocalUserSetting ::: key: _' + key + '_ - new value: _' + value + '_')

        showNoty('success', 'Set <b>' + key + '</b> to <b>' + value + '</b>.')
    })
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

    console.log('readLocalUserSetting ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            throw error
        }

        var value = data.setting

        console.log('readLocalUserSetting ::: key: _' + key + '_ - got value: _' + value + '_.')

        // Setting: CustomDownloadDir
        //
        if (key === 'CustomDownloadDir') {
            // not configured
            if ((value === null) || (value === undefined)) {
            // if(value === null) {
                console.warn('readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingCustomDownloadDir = '' // default
            } else {
                console.log('readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')

                // check if directory exists
                if (isDirectoryAvailable(value)) {
                    // check if directory exists
                    if (isDirectoryWriteable(value)) {
                        // seems like everything is ok

                        // update global var
                        settingCustomDownloadDir = value
                    } else {
                        console.error('readLocalUserSetting ::: Configured custom download dir _' + value + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        value = ''
                        settingCustomDownloadDir = value // update the global dir

                        // delete the config
                        storage.remove('CustomDownloadDir', function (error) {
                            if (error) throw error
                        })
                    }
                } else {
                    console.error('readLocalUserSetting ::: Configured custom download dir _' + value + '_ does not exists. Gonna reset the user-setting.')
                    value = ''
                    settingCustomDownloadDir = value // update the global dir

                    // delete the config
                    storage.remove('CustomDownloadDir', function (error) {
                        if (error) throw error
                    })
                }

                // Update UI select
                if (optionalUpdateSettingUI === true) {
                    $('#inputCustomTargetDir').val(value)
                }
            }
        }
        // end: CustomDownloadDir

        // Setting: AudioFormat
        //
        if (key === 'AudioFormat') {
            // not configured
            if ((value === null) || (value === undefined)) {
            // if(value === null) {
                console.warn('readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingAudioFormat = 'mp3' // default
            } else {
                console.log('readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')

                // update global var
                settingAudioFormat = value

                if (optionalUpdateSettingUI === true) {
                    // Update select
                    $('#inputGroupSelectAudio').val(value)
                }
            }
        }
        // end: AudioFormat
    })
}

/**
* @name settingAudioFormatSave
* @summary Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @description Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
*/
function settingAudioFormatSave () {
    // get value from UI select inputGroupSelectAudio
    var userSelectedAudioFormat = $('#inputGroupSelectAudio').val()
    console.log('settingAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')

    // store this value in a json file
    writeLocalUserSetting('AudioFormat', userSelectedAudioFormat)
}

/**
* @name userSettingsLoadAllOnAppStart
* @summary Reads all user-setting-files and fills some global variables
* @description Reads all user-setting-files and fills some global variables
*/
function userSettingsLoadAllOnAppStart () {
    // Custom download dir
    readLocalUserSetting('CustomDownloadDir')

    // load configured audio format
    readLocalUserSetting('AudioFormat')
}

/**
* @name userSettingsLoadAllOnSettingsUiLoad
* @summary Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @description Reads all user-setting-files and fills some global variables and adjusts the settings UI
*/
function userSettingsLoadAllOnSettingsUiLoad () {
    // Custom download dir
    readLocalUserSetting('CustomDownloadDir', true)

    // load configured audio format and update the settings UI
    readLocalUserSetting('AudioFormat', true)
}

/**
* @name settingsFolderOpen
* @summary Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
* @description Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
*/
function settingsFolderOpen () {
    console.log('settingsFolderOpen ::: User wants to open its config folder.')

    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsFolderOpen')
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
* @name addURL
* @summary Handles the url add click of the user
* @description Handles the url add click of the user
*/
function addURL () {
    // get content of input
    var newUrl = $('#inputNewUrl').val()

    // trim the url to remove blanks
    newUrl = newUrl.trim()

    if (newUrl !== '') {
        var isUrlValid = validURL(newUrl)
        if (isUrlValid) {
            console.log('addURL ::: Adding new url: _' + newUrl + '_.')

            // append to array
            arrayUserUrls.push(newUrl)

            // update todo list
            updateToDoList()

            // reset input
            $('#inputNewUrl').val('')
        } else {
            console.error('addURL ::: Detected invalid url: _' + newUrl + '_.')
            showNoty('error', 'Please insert a valid url (reason: was invalid)')
        }
    } else {
        showNoty('error', 'Please insert a valid url (reason: was empty)')
    }
}

/**
* @name updateToDoList
* @summary Updates the todo-list after a user added an url
* @description Updates the todo-list after a user added an url
*/
function updateToDoList () {
    // remove duplicate entries in array
    arrayUserUrls = $.unique(arrayUserUrls)

    // write array content to textarea
    var textarea = document.getElementById('textareaTodoList')
    textarea.value = arrayUserUrls.join('\n')

    // if array size > 0 -> enable start button
    var arrayLength = arrayUserUrls.length
    if (arrayLength > 0) {
        startButtonsEnable()
    }

    console.log('updateToDoList ::: Added new url to todo-list')
}

/**
* @name toDoListReset
* @summary Resets the todo-list textarea
* @description Resets the todo-list textarea
*/
function toDoListReset () {
    // reset the array
    arrayUserUrls = []

    // reset todo-list
    textareaTodoList.value = ''

    console.log('toDoListReset ::: Did reset the todolist-textarea')
}

/**
* @name startButtonsEnable
* @summary Enabled the 2 start buttons
* @description Is executed when the todo-list contains at least 1 item
*/
function startButtonsEnable () {
    // disable start button
    $('#buttonStartVideo').prop('disabled', false)
    $('#buttonStartAudio').prop('disabled', false)

    console.log('startButtonsEnable ::: Did enable both start buttons')
}

/**
* @name startButtonsDisable
* @summary Disables the 2 start buttons
* @description Is executed when a download task is started by the user
*/
function startButtonsDisable () {
    // disable start button
    $('#buttonStartVideo').prop('disabled', true)
    $('#buttonStartAudio').prop('disabled', true)

    console.log('startButtonsDisable ::: Did disable both start buttons')
}

/**
* @name otherButtonsEnable
* @summary Enables some of the footer buttons when a download is finished
* @description Is executed when a download task has ended by the user
*/
function otherButtonsEnable () {
    // disable some buttons

    $('#inputNewUrl').prop('disabled', false) // url input field

    // add URL
    $('#buttonAddUrl').prop('disabled', false) // add url

    // footer
    $('#buttonShowSettings').prop('disabled', false) // settings
    $('#buttonShowHelp').prop('disabled', false) // help / intro
    $('#buttonShowExtractors').prop('disabled', false) // showExtractors

    console.log('otherButtonsEnable ::: Did enable some other UI elements')
}

/**
* @name otherButtonsDisable
* @summary Disables some of the footer buttons while a download is running
* @description Is executed when a download task is started by the user
*/
function otherButtonsDisable () {
    // disable some buttons

    $('#inputNewUrl').prop('disabled', true) // url input field

    $('#buttonAddUrl').prop('disabled', true) // add url

    $('#buttonShowSettings').prop('disabled', true) // settings
    $('#buttonShowHelp').prop('disabled', true) // help / intro
    $('#buttonShowExtractors').prop('disabled', true) // showExtractors

    console.log('otherButtonsDisable ::: Did disable some other UI elements')
}


/**
* @name uiLogReset
* @summary Resetts the log textarea
* @description Resetts the log textarea
*/
function uiLogReset () {
    textareaLogOutput.value = ''
    console.log('uiLogReset ::: Did reset the log-textarea')
}

/**
* @name uiLogAppend
* @summary Appends text to the log textarea
* @description Appends text to the log textarea
*/
function uiLogAppend (newLine) {
    $('#textareaLogOutput').val(function (i, text) {
        return text + newLine + '\n'
    })
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
* @name isEncoded
* @summary Used to decode URLs
* @description
* param uri - The incoming uri
* @return uri - a decoded url
*/
function fullyDecodeURI (uri) {
    while (isEncoded(uri)) {
        uri = decodeURIComponent(uri)
        console.log('fullyDecodeURI ::: URL: _' + uri + '_ is now fully decoded.')
    }

    return uri
}

/**
* @name downloadContent
* @summary Does the actual download
* @description Does the actual download
*/
function downloadContent (mode) {
    console.log('downloadContent ::: Start with mode set to: _' + mode + '_.')

    // example urls
    //
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA
    // VIMEO:           https://vimeo.com/315670384
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // What is the target dir
    //
    var detectedDownloadDir = getDownloadDirectory()
    console.log('downloadContent ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    console.log('downloadContent ::: Is the reply useable: _' + detectedDownloadDir[0] + '_.')

    // if we got a valid download dir
    if (detectedDownloadDir[0]) {
        // Prepare UI
        //
        //editorReset() // start new job - clean up loag before - TODO
        startButtonsDisable() // disable the start buttons
        otherButtonsDisable() // disables some other buttons
        loadingAnimationShow() // start download animation / spinner

        // require some stuff
        const youtubedl = require('youtube-dl')
        const { remote } = require('electron')
        const path = require('path')

        var targetPath = detectedDownloadDir[1]
        console.log('downloadContent ::: Download target is set to: _' + targetPath + '_.')

        var youtubeDlParameter = ''

        // Define the youtube-dl parameters depending on the mode (audio vs video)
        switch (mode) {
        case 'audio':
            var ffmpeg = require('ffmpeg-static-electron')
            console.log('downloadContent ::: Detected bundled ffmpeg at: _' + ffmpeg.path + '_.')
            console.log('downloadContent ::: AudioFormat is set to: _' + settingAudioFormat + '_')

            // generic parameter / flags
            youtubeDlParameter = [
                // '--verbose',
                '--format', 'bestaudio',
                '--extract-audio',
                '--audio-format', settingAudioFormat,
                '--audio-quality', '0',
                '--ignore-errors',
                '--output', path.join(targetPath, 'Audio', '%(artist)s-%(album)s', '%(title)s-%(id)s.%(ext)s'),
                '--prefer-ffmpeg', '--ffmpeg-location', ffmpeg.path
            ]

            // prepend/add some case-specific parameter / flag
            if (settingAudioFormat === 'mp3') {
                youtubeDlParameter.unshift('--embed-thumbnail') // prepend
            }
            registerEvent('downloadAudio')
            break

        case 'video':
            youtubeDlParameter = [
                // '--verbose',
                '--format', 'best',
                '--output', path.join(targetPath, '%(title)s-%(id)s.%(ext)s'),
                '--add-metadata',
                '--ignore-errors'
            ]
            registerEvent('downloadVideo')
            break

        default:
            console.error('downloadContent ::: Unspecified mode. This should never happen.')
            showNoty('error', 'Unexpected download mode. Please report this issue')
            return
        }

        // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
        if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
            showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadContent. Please report this')
            return
        }

        // prepare array for urls throwing errors
        var arrayUrlsThrowingErrors = []

        // assuming we got an array
        // for each item of the array
        // try to start a download-process
        var arrayLength = arrayUserUrls.length
        for (var i = 0; i < arrayLength; i++) {
            // get url
            var url = arrayUserUrls[i]

            // decode url - see #25
            //
            // url = decodeURI(url);
            url = fullyDecodeURI(url)

            registerEvent('downloadSingleUrl')

            console.log('downloadContent ::: Processing URL: _' + url + '_.')
            console.log('downloadContent ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')
            console.log('downloadContent ::: Using the following parameters: _' + youtubeDlParameter + '_.')

            uiLogAppend('Processing: ' + url)

            // GetInfo
            //
            /*
            const options = []
            const info = youtubedl.getInfo(url, options, function(err, info) {
                if (err) {
                    throw err
                }

                //
                console.error('id:', info.id)
                console.error('title:', info.title)
                console.error('url:', info.url)
                console.error('thumbnail:', info.thumbnail)
                console.error('description:', info.description)
                console.error('filename:', info._filename)
                console.error('format id:', info.format_id)
            })
            */

            // Download
            //
            const video = youtubedl.exec(url, youtubeDlParameter, {}, function (err, output) {
                if (err) {
                    // showNoty('error', 'Downloading <b>' + url + '</b> failed with error: ' + err, 0)
                    showDialog('error', 'Alert', 'Download failed', 'Failed to download the url:\n' + url + '\n\nError:\n' + err)
                    console.error('downloadContent ::: Problems downloading url _' + url + ' with the following parameters: _' + youtubeDlParameter + '_.')

                    // remember troublesome url
                    arrayUrlsThrowingErrors.push(url)

                    throw err
                }

                // show progress
                console.log(output.join('\n'))
                uiLogAppend(output.join('\n'))

                // scroll log textarea to the end
                $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight)

                // finish
                console.log('downloadContent ::: Finished downloading _' + url + '_.')
                uiLogAppend('Finished downloading: ' + url)
                showNoty('success', 'Finished downloading <b>' + url + '</b>.')

                // Final notification
                if (i === arrayLength) {
                    showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
                    toDoListReset() // empty the todo list
                    uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                    loadingAnimationHide() // stop download animation / spinner
                    otherButtonsEnable() // enable some of the buttons again
                    $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight) // scroll log textarea to the end
                }
            })
        }
        console.log('downloadContent ::: All download processes are now started')
    } else {
        console.error('downloadContent ::: Unable to start a download, because no useable target dir was detectable')
        showNoty('error', 'Aborted download, because no useable downloads directory was found', 0)
    }
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
* @name showSupportedExtractors
* @summary Updates the todo-list after a user added an url
* @description Updates the todo-list after a user added an url
*/
function showSupportedExtractors () {
    console.log('showSupportedExtractors ::: Loading list of all supported extractors...')

    loadingAnimationShow()

    registerEvent('showExtractors')

    // reset the log
    // TODO

    const youtubedl = require('youtube-dl')

    youtubedl.getExtractors(true, function (err, list) {
        if (err) {
            showNoty('error', 'Unable to get youtube-dl extractor list.', 0)
            console.error('showSupportedExtractors ::: Unable to get youtube-dl extractors. Error: _' + err + '_.')
            throw err
        }

        console.log('showSupportedExtractors ::: Found ' + list.length + ' extractors')

        // append to ui-log
        uiLogAppend('<b>Found ' + list.length + ' extractors:</b>')

        for (let i = 0; i < list.length; i++) {
            console.log('showSupportedExtractors ::: ' + list[i])
        }

        textareaLogOutput.value = list.join('\n')


        uiLogAppend(list.length + ' extractors are currently supported') // summary in editor
        console.log('Found ' + list.length + ' extractors') // summary in console.

        // scroll log textarea to the end
        $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight)


        loadingAnimationHide() // stop loading animation
    })

    console.log('showSupportedExtractors ::: Finished.')
}

/**
* @name searchUpdate
* @summary Checks if there is a new release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
    loadingAnimationShow()

    // when executed manually via menu -> user should see that update-check is running
    if (silent === false) {
        showNoty('info', 'Searching for updates')
    }

    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions
    var gitHubPath = 'yafp/media-dupes' // user/repo
    var url = 'https://api.github.com/repos/' + gitHubPath + '/tags'

    console.log('searchUpdate ::: Start checking _' + url + '_ for available releases')

    var updateStatus = $.get(url, function (data) {
        3000 // in milliseconds

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        // remoteAppVersionLatest = '66.6.6'; // overwrite variable to simulate available updates

        // get local version
        //
        localAppVersion = require('electron').remote.app.getVersion()
        // localAppVersion = '0.0.1'; //  overwrite variable to simulate

        console.log('searchUpdate ::: Local version: ' + localAppVersion)
        console.log('searchUpdate ::: Latest public version: ' + remoteAppVersionLatest)

        // Update available
        if (localAppVersion < remoteAppVersionLatest) {
            console.log('searchUpdate ::: Found update, notify user')

            // using a confirm dialog - since #150
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'information',
                    text: 'An update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?',
                    buttons: [
                        Noty.button('Yes', 'btn btn-success', function () {
                            n.close()
                            openReleasesOverview()
                        },
                        {
                            id: 'button1', 'data-status': 'ok'
                        }),

                        Noty.button('No', 'btn btn-secondary', function () {
                            n.close()
                        })
                    ]
                })

            // show the noty dialog
            n.show()
        } else {
            console.log('searchUpdate ::: No newer version found.')

            // when executed manually via menu -> user should see result of this search
            if (silent === false) {
                showNoty('success', 'No updates available')
            }
        }

        console.log('searchUpdate ::: Successfully checked ' + url + ' for available releases')
    })
        .done(function () {
        // console.log('searchUpdate ::: Successfully checked ' + url + ' for available releases');
        })

        .fail(function () {
            console.log('searchUpdate ::: Checking ' + url + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + url + '</b> for available releases failed. Please troubleshoot your network connection.')
        })

        .always(function () {
            console.log('searchUpdate ::: Finished checking ' + url + ' for available releases')

            loadingAnimationHide()
        })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
    var url = 'https://github.com/yafp/media-dupes/releases'
    console.log('openReleasesOverview ::: Opening _' + url + '_ to show available releases.')
    openURL(url)
}

/**
* @name openURL
* @summary Opens an url in browser
* @description Opens a given url in default browser. This is pretty slow, but got no better solution so far.
* @param url - URL string which contains the target url
*/
function openURL (url) {
    const { shell } = require('electron')
    console.log('openURL ::: Trying to open the url: _' + url + '_.')
    shell.openExternal(url)
}

/**
* @name openUserDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function openUserDownloadFolder () {
    var detectedDownloadDir = getDownloadDirectory()

    console.log('openUserDownloadFolder ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    console.log('openUserDownloadFolder ::: Is the reply useable: _' + detectedDownloadDir[0] + '_.')

    // if we gont a download folder which can be used
    if (detectedDownloadDir[0]) {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('openUserDownloadFolder', detectedDownloadDir[1])
    } else {
        console.error('openUserDownloadFolder ::: Unable to find a download dir.')
        showNoty('error', 'Unable to find a working download dir.', 0)
    }
}

/**
* @name startIntro
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function startIntro () {
    console.log('startIntro ::: User wants to see the intro. Here you go!')
    introJs().start()
    registerEvent('showIntro')
}

/**
* @name getDownloadDirectory
* @summary Detects what the download target dir is
* @description Validates which directory should be used as download target
* @return boolean - Do we have a useable download dir
* @return String - The detected download dir
*/
function getDownloadDirectory () {
    console.log('getDownloadDirectory ::: Gonna check for the user download directory')

    var targetPath = ''

    // Check if there is a user-configured target defined
    //
    console.log('getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    targetPath = settingCustomDownloadDir.toString()
    if (targetPath !== '') {
        // User has configured a custom download dir
        console.log('getDownloadDirectory ::: User configured custom download directory is configured to: _' + targetPath + '_.')

        // check if that directory still exists
        if (isDirectoryAvailable(targetPath)) {
            // the custom dir exists

            // check if it is writeable
            if (isDirectoryWriteable(targetPath)) {
                console.log('getDownloadDirectory :::The custom download dir _' + targetPath + '_ is writeable. We are all good and gonna use it now')
                return [true, targetPath]
            } else {
                // folder exists but is not writeable
                console.error('getDownloadDirectory :::The custom download dir _' + targetPath + '_ exists but is not writeable. Gonna fallback to default')
                showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default')
                writeLocalUserSetting('CustomDownloadDir', '')
                settingCustomDownloadDir = ''
            }
        } else {
            // the configured dir does not exists anymore
            console.error('getDownloadDirectory :::The custom download dir _' + targetPath + '_ does not exists. Gonna fallback to default')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> does not exists anymore. Gonna reset the custom setting now back to default')
            writeLocalUserSetting('CustomDownloadDir', '')
            settingCustomDownloadDir = ''
        }
    }
    // end checking custom dir

    // check the default download dir
    //
    console.log('getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    // use the default download target
    const { remote } = require('electron')
    targetPath = remote.getGlobal('sharedObj').prop1

    // check if that directory still exists
    if (isDirectoryAvailable(targetPath)) {
        // the default download folder exists
        console.log('getDownloadDirectory ::: The default download location _' + targetPath + '_ exists')

        // check if it is writeable
        if (isDirectoryWriteable(targetPath)) {
            console.log('getDownloadDirectory ::: The default download location _' + targetPath + '_ exists and is writeable. We are all good and gonna use it now')
            return [true, targetPath]
        } else {
            // folder exists but is not writeable
            console.error('getDownloadDirectory ::: The default download location _' + targetPath + '_ exists but is not writeable. This is a major problem')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
            return [false, '']
        }
    } else {
        // was unable to detect a download folder
        console.error('getDownloadDirectory ::: Was unable to detect an existing default download location')
        // should force the user to set a custom one
        showNoty('error', 'Unable to detect an existing default download location. Please configure a custom download directory in the application settings', 0)
        return [false, '']
    }
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
            console.log('isDirectoryAvailable ::: The directory _' + dirPath + '_ exists')
            return true
        } else {
            console.error('isDirectoryAvailable ::: The directory _' + dirPath + '_ does not exists')
            return false
        }
    } else {
        console.error('isDirectoryAvailable ::: Should check if a directory exists but the supplied parameter _' + dirPath + '_ was empty')
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
            console.log('isDirectoryWriteable ::: Directory _' + dirPath + '_ is writeable')
            return true
        } catch (err) {
            console.error('isDirectoryWriteable ::: Directory _' + dirPath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        console.error('isDirectoryWriteable ::: Should check if a directory is writeable but the supplied parameter _' + dirPath + '_ was empty.')
    }
}

/**
* @name userSettingsShowYoutubeDLInfo
* @summary Searches the youtube-binary and shows it in the settings dialog
* @description Searches the youtube-binary and shows it in the settings dialog
*/
function userSettingsShowYoutubeDLInfo () {
    const youtubedl = require('youtube-dl')
    console.log('userSettingsShowYoutubeDLInfo ::: Searching youtube-dl ...')
    var youtubeDl = youtubedl.getYtdlBinary()
    if (youtubeDl === '') {
        console.error('userSettingsShowYoutubeDLInfo ::: Unable to find youtube-dl')
        showNoty('error', 'Unable to find dependency <b>youtube-dl</b>.', 0)
    } else {
        console.log('userSettingsShowYoutubeDLInfo ::: Found youtube-dl in: _' + youtubeDl + '_.')
        // show in UI
        $('#userSettingsYouTubeDLPathInfo').val(youtubeDl)
    }
}

/**
* @name userSettingsShowFfmpegInfo
* @summary Searches the ffmpeg-binary and shows it in the settings dialog
* @description Searches the ffmpeg-binary and shows it in the settings dialog
*/
function userSettingsShowFfmpegInfo () {
    var ffmpeg = require('ffmpeg-static-electron')
    console.log('userSettingsShowFfmpegInfo ::: Searching ffmpeg ...')
    if (ffmpeg === '') {
        console.error('userSettingsShowFfmpegInfo ::: Unable to find ffmpeg')
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>.', 0)
    } else {
        console.log('userSettingsShowFfmpegInfo ::: Found ffmpeg in: _' + ffmpeg.path + '_.')

        // show in UI
        $('#userSettingsFfmpegPathInfo').val(ffmpeg.path)
    }
}

/**
* @name checkUrlInputField
* @summary Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
* @description Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
*/
function checkUrlInputField () {
    console.log('checkUrlInputField ::: Triggered on focus')

    // get current content of field
    var currentContentOfUrlInputField = $('#inputNewUrl').val()

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        // get content of clipboard
        const { clipboard } = require('electron')
        var currentClipboardContent = clipboard.readText()

        // remove leading and trailing blanks
        // currentClipboardContent.replace(/^\s+|\s+$/g, "");
        currentClipboardContent = currentClipboardContent.trim()

        console.log('checkUrlInputField ::: Clipboard currently contains: _' + currentClipboardContent + '_.')

        // check if it is a valid url - if so paste it
        var isUrlValid = validURL(currentClipboardContent)
        if (isUrlValid) {
            // paste it
            $('#inputNewUrl').val(currentClipboardContent)

            // select it entirely
            $('#inputNewUrl').select()

            console.log('checkUrlInputField ::: Clipboard contains a valid URL - pasted it into the input field.')
        }
    }
}

/**
* @name onEnter
* @summary Executed on keypress inside url-input-field
* @description Checks if the key-press was the ENTEr-key - if so simulates a press of the button ADD URL
*/
function onEnter (event) {
    var code = 0
    code = event.keyCode
    if (code === 13) {
        addURL() // simulare click on ADD URL buttom
    }
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
    // https://electronjs.org/docs/api/dialog
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
        // console.log(response);
    })
}

// Call from main.js ::: startSearchUpdates - verbose
//
require('electron').ipcRenderer.on('startSearchUpdatesVerbose', function () {
    searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})

// Call from main.js ::: startSearchUpdates - verbose
//
require('electron').ipcRenderer.on('startSearchUpdatesSilent', function () {
    searchUpdate(true) // silent = false. Forces result feedback, even if no update is available
})

// Call from main.js ::: openSettings
//
require('electron').ipcRenderer.on('openSettings', function () {
    settingsUiLoad()
})
