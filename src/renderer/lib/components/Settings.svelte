<script>
    import { settings, saveSettings } from '../settings-store.svelte.js'

    let { onClose = () => {} } = $props()

    let latitude = $state(settings.latitude !== null ? settings.latitude.toString() : '')
    let longitude = $state(settings.longitude !== null ? settings.longitude.toString() : '')
    let tempUnit = $state(settings.tempUnit)
    let speedUnit = $state(settings.speedUnit)
    let timeFormat = $state(settings.timeFormat)
    let saving = $state(false)

    // Update local state when settings change
    $effect(() => {
        if (settings.latitude !== null) {
            latitude = settings.latitude.toString()
        }
        if (settings.longitude !== null) {
            longitude = settings.longitude.toString()
        }
        tempUnit = settings.tempUnit
        speedUnit = settings.speedUnit
        timeFormat = settings.timeFormat
    })

    async function handleSave() {
        saving = true
        try {
            const lat = parseFloat(latitude)
            const lon = parseFloat(longitude)

            if (isNaN(lat) || isNaN(lon)) {
                alert('Please enter valid latitude and longitude values')
                saving = false
                return
            }

            if (lat < -90 || lat > 90) {
                alert('Latitude must be between -90 and 90')
                saving = false
                return
            }

            if (lon < -180 || lon > 180) {
                alert('Longitude must be between -180 and 180')
                saving = false
                return
            }

            await saveSettings({
                latitude: lat,
                longitude: lon,
                tempUnit,
                speedUnit,
                timeFormat
            })

            onClose()
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('Failed to save settings')
        } finally {
            saving = false
        }
    }

    function handleCancel() {
        onClose()
    }
</script>

<div class="settings-container">
    <h2>Weather Settings</h2>

        <div class="settings-row">
            <label for="latitude">Latitude</label>
            <input
                id="latitude"
                type="text"
                bind:value={latitude}
                placeholder="e.g., 40.7128"
            />
        </div>

        <div class="settings-row">
            <label for="longitude">Longitude</label>
            <input
                id="longitude"
                type="text"
                bind:value={longitude}
                placeholder="e.g., -74.0060"
            />
        </div>

        <div class="settings-row">
            <label>Temperature Unit</label>
            <div class="toggle-group">
                <button
                    class:active={tempUnit === 'fahrenheit'}
                    onclick={() => tempUnit = 'fahrenheit'}
                >
                    °F
                </button>
                <button
                    class:active={tempUnit === 'celsius'}
                    onclick={() => tempUnit = 'celsius'}
                >
                    °C
                </button>
            </div>
        </div>

        <div class="settings-row">
            <label>Wind Speed Unit</label>
            <div class="toggle-group">
                <button
                    class:active={speedUnit === 'mph'}
                    onclick={() => speedUnit = 'mph'}
                >
                    mph
                </button>
                <button
                    class:active={speedUnit === 'kph'}
                    onclick={() => speedUnit = 'kph'}
                >
                    kph
                </button>
            </div>
        </div>

        <div class="settings-row">
            <label>Time Format</label>
            <div class="toggle-group">
                <button
                    class:active={timeFormat === '12hr'}
                    onclick={() => timeFormat = '12hr'}
                >
                    12hr
                </button>
                <button
                    class:active={timeFormat === '24hr'}
                    onclick={() => timeFormat = '24hr'}
                >
                    24hr
                </button>
            </div>
        </div>

    <div class="settings-actions">
        <button onclick={handleCancel}>Cancel</button>
        <button class="primary" onclick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
        </button>
    </div>
</div>

<style>
    .settings-container {
        padding: 20px;
        background: var(--bg-1);
        color: var(--txt-2);
        height: 100vh;
        box-sizing: border-box;
        overflow-y: auto;
    }

    h2 {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 20px;
        color: var(--txt-1);
    }

    .settings-row {
        margin-bottom: 20px;
    }

    .settings-row label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--txt-3);
    }

    .settings-row input {
        width: 100%;
        padding: 10px;
        background: var(--bg-2);
        border: 1px solid var(--bg-4);
        border-radius: 6px;
        color: var(--txt-1);
        font-size: 14px;
        box-sizing: border-box;
    }

    .settings-row input:focus {
        outline: none;
        border-color: var(--txt-3);
    }

    .toggle-group {
        display: flex;
        gap: 8px;
    }

    .toggle-group button {
        flex: 1;
        padding: 10px;
        background: var(--bg-2);
        border: 1px solid var(--bg-4);
        border-radius: 6px;
        color: var(--txt-3);
        cursor: pointer;
        transition: all 0.2s;
    }

    .toggle-group button:hover {
        background: var(--bg-3);
        border-color: var(--txt-3);
    }

    .toggle-group button.active {
        background: var(--txt-3);
        color: var(--bg-1);
        border-color: var(--txt-3);
    }

    .settings-actions {
        margin-top: 30px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .settings-actions button {
        padding: 10px 24px;
        background: var(--bg-3);
        border: 1px solid var(--bg-4);
        border-radius: 6px;
        color: var(--txt-2);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }

    .settings-actions button:hover {
        background: var(--bg-4);
        color: var(--txt-1);
    }

    .settings-actions button.primary {
        background: var(--txt-3);
        color: var(--bg-1);
        border-color: var(--txt-3);
    }

    .settings-actions button.primary:hover {
        background: var(--txt-2);
    }

    .settings-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
