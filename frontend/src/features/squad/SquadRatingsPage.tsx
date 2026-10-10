import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSquadRatingsQuery, useMetaQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { SquadRatingOut } from '../../api/types';

interface SquadRatingsPageProps {
  onSelectTeam: (teamId: number) => void;
  selectedCompetitionId?: number;
}

export function SquadRatingsPage({ onSelectTeam, selectedCompetitionId }: SquadRatingsPageProps) {
  const { data: squadRatings, isLoading, isError, refetch } = useSquadRatingsQuery(selectedCompetitionId);

  const columns: ColumnDef<SquadRatingOut, any>[] = [
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: (info) => <span className="font-mono text-zinc-500 font-semibold">#{info.getValue<number>()}</span>,
    },
    {
      accessorKey: 'team.name',
      header: 'Club Name',
      cell: (info) => (
        <span className="font-semibold text-zinc-100 hover:text-emerald-400 cursor-pointer">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'competition_name',
      header: 'Competition',
      cell: (info) => <span className="text-zinc-400 text-2xs font-mono">{info.getValue<string>() || '—'}</span>,
    },
    {
      accessorKey: 'matches',
      header: 'Matches (n)',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-400">{info.getValue<number>()}</span>,
    },
    {
      accessorKey: 'team_rating',
      header: 'Overall (1-10)',
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 2)}</span>;
      },
    },
    {
      accessorKey: 'attack_rating',
      header: 'Attack Rating',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'defence_rating',
      header: 'Defence Rating',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'goal_diff_p90',
      header: 'GD / 90',
      cell: (info) => {
        const val = info.getValue<number>();
        if (val === null || val === undefined) return <span className="text-zinc-500">—</span>;
        const color = val > 0 ? 'text-emerald-400' : val < 0 ? 'text-rose-400' : 'text-zinc-400';
        return <span className={`font-mono tabular-nums ${color}`}>{val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'playstyle',
      header: 'Playstyle Archetype',
      cell: (info) => (
        <span className="text-2xs font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/50">
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
          className="text-2xs font-mono text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1"
        >
          Blueprint <ChevronRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <ChartCard
        title="Squad Tactical & Performance Ratings"
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
