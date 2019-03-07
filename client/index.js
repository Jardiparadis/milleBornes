const { app, BrowserWindow } = require('electron');
const socket = require('./socket');

let win = null;

function createWindow() {
  win = new BrowserWindow({ width: 1600, height: 900, fullscreen: false , enter: true, resizable: false });
  win.loadFile('./client/main_menu/main_menu.html');
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
