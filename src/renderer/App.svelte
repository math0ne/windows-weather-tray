<script>
    import { onMount } from 'svelte'
    import Weather from './lib/components/Weather.svelte'
    import Settings from './lib/components/Settings.svelte'
    import { loadSettings } from './lib/settings-store.svelte.js'

    // Check URL parameters to determine which view to show
    const urlParams = new URLSearchParams(window.location.search)
    const isSettingsWindow = urlParams.get('settings') === 'true'

    function closeSettings() {
        window.close()
    }

    // Load settings when settings window opens
    onMount(async () => {
        if (isSettingsWindow) {
            await loadSettings()
        }
    })
</script>

<main>
    {#if isSettingsWindow}
        <Settings onClose={closeSettings} />
    {:else}
        <Weather />
    {/if}
</main>

<style>
    main {
        padding: 0;
    }
</style>
