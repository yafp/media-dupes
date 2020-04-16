/**
* @file Contains the main.js code of media-dupes
* @author yafp
* @namespace main
*/

// console.time('init') // start measuring startup time

// -----------------------------------------------------------------------------
// REQUIRE: 3rd PARTY
// -----------------------------------------------------------------------------
const { app, BrowserWindow, electron, ipcMain, Menu } = require('electron')
const shell = require('electron').shell
const path = require('path')
const fs = require('fs')
const openAboutWindow = require('about-window').default // for: about-window

// -----------------------------------------------------------------------------
// Shared object
// -----------------------------------------------------------------------------
//
var consoleOutput = false // can be changed using --verbose

// power save blocker
var powerSaveBlockerEnabled = false
var powerSaveBlockerId = -1

// Settings UI
var enableVerboseMode = false
var enableAdditionalParameter = false
var additionalYoutubeDlParameter = ''
var enableErrorReporting = true
var downloadDir = app.getPath('downloads') // Detect the default-download-folder of the user from the OS
var audioFormat = 'mp3' // mp3 is the default
var confirmedDisclaimer = false

// Main UI
var applicationState = 'idle' // default is idle
var todoListStateEmpty = true // is empty by default

global.sharedObj = {
    // console Output
    consoleOutput: consoleOutput,

    // power management
    powerSaveBlockerEnabled: powerSaveBlockerEnabled,
    powerSaveBlockerId: powerSaveBlockerId,

    // settings UI
    enableErrorReporting: enableErrorReporting,
    enableVerboseMode: enableVerboseMode,
    enableAdditionalParameter: enableAdditionalParameter,
    additionalYoutubeDlParameter: additionalYoutubeDlParameter,
    downloadDir: downloadDir,
    audioFormat: audioFormat,
    confirmedDisclaimer: confirmedDisclaimer,

    // main UI
    applicationState: applicationState,
    todoListStateEmpty: todoListStateEmpty
}

// ----------------------------------------------------------------------------
// REQUIRE: MEDIA-DUPES MODULES
// ----------------------------------------------------------------------------
const crash = require('./app/js/modules/crashReporter.js') // crashReporter
const sentry = require('./app/js/modules/sentry.js') // sentry
const unhandled = require('./app/js/modules/unhandled.js') // electron-unhandled
const utils = require('./app/js/modules/utils.js')

// ----------------------------------------------------------------------------
// COMMAND-LINE-ARGS
// ----------------------------------------------------------------------------
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage') // https://github.com/75lb/command-line-usage/wiki

// image to unicode: https://drewish.com/projects/unicoder/
const appLogo = '\t       ▖▄▖▌▌▌▌▄▖▖       \n\t    ▗▐▐▐▗▚▚▚▚▚▚▚▀▌▌▖    \n\t  ▗▐▐▐▐▐▐▐▐▐▐▐▐▐▐▐▐▐▚   \n\t ▗▐▐▐▚▚▚▀▝▐▐▐▞▝▝▞▞▞▞▞▌▖ \n\t ▌▌▌▌▌▌▘  ▗▚▜▖  ▝▐▐▞▞▞▞ \n\t▗▚▚▚▌▚    ▐▐▐▖▖   ▌▌▌▌▛▖\n\t▚▚▚▘    ▝▜▐▐▚▚▚▘  ▘▚▚▚▚▘\n\t▚▚▙▘      ▚▚▚▚      ▝▞▞▞\n\t▝▞▄        ▘▘        ▌▌▘\n\t ▌▌▙▖              ▗▐▐▐ \n\t ▝▐▗▚▜▐▚▜▐▚▚▜▐▐▐▐▞▌▌▌▌▘ \n\t  ▝▐▐▐▐▐▐▐▐▐▐▐▐▚▚▚▚▚▘▘  \n\t    ▝▐▐▐▐▐▐▐▐▐▐▐▐▐▝ ▘   \n\t       ▘▘▘▘▚▌▘▘▘▘       '

const optionDefinitions = [
    {
        description: 'Display this usage guide.',
        name: 'help',
        alias: 'h',
        type: Boolean,
        /* typeLabel: '{underline boolean}', */
        defaultValue: false
    },
    {
        description: 'Show verbose output.',
        name: 'verbose',
        alias: 'v',
        type: Boolean,
        defaultValue: false
    },
    {
        description: 'Skip the disclaimer',
        name: 'skipDisclaimer',
        alias: 's',
        type: Boolean,
        defaultValue: false
    }
]

const options = commandLineArgs(optionDefinitions)

// Option: Help
if (options.help) {
    const usage = commandLineUsage([
        {
            content: [
                appLogo
            ],
            raw: true
        },
        {
            header: 'media-dupes',
            content: 'a minimal content duplicator for common media services like youtube.'
        },
        {
            header: 'Options',
            hide: ['skipDisclaimer'],
            optionList: optionDefinitions
        },
        {
            header: 'Issues',
            content: '{underline https://github.com/yafp/media-dupes/issues}'
        },
        {
            header: 'Code',
            content: '{underline https://github.com/yafp/media-dupes}'
        }
    /*
    {
      content: 'Project home: {underline https://github.com/yafp/media-dupes}'
    }
    */
    ])
    console.log(usage)
    app.quit() // stop the application
}

// Option: Verbose
//
if (options.verbose) {
    // verbose = true
    global.sharedObj.consoleOutput = true
}

// Option: Verbose
//
if (options.skipDisclaimer) {
    global.sharedObj.confirmedDisclaimer = true
}

// ----------------------------------------------------------------------------
// ERROR-HANDLING:
// ----------------------------------------------------------------------------
crash.initCrashReporter()
unhandled.initUnhandled()
sentry.enableSentry() // sentry is enabled by default

// ----------------------------------------------------------------------------
// VARIABLES & CONSTANTS
// ----------------------------------------------------------------------------
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let settingsWindow
let distractionWindow

const gotTheLock = app.requestSingleInstanceLock() // for: single-instance handling
const defaultUserDataPath = app.getPath('userData') // for: storing window position and size

const { urlGitHubGeneral, urlGitHubIssues, urlGitHubChangelog, urlGitHubReleases, urlYoutubeDlSupportedSites } = require('./app/js/modules/urls.js') // project-urls

// Caution: Warning since electron 8
// app.allowRendererProcessReuse = false // see: https://github.com/electron/electron/issues/18397

// mainWindow: minimal window size
const mainWindowMinimalWindowHeight = 730
const mainWindowMinimalWindowWidth = 620

// settingsWundow: minimal window size
const settingsWindowMinimalWindowHeight = 400
const settingsWindowMinimalWindowWidth = 800

// ----------------------------------------------------------------------------
// FUNCTIONS
// ----------------------------------------------------------------------------

/**
* @function doLog
* @summary Writes console output for the main process
* @description Writes console output for the main process
* @memberof main
* @param {string} type - The log type
* @param {string} message - The log message
*/
function doLog (type, message) {
    const logM = require('electron-log')
    const prefix = '[   Main   ] '

    if (global.sharedObj.consoleOutput === false) {
        logM.transports.console.level = false // disable Terminal output. Still logs to DevTools and LogFile
    }
    // important: https://github.com/megahertz/electron-log/issues/189

    // electron-log can: error, warn, info, verbose, debug, silly
    switch (type) {
    case 'info':
        logM.info(prefix + message)
        break

    case 'warn':
        logM.warn(prefix + message)
        break

    case 'error':
        logM.error(prefix + message)
        break

    default:
        logM.silly(prefix + message)
            // code block
    }
}

/**
* @function createWindowSettings
* @summary Manages the BrowserWindow for the Settings UI
* @description Manages the BrowserWindow for the Settings UI
* @memberof main
*/
function createWindowSettings () {
    doLog('info', 'createWindowSettings ::: Creating the settings window')

    // Create the browser window.for Settings
    settingsWindow = new BrowserWindow({
        modal: true,
        frame: true, // false results in a borderless window. Needed for custom titlebar
        titleBarStyle: 'default', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        backgroundColor: '#ffffff', // since 0.3.0
        show: true, // hide until: ready-to-show
        center: true, // Show window in the center of the screen. (since 0.3.0)
        width: settingsWindowMinimalWindowWidth,
        minWidth: settingsWindowMinimalWindowWidth,
        minimizable: false, // not implemented on linux
        maximizable: false, // not implemented on linux
        height: settingsWindowMinimalWindowHeight,
        minHeight: settingsWindowMinimalWindowHeight,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true // introduced in 0.3.0
        }
    })

    settingsWindow.loadFile('app/settings.html') // load the setting.html to the settings-window
    settingsWindow.removeMenu() // the settings window needs no menu

    // Call from renderer: Settings UI - toggle dev tools
    ipcMain.on('settingsToggleDevTools', function () {
        settingsWindow.webContents.toggleDevTools()
    })

    // Emitted before the window is closed.
    settingsWindow.on('close', function () {
        doLog('info', 'createWindowSettings ::: settingsWindow will close (event: close)')
    })

    // Emitted when the window is closed.
    settingsWindow.on('closed', function (event) {
        doLog('info', 'createWindowSettings ::: settingsWindow is closed (event: closed)')
        settingsWindow = null // Dereference the window object
        mainWindow.webContents.send('unblurMainUI') // unblur the main UI
    })
}

/**
* @function createWindowDistraction
* @summary creates the window for distraction mode
* @description creates the window for distraction mode
* @memberof main
*/
function createWindowDistraction () {
    doLog('info', 'createWindowDistraction ::: Creating the distraction window')

    // Create the distraction browser window.
    distractionWindow = new BrowserWindow({
        frame: true, // false results in a borderless window. Needed for custom titlebar
        backgroundColor: '#ffffff',
        center: true,
        width: 550,
        minWidth: 550,
        resizable: false,
        height: 720,
        minHeight: 720,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            webSecurity: true
        }
    })

    distractionWindow.loadFile('app/distraction.html') // load the distraction.html to the
    distractionWindow.removeMenu() // the distraction-window needs no menu

    // Emitted before the window is closed.
    distractionWindow.on('close', function () {
        doLog('info', 'createWindowDistraction ::: distractionWindow will close (event: close)')
    })

    // Emitted when the window is closed.
    distractionWindow.on('closed', function (event) {
        doLog('info', 'createWindowDistraction ::: distractionWindow is closed (event: closed)')
        distractionWindow = null // Dereference the window object
    })
}

/**
* @function createWindowMain
* @summary Creates the mainWindow
* @description Creates the mainWindow (restores window position and size of possible)
* @memberof main
*/
function createWindowMain () {
    doLog('info', 'createWindowMain ::: Starting to create the application windows')

    // Check last window position and size from user data
    var windowWidth
    var windowHeight
    var windowPositionX
    var windowPositionY

    // Read a local config file
    var customUserDataPath = path.join(defaultUserDataPath, 'MediaDupesWindowPosSize.json')
    var data
    try {
        data = JSON.parse(fs.readFileSync(customUserDataPath, 'utf8'))
        windowWidth = data.bounds.width // window size: width
        windowHeight = data.bounds.height // window size: height
        windowPositionX = data.bounds.x // window position: x
        windowPositionY = data.bounds.y // window position: y

        doLog('info', 'createWindowMain ::: Got last window position and size information from _' + customUserDataPath + '_.')
    } catch (e) {
        doLog('warn', 'createWindowMain ::: No last window position and size information found in _' + customUserDataPath + '_. Using fallback values')

        // set some default values for window size
        windowWidth = mainWindowMinimalWindowWidth
        windowHeight = mainWindowMinimalWindowHeight
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        frame: false, // false results in a borderless window. Needed for custom titlebar
        titleBarStyle: 'hidden', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        backgroundColor: '#ffffff', // since 0.3.0
        show: false, // hide until: ready-to-show event is fired
        center: true, // Show window in the center of the screen. (since 0.3.0)
        width: windowWidth,
        minWidth: mainWindowMinimalWindowWidth,
        height: windowHeight,
        minHeight: mainWindowMinimalWindowHeight,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true // introduced in 0.3.0
        }
    })

    // Restore window position if possible
    //
    // requirements: found values in MediaDupesWindowPosSize.json from the previous session
    if ((typeof windowPositionX !== 'undefined') && (typeof windowPositionY !== 'undefined')) {
        mainWindow.setPosition(windowPositionX, windowPositionY)
    }

    // Call from renderer: reload the application
    ipcMain.on('reloadMainWindow', (event) => {
        doLog('info', 'createWindowMain ::: Trying to reload the main window.')
        mainWindow.reload()
    })

    // Call from renderer: Open download folder
    ipcMain.on('openUserDownloadFolder', (event, userSettingValue) => {
        doLog('info', 'ipc.openUserDownloadFolder ::: Trying to open the download directory _' + userSettingValue + '_.')

        // try to open it
        if (shell.openItem(userSettingValue) === true) {
            doLog('info', 'ipc.openUserDownloadFolder :::  Opened the media-dupes download folder (ipcMain)')
        } else {
            doLog('error', 'ipc.openUserDownloadFolder ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer: Open settings folder
    ipcMain.on('settingsFolderOpen', (event) => {
        doLog('info', 'ipc.settingsFolderOpen ::: Opened the users settings folder (ipcMain)')
        const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings') // change path for userSettings

        if (shell.openItem(userSettingsPath) === true) {
            doLog('info', 'ipc.settingsFolderOpen ::: Opened the media-dupes subfolder in users download folder (ipcMain)')
        } else {
            doLog('error', 'ipc.settingsFolderOpen ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer:  Urgent window
    ipcMain.on('makeWindowUrgent', function () {
        mainWindow.flashFrame(true)
    })

    // Call from renderer: Option: load settings UI
    ipcMain.on('settingsUiLoad', function () {
        createWindowSettings()
    })

    // Call from renderer: Option: load distraction UI
    ipcMain.on('startDistraction', function () {
        createWindowDistraction()
    })

    // Call from renderer: show mainUI
    ipcMain.on('showAndFocusMainUI', function () {
        mainWindow.show()
        mainWindow.focus()
    })

    // Call from renderer: Update property from globalObj
    ipcMain.on('globalObjectSet', function (event, property, value) {
        doLog('info', 'ipc.globalObjectSet ::: Set _' + property + '_ to: _' + value + '_')
        global.sharedObj[property] = value // update the property in the global shared object
        if (global.sharedObj.consoleOutput === true) { // If console output is enabled- show the entire sharedObject
            console.warn(global.sharedObj)
        }
    })

    // Call from renderer - Enable the power save blocker. See #97
    ipcMain.on('enablePowerSaveBlocker', function () {
        const { powerSaveBlocker } = require('electron')
        const id = powerSaveBlocker.start('prevent-display-sleep')

        if (powerSaveBlocker.isStarted(id)) {
            doLog('info', 'ipc.enablePowerSaveBlocker ::: Successfully enabled the PowerSaveBlocker with the ID _' + id + '_ as app is currently downloading')
            global.sharedObj.powerSaveBlockerEnabled = true
            global.sharedObj.powerSaveBlockerId = id
        } else {
            doLog('error', 'ipc.enablePowerSaveBlocker ::: Enabling the Power-Save-Blocker for the current download failed')
            global.sharedObj.powerSaveBlockerEnabled = false
            global.sharedObj.powerSaveBlockerId = -1
        }
    })

    // Call from renderer: disables the powersaveblocker
    ipcMain.on('disablePowerSaveBlocker', function (event, id) {
        const { powerSaveBlocker } = require('electron')
        powerSaveBlocker.stop(id)
        global.sharedObj.powerSaveBlockerEnabled = false
        global.sharedObj.powerSaveBlockerId = -1
        doLog('info', 'ipc.disablePowerSaveBlocker ::: Disabled the PowerSaveBlocker with the ID: _' + id + '_.')
    })

    mainWindow.loadFile('app/index.html') // load the index.html to the main window

    // Emitted when the web page becomes unresponsive.
    mainWindow.on('unresponsive', function () {
        doLog('warn', 'createWindowMain (on unresponsive) ::: mainWindow is now unresponsive (event: unresponsive)')
    })

    // Emitted when the unresponsive web page becomes responsive again.
    mainWindow.on('responsive', function () {
        doLog('info', 'createWindowMain (on responsive) ::: mainWindow is now responsive again (event: responsive)')
    })

    // Emitted when the web page has been rendered (while not being shown) and window can be displayed without a visual flash.
    mainWindow.on('ready-to-show', function () {
        doLog('info', 'createWindowMain (ready to show) ::: mainWindow is now ready, so show it and then focus it (event: ready-to-show)')
        mainWindow.show()
        mainWindow.focus()

        // do some checks & routines once at start of the application
        mainWindow.webContents.send('startCheckingDependencies') // check application dependencies
        mainWindow.webContents.send('todoListCheck') // search if there are urls to restore
        // mainWindow.webContents.send('unblurMainUI') // unblur the main UI

        // Start checks for updates scheduled to improve startup time
        mainWindow.webContents.send('scheduleUpdateCheckMediaDupes')
        mainWindow.webContents.send('scheduleUpdateCheckYoutubeDl')

        mainWindow.webContents.send('countAppStarts') // count app starts
    })
    // end: ready-toshow

    // Emitted when the web page has been rendered (while not being shown) and window can be displayed without a visual flash.
    mainWindow.on('show', function () {
        doLog('info', 'createWindowMain (show) ::: mainWindow is now ready, so show it and then focus it (event: ready-to-show)')
        mainWindow.webContents.send('blurMainUI') // blur the main UI
        mainWindow.webContents.send('startDisclaimerCheck') // check if disclaimer must be shown

        // console.timeEnd('init') // Stop measuring startup time
    })
    // end: ready-toshow

    // Emitted before the window is closed.
    mainWindow.on('close', function (event) {
        doLog('info', 'createWindowMain (on close) ::: mainWindow will close (event: close)')

        var curState = global.sharedObj.applicationState // get applicationState
        doLog('info', 'createWindowMain (on close) ::: Current application state is: _' + curState + '_.')

        if (curState === 'Download in progress') {
            var choiceA = require('electron').dialog.showMessageBoxSync(this, // since electron7 showMessageBox no longer blocks the close. Therefor we are using showMessageBoxSync
                {
                    icon: path.join(__dirname, 'app/img/icon/icon.png'),
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Downloads in progress',
                    message: 'media-dupes is currently downloading.\n\nDo you really want to quit?'
                })
            if (choiceA === 1) {
                event.preventDefault() // user pressed No
                return
            }
        }

        // todoList handling - see #66
        //
        var curTodoListStateEmpty = global.sharedObj.todoListStateEmpty
        doLog('info', 'createWindowMain (on close) ::: Is the todo list currently empty?: _' + curTodoListStateEmpty + '_.')
        if (curTodoListStateEmpty === false) {
            // todo List contains data which should be handled
            var choiceB = require('electron').dialog.showMessageBoxSync(this,
                {
                    icon: path.join(__dirname, 'app/img/icon/icon.png'),
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Save current todo list?',
                    message: 'Your todo list contains unprocessed URLs.\n\nDo you want to restore them on next launch?'
                })

            if (choiceB === 0) {
                doLog('info', 'createWindowMain (on close) ::: User wants to save his todo list')
                mainWindow.webContents.send('todoListTryToSave')
            } else {
                doLog('info', 'createWindowMain (on close) ::: User does NOT want to save his todo list')
            }
        } else {
            doLog('info', 'createWindowMain ::: There is nothing in the todo list to save')
        }

        // get window position and size
        var data = {
            bounds: mainWindow.getBounds()
        }

        // define target path (in user data)
        var customUserDataPath = path.join(defaultUserDataPath, 'MediaDupesWindowPosSize.json')

        // try to write
        fs.writeFile(customUserDataPath, JSON.stringify(data), function (error) {
            if (error) {
                doLog('error', 'createWindowMain ::: storing window-position and -size of mainWindow in  _' + customUserDataPath + '_ failed with error: _' + error + '_ (event: close)')
                throw error
            }

            doLog('info', 'createWindowMain ::: mainWindow stored window-position and -size in _' + customUserDataPath + '_ (event: close)')
        })
    })
    // end: close

    // Emitted when the window is closed.
    mainWindow.on('closed', function (event) {
        doLog('info', 'createWindowMain (closed) ::: mainWindow is closed (event: closed)')
        mainWindow = null // Dereference the window object,
    })
    // end: closed
}

/**
* @function createMenuMain
* @summary Creates the menu for the main UI
* @description Creates the menu for the main UI
* @memberof main
*/
function createMenuMain () {
    var menu = Menu.buildFromTemplate([

        // Menu: File
        {
            label: 'File',
            submenu: [
                // Settings
                {
                    label: 'Settings',
                    icon: path.join(__dirname, 'app/img/menu/file/cog_red.png'),
                    click () {
                        mainWindow.webContents.send('openSettings')
                    },
                    accelerator: 'CmdOrCtrl+,'
                },
                {
                    type: 'separator'
                },
                // Exit
                {
                    role: 'quit',
                    label: 'Exit',
                    icon: path.join(__dirname, 'app/img/menu/file/power-off_red.png'),
                    click () {
                        app.quit()
                    },
                    accelerator: 'CmdOrCtrl+Q'
                }
            ]
        },

        // Menu: Edit
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    icon: path.join(__dirname, 'app/img/menu/edit/undo_red.png'),
                    accelerator: 'CmdOrCtrl+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    icon: path.join(__dirname, 'app/img/menu/edit/redo_red.png'),
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    icon: path.join(__dirname, 'app/img/menu/edit/cut_red.png'),
                    accelerator: 'CmdOrCtrl+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    icon: path.join(__dirname, 'app/img/menu/edit/copy_red.png'),
                    accelerator: 'CmdOrCtrl+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    icon: path.join(__dirname, 'app/img/menu/edit/paste_red.png'),
                    accelerator: 'CmdOrCtrl+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    selector: 'selectAll:'
                }
            ]
        },

        // Menu: View
        /*
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload',
                    label: 'Reload',
                    click (item, mainWindow) {
                        mainWindow.reload()
                    },
                    accelerator: 'CmdOrCtrl+R'
                }
            ]
        },
        */

        // Menu: Youtube
        /*
        {
            label: 'Search',
            submenu: [
                {
                    label: 'Youtube Suggest',
                    click (item, mainWindow) {
                        mainWindow.webContents.send('openYoutubeSuggestDialog')
                    },
                    accelerator: 'CmdOrCtrl+S'
                }
            ]
        },
        */

        // Menu: Window
        {
            label: 'Window',
            submenu: [
                {
                    role: 'reload',
                    label: 'Reload',
                    click (item, mainWindow) {
                        mainWindow.reload()
                    },
                    accelerator: 'CmdOrCtrl+R'
                },
                {
                    role: 'togglefullscreen',
                    label: 'Toggle Fullscreen',
                    click (item, mainWindow) {
                        if (mainWindow.isFullScreen()) {
                            mainWindow.setFullScreen(false)
                        } else {
                            mainWindow.setFullScreen(true)
                        }
                    },
                    accelerator: 'F11' // is most likely predefined on osx - results in: doesnt work on osx
                },
                {
                    role: 'minimize',
                    label: 'Minimize',
                    icon: path.join(__dirname, 'app/img/menu/window/window-minimize_red.png'),
                    click (item, mainWindow) {
                        if (mainWindow.isMinimized()) {
                            // mainWindow.restore();
                        } else {
                            mainWindow.minimize()
                        }
                    },
                    accelerator: 'CmdOrCtrl+M'
                },
                {
                    label: 'Maximize',
                    icon: path.join(__dirname, 'app/img/menu/window/window-maximize_red.png'),
                    click (item, mainWindow) {
                        if (mainWindow.isMaximized()) {
                            mainWindow.unmaximize()
                        } else {
                            mainWindow.maximize()
                        }
                    },
                    accelerator: 'CmdOrCtrl+K'
                }
            ]
        },

        // Menu: Help
        {
            role: 'help',
            label: 'Help',
            submenu: [
                // About
                {
                    role: 'about',
                    label: 'About',
                    click () {
                        openAboutWindow({
                            icon_path: path.join(__dirname, 'app/img/about/icon_about.png'),
                            open_devtools: false,
                            use_version_info: true,
                            win_options: // https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
                    {
                        autoHideMenuBar: true,
                        titleBarStyle: 'hidden',
                        minimizable: false, // not implemented on linux
                        maximizable: false, // not implemented on linux
                        movable: false, // not implemented on linux
                        resizable: false,
                        alwaysOnTop: true,
                        fullscreenable: false,
                        skipTaskbar: false
                    }
                        })
                    }
                },
                // open homepage
                {
                    label: 'Homepage',
                    icon: path.join(__dirname, 'app/img/menu/help/github_red.png'),
                    click () {
                        shell.openExternal(urlGitHubGeneral)
                    },
                    accelerator: 'F1'
                },
                // report issue
                {
                    label: 'Report issue',
                    icon: path.join(__dirname, 'app/img/menu/help/github_red.png'),
                    click () {
                        shell.openExternal(urlGitHubIssues)
                    },
                    accelerator: 'F2'
                },
                // open changelog
                {
                    label: 'Changelog',
                    icon: path.join(__dirname, 'app/img/menu/help/github_red.png'),
                    click () {
                        shell.openExternal(urlGitHubChangelog)
                    },
                    accelerator: 'F3'
                },
                // open Releases
                {
                    label: 'Releases',
                    icon: path.join(__dirname, 'app/img/menu/help/github_red.png'),
                    click () {
                        shell.openExternal(urlGitHubReleases)
                    },
                    accelerator: 'F4'
                },
                {
                    type: 'separator'
                },
                // Youtube-suggest
                {
                    label: 'Youtube Suggest',
                    click (item, mainWindow) {
                        mainWindow.webContents.send('openYoutubeSuggestDialog')
                    },
                    accelerator: 'CmdOrCtrl+S'
                },
                {
                    type: 'separator'
                },
                // Update
                {
                    label: 'Search media-dupes updates',
                    click (item, mainWindow) {
                        mainWindow.webContents.send('startSearchUpdatesVerbose')
                    },
                    enabled: true,
                    accelerator: 'F9'
                },
                {
                    type: 'separator'
                },

                // Console
                {
                    id: 'HelpConsole',
                    label: 'Console',
                    icon: path.join(__dirname, 'app/img/menu/help/terminal_red.png'),
                    click (item, mainWindow) {
                        mainWindow.webContents.toggleDevTools()
                    },
                    enabled: true,
                    accelerator: 'F12'
                },
                {
                    type: 'separator'
                },
                // SubMenu youtube-dl maintenance of help
                {
                    label: 'Youtube-DL',
                    icon: path.join(__dirname, 'app/img/menu/help/youtube_red.png'),
                    submenu: [
                        // Show supported sites
                        {
                            id: 'youtubeDlShowSupportedSites',
                            label: 'Show list of supported sites',
                            click () {
                                shell.openExternal(urlYoutubeDlSupportedSites)
                            },
                            enabled: true
                        },
                        // Clear cache in userData
                        {
                            id: 'youtubeDlBinaryPathReset',
                            label: 'Reset youtube-dl binary path',
                            click (item, mainWindow) {
                                mainWindow.webContents.send('youtubeDlBinaryPathReset')
                            },
                            enabled: true
                        },
                        // Force update (ignoring if there is an update available or not)
                        {
                            id: 'youtubeDlBinaryUpdateForce',
                            label: 'Force updating youtube-dl binary',
                            click (item, mainWindow) {
                                mainWindow.webContents.send('youtubeDlBinaryUpdate')
                            },
                            enabled: true
                        }
                    ]
                }
            ]
        }
    ])

    // use the menu
    Menu.setApplicationMenu(menu)
}

/**
* @function forceSingleAppInstance
* @summary Takes care that there is only 1 instance of this app running
* @description Takes care that there is only 1 instance of this app running
* @memberof main
*/
function forceSingleAppInstance () {
    if (!gotTheLock) {
        doLog('warn', 'forceSingleAppInstance ::: There is already another instance of media-dupes')
        app.quit() // quit the second instance
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our first instance window.
            if (mainWindow) {
                if (mainWindow === null) {
                    // do nothing - there is no mainwindow - most likely we are on macOS
                } else {
                    // mainWindow exists
                    if (mainWindow.isMinimized()) {
                        mainWindow.restore()
                    }
                    mainWindow.focus()
                }
            }
        })
    }
}

/**
* @function powerMonitorInit
* @summary Initialized a powermonitor after the app is ready
* @description Initialized a powermonitor after the app is ready. See: https://electronjs.org/docs/api/power-monitor
* @memberof main
*/
function powerMonitorInit () {
    const { powerMonitor } = require('electron') // This module cannot be used until the ready event of the app module is emitted.

    // suspend
    powerMonitor.on('suspend', () => {
        doLog('warn', 'powerMonitorInit ::: The system is going to sleep (event: suspend)')
        mainWindow.webContents.send('todoListTryToSave') // try to save the todolist - see #79
        powerMonitorNotify('warning', 'The system is going to sleep (event: suspend)', 0)
    })

    // resume
    powerMonitor.on('resume', () => {
        doLog('info', 'powerMonitorInit ::: The system is resuming (event: resume)')
        mainWindow.webContents.send('todoListCheck') // search if there are urls to restore
        powerMonitorNotify('info', 'The system resumed (event: resume)', 0)
    })

    // shutdown (Linux, macOS)
    powerMonitor.on('shutdown', () => {
        doLog('info', 'powerMonitorInit ::: The system is going to shutdown (event: shutdown)')
    })

    // OTHER SUPPORTED EVENTS:
    //
    // on-ac (Windows)
    // on-battery (Windows)
    // lock-screen (macOs, Windows)
    // unlock-screen (macOs, Windows)
}

/**
* @function powerMonitorNotify
* @summary Used to tell the renderer to display a notification
* @description Used to tell the renderer to display a notification
* @memberof main
*/
function powerMonitorNotify (messageType, messageText, messageDuration) {
    doLog('warn', 'powerMonitorNotify ::: Going to tell the renderer to show a powerMonitor notification')
    mainWindow.webContents.send('powerMonitorNotification', messageType, messageText, messageDuration)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//
// app.on('ready', createWindow)
app.on('ready', function () {
    forceSingleAppInstance() // check for single instance
    createWindowMain() // create the application UI
    createMenuMain() // create the application menu
    powerMonitorInit() //
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindowMain()
    }
})
