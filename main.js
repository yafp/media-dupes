// Modules to control application life and create native browser window
const { app, BrowserWindow, electron, ipcMain } = require('electron')
const shell = require("electron").shell;
const path = require('path')



// ----------------------------------------------------------------------------
// ERROR-HANDLING
// ----------------------------------------------------------------------------
//
//require("./app/js/crashReporting.js");
//myUndefinedFunctionFromMain();




// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 600,
    height: 900,
    minHeight: 900,
    icon: path.join(__dirname, "app/img/icon/icon.png"),

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })


  // Call from renderer: Open folder with user configured services
ipcMain.on("openUserDownloadFolder", (event) => {

        if (shell.openItem(downloadTarget) === true)
        {
            console.log("Opened the user download folder (ipcMain)");
        }
        else
        {
            console.log("Failed to open the user download folder (ipcMain)");
        }
    });



  const downloadTarget = app.getPath('downloads')
  global.sharedObj = {prop1: downloadTarget};






  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
