import GLib from "gi://GLib"
import { createState } from "ags"
import { execAsync } from "ags/process"

type WeatherConfig = {
    location: string
    icons: Record<string, string>
}

export type DayForecast = {
    day: string
    date: string
    icon: string
    condition: string
    tempHigh: number | string
    tempLow: number | string
}

type WeatherState = {
    loading: boolean
    days: DayForecast[]
    error: string | null
}

const CONFIG_PATH = `${SRC}/configs/weather.json`

function loadConfig(): WeatherConfig | null {
    try {
        const [ok, bytes] = GLib.file_get_contents(CONFIG_PATH)
        if (!ok) return null
        return JSON.parse(new TextDecoder().decode(bytes)) as WeatherConfig
    } catch (e) {
        console.error("[weather] failed to load config:", e)
        return null
    }
}

// WMO Weather interpretation codes ==> icon category
// Docs: https://open-meteo.com/en/docs (Weather interpretation codes)
function wmoToCondition(code: number): string {
    if (code === 0) return "clear"
    if (code === 1) return "mainly_clear"
    if (code === 2) return "partly_cloudy"
    if (code === 3) return "overcast"
    if (code === 45 || code === 48) return "fog"
    if (code >= 51 && code <= 57) return "drizzle"
    if (code >= 61 && code <= 63) return "rain"
    if (code === 65) return "heavy_rain"
    if (code === 66 || code === 67) return "rain"  // freezing rain
    if (code >= 71 && code <= 77) return "snow"
    if (code >= 80 && code <= 82) return "rain"    // showers
    if (code === 85 || code === 86) return "snow"  // snow showers
    if (code >= 95) return "thunderstorm"
    return "unknown"
}
/* 
Code	Description
0           Clear sky
1, 2, 3     Mainly clear, partly cloudy, and overcast
45, 48      Fog and depositing rime fog
51, 53, 55  Drizzle: Light, moderate, and dense intensity
56, 57      Freezing Drizzle: Light and dense intensity
61, 63, 65	Rain: Slight, moderate and heavy intensity
66, 67      Freezing Rain: Light and heavy intensity
71, 73, 75  Snow fall: Slight, moderate, and heavy intensity
77          Snow grains
80, 81, 82	Rain showers: Slight, moderate, and violent
85, 86      Snow showers slight and heavy
95 *        Thunderstorm: Slight or moderate
96, 99 *	Thunderstorm with slight and heavy hail
*/

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Parse location ==> {lat, lon}
// - "lat,lon" string ==> use as-is
// - city name ==> geocode via Open-Meteo
async function resolveCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
    if (location.includes(",")) {
        const parts = location.split(",").map(s => parseFloat(s.trim()))
        if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
            return { lat: parts[0], lon: parts[1] }
        }
    }
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`
        const out = await execAsync(["curl", "-sS", url])
        const data = JSON.parse(out)
        const first = data?.results?.[0]
        if (!first) return null
        return { lat: first.latitude, lon: first.longitude }
    } catch (e) {
        console.error("[weather] geocoding failed:", e)
        return null
    }
}

async function fetchForecast(lat: number, lon: number, icons: Record<string, string>): Promise<DayForecast[]> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
    const out = await execAsync(["curl", "-sS", url])
    const data = JSON.parse(out)
    const daily = data?.daily
    if (!daily || !daily.time) throw new Error("invalid forecast response")

    return daily.time.map((isoDate: string, i: number) => {
        const date = new Date(isoDate)
        const day = i === 0 ? "Now" : DAY_NAMES[date.getDay()]
        const condition = wmoToCondition(daily.weather_code[i])
        const icon = icons[condition] ?? icons["unknown"] ?? "󰖐"
        return {
            day,
            date: isoDate,
            icon,
            condition,
            tempHigh: Math.round(daily.temperature_2m_max[i]),
            tempLow: Math.round(daily.temperature_2m_min[i]),
        }
    })
}

export const [weatherState, setWeatherState] = createState<WeatherState>({
    loading: true,
    days: [],
    error: null,
})

async function refresh() {
    const cfg = loadConfig()
    if (!cfg) {
        setWeatherState({ loading: false, days: [], error: "config load failed" })
        return
    }
    try {
        const coords = await resolveCoordinates(cfg.location)
        if (!coords) {
            setWeatherState({ loading: false, days: [], error: "location resolve failed" })
            return
        }
        const days = await fetchForecast(coords.lat, coords.lon, cfg.icons)
        setWeatherState({ loading: false, days, error: null })
    } catch (e) {
        console.error("[weather] refresh failed:", e)
        setWeatherState(s => ({ ...s, loading: false, error: String(e) }))
    }
}

// Initial fetch
refresh()

// Poll every 30 minutes
GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30 * 60, () => {
    refresh()
    return GLib.SOURCE_CONTINUE
})