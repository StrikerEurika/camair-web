import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { AirQualityRecord } from '@/types/airQuality';
import { getAqiInfo } from '@/utils/aqiUtils';
import { AqiBadge } from '@/components/ui/Badge';

interface AirQualityMapProps {
  data: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
}

// Auto-fly to selected province
function MapController({ selected, data }: { selected: string | null; data: AirQualityRecord[] }) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    const record = data.find((d) => d.name === selected);
    if (record?.lat && record?.lng) {
      map.flyTo([record.lat, record.lng], 9, { duration: 1.2 });
    }
  }, [selected, data, map]);
  return null;
}

export function AirQualityMap({ data, selectedProvince, onSelectProvince }: AirQualityMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Delay to ensure container dimensions are set
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const validData = data.filter((d) => d.lat !== undefined && d.lng !== undefined);

  if (!ready) {
    return (
      <div className="w-full h-full rounded-2xl skeleton flex items-center justify-center">
        <span className="text-slate-500 text-sm">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[12.5, 104.9]}
      zoom={7}
      className="w-full h-full rounded-2xl"
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapController selected={selectedProvince} data={data} />

      {validData.map((record) => {
        const aqiInfo = getAqiInfo(record.us_epa_index);
        const isSelected = record.name === selectedProvince;
        const radius = isSelected ? 18 : 12;
        const weight = isSelected ? 3 : 1.5;

        return (
          <CircleMarker
            key={record.id}
            center={[record.lat!, record.lng!]}
            radius={radius}
            pathOptions={{
              color: aqiInfo.hex,
              fillColor: aqiInfo.hex,
              fillOpacity: isSelected ? 0.9 : 0.7,
              weight,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => onSelectProvince(record.name),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[220px] bg-white dark:bg-slate-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{record.name}</h3>
                  <AqiBadge index={record.us_epa_index} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'PM2.5', value: `${record.pm2_5} µg/m³` },
                    { label: 'PM10',  value: `${record.pm10} µg/m³` },
                    { label: 'CO',    value: `${record.co} µg/m³` },
                    { label: 'NO₂',   value: `${record.no2} µg/m³` },
                    { label: 'O₃',    value: `${record.o3} µg/m³` },
                    { label: 'SO₂',   value: `${record.so2} µg/m³` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1.5">
                      <span className="text-slate-500 dark:text-slate-400 block">{label}</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  Updated: {record.last_updated}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
