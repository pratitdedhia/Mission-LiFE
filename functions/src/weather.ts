import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

const WeatherRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  district: z.string().default('Ahmedabad')
});

const CACHE_TTL_MINUTES = 30;

export const getLiveWeather = onCall({ cors: true }, async (request) => {
  const parse = WeatherRequestSchema.safeParse(request.data);
  if (!parse.success) {
    throw new HttpsError('invalid-argument', 'Invalid coordinates.');
  }

  const { lat, lng, district } = parse.data;
  const db = admin.firestore();
  const cacheKey = `weather_${district.toLowerCase()}`;
  const cacheRef = db.collection('apiCache').doc(cacheKey);

  const cacheSnap = await cacheRef.get();
  const now = Date.now();

  if (cacheSnap.exists) {
    const cached = cacheSnap.data()!;
    const ageMinutes = (now - cached.cachedAtMs) / (1000 * 60);
    if (ageMinutes < CACHE_TTL_MINUTES) {
      return {
        ...cached.data,
        isCached: true,
        cacheAgeMinutes: Math.round(ageMinutes)
      };
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,direct_normal_irradiance&daily=temperature_2m_max,temperature_2m_min,shortwave_radiation_sum&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo HTTP error: ' + res.status);
    const json = (await res.json()) as {
      current?: { temperature_2m?: number; direct_normal_irradiance?: number };
      daily?: { shortwave_radiation_sum?: number[] };
    };

    const temp = json.current?.temperature_2m ?? 34;
    const irradiance = json.current?.direct_normal_irradiance ?? 650;
    const solarRadiationMjr = json.daily?.shortwave_radiation_sum?.[0] ?? 19.5;
    // 1 MJ/m2 approx 0.277 kWh/m2
    const solarKwhPerM2 = Math.round((solarRadiationMjr * 0.277) * 10) / 10;

    const weatherData = {
      district,
      temperatureC: temp,
      solarRadiationKwhPerM2: solarKwhPerM2 || 5.4,
      directNormalIrradianceW: irradiance,
      source: 'Open-Meteo (Live)',
      sourceUrl: 'https://open-meteo.com',
      lastUpdated: new Date().toISOString()
    };

    // Save to Firestore cache
    await cacheRef.set({
      cachedAtMs: now,
      data: weatherData
    });

    return {
      ...weatherData,
      isCached: false
    };
  } catch (err) {
    // Graceful offline fallback
    return {
      district,
      temperatureC: 34.5,
      solarRadiationKwhPerM2: 5.4,
      directNormalIrradianceW: 680,
      source: 'Gujarat Seasonal Baseline (Offline Fallback)',
      sourceUrl: 'https://geda.gujarat.gov.in',
      lastUpdated: new Date().toISOString(),
      isCached: false,
      fallback: true
    };
  }
});

