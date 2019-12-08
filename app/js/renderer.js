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
* @name showNoty
* @summary Shows a noty notification
* @description Creates a notification using the noty framework
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

function showNotifcation (title = 'media-dupes', message) {
  const myNotification = new Notification(title, {
    body: message
  })

  myNotification.onclick = () => {
    console.log('Notification clicked')
  }
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

/**
* @name resetUI
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function resetUI () {
  // a = []
  // clean_a = []
  arrayUserUrls = []

  // empty input file
  $('#inputNewUrl').val('')

  // disable add button
  // $('#buttonAddUrl').prop('disabled', true)

  // empty textarea
  $('#textareaTodoList').val('')

  // disable start button
  $('#buttonStartVideo').prop('disabled', true)
  $('#buttonStartAudio').prop('disabled', true)

  // empty log textarea
  $('#textareaLogOutput').val('')

  console.log('resetUI ::: finished resetting the UI')
}

function validateUserInput () {
  // get content of input
  var newUrl = $('#inputNewUrl').val()

  console.log('Validating user input: ' + newUrl)

  isUrlValid = validURL(newUrl)
  if (isUrlValid) {
    console.log('VALID')
  } else {
    console.error('invalid')
  }
}

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
    isUrlValid = validURL(newUrl)
    if (isUrlValid) {
      console.log('Adding new url: ' + newUrl)

      // append to array
      arrayUserUrls.push(newUrl)

      // update todo list
      updateToDoList()

      // reset input
      $('#inputNewUrl').val('')

      // disable button
      // $('#buttonAddUrl').prop('disabled', true)
    } else {
      console.error('invalid')
      showNoty('error', 'Please insert a valid url')
    }
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
  // a = clean_a

  // write array content to textarea
  var textarea = document.getElementById('textareaTodoList')
  textarea.value = arrayUserUrls.join('\n')

  // if array size > 0
  // enable start button
  var arrayLength = arrayUserUrls.length
  if (arrayLength > 0) {
    $('#buttonStartVideo').prop('disabled', false)
    $('#buttonStartAudio').prop('disabled', false)
  }

  console.log('updateToDoList ::: Added new url to todo-list')
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
* @name resetToDoList
* @summary Resets the todo-list textarea
* @description Resets the todo-list textarea
*/
function resetToDoList () {
  textareaTodoList.value = ''
  console.log('resetToDoList ::: Did reset the todolist textarea')
}

/**
* @name resetUiLog
* @summary Resetts the log textarea
* @description Resetts the log textarea
*/
function resetUiLog () {
  textareaLogOutput.value = ''
  console.log('resetUiLog ::: Did reset the log textarea')
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
* @name downloadVideo
* @summary Download vido
* @description Download vido
*/
function downloadVideo () {
  console.log('downloadVideo ::: Start')

  resetUiLog()

  const youtubedl = require('youtube-dl')
  const { remote } = require('electron')

  var targetPath = remote.getGlobal('sharedObj').prop1

  // url = "http://www.youtube.com/watch?v=90AiXO1pAiA";
  // url = "https://vimeo.com/120828152"
  // url = "https://soundcloud.com/jakarta-records/suff-daddy-feat-ill-camille-jlamotta-magic-taken-from-seasons-in-jakarta"

  // for each item of the array
  var arrayLength = arrayUserUrls.length
  for (var i = 0; i < arrayLength; i++) {
    var url = arrayUserUrls[i]
    console.log('downloadVideo ::: Processing URL: ' + url)
    uiLogAppend('Processing: ' + url)

    console.log('downloadVideo ::: Target is set to: ' + targetPath)

    youtubedl.exec(url, ['-o', targetPath + '/%(title)s-%(id)s.%(ext)s'], {}, function (err, output) {
      if (err) throw err

      console.log(output.join('\n'))
      uiLogAppend(output.join('\n'))

      console.log('downloadVideo ::: Finished downloading ' + url)
      uiLogAppend('Finished downloading: ' + url)
      showNoty('success', 'Finished downloading ' + url)

      // Final notification
      if (i === arrayLength) {
        showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
        resetToDoList()
      }
    })
  }

  // showNotifcation("","Finished downloading " + i + " videos.")

  console.log('downloadVideo ::: End')
}

/**
* @name downloadAudio
* @summary Download audio
* @description Download audio
*/
function downloadAudio () {
  console.log('downloadAudio ::: Start')

  resetUiLog()

  const youtubedl = require('youtube-dl')
  const { remote } = require('electron')

  var targetPath = remote.getGlobal('sharedObj').prop1

  // for each item of the array
  var arrayLength = arrayUserUrls.length
  for (var i = 0; i < arrayLength; i++) {
    var url = arrayUserUrls[i]
    console.log('downloadAudio ::: Processing URL: ' + url)
    uiLogAppend('Processing: ' + url)

    console.log('downloadAudio ::: Target is set to: ' + targetPath)

    // youtubedl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output)
    // youtubedl.exec(url, ['-f',  'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0'], {}, function(err, output)
    const video = youtubedl.exec(url, ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', targetPath + '/%(title)s-%(id)s.%(ext)s'], {}, function (err, output) {
      if (err) throw err
      console.log(output.join('\n'))
      uiLogAppend(output.join('\n'))

      console.log('downloadAudio ::: finished downloading ' + url)
      uiLogAppend('Finished downloading: ' + url)
      showNoty('success', 'Finished downloading ' + url)

      // Final notification
      if (i === arrayLength) {
        showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
        resetToDoList()
      }
    })
  }

  console.log('downloadAudio ::: End')
}

/**
* @name searchUpdate
* @summary Checks if there is a new release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If "silent" = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
  if (silent === false) // when executed manually via menu -> user should see that update-check is running
  {
    showNoty('info', 'Searching for updates')
  }

  var remoteAppVersionLatest = '0.0.0'
  var localAppVersion = '0.0.0'
  var versions
  var gitHubPath = 'yafp/media-dupes' // user/repo
  var url = 'https://api.github.com/repos/' + gitHubPath + '/tags'

  // writeLog("info", "searchUpdate ::: Start checking _" + url + "_ for available releases");

  var updateStatus = $.get(url, function (data) {
    timeout:3000 // in milliseconds

    // success
    versions = data.sort(function (v1, v2) {
      // return semver.compare(v2.name, v1.name);
    })

    // get remote version
    //
    remoteAppVersionLatest = versions[0].name
    // remoteAppVersionLatest = "66.6.6"; // overwrite variable to simulate available updates

    // get local version
    //
    localAppVersion = require('electron').remote.app.getVersion()
    // localAppVersion = "1.0.0"; // to simulate

    // writeLog("info", "searchUpdate ::: Local version: " + localAppVersion);
    // writeLog("info", "searchUpdate ::: Latest public version: " + remoteAppVersionLatest);

    if (localAppVersion < remoteAppVersionLatest) // Update available
    {
      // writeLog("warn", "searchUpdate ::: Found update, notify user");

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
    } else // No update available
    {
      // writeLog("info", "searchUpdate ::: No newer version found.");

      if (silent === false) // when executed manually via menu -> user should see result of this search
      {
        showNoty('success', 'No updates available')
      }
    }

    // writeLog("info", "searchUpdate ::: Successfully checked " + url + " for available releases");
  })
    .done(function () {
      // writeLog("info", "searchUpdate ::: Successfully checked " + url + " for available releases");
    })

    .fail(function () {
      // writeLog("error", "searchUpdate ::: Checking " + url + " for available releases failed.");
      showNoty('error', 'Checking <b>' + url + '</b> for available releases failed. Please troubleshoot your network connection.')
    })

    .always(function () {
      // writeLog("info", "searchUpdate ::: Finished checking " + url + " for available releases");
    })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
  var url = 'https://github.com/yafp/media-dupes/releases'
  // writeLog("info", "openReleasesOverview ::: Opening _" + url + "_ to show available releases");
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
  // writeLog("info", "openURL ::: Trying to open the url: " + url);
  shell.openExternal(url)
}

// Call from main.js ::: startSearchUpdates
//
require('electron').ipcRenderer.on('startSearchUpdates', function () {
  searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})
