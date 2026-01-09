<script>
    import { onMount, onDestroy, untrack } from 'svelte'
    import WeatherAPI from '../weather-api.js'
    import LocationAPI from '../location-api.js'
    import TemperatureGraph from './TemperatureGraph.svelte'
    import { settings, loadSettings, saveSettings } from '../settings-store.svelte.js'

    let current = $state(null)
    let forecast = $state([])
    let dailyForecast = $state([])
    let loading = $state(false)
    let error = $state(null)
    let hasInitialized = false

    const weatherAPI = new WeatherAPI()
    const locationAPI = new LocationAPI()

    // Settings change effect - only runs after initial mount
    $effect(() => {
        const lat = settings.latitude
        const lon = settings.longitude
        const tempUnit = settings.tempUnit
        const speedUnit = settings.speedUnit
        const timeFormat = settings.timeFormat

        if (!hasInitialized) {
            return
        }

        refreshWeather()
    })

    async function detectAndSaveLocation() {
        try {
            console.log('Auto-detecting location...')
            const location = await locationAPI.detectLocation()
            console.log('Location detected:', location)

            // Save to settings
            await saveSettings({
                ...settings,
                latitude: location.latitude,
                longitude: location.longitude
            })

            return true
        } catch (err) {
            console.error('Failed to detect location:', err)
            error = `Failed to detect location: ${err.message || err}. Please set manually.`
            return false
        }
    }

    export async function loadWeather() {
        // Check if we need to auto-detect location first
        if (settings.latitude === null || settings.longitude === null) {
            loading = true
            const detected = await detectAndSaveLocation()
            if (!detected) {
                loading = false
                return
            }
        }

        loading = true

        const cached = weatherAPI.getCachedWeather(settings.timeFormat)
        if (cached.data) {
            current = cached.data.current
            forecast = cached.data.forecast
            dailyForecast = cached.data.dailyForecast || []

            if (!cached.isStale) {
                error = null
                loading = false
                return
            }
        }

        try {
            error = null

            const data = await weatherAPI.getWeather(
                settings.latitude,
                settings.longitude,
                settings.tempUnit,
                settings.speedUnit,
                settings.timeFormat
            )

            current = data.current
            forecast = data.forecast
            dailyForecast = data.dailyForecast || []
        } catch (err) {
            error = `Failed to load weather: ${err.message || err}`
            console.error('Weather load error:', err)
        } finally {
            loading = false
        }
    }

    export function refreshWeather() {
        weatherAPI.clearCache()
        loadWeather()
    }

    let cleanupRefreshListener = null

    onMount(async () => {
        await loadSettings()
        await loadWeather()

        // Mark as initialized AFTER initial load completes
        hasInitialized = true

        // Listen for settings changes
        if (window.electronAPI && window.electronAPI.onRefreshWeather) {
            cleanupRefreshListener = window.electronAPI.onRefreshWeather(async () => {
                console.log('Settings changed, reloading weather...')
                await loadSettings()
                await refreshWeather()
            })
        }
    })

    onDestroy(() => {
        if (cleanupRefreshListener) {
            cleanupRefreshListener()
        }
    })
</script>

<div class="panel">
    {#if loading && !current}
        <div class="loading-container">
            <div class="spinner"></div>
            <div class="loading-text">loading weather...</div>
        </div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if current}
        <div class="current-weather">
            <div class="current-info">
                <div class="temp">{current.temperature_2m}°</div>
                <div class="description">{current.description}</div>
            </div>
            <TemperatureGraph {dailyForecast} />
        </div>
        <br />
        <div class="stats">
            <div class="col">
                <div>
                    humi <span class="value"
                        >{current.relative_humidity_2m}%</span
                    >
                </div>
                <div>
                    prec <span class="value"
                        >{current.precipitation_probability}%</span
                    >
                </div>
            </div>
            <div class="col">
                <div>
                    wind <span class="value"
                        >{current.wind_speed_10m} {settings.speedUnit}</span
                    >
                </div>
                <div>
                    feel <span class="value"
                        >{current.apparent_temperature}°</span
                    >
                </div>
            </div>
        </div>
        <br />
        <div class="forecast">
            <div class="col">
                {#each forecast as forecast}
                    <div class="forecast-time">{forecast.formattedTime}</div>
                {/each}
            </div>
            <div class="col">
                {#each forecast as forecast}
                    <div class="forecast-temp">{forecast.temperature}°</div>
                {/each}
            </div>
            <div class="col">
                {#each forecast as forecast}
                    <div class="forecast-weather">{forecast.description}</div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 280px;
        gap: 1rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--bg-4);
        border-top: 3px solid var(--txt-2);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-text {
        color: var(--txt-3);
        font-size: 0.875rem;
    }

    .current-weather {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .current-info {
        flex-shrink: 0;
    }
    .temp {
        font-size: 2rem;
        font-weight: 300;
        color: var(--txt-1);
        line-height: 2.625rem;
    }
    .description {
        font-size: 1.25rem;
        color: var(--txt-3);
    }
    .value {
        color: var(--txt-1);
    }
    .stats {
        display: flex;
        gap: 1.5rem;
    }
    .forecast {
        display: flex;
        gap: 1.5rem;
    }
    .forecast-time {
        text-align: end;
    }
    .forecast-temp {
        text-align: end;
        color: var(--txt-1);
    }
    .forecast-weather {
        color: var(--txt-3);
    }
</style>
