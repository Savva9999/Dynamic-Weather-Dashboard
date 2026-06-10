import axios from "axios"

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function searchCities(query) {
    if (query.length < 2) return []

    const response = await axios.get(
        "https://api.openweathermap.org/geo/1.0/direct",
        {
            params: {
                q: query,
                limit: 5,
                appid: API_KEY
            }
        }
    )
    console.log(response.data)

    return response.data
}