/**
 * @file Contains the main.js code
 * @author yafp
 */

// Modules to control application life and create native browser window
const { app, BrowserWindow, electron, ipcMain, Menu } = require('electron')
const shell = require('electron').shell
const path = require('path')
const fs = require('fs')
const openAboutWindow = require('about-window').default // for: about-window

// The following requires are not really needed - but it mutes 'npm-check' regarding NOTUSED
require('jquery')
require('@fortawesome/fontawesome-free')
require('popper.js')
// CAUTION: jquery, fontawesome and popper might cost startup time
// require('bootstrap'); // this breaks everything, whyever

// ----------------------------------------------------------------------------
// ERROR-HANDLING
// ----------------------------------------------------------------------------
//
require('./app/js/errorReporting.js')
// myUndefinedFunctionFromMain();

// ----------------------------------------------------------------------------
// VARIABLES & CONSTANTS
// ----------------------------------------------------------------------------
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let settingsWindow

const gotTheLock = app.requestSingleInstanceLock() // for: single-instance handling
const defaultUserDataPath = app.getPath('userData') // for: storing window position and size

const { urlGitHubGeneral, urlGitHubIssues, urlGitHubChangelog, urlGitHubReleases } = require('./app/js/modules/githubUrls.js') // project-urls

// minimal window size
const minimalWindowHeight = 760
const minimalWindowWidth = 620

// ----------------------------------------------------------------------------
// FUNCTIONS
// ----------------------------------------------------------------------------

/**
* @name doLog
* @summary Writes console output for the main process
* @description Writes console output for the main process
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

function createSettingsWindow () {
    doLog('info', 'createSettingsWindow ::: Creating the settings window')

    // Create the browser window.
    settingsWindow = new BrowserWindow({
        parent: mainWindow,
        frame: true, // false results in a borderless window. Needed for custom titlebar
        // titleBarStyle: 'hidden', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        backgroundColor: '#ffffff', // since 0.3.0
        show: true, // hide until: ready-to-show
        center: true, // Show window in the center of the screen. (since 0.3.0)
        width: 800,
        minWidth: 800,
        height: 600,
        minHeight: 600,
        icon: path.join(__dirname, 'app/img/icon/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true, // introduced in 0.3.0
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    settingsWindow.loadFile('app/settings.html')

    // window needs no menu
    settingsWindow.removeMenu()

    // Emitted before the window is closed.
    //
    settingsWindow.on('close', function () {
        doLog('info', 'createSettingsWindow ::: settingsWindow will close (event: close)')
    })

    // Emitted when the window is closed.
    //
    settingsWindow.on('closed', function (event) {
        doLog('info', 'createSettingsWindow ::: settingsWindow is closed (event: closed)')
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        settingsWindow = null
    })
}

/**
* @name createWindow
* @summary Creates the mainWindow
* @description Creates the mainWindow (restores window position and size of possible)
*/
function createWindow () {
    doLog('info', 'createWindow ::: Starting to create the application windows')

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

        doLog('info', 'createWindow ::: Got last window position and size information from _' + customUserDataPath + '_.')
    } catch (e) {
        doLog('warn', 'createWindow ::: No last window position and size information found in _' + customUserDataPath + '_. Using fallback values')

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
        doLog('info', 'createWindow ::: Trying to open the download directory _' + userSettingValue + '_.')

        // try to open it
        if (shell.openItem(userSettingValue) === true) {
            doLog('info', 'createWindow :::  Opened the media-dupes download folder (ipcMain)')
        } else {
            doLog('error', 'createWindow ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer: Open download folder
    ipcMain.on('settingsFolderOpen', (event) => {
        doLog('info', 'createWindow ::: Opened the users settings folder (ipcMain)')

        // change path for userSettings
        const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')

        if (shell.openItem(userSettingsPath) === true) {
            doLog('info', 'createWindow ::: Opened the media-dupes subfolder in users download folder (ipcMain)')
        } else {
            doLog('error', 'createWindow ::: Failed to open the user download folder (ipcMain)')
        }
    })

    // Call from renderer:  Urgent window
    ipcMain.on('makeWindowUrgent', function () {
        mainWindow.flashFrame(true)
    })

    // Call from renderer: Option: load main UI
    ipcMain.on('mainUiLoad', function () {
        mainWindow.loadFile('app/index.html')
    })

    // Call from renderer: Option: load settings UI
    ipcMain.on('settingsUiLoad', function () {
        createSettingsWindow()
    })

    var downloadTarget = app.getPath('downloads') // Detect the default-download-folder of the user from the OS
    var audioFormat = 'mp3' // mp3 is the default
    global.sharedObj = {
        downloadFolder: downloadTarget,
        audioFormat: audioFormat

    }

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // show the formerly hidden main window as it is fully ready now
    mainWindow.on('ready-to-show', function () {
        mainWindow.show()
        mainWindow.focus()
        doLog('info', 'createWindow ::: mainWindow is now ready, so show it and then focus it (event: ready-to-show)')

        // do some checks & routines once at start of the application
        mainWindow.webContents.send('startCheckingDependencies') // check application dependencies
        mainWindow.webContents.send('startDisclaimerCheck') // check if disclaimer must be shown
        mainWindow.webContents.send('startSearchUpdatesSilent') // search silently for media-dupes updates
        mainWindow.webContents.send('youtubeDlSearchUpdatesSilent') // seach silently for youtube-dl binary updates
    })

    // Emitted before the window is closed.
    //
    mainWindow.on('close', function () {
        doLog('info', 'createWindow ::: mainWindow will close (event: close)')

        // get window position and size
        var data = {
            bounds: mainWindow.getBounds()
        }

        // define target path (in user data)
        var customUserDataPath = path.join(defaultUserDataPath, 'MediaDupesWindowPosSize.json')

        // try to write
        fs.writeFile(customUserDataPath, JSON.stringify(data), function (err) {
            if (err) {
                doLog('error', 'createWindow ::: storing window-position and -size of mainWindow in  _' + customUserDataPath + '_ failed with error: _' + err + '_ (event: close)')
                return console.log(err)
            }

            doLog('info', 'createWindow ::: mainWindow stored window-position and -size in _' + customUserDataPath + '_ (event: close)')
        })
    })

    // Emitted when the window is closed.
    //
    mainWindow.on('closed', function (event) {
        doLog('info', 'createWindow ::: mainWindow is closed (event: closed)')
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

/**
* @name createMenu
* @summary Creates the application menu
* @description Creates the application menu
*/
function createMenu () {
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
                    // icon: __dirname + '/app/img/address-book.svg',
                    // icon: __dirname + '/node_modules/@fortawesome/fontawesome-free/svgs/regular/address-book.svg',
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
* @name forceSingleAppInstance
* @summary Takes care that there is only 1 instance of this app running
* @description Takes care that there is only 1 instance of this app running
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//
// app.on('ready', createWindow)
app.on('ready', function () {
    forceSingleAppInstance() // check for single instance
    createWindow() // create the application UI
    createMenu() // create the application menu
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
    if (mainWindow === null) createWindow()
})
