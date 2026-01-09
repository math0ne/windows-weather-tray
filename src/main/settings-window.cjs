const { BrowserWindow, screen } = require('electron');
const path = require('path');

let settingsWindow = null;

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return settingsWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Settings window dimensions
  const settingsWidth = 500;
  const settingsHeight = 615;

  // Center on screen
  const x = Math.round((screenWidth - settingsWidth) / 2);
  const y = Math.round((screenHeight - settingsHeight) / 2);

  const preloadPath = path.join(__dirname, '../preload/preload.js');

  settingsWindow = new BrowserWindow({
    width: settingsWidth,
    height: settingsHeight,
    x: x,
    y: y,
    show: false,
    frame: false,
    resizable: false,
    backgroundColor: '#1E1E1E',
    title: 'Weather Settings',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      cache: false
    }
  });

  // Load settings page - we'll use a query parameter to show settings
  if (process.env.VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(process.env.VITE_DEV_SERVER_URL + '?settings=true');
  } else {
    const { app } = require('electron');
    const appPath = app.getAppPath();
    let indexPath = path.join(appPath, 'out', 'index.html');

    if (appPath.includes('app.asar')) {
      indexPath = path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'out', 'index.html');
    }

    settingsWindow.loadFile(indexPath, { query: { settings: 'true' } });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  // Clean up when closed
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

function openSettings() {
  createSettingsWindow();
}

function closeSettings() {
  if (settingsWindow) {
    settingsWindow.close();
  }
}

module.exports = { openSettings, closeSettings };
