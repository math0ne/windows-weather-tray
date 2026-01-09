/**
 * Settings store adapted for Electron
 * Uses IPC to persist settings via main process instead of localStorage
 */

// Initialize with defaults, will be loaded asynchronously
export let settings = $state({
    latitude: null,
    longitude: null,
    tempUnit: 'fahrenheit',
    speedUnit: 'mph',
    timeFormat: '12hr'
})

// Load settings from main process
export async function loadSettings() {
    const loadedSettings = await window.electronAPI.getSettings()
    // Update all properties at once to avoid triggering effects multiple times
    Object.assign(settings, loadedSettings)
    return settings
}

export async function saveSettings(newSettings) {
    const result = await window.electronAPI.saveSettings(newSettings)
    if (result.success) {
        // Update all properties at once to avoid triggering effects multiple times
        Object.assign(settings, newSettings)
    }
    return result
}

export function updateSettings(updates) {
    const updated = { ...settings, ...updates }
    return saveSettings(updated)
}
