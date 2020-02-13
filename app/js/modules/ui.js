/**
 * @file Contains all ui functions
 * @author yafp
 * @module ui
 */
'use strict'

const utils = require('./utils.js')
const ffmpeg = require('./ffmpeg.js')
const youtubeDl = require('./youtubeDl.js')

var distractEnabler = 0
var arrayUserUrls = [] // contains the urls which should be downloaded

var supportedDomains = []

/**
* @function windowMainApplicationStateSet
* @summary Updates the application state information
* @description Updates the applicationState in globalObject. Updates the application state displayed in the UI. Starts or stops the spinner depending on the state
* @param {string} [newState] - String which defines the new state of the application
*/

function windowMainApplicationStateSet (newState = 'idle') {
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
        utils.writeConsoleMsg('info', 'windowMainLoadingAnimationShow ::: Showing spinner')
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
        utils.writeConsoleMsg('info', 'windowMainLoadingAnimationHide ::: Hiding spinner')
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
    $('#buttonAddUrl').prop('disabled', false) // add url
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
    $('#buttonAddUrl').prop('disabled', true) // add url
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
        $('#buttonStartVideoExec').prop('disabled', false)
        $('#buttonStartVideo').prop('disabled', false)
        $('#buttonStartAudioExec').prop('disabled', false)
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
        $('#buttonStartVideoExec').prop('disabled', true)
        $('#buttonStartVideo').prop('disabled', true)
        $('#buttonStartAudioExec').prop('disabled', true)
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
        $('#mainContainer').css('filter', 'blur(2px)') // blur
        $('#mainContainer').css('pointer-events', 'none') // disable click events
        utils.writeConsoleMsg('info', 'windowMainBlurSet ::: Enabled blur effect')
    } else {
        $('#mainContainer').css('filter', 'blur(0px)')
        $('#mainContainer').css('pointer-events', 'auto')
        utils.writeConsoleMsg('info', 'windowMainBlurSet ::: Disabled blur effect')
    }
}

/**
* @function windowMainIntroShow
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function windowMainIntroShow () {
    utils.writeConsoleMsg('info', 'windowMainIntroShow ::: User wants to see the intro. Here you go!')
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
* @function windowMainShowSupportedExtractors
* @summary Shows a list of all currently supported extractors of youtube-dl
* @description Shows a list of all currently supported extractors of youtube-dl
*/
function windowMainShowSupportedExtractors () {
    windowMainApplicationStateSet('Loading extractors list')

    utils.writeConsoleMsg('info', 'windowMainShowSupportedExtractors ::: Loading list of all supported extractors...')
    windowMainLogAppend('Fetching list of supported youtube-dl extractors', true)

    windowMainButtonsOthersDisable()

    const youtubedl = require('youtube-dl')
    youtubedl.getExtractors(true, function (error, list) {
        if (error) {
            utils.showNoty('error', 'Unable to get youtube-dl extractor list.', 0)
            utils.writeConsoleMsg('error', 'windowMainShowSupportedExtractors ::: Unable to get youtube-dl extractors. Error: _' + error + '_.')
            throw error
        }

        utils.writeConsoleMsg('info', 'windowMainShowSupportedExtractors ::: Found ' + list.length + ' extractors')

        // show all extractors in console
        for (let i = 0; i < list.length; i++) {
            // utils.writeConsoleMsg('info', 'showSupportedExtractors ::: ' + list[i])
        }

        // show all extractors in Ui log
        // document.getElementById('textareaLogOutput').value = list.join('\n')
        windowMainLogAppend(list.join('\n'))

        utils.writeConsoleMsg('info', 'windowMainShowSupportedExtractors ::: Found ' + list.length + ' extractors') // summary in console.
        windowMainLogAppend('Found ' + list.length + ' supported youtube-dl extractors', true)
        windowMainButtonsOthersEnable()
        windowMainApplicationStateSet()
    })
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
        // the default download folder exists

        // check if it is writeable
        if (utils.isDirectoryWriteable(configuredDownloadFolder)) {
            // Prepare UI
            // TODO: should set cursor position to 0/1
            windowMainButtonsStartDisable() // disable the start buttons
            windowMainButtonsOthersDisable() // disables some other buttons
            windowMainApplicationStateSet('Download in progress')

            // require some stuff
            const youtubedl = require('youtube-dl')
            const { remote } = require('electron')
            const path = require('path')

            // youtube-dl
            utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Using youtube.dl from: _' + youtubeDl.youtubeDlBinaryPathGet() + '_.')

            // ffmpeg
            var ffmpegPath = ffmpeg.ffmpegGetBinaryPath()
            utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Detected bundled ffmpeg at: _' + ffmpegPath + '_.')

            var arrayUrlsProcessedSuccessfully = [] // prepare array for urls which got successfully downloaded
            var arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
                windowMainApplicationStateSet()
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadContent(). Please report this', 0)
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
                    '--output', path.join(configuredDownloadFolder, 'Audio', '%(artist)s-%(album)s-%(title)s-%(id)s.%(ext)s'), // output path
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

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            for (var i = 0; i < arrayUserUrls.length; i++) {
                var url = arrayUserUrls[i] // get url
                url = utils.fullyDecodeURI(url) // decode url - see #25
                utils.writeConsoleMsg('info', 'windowMainDownloadContent ::: Added URL: _' + url + '_ (' + mode + ') with the following parameters: _' + youtubeDlParameter + '_ to the queue.')
                windowMainLogAppend('Added: \t\t' + url + ' to queue', true) // append url to log

                // Download
                //
                const newDownload = youtubedl.exec(url, youtubeDlParameter, {}, function (error, output) {
                    if (error) {
                        utils.showNoty('error', '<b>Download failed</b><br><br>' + error + '<br><br><small><b><u>Common causes</u></b><br>* youtube-dl does not support this url. Please check the list of extractors<br>* Country-/ and/or similar restrictions</small>', 0)
                        utils.writeConsoleMsg('error', 'windowMainDownloadContent ::: Problems downloading an url with the following parameters: _' + youtubeDlParameter + '_. Error: ' + error)
                        windowMainLogAppend('Failed to download a single url', true)
                        arrayUrlsThrowingErrors.push(url) // remember troublesome url (Attention: this is not the actual url . we got a problem here)
                        utils.downloadStatusCheck(arrayUserUrls.length, arrayUrlsProcessedSuccessfully.length, arrayUrlsThrowingErrors.length) // check if we are done here
                        throw error
                    }

                    // no error occured for this url - assuming the download finished
                    //
                    arrayUrlsProcessedSuccessfully.push(url)
                    utils.writeConsoleMsg('info', output.join('\n')) // Show processing output for this download task
                    windowMainLogAppend(output.join('\n')) // Show processing output for this download task
                    utils.showNoty('success', 'Finished 1 download') // inform user
                    utils.downloadStatusCheck(arrayUserUrls.length, arrayUrlsProcessedSuccessfully.length, arrayUrlsThrowingErrors.length) // check if we are done here

                    // FIXME:
                    //
                    // the variable URL contains in both cases the last processed url
                    // thats why we can't show the actual url in the log
                    //
                    // windowMainLogAppend('\n\n\nSuccessful\n' + arrayUrlsProcessedSuccessfully)
                    // windowMainLogAppend('\n\n\nFailed\n' + arrayUrlsThrowingErrors)
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
            /*
            youtubeDlParameter = [
                // OPTIONS
                '--ignore-errors',
                '--format', 'best',
                '--output', path.join(configuredDownloadFolder, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                // POST PROCESSING
                '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath, // ffmpeg location
                '--add-metadata',
                '--audio-quality', '0', // value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5)
                '--fixup', 'detect_or_warn'
            ]
            */

            var settingAudioFormat = 'mp3'
            youtubeDlParameter = [
                // OPTIONS
                '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                '--format', 'bestaudio', // FIXME: https://github.com/przemyslawpluta/node-youtube-dl/issues/188
                '--format', 'best',
                '--output', path.join(configuredDownloadFolder, 'Video', '%(artist)s-%(album)s-%(title)s-%(id)s.%(ext)s'), // output path
                // POST PROCESSING
                '--prefer-ffmpeg', '--ffmpeg-location', ffmpegPath, // ffmpeg location
                '--add-metadata', // since 0.5.0
                '--audio-format', settingAudioFormat, //  Specify audio format: "best", "aac", "flac", "mp3", "m4a", "opus", "vorbis", or "wav"; "best" by default; No effect without -x
                '--audio-quality', '0', // value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5),
                '--fixup', 'detect_or_warn',

                '--print-json'
            ]

            // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
            if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
                utils.showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadVideo(). Please report this', 0)
                return
            }

            utils.writeConsoleMsg('info', 'windowMainDownloadVideo ::: Using youtube.dl: _' + youtubeDl.youtubeDlBinaryPathGet() + '_.')

            var arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors
            var arrayUrlsProcessedSuccessfully = []
            var downloadUrlTargetName = []

            // assuming we got an array with urls to process
            // for each item of the array ... try to start a download-process
            var arrayLength = arrayUserUrls.length
            windowMainLogAppend('Queue contains ' + arrayLength + ' urls.')
            windowMainLogAppend('Starting to download items from queue ... ')
            for (var i = 0; i < arrayLength; i++) {
                var url = arrayUserUrls[i] // get url

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
                /*
                video.on('complete', function complete (info) {
                    console.warn('filename: ' + info._filename + ' already downloaded.')
                    windowMainLogAppend('Filename: ' + info._filename + ' already downloaded.')
                })
                */

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
                        windowMainToDoListReset()
                        windowMainUiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                        windowMainLoadingAnimationHide() // stop download animation / spinner
                        windowMainButtonsOthersEnable() // enable some of the buttons again
                    }
                })
            }
        }
    }
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
            utils.writeConsoleMsg('info', 'windowMainAddUrl ::: Adding new url: _' + newUrl + '_.')
            arrayUserUrls.push(newUrl) // append to array
            windowMainToDoListUpdate() // update todo list
            $('#inputNewUrl').val('') // reset input
            inputUrlFieldSetState() // empty = white
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
    windowMainToDoListReset()
    windowMainUiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
    windowMainLoadingAnimationHide() // stop download animation / spinner
    windowMainButtonsOthersEnable() // enable some of the buttons again
    windowMainApplicationStateSet()

    utils.globalObjectSet('todoListStateEmpty', true)
}

/**
* @function windowMainUiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function windowMainUiReset () {
    utils.writeConsoleMsg('info', 'windowMainUiReset ::: Starting to reset the UI')
    $('#inputNewUrl').val('') // empty the URL input field
    inputUrlFieldSetState() // empty = white
    windowMainButtonsStartDisable() // disable start button
    windowMainButtonsOthersEnable() // ensure some buttons are enabled
    windowMainToDoListReset() // empty todo-list textarea
    windowMainLogReset() // empty log textarea
    windowMainApplicationStateSet() // reset application state
    utils.globalObjectSet('todoListStateEmpty', true) // store that the todolist is now empty
    utils.writeConsoleMsg('info', 'windowMainUiReset ::: Finished resetting the UI')
}

/**
* @function windowMainToDoListReset
* @summary Resets the todo-list textarea
* @description Resets the todo-list textarea
*/
function windowMainToDoListReset () {
    arrayUserUrls = [] // reset the array
    document.getElementById('textareaTodoList').value = '' // reset todo-list in UI
    utils.writeConsoleMsg('info', 'windowMainToDoListReset ::: Did reset the todolist-textarea')
}

/**
* @function windowMainToDoListUpdate
* @summary Updates the todo-list after a user added an url
* @description Is called by addUrl(). Makes the url array unique to remove duplicated entries. Updates the UI todo item. Calls windowMainButtonsStartEnable() if array is > 0
*/
function windowMainToDoListUpdate () {
    // check for duplicates
    var alreadySeen = []
    arrayUserUrls.forEach(function (str) {
        if (alreadySeen[str]) {
            utils.writeConsoleMsg('warn', 'windowMainToDoListUpdate ::: Duplicate url found: _' + str + '_.')
            windowMainLogAppend('Warning:\tFound and removed url duplicate\n\t\t' + str)
        } else {
            alreadySeen[str] = true
        }
    })

    arrayUserUrls = $.unique(arrayUserUrls) // remove duplicate entries in array

    // write the now unique url array content to textarea
    var textarea = document.getElementById('textareaTodoList')
    textarea.value = arrayUserUrls.join('\n')

    // if array size > 0 -> enable start button
    var arrayLength = arrayUserUrls.length
    if (arrayLength === 0) {
        utils.globalObjectSet('todoListStateEmpty', true)
    } else {
        windowMainButtonsStartEnable()
        utils.globalObjectSet('todoListStateEmpty', false)
    }

    utils.writeConsoleMsg('info', 'windowMainToDoListUpdate ::: Updated the todo-list')
}

/**
* @function windowMainToDoListRestore
* @summary Restores urls from json files back to the todoList
* @description Reads all existing json files and restores those contains preiosly stored urls.
*/
function windowMainToDoListRestore () {
    const storage = require('electron-json-storage')
    utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Check if there are urls to restore ...')

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

                arrayUserUrls.push(curUrl) // append to array
                windowMainToDoListUpdate() // update todo list
                restoreCounter = restoreCounter + 1 // update url-restore counter

                // Delete the related file
                storage.remove(key, function (error) {
                    if (error) {
                        utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Failed to delete a url restore file: _' + key + '_.') // key = name of json file
                        throw error
                    }
                })
            }

            // console.error(restoreCounter)
        }

        // inform the user if something got restored
        if (restoreCounter > 0) {
            // windowMainToDoListReset() // empty the todolist
            windowMainToDoListUpdate() // update todo list

            utils.writeConsoleMsg('info', 'windowMaintoDoListRestore ::: Restored ' + restoreCounter + ' URLs from previous session.')
            utils.showNoty('success', 'Restored <b>' + restoreCounter + '</b> URLs from your last session.')

            // get focus
            const { ipcRenderer } = require('electron')
            ipcRenderer.send('makeWindowUrgent')
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
        var arrayLength = arrayUserUrls.length
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrls[i]
            tempName = baseName + i
            utils.writeConsoleMsg('info', 'windowMainToDoListSave :::  Trying to save the URL: ' + url + '_ to the file: _' + tempName + '_.')

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
* @function inputUrlFieldSetState
* @summary Sets the background color of the url input field based on the given state
* @description Sets the background color of the url input field based on the given state
* @param {String} state - Known states or 'reachable', 'unchecked', 'unreachable' and default/any else
*/
function inputUrlFieldSetState (state) {
    switch (state) {
    case 'reachable':
        $('#inputNewUrl').css('background-color', '#90EE90') // green
        break
    case 'unchecked':
        $('#inputNewUrl').css('background-color', '#F0E68C') //  yellow
        break
    case 'unreachable':
        $('#inputNewUrl').css('background-color', '#FA8072') // red
        break
    default:
        $('#inputNewUrl').css('background-color', '#FFFFFF') // white
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
        title: 'Prompt example',
        label: 'URL:',
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
                    utils.writeConsoleMsg('warn', 'youtubeSuggest ::: User search string is: _' + r + '_.')
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
                            windowMainLogAppend('Finished searching for Youtube suggestions for the search phase: ' + r + '\n', true)
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

// Exporting the module functions
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
module.exports.windowMainShowSupportedExtractors = windowMainShowSupportedExtractors
module.exports.windowMainSettingsUiLoad = windowMainSettingsUiLoad
module.exports.windowMainDownloadContent = windowMainDownloadContent
module.exports.windowMainAddUrl = windowMainAddUrl
module.exports.windowMainDistract = windowMainDistract
module.exports.windowMainDownloadQueueFinished = windowMainDownloadQueueFinished
module.exports.windowMainUiReset = windowMainUiReset
module.exports.windowMainToDoListReset = windowMainToDoListReset
module.exports.windowMainToDoListUpdate = windowMainToDoListUpdate
module.exports.windowMainToDoListRestore = windowMainToDoListRestore
module.exports.windowMainToDoListSave = windowMainToDoListSave
module.exports.windowMainUiMakeUrgent = windowMainUiMakeUrgent
module.exports.windowMainDownloadVideo = windowMainDownloadVideo
module.exports.inputUrlFieldSetState = inputUrlFieldSetState
module.exports.youtubeSuggest = youtubeSuggest
