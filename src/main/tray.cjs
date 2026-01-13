const { app, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { createPopupWindow, togglePopup, getPopupWindow } = require('./popup-window.cjs');
const { openSettings } = require('./settings-window.cjs');

let tray = null;

function createTray() {
  // Load tray icon from assets directory (16x16 PNG)
  const iconPath = path.join(__dirname, '../assets/trayv2.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);
  tray.setToolTip('Tray Weather');

  // Handle left click - show/hide popup
  tray.on('click', () => {
    togglePopup(tray);
  });

  // Handle right click - show context menu
  tray.on('right-click', () => {
    // Check current startup setting
    const loginSettings = app.getLoginItemSettings();
    const isEnabled = loginSettings.openAtLogin;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Set Location',
        click: () => {
          openSettings();
        }
      },
      {
        label: 'Run at Startup',
        type: 'checkbox',
        checked: isEnabled,
        click: () => {
          const currentSettings = app.getLoginItemSettings();
          const newState = !currentSettings.openAtLogin;

          app.setLoginItemSettings({
            openAtLogin: newState,
            openAsHidden: true,
            name: 'Tray Weather',
            args: []
          });
        }
      },
      {
        label: 'Exit',
        click: () => {
          app.quit();
        }
      }
    ]);
    tray.popUpContextMenu(contextMenu);
  });

  return tray;
}

module.exports = { createTray };
