const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const SerialPort = require('serialport');
const fs = require('fs').promises;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let profilePath = path.join(__dirname, "/Settings/user.profile.json");

let tray = null;
const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // DEBUGGING
    // height: 600,
    // width: 800,
    show:false,
    webPreferences:{
      nodeIntegration:true
    }
  });

  app.allowRendererProcessReuse = false;

  var iconPath = path.join(__dirname, '/assets/electron_icon_dummy.ico');
  
  // Tray icon
  tray = new Tray(iconPath);

  // Context menu template
  let template = [
    { label: "LEDApp", type: "normal" },
    { type: 'separator'},
    { label: "Switch Ports" },
  ];

  // Get port list
  var portsList = [];
  await SerialPort.list().then(ports => {
    ports.forEach(port => portsList.push(port.path));
  }).catch(console.error);

  // For each port, add it to the context menu template
  portsList.forEach(port => {
    template.push({
      label: port,
      click() {
        var port = arguments[0].label;
        changePort(port);
      }
    });
  });

  // Set default write
  
  // First, read the file
  var userProfile;
  await fs.readFile(profilePath, {encoding:"utf-8"}).then(data => userProfile = data).catch(console.error);

  if (JSON.parse(userProfile).port.length == 0) {
    await writeProfile(portsList.length > 1 ? portsList[1] : portsList[0]);
  }

  // Make the context menu
  const contextMenu = Menu.buildFromTemplate(template.concat([
    { type: 'separator'},
    {
      label: 'Exit App',
      click: function() {
        app.exit();
      }
    }
  ]));

  tray.setToolTip("LEDApp");
  tray.setContextMenu(contextMenu);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

async function changePort(port) {
  console.log(`Port changing to: ${port}!`);

  // First, get current port
  var currentPort;
  await fs.readFile(profilePath, {encoding:"utf-8"}).then(data => currentPort = JSON.parse(data).port).catch(e => console.error(e));
  if (currentPort == port)return; // Check if current port is the same as port

  await writeProfile(port);
  app.relaunch();
  app.quit();
  return;
}

async function writeProfile(port) {
  return await fs.writeFile(profilePath, ` { "port": "${port}" } `);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
