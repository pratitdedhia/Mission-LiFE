/**
 * OpenWeather Integration Service for Mission LiFE Gujarat
 * Provides live weather context & rooftop solar irradiance estimations
 * Supports Gujarat cities with resilient fallback to seasonal baseline climate data.
 */

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache to protect API quotas
const WEATHER_CACHE_KEY_PREFIX = 'life_weather_cache_';

// Gujarat City Reference Coordinates & Baseline Seasonal Climate Model
const GUJARAT_CITY_DEFAULTS = {
  Ahmedabad: { lat: 23.0225, lon: 72.5714, avgTemp: 33, avgClouds: 25, solarIndex: "High (~5.4 kWh/m²/day)" },
  Gandhinagar: { lat: 23.2156, lon: 72.6369, avgTemp: 32, avgClouds: 20, solarIndex: "High (~5.5 kWh/m²/day)" },
  Surat: { lat: 21.1702, lon: 72.8311, avgTemp: 31, avgClouds: 35, solarIndex: "Moderate-High (~5.1 kWh/m²/day)" },
  Vadodara: { lat: 22.3072, lon: 73.1812, avgTemp: 32, avgClouds: 25, solarIndex: "High (~5.3 kWh/m²/day)" },
  Rajkot: { lat: 22.3039, lon: 70.8022, avgTemp: 33, avgClouds: 15, solarIndex: "Very High (~5.8 kWh/m²/day)" },
  Bhavnagar: { lat: 21.7645, lon: 72.1519, avgTemp: 31, avgClouds: 20, solarIndex: "High (~5.4 kWh/m²/day)" },
  Jamnagar: { lat: 22.4707, lon: 70.0577, avgTemp: 30, avgClouds: 20, solarIndex: "High (~5.5 kWh/m²/day)" },
  Junagadh: { lat: 21.5222, lon: 70.4579, avgTemp: 31, avgClouds: 20, solarIndex: "High (~5.3 kWh/m²/day)" },
  Kutch: { lat: 23.2420, lon: 69.6669, avgTemp: 34, avgClouds: 10, solarIndex: "Extreme Solar (~6.2 kWh/m²/day)" },
  Anand: { lat: 22.5645, lon: 72.9289, avgTemp: 32, avgClouds: 25, solarIndex: "High (~5.3 kWh/m²/day)" },
  Bharuch: { lat: 21.7051, lon: 72.9959, avgTemp: 32, avgClouds: 30, solarIndex: "Moderate-High (~5.1 kWh/m²/day)" }
};

/**
 * Fetches weather for a given Gujarat city or locality.
 * Returns live data if API key is provided and valid, otherwise returns
 * transparently labeled seasonal reference data.
 */
export async function getCityWeather(cityName = 'Ahmedabad') {
  const normalizedCity = Object.keys(GUJARAT_CITY_DEFAULTS).find(
    c => c.toLowerCase() === cityName.trim().toLowerCase()
  ) || 'Ahmedabad';

  // 1. Check local cache
  try {
    const cachedRaw = localStorage.getItem(`${WEATHER_CACHE_KEY_PREFIX}${normalizedCity}`);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch (e) {
    // Cache read failure; proceed
  }

  // 2. If API Key is present, attempt live OpenWeather API call
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY') {
    try {
      const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedCity)},IN&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        const weatherObj = formatOpenWeatherData(data, normalizedCity);
        cacheWeatherData(normalizedCity, weatherObj);
        return weatherObj;
      } else if (response.status === 401) {
        console.warn("OpenWeather API key invalid or unauthorized. Falling back to seasonal model.");
      } else if (response.status === 429) {
        console.warn("OpenWeather API rate limit exceeded. Falling back to seasonal model.");
      }
    } catch (err) {
      console.warn("OpenWeather network call failed:", err.message);
    }
  }

  // 3. Fallback: Seasonal Gujarat Climate Reference Model (Explicitly labeled)
  const fallbackObj = getSeasonalClimateFallback(normalizedCity);
  return fallbackObj;
}

function formatOpenWeatherData(data, city) {
  const temp = Math.round(data.main?.temp || 32);
  const humidity = data.main?.humidity || 45;
  const clouds = data.clouds?.all ?? 20;
  const weatherDesc = data.weather?.[0]?.description || 'Clear sky';
  const icon = data.weather?.[0]?.icon || '01d';

  // Estimate solar irradiance factor based on cloud cover
  let solarFactor = 1.0;
  let solarAdvice = "Peak solar generation today! Ideal time to run high-load appliances on solar power.";
  if (clouds > 70) {
    solarFactor = 0.55;
    solarAdvice = "High cloud cover: Rooftop solar generation reduced by ~40%. Defer heavy loads to off-peak grid hours.";
  } else if (clouds > 30) {
    solarFactor = 0.85;
    solarAdvice = "Moderate cloud cover: Solar output normal. Schedule water pumps and charging before 3 PM.";
  }

  let acNudge = "Normal thermal comfort conditions.";
  if (temp >= 35) {
    acNudge = `High ambient heat (${temp}°C) in ${city}. Set AC to 26°C with ceiling fan to cut power load by 36% during grid peak hours!`;
  } else if (temp >= 28) {
    acNudge = `Warm day (${temp}°C). Setting AC to 26°C maintains comfort while saving ~₹450/month on electricity.`;
  }

  return {
    isLive: true,
    source: "OpenWeatherMap API (Live Verified)",
    city,
    temp,
    humidity,
    clouds,
    description: weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1),
    icon: `https://openweathermap.org/img/wn/${icon}@2x.png`,
    solarRadiationKwhM2: (5.4 * solarFactor).toFixed(1),
    solarAdvice,
    acNudge,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lastUpdatedIso: new Date().toISOString()
  };
}

function getSeasonalClimateFallback(city) {
  const defaults = GUJARAT_CITY_DEFAULTS[city] || GUJARAT_CITY_DEFAULTS.Ahmedabad;
  return {
    isLive: false,
    source: "Seasonal Gujarat Climate Model (Offline Reference)",
    city,
    temp: defaults.avgTemp,
    humidity: 48,
    clouds: defaults.avgClouds,
    description: "Typical Sunny & Warm Gujarat Climate",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    solarRadiationKwhM2: "5.4",
    solarAdvice: "Strong solar insolation typical for Gujarat. Clean rooftop panels regularly to maintain 100% output.",
    acNudge: `Seasonal temperature (~${defaults.avgTemp}°C). Keep AC thermostat at 26°C to optimize compressor runtime.`,
    lastUpdated: "Seasonal Reference Baseline",
    lastUpdatedIso: new Date().toISOString(),
    notice: "To enable real-time local weather updates, configure VITE_OPENWEATHER_API_KEY in your environment."
  };
}

function cacheWeatherData(city, data) {
  try {
    localStorage.setItem(
      `${WEATHER_CACHE_KEY_PREFIX}${city}`,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    // Ignore storage quota
  }
}

