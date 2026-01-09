const { BrowserWindow, screen, app } = require('electron');
const path = require('path');

let popupWindow = null;
let lastShownTime = null;

function createPopupWindow(tray) {
  if (popupWindow) {
    return popupWindow;
  }

  const trayBounds = tray.getBounds();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Popup dimensions
  const popupWidth = 350;
  const popupHeight = 355;

  // Position near tray icon (bottom-right on Windows)
  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (popupWidth / 2));
  let y = Math.round(trayBounds.y + trayBounds.height);

  console.log('Tray bounds:', trayBounds);
  console.log('Initial popup position:', { x, y });

  // Ensure popup stays on screen
  if (x + popupWidth > screenWidth) {
    x = screenWidth - popupWidth;
  }
  if (y + popupHeight > screenHeight) {
    y = trayBounds.y - popupHeight;
    console.log('Popup positioned above tray');
  }

  // Move up 4px from calculated position
  y = y - 4;
  console.log('Final popup position after -4px:', { x, y });

  const preloadPath = path.join(__dirname, '../preload/preload.js');
  console.log('Preload script path:', preloadPath);

  popupWindow = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x: x,
    y: y,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#1E1E1E',  // Prevent white flash on load
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      cache: false  // Disable caching
    }
  });

  // Clear cache in development
  if (process.env.VITE_DEV_SERVER_URL) {
    popupWindow.webContents.session.clearCache();
  }

  // Load the renderer
  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.VITE_DEV_SERVER_URL) {
    popupWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, files are unpacked from asar
    const appPath = app.getAppPath();
    // When unpacked from asar, they're in app.asar.unpacked
    let indexPath = path.join(appPath, 'out', 'index.html');

    // Check if we're running from asar
    if (appPath.includes('app.asar')) {
      indexPath = path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'out', 'index.html');
    }

    console.log('App path:', appPath);
    console.log('Loading renderer from:', indexPath);
    popupWindow.loadFile(indexPath);
  }

  // Log any errors and console messages
  popupWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  popupWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message);
  });

  // Hide on blur
  popupWindow.on('blur', () => {
    popupWindow.hide();
  });

  // Clean up when closed
  popupWindow.on('closed', () => {
    popupWindow = null;
  });

  return popupWindow;
}

function togglePopup(tray) {
  if (!popupWindow) {
    popupWindow = createPopupWindow(tray);
  }

  if (popupWindow.isVisible()) {
    popupWindow.hide();
  } else {
    // Update position before showing
    const trayBounds = tray.getBounds();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const popupWidth = 350;
    const popupHeight = 355;

    let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (popupWidth / 2));
    let y = Math.round(trayBounds.y + trayBounds.height);

    if (x + popupWidth > screenWidth) {
      x = screenWidth - popupWidth;
    }
    if (y + popupHeight > screenHeight) {
      // Popup appears above tray
      y = trayBounds.y - popupHeight;
    }

    // Move up 9px from calculated position (subtract to move up)
    y = y - 9;

    popupWindow.setPosition(x, y);

    // Check if 20+ minutes have passed since last shown
    const now = Date.now();
    const twentyMinutes = 20 * 60 * 1000;

    if (lastShownTime !== null && (now - lastShownTime) >= twentyMinutes) {
      // Trigger weather refresh if 20+ minutes have passed
      popupWindow.webContents.send('refresh-weather');
    }

    lastShownTime = now;
    popupWindow.show();
  }
}

function getPopupWindow() {
  return popupWindow;
}

module.exports = { createPopupWindow, togglePopup, getPopupWindow };
