import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { usePlayerRatingsQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import type { PlayerRatingOut } from '../../api/types';

interface PlayerScoutingPageProps {
  onSelectPlayer?: (playerId: number) => void;
}

export function PlayerScoutingPage({ onSelectPlayer }: PlayerScoutingPageProps) {
  const [positionGroup, setPositionGroup] = useState<string>('All');
  const [minMinutes, setMinMinutes] = useState<number>(300);

  const { data: playersData, isLoading, isError, refetch } = usePlayerRatingsQuery({
    positionGroup: positionGroup === 'All' ? undefined : positionGroup,
    minMinutes,
    limit: 50,
  });

  const columns: ColumnDef<PlayerRatingOut, any>[] = [
    {
      accessorKey: 'player.name',
      header: 'Player Name',
      cell: (info) => (
        <span className="font-semibold text-zinc-100 hover:text-emerald-400 cursor-pointer">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'team.name',
      header: 'Club',
      cell: (info) => <span className="text-zinc-300 text-2xs font-mono">{info.getValue<string>() || '—'}</span>,
    },
    {
      accessorKey: 'position_group',
      header: 'Role / Pos',
      cell: (info) => (
        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
          {info.getValue<string>() || 'Field'}
        </span>
      ),
    },
    {
      accessorKey: 'minutes',
      header: 'Minutes',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-400">{info.getValue<number>()}&apos;</span>,
    },
    {
      accessorKey: 'rating',
      header: 'Rating (1-10)',
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 2)}</span>;
      },
    },
    {
      accessorKey: 'percentile_in_position',
      header: 'Pos. Percentile',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatPercentile(info.getValue<number>())}</span>,
    },
    {
      accessorKey: 'xg',
      header: 'xG',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'xa',
      header: 'xA',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'goals',
      header: 'Goals',
      cell: (info) => <span className="font-mono tabular-nums text-emerald-400 font-bold">{info.getValue<number>()}</span>,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <ChartCard
        title="Player Scouting & Percentile Rankings"
        subtitle="Hierarchical Bayes ratings across position-specific action components"
        sampleSize={`${playersData?.total ?? 0} qualified players`}
        units="Scale 1.0 - 10.0"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={positionGroup}
              onChange={(e) => setPositionGroup(e.target.value)}
              className="h-7 px-2 text-2xs rounded border border-zinc-800 bg-zinc-900 text-zinc-300 font-mono"
            >
              <option value="All">All Positions</option>
              <option value="Forward">Forwards</option>
              <option value="Midfielder">Midfielders</option>
              <option value="Defender">Defenders</option>
              <option value="Goalkeeper">Goalkeepers</option>
            </select>
            <select
              value={minMinutes}
              onChange={(e) => setMinMinutes(Number(e.target.value))}
              className="h-7 px-2 text-2xs rounded border border-zinc-800 bg-zinc-900 text-zinc-300 font-mono"
            >
              <option value={0}>≥ 0 mins</option>
              <option value={300}>≥ 300 mins</option>
              <option value={600}>≥ 600 mins</option>
              <option value={900}>≥ 900 mins</option>
            </select>
          </div>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      >
        <DataTable
          columns={columns}
          data={playersData?.items || []}
          pageSize={15}
          searchPlaceholder="Search player or club..."
          onRowClick={(row) => onSelectPlayer && onSelectPlayer(row.player.player_id)}
        />
      </ChartCard>
    </div>
  );
}
