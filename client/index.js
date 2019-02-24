const { app, BrowserWindow } = require('electron');
const socket = require('./socket');

let win = null;

function createWindow() {
  win = new BrowserWindow({ width: 1280, height: 720, center: true, minWidth: 800, minHeight: 600 });
  win.loadFile('./client/main_menu/main_menu.html');
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    socket.emit('disconnection');
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
