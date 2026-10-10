import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSquadRatingsQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import { ChevronRight } from 'lucide-react';
import type { SquadRatingOut } from '../../api/types';

interface SquadRatingsPageProps {
  onSelectTeam: (teamId: number) => void;
  selectedCompetitionId?: number;
}

export function SquadRatingsPage({ onSelectTeam, selectedCompetitionId }: SquadRatingsPageProps) {
  const { data: squadRatings, isLoading, isError, refetch } = useSquadRatingsQuery(selectedCompetitionId);
  const { t } = useI18n();

  const columns: ColumnDef<SquadRatingOut, any>[] = [
    {
      accessorKey: 'rank',
      header: '#',
      cell: (info) => <span className="font-mono text-muted-foreground font-semibold">#{info.getValue()}</span>,
    },
    {
      accessorKey: 'team.name',
      header: t.club,
      cell: (info) => (
        <span className="font-semibold text-foreground hover:text-emerald-500 cursor-pointer">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'competition_name',
      header: t.activeCompetitions,
      cell: (info) => <span className="text-muted-foreground text-2xs font-mono">{info.getValue<string>() || '—'}</span>,
    },
    {
      accessorKey: 'matches',
      header: t.matches,
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{info.getValue()}</span>,
    },
    {
      accessorKey: 'team_rating',
      header: t.overallRating,
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 2)}</span>;
      },
    },
    {
      accessorKey: 'attack_rating',
      header: t.attackPower,
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'defence_rating',
      header: t.defenceRating,
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'goal_diff_p90',
      header: 'GD / 90',
      cell: (info) => {
        const val = info.getValue<number>();
        if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
        const color = val > 0 ? 'text-emerald-500' : val < 0 ? 'text-rose-500' : 'text-muted-foreground';
        return <span className={`font-mono tabular-nums font-semibold ${color}`}>{val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'playstyle',
      header: t.archetype,
      cell: (info) => (
        <span className="text-2xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-surface border border-border">
          {info.getValue<string>() || 'Balanced'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => (
        <button
          onClick={() => onSelectTeam(info.row.original.team.team_id)}
          className="text-2xs font-mono text-muted-foreground hover:text-emerald-500 inline-flex items-center gap-1"
        >
          {t.scout} <ChevronRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <ChartCard
        title={t.squadRatings}
        subtitle="Bayesian hierarchical squad efficiency calibrated against 2.46M SPADL events"
        sampleSize={`${squadRatings?.length ?? 0} clubs`}
        units="Rating 1.0 - 10.0 (μ = 6.5)"
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      >
        <DataTable
          columns={columns}
          data={squadRatings || []}
          pageSize={18}
          searchPlaceholder="Search club name or archetype..."
          onRowClick={(row) => onSelectTeam(row.team.team_id)}
        />
      </ChartCard>
    </div>
  );
}
