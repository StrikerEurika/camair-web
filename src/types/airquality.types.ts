// types/air-quality.types.ts

export type PollutantType = 'pm2_5' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co';

export interface PollutantConfig {
  name: string;
  unit: string;
  bins: number[];
  colors: string[];
  labels: string[];
}

export interface AirQualityData {
  province: string;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  timestamp?: string;
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    adm1_name: string;
    adm1_name1?: string | null;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}