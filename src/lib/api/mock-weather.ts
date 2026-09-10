import {
  WeatherDataResponse,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  MinutelyItem,
  AirQualityData,
  PollenData,
  SevereAlert,
  HistoricalComparison,
  ActivityRating,
  LocationInfo,
} from '@/lib/types/weather';

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateMockWeatherData(location: LocationInfo): WeatherDataResponse {
  const now = Math.floor(Date.now() / 1000);
  const lat = location.lat;
  const lon = location.lon;
  const seedBase = Math.abs(Math.round(lat * 100) + Math.round(lon * 100));

  // Determine realistic base temperature based on latitude
  // Equator (~0 deg) = warm (~28C), Pole (~90 deg) = freezing (-15C)
  const latAbs = Math.abs(lat);
  const baseTemp = Math.round((32 - (latAbs / 90) * 42) * 10) / 10;

  // Determine primary weather condition
  const conditionsPool = [
    { cond: 'Clear', desc: 'Clear sky', icon: '01d', rainProb: 0.05 },
    { cond: 'Clouds', desc: 'Partly cloudy', icon: '02d', rainProb: 0.15 },
    { cond: 'Clouds', desc: 'Scattered clouds', icon: '03d', rainProb: 0.2 },
    { cond: 'Clouds', desc: 'Overcast clouds', icon: '04d', rainProb: 0.35 },
    { cond: 'Rain', desc: 'Light passing showers', icon: '10d', rainProb: 0.75 },
    { cond: 'Rain', desc: 'Moderate rain', icon: '10d', rainProb: 0.9 },
  ];
  const conditionIndex = Math.floor(pseudoRandom(seedBase + 1) * conditionsPool.length);
  const primary = conditionsPool[conditionIndex];

  const currentTemp = baseTemp + Math.round((pseudoRandom(seedBase + 2) * 6 - 3) * 10) / 10;
  const feelsLike = currentTemp + (primary.cond === 'Rain' ? -2 : 1.2);
  const humidity = Math.min(95, Math.max(30, Math.round(45 + pseudoRandom(seedBase + 3) * 45)));
  const windSpeed = Math.round((2.5 + pseudoRandom(seedBase + 4) * 8.5) * 10) / 10;
  const windDeg = Math.round(pseudoRandom(seedBase + 5) * 360);
  const pressure = Math.round(1008 + pseudoRandom(seedBase + 6) * 16);
  const uvi = Math.max(0, Math.min(11, Math.round((1 - latAbs / 90) * 9 * (primary.cond === 'Rain' ? 0.3 : 0.9))));
  const dewPoint = Math.round((currentTemp - (100 - humidity) / 5) * 10) / 10;
  const visibility = primary.cond === 'Rain' ? 8500 : 10000;

  // Generate 48 hours
  const hourly: HourlyForecastItem[] = [];
  for (let i = 0; i < 48; i++) {
    const dt = now + i * 3600;
    const hourOfDay = new Date(dt * 1000).getHours();
    // Diurnal temperature cycle: peak around 14:00, coolest at 05:00
    const diurnalFactor = Math.sin(((hourOfDay - 8) / 24) * 2 * Math.PI);
    const hourlyTemp = Math.round((currentTemp + diurnalFactor * 4 + pseudoRandom(seedBase + i) * 1.5) * 10) / 10;
    const isRaining = primary.cond === 'Rain' && i < 16;
    const pop = isRaining ? Math.min(0.95, 0.4 + pseudoRandom(seedBase + i * 2) * 0.55) : Math.max(0.05, pseudoRandom(seedBase + i * 3) * 0.3);

    hourly.push({
      dt,
      temp: hourlyTemp,
      feels_like: hourlyTemp - (pop > 0.5 ? 1.5 : 0),
      pop: Math.round(pop * 100) / 100,
      rain_volume: pop > 0.4 ? Math.round(pop * 3.5 * 10) / 10 : 0,
      humidity: Math.min(98, Math.max(35, Math.round(humidity + diurnalFactor * -15 + pseudoRandom(seedBase + i) * 10))),
      wind_speed: Math.round((windSpeed + pseudoRandom(seedBase + i * 7) * 3 - 1.5) * 10) / 10,
      wind_deg: (windDeg + i * 3) % 360,
      condition: pop > 0.5 ? 'Rain' : pop > 0.2 ? 'Clouds' : 'Clear',
      description: pop > 0.5 ? 'Scattered rain' : pop > 0.2 ? 'Partly cloudy' : 'Clear sky',
      icon: pop > 0.5 ? '10d' : pop > 0.2 ? '02d' : '01d',
      uvi: hourOfDay >= 6 && hourOfDay <= 18 ? Math.max(0, Math.round(uvi * Math.sin(((hourOfDay - 6) / 12) * Math.PI))) : 0,
    });
  }

  // Generate 8 days
  const daily: DailyForecastItem[] = [];
  const daysSummary = [
    'Pleasant daytime warmth with calm breezes.',
    'Scattered afternoon clouds with a slight chance of showers.',
    'Breezy and cooler with passing light rain.',
    'Crisp morning clearing into bright sunshine.',
    'Warm sun with moderate UV levels throughout the afternoon.',
    'Overcast skies transitioning to evening showers.',
    'Clear skies with cool overnight temperatures.',
    'Mild conditions perfect for outdoor activities.',
  ];

  for (let d = 0; d < 8; d++) {
    const dt = now + d * 86400;
    const dayTemp = Math.round((currentTemp + pseudoRandom(seedBase + d * 11) * 6 - 3) * 10) / 10;
    const tempMin = Math.round((dayTemp - (4 + pseudoRandom(seedBase + d * 13) * 3)) * 10) / 10;
    const tempMax = Math.round((dayTemp + (3 + pseudoRandom(seedBase + d * 14) * 3)) * 10) / 10;
    const pop = d === 2 || d === 5 ? 0.72 : Math.round(pseudoRandom(seedBase + d * 17) * 35) / 100;
    const moonPhase = (0.15 + d * 0.035) % 1;

    daily.push({
      dt,
      temp_min: tempMin,
      temp_max: tempMax,
      temp_morn: Math.round((tempMin + 2) * 10) / 10,
      temp_day: dayTemp,
      temp_eve: Math.round((dayTemp - 2) * 10) / 10,
      temp_night: Math.round((tempMin + 1) * 10) / 10,
      feels_like_day: dayTemp + 0.8,
      pop,
      rain_volume: pop > 0.5 ? Math.round(pop * 6.5 * 10) / 10 : 0,
      humidity: Math.round(50 + pseudoRandom(seedBase + d * 19) * 35),
      wind_speed: Math.round((3 + pseudoRandom(seedBase + d * 23) * 5) * 10) / 10,
      condition: pop > 0.6 ? 'Rain' : pop > 0.25 ? 'Clouds' : 'Clear',
      description: pop > 0.6 ? 'Moderate rain showers' : pop > 0.25 ? 'Partly cloudy' : 'Sunny and clear',
      icon: pop > 0.6 ? '10d' : pop > 0.25 ? '02d' : '01d',
      uvi: Math.max(2, Math.min(10, Math.round(uvi + (pseudoRandom(seedBase + d) * 2 - 1)))),
      sunrise: dt - (dt % 86400) + 6 * 3600 + 15 * 60,
      sunset: dt - (dt % 86400) + 19 * 3600 + 42 * 60,
      moon_phase: Math.round(moonPhase * 100) / 100,
      summary: daysSummary[d % daysSummary.length],
    });
  }

  // 60-minute nowcasting
  const minutely: MinutelyItem[] = [];
  const hasIncomingRain = primary.cond === 'Rain' || pseudoRandom(seedBase + 99) > 0.6;
  const rainPeakMinute = Math.floor(15 + pseudoRandom(seedBase + 44) * 30);

  for (let m = 0; m < 60; m++) {
    const minuteTime = new Date((now + m * 60) * 1000);
    const timeFormatted = `${minuteTime.getHours().toString().padStart(2, '0')}:${minuteTime.getMinutes().toString().padStart(2, '0')}`;
    let intensity = 0;
    let prob = 0;

    if (hasIncomingRain) {
      // Bell curve of intensity centered around rainPeakMinute
      const dist = Math.abs(m - rainPeakMinute);
      if (dist < 20) {
        intensity = Math.round(Math.max(0, (2.8 - dist * 0.14) + pseudoRandom(seedBase + m) * 0.4) * 10) / 10;
        prob = Math.min(100, Math.round(40 + (20 - dist) * 2.8));
      } else {
        intensity = 0;
        prob = Math.max(5, Math.round(25 - dist * 0.5));
      }
    } else {
      intensity = 0;
      prob = Math.round(5 + pseudoRandom(seedBase + m) * 10);
    }

    minutely.push({
      time: timeFormatted,
      timestamp: now + m * 60,
      precipitationIntensity: intensity,
      precipitationProbability: prob,
      precipitationType: intensity > 0 ? (currentTemp < 0 ? 'snow' : 'rain') : 'none',
    });
  }

  // Air Quality
  const aqiRaw = Math.round(35 + pseudoRandom(seedBase + 88) * 60);
  let aqiCategory: AirQualityData['category'] = 'Good';
  let aqiColor = '#10b981';
  let aqiAdvice = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';

  if (aqiRaw > 150) {
    aqiCategory = 'Unhealthy';
    aqiColor = '#ef4444';
    aqiAdvice = 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.';
  } else if (aqiRaw > 100) {
    aqiCategory = 'Unhealthy for Sensitive Groups';
    aqiColor = '#f97316';
    aqiAdvice = 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
  } else if (aqiRaw > 50) {
    aqiCategory = 'Moderate';
    aqiColor = '#eab308';
    aqiAdvice = 'Air quality is acceptable; however, very sensitive individuals should consider limiting prolonged outdoor exertion.';
  }

  const airQuality: AirQualityData = {
    aqi: aqiRaw,
    category: aqiCategory,
    color: aqiColor,
    pm25: Math.round(aqiRaw * 0.28 * 10) / 10,
    pm10: Math.round(aqiRaw * 0.42 * 10) / 10,
    o3: Math.round(28 + pseudoRandom(seedBase + 31) * 25),
    no2: Math.round(14 + pseudoRandom(seedBase + 32) * 18),
    co: Math.round((0.3 + pseudoRandom(seedBase + 33) * 0.5) * 10) / 10,
    so2: Math.round(4 + pseudoRandom(seedBase + 34) * 8),
    dominantPollutant: 'PM2.5',
    healthAdvice: aqiAdvice,
  };

  // Pollen Data
  const pollenTreeIdx = Math.floor(pseudoRandom(seedBase + 71) * 5);
  const pollenGrassIdx = Math.floor(pseudoRandom(seedBase + 72) * 5);
  const pollenWeedIdx = Math.floor(pseudoRandom(seedBase + 73) * 5);
  const categories: ('None' | 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High')[] = [
    'None', 'Very Low', 'Low', 'Moderate', 'High', 'Very High',
  ];
  const pollenColors = ['#10b981', '#34d399', '#84cc16', '#eab308', '#f97316', '#ef4444'];

  const pollen: PollenData = {
    tree: {
      index: pollenTreeIdx,
      category: categories[pollenTreeIdx],
      color: pollenColors[pollenTreeIdx],
    },
    grass: {
      index: pollenGrassIdx,
      category: categories[pollenGrassIdx],
      color: pollenColors[pollenGrassIdx],
    },
    weed: {
      index: pollenWeedIdx,
      category: categories[pollenWeedIdx],
      color: pollenColors[pollenWeedIdx],
    },
    overallRisk: Math.max(pollenTreeIdx, pollenGrassIdx, pollenWeedIdx) >= 4 ? 'High' : Math.max(pollenTreeIdx, pollenGrassIdx, pollenWeedIdx) >= 2 ? 'Moderate' : 'Low',
    advice: Math.max(pollenTreeIdx, pollenGrassIdx) >= 4 ? 'High airborne allergen concentration. Keep windows closed and take medication if prescribed.' : 'Low to moderate pollen levels. Most allergy sufferers can enjoy the outdoors comfortably.',
  };

  // Severe Alerts (Simulated if conditions dictate or randomly 20% of time)
  const alerts: SevereAlert[] = [];
  if (primary.cond === 'Rain' && pseudoRandom(seedBase + 91) > 0.45) {
    alerts.push({
      id: `alert-${now}-flood`,
      event: 'Flood Advisory & Heavy Rain Warning',
      headline: `National Weather Service: Flood Advisory in effect for ${location.name} area`,
      description: 'Minor flooding in low-lying and poor drainage areas. Water ponding on roadways is expected. Exercise caution when driving.',
      severity: 'advisory',
      urgency: 'Expected',
      start: now,
      end: now + 14400,
      senderName: 'National Weather Service',
    });
  } else if (windSpeed > 8) {
    alerts.push({
      id: `alert-${now}-wind`,
      event: 'Wind Advisory',
      headline: `Gusty winds up to ${(windSpeed * 3.6 + 15).toFixed(0)} km/h expected`,
      description: 'Gusty winds could blow around unsecured objects. Tree limbs could be blown down and a few power outages may result.',
      severity: 'watch',
      urgency: 'Immediate',
      start: now,
      end: now + 21600,
      senderName: 'Meteorological Department',
    });
  }

  // Historical Comparison
  const normalTemp = Math.round((baseTemp - 0.8) * 10) / 10;
  const tempDiff = Math.round((currentTemp - normalTemp) * 10) / 10;
  const currentPrecip = primary.cond === 'Rain' ? 4.2 : 0;
  const normalPrecip = 2.4;
  const precipDiff = Math.round((currentPrecip - normalPrecip) * 10) / 10;

  const historical: HistoricalComparison = {
    currentTemp,
    normalTemp,
    tempDiff,
    currentPrecip,
    normalPrecip,
    precipDiff,
    recordHigh: Math.round((baseTemp + 9.5) * 10) / 10,
    recordLow: Math.round((baseTemp - 11.2) * 10) / 10,
    baselinePeriod: '30-year climate normal (1991–2020)',
    trendSummary: tempDiff > 0
      ? `Today is ${Math.abs(tempDiff)}°C warmer than the historical normal for this date.`
      : tempDiff < 0
      ? `Today is ${Math.abs(tempDiff)}°C cooler than the historical normal for this date.`
      : 'Temperatures are directly aligned with the 30-year historical average.',
  };

  // Activity Recommendations
  const activities: ActivityRating[] = [
    {
      id: 'running',
      name: 'Running / Jogging',
      iconName: 'Footprints',
      score: primary.cond === 'Rain' ? 42 : currentTemp > 30 ? 55 : 92,
      level: primary.cond === 'Rain' ? 'Fair' : currentTemp > 30 ? 'Fair' : 'Excellent',
      badgeColor: primary.cond === 'Rain' ? '#f59e0b' : '#10b981',
      summary: primary.cond === 'Rain' ? 'Pavements may be slick; light rain jacket recommended.' : 'Optimal ambient temperature and moderate humidity.',
    },
    {
      id: 'cycling',
      name: 'Cycling',
      iconName: 'Bike',
      score: windSpeed > 7 ? 50 : primary.cond === 'Rain' ? 40 : 88,
      level: windSpeed > 7 ? 'Fair' : primary.cond === 'Rain' ? 'Fair' : 'Great',
      badgeColor: windSpeed > 7 ? '#f59e0b' : '#10b981',
      summary: windSpeed > 7 ? `Headwinds around ${(windSpeed * 3.6).toFixed(0)} km/h along exposed routes.` : 'Pleasant conditions for road and gravel cycling.',
    },
    {
      id: 'dining',
      name: 'Outdoor Dining / Patio',
      iconName: 'Utensils',
      score: primary.cond === 'Rain' ? 25 : currentTemp < 15 ? 58 : 95,
      level: primary.cond === 'Rain' ? 'Poor' : currentTemp < 15 ? 'Fair' : 'Excellent',
      badgeColor: primary.cond === 'Rain' ? '#ef4444' : '#10b981',
      summary: primary.cond === 'Rain' ? 'Indoor seating advised due to intermittent rain.' : 'Delightful patio weather with mild evening breeze.',
    },
    {
      id: 'stargazing',
      name: 'Stargazing',
      iconName: 'Sparkles',
      score: primary.cond === 'Clear' ? 95 : primary.cond === 'Clouds' ? 45 : 15,
      level: primary.cond === 'Clear' ? 'Excellent' : primary.cond === 'Clouds' ? 'Fair' : 'Poor',
      badgeColor: primary.cond === 'Clear' ? '#10b981' : primary.cond === 'Clouds' ? '#f59e0b' : '#ef4444',
      summary: primary.cond === 'Clear' ? 'Clear atmospheric transparency; great visibility for constellations.' : 'Cloud layers obstruct astronomical observation tonight.',
    },
  ];

  return {
    location,
    current: {
      temp: currentTemp,
      feels_like: feelsLike,
      temp_min: Math.round((currentTemp - 4) * 10) / 10,
      temp_max: Math.round((currentTemp + 3.5) * 10) / 10,
      humidity,
      pressure,
      wind_speed: windSpeed,
      wind_deg: windDeg,
      wind_gust: Math.round((windSpeed * 1.4) * 10) / 10,
      uvi,
      visibility,
      dew_point: dewPoint,
      clouds: primary.cond === 'Clear' ? 10 : primary.cond === 'Rain' ? 85 : 45,
      condition: primary.cond,
      description: primary.desc,
      icon: primary.icon,
      timestamp: now,
      sunrise: now - (now % 86400) + 6 * 3600 + 15 * 60,
      sunset: now - (now % 86400) + 19 * 3600 + 42 * 60,
    },
    hourly,
    daily,
    minutely,
    airQuality,
    pollen,
    alerts,
    historical,
    activities,
    isDemoMode: true,
    dataSources: {
      primary: 'Simulated',
      nowcasting: 'Simulated',
      airQuality: 'Simulated',
    },
    fetchedAt: new Date().toISOString(),
  };
}
