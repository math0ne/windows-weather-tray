# Windows Tray Weather

A minimalist Windows system tray application that displays weather information with full forecast details.

![Screenshot](images/screenshot.png)

## Features

- **System Tray Integration**: Lives in your Windows system tray
- **Full Weather Display**:
  - Current temperature and conditions
  - 4-stat grid (humidity, precipitation, wind, feels-like)
  - 5-interval hourly forecast
  - 5-day temperature graph (SVG)
- **Auto Location Detection**: Automatically detects your location on first run using IP geolocation
- **Manual Location Override**: Set custom coordinates via settings
- **Customizable Units**: Toggle between Fahrenheit/Celsius and mph/kph
- **15-minute Weather Cache**: Reduces API calls while keeping data fresh

## Technology Stack

- **Electron**: Desktop application framework
- **Svelte 5**: Reactive UI framework
- **Vite**: Build tool
- **Open-Meteo API**: Free weather data (no API key required)
- **ip-api.com**: Location detection

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Build the renderer
npm run build:renderer

# Run the application
npm start
```

### Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Or run renderer and electron separately
npm run dev:renderer  # Terminal 1
npm run dev:electron  # Terminal 2
```

### Building for Production

```bash
# Build the application
npm run build

# This will create a distributable .exe in the dist/ folder
```

## Usage

1. **First Run**: The app will automatically detect your location via IP geolocation
2. **Tray Icon**: Look for the weather icon in your Windows system tray
3. **Left Click**: Show/hide the weather popup
4. **Right Click**: Open context menu with options:
   - **Set Location**: Manually configure your latitude/longitude and units
   - **Exit**: Close the application

## Settings

Access settings by right-clicking the tray icon and selecting "Set Location":

- **Latitude**: Your location latitude (-90 to 90)
- **Longitude**: Your location longitude (-180 to 180)
- **Temperature Unit**: Fahrenheit or Celsius
- **Wind Speed Unit**: mph or kph
- **Time Format**: 12-hour or 24-hour

Settings are persisted between application restarts.

## Project Structure

```
windows-tray-weather/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.cjs         # App entry point
│   │   ├── tray.cjs         # Tray icon management
│   │   ├── popup-window.cjs # Popup window creation
│   │   └── ipc-handlers.cjs # Settings persistence
│   ├── renderer/             # Renderer process (UI)
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── Weather.svelte
│   │   │   │   ├── TemperatureGraph.svelte
│   │   │   │   └── Settings.svelte
│   │   │   ├── weather-api.js
│   │   │   ├── location-api.js
│   │   │   └── settings-store.js
│   │   ├── App.svelte
│   │   └── main.js
│   └── preload/
│       └── preload.js        # IPC bridge
├── out/                      # Built renderer files
├── dist/                     # Distribution files
└── package.json
```

## Credits

Weather functionality adapted from [re-start](https://github.com/math0ne/re-start).

## License

MIT
