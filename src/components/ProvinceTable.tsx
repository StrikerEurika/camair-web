import { useState, useMemo } from 'react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/Table';
import { AqiBadge } from '@/components/ui/Badge';
import type { AirQualityRecord, SortField, SortDirection } from '@/types/airQuality';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { formatPollutant } from '@/utils/aqiUtils';

interface ProvinceTableProps {
  data: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
}

type Column = {
  key: SortField;
  label: string;
  unit?: string;
  align?: 'left' | 'right';
};

const COLUMNS: Column[] = [
  { key: 'name',          label: 'Province',  align: 'left'  },
  { key: 'us_epa_index',  label: 'AQI Level', align: 'left'  },
  { key: 'pm2_5',         label: 'PM2.5',     unit: 'µg/m³', align: 'right' },
  { key: 'pm10',          label: 'PM10',      unit: 'µg/m³', align: 'right' },
  { key: 'co',            label: 'CO',        unit: 'µg/m³', align: 'right' },
  { key: 'no2',           label: 'NO₂',       unit: 'µg/m³', align: 'right' },
  { key: 'o3',            label: 'O₃',        unit: 'µg/m³', align: 'right' },
  { key: 'so2',           label: 'SO₂',       unit: 'µg/m³', align: 'right' },
  { key: 'last_updated',  label: 'Updated',   align: 'right' },
];

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDirection }) {
  if (field !== sortField) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />;
}

export function ProvinceTable({ data, selectedProvince, onSelectProvince }: ProvinceTableProps) {
  const [sortField, setSortField]   = useState<SortField>('us_epa_index');
  const [sortDir, setSortDir]       = useState<SortDirection>('desc');
  const [search, setSearch]         = useState('');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((d) => d.name.toLowerCase().includes(q));
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  function formatValue(record: AirQualityRecord, col: Column): React.ReactNode {
    const val = record[col.key];
    if (col.key === 'us_epa_index') return <AqiBadge index={record.us_epa_index} />;
    if (col.key === 'name')         return <span className="font-medium text-slate-900 dark:text-white">{record.name}</span>;
    if (col.key === 'last_updated') return <span className="text-slate-500 text-xs">{String(val)}</span>;
    if (typeof val === 'number')    return <span className="font-mono">{formatPollutant(val)}</span>;
    return String(val);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search province..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <tr>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={`cursor-pointer hover:text-slate-300 transition-colors ${col.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                    {col.unit && <span className="text-[10px] text-slate-600 font-normal">{col.unit}</span>}
                  </div>
                </TableHead>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {sorted.map((record) => (
              <TableRow
                key={record.id}
                onClick={() => onSelectProvince(record.name)}
                className={record.name === selectedProvince ? '!bg-blue-500/10 border-l-2 border-l-blue-500' : ''}
              >
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.key as string}
                    className={col.align === 'right' ? 'text-right' : ''}
                  >
                    {formatValue(record, col)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No provinces match "{search}"</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-600 text-right">
        Showing {sorted.length} of {data.length} provinces
      </p>
    </div>
  );
}
