const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { getPopupWindow } = require('./popup-window.cjs');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

const defaultSettings = {
  latitude: null,
  longitude: null,
  tempUnit: 'fahrenheit',
  speedUnit: 'mph',
  timeFormat: '12hr'
};

async function loadSettings() {
  try {
    const data = await fs.readFile(settingsPath, 'utf8');
    const stored = JSON.parse(data);
    return { ...defaultSettings, ...stored };
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    return { ...defaultSettings };
  }
}

async function saveSettings(settings) {
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: error.message };
  }
}

function setupIPCHandlers() {
  // Get settings
  ipcMain.handle('get-settings', async () => {
    return await loadSettings();
  });

  // Save settings
  ipcMain.handle('save-settings', async (event, settings) => {
    const result = await saveSettings(settings);
    if (result.success) {
      // Notify the weather popup to refresh
      const popup = getPopupWindow();
      if (popup) {
        popup.webContents.send('refresh-weather');
      }
    }
    return result;
  });

  // Close popup window
  ipcMain.on('close-popup', () => {
    const popup = getPopupWindow();
    if (popup) {
      popup.hide();
    }
  });
}

module.exports = { setupIPCHandlers, loadSettings, saveSettings };
