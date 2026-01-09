import descriptions from './assets/descriptions.json'

/**
 * OpenMeteo Weather API client with data processing utilities
 * Adapted for Electron (uses sessionStorage instead of localStorage)
 */
class WeatherAPI {
    constructor() {
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast'
        this.cacheKey = `weather_data`
        this.cacheExpiry = 15 * 60 * 1000
    }

    async getWeather(
        latitude,
        longitude,
        tempUnit,
        speedUnit,
        timeFormat = '12hr'
    ) {
        const rawData = await this._fetchWeatherData(
            latitude,
            longitude,
            tempUnit,
            speedUnit
        )
        this._cacheWeather(rawData)

        const dailyForecast = this._processDailyForecast(rawData.daily)

        // Get current hour's precipitation from hourly data
        const currentTime = rawData.current.time
        const currentHourIndex = rawData.hourly.time.findIndex(t => t === currentTime)
        const currentPrecipProb = currentHourIndex >= 0 ? rawData.hourly.precipitation_probability[currentHourIndex] : 0

        const currentWeather = this._processCurrentWeather(rawData.current)
        currentWeather.precipitation_probability = currentPrecipProb

        return {
            current: currentWeather,
            forecast: this._processHourlyForecast(
                rawData.hourly,
                rawData.current.time,
                timeFormat
            ),
            dailyForecast: dailyForecast,
        }
    }

    getCachedWeather(timeFormat = '12hr') {
        const cached = this._getCachedData()

        if (!cached.data) {
            return { data: null, isStale: false }
        }

        // Get current hour's precipitation from hourly data
        const currentTime = cached.data.current.time
        const currentHourIndex = cached.data.hourly.time.findIndex(t => t === currentTime)
        const currentPrecipProb = currentHourIndex >= 0 && cached.data.hourly.precipitation_probability
            ? cached.data.hourly.precipitation_probability[currentHourIndex]
            : 0

        const currentWeather = this._processCurrentWeather(cached.data.current)
        currentWeather.precipitation_probability = currentPrecipProb

        const processedData = {
            current: currentWeather,
            forecast: this._processHourlyForecast(
                cached.data.hourly,
                cached.data.current.time,
                timeFormat
            ),
            dailyForecast: this._processDailyForecast(cached.data.daily || { time: [], temperature_2m_max: [] }),
        }

        return {
            data: processedData,
            isStale: cached.isStale,
        }
    }

    _getCachedData() {
        try {
            // Changed from localStorage to sessionStorage for Electron
            const cached = sessionStorage.getItem(this.cacheKey)
            if (!cached) return { data: null, isStale: false }

            const { data, timestamp } = JSON.parse(cached)
            const now = Date.now()
            const isStale = now - timestamp >= this.cacheExpiry

            return { data, isStale }
        } catch (error) {
            console.error('failed to get cached weather data:', error)
            sessionStorage.removeItem(this.cacheKey)
            return { data: null, isStale: false }
        }
    }

    clearCache() {
        sessionStorage.removeItem(this.cacheKey)
    }

    async _fetchWeatherData(
        latitude,
        longitude,
        tempUnit = 'fahrenheit',
        speedUnit = 'mph'
    ) {
        // Map user setting to API parameter (API expects 'kmh' not 'kph')
        const apiSpeedUnit = speedUnit === 'kph' ? 'kmh' : speedUnit;

        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            hourly: 'temperature_2m,weather_code,is_day,precipitation_probability',
            daily: 'temperature_2m_max,weather_code',
            current:
                'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,apparent_temperature,is_day',
            timezone: 'auto',
            forecast_days: '6',
            temperature_unit: tempUnit,
            wind_speed_unit: apiSpeedUnit,
        })

        const url = `${this.baseUrl}?${params}`
        console.log('Fetching weather from:', url)
        const response = await fetch(url)
        if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error Response:', errorText)
            throw new Error(`HTTP ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        return data
    }

    _processCurrentWeather(currentData) {
        currentData.temperature_2m = currentData.temperature_2m.toFixed(0)
        currentData.wind_speed_10m = currentData.wind_speed_10m.toFixed(0)
        currentData.apparent_temperature =
            currentData.apparent_temperature.toFixed(0)
        return {
            ...currentData,
            description: this._getWeatherDescription(
                currentData.weather_code,
                currentData.is_day === 1
            ),
        }
    }

    _processHourlyForecast(hourlyData, currentTime, timeFormat = '12hr') {
        const currentHour = new Date(currentTime).getHours()
        const forecasts = []

        let currentIndex = 0
        for (let i = 0; i < hourlyData.time.length; i++) {
            const forecastHour = new Date(hourlyData.time[i]).getHours()
            if (forecastHour >= currentHour) {
                currentIndex = i
                break
            }
        }

        for (
            let i = 0;
            i < 5 && currentIndex + (i + 1) * 3 < hourlyData.time.length;
            i++
        ) {
            const index = currentIndex + (i + 1) * 3
            forecasts.push({
                time: hourlyData.time[index],
                temperature: hourlyData.temperature_2m[index].toFixed(0),
                weatherCode: hourlyData.weather_code[index],
                description: this._getWeatherDescription(
                    hourlyData.weather_code[index],
                    hourlyData.is_day[index] === 1
                ),
                formattedTime: this._formatTime(
                    hourlyData.time[index],
                    timeFormat
                ),
            })
        }

        return forecasts
    }

    _processDailyForecast(dailyData) {
        if (!dailyData.time || dailyData.time.length === 0) {
            return []
        }

        const forecasts = []

        for (let i = 1; i < Math.min(6, dailyData.time.length); i++) {
            forecasts.push({
                date: dailyData.time[i],
                temperature: Math.round(dailyData.temperature_2m_max[i]),
                day: this._formatDay(dailyData.time[i])
            })
        }

        return forecasts
    }

    _formatDay(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
    }

    _getWeatherDescription(weatherCode, isDay = true) {
        const timeOfDay = isDay ? 'day' : 'night'
        return (
            descriptions[weatherCode]?.[timeOfDay]?.description ||
            `Code ${weatherCode}`
        ).toLowerCase()
    }

    _formatTime(timeString, timeFormat = '12hr') {
        const date = new Date(timeString)

        if (timeFormat === '12hr') {
            return date
                .toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true,
                })
                .toLowerCase()
        } else {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
            })
        }
    }

    _cacheWeather(data) {
        const cacheData = {
            data,
            timestamp: Date.now(),
        }
        // Changed from localStorage to sessionStorage for Electron
        sessionStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
    }
}

export default WeatherAPI
