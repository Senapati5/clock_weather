const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weatherImg = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const locationNotFound = document.querySelector('.location-not-found');
const weatherBody = document.querySelector('.weather-body');
const currentTimeElement = document.getElementById('current-time');

let hr = document.getElementById('hour');
let min = document.getElementById('min');
let sec = document.getElementById('sec');

let clockInterval;
let timeZoneOffset = 0; // Offset in milliseconds

const apiKey = "820e365bf2b577997c587480c319c497";
const timezoneApiKey = "GPY89TFLN7X5";

async function checkWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather data fetch failed");

        const weatherData = await response.json();
        if (weatherData.cod === '404') {
            locationNotFound.style.display = "flex";
            weatherBody.style.display = "none";
            return;
        }

        locationNotFound.style.display = "none";
        weatherBody.style.display = "flex";
        temperature.innerHTML = `${Math.round(weatherData.main.temp - 273.15)}°C`;
        description.innerHTML = `${weatherData.weather[0].description}`;
        humidity.innerHTML = `${weatherData.main.humidity}%`;
        windSpeed.innerHTML = `${weatherData.wind.speed}Km/H`;

//        const weatherImageMap = {
//     // 'Haze': '/haze.png',
//     'Clouds': '/cloud.png',
//     'Clear': '/clear.png',
//     'Rain': '/rain.png',
//     'Mist': '/mist.png',
//     'Snow': '/snow.png'
// };

//         weatherImg.src = weatherImageMap[weatherData.weather[0].main] || '/default.png';

        const { lon, lat } = weatherData.coord;
        await getTimeZone(lat, lon);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function getTimeZone(lat, lon) {
    try {
        const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Timezone data fetch failed");

        const timezoneData = await response.json();
        if (timezoneData.status === "FAILED") {
            console.error("Error fetching timezone data");
            return;
        }

        timeZoneOffset = timezoneData.gmtOffset * 1000; // Convert to milliseconds
        const localTime = new Date(Date.now() + timeZoneOffset);
        startClock();
    } catch (error) {
        console.error("Error fetching timezone data:", error);
    }
}

function startClock() {
    // Clear any existing intervals to avoid multiple intervals running at the same time
    if (clockInterval) clearInterval(clockInterval);

    // Update the clock every second
    clockInterval = setInterval(() => {
        const now = new Date();
        const localTime = new Date(now.getTime() + timeZoneOffset);
        updateClock(localTime);
        updateDigitalClock(localTime);
    }, 1000);
}

function updateClock(date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    const hourAngle = ((hours % 12) + minutes / 60) * 30;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    hr.style.transform = `rotate(${hourAngle}deg)`;
    min.style.transform = `rotate(${minuteAngle}deg)`;
    sec.style.transform = `rotate(${secondAngle}deg)`;
}

function updateDigitalClock(date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    currentTimeElement.textContent = `Time: ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

searchBtn.addEventListener('click', () => {
    searchBtn.classList.add('rotate');
    setTimeout(() => searchBtn.classList.remove('rotate'), 300); // Match the transition duration

    const city = inputBox.value.trim();
    if (city) {
        checkWeather(city);
    }
});
