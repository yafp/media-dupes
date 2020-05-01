/**
 * @file Contains all ui functions
 * @author yafp
 * @module ui
 */
'use strict'

// ----------------------------------------------------------------------------
// REQUIRE MODULES
// ----------------------------------------------------------------------------
//
const utils = require('./utils.js')
const ffmpeg = require('./ffmpeg.js')
const youtubeDl = require('./youtubeDl.js')
const sentry = require('./sentry.js')

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------
//
var distractEnabler = 0
var arrayUserUrls = [] // contains the urls which should be downloaded
var arrayUserUrlsN = []

/**
* @function windowMainApplicationStateSet
* @summary Updates the application state information
* @description Updates the applicationState in globalObject. Updates the application state displayed in the UI. Starts or stops the spinner depending on the state
* @param {string} [newState] - String which defines the new state of the application
*/
function windowMainApplicationStateSet (newState = 'idle') {
    if (newState === 'Download in progress') { // #97
        // enable powerSaveBlocker
        const { ipcRenderer } = require('electron')
        utils.writeConsoleMsg('info', 'windowMainApplicationStateSet ::: Trying to enable the PowerSaveBlocker now, as media-dupes is currently downloading.')
        ipcRenderer.send('enablePowerSaveBlocker')
    }

    utils.globalObjectSet('applicationState', newState) // update the global object
    utils.writeConsoleMsg('info', 'windowMainApplicationStateSet ::: Setting application state to: _' + newState + '_.')

    if (newState === 'idle') {
        newState = '&nbsp;'
        windowMainLoadingAnimationHide()
    } else {
        windowMainLoadingAnimationShow()
    }
    $('#applicationState').html(newState) // update the main ui
}

/**
* @function windowMainLoadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner. applicationStateSet() is using this function
*/
function windowMainLoadingAnimationShow () {
    // if ( $('#md_spinner').attr( "hidden" )) { // only if it isnt already displayed
    if ($('#div').data('hidden', true)) { // only if it isnt already displayed
        utils.writeConsoleMsg('info', 'windowMainLoadingAnimationShow ::: Show spinner')
        $('#md_spinner').attr('hidden', false)
    }
}

/**
* @function windowMainLoadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner. applicationStateSet() is using this function
*/
function windowMainLoadingAnimationHide () {
    if ($('#div').data('hidden', false)) { // only if it isnt already hidden
        utils.writeConsoleMsg('info', 'windowMainLoadingAnimationHide ::: Hide spinner')
        $('#md_spinner').attr('hidden', true)
    }
}

/**
* @function windowMainButtonsOthersEnable
* @summary Enables some of the footer buttons when a download is finished
* @description Is executed when a download task has ended by the user
*/
function windowMainButtonsOthersEnable () {
    // enable some buttons
    $('#inputNewUrl').prop('disabled', false) // url input field
    $('#buttonShowHelp').prop('disabled', false) // help / intro
    $('#buttonShowExtractors').prop('disabled', false) // showExtractors
    utils.writeConsoleMsg('info', 'windowMainButtonsOthersEnable ::: Did enable some other UI elements')
}

/**
* @function windowMainButtonsOthersDisable
* @summary Disables some of the footer buttons while a download is running
* @description Is executed when a download task is started by the user
*/
function windowMainButtonsOthersDisable () {
    // disable some buttons
    $('#inputNewUrl').prop('disabled', true) // url input field
    $('#buttonShowHelp').prop('disabled', true) // help / intro
    $('#buttonShowExtractors').prop('disabled', true) // showExtractors
    utils.writeConsoleMsg('info', 'windowMainButtonsOthersDisable ::: Did disable some other UI elements')
}

/**
* @function windowMainButtonsStartEnable
* @summary Enabled the 2 start buttons
* @description Is executed when the todo-list contains at least 1 item
*/
function windowMainButtonsStartEnable () {
    // enable start buttons if needed - if needed
    if ($('#buttonStartVideoExec').is(':disabled')) {
        // Button: VideoExec
        $('#buttonStartVideoExec').prop('disabled', false)
        $('#buttonStartVideoExec').removeClass('btn-secondary') // remove class: secondary
        $('#buttonStartVideoExec').addClass('btn-danger') // add class: danger
        // Button: Video
        $('#buttonStartVideo').prop('disabled', false)
        $('#buttonStartVideo').removeClass('btn-secondary') // remove danger class
        $('#buttonStartVideo').addClass('btn-danger') // add class: danger
        // Button: AudioExec
        $('#buttonStartAudioExec').prop('disabled', false)
        $('#buttonStartAudioExec').removeClass('btn-secondary') // remove class: secondary
        $('#buttonStartAudioExec').addClass('btn-danger') // add class: danger

        utils.writeConsoleMsg('info', 'windowMainButtonsStartEnable ::: Did enable both start buttons')
    }
}

/**
* @function windowMainButtonsStartDisable
* @summary Disables the 2 start buttons
* @description Is executed when a download task is started by the user
*/
function windowMainButtonsStartDisable () {
    // disable start buttons - if needed
    if ($('#buttonStartVideoExec').is(':enabled')) {
        // Button: VideoExec
        $('#buttonStartVideoExec').prop('disabled', true)
        $('#buttonStartVideoExec').removeClass('btn-danger') // remove class: danger
        $('#buttonStartVideoExec').addClass('btn-secondary') // add class: secondary
        // Button: Video
        $('#buttonStartVideo').prop('disabled', true)
        $('#buttonStartVideo').removeClass('btn-danger') // remove danger class
        $('#buttonStartVideo').addClass('btn-secondary') // add class: secondary
        // Button: AudioExec
        $('#buttonStartAudioExec').prop('disabled', true)
        $('#buttonStartAudioExec').removeClass('btn-danger') // remove danger class
        $('#buttonStartAudioExec').addClass('btn-secondary') // add class: secondary

        utils.writeConsoleMsg('info', 'windowMainButtonsStartDisable ::: Did disable both start buttons')
    }
}

/**
* @function windowMainBlurSet
* @summary Can set a blur level for entire main ui
* @description Can set a blur level for entire main ui. Is used on the mainUI when the settingsUI is open
* @param {boolean} enable- To enable or disable blur
*/
function windowMainBlurSet (enable) {
    if (enable === true) {
        // mainContainer
        $('#mainContainer').css('filter', 'blur(2px)') // blur
        $('#mainContainer').css('pointer-events', 'none') // disable click events
        // titlebar
        $('.titlebar').css('filter', 'blur(2px)') // blur
        $('.titlebar').css('pointer-events', 'none') // disable click events
        utils.writeConsoleMsg('info', 'windowMainBlurSet ::: Enabled blur effect')
    } else {
        // mainContainer
        $('#mainContainer').css('filter', 'blur(0px)') // unblur
        $('#mainContainer').css('pointer-events', 'auto') // enable click-events
        // titlebar
        $('.titlebar').css('filter', 'blur(0px)') // unblur
        $('.titlebar').css('pointer-events', 'auto') // enable click-events
        utils.writeConsoleMsg('info', 'windowMainBlurSet ::: Disabled blur effect')
    }
}

/**
* @function windowMainIntroShow
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function windowMainIntroShow () {
    utils.writeConsoleMsg('info', 'windowMainIntroShow ::: Starting the media-dupes intro')
    const introJs = require('intro.js')
    introJs().start()
}

/**
* @function windowMainLogAppend
* @summary Appends text to the log textarea
* @description Appends text to the log textarea
* @param {String} newLine - The content for the line which should be appended to the UI Log
*/
function windowMainLogAppend (newLine, addTimestamp = false) {
    if (addTimestamp === true) {
        var currentTimestamp = utils.generateTimestamp() // get a current timestamp
        newLine = currentTimestamp + ' > ' + newLine
    }

    $('#textareaLogOutput').val(function (i, text) {
        return text + newLine + '\n'
    })
    windowMainLogScrollToEnd() // scroll log textarea to the end
}

/**
* @function windowMainLogReset
* @summary Resets the ui log
* @description Resets the content of the ui log
*/
function windowMainLogReset () {
    document.getElementById('textareaLogOutput').value = ''
    utils.writeConsoleMsg('info', 'windowMainLogReset ::: Did reset the log-textarea')
}

/**
* @function windowMainLogScrollToEnd
* @summary Scrolls the UI log to the end
* @description Scrolls the UI log to the end / latest entry
*/
function windowMainLogScrollToEnd () {
    $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight) // scroll log textarea to the end
}

/**
* @function windowMainResetAskUser
* @summary Ask the user if he wants to execute the UI reset function if there are currently downloads in progress
* @description Ask the user if he wants to execute the UI reset function if there are currently downloads in progress
*/
function windowMainResetAskUser () {
    var curState = utils.globalObjectGet('applicationState') // get application state
    if (curState === 'Download in progress') {
        const Noty = require('noty')
        var n = new Noty(
            {
                theme: 'bootstrap-v4',
                layout: 'bottom',
                type: 'info',
                closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                text: 'Seems like <b>media-dupes</b> is currently downloading. Do you really want to reset the UI?',
                buttons: [
                    Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                        n.close()
                        windowMainUiReset()
                    },
                    {
                        id: 'button1', 'data-status': 'ok'
                    }),
                    Noty.button('No', 'btn btn-secondary mediaDupes_btnDefaultWidth float-right', function () {
                        n.close()
                    })
                ]
            })

        n.show() // show the noty dialog
    } else {
        windowMainUiReset()
    }
}

/**
* @function windowMainOpenDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function windowMainOpenDownloadFolder () {
    const { ipcRenderer } = require('electron')
    var configuredDownloadFolder = utils.globalObjectGet('downloadDir')
    utils.writeConsoleMsg('info', 'windowMainOpenDownloadFolder ::: Seems like we should use the following dir: _' + configuredDownloadFolder + '_.')
    ipcRenderer.send('openUserDownloadFolder', configuredDownloadFolder)
}

/**
* @function windowMainSettingsUiLoad
* @summary Navigate to setting.html
* @description Is triggered via button on index.html. Calls method on main.js which loads setting.html to the application window
*/
function windowMainSettingsUiLoad () {
    const { ipcRenderer } = require('electron')
    windowMainBlurSet(true) // blur the main UI
    ipcRenderer.send('settingsUiLoad') // tell main.js to load settings UI
}

/**
* @function windowMainDownloadContent
* @summary Handles the download of audio and video
* @description Checks some requirements, then sets the youtube-dl parameter depending on the mode. Finally launched youtube-dl via exec
* @param {String} mode - The download mode. Can be 'video' or 'audio'
* @throws Exit code from youtube-dl exec task
*/
function windowMainDownloadContent (mode) {
    utils.writeConsoleMsg('info', 'downloadContent ::: Start with mode set to: _' + mode + '_.')

    // some example urls for tests
    //
    // VIDEO:
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA                      // 11 sec       less then 1 MB
    //                  https://www.youtube.com/watch?v=cmiXteWLNw4                     // 1 hour
    //                  https://www.youtube.com/watch?v=bZ_C-AVo5xA                     // for simulating download errors
    // VIMEO:           https://vimeo.com/315670384                                     // 48 sec       around 1GB
    //                  https://vimeo.com/274478457                                     // 6 sec        around 4MB
    //
    // AUDIO:
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // What is the target dir
    var configuredDownloadFolder = utils.globalObjectGet('downloadDir')
    utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Download target directory is set to: _' + configuredDownloadFolder + '_.')

    if (utils.isDirectoryAvailable(configuredDownloadFolder)) {
        // the download folder exists

        // check if it is writeable
        if (utils.isDirectoryWriteable(configuredDownloadFolder)) {
            // Prepare UI
            windowMainButtonsStartDisable() // disable the start buttons
            windowMainButtonsOthersDisable() // disables some other buttons
            windowMainApplicationStateSet('Download in progress') // set the application state

            // require some stuff
            const youtubedl = require('youtube-dl')
            const path = require('path')

            var arrayUrlsProcessedSuccessfully = [] // prepare array for urls which got successfully downloaded
            var arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors

            // youtube-dl
            utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Using youtube.dl from: _' + youtubeDl.binaryPathGet() + '_.')

            // ffmpeg
            var ffmpegPath = ffmpeg.ffmpegGetBinaryPath()
            utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Detected bundled ffmpeg at: _' + ffmpegPath + '_.')

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrlsN === 'undefined' || !(arrayUserUrlsN instanceof Array)) {
                windowMainApplicationStateSet()
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrlsN_ in function downloadContent(). Please report this', 0)
                return
            } else {
                utils.globalObjectSet('todoListStateEmpty', false)
            }

            // Define the youtube-dl parameters depending on the mode (audio vs video)
            // youtube-dl docs: https://github.com/ytdl-org/youtube-dl/blob/master/README.md
            var youtubeDlParameter = []
            switch (mode) {
            case 'audio':
                var settingAudioFormat = utils.globalObjectGet('audioFormat') // get configured audio format

                // generic parameter / flags
                youtubeDlParameter = [
                    // OPTIONS
                    '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                    '--format', 'bestaudio',
                    '--output', path.join(configuredDownloadFolder, 'Audio', '%(track_number)s-%(artist)s-%(album)s-%(title)s-%(id)s.%(ext)s'), // output path
                    // FILESYSTEM OPTIONS
                    '--restrict-filenames', // Restrict filenames to only ASCII characters, and avoid "&" and spaces in filenames
                    '--continue', // Force resume of partially downloaded files. By default, youtube-dl will resume downloads if possible.
                    // POST PROCESSING
                    '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath, // ffmpeg location
                    '--add-metadata', // Write metadata to the video file
                    '--audio-format', settingAudioFormat, //  Specify audio format: "best", "aac", "flac", "mp3", "m4a", "opus", "vorbis", or "wav"; "best" by default; No effect without -x
                    '--extract-audio', // Convert video files to audio-only files (requires ffmpeg or avconv and ffprobe or avprobe)
                    '--audio-quality', '0', // value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5),
                    '--fixup', 'detect_or_warn' // Automatically correct known faults of the file.
                ]

                // prepend/add some case-specific parameter / flag
                if ((settingAudioFormat === 'mp3') || (settingAudioFormat === 'm4a')) {
                    youtubeDlParameter.unshift('--embed-thumbnail') // prepend Post-processing Option
                }
                break

            case 'video':
                youtubeDlParameter = [
                    // OPTIONS
                    '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                    '--format', 'best',
                    '--output', path.join(configuredDownloadFolder, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                    // FILESYSTEM OPTIONS
                    '--restrict-filenames', // Restrict filenames to only ASCII characters, and avoid "&" and spaces in filenames
                    '--continue', // Force resume of partially downloaded files. By default, youtube-dl will resume downloads if possible.
                    // POST PROCESSING
                    '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath, // ffmpeg location
                    '--add-metadata', // Write metadata to the video file
                    '--audio-quality', '0', // value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5)
                    '--fixup', 'detect_or_warn' // Automatically correct known faults of the file.
                ]
                break

            default:
                windowMainApplicationStateSet()
                utils.writeConsoleMsg('error', 'windowMainDownloadContent ::: Unspecified mode. This should never happen.')
                utils.showNoty('error', 'Unexpected download mode. Please report this issue', 0)
                return
            }

            windowMainLogAppend('\n') // Show mode in log
            windowMainLogAppend('### QUEUE STARTED ###', true) // Show mode in log
            windowMainLogAppend('Download mode:\t' + mode, true) // Show mode in log

            // show the selected audio-format
            if (mode === 'audio') {
                utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: AudioFormat is set to: _' + settingAudioFormat + '_')
                windowMainLogAppend('Audio-Format:\t' + settingAudioFormat, true) // Show mode in log
            }

            // if verboseMode is enabled - append the related youtube-dl flags to the parameter array
            var settingVerboseMode = utils.globalObjectGet('enableVerboseMode')
            if (settingVerboseMode === true) {
                utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Verbose Mode is enabled')
                youtubeDlParameter.unshift('--verbose') // prepend: verbose
                youtubeDlParameter.unshift('--print-traffic') // prepend: traffic (header)
            } else {
                utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Verbose Mode is disabled')
            }
            windowMainLogAppend('Verbose mode:\t' + settingVerboseMode, true) // Show verbose mode in log

            // if configured - add custom additional parameter to parameter array - see #88
            var isAdditionalParameterEnabled = utils.globalObjectGet('enableAdditionalParameter')
            if (isAdditionalParameterEnabled === true) {
                var configuredAdditionalParameter = utils.globalObjectGet('additionalYoutubeDlParameter')
                var splittedParameters = configuredAdditionalParameter.split(' ')
                windowMainLogAppend('Added parameters:\t' + splittedParameters, true) // Show mode in log

                if (splittedParameters.length > 0) { // append custom parameter to parameter array
                    for (var j = 0; j < splittedParameters.length; j++) {
                        youtubeDlParameter.push(splittedParameters[j])
                        utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Appending custom parameter: _' + splittedParameters[j] + '_ to the youtube-dl parameter set.')
                    }
                }
            }

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            var url
            for (var i = 0; i < arrayUserUrlsN.length; i++) {
                sentry.countEvent('usageURLsOverall')
                url = utils.fullyDecodeURI(arrayUserUrlsN[i]) // decode url - see #25
                utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Added URL: _' + url + '_ (' + mode + ') with the following parameters: _' + youtubeDlParameter + '_ to the queue.')
                // windowMainLogAppend('Added: \t\t' + url + ' to queue', true) // append url to log

                // Check if url is a playlist (example: https://www.youtube.com/playlist?list=PL53E6B270F5FF0D49 )
                if ((url.includes('playlist')) && (url.includes('list='))) {
                    windowMainLogAppend('Added: \t\t' + url + ' to queue (might be a playlist)', true) // append url to log
                } else {
                    windowMainLogAppend('Added: \t\t' + url + ' to queue', true) // append url to log
                }

                // Download
                //
                // const newDownload = youtubedl.exec(url, youtubeDlParameter, {}, function (error, output) {
                youtubedl.exec(url, youtubeDlParameter, {}, function (error, output) {
                    if (error) {
                        sentry.countEvent('usageURLsFailed')
                        utils.showNoty('error', '<b>Download failed</b><br><br>' + error + '<br><br><small><b><u>Common causes</u></b><br>* youtube-dl does not support this url. Please check the list of extractors<br>* Using old version of media-dupes<br>* Using old version of youtube-dl<br>* Country-/ and/or similar restrictions</small>', 0)
                        utils.writeConsoleMsg('error', 'windowMainDownloadContent ::: Problems downloading an url with the following parameters: _' + youtubeDlParameter + '_. Error: ' + error)
                        windowMainLogAppend('Failed to download a single url', true)
                        arrayUrlsThrowingErrors.push(url) // remember troublesome url (Attention: this is not the actual url . we got a problem here)
                        utils.downloadStatusCheck(arrayUserUrlsN.length, arrayUrlsProcessedSuccessfully.length, arrayUrlsThrowingErrors.length) // check if we are done here
                        throw error
                    }

                    // no error occured for this url - assuming the download finished
                    //
                    arrayUrlsProcessedSuccessfully.push(url)
                    utils.writeConsoleMsg('info', output.join('\n')) // Show processing output for this download task
                    windowMainLogAppend(output.join('\n')) // Show processing output for this download task

                    if (arrayUserUrlsN.length > 1) {
                        utils.showNoty('success', 'Finished 1 download') // inform user
                    }

                    utils.downloadStatusCheck(arrayUserUrlsN.length, arrayUrlsProcessedSuccessfully.length, arrayUrlsThrowingErrors.length) // check if we are done here

                    // FIXME:
                    //
                    // the variable URL contains in both cases the last processed url
                    // thats why we can't show the actual url in the log
                })
            }
        }
    }
}

/**
* @function windowMainDownloadVideo
* @summary Does the actual video download
* @description Does the actual video download (without using youtube-dl.exec)
*/
function windowMainDownloadVideo () {

    // some example urls for tests
    //
    // VIDEO:
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA                      // 11 sec       less then 1 MB
    //                  https://www.youtube.com/watch?v=cmiXteWLNw4                     // 1 hour
    //                  https://www.youtube.com/watch?v=bZ_C-AVo5xA                     // for simulating download errors
    // VIMEO:           https://vimeo.com/315670384                                     // 48 sec       around 1GB
    //                  https://vimeo.com/274478457                                     // 6 sec        around 4MB
    //
    // AUDIO:
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // FIXME:
    // This method now seems to work good for youtube urls
    // BUT not for non-youtube urls
    // media-dupes is currently not using this function

    /*
    var configuredDownloadFolder = utils.globalObjectGet('downloadDir') // What is the target dir
    utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Download target directory is set to: _' + configuredDownloadFolder + '_.')

    if (utils.isDirectoryAvailable(configuredDownloadFolder)) {
        // the default download folder exists

        if (utils.isDirectoryWriteable(configuredDownloadFolder)) {
            // check if it is writeable

            // Prepare UI
            windowMainButtonsStartDisable() // disable the start buttons
            windowMainButtonsOthersDisable() // disables some other buttons
            windowMainLoadingAnimationShow() // start download animation / spinner

            // require some stuff
            const youtubedl = require('youtube-dl')
            const path = require('path')
            const fs = require('fs')

            // ffmpeg
            var ffmpegPath = ffmpeg.ffmpegGetBinaryPath()
            utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Detected bundled ffmpeg at: _' + ffmpegPath + '_.')

            var youtubeDlParameter = ''

            youtubeDlParameter = [
                // OPTIONS
                '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                //'--format=best',
                '--output', path.join(configuredDownloadFolder, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                // FILESYSTEM OPTIONS
                '--restrict-filenames', // Restrict filenames to only ASCII characters, and avoid "&" and spaces in filenames
                '--continue', // Force resume of partially downloaded files. By default, youtube-dl will resume downloads if possible.
                // VERBOSE
                '--print-json',
                // POST PROCESSING
                '--prefer-ffmpeg', '--ffmpeg-location=' + ffmpegPath, // ffmpeg location
                '--add-metadata', // Write metadata to the video file
                ///'--audio-quality', '0', // value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5)
                //'--fixup', 'detect_or_warn' // Automatically correct known faults of the file.
            ]

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrlsN === 'undefined' || !(arrayUserUrlsN instanceof Array)) {
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrlsN_ in function downloadVideo(). Please report this', 0)
                return
            }

            utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Using youtube.dl: _' + youtubeDl.binaryPathGet() + '_.')

            var arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors
            var arrayUrlsProcessedSuccessfully = []
            var downloadUrlTargetName = []

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            var arrayLength = arrayUserUrlsN.length
            windowMainLogAppend('Queue contains ' + arrayLength + ' urls.')
            windowMainLogAppend('Starting to download items from queue ... ')
            for (var i = 0; i < arrayLength; i++) {
                var url = arrayUserUrlsN[i] // get url

                // decode url - see #25
                //
                // url = decodeURI(url);
                url = utils.fullyDecodeURI(url)

                windowMainLogAppend('Starting to process the url: ' + url + ' ...')
                utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Processing URL: _' + url + '_.') // show url
                utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Using the following parameters: _' + youtubeDlParameter + '_.') // show parameters

                const video = youtubedl(url, youtubeDlParameter)

                // Variables for progress of each download
                let size = 0
                let pos = 0
                let progress = 0

                video.on('error', function error(error) {
                    //console.log(error)
                    utils.showNoty('error', '<b>Download failed</b><br><br>' + error + '<br><br><small><b><u>Common causes</u></b><br>* youtube-dl does not support this url. Please check the list of extractors<br>* Country-/ and/or similar restrictions</small>', 0)
                    utils.writeConsoleMsg('error', 'windowMainDownloadContent ::: Problems downloading an url with the following parameters: _' + youtubeDlParameter + '_. Error: ' + error)
                    windowMainLogAppend('Failed to download a single url', true)
                    throw error
                })

                // When the download fetches info - start writing to file
                //
                video.on('info', function (info) {
                    // downloadUrlTargetName[i] = path.join(configuredDownloadFolder, 'Video', info._filename) // define the final name & path
                    downloadUrlTargetName[i] = info._filename // define the final name & path

                    size = info.size // needed to handle the progress later on('data'

                    console.log('filename: ' + info._filename)
                    windowMainLogAppend('Filename: ' + info._filename)

                    console.log('size: ' + info.size)
                    windowMainLogAppend('Size: ' + utils.formatBytes(info.size))

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
                        windowMainLogAppend('Download progress: ' + progress + '%')
                    }
                })

                // If download was already completed and there is nothing more to download.
                //
                video.on('complete', function complete (info) {
                    console.warn('filename: ' + info._filename + ' already downloaded.')
                    windowMainLogAppend('Filename: ' + info._filename + ' already downloaded.')
                })

                // Download finished
                //
                video.on('end', function () {
                    console.log('Finished downloading 1 url')

                    windowMainLogAppend('Finished downloading url')
                    arrayUrlsProcessedSuccessfully.push(url)

                    // if all downloads finished
                    if (arrayUrlsProcessedSuccessfully.length === arrayLength) {
                        utils.showNotification('Finished downloading ' + arrayUrlsProcessedSuccessfully.length + ' url(s). Queue is now empty.')
                        windowMainLogAppend('Finished downloading ' + arrayUrlsProcessedSuccessfully.length + ' url(s). Queue is now empty.', true)
                        windowMainUiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                        windowMainLoadingAnimationHide() // stop download animation / spinner
                        windowMainButtonsOthersEnable() // enable some of the buttons again
                    }
                })
            }
        }
    }
    */
}

/**
* @function windowMainAddUrl
* @summary Handles the add-url-click of the user
* @description Fetches the user provided url, trims it and adds it to an array. Is then calling todoListUpdate()
*/
function windowMainAddUrl () {
    var newUrl = $('#inputNewUrl').val() // get content of input
    newUrl = newUrl.trim() // trim the url to remove blanks

    if (newUrl !== '') {
        var isUrlValid = utils.validURL(newUrl)
        if (isUrlValid) {
            // check if url is already in arrayUserUrlsN - If not add it to table
            var isThisUrlAlreadyPartOfList = arrayUserUrlsN.includes(newUrl)
            if (isThisUrlAlreadyPartOfList === false) {
                utils.writeConsoleMsg('info', 'windowMainAddUrl ::: Adding new url: _' + newUrl + '_.')
                $('#inputNewUrl').val('') // reset input
                inputUrlFieldSetState() // empty = white
                arrayUserUrlsN.push(newUrl) // append to array
                toDoListSingleUrlAdd(newUrl) // #102
            } else {
                utils.showNoty('warning', 'This url is already part of the current todo list')
            }

            // if array size > 0 -> enable start button
            var arrayLength = arrayUserUrlsN.length
            if (arrayLength === 0) {
                utils.globalObjectSet('todoListStateEmpty', true)
            } else {
                windowMainButtonsStartEnable()
                utils.globalObjectSet('todoListStateEmpty', false)
            }
        } else {
            // invalid url
            utils.writeConsoleMsg('warn', 'windowMainAddUrl ::: Detected invalid url: _' + newUrl + '_.')
            utils.showNoty('warning', 'Please insert a valid url (reason: unable to dectect a valid url)')
            $('#inputNewUrl').focus() // focus to input field
            $('#inputNewUrl').select() // select it entirely
        }
    } else {
        // empty
        utils.writeConsoleMsg('warn', 'windowMainAddUrl ::: Detected empty url.')
        utils.showNoty('warning', 'Please insert a valid url (reason: was empty)')
        $('#inputNewUrl').focus() // focus to input field
    }
}

/**
* @function windowMainDistract
* @summary Starts the distraction mode
* @description Sends a request to main.js to start the "hidden" distraction mode (easteregg)
*/
function windowMainDistract () {
    const { ipcRenderer } = require('electron')
    distractEnabler = distractEnabler + 1
    utils.writeConsoleMsg('info', 'distract ::: Enabler is now: ' + distractEnabler)
    if (distractEnabler === 3) {
        sentry.countEvent('usageTetris')
        distractEnabler = 0 // reset the counter
        utils.writeConsoleMsg('info', 'distract ::: Init some distraction')
        ipcRenderer.send('startDistraction') // tell main.js to load distraction UI
    }
}

/**
* @function windowMainDownloadQueueFinished
* @summary Re-setups the main UI post downloads
* @description Gets triggered after the download function finished
*/
function windowMainDownloadQueueFinished () {
    windowMainUiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
    windowMainLoadingAnimationHide() // stop download animation / spinner
    windowMainButtonsOthersEnable() // enable some of the buttons again
    windowMainApplicationStateSet() // reset application state
    windowMainDisablePowerSaveBlocker() // disabled the power save blocker

    utils.globalObjectSet('todoListStateEmpty', true)
}

/**
* @function windowMainUiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function windowMainUiReset () {
    utils.writeConsoleMsg('info', 'windowMainUiReset ::: Starting to reset the UI')

    // call reload of the mainWindow
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('reloadMainWindow')
}

/**
* @function windowMainToDoListRestore
* @summary Restores urls from json files back to the todoList
* @description Reads all existing json files and restores those contains preiosly stored urls.
*/
function windowMainToDoListRestore () {
    const storage = require('electron-json-storage')
    // utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Check if there are urls to restore ...')

    var curUrl
    var restoreCounter = 0

    storage.getAll(function (error, data) {
        if (error) {
            utils.writeConsoleMsg('error', 'windowMaintoDoListRestore ::: Failed to fetch all json files. Error: ' + error)
            throw error
        }
        // console.error(data); // object with all setting files

        // loop over them and find each which starts with todoListEntry_
        for (var key in data) {
            // utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Current config file: _' + key + '_.') // key = name of json file

            // FIXME:
            // Check for better approach:
            // https://eslint.org/docs/rules/no-prototype-builtins

            if (key.startsWith('todoListEntry_')) {
                curUrl = data[key].url
                utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Restoring the url: _' + curUrl + '_ from settings file: _' + key + '_.') // key = name of json file

                arrayUserUrlsN.push(curUrl) // append to array
                toDoListSingleUrlAdd(curUrl)
                restoreCounter = restoreCounter + 1 // update url-restore counter

                // Delete the related file
                storage.remove(key, function (error) {
                    if (error) {
                        utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Failed to delete a url restore file: _' + key + '_.') // key = name of json file
                        throw error
                    }
                })
            }
        }

        // inform the user if something got restored
        if (restoreCounter > 0) {
            utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Finished restored ' + restoreCounter + ' URLs from previous session.')
            utils.showNoty('success', 'Restored <b>' + restoreCounter + '</b> URLs from your last session.')

            // get focus
            const { ipcRenderer } = require('electron')
            ipcRenderer.send('makeWindowUrgent')

            utils.globalObjectSet('todoListStateEmpty', false) // remember that todo list is now not longer empty - see #105
            windowMainButtonsStartEnable() // enable the start buttons
        } else {
            utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Found no urls to restore from previous session.')
        }
    })
}

/**
* @function windowMainToDoListSave
* @summary Saves the current content of the todoList to files
* @description Creates a json file for each url of the todoList. Those files can be restored on next application launch
*/
function windowMainToDoListSave () {
    const storage = require('electron-json-storage')
    utils.writeConsoleMsg('info', 'windowMainToDoListSave ::: Should backup todolist')

    var isToDoListEmpty = utils.globalObjectGet('todoListStateEmpty') // #79
    if (isToDoListEmpty === false) {
        var baseName = 'todoListEntry_'
        var tempName
        var arrayLength = arrayUserUrlsN.length
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrlsN[i]
            tempName = baseName + i
            utils.writeConsoleMsg('info', 'windowMainToDoListSave ::: Trying to save the URL: ' + url + '_ to the file: _' + tempName + '_.')

            storage.set(tempName, { url: url }, function (error) {
                if (error) {
                    utils.writeConsoleMsg('error', 'Error writing json file')
                    throw error
                }
                utils.writeConsoleMsg('info', 'windowMainToDoListSave ::: Written the url _' + url + '_ to the file: _' + tempName + '_.')
            })
        }
        utils.writeConsoleMsg('info', 'windowMainToDoListSave ::: Finished saving todoList content to files.')
    } else {
        utils.writeConsoleMsg('info', 'windowMainToDoListSave ::: todoList was empty - nothing to store.') // #79
    }
}

/**
* @function windowMainUiMakeUrgent
* @summary Tells the main process to mark the application as urgent (blinking in task manager)
* @description Is used to inform the user about an important state-change (all downloads finished). Triggers code in main.js which does the actual work
*/
function windowMainUiMakeUrgent () {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('makeWindowUrgent') // make window urgent after having finished downloading. See #7
}

/**
* @function windowMainEnableAddUrlButton
* @summary Enables the AddUrlButton
* @description Enables the AddUrlButton if it isnt already
*/
function windowMainEnableAddUrlButton () {
    if ($('#buttonAddUrl').is(':disabled')) {
        $('#buttonAddUrl').prop('disabled', false) // enable the add url button
        utils.writeConsoleMsg('info', 'windowMainEnableAddUrlButton ::: Enabled the add URL button.')
    }
}

/**
* @function windowMainDisableAddUrlButton
* @summary Disables the AddUrlButton
* @description Disabled the AddUrlButton if it isnt already
*/
function windowMainDisableAddUrlButton () {
    if ($('#buttonAddUrl').is(':enabled')) {
        $('#buttonAddUrl').prop('disabled', true) // disable the add url button
        utils.writeConsoleMsg('info', 'windowMainDisableAddUrlButton ::: Disabled the add URL button.')
    }
}

/**
* @function inputUrlFieldSetState
* @summary Sets the background color of the url input field based on the given state
* @description Sets the background color of the url input field based on the given state
* @param {String} state - Known states or 'reachable', 'unchecked', 'unreachable' and default/any else
*/
function inputUrlFieldSetState (state) {
    switch (state) {
    case 'valid':
        $('#inputNewUrl').css('background-color', '#90EE90') // green
        windowMainEnableAddUrlButton()
        break
    case 'unchecked':
        $('#inputNewUrl').css('background-color', '#ffe5e5') //  light red
        windowMainDisableAddUrlButton()
        break
    default:
        $('#inputNewUrl').css('background-color', '#FFFFFF') // white
        windowMainDisableAddUrlButton()
        break
    }
}

/**
* @function youtubeSuggest
* @summary Opens a dialog to ask for a user string. Is then using the string to get youtube suggestions for the string
* @description Opens a dialog to ask for a user string. Is then using the string to get youtube suggestions for the string. Results are appended to the log
*/
function youtubeSuggest () {
    const prompt = require('electron-prompt')

    const youtubeSearchUrlBase = 'https://www.youtube.com/results?search_query='
    var url
    var curResult

    prompt({
        title: 'YouTube Search Suggestions',
        label: 'Searchphrase:',
        value: '',
        inputAttrs: {
            type: 'text'
        },
        type: 'input'
    })
        .then((r) => {
            if (r === null) {
                utils.writeConsoleMsg('warn', 'youtubeSuggest ::: User aborted input dialog')
            } else {
                if ((r !== null) && (r !== '')) {
                    windowMainLoadingAnimationShow()
                    utils.writeConsoleMsg('info', 'youtubeSuggest ::: User search string is: _' + r + '_.')
                    windowMainLogAppend('Searching for Youtube suggestions for the searchphase: ' + r, true)

                    var youtubeSuggest = require('youtube-suggest')
                    var assert = require('assert')

                    youtubeSuggest(r).then(function (results) {
                        assert(Array.isArray(results))

                        if (results.length > 0) { // if we got suggestions
                            assert(typeof results[0] === 'string')

                            // Loop over array and append to log
                            for (var i = 0; i < results.length; i++) {
                                curResult = results[i].replace(/ /g, '+') // replace space with +
                                url = youtubeSearchUrlBase + curResult
                                windowMainLogAppend('> ' + results[i] + ' : ' + url)
                            }
                            windowMainLogAppend('Finished searching for Youtube suggestions for the search phrase: ' + r + '\n', true)
                            windowMainLoadingAnimationHide()

                            // ask user if he wants to open all those urls
                            const Noty = require('noty')
                            var n = new Noty(
                                {
                                    theme: 'bootstrap-v4',
                                    layout: 'bottom',
                                    type: 'info',
                                    closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                                    text: 'Do you want to open all suggestions in your browser?',
                                    buttons: [
                                        Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                                            n.close()

                                            // loop over array and call openURL
                                            for (var i = 0; i < results.length; i++) {
                                                curResult = results[i].replace(/ /g, '+') // replace space with +
                                                url = youtubeSearchUrlBase + curResult
                                                utils.openURL(url)
                                            }
                                        },
                                        {
                                            id: 'button1', 'data-status': 'ok'
                                        }),
                                        Noty.button('No', 'btn btn-secondary mediaDupes_btnDefaultWidth float-right', function () {
                                            n.close()
                                        })
                                    ]
                                })

                            n.show() // show the noty dialog
                        } else {
                            utils.showNoty('warning', '<b>Warning:</b> Unable to get suggestions for this search phrase')
                            windowMainLogAppend('Finished searching for Youtube suggestions for the searchphase: ' + r + ' without results', true)
                            windowMainLoadingAnimationHide()
                        }
                    })
                    // end suggest
                } else {
                    utils.showNoty('warning', '<b>Warning:</b> Unable to search suggestions without search string')
                }
            }
        })
        .catch(console.error)
}

/**
* @function windowMainDisablePowerSaveBlocker
* @summary Disable the power save blocker
* @description RDisable the power save blocker
*/
function windowMainDisablePowerSaveBlocker () {
    utils.writeConsoleMsg('info', 'windowMainDisablePowerSaveBlocker ::: Check if there is a PowerSaveBlocker enabled, if so try to disable it.')
    var currentPowerSaveBlockerStatus = utils.globalObjectGet('powerSaveBlockerEnabled')

    if (currentPowerSaveBlockerStatus === true) {
        var currentPowerSaveBlockerId = utils.globalObjectGet('powerSaveBlockerId') // get the id
        if (currentPowerSaveBlockerId !== -1) {
            utils.writeConsoleMsg('info', 'windowMainDisablePowerSaveBlocker ::: Trying to disable the PowerSaveBlocker with the ID _' + currentPowerSaveBlockerId + '_ now, as media-dupes is not longer downloading.')
            const { ipcRenderer } = require('electron')
            ipcRenderer.send('disablePowerSaveBlocker', currentPowerSaveBlockerId)
        }
    } else {
        utils.writeConsoleMsg('info', 'windowMainDisablePowerSaveBlocker ::: PowerSaveBlocker was not enabled, so nothing to do here.')
    }
}

/**
* @function toDoListSingleUrlRemove
* @summary Remove a single url from todo list array
* @description Remove a single url from todo list array
* @param {String} url - The url which should be removed from the todo array
*/
function toDoListSingleUrlRemove (url) {
    const index = arrayUserUrlsN.indexOf(url)
    // console.error(arrayUserUrlsN)
    // console.error(url)
    if (index > -1) {
        arrayUserUrlsN.splice(index, 1)
        utils.writeConsoleMsg('info', 'toDoListSingleUrlRemove ::: Removed the url from the todo list array.')
    } else {
        utils.writeConsoleMsg('error', 'toDoListSingleUrlRemove ::: Unable to remove the url from the todo list array.')
    }

    // check array size (to ensure saving & restoring urls works as expected)
    if (arrayUserUrlsN.length === 0) {
        utils.globalObjectSet('todoListStateEmpty', true)
        windowMainButtonsStartDisable() // disable start buttons
    } else {
        utils.globalObjectSet('todoListStateEmpty', false)
        windowMainButtonsStartEnable() // Enable Start buttons
    }
}

/**
* @function truncateString
* @summary Truncate a string
* @description Truncate a string
* @param {String} str - The string which should be truncated
* @param {number} num - The length after which the string should get truncated
*/
function truncateString (str, num) {
    utils.writeConsoleMsg('info', 'truncateString ::: Truncating _' + str + '_ after ' + num + ' chars.')

    // remove http/https
    str = str.replace('https://', '')
    str = str.replace('http://', '')

    // If the length of str is less than or equal to num just return str--don't truncate it.
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + '...' // Return str truncated with '...' concatenated to the end of str.
}

// #102
/**
* @function toDoListSingleUrlAdd
* @summary Add a single row to the dataTable
* @description Add a single row to the dataTable
* @param {String} url - The url which should be added to the datatable todo list
*/
function toDoListSingleUrlAdd (url) {
    var urlId = utils.generateUrlId(url) // generate an id for this url
    var shortUrl = truncateString(url, 50)

    // add new row to datatable (with the most important informations)
    //
    var table = $('#example').DataTable()
    table.row.add([
        urlId, // ID
        '<div class="spinner-border spinner-border-sm text-secondary" role="status"><span class="sr-only">Loading...</span></div>', // logo
        '<div class="spinner-border spinner-border-sm text-secondary" role="status"><span class="sr-only">Loading...</span></div>', // preview
        '<button type="button" id="play" name="play" class="btn btn-sm btn-outline-secondary" disabled><i class="fas fa-play"></i></button>', // Play
        shortUrl, // url
        url,
        '', // state
        '<button type="button" id="delete" name="delete" class="btn btn-sm btn-outline-danger disabled"><i class="fas fa-trash-alt"></i></button>' // remove
    ]).draw(false)

    utils.writeConsoleMsg('info', 'toDoListSingleUrlAdd ::: Added the url _' + url + '_ to the todo-list (dataTable).')

    // FIXME
    //startMetaScraper(url)


    //  The following code is now moved to seperate function: startMetaScraper()
    // Now try to fetch meta informations about the url using: metascraper
    //
    const metascraper = require('metascraper')([
        require('metascraper-video')(),
        require('metascraper-description')(),
        require('metascraper-image')(),
        require('metascraper-audio')(),
        require('metascraper-logo')(),
        require('metascraper-logo-favicon')(),
        require('metascraper-media-provider')(),
        require('metascraper-soundcloud')(),
        require('metascraper-title')(),
        require('metascraper-youtube')()
    ])

    var urlLogo
    var urlImage
    var urlDescription
    var urlTitle
    var urlAudio

    const got = require('got')

    const targetUrl = url

    ;(async () => {
        const { body: html, url } = await got(targetUrl)
        const metadata = await metascraper({ html, url })

        // console.log(metadata) // show all detected metadata

        urlLogo = metadata.logo
        urlImage = metadata.image
        urlDescription = metadata.description
        urlTitle = metadata.title
        urlAudio = metadata.audio

        // find the new datatable record
        //
        var indexes = table.rows().eq(0).filter(function (rowIdx) {
            return table.cell(rowIdx, 0).data() === urlId
        })
        // console.error(indexes)
        // console.error(indexes[0])

        // update the previously generated new row
        //
        // logo
        if (urlLogo == null) {
            urlLogo = 'img/dummy/dummy.png'
        }
        if (urlTitle == null) {
            urlTitle = 'No url title'
        }
        table.cell({ row: indexes[0], column: 1 }).data('<img class="zoomSmall" src="' + urlLogo + '" width="30" title="' + urlTitle + '" onclick=utils.openURL("' + url + '");>')

        // preview
        //
        if (urlImage == null) {
            urlImage = 'img/dummy/dummy.png'
        }
        if (urlDescription == null) {
            urlDescription = 'No url description available'
        }
        table.cell({ row: indexes[0], column: 2 }).data('<img class="zoomSmall" src="' + urlImage + '" width="30" title="' + urlDescription + '"  onclick=ui.imagePreviewModalShow("' + urlImage + '"); >')

        // play button
        table.cell({ row: indexes[0], column: 3 }).data('<button type="button" id="play" onclick=ui.playAudio("' + urlAudio + '"); name="play" class="btn btn-sm btn-outline-secondary"><i class="fas fa-play"></i></button>')

        // button delete: enable the delete button (to prevent that the row gets removed while mediascrapper is fetching data
        table.cell({ row: indexes[0], column: 7 }).data('<button type="button" id="delete" name="delete" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash-alt"></i></button>')
    })()


}



/**
* @function startMetaScraper
* @summary Starts metascraper for a single url
* @description Starts metascraper for a single url
* @param {String} url - The url which to the image
*/
function startMetaScraper (url) {
    utils.writeConsoleMsg('info', 'startMetaScraper ::: Start mediascraper for the url _' + url + '_.')

    var table = $('#example').DataTable()

    const metascraper = require('metascraper')([
        require('metascraper-video')(),
        require('metascraper-description')(),
        require('metascraper-image')(),
        require('metascraper-audio')(),
        require('metascraper-logo')(),
        require('metascraper-logo-favicon')(),
        require('metascraper-media-provider')(),
        require('metascraper-soundcloud')(),
        require('metascraper-title')(),
        require('metascraper-youtube')()
    ])

    var urlLogo
    var urlImage
    var urlDescription
    var urlTitle
    var urlAudio

    const got = require('got')

    const targetUrl = url

    ;(async () => {
        const { body: html, url } = await got(targetUrl)
        const metadata = await metascraper({ html, url })

        console.log(metadata) // show all detected metadata

        urlLogo = metadata.logo
        urlImage = metadata.image
        urlDescription = metadata.description
        urlTitle = metadata.title
        urlAudio = metadata.audio

        // find the new datatable record
        //
        var indexes = table.rows().eq(0).filter(function (rowIdx) {
            return table.cell(rowIdx, 0).data() === urlId
        })
        // console.error(indexes)
        // console.error(indexes[0])

        // update the previously generated new row
        //
        // logo
        if (urlLogo == null) {
            urlLogo = 'img/dummy/dummy.png'
        }
        if (urlTitle == null) {
            urlTitle = 'No url title'
        }
        table.cell({ row: indexes[0], column: 1 }).data('<img class="zoomSmall" src="' + urlLogo + '" width="30" title="' + urlTitle + '" onclick=utils.openURL("' + url + '");>')

        // preview
        //
        if (urlImage == null) {
            urlImage = 'img/dummy/dummy.png'
        }
        if (urlDescription == null) {
            urlDescription = 'No url description available'
        }
        table.cell({ row: indexes[0], column: 2 }).data('<img class="zoomSmall" src="' + urlImage + '" width="30" title="' + urlDescription + '"  onclick=ui.imagePreviewModalShow("' + urlImage + '"); >')

        // play button
        table.cell({ row: indexes[0], column: 3 }).data('<button type="button" id="play" onclick=ui.playAudio("' + urlAudio + '"); name="play" class="btn btn-sm btn-outline-secondary"><i class="fas fa-play"></i></button>')

        // button delete: enable the delete button (to prevent that the row gets removed while mediascrapper is fetching data
        table.cell({ row: indexes[0], column: 7 }).data('<button type="button" id="delete" name="delete" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash-alt"></i></button>')
    })()
}




/**
* @function imagePreviewModalShow
* @summary Shows the preview modal dialog
* @description Shows the preview modal dialog which shows a big version of the image provided by the selected url
* @param {String} url - The url which to the image
*/
function imagePreviewModalShow (url) {
    utils.writeConsoleMsg('info', 'imagePreviewModalShow ::: Trying to show the preview image from _' + url + '_.')
    $('#imagePreview').attr('src', url) // set the image src
    $('#myModalImagePreview').modal('show') // show the modal
}

/**
* @function playAudio
* @summary Pre-listening to the audio stream
* @description  Plays 5 sec of audio as pre-listening
*/
function playAudio (url) {
    utils.writeConsoleMsg('info', 'playAudio ::: Trying to play 5 sec audio from source: _' + url + '_.')

    var a = new Audio(url)
    a.play() // start to play
    setTimeout(function () { // stop it again after 5 seconds
        a.pause()
    }, 5000)
}

/**
* @function dataTablesReset
* @summary Reset the datatable
* @description  Reset the datatable
*/
function dataTablesReset () {
    var table = $('#example').DataTable()

    table
        .clear()
        .draw()

    arrayUserUrlsN = [] // reset the array
}

// ----------------------------------------------------------------------------
// EXPORT THE MODULE FUNCTIONS
// ----------------------------------------------------------------------------
//
module.exports.windowMainApplicationStateSet = windowMainApplicationStateSet
module.exports.windowMainLoadingAnimationShow = windowMainLoadingAnimationShow
module.exports.windowMainLoadingAnimationHide = windowMainLoadingAnimationHide
module.exports.windowMainButtonsOthersEnable = windowMainButtonsOthersEnable
module.exports.windowMainButtonsOthersDisable = windowMainButtonsOthersDisable
module.exports.windowMainButtonsStartEnable = windowMainButtonsStartEnable
module.exports.windowMainButtonsStartDisable = windowMainButtonsStartDisable
module.exports.windowMainBlurSet = windowMainBlurSet
module.exports.windowMainIntroShow = windowMainIntroShow
module.exports.windowMainLogAppend = windowMainLogAppend
module.exports.windowMainLogReset = windowMainLogReset
module.exports.windowMainLogScrollToEnd = windowMainLogScrollToEnd
module.exports.windowMainResetAskUser = windowMainResetAskUser
module.exports.windowMainOpenDownloadFolder = windowMainOpenDownloadFolder
module.exports.windowMainSettingsUiLoad = windowMainSettingsUiLoad
module.exports.windowMainDownloadContent = windowMainDownloadContent
module.exports.windowMainAddUrl = windowMainAddUrl
module.exports.windowMainDistract = windowMainDistract
module.exports.windowMainDownloadQueueFinished = windowMainDownloadQueueFinished
module.exports.windowMainUiReset = windowMainUiReset
module.exports.windowMainToDoListRestore = windowMainToDoListRestore
module.exports.windowMainToDoListSave = windowMainToDoListSave
module.exports.windowMainUiMakeUrgent = windowMainUiMakeUrgent
module.exports.windowMainDownloadVideo = windowMainDownloadVideo
module.exports.windowMainEnableAddUrlButton = windowMainEnableAddUrlButton
module.exports.windowMainDisableAddUrlButton = windowMainDisableAddUrlButton
module.exports.inputUrlFieldSetState = inputUrlFieldSetState
module.exports.youtubeSuggest = youtubeSuggest
module.exports.windowMainDisablePowerSaveBlocker = windowMainDisablePowerSaveBlocker
module.exports.toDoListSingleUrlRemove = toDoListSingleUrlRemove // #102
module.exports.toDoListSingleUrlAdd = toDoListSingleUrlAdd // #102
module.exports.startMetaScraper = startMetaScraper
module.exports.imagePreviewModalShow = imagePreviewModalShow
module.exports.playAudio = playAudio
module.exports.dataTablesReset = dataTablesReset
module.exports.truncateString = truncateString
