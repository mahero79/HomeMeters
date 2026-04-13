const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 850,
    minWidth: 380,
    minHeight: 600,
    title: 'Home Meters | عداداتي',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow localStorage to persist
      partition: 'persist:homemeters'
    },
    // Window appearance
    show: false,  // Show after ready-to-show for smooth startup
    center: true,
    resizable: true,
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  // Handle external links - open in browser not in app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
