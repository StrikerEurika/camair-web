import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bell,
  Eye,
  MapPin,
  Plus,
  Minus,
  TrendingUp,
  X,
  Check,
  ChevronDown,
  Target,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { fetchAirQuality } from '@/services/airQualityService';
import type { AirQualityRecord } from '@/types/airQuality';
import {
  MapController,
  AqiGauge,
  PollutantChart,
  ViewOptionsPanel,
  ProvinceTable,
  ProvinceMarker,
} from '@/components/air-quality';
import { Header } from '@/layout/Header';

const VIEW_OPTIONS = [
  { id: 'pm25', label: 'PM2.5', enabled: true },
  { id: 'pm10', label: 'PM10', enabled: true },
  { id: 'o3', label: 'O3', enabled: true },
  { id: 'no2', label: 'NO2', enabled: true },
  { id: 'so2', label: 'SO2', enabled: false },
  { id: 'co', label: 'CO', enabled: false },
  { id: 'aqi-color', label: 'AQI Color Area', enabled: true },
];

// Pollutant configuration
const POLLUTANT_CONFIG: Record<string, { label: string; unit: string; icon: React.ReactNode; color: string }> = {
  pm2_5: { label: 'PM2.5', unit: 'µg/m³', icon: <Droplets className="w-3 h-3" />, color: '#ec4899' },
  pm10: { label: 'PM10', unit: 'µg/m³', icon: <Droplets className="w-3 h-3" />, color: '#f59e0b' },
  o3: { label: 'O3', unit: 'µg/m³', icon: <Cloud className="w-3 h-3" />, color: '#8b5cf6' },
  no2: { label: 'NO2', unit: 'µg/m³', icon: <Wind className="w-3 h-3" />, color: '#ef4444' },
  so2: { label: 'SO2', unit: 'µg/m³', icon: <Cloud className="w-3 h-3" />, color: '#06b6d4' },
  co: { label: 'CO', unit: 'µg/m³', icon: <Wind className="w-3 h-3" />, color: '#10b981' },
};

export default function AirQuality() {
  const [data, setData] = useState<AirQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [viewOptions, setViewOptions] = useState(VIEW_OPTIONS);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchAirQuality();
      setData(response.data);
      // Select Phnom Penh by default if available
      const phnomPenh = response.data.find(r => r.name === 'Phnom Penh');
      if (phnomPenh) {
        setSelectedProvince('Phnom Penh');
      }
    } catch (error) {
      console.error('Failed to load air quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (id: string) => {
    setViewOptions((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));
  };

  const handleApply = () => {
    setViewOptionsOpen(false);
  };

  const getSelectedRecord = () => {
    return data.find(r => r.name === selectedProvince) || null;
  };

  const selectedRecord = getSelectedRecord();

  // Filter data based on search
  const filteredData = data.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    avgPm25: data.length > 0 ? data.reduce((acc, r) => acc + r.pm2_5, 0) / data.length : 0,
    avgPm10: data.length > 0 ? data.reduce((acc, r) => acc + r.pm10, 0) / data.length : 0,
    provinces: data.length,
    goodCount: data.filter(r => r.us_epa_index === 1).length,
    moderateCount: data.filter(r => r.us_epa_index === 2).length,
    unhealthyCount: data.filter(r => r.us_epa_index >= 3).length,
  };

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Provinces</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.provinces}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Good AQI</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.goodCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Moderate</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.moderateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <Wind className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unhealthy</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.unhealthyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card glass className="overflow-hidden h-full">
            <div className="relative h-full min-h-137.5">
              {/* View Options Button */}
              <button
                onClick={() => setViewOptionsOpen(true)}
                className="absolute left-4 top-4 z-[400] flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Options</span>
              </button>

              {/* Search Bar */}
              <div className="absolute right-4 top-4 z-[400] flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-w-[280px]">
                <MapPin className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  placeholder="Search province..."
                />
              </div>

              {/* Pollutant Selector */}
              <div className="absolute left-4 bottom-4 z-[400] flex gap-2">
                {(['pm25', 'pm10', 'o3', 'no2'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPollutant(p)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      selectedPollutant === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {POLLUTANT_CONFIG[p === 'pm25' ? 'pm2_5' : p]?.label || p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Map */}
              {loading ? (
                <div className="w-full h-full skeleton flex items-center justify-center">
                  <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
                </div>
              ) : (
                <MapContainer
                  center={[12.5657, 104.9910]} // Cambodia center
                  zoom={7}
                  className="w-full h-full"
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <MapController center={[12.5657, 104.9910]} zoom={7} />

                  {/* Province Markers */}
                  {filteredData.map((record) => (
                    <ProvinceMarker
                      key={record.id}
                      record={record}
                      isSelected={selectedProvince === record.name}
                      onClick={() => setSelectedProvince(record.name)}
                    />
                  ))}
                </MapContainer>
              )}

              {/* Map Controls */}
              <div className="absolute right-4 bottom-4 z-[400] flex flex-col gap-2">
                <button className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Minus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* View Options Panel */}
              <ViewOptionsPanel
                isOpen={viewOptionsOpen}
                onClose={() => setViewOptionsOpen(false)}
                options={viewOptions}
                onToggle={toggleOption}
                onApply={handleApply}
              />
            </div>
          </Card>
        </div>

        {/* Right Panel - Selected Province Details */}
        <div className="space-y-6">
          {/* AQI Gauge */}
          <Card glass>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Current AQI
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRecord ? (
                <>
                  <AqiGauge
                    value={selectedRecord.pm2_5}
                    label={selectedRecord.name}
                    usEpaIndex={selectedRecord.us_epa_index}
                    gbDefraIndex={selectedRecord.gb_defra_index}
                  />
                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                      <Check className="w-4 h-4" />
                      Watchlist
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <TrendingUp className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  Select a province on the map
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pollutant Breakdown */}
          <Card glass>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Pollutant Breakdown
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PollutantChart data={selectedRecord} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Province Table */}
      <Card glass>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Province Air Quality Overview
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProvinceTable
            data={filteredData}
            selectedProvince={selectedProvince}
            onSelect={setSelectedProvince}
          />
        </CardContent>
      </Card>

      {/* Health Tips Banner */}
      <Card glass>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Health Tips</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Air quality is {stats.goodCount > stats.unhealthyCount ? 'generally good' : 'variable'}. 
                {stats.unhealthyCount > 0 ? 'Some provinces have unhealthy levels - limit outdoor activities.' : 'Perfect time for outdoor activities!'}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
