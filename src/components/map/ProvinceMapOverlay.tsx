import { useEffect, useState, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L, { type LeafletEvent } from 'leaflet';
import type { GeoJsonData, GeoJsonFeature } from '@/types/airquality.types';
import type { AirQualityRecord } from '@/types/airQuality';
import { getAqiInfo } from '@/utils/aqiUtils';

interface ProvinceMapOverlayProps {
  geoJsonUrl: string;
  airQualityData: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
}

function findProvinceData(name: string, data: AirQualityRecord[]): AirQualityRecord | null {
  return data.find((d) => d.name.toLowerCase() === name.toLowerCase()) ?? null;
}

function getProvinceFillColor(record: AirQualityRecord | null): string {
  if (!record) return '#d1d5db';
  return getAqiInfo(record.us_epa_index).hex;
}

function ProvinceGeoJSON({
  geoJsonData,
  airQualityData,
  selectedProvince,
  onSelectProvince,
}: {
  geoJsonData: GeoJsonData;
  airQualityData: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
}) {
  const map = useMap();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const styleProvince = (feature?: GeoJsonFeature) => {
    if (!feature) return {};
    const name = feature.properties.adm1_name;
    const record = findProvinceData(name, airQualityData);
    const isSelected = selectedProvince === name;

    return {
      fillColor: getProvinceFillColor(record),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#1e293b' : '#ffffff',
      fillOpacity: isSelected ? 0.9 : 0.7,
    };
  };

  const highlightProvince = (e: LeafletEvent) => {
    const layer = e.target as L.Path;
    layer.setStyle({ weight: 3, color: '#334155', fillOpacity: 0.85 });
    layer.bringToFront();
  };

  const resetHighlight = (e: LeafletEvent) => {
    const layer = e.target as L.Path;
    if (geoJsonRef.current) {
      geoJsonRef.current.resetStyle(layer);
    }
  };

  const onEachProvince = (feature: GeoJsonFeature, layer: L.Layer) => {
    const name = feature.properties.adm1_name;
    const record = findProvinceData(name, airQualityData);

    const tooltipContent = record
      ? `<div class="p-2 text-sm"><strong>${name}</strong><br/>AQI: ${record.us_epa_index}<br/>PM2.5: ${record.pm2_5} µg/m³</div>`
      : `<div class="p-2 text-sm"><strong>${name}</strong><br/>No data</div>`;

    layer.bindTooltip(tooltipContent, { sticky: true, className: 'custom-tooltip' });

    layer.on({
      click: () => onSelectProvince(name),
      mouseover: highlightProvince,
      mouseout: resetHighlight,
    } as L.LeafletEventHandlerFnMap);
  };

  useEffect(() => {
    if (geoJsonRef.current && selectedProvince) {
      geoJsonRef.current.eachLayer((layer) => {
        const feat = (layer as L.GeoJSON).feature as GeoJsonFeature | undefined;
        if (feat?.properties.adm1_name === selectedProvince) {
          const bounds = (layer as any).getBounds?.();
          if (bounds) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      });
    }
  }, [selectedProvince, map]);

  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer) => {
        const feat = (layer as L.GeoJSON).feature as GeoJsonFeature | undefined;
        if (feat) {
          const name = feat.properties.adm1_name;
          const record = findProvinceData(name, airQualityData);
          const isSelected = selectedProvince === name;

          (layer as L.Path).setStyle({
            fillColor: getProvinceFillColor(record),
            weight: isSelected ? 3 : 1.5,
            color: isSelected ? '#1e293b' : '#ffffff',
            fillOpacity: isSelected ? 0.9 : 0.7,
          });
        }
      });
    }
  }, [airQualityData, selectedProvince]);

  return (
    <GeoJSON
      data={geoJsonData as any}
      style={styleProvince as any}
      onEachFeature={onEachProvince as any}
      ref={geoJsonRef}
    />
  );
}

export function ProvinceMapOverlay({
  geoJsonUrl,
  airQualityData,
  selectedProvince,
  onSelectProvince,
}: ProvinceMapOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    fetch(geoJsonUrl)
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data as GeoJsonData))
      .catch(() => setGeoJsonData(null));
  }, [geoJsonUrl]);

  if (!geoJsonData) return null;

  return (
    <ProvinceGeoJSON
      geoJsonData={geoJsonData}
      airQualityData={airQualityData}
      selectedProvince={selectedProvince}
      onSelectProvince={onSelectProvince}
    />
  );
}
