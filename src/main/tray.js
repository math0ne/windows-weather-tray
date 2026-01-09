import { app, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { createPopupWindow, togglePopup, getPopupWindow } from './popup-window.js';

let tray = null;

function createTray() {
  // Create a simple tray icon
  // Use a simple base64 encoded 16x16 PNG (white circle on transparent background)
  const iconDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABkSURBVDiN7ZKxDYAwDAQvYgRGYf8VWIENCgUdDaIgXeRGQkjcJ9n3Z1uWfwHOAM65BawAZradmQGotSallBRjvANYa5+ICABCCAsAaq0IIUBEAGCMQUSglMLdH2C+fgEPvAGfty9CFuDo2wAAAABJRU5ErkJggg==';
  const icon = nativeImage.createFromDataURL(iconDataURL);

  tray = new Tray(icon);
  tray.setToolTip('Tray Weather');

  // Handle left click - show/hide popup
  tray.on('click', () => {
    togglePopup(tray);
  });

  // Handle right click - show context menu
  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Set Location',
        click: () => {
          const popup = getPopupWindow();
          if (popup) {
            popup.webContents.send('open-settings');
            if (!popup.isVisible()) {
              popup.show();
            }
          } else {
            // Create popup if it doesn't exist
            const newPopup = createPopupWindow(tray);
            newPopup.webContents.once('did-finish-load', () => {
              newPopup.webContents.send('open-settings');
              newPopup.show();
            });
          }
        }
      },
      {
        type: 'separator'
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

export { createTray };
