import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all',
  {
    variants: {
      variant: {
        default:     'bg-slate-800 text-slate-300 border border-slate-700',
        good:        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        moderate:    'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
        sensitive:   'bg-orange-500/15 text-orange-400 border border-orange-500/30',
        unhealthy:   'bg-red-500/15 text-red-400 border border-red-500/30',
        veryBad:     'bg-purple-500/15 text-purple-400 border border-purple-500/30',
        hazardous:   'bg-rose-900/30 text-rose-400 border border-rose-900/40',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function AqiBadge({ index }: { index: number }) {
  const MAP: Record<number, { label: string; variant: BadgeVariant }> = {
    1: { label: 'Good',             variant: 'good'      },
    2: { label: 'Moderate',         variant: 'moderate'  },
    3: { label: 'Unhealthy SG',     variant: 'sensitive' },
    4: { label: 'Unhealthy',        variant: 'unhealthy' },
    5: { label: 'Very Unhealthy',   variant: 'veryBad'   },
    6: { label: 'Hazardous',        variant: 'hazardous' },
  };
  const info = MAP[index] ?? MAP[1];
  return (
    <Badge variant={info.variant}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      {info.label}
    </Badge>
  );
}
