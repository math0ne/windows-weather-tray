import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let popupWindow = null;

function createPopupWindow(tray) {
  if (popupWindow) {
    return popupWindow;
  }

  const trayBounds = tray.getBounds();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Popup dimensions
  const popupWidth = 400;
  const popupHeight = 500;

  // Position near tray icon (bottom-right on Windows)
  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (popupWidth / 2));
  let y = Math.round(trayBounds.y + trayBounds.height + 4);

  // Ensure popup stays on screen
  if (x + popupWidth > screenWidth) {
    x = screenWidth - popupWidth;
  }
  if (y + popupHeight > screenHeight) {
    y = trayBounds.y - popupHeight - 4;
  }

  popupWindow = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x: x,
    y: y,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the renderer
  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.VITE_DEV_SERVER_URL) {
    popupWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    popupWindow.loadFile(path.join(__dirname, '../../out/index.html'));
  }

  // Hide on blur
  popupWindow.on('blur', () => {
    if (!popupWindow.webContents.isDevToolsOpened()) {
      popupWindow.hide();
    }
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
    popupWindow.show();
  }
}

function getPopupWindow() {
  return popupWindow;
}

export { createPopupWindow, togglePopup, getPopupWindow };
