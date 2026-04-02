import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Bell,
  Eye,
  MapPin,
  Plus,
  Minus,
  Clock,
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge, AqiBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getAqiInfo } from '@/utils/aqiUtils';
import { fetchAirQuality, MOCK_DATA, PROVINCE_COORDS } from '@/services/airQualityService';
import type { AirQualityRecord } from '@/types/airQuality';

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

interface ProvinceMarkerProps {
  record: AirQualityRecord;
  isSelected: boolean;
  onClick: () => void;
  pollutant: string;
}

function ProvinceMarker({ record, isSelected, onClick, pollutant }: ProvinceMarkerProps) {
  const aqiInfo = getAqiInfo(record.us_epa_index);
  
  // Get pollutant value based on selected type
  const getPollutantValue = () => {
    switch (pollutant) {
      case 'pm25': return record.pm2_5;
      case 'pm10': return record.pm10;
      case 'o3': return record.o3;
      case 'no2': return record.no2;
      case 'so2': return record.so2;
      case 'co': return record.co;
      default: return record.pm2_5;
    }
  };

  const value = getPollutantValue();
  const config = POLLUTANT_CONFIG[pollutant] || POLLUTANT_CONFIG.pm2_5;
  const baseRadius = record.us_epa_index * 8 + 10;

  return (
    <CircleMarker
      center={[record.lat!, record.lng!]}
      radius={isSelected ? baseRadius + 10 : baseRadius}
      pathOptions={{
        color: aqiInfo.hex,
        fillColor: aqiInfo.hex,
        fillOpacity: isSelected ? 0.9 : 0.6,
        weight: isSelected ? 3 : 2,
        opacity: 1,
      }}
      eventHandlers={{ click: onClick }}
      className="cursor-pointer"
    >
      <Popup closeButton={false} offset={[0, -10]}>
        <div className="p-2 min-w-[220px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">{record.name}</h3>
            <AqiBadge index={record.us_epa_index} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { key: 'pm2_5', label: 'PM2.5', value: `${record.pm2_5.toFixed(1)} µg/m³` },
              { key: 'pm10', label: 'PM10', value: `${record.pm10.toFixed(1)} µg/m³` },
              { key: 'o3', label: 'O3', value: `${record.o3.toFixed(1)} µg/m³` },
              { key: 'no2', label: 'NO2', value: `${record.no2.toFixed(1)} µg/m³` },
              { key: 'so2', label: 'SO2', value: `${record.so2.toFixed(1)} µg/m³` },
              { key: 'co', label: 'CO', value: `${record.co.toFixed(1)} µg/m³` },
            ].map(({ key, label, value }) => (
              <div key={key} className="bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1.5">
                <span className="text-slate-500 dark:text-slate-400 block">{label}</span>
                <span className="text-slate-900 dark:text-white font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">US EPA: {record.us_epa_index}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">DEFRA: {record.gb_defra_index}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
            Updated: {record.last_updated}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// AQI Gauge Component
function AqiGauge({ value, label, usEpaIndex, gbDefraIndex }: { value: number; label: string; usEpaIndex: number; gbDefraIndex: number }) {
  const aqiInfo = getAqiInfo(usEpaIndex);

  return (
    <div className="relative">
      {/* Gauge Arc */}
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="oklch(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#aqi-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={251 - (usEpaIndex / 6) * 251}
          />
          <defs>
            <linearGradient id="aqi-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="25%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Indicator Circle */}
          <circle
            cx={20 + (160 * (usEpaIndex / 6))}
            cy={100 - Math.sqrt(6400 - Math.pow(20 + (160 * (usEpaIndex / 6)) - 100, 2))}
            r="8"
            fill="white"
            stroke={aqiInfo.hex}
            strokeWidth="3"
          />
        </svg>
        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-5xl font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">AQI (US EPA)</span>
          <div className="mt-2">
            <Badge variant={aqiInfo.label === 'Good' ? 'good' : aqiInfo.label === 'Moderate' ? 'moderate' : 'sensitive'}>
              <span className="inline-block w-2 h-2 rounded-full bg-current" />
              {aqiInfo.label}
            </Badge>
          </div>
        </div>
      </div>
      {/* Location Info */}
      <div className="flex items-center gap-2 justify-center mt-4">
        <MapPin className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      {/* Index comparison */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">US EPA</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{usEpaIndex}</p>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">DEFRA</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{gbDefraIndex}</p>
        </div>
      </div>
    </div>
  );
}

// Pollutant Bar Chart Component
function PollutantChart({ data }: { data: AirQualityRecord | null }) {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Select a province to view pollutant breakdown
      </div>
    );
  }

  const chartData = [
    { name: 'PM2.5', value: data.pm2_5, fill: '#ec4899' },
    { name: 'PM10', value: data.pm10, fill: '#f59e0b' },
    { name: 'O3', value: data.o3, fill: '#8b5cf6' },
    { name: 'NO2', value: data.no2, fill: '#ef4444' },
    { name: 'SO2', value: data.so2, fill: '#06b6d4' },
    { name: 'CO', value: data.co / 10, fill: '#10b981' }, // Scale down CO for visualization
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--border))" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'oklch(var(--foreground))' }}
            width={50}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const actualValue = d.name === 'CO' ? d.value * 10 : d.value;
                return (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="font-medium text-slate-900 dark:text-white">{d.name}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {actualValue.toFixed(1)} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// View Options Sidebar
function ViewOptionsPanel({
  isOpen,
  onClose,
  options,
  onToggle,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: typeof VIEW_OPTIONS;
  onToggle: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed left-4 top-20 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 transition-all duration-300',
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
        )}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">View Options</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {/* Pollutant Section */}
          <div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Layers className="w-4 h-4" />
              Pollutant Layers
            </button>
            <div className="space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">{option.label}</span>
                  <button
                    onClick={() => onToggle(option.id)}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      option.enabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        option.enabled ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

// Province Table Component
function ProvinceTable({ 
  data, 
  selectedProvince, 
  onSelect 
}: { 
  data: AirQualityRecord[]; 
  selectedProvince: string | null;
  onSelect: (name: string) => void;
}) {
  const getAqiColor = (index: number) => {
    const info = getAqiInfo(index);
    return info.hex;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Province</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">PM2.5</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">PM10</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">O3</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">NO2</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">AQI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr
              key={record.id}
              onClick={() => onSelect(record.name)}
              className={cn(
                'border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors',
                selectedProvince === record.name
                  ? 'bg-blue-50 dark:bg-blue-500/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              )}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getAqiColor(record.us_epa_index) }}
                  />
                  <span className="font-medium text-slate-900 dark:text-white">{record.name}</span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{record.pm2_5.toFixed(1)}</td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{record.pm10.toFixed(1)}</td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{record.o3.toFixed(1)}</td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{record.no2.toFixed(1)}</td>
              <td className="text-right py-3 px-4">
                <AqiBadge index={record.us_epa_index} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cambodia Air Quality Map</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time air quality monitoring across all provinces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">User</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

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
          <Card glass className="overflow-hidden">
            <div className="relative h-[550px]">
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
                      pollutant={selectedPollutant}
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
