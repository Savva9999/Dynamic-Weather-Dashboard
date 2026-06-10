import axios from "axios"

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function fetchWeather(city) {
    const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
            params: {
                q: city,
                units: "metric",
                lang: "ru",
                appid: API_KEY
            }
        }
    )

    return response.data
}