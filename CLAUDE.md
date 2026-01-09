# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Windows Tray Weather is an Electron-based system tray application that displays weather information. It uses Svelte 5 (with runes) for the UI and fetches weather data from Open-Meteo API.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (runs Vite dev server + Electron with hot reload)
npm run dev

# Run renderer and Electron separately (for debugging)
npm run dev:renderer  # Terminal 1 - starts Vite on port 5173
npm run dev:electron  # Terminal 2 - starts Electron pointing to dev server

# Build renderer only
npm run build:renderer

# Build production executable
npm run build

# Run production version
npm start
```

## Architecture Overview

### Process Model

This is a standard Electron multi-process application:

- **Main Process** (`src/main/*.cjs`): Node.js environment, manages windows, tray, and IPC
- **Renderer Process** (`src/renderer/`): Browser environment, runs Svelte UI
- **Preload Script** (`src/preload/preload.js`): Bridge between main and renderer via `contextBridge`

### Main Process Components

- **`main.cjs`**: Entry point, initializes tray and IPC handlers
- **`tray.cjs`**: Creates system tray icon with left-click (toggle popup) and right-click (context menu) handlers
- **`popup-window.cjs`**: Creates and manages the weather popup window that appears near the tray icon. Handles positioning, caching behavior, and auto-refresh after 20 minutes of inactivity
- **`settings-window.cjs`**: Creates modal settings window for location configuration
- **`ipc-handlers.cjs`**: IPC handlers for settings persistence (stored in `userData/settings.json`)

### Renderer Process Components

- **`settings-store.svelte.js`**: Svelte 5 runes-based reactive store that uses IPC to persist settings (latitude, longitude, tempUnit, speedUnit, timeFormat)
- **`weather-api.js`**: Open-Meteo API client with 15-minute sessionStorage cache
- **`location-api.js`**: IP-based geolocation using ip-api.com
- **Components**:
  - `Weather.svelte`: Main weather display with current conditions, 4-stat grid, hourly forecast, and daily graph
  - `TemperatureGraph.svelte`: SVG-based 5-day temperature graph
  - `Settings.svelte`: Location and unit configuration modal

### IPC Communication Patterns

The preload script exposes a limited API via `window.electronAPI`:

```javascript
// Settings
await window.electronAPI.getSettings()
await window.electronAPI.saveSettings(settings)

// Window controls
window.electronAPI.closePopup()

// Event listeners (with cleanup functions)
const cleanup = window.electronAPI.onRefreshWeather(callback)
const cleanup2 = window.electronAPI.onOpenSettings(callback)
```

### Build Configuration

- **Vite** (`vite.config.mjs`): Builds renderer from `src/renderer/` to `out/` directory. Uses Svelte plugin with runes enabled
- **Electron Builder** (`package.json` build config): Packages app with `out/` unpacked from asar for runtime access

### Loading Strategy

The popup window uses different loading strategies:
- **Development**: Loads from `VITE_DEV_SERVER_URL` (http://localhost:5173)
- **Production**: Loads from `out/index.html`, handling asar unpacking (`app.asar.unpacked`)

### Cache and Refresh Behavior

- Weather API responses are cached in sessionStorage for 15 minutes
- Popup auto-refreshes weather data if 20+ minutes have passed since last shown (see `popup-window.cjs:141-148`)
- Settings changes trigger immediate weather refresh via IPC event

### State Management

Settings use Svelte 5 runes (`$state`) with IPC synchronization. When settings are saved:
1. Renderer calls `saveSettings()` via IPC
2. Main process writes to `userData/settings.json`
3. Main process sends `refresh-weather` event to popup
4. Popup reloads weather with new settings

### File Naming Convention

- Main process files use `.cjs` extension (CommonJS for Electron compatibility)
- Renderer files use `.js` extension (ES modules for Vite)
- Svelte components use `.svelte` extension
- Svelte 5 reactive modules use `.svelte.js` extension

## Key Technical Details

- **Svelte 5 Runes**: This project uses Svelte 5 with runes mode enabled (`runes: true` in vite.config.mjs)
- **Single Instance**: App enforces single instance via `requestSingleInstanceLock()`
- **Window Behavior**: Popup hides on blur, doesn't quit app when closed
- **Tray Icon**: Base64-encoded PNG embedded in `tray.cjs`
- **No API Key Required**: Open-Meteo API is free and doesn't require authentication
