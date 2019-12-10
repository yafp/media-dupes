// ----------------------------------------------------------------------------
// ERROR HANDLING
// ----------------------------------------------------------------------------
require('./js/crashReporting.js')
// myUndefinedFunctionFromRenderer();

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------
var arrayUserUrls = []

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
        console.log('Notification clicked')
    }
}

/**
* @name loadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner
*/
function loadingAnimationShow () {
    $('#md_spinner').attr('hidden', false)
}

/**
* @name loadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner
*/
function loadingAnimationHide () {
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
    console.log("checkForDeps ::: Searching youtube-dl ...")
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
        // console.log( ffmpeg)
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

    // empty todo-list textarea
    toDoListReset()

    // empty log textarea
    uiLogReset()

    // animation / spinner hide
    loadingAnimationHide()

    console.log('uiReset ::: Finished resetting the UI')
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

    if (newUrl !== '') {
        var isUrlValid = validURL(newUrl)
        if (isUrlValid) {
            console.log('addURL ::: Adding new url: ' + newUrl)

            // append to array
            arrayUserUrls.push(newUrl)

            // update todo list
            updateToDoList()

            // reset input
            $('#inputNewUrl').val('')
        } else {
            console.error('addURL ::: Detected invalid url: ' + newUrl)
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

    // TODO:
    // change background of single lines odd/even

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

    console.log('startButtonsEnable ::: Did disable both start buttons')
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
* @name downloadContent
* @summary Does the actual download
* @description Does the actual download
*/
function downloadContent (mode) {
    console.log('downloadContent ::: Start with mode set to: _' + mode + '_.')

    // example urls
    //
    // url = 'http://www.youtube.com/watch?v=90AiXO1pAiA'
    // url = 'https://vimeo.com/120828152'
    // url = 'https://soundcloud.com/jakarta-records/suff-daddy-feat-ill-camille-jlamotta-magic-taken-from-seasons-in-jakarta'

    // Prepare UI
    //
    uiLogReset() // start new job - clean up loag before
    startButtonsDisable() // disable the start buttons
    loadingAnimationShow() // start download animation / spinner

    // require some stuff
    const youtubedl = require('youtube-dl')
    const { remote } = require('electron')
    const path = require('path')

    var targetPath = remote.getGlobal('sharedObj').prop1
    var youtubeDlParameter = ''

    // Define the youtube-dl parameters depending on the mode (audio vs video)
    switch (mode) {
    case 'audio':
        var ffmpeg = require('ffmpeg-static-electron')
        console.log('downloadContent ::: Detected bundled ffmpeg at: _' + ffmpeg.path + '_.')

        // youtubeDlParameter = ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s')]
        youtubeDlParameter = ['--format', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '--embed-thumbnail', '--ignore-errors', '--output', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s'), '--prefer-ffmpeg', '--ffmpeg-location', ffmpeg.path]
        break

    case 'video':
        youtubeDlParameter = ['--format', 'best', '--output', '--add-metadata', '--ignore-errors', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s')]
        break

    default:
        showNoty('error', 'Unexpected download case. Please report this issue')
        return
    }


    // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
    if (typeof arrayUserUrls == "undefined" || !(arrayUserUrls instanceof Array)) {
        showNoty('error', 'Unexpected issue in function downloadContent. Please report this')
        return
    }

    // assuming we got an array 
    // for each item of the array
    //
    var arrayLength = arrayUserUrls.length
    for (var i = 0; i < arrayLength; i++) {
        var url = arrayUserUrls[i]

        console.log('downloadContent ::: Processing URL: _' + url + '_.')
        console.log('downloadContent ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.');
        console.log('downloadContent ::: Using the following parameters: _' + youtubeDlParameter + '_.')

        uiLogAppend('Processing: ' + url)

        const video = youtubedl.exec(url, youtubeDlParameter, {}, function (err, output) {

            

            if (err) {
                showNoty('error', 'Downloading <b>' + url + '</b> failed with error: ' + err)
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
                toDoListReset()

                // make window urgent after having finished downloading. See #7
                const { ipcRenderer } = require('electron')
                ipcRenderer.send('makeWindowUrgent')

                loadingAnimationHide() // start download animation / spinner

                // scroll log textarea to the end
                $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight)
            }
        })
    }

    console.log('downloadContent ::: All download processes are now started')
}

/**
* @name showSupportedExtractors
* @summary Updates the todo-list after a user added an url
* @description Updates the todo-list after a user added an url
*/
function showSupportedExtractors () {
    console.log('showSupportedExtractors ::: Loading list of all supported extractors...')

    showNoty('info', 'Loading list of all supported platforms. This might take a while ....')

    const youtubedl = require('youtube-dl')

    youtubedl.getExtractors(true, function (err, list) {
        console.log('Found ' + list.length + ' extractors')

        for (let i = 0; i < list.length; i++) {
            console.log(list[i])
        }

        // show in textareaLogOutput
        textareaLogOutput.value = list.join('\n')
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
        })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
    var url = 'https://github.com/yafp/media-dupes/releases'
    console.log('openReleasesOverview ::: Opening _' + url + '_ to show available releases')
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
    console.log('openURL ::: Trying to open the url: ' + url)
    shell.openExternal(url)
}

/**
* @name openUserDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function openUserDownloadFolder () {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('openUserDownloadFolder')
}


function startIntro() {
    console.log("startIntro ::: User wants to see the intro. Here you go!")
    introJs().start()
}


// Call from main.js ::: startSearchUpdates
//
require('electron').ipcRenderer.on('startSearchUpdates', function () {
    searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})
