import { Droplets, Cloud, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const POLLUTANT_CONFIG: Record<
  string,
  { label: string; unit: string; icon: React.ReactNode; color: string }
> = {
  pm2_5: {
    label: "PM2.5",
    unit: "µg/m³",
    icon: <Droplets className="w-3 h-3" />,
    color: "#ec4899",
  },
  pm10: {
    label: "PM10",
    unit: "µg/m³",
    icon: <Droplets className="w-3 h-3" />,
    color: "#f59e0b",
  },
  o3: {
    label: "O3",
    unit: "µg/m³",
    icon: <Cloud className="w-3 h-3" />,
    color: "#8b5cf6",
  },
  no2: {
    label: "NO2",
    unit: "µg/m³",
    icon: <Wind className="w-3 h-3" />,
    color: "#ef4444",
  },
  so2: {
    label: "SO2",
    unit: "µg/m³",
    icon: <Cloud className="w-3 h-3" />,
    color: "#06b6d4",
  },
  co: {
    label: "CO",
    unit: "µg/m³",
    icon: <Wind className="w-3 h-3" />,
    color: "#10b981",
  },
};

interface PollutantSelectorProps {
  selected: string;
  onSelect: (pollutant: string) => void;
}

export function PollutantSelector({ selected, onSelect }: PollutantSelectorProps) {
  return (
    <div className="absolute left-4 bottom-4 z-50 flex gap-2">
      {(["pm25", "pm10", "o3", "no2"] as const).map((p) => (
        <Button
          key={p}
          onClick={() => onSelect(p)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            selected === p
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          )}
        >
          {POLLUTANT_CONFIG[p === "pm25" ? "pm2_5" : p]?.label ||
            p.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
