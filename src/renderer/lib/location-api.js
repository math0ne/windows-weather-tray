/**
 * Location API for auto-detecting user location via IP geolocation
 */
class LocationAPI {
    async detectLocation() {
        try {
            // Using ip-api.com: Free, no key required, CORS-friendly
            const response = await fetch('http://ip-api.com/json/')
            const data = await response.json()

            if (data.status === 'success') {
                return {
                    latitude: data.lat,
                    longitude: data.lon,
                    city: data.city,
                    region: data.regionName,
                    country: data.country
                }
            }

            throw new Error('Location detection failed: ' + (data.message || 'Unknown error'))
        } catch (error) {
            console.error('Failed to detect location:', error)
            throw error
        }
    }
}

export default LocationAPI
