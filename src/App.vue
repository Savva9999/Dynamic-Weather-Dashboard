<template>
    <div class="page">
        <div class="container-mainText">
            <h1 class="mainText">Прогноз погоды</h1>
        </div>
        <div class="container">

            <div class="left">
                <div class="data">
                    <h1 class="city" v-if="tempInfoFromApi">Город: {{ tempInfoFromApi.name }}</h1>
                    <p v-if='tempInfoFromApi' :style="{ color: getTempColor(tempInfoFromApi.main.temp) }">Температура: {{ tempInfoFromApi.main.temp }}°C</p>
                    <p v-if='tempInfoFromApi' :style="{ color: getTempColor(tempInfoFromApi.main.feels_like) }">Ощущается как: {{ tempInfoFromApi.main.feels_like }}°C</p>
                    <p v-if='tempInfoFromApi'>Влажность: {{ tempInfoFromApi.main.humidity }}%</p>
                    <p v-if='tempInfoFromApi'>Погода: {{ tempInfoFromApi.weather[0].description }}</p>
                </div>

                <div class="search-container">
                    <input class="inputCity" type="text" v-model="city" placeholder="Введите город" @focus="onFocus" />
                    <ul v-if="showSuggestions && suggestions.length" class="suggestions">
                        <li v-for="cityItem in suggestions" :key="`${cityItem.name}-${cityItem.country}`" @click="selectCity(cityItem)">
                            {{ cityItem.name }},
                            {{ cityItem.country }}
                        </li>
                    </ul>
                </div>
                <p v-if="error" class="error">{{ error }}</p>
                <button class="btn" v-if="city != ''" @click="getWeather">Узнать погоду</button>
                <button class="btn-dis" v-else disabled>Введите город</button>
            </div>


            <div class="right">
                <img 
                    v-if="tempInfoFromApi && tempInfoFromApi.weather[0].icon.includes('01')"
                    src="https://cdn-icons-png.flaticon.com/512/869/869869.png"
                    class="weather-icon"
                />

                <img 
                    v-else-if="tempInfoFromApi"
                    :src="`https://openweathermap.org/img/wn/${tempInfoFromApi.weather[0].icon}@2x.png`"
                    class="weather-icon"
                />
            </div>

        </div>
    </div>
</template>

<script>
import { fetchWeather } from "./services/weatherService.js"
import { getTempColor, getTheme } from "./utils/weatherHelpers.js"
import { searchCities } from "./services/cityService.js"

export default {
    data() {
        return {
            city: "",
            suggestions: [],
            tempInfoFromApi: null,
            error: "",

            showSuggestions: false,
            citySelected: false
        } 
    },
    
    computed: {
        tempTheme() {
            if (!this.tempInfoFromApi) return "normal"

            return getTheme(this.tempInfoFromApi.main.temp)
        }
    },

   watch: {
        tempInfoFromApi() {
            document.body.classList.remove(
                "hot",
                "warm",
                "normal",
                "cold",
                "freezing"
            )

            document.body.classList.add(this.tempTheme)
        },

        city(value) {
            if (this.citySelected) {
                return
            }

            clearTimeout(this.debounceTimer)

            this.debounceTimer = setTimeout(async () => {
                if (value.length < 2) {
                    this.suggestions = []
                    this.showSuggestions = false
                    return
                }

                try {
                    this.suggestions = await searchCities(value)
                    this.showSuggestions = true
                } catch (e) {
                    console.error(e)
                    this.suggestions = []
                    this.showSuggestions = false
                }
            }, 400)
        }
    },

    methods: {
        async getWeather() {
            if (this.city.trim().length < 2) return

            try {
                this.error = ""
                this.tempInfoFromApi = await fetchWeather(this.city)
            } catch (err) {
                this.error = "Город не найден"
                this.tempInfoFromApi = null
            }
        },

        selectCity(cityItem) {
            this.city = cityItem.name
            this.suggestions = []
            this.showSuggestions = false
            this.citySelected = true
        },

        onFocus() {
            this.citySelected = false

            if (this.city.length >= 2) {
                this.showSuggestions = true
            }
        },

        getTempColor

    }
}  
</script>

<style scoped>
    .page {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        transition: background 0.8s ease;
        background: #0b1020;
        overflow: hidden;
    }

    .page::before {
        content: "";
        position: absolute;
        width: 500px;
        height: 500px;
        background: rgba(248, 221, 42, 0.15);
        filter: blur(120px);
        border-radius: 50%;
        top: -100px;
        left: -100px;
    }

    .page::after {
        content: "";
        position: absolute;
        width: 500px;
        height: 500px;
        background: rgba(0, 170, 255, 0.12);
        filter: blur(120px);
        border-radius: 50%;
        bottom: -120px;
        right: -120px;
    }

    .container-mainText {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
        z-index: 2;
    }

    .search-container {
        position: relative;
        width: 100%;
    }

    .mainText {
        text-align: center;
        color: #ffffff;
        font-size: 44px;
        font-weight: 700;
        letter-spacing: 1px;
        background: linear-gradient(90deg, #f8dd2a, #ffffff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 20px rgba(248, 221, 42, 0.2);
    }

    .container {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 760px;
        height: 450px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        color: white;
        transition: 0.3s ease;
    }

    .container:hover {
        transform: translateY(-5px);
    }

    .left {
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 60%;
        align-items: flex-start;
    }

    .data {
        font-size: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .data p {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        border-left: 3px solid #f8dd2a;
        transition: 0.2s;
    }

    .data p:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateX(4px);
    }

    .city {
        font-size: 22px;
        font-weight: 700;
        color: white;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.8);
    }

    .inputCity {
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        outline: none;
        font-size: 14px;
        width: 90%;
        background: rgba(0, 0, 0, 0.25);
        color: white;
        transition: 0.2s;
    }

    .suggestions {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        right: 0;

        z-index: 1000;

        list-style: none;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 10px;

        max-height: 220px;
        overflow-y: auto;

        border: 1px solid rgba(255,255,255,.1);
    }

    .suggestions li {
        padding: 12px;
        cursor: pointer;
    }

    .suggestions li:hover {
        background: rgba(255,255,255,.15);
    }

    .error {
        color: #ff6b6b;
        font-weight: 600;
    }

    .inputCity:focus {
        border-color: #f8dd2a;
        box-shadow: 0 0 0 3px rgba(248, 221, 42, 0.2);
    }

    .suggestions {
        width: 90%;
        list-style: none;
        background: rgba(0,0,0,.6);
        border-radius: 10px;
        overflow: hidden;
    }

    .suggestions li {
        padding: 10px;
        cursor: pointer;
    }

    .suggestions li:hover {
        background: rgba(255,255,255,.15);
    }

    .btn,
    .btn-dis {
        width: 140px;
        height: 38px;
        border: none;
        border-radius: 10px;

        font-weight: 600;
        cursor: pointer;

        transition: all 0.25s ease;
        align-self: center;
    }

    .btn {
        background: linear-gradient(135deg, #f8dd2a, #ffb703);
        color: #1a1a1a;
    }

    .btn:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 25px rgba(248, 221, 42, 0.3);
    }

    .btn-dis {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.5);
        cursor: not-allowed;
    }

    .right {
        width: 40%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .weather-icon {
        width: 250px;
        height: 250px;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
    }

    .hot-text {
        color: #ff3b30;
        font-weight: 700;
    }

    .warm-text {
        color: #ff9500;
        font-weight: 700;
    }

    .normal-text {
        color: #34c759;
        font-weight: 600;
    }

    .cold-text {
        color: #0a84ff;
        font-weight: 700;
    }

    .freezing-text {
        color: #5ac8fa;
        font-weight: 700;
    }

    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    
    @media (max-width: 800px) {
        .container {
            width: 90%;
            flex-direction: column;
            height: auto;
            gap: 20px;
        }

        .left, .right {
            width: 100%;
            align-items: center;
            text-align: center;
        }
    }

</style>
