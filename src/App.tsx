import { useState, useEffect, useCallback } from 'react';
import { fetchAirQuality } from '@/services/airQualityService';
import type { AirQualityRecord } from '@/types/airQuality';
import { AirQualityMap }   from '@/components/AirQualityMap';
import { ProvinceTable }   from '@/components/ProvinceTable';
import { ChartsPanel }     from '@/components/ChartsPanel';
import { StatsCards }      from '@/components/StatsCards';
import { ProvinceDetail }  from '@/components/ProvinceDetail';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RefreshCw, Wind, Globe, BarChart3, TableIcon } from 'lucide-react';
import { AQI_CATEGORIES }  from '@/utils/aqiUtils';

// ─── Tab type ────────────────────────────────────────────────────────────────
type Tab = 'map' | 'table';

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-96 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

// ─── AQI Legend ───────────────────────────────────────────────────────────────
function AqiLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(AQI_CATEGORIES).map(([, info]) => (
        <div key={info.label} className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: info.hex }} />
          <span className="hidden sm:inline">{info.label.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [data, setData]                   = useState<AirQualityRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedProvince, setSelected]   = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<Tab>('map');
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const resp = await fetchAirQuality();
      setData(resp.data);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Failed to load air quality data. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedRecord = selectedProvince
    ? data.find((d) => d.name === selectedProvince)
    : null;

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-tight">CamAir Dashboard</h1>
              <p className="text-[10px] text-slate-600 leading-tight">Cambodia Air Quality · Province View</p>
            </div>
          </div>

          {/* Center: Legend */}
          <div className="hidden md:flex items-center">
            <AqiLegend />
          </div>

          {/* Right: Status + Refresh */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live · {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              id="refresh-btn"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* ── KPI cards ── */}
            <div className="fade-in">
              <StatsCards data={data} />
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 bg-[#0d1424] rounded-xl p-1 w-fit border border-white/[0.06]">
              {([
                { id: 'map',   label: 'Map View',   Icon: Globe      },
                { id: 'table', label: 'Data Table',  Icon: TableIcon  },
              ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Map View ── */}
            {activeTab === 'map' && (
              <div className="fade-in grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                {/* Map + Charts */}
                <div className="flex flex-col gap-6">
                  {/* Map */}
                  <Card glass className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        Cambodia Air Quality Map
                        <span className="ml-2 text-[10px] font-normal text-slate-500 bg-white/5 rounded-full px-2 py-0.5">
                          {data.length} provinces
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[480px] rounded-xl overflow-hidden">
                        <AirQualityMap
                          data={data}
                          selectedProvince={selectedProvince}
                          onSelectProvince={setSelected}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-2 text-center">
                        Click any marker to explore province details
                      </p>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartsPanel data={data} selectedProvince={selectedProvince} />
                    </CardContent>
                  </Card>
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-4">
                  {selectedRecord ? (
                    <ProvinceDetail
                      record={selectedRecord}
                      onClose={() => setSelected(null)}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-slate-400 text-sm font-medium">Select a Province</p>
                          <p className="text-slate-600 text-xs mt-1">
                            Click a circle on the map or a row in the table to view detailed pollutant data.
                          </p>
                        </div>

                        {/* Quick AQI guide */}
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">AQI Guide</p>
                          {Object.entries(AQI_CATEGORIES).map(([, info]) => (
                            <div key={info.label} className="flex justify-between items-center py-1 border-b border-white/[0.04] last:border-0">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: info.hex }} />
                                <span className="text-xs text-slate-300">{info.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-600">{info.range}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── Table View ── */}
            {activeTab === 'table' && (
              <div className="fade-in grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-emerald-400" />
                      Province Data Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: 'calc(100vh - 340px)', minHeight: '400px' }}>
                      <ProvinceTable
                        data={data}
                        selectedProvince={selectedProvince}
                        onSelectProvince={(name) => { setSelected(name); setActiveTab('map'); }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar: Charts in table view */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartsPanel data={data} selectedProvince={selectedProvince} />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-4 mt-4">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between text-xs text-slate-600">
          <span>CamAir · Data Engineering Pipeline Project · ITC 2026</span>
          <span>Source: <span className="text-blue-400/60">data.mef.gov.kh</span> via Kafka + Spark ELT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
