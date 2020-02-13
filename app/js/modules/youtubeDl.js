/**
 * @file Contains all youtubeDl functions
 * @author yafp
 * @module youtubeDl
 */
'use strict'

const ui = require('./ui.js')
const utils = require('./utils.js')

var youtubeDlBinaryDetailsVersion
var youtubeDlBinaryDetailsPath
var youtubeDLBinaryDetailsExec

// ----------------------------------------------------------------------------
// YOUTUBE-DL: Binary Details
// ----------------------------------------------------------------------------

/**
* @function youtubeDlBinaryDetailsPathGet
* @summary Gets the path to the youtube-dl binary details file
* @description Gets the path to the youtube-dl binary details file
* @return {string} youtubeDlBinaryDetailsPath - The actual path to the youtube-dl details file
*/
function youtubeDlBinaryDetailsPathGet () {
    const path = require('path')
    const remote = require('electron').remote
    const app = remote.app

    var youtubeDlBinaryDetailsPath = path.join(app.getAppPath(), 'node_modules', 'youtube-dl', 'bin', 'details')
    return (youtubeDlBinaryDetailsPath)
}

/**
* @function youtubeDlBinaryDetailsValueGet
* @summary Gets all values from the youtube-dl binary details file
* @description Gets all values from the youtube-dl binary details file
*/
function youtubeDlBinaryDetailsValueGet (_callback) {
    const fs = require('fs')
    youtubeDlBinaryDetailsPath = youtubeDlBinaryDetailsPathGet() // get the path to the details file

    fs.readFile(youtubeDlBinaryDetailsPath, 'utf8', function (error, contents) {
        if (error) {
            utils.writeConsoleMsg('error', 'youtubeDlBinaryDetailsValueGet ::: Unable to read youtube-dl binary details values. Error: ' + error + '.')
            throw error
        } else {
            const data = JSON.parse(contents)

            youtubeDlBinaryDetailsVersion = data.version
            youtubeDlBinaryDetailsPath = data.path
            youtubeDLBinaryDetailsExec = data.exec

            utils.writeConsoleMsg('info', 'youtubeDlBinaryDetailsValueGet ::: Version: ' + youtubeDlBinaryDetailsVersion + '.')
            utils.writeConsoleMsg('info', 'youtubeDlBinaryDetailsValueGet ::: Path: ' + youtubeDlBinaryDetailsPath + '.')
            utils.writeConsoleMsg('info', 'youtubeDlBinaryDetailsValueGet ::: Exec: ' + youtubeDLBinaryDetailsExec + '.')

            // console.info(data[value])
            // var currentDetailsValue = data[value]

            // utils.writeConsoleMsg('warn', 'youtubeDlBinaryDetailsValueGet ::: youtube-dl binary details value is version: _' + currentDetailsValue + '_.')
            _callback()
        }
    })
}

// ----------------------------------------------------------------------------
// YOUTUBE-DL: Binary Path
// ----------------------------------------------------------------------------

/**
* @function youtubeDlBinaryPathGet
* @summary Gets the path to the youtube-dl binary file
* @description Gets the path to the youtube-dl binary file using getYtdlBinary()
* @return {string} youtubeDlBinaryPath - The actual path to the youtube-dl binary
*/
function youtubeDlBinaryPathGet () {
    const youtubedl = require('youtube-dl')
    var youtubeDlBinaryPath
    youtubeDlBinaryPath = youtubedl.getYtdlBinary() // get the path of the binary
    // utils.writeConsoleMsg('info', 'youtubeDlBinaryPathGet ::: youtube-dl binary path is: _' + youtubeDlBinaryPath + '_.')
    return (youtubeDlBinaryPath)
}

/**
* @function youtubeDlBinaryPathReset
* @summary Resets the youtube-dl binary path in details
* @description Resets the youtube-dl binary path in details
* @param {string} path - The path to the youtube-dl details file
*/
function youtubeDlBinaryPathReset (path) {
    const fs = require('fs')

    fs.readFile(path, 'utf8', function (error, contents) {
        if (error) {
            utils.writeConsoleMsg('error', 'youtubeDlBinaryPathReset ::: Error while trying to read the youtube-dl path. Error: ' + error)
            utils.showNoty('error', 'Unable to read the youtube-dl binary details file. Error: ' + error)
            throw error
        } else {
            const data = JSON.parse(contents)
            var youtubeDlBinaryPath = data.path
            utils.writeConsoleMsg('info', 'youtubeDlBinaryPathReset ::: youtube-dl binary path was: _' + youtubeDlBinaryPath + '_ before reset.')

            // now update it
            if (youtubeDlBinaryPath !== null) {
                // update it back to default
                data.path = null
                fs.writeFileSync(path, JSON.stringify(data))
                utils.writeConsoleMsg('info', 'youtubeDlBinaryPathReset ::: Did reset the youtube-dl binary path back to default.')
                utils.showNoty('success', 'Did reset the youtube-dl binary path back to default')
            } else {
                // nothing to do
                utils.writeConsoleMsg('info', 'youtubeDlBinaryPathReset ::: youtube-dl binary path is: _' + youtubeDlBinaryPath + '_. This is the default')
                utils.showNoty('info', 'The youtube-dl binary path was already on its default value. Did no changes.')
            }
        }
    })
}

// ----------------------------------------------------------------------------
// YOUTUBE-DL: Binary Update
// ----------------------------------------------------------------------------

/**
* @function youtubeDlBinaryUpdateCheck
* @summary Checks if the yoututbe-dl setup allows updating or not
* @description Checks if the yoututbe-dl setup allows updating or not
* @param {boolean} [silent] - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
* @param {boolean} [force] - If progressing is forced or not
*/
function youtubeDlBinaryUpdateCheck (silent = true, force = false) {
    ui.windowMainLoadingAnimationShow()
    ui.windowMainApplicationStateSet('Searching updates for youtube-dl binary')

    // check if we could update in general = is details file writeable?
    // if not - we can cancel right away
    var youtubeDlBinaryDetailsPath = youtubeDlBinaryDetailsPathGet()
    utils.canWriteFileOrFolder(youtubeDlBinaryDetailsPath, function (error, isWritable) {
        if (error) {
            utils.writeConsoleMsg('error', 'youtubeDlBinaryUpdateCheck ::: Error while trying to read the youtube-dl details file. Error: ' + error)
            throw error
        }

        if (isWritable === true) {
            // technically we could execute an update if there is one - so lets search for updates
            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateCheck ::: Updating youtube-dl binary is technically possible - so start searching for available youtube-dl updates. Silent: _' + silent + '_ and Force: _' + force + '_.')
            var isYoutubeBinaryUpdateAvailable = youtubeDlBinaryUpdateSearch(silent, force)
        } else {
            // details file cant be resetted due to permission issues
            utils.writeConsoleMsg('warn', 'youtubeDlBinaryUpdateCheck ::: Updating youtube-dl binary is not possible on this setup due to permission issues.')

            if (silent === false) {
                utils.showNoty('error', 'Unable to update youtube-dl as ' + youtubeDlBinaryDetailsPath + ' is not writeable. This depends most likely on the package/installation type you selected')
            }
        }
    })
}

/**
* @function youtubeDlBinaryUpdateSearch
* @summary Searches for youtube-dl binary updates
* @description Searches for youtube-dl binary updates
* @param {boolean} silent - Defaults to true. If true, the progress is silent, if false there is info-feedback even if there is no update available
*/
function youtubeDlBinaryUpdateSearch (silent = true, force = false) {
    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    const urlYTDLGitHubRepoTags = 'https://api.github.com/repos/ytdl-org/youtube-dl/tags' // set youtube-dl API url
    utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Start checking _' + urlYTDLGitHubRepoTags + '_ for available youtube-dl releases. Parameters are silent: _' + silent + '_ and force: _' + force + '_.')

    var updateStatus = $.get(urlYTDLGitHubRepoTags, function (data, status) {
        // 3000 // in milliseconds

        utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Accessing _' + urlYTDLGitHubRepoTags + '_ ended with: _' + status + '_')

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Latest Remote version is: ' + remoteAppVersionLatest)
        // remoteAppVersionLatest = '66.6.6'; // overwrite variable to simulate available updates

        // get local version
        youtubeDlBinaryDetailsValueGet(function () {
            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Fetched all values from details file')
            localAppVersion = youtubeDlBinaryDetailsVersion

            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Local youtube-dl binary version: ' + localAppVersion)
            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Latest youtube-dl binary version: ' + remoteAppVersionLatest)

            if (force === true) {
                youtubeDlBinaryUpdateExecute() // we are updating - ignoring what is currently installed
            } else {
                if (localAppVersion < remoteAppVersionLatest) {
                    utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Found update for youtube-dl binary. Ask the user if he wants to execute the update now')

                    // ask user if he wants to open all those urls
                    const Noty = require('noty')
                    var n = new Noty(
                        {
                            theme: 'bootstrap-v4',
                            layout: 'bottom',
                            type: 'info',
                            closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                            text: 'Do you want to update youtube-dl now from <b>' + localAppVersion + '</b> to <b>' + remoteAppVersionLatest + '</b>?',
                            buttons: [
                                Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                                    n.close()
                                    youtubeDlBinaryUpdateExecute()
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
                    if (silent === false) {
                        utils.showNoty('info', '<b>No youtube-dl binary update available</b><br>You are already using the latest binary version of youtube-dl')
                    }
                }
            }
        })

        utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Successfully checked ' + urlYTDLGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Checking ' + urlYTDLGitHubRepoTags + ' for available releases failed.')
            utils.showNoty('error', 'Checking <b>' + urlYTDLGitHubRepoTags + '</b> for available releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateSearch ::: Finished checking ' + urlYTDLGitHubRepoTags + ' for available releases')
            ui.windowMainLoadingAnimationHide()
            ui.windowMainButtonsOthersEnable()
            ui.windowMainApplicationStateSet()
        })
}

/**
* @function youtubeDlBinaryUpdateExecute
* @summary Updates the youtube-dl binary
* @description Updates the youtube-dl binary
*/
function youtubeDlBinaryUpdateExecute () {
    const youtubedl = require('youtube-dl')
    const downloader = require('youtube-dl/lib/downloader')

    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')
    const targetPath = path.join(app.getPath('userData'), 'youtube-dl') // set targetPath

    // start downloading latest youtube-dl binary to custom path
    downloader(targetPath, function error (error, done) {
        'use strict'
        if (error) {
            utils.writeConsoleMsg('error', 'youtubeDlBinaryUpdateExecute ::: Error while trying to update the youtube-dl binary at: _' + targetPath + '_. Error: ' + error)
            utils.showNoty('error', 'Unable to update youtube-dl binary. Error: ' + error, 0)
            throw error
        }
        utils.writeConsoleMsg('info', 'youtubeDlBinaryUpdateExecute ::: Updated youtube-dl binary at: _' + targetPath + '_.')
        console.log(done)
        utils.showNoty('success', done)
    })
}

// Exporting the module functions
//
module.exports.youtubeDlBinaryDetailsPathGet = youtubeDlBinaryDetailsPathGet
module.exports.youtubeDlBinaryDetailsValueGet = youtubeDlBinaryDetailsValueGet
module.exports.youtubeDlBinaryPathGet = youtubeDlBinaryPathGet
module.exports.youtubeDlBinaryPathReset = youtubeDlBinaryPathReset
module.exports.youtubeDlBinaryUpdateCheck = youtubeDlBinaryUpdateCheck
module.exports.youtubeDlBinaryUpdateSearch = youtubeDlBinaryUpdateSearch
module.exports.youtubeDlBinaryUpdateExecute = youtubeDlBinaryUpdateExecute
