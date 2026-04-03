import { useState, useEffect } from "react";
import CambodiaAirQualityMap from "./air-quality/CambodiaAirQualityMap";
import cambodiaGeoJsonUrl from "../assets/geoData/cambodia-provinces.geojson?url";
import type { AirQualityData, GeoJsonData } from "@/types/airquality.types";

// Sample air quality data - replace with your API call
const SAMPLE_AIR_QUALITY_DATA: AirQualityData[] = [
  {
    province: "Banteay Meanchey",
    pm2_5: 35,
    pm10: 52,
    no2: 15,
    o3: 32,
    so2: 4,
    co: 0.6,
    timestamp: new Date().toISOString(),
  },
  {
    province: "Phnom Penh",
    pm2_5: 42,
    pm10: 65,
    no2: 18,
    o3: 35,
    so2: 5,
    co: 0.8,
  },
  {
    province: "Siem Reap",
    pm2_5: 28,
    pm10: 45,
    no2: 12,
    o3: 28,
    so2: 3,
    co: 0.5,
  },
  // Add all 25 provinces...
];

export default function MapOverlay() {
  const [geoJson, setGeoJson] = useState<GeoJsonData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);

  useEffect(() => {
    fetch(cambodiaGeoJsonUrl)
      .then((res) => res.json())
      .then((data) => setGeoJson(data as GeoJsonData));

    // Fetch air quality data from your API
    // fetchAirQualityData().then(setAirQualityData);
    setAirQualityData(SAMPLE_AIR_QUALITY_DATA);
  }, []);

  if (!geoJson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cambodia Air Quality Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time air pollution levels across provinces
          </p>
        </div>

        <CambodiaAirQualityMap
          geoJsonData={geoJson}
          airQualityData={airQualityData}
          initialPollutant="pm2_5"
          center={[12.5657, 104.991]}
          zoom={6.5}
        />

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Data updates hourly • Based on WHO standards</p>
        </div>
      </div>
    </div>
  );
}
