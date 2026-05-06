import "server-only";

import { externalServiceError, missingProvider } from "@/lib/errors";

export type WeatherSummary = {
  source: "openweathermap";
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  description: string;
  forecast: Array<{
    date: string;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    rainProbability: number;
    description: string;
  }>;
};

type RegionCoordinates = {
  latitude: number;
  longitude: number;
};

type OpenWeatherOneCall = {
  current?: {
    temp?: number;
    humidity?: number;
    wind_speed?: number;
    weather?: Array<{ description?: string }>;
  };
  daily?: Array<{
    dt?: number;
    temp?: { min?: number; max?: number };
    humidity?: number;
    wind_speed?: number;
    pop?: number;
    weather?: Array<{ description?: string }>;
  }>;
};

export async function fetchWeather(coords: RegionCoordinates): Promise<WeatherSummary> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw missingProvider("OPENWEATHER_API_KEY");
  }

  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    appid: apiKey,
    units: "metric",
    lang: "ru",
    exclude: "minutely,hourly,alerts",
  });

  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?${params.toString()}`,
    { next: { revalidate: 600 } },
  );

  const text = await response.text();
  if (!response.ok) {
    throw externalServiceError("OpenWeatherMap", text || response.statusText);
  }

  let data: OpenWeatherOneCall;
  try {
    data = JSON.parse(text) as OpenWeatherOneCall;
  } catch {
    throw externalServiceError("OpenWeatherMap", "response was not valid JSON");
  }

  const current = data.current;
  if (
    typeof current?.temp !== "number" ||
    typeof current.humidity !== "number" ||
    typeof current.wind_speed !== "number"
  ) {
    throw externalServiceError("OpenWeatherMap", "current weather is missing");
  }

  const forecast = (data.daily || []).slice(0, 7).map((day) => ({
    date: day.dt
      ? new Date(day.dt * 1000).toISOString()
      : new Date().toISOString(),
    tempMin: day.temp?.min ?? current.temp ?? 0,
    tempMax: day.temp?.max ?? current.temp ?? 0,
    humidity: day.humidity ?? current.humidity ?? 0,
    windSpeed: day.wind_speed ?? current.wind_speed ?? 0,
    rainProbability: Math.round((day.pop ?? 0) * 100),
    description: day.weather?.[0]?.description || "нет описания",
  }));

  return {
    source: "openweathermap",
    temperature: Math.round(current.temp),
    humidity: current.humidity,
    windSpeed: current.wind_speed,
    rainProbability: forecast[0]?.rainProbability ?? 0,
    description: current.weather?.[0]?.description || "нет описания",
    forecast,
  };
}
