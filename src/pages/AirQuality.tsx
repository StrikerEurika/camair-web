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
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getAqiInfo } from '@/utils/aqiUtils';

// Mock data for demonstration
const MOCK_POLLUTANTS = [
  { id: 'pm25', label: 'PM2.5', icon: '●●●', value: 11.62, unit: 'µg/m³', percentage: 74 },
  { id: 'pm10', label: 'PM10', icon: '●●●', value: 15.27, unit: 'µg/m³', percentage: 34 },
  { id: 'o3', label: 'O3', icon: '●●●', value: 38.11, unit: 'µg/m³', percentage: 38 },
  { id: 'no2', label: 'NO2', icon: '', value: 7.04, unit: 'µg/m³', percentage: 28 },
];

const VIEW_OPTIONS = [
  { id: 'pm25', label: 'PM2.5', enabled: true },
  { id: 'pm10', label: 'PM10', enabled: true },
  { id: 'o3', label: 'O3', enabled: true },
  { id: 'no2', label: 'NO2', enabled: false },
  { id: 'aqi-color', label: 'AQI Color Area', enabled: true },
];

const FORECAST_DATA = [
  { time: '04:00', aqi: 28 },
  { time: '05:00', aqi: 26 },
  { time: '06:00', aqi: 24 },
  { time: '07:00', aqi: 25 },
  { time: '08:00', aqi: 27 },
  { time: '09:00', aqi: 29 },
  { time: '10:00', aqi: 32 },
  { time: '11:00', aqi: 36 },
  { time: '12:00', aqi: 34 },
  { time: '13:00', aqi: 31 },
  { time: '14:00', aqi: 29 },
  { time: '15:00', aqi: 27 },
  { time: '16:00', aqi: 25 },
];

interface PollutantMarkerProps {
  pollutant: typeof MOCK_POLLUTANTS[0];
  position: [number, number];
  isSelected: boolean;
  onClick: () => void;
}

function PollutantMarker({ pollutant, position, isSelected, onClick }: PollutantMarkerProps) {
  return (
    <CircleMarker
      center={position}
      radius={isSelected ? 70 : 55}
      pathOptions={{
        color: 'white',
        fillColor: 'white',
        fillOpacity: 0.95,
        weight: 2,
        opacity: 1,
      }}
      eventHandlers={{ click: onClick }}
      className="cursor-pointer"
    >
      <Popup closeButton={false} offset={[0, -10]}>
        <div className="p-2 min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-900">{pollutant.label}</span>
            <span className="text-xs text-slate-500">{pollutant.percentage}%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pollutant.value} <span className="text-sm font-normal text-slate-500">{pollutant.unit}</span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// AQI Gauge Component
function AqiGauge({ value, label }: { value: number; label: string }) {
  const aqiInfo = getAqiInfo(value < 50 ? 1 : value < 100 ? 2 : value < 150 ? 3 : 4);

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
            strokeDashoffset={251 - (value / 300) * 251}
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
            cx={20 + (160 * (value / 300))}
            cy={100 - Math.sqrt(6400 - Math.pow(20 + (160 * (value / 300)) - 100, 2))}
            r="8"
            fill="white"
            stroke={aqiInfo.hex}
            strokeWidth="3"
          />
        </svg>
        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-5xl font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">AQI</span>
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
    </div>
  );
}

// Forecast Chart Component
function ForecastChart() {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'monthly' | 'yearly'>('hourly');

  const getAqiColor = (aqi: number) => {
    if (aqi < 50) return '#10b981';
    if (aqi < 100) return '#eab308';
    if (aqi < 150) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Air Quality Forecast</CardTitle>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['hourly', 'daily', 'monthly', 'yearly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FORECAST_DATA}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'oklch(var(--muted-foreground))' }}
              />
              <YAxis hide domain={[0, 50]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">{data.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getAqiColor(data.aqi) }}
                          />
                          <span className="text-lg font-bold text-slate-900 dark:text-white">{data.aqi}</span>
                          <span className="text-xs text-slate-500">AQI</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorAqi)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Color Legend */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-cyan-500 via-green-500 via-yellow-500 via-orange-500 to-red-500" />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
          <span>Good</span>
          <span>Moderate</span>
          <span>Unhealthy</span>
        </div>
      </CardContent>
    </Card>
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
              <ChevronDown className="w-4 h-4" />
              Pollutant
            </button>
            <div className="space-y-2">
              {options.filter((o) => o.id !== 'aqi-color').map((option) => (
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

          {/* AQI Color Area */}
          <div
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-sm text-slate-600 dark:text-slate-400">AQI Color Area</span>
            <button
              onClick={() => onToggle('aqi-color')}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                options.find((o) => o.id === 'aqi-color')?.enabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                  options.find((o) => o.id === 'aqi-color')?.enabled ? 'left-5' : 'left-0.5'
                )}
              />
            </button>
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

export default function AirQuality() {
  const [selectedLocation, setSelectedLocation] = useState('New York NY');
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [viewOptions, setViewOptions] = useState(VIEW_OPTIONS);
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('New York NY, United States');

  const toggleOption = (id: string) => {
    setViewOptions((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));
  };

  const handleApply = () => {
    setViewOptionsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Air Quality Map</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time air quality monitoring and forecast
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Christopher W.</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <Card glass className="overflow-hidden">
        <div className="relative h-[500px]">
          {/* View Options Button */}
          <button
            onClick={() => setViewOptionsOpen(true)}
            className="absolute left-4 top-4 z-[400] flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Options</span>
          </button>

          {/* Search Bar */}
          <div className="absolute right-4 top-4 z-[400] flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-w-[320px]">
            <MapPin className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              placeholder="Search location..."
            />
            <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Map */}
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={12}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapController center={[40.7128, -74.0060]} />

            {/* Pollutant Markers */}
            {MOCK_POLLUTANTS.map((pollutant, index) => {
              const positions: [number, number][] = [
                [40.7282, -73.7949], // Queens
                [40.6782, -73.9442], // Brooklyn
                [40.7580, -73.9855], // Manhattan
                [40.7282, -74.0776], // Jersey City
              ];
              return (
                <PollutantMarker
                  key={pollutant.id}
                  pollutant={pollutant}
                  position={positions[index]}
                  isSelected={selectedPollutant === pollutant.id}
                  onClick={() => setSelectedPollutant(pollutant.id)}
                />
              );
            })}
          </MapContainer>

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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <AqiGauge value={20} label={selectedLocation} />

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
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <div className="lg:col-span-2">
          <ForecastChart />
        </div>
      </div>

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
                Air quality is good. Perfect time for outdoor activities!
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
