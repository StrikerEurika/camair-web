import { getAqiInfo } from "@/utils/aqiUtils";
import { AqiBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import type { AirQualityRecord } from "@/types/airQuality";

export function ProvinceTable({
  data,
  selectedProvince,
  onSelect,
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
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              Province
            </th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              PM2.5
            </th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              PM10
            </th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              O3
            </th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              NO2
            </th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
              AQI
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr
              key={record.id}
              onClick={() => onSelect(record.name)}
              className={cn(
                "border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors",
                selectedProvince === record.name
                  ? "bg-blue-50 dark:bg-blue-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
              )}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getAqiColor(record.us_epa_index),
                    }}
                  />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {record.name}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                {record.pm2_5.toFixed(1)}
              </td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                {record.pm10.toFixed(1)}
              </td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                {record.o3.toFixed(1)}
              </td>
              <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                {record.no2.toFixed(1)}
              </td>
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