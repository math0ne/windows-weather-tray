import { app, BrowserWindow } from 'electron';
import path from 'path';
import { createTray } from './tray.js';
import { setupIPCHandlers } from './ipc-handlers.js';

let tray = null;

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  // Keep app running with just tray icon
  // Don't quit on window close
});

app.on('ready', () => {
  // Set up IPC handlers for settings
  setupIPCHandlers();

  // Create system tray icon
  tray = createTray();

  console.log('Tray weather app started');
});

// Handle quit properly
app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
