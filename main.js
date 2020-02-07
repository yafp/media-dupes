/**
* @file Contains the main.js code of media-dupes
* @author yafp
* @namespace main
*/

const { app, BrowserWindow, electron, ipcMain, Menu } = require('electron')
const shell = require('electron').shell
const path = require('path')
const fs = require('fs')
const openAboutWindow = require('about-window').default // for: about-window

// media-dupes module
const utils = require('./app/js/modules/utils.js')

// npm-check -s // to ignore all non-referenced node_modules

// ----------------------------------------------------------------------------
// ERROR-HANDLING
// ----------------------------------------------------------------------------
require('./app/js/errorReporting.js')
// myUndefinedFunctionFromMain();

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

const { urlGitHubGeneral, urlGitHubIssues, urlGitHubChangelog, urlGitHubReleases } = require('./app/js/modules/githubUrls.js') // project-urls

// Caution: Warning since electron 8
// app.allowRendererProcessReuse = false // see: https://github.com/electron/electron/issues/18397

// mainWindow: minimal window size
const minimalWindowHeight = 760
const minimalWindowWidth = 620

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
    const prefix = '[   Main   ] '
    const log = require('electron-log')
    // electron-log can: error, warn, info, verbose, debug, silly
    switch (type) {
    case 'info':
        log.info(prefix + message)
        break

    case 'warn':
        log.warn(prefix + message)
        break

    case 'error':
        log.error(prefix + message)
        break

    default:
        log.silly(prefix + message)
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

    // Create the browser window.
    settingsWindow = new BrowserWindow({
        // parent: mainWindow,
        modal: true,
        frame: true, // false results in a borderless window. Needed for custom titlebar
        titleBarStyle: 'default', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        backgroundColor: '#ffffff', // since 0.3.0
        show: true, // hide until: ready-to-show
        center: true, // Show window in the center of the screen. (since 0.3.0)
        width: 800,
        minWidth: 800,
        // resizable: false, // this conflickts with opening dev tools
        minimizable: false, // not implemented on linux
        maximizable: false, // not implemented on linux
        height: 700,
        minHeight: 700,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true // introduced in 0.3.0
        }
    })

    // and load the setting.html of the app.
    settingsWindow.loadFile('app/settings.html')

    // window needs no menu
    settingsWindow.removeMenu()

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
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        settingsWindow = null

        // unblur main UI
        mainWindow.webContents.send('unblurMainUI')
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

    // Create the browser window.
    distractionWindow = new BrowserWindow({
        frame: true, // false results in a borderless window. Needed for custom titlebar
        backgroundColor: '#ffffff', // since 0.3.0
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

    // and load the setting.html of the app.
    distractionWindow.loadFile('app/distraction.html')

    // window needs no menu
    distractionWindow.removeMenu()

    // Emitted before the window is closed.
    distractionWindow.on('close', function () {
        doLog('info', 'createWindowDistraction ::: distractionWindow will close (event: close)')
    })

    // Emitted when the window is closed.
    distractionWindow.on('closed', function (event) {
        doLog('info', 'createWindowDistraction ::: distractionWindow is closed (event: closed)')
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        distractionWindow = null
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

        // size
        windowWidth = data.bounds.width
        windowHeight = data.bounds.height

        // position
        windowPositionX = data.bounds.x
        windowPositionY = data.bounds.y

        doLog('info', 'createWindowMain ::: Got last window position and size information from _' + customUserDataPath + '_.')
    } catch (e) {
        doLog('warn', 'createWindowMain ::: No last window position and size information found in _' + customUserDataPath + '_. Using fallback values')

        // set some default values for window size
        windowWidth = minimalWindowWidth
        windowHeight = minimalWindowHeight
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        frame: false, // false results in a borderless window. Needed for custom titlebar
        titleBarStyle: 'hidden', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        backgroundColor: '#ffffff', // since 0.3.0
        show: false, // hide until: ready-to-show
        center: true, // Show window in the center of the screen. (since 0.3.0)
        width: windowWidth,
        minWidth: minimalWindowWidth,
        height: windowHeight,
        minHeight: minimalWindowHeight,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true, // introduced in 0.3.0
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // Restore window position if possible
    //
    // requirements: found values in MediaDupesWindowPosSize.json from the previous session
    if ((typeof windowPositionX !== 'undefined') && (typeof windowPositionY !== 'undefined')) {
        mainWindow.setPosition(windowPositionX, windowPositionY)
    }

    // Call from renderer: Open download folder
    ipcMain.on('openUserDownloadFolder', (event, userSettingValue) => {
        doLog('info', 'createWindowMain ::: Trying to open the download directory _' + userSettingValue + '_.')

        // try to open it
        if (shell.openItem(userSettingValue) === true) {
            doLog('info', 'createWindowMain :::  Opened the media-dupes download folder (ipcMain)')
        } else {
            doLog('error', 'createWindowMain ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer: Open settings folder
    ipcMain.on('settingsFolderOpen', (event) => {
        doLog('info', 'createWindowMain ::: Opened the users settings folder (ipcMain)')
        const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings') // change path for userSettings

        if (shell.openItem(userSettingsPath) === true) {
            doLog('info', 'createWindowMain ::: Opened the media-dupes subfolder in users download folder (ipcMain)')
        } else {
            doLog('error', 'createWindowMain ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer:  Urgent window
    ipcMain.on('makeWindowUrgent', function () {
        mainWindow.flashFrame(true)
    })

    // Call from renderer: Option: load main UI
    /*
    ipcMain.on('mainUiLoad', function () {
        mainWindow.loadFile('app/index.html')
    })
    */

    // Call from renderer: Option: load settings UI
    ipcMain.on('settingsUiLoad', function () {
        createWindowSettings()
    })

    // Call from renderer: Option: load distraction UI
    ipcMain.on('startDistraction', function () {
        createWindowDistraction()
    })

    // Call from renderer: Update property from globalObj
    ipcMain.on('globalObjectSet', function (event, property, value) {
        doLog('info', 'Set property _' + property + '_ to new value: _' + value + '_')
        global.sharedObj[property] = value

        const isDev = require('electron-is-dev')
        if (isDev) {
            console.warn(global.sharedObj)
        }
    })

    // Global object
    //
    // Settings UI
    var enableVerboseMode = false
    var enableErrorReporting = true
    var downloadDir = app.getPath('downloads') // Detect the default-download-folder of the user from the OS
    var audioFormat = 'mp3' // mp3 is the default
    var confirmedDisclaimer = false
    // Main UI
    var applicationState = 'idle' // default is idle
    var todoListStateEmpty = true // is empty by default

    global.sharedObj = {
        // settings UI
        enableErrorReporting: enableErrorReporting,
        enableVerboseMode: enableVerboseMode,
        downloadDir: downloadDir,
        audioFormat: audioFormat,
        confirmedDisclaimer: confirmedDisclaimer,

        // main UI
        applicationState: applicationState,
        todoListStateEmpty: todoListStateEmpty
    }

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the web page becomes unresponsive.
    mainWindow.on('unresponsive', function () {
        doLog('warn', 'createWindowMain ::: mainWindow is now unresponsive (event: unresponsive)')
    })

    // Emitted when the unresponsive web page becomes responsive again.
    mainWindow.on('responsive', function () {
        doLog('info', 'createWindowMain ::: mainWindow is now responsive again (event: responsive)')
    })

    // Emitted when the web page has been rendered (while not being shown) and window can be displayed without a visual flash.
    mainWindow.on('ready-to-show', function () {
        doLog('info', 'createWindowMain ::: mainWindow is now ready, so show it and then focus it (event: ready-to-show)')
        mainWindow.show()
        mainWindow.focus()

        mainWindow.webContents.send('blurMainUI') // blur the main UI

        // do some checks & routines once at start of the application
        mainWindow.webContents.send('startCheckingDependencies') // check application dependencies
        mainWindow.webContents.send('startDisclaimerCheck') // check if disclaimer must be shown
        mainWindow.webContents.send('startSearchUpdatesSilent') // search silently for media-dupes updates
        mainWindow.webContents.send('youtubeDlSearchUpdatesSilent') // search silently for youtube-dl binary updates
        mainWindow.webContents.send('todoListCheck') // search if there are urls to restore
        mainWindow.webContents.send('unblurMainUI') // unblur the main UI
    })

    // Emitted before the window is closed.
    mainWindow.on('close', function (event) {
        doLog('info', 'createWindowMain ::: mainWindow will close (event: close)')

        var curState = global.sharedObj.applicationState // get applicationState
        doLog('info', 'createWindowMain ::: Current application state is: _' + curState + '_.')

        if (curState === 'Download in progress') {
            // since electron7 showMessageBox no longer blocks the close. Therefor we are using showMessageBoxSync
            var choiceA = require('electron').dialog.showMessageBoxSync(this,
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
        doLog('info', 'createWindowMain ::: Current todo list empty state is: _' + curTodoListStateEmpty + '_.')
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
                doLog('info', 'createWindowMain ::: User wants to save his todo list')
                mainWindow.webContents.send('todoListTryToSave')
            } else {
                doLog('info', 'createWindowMain ::: User DOES NOT want to save his todo list')
            }
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

    // Emitted when the window is closed.
    mainWindow.on('closed', function (event) {
        doLog('info', 'createWindowMain ::: mainWindow is closed (event: closed)')
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

/**
* @function createMenuMain
* @summary Creates the application menu
* @description Creates the application menu
* @memberof main
*/
function createMenuMain () {
    // doLog('createMenu', __dirname)

    // Create a custom menu
    var menu = Menu.buildFromTemplate([

        // Menu: File
        {
            label: 'File',
            submenu: [
                // Settings
                {
                    label: 'Settings',
                    // icon: __dirname + '/app/img/icon/icon.png',
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
                    accelerator: 'CmdOrCtrl+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
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

        // Menu: Window
        {
            label: 'Window',
            submenu: [
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
                    click () {
                        shell.openExternal(urlGitHubGeneral)
                    },
                    accelerator: 'F1'
                },
                // report issue
                {
                    label: 'Report issue',
                    click () {
                        shell.openExternal(urlGitHubIssues)
                    },
                    accelerator: 'F2'
                },
                // open changelog
                {
                    label: 'Changelog',
                    click () {
                        shell.openExternal(urlGitHubChangelog)
                    },
                    accelerator: 'F3'
                },
                // open Releases
                {
                    label: 'Releases',
                    click () {
                        shell.openExternal(urlGitHubReleases)
                    },
                    accelerator: 'F4'
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
                    submenu: [
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
                // #134
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
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindowMain()
})
