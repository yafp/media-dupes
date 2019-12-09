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
    body: message
  })

  myNotification.onclick = () => {
    console.log('Notification clicked')
  }
}

/**
* @name checkForDeps
* @summary Checks for missing dependencies
* @description Checks on startup for missing dependencies
*/
function checkForDeps()
{
  console.log("checkForDeps ::: Starting")

  var countErrors = 0;

  // ffmpeg
  console.log("checkForDeps ::: Searching ffmpeg ...")
  var ffmpeg = require('ffmpeg-static-electron');
  if (ffmpeg === "")
  {
    console.error("checkForDeps ::: Unable to find ffmpeg")
    $("#buttonStartAudio").hide();
    showNoty("error", "Unable to find dependency <b>ffmpeg</b>. Extracting audio is now disabled, sorry", 0)
    countErrors = countErrors + 1;
  }
  else
  {
    console.log("checkForDeps ::: Found ffmpeg in: _" + ffmpeg.path + "_.");
  }

  console.log("checkForDeps ::: Finished - found overall _" + countErrors + "_ problems.");
}



/**
* @name uiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function uiReset () {

  // empty input file
  $('#inputNewUrl').val('')

  // disable start button
  startButtonsDisable()

    // empty todo-list textarea
  toDoListReset()

  // empty log textarea
  uiLogReset()

  console.log('uiReset ::: finished resetting the UI')
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
    isUrlValid = validURL(newUrl)
    if (isUrlValid) {
      console.log('addURL ::: Adding new url: ' + newUrl)

      // append to array
      arrayUserUrls.push(newUrl)

      // update todo list
      updateToDoList()

      // reset input
      $('#inputNewUrl').val('')

    } 
    else {
      console.error('addURL ::: Detected invalid url: ' + newUrl)
      showNoty('error', 'Please insert a valid url (invalid)')
    }
  }
  else
  {
    showNoty('error', 'Please insert a valid url (empty)')
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
function startButtonsEnable()
{
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
function startButtonsDisable()
{
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
function downloadContent(mode)
{
  console.log('downloadContent ::: Start with mode set to: ' + mode + '.')

  // example urls
  //
  // url = "http://www.youtube.com/watch?v=90AiXO1pAiA";
  // url = "https://vimeo.com/120828152"
  // url = "https://soundcloud.com/jakarta-records/suff-daddy-feat-ill-camille-jlamotta-magic-taken-from-seasons-in-jakarta"

  // Prepare UI
  //
  uiLogReset() // start new job - clean up loag before
  startButtonsDisable() // disable the start buttons

  // require some stuff
  const youtubedl = require('youtube-dl')
  const { remote } = require('electron')
  const path = require('path')


  var targetPath = remote.getGlobal('sharedObj').prop1
  var youtubeDlParameter = ""

  // Define the youtube-dl parameters depending on the mode (audio vs video)
  switch (mode) 
  {
    case "audio":
      //youtubeDlParameter = ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s')]
      //
      // --prefer-ffmpeg
      //youtubeDlParameter = ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s'), '--prefer-ffmpeg']
      //
      // --prefer-avconv
      //youtubeDlParameter = ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s'), '--prefer-avconv']

      var ffmpeg = require('ffmpeg-static-electron');
      console.log(ffmpeg.path);

      youtubeDlParameter = ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s'), '--prefer-ffmpeg', '--ffmpeg-location', ffmpeg.path]
      break;

    case "video":
      youtubeDlParameter = ['-f', 'best', '-o', path.join(targetPath, 'media-dupes', '%(title)s-%(id)s.%(ext)s')]
      break;

    default:
      showNoty("error", "Unexpected download case. Please report this issue")
      break;
  }

  // for each item of the array
  //
  var arrayLength = arrayUserUrls.length
  for (var i = 0; i < arrayLength; i++) {
    var url = arrayUserUrls[i]

    console.log('downloadContent ::: Processing URL: ' + url)
    uiLogAppend('Processing: ' + url)

    const video = youtubedl.exec(url, youtubeDlParameter, {}, function (err, output) {
      if (err)
      {
        throw err
        showNoty("error", "Downloading <b>" + url + "</b> failed with error: " + err)
      }

      // show progress
      console.log(output.join('\n'))
      uiLogAppend(output.join('\n'))

      // finish
      console.log('downloadContent ::: Finished downloading ' + url)
      uiLogAppend('Finished downloading: ' + url)
      showNoty('success', 'Finished downloading <b>' + url + '</b>.')

      // Final notification
      if (i === arrayLength) {
        showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
        toDoListReset()
      }
    })
  }

  console.log('downloadContent ::: All download processes are now at least started')

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

  console.log("searchUpdate ::: Start checking _" + url + "_ for available releases");

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

    console.log("searchUpdate ::: Local version: " + localAppVersion);
    console.log("searchUpdate ::: Latest public version: " + remoteAppVersionLatest);

    if (localAppVersion < remoteAppVersionLatest) // Update available
    {
      console.log("searchUpdate ::: Found update, notify user");

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
      console.log("searchUpdate ::: No newer version found.");

      if (silent === false) // when executed manually via menu -> user should see result of this search
      {
        showNoty('success', 'No updates available')
      }
    }

    console.log("searchUpdate ::: Successfully checked " + url + " for available releases");
  })
    .done(function () {
      console.log("searchUpdate ::: Successfully checked " + url + " for available releases");
    })

    .fail(function () {
      console.log("searchUpdate ::: Checking " + url + " for available releases failed.");
      showNoty('error', 'Checking <b>' + url + '</b> for available releases failed. Please troubleshoot your network connection.')
    })

    .always(function () {
      console.log("searchUpdate ::: Finished checking " + url + " for available releases");
    })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
  var url = 'https://github.com/yafp/media-dupes/releases'
  console.log("openReleasesOverview ::: Opening _" + url + "_ to show available releases");
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
  console.log("openURL ::: Trying to open the url: " + url);
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

// Call from main.js ::: startSearchUpdates
//
require('electron').ipcRenderer.on('startSearchUpdates', function () {
  searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})
