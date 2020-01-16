/**
 * @file Contains all youtubeDl functions
 * @author yafp
 * @module youtubeDl
 */

'use strict'

const utils = require('utils.js')

/**
* @name youtubeDlBinaryPathGet
* @summary Gets the path to the youtube-dl binary file
* @description Gets the path to the youtube-dl binary file using getYtdlBinary()
* @return youtubeDlBinaryPath
*/
function youtubeDlBinaryPathGet () {
    const youtubedl = require('youtube-dl')
    var youtubeDlBinaryPath
    youtubeDlBinaryPath = youtubedl.getYtdlBinary() // get the path of the binary
    return (youtubeDlBinaryPath)
}

/**
* @name youtubeDlBinaryPathGet
* @summary Resets the youtube-dl binary path in details
* @description Resets the youtube-dl binary path in details
*/
function youtubeDlBinaryPathReset (path) {
    const fs = require('fs')

    fs.readFile(path, 'utf8', function (error, contents) {
        if (error) {
            throw error
        } else {
            const data = JSON.parse(contents)
            var youtubeDlBinaryPath = data.path

            // now update it
            if (youtubeDlBinaryPath !== null) {
                utils.doLogToConsole('info', 'youtubeDlBinaryPathReset ::: youtube-dl binary path is: _' + youtubeDlBinaryPath + '_.')
                // update it back to default
                data.path = null
                fs.writeFileSync(path, JSON.stringify(data))
            } else {
                utils.doLogToConsole('info', 'youtubeDlBinaryPathReset ::: youtube-dl binary path is: _' + youtubeDlBinaryPath + '_. This is the default')
            }
        }
    })
}

/**
* @name youtubeDlBinaryUpdate
* @summary Updates the youtube-dl binary
* @description Updates the youtube-dl binary
*/
function youtubeDlBinaryUpdate () {
    const youtubedl = require('youtube-dl')
    const downloader = require('youtube-dl/lib/downloader')

    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')
    const targetPath = path.join(app.getPath('userData'), 'youtube-dl') // set targetPath

    showNoty('info', 'Trying to update the youtube-dl binary. This might take some time - wait for feedback ...')

    utils.doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Searching youtube-dl binary')
    var youtubeDlBinaryPath = youtubeDlBinaryPathGet()
    utils.doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Found youtube-dl binary in: _' + youtubeDlBinaryPath + '_.')

    // start downloading latest youtube-dl binary to custom path
    downloader(targetPath, function error (error, done) {
        'use strict'
        if (error) {
            utils.doLogToConsole('error', 'doUpdateYoutubeDLBinary ::: Error while trying to update the youtube-dl binary at: _' + targetPath + '_. Error: ' + error)
            showNoty('error', 'Unable to update youtube-dl binary. Error: ' + error, 0)
            throw error
        }
        utils.doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Updated youtube-dl binary at: _' + targetPath + '_.')
        console.log(done)
        showNoty('success', done)
    })
}

/**
* @name youtubeDlBinaryUpdateSearch
* @summary Searches for youtube-dl binary updates
* @description Searches for youtube-dl binary updates
*/
function youtubeDlBinaryUpdateSearch (silent = true) {
    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    // set youtube-dl API url
    const urlYTDLGitHubRepoTags = 'https://api.github.com/repos/ytdl-org/youtube-dl/tags'

    utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Start checking _' + urlYTDLGitHubRepoTags + '_ for available releases')

    var updateStatus = $.get(urlYTDLGitHubRepoTags, function (data) {
        3000 // in milliseconds

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Latest Remote version is: ' + remoteAppVersionLatest)
        // remoteAppVersionLatest = '66.6.6'; // overwrite variable to simulate available updates

        // get local version
        // localAppVersion = youtubeDlBinaryDetailsValueGet('version')
        youtubeDlBinaryDetailsValueGet(function () {
            utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Fetched all values from details file')

            // console.warn(youtubeDlBinaryDetailsVersion)
            // console.warn(youtubeDlBinaryDetailsPath)
            // console.warn(youtubeDLBinaryDetailsExec)

            localAppVersion = youtubeDlBinaryDetailsVersion

            utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Local youtube-dl binary version: ' + localAppVersion)
            utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Latest youtube-dl binary version: ' + remoteAppVersionLatest)

            if (localAppVersion < remoteAppVersionLatest) {
                utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Found update for youtube-dl binary. Gonna start the update routine now ...')
                youtubeDlBinaryUpdate()
                if (silent === false) {
                    showNoty('info', 'youtube.js: update found')
                }
            } else {
                if (silent === false) {
                    showNoty('info', 'youtube.js: no update found')
                }
            }
        })

        utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Successfully checked ' + urlYTDLGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Checking ' + urlYTDLGitHubRepoTags + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + urlYTDLGitHubRepoTags + '</b> for available releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            utils.doLogToConsole('info', 'youtubeDlBinaryUpdateSearch ::: Finished checking ' + urlYTDLGitHubRepoTags + ' for available releases')
            uiLoadingAnimationHide()
            uiAllElementsToDefault()
        })
}

/**
* @name youtubeDlBinaryDetailsPathGet
* @summary Gets the path to the youtube-dl binary details file
* @description Gets the path to the youtube-dl binary details file
* @return youtubeDlBinaryDetailsPath
*/
function youtubeDlBinaryDetailsPathGet () {
    const path = require('path')
    const remote = require('electron').remote
    const app = remote.app

    var youtubeDlBinaryDetailsPath = path.join(app.getAppPath(), 'node_modules', 'youtube-dl', 'bin', 'details')
    return (youtubeDlBinaryDetailsPath)
}

/**
* @name youtubeDlBinaryDetailsValueGet
* @summary Gets all values from the youtube-dl binary details file
* @description Gets all values from the youtube-dl binary details file
*/
function youtubeDlBinaryDetailsValueGet (_callback) {
    const fs = require('fs')

    var youtubeDlBinaryDetailsPath = youtubeDlBinaryDetailsPathGet() // get the path to the details file

    fs.readFile(youtubeDlBinaryDetailsPath, 'utf8', function (error, contents) {
        if (error) {
            utils.doLogToConsole('error', 'youtubeDlBinaryDetailsValueGet ::: Unable to read youtube-dl binary details values. Error: ' + error + '.')
            throw error
        } else {
            const data = JSON.parse(contents)

            /*
            console.error(data)

            console.warn(data.version)
            console.warn(data.path)
            console.warn(data.exec)
            */

            youtubeDlBinaryDetailsVersion = data.version
            youtubeDlBinaryDetailsPath = data.path
            youtubeDLBinaryDetailsExec = data.exec

            // console.info(data[value])
            // var currentDetailsValue = data[value]

            // utils.doLogToConsole('warn', 'youtubeDlBinaryDetailsValueGet ::: youtube-dl binary details value is version: _' + currentDetailsValue + '_.')
            _callback()
        }
    })
}

// Exporting the module functions
//
module.exports.youtubeDlBinaryPathGet = youtubeDlBinaryPathGet
module.exports.youtubeDlBinaryPathReset = youtubeDlBinaryPathReset
module.exports.youtubeDlBinaryUpdate = youtubeDlBinaryUpdate
module.exports.youtubeDlBinaryUpdateSearch = youtubeDlBinaryUpdateSearch
module.exports.youtubeDlBinaryDetailsPathGet = youtubeDlBinaryDetailsPathGet
module.exports.youtubeDlBinaryDetailsValueGet = youtubeDlBinaryDetailsValueGet
