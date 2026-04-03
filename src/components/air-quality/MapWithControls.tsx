import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { AirQualityRecord } from "@/types/airQuality";
import { MapController, ProvinceMarker } from "@/components/air-quality";

function MapInitHandler({ mapRef, onReady }: { mapRef: React.MutableRefObject<LeafletMap | null>; onReady: () => void }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    onReady();
  }, [map, mapRef, onReady]);
  return null;
}

interface MapWithControlsProps {
  center: [number, number];
  zoom: number;
  loading: boolean;
  filteredData: AirQualityRecord[];
  selectedProvince: string | null;
  onProvinceSelect: (name: string) => void;
  mapRef: React.MutableRefObject<LeafletMap | null>;
  onMapReady: () => void;
}

export function MapWithControls({
  center,
  zoom,
  loading,
  filteredData,
  selectedProvince,
  onProvinceSelect,
  mapRef,
  onMapReady,
}: MapWithControlsProps) {
  if (loading) {
    return (
      <div className="absolute inset-0 skeleton flex items-center justify-center">
        <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="z-10"
      style={{ height: "550px" }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapInitHandler mapRef={mapRef} onReady={onMapReady} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapController center={center} zoom={zoom} />
      {filteredData.map((record) => (
        <ProvinceMarker
          key={record.id}
          record={record}
          isSelected={selectedProvince === record.name}
          onClick={() => onProvinceSelect(record.name)}
        />
      ))}
    </MapContainer>
  );
}
