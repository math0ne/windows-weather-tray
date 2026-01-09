const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Window controls
  closePopup: () => ipcRenderer.send('close-popup'),

  // Event listeners
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', callback);
    return () => ipcRenderer.removeListener('open-settings', callback);
  },
  onRefreshWeather: (callback) => {
    ipcRenderer.on('refresh-weather', callback);
    return () => ipcRenderer.removeListener('refresh-weather', callback);
  }
});
