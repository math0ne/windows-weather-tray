<script>
    let { dailyForecast = [] } = $props()

    // Calculate graph dimensions and scaling
    const width = 200
    const height = 80
    const padding = { top: 25, right: 10, bottom: 20, left: 10 }
    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    // Use derived values instead of effect to avoid loops
    const temperatures = $derived(dailyForecast.map(d => d.temperature))
    const minTemp = $derived(temperatures.length > 0 ? Math.min(...temperatures) : 0)
    const maxTemp = $derived(temperatures.length > 0 ? Math.max(...temperatures) : 100)
    const tempRange = $derived(maxTemp - minTemp || 1)

    // Generate path for the line
    const path = $derived(() => {
        if (dailyForecast.length === 0) return ''

        const pathPoints = dailyForecast.map((day, index) => {
            const x = (index / Math.max(dailyForecast.length - 1, 1)) * graphWidth
            const y = graphHeight - ((day.temperature - minTemp) / tempRange) * graphHeight
            return `${x + padding.left},${y + padding.top}`
        })
        return `M ${pathPoints.join(' L ')}`
    })

    // Generate points for temperature labels
    const points = $derived(() => {
        if (dailyForecast.length === 0) return []

        return dailyForecast.map((day, index) => ({
            x: (index / Math.max(dailyForecast.length - 1, 1)) * graphWidth + padding.left,
            y: graphHeight - ((day.temperature - minTemp) / tempRange) * graphHeight + padding.top,
            temp: day.temperature,
            day: day.day
        }))
    })
</script>

<div class="graph-container">
    {#if dailyForecast.length > 0}
        <svg {width} {height}>
            <!-- Temperature line -->
            <path
                d={path()}
                fill="none"
                stroke="var(--txt-2)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Temperature points and labels -->
            {#each points() as point}
                <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="var(--txt-1)"
                />
                <text
                    x={point.x}
                    y={point.y - 8}
                    text-anchor="middle"
                    class="temp-label"
                >
                    {point.temp}°
                </text>
                <text
                    x={point.x}
                    y={height - 5}
                    text-anchor="middle"
                    class="day-label"
                >
                    {point.day}
                </text>
            {/each}
        </svg>
    {:else}
        <div class="no-data">No forecast data available</div>
    {/if}
</div>

<style>
    .graph-container {
        margin-top: 0;
    }

    .temp-label {
        font-size: 0.75rem;
        fill: var(--txt-1);
        font-family: inherit;
    }

    .day-label {
        font-size: 0.625rem;
        fill: var(--txt-3);
        font-family: inherit;
    }

    .no-data {
        font-size: 0.75rem;
        color: var(--txt-4);
        text-align: center;
        padding: 1rem;
    }
</style>
