import { TrendingUp, TrendingDown, Minus, Wind, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import type { AirQualityRecord } from '@/types/airQuality';
import { getAqiInfo, getStatsSummary } from '@/utils/aqiUtils';
import { Card, CardContent } from '@/components/ui/Card';

interface StatsCardsProps {
  data: AirQualityRecord[];
}

function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor,
  trend,
}: {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
        style={{ background: accentColor }}
      />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">{title}</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">{value}</span>
              {unit && <span className="text-xs text-slate-500 mb-0.5">{unit}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-red-400" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
            <span className={trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-500'}>
              {trend === 'up' ? 'Worsening' : trend === 'down' ? 'Improving' : 'Stable'} vs last hour
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data }: StatsCardsProps) {
  if (data.length === 0) return null;

  const pm25Stats    = getStatsSummary(data.map((d) => d.pm2_5));
  const worstProvince = data.reduce((a, b) =>
    b.us_epa_index > a.us_epa_index || (b.us_epa_index === a.us_epa_index && b.pm2_5 > a.pm2_5) ? b : a
  );
  const bestProvince = data.reduce((a, b) =>
    b.us_epa_index < a.us_epa_index || (b.us_epa_index === a.us_epa_index && b.pm2_5 < a.pm2_5) ? b : a
  );

  const unhealthyCount = data.filter((d) => d.us_epa_index >= 3).length;
  const worstInfo = getAqiInfo(worstProvince.us_epa_index);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Avg PM2.5"
        value={pm25Stats.avg.toFixed(1)}
        unit="µg/m³"
        subtitle={`Range: ${pm25Stats.min.toFixed(1)}–${pm25Stats.max.toFixed(1)}`}
        icon={Wind}
        accentColor="#60a5fa"
        trend="up"
      />
      <StatCard
        title="Worst Province"
        value={worstProvince.name.split(' ')[0]}
        subtitle={`${worstInfo.label} · PM2.5: ${worstProvince.pm2_5}`}
        icon={AlertTriangle}
        accentColor={worstInfo.hex}
      />
      <StatCard
        title="Cleanest Province"
        value={bestProvince.name.split(' ')[0]}
        subtitle={`PM2.5: ${bestProvince.pm2_5} µg/m³`}
        icon={CheckCircle2}
        accentColor="#10b981"
        trend="down"
      />
      <StatCard
        title="Unhealthy Areas"
        value={unhealthyCount}
        unit={`/ ${data.length}`}
        subtitle="AQI level 3 or above"
        icon={Activity}
        accentColor={unhealthyCount > data.length / 2 ? '#ef4444' : '#f97316'}
      />
    </div>
  );
}
