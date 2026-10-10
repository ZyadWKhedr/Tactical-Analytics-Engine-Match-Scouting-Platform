import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { usePlayerRatingsQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import type { PlayerRatingOut } from '../../api/types';

interface PlayerScoutingPageProps {
  onSelectPlayer?: (playerId: number) => void;
}

export function PlayerScoutingPage({ onSelectPlayer }: PlayerScoutingPageProps) {
  const [positionGroup, setPositionGroup] = useState<string>('All');
  const [minMinutes, setMinMinutes] = useState<number>(300);
  const { t } = useI18n();

  const { data: playersData, isLoading, isError, refetch } = usePlayerRatingsQuery({
    positionGroup: positionGroup === 'All' ? undefined : positionGroup,
    minMinutes,
    limit: 50,
  });

  const columns: ColumnDef<PlayerRatingOut, any>[] = [
    {
      accessorKey: 'player.name',
      header: t.scoutedPlayers,
      cell: (info) => (
        <span className="font-semibold text-foreground hover:text-emerald-500 cursor-pointer">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'team.name',
      header: t.club,
      cell: (info) => <span className="text-muted-foreground text-2xs font-mono">{info.getValue<string>() || '—'}</span>,
    },
    {
      accessorKey: 'position_group',
      header: t.role,
      cell: (info) => (
        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-foreground">
          {info.getValue<string>() || 'Field'}
        </span>
      ),
    },
    {
      accessorKey: 'minutes',
      header: t.minutes,
      cell: (info) => <span className="font-mono tabular-nums text-muted-foreground">{info.getValue<number>()}&apos;</span>,
    },
    {
      accessorKey: 'rating',
      header: t.rating,
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 2)}</span>;
      },
    },
    {
      accessorKey: 'percentile_in_position',
      header: 'Pos. Percentile',
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{formatPercentile(info.getValue<number>())}</span>,
    },
    {
      accessorKey: 'xg',
      header: t.xg,
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'xa',
      header: t.xa,
      cell: (info) => <span className="font-mono tabular-nums text-foreground">{formatNumber(info.getValue<number>(), 2)}</span>,
    },
    {
      accessorKey: 'goals',
      header: t.goals,
      cell: (info) => <span className="font-mono tabular-nums text-emerald-500 font-bold">{info.getValue()}</span>,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <ChartCard
        title={t.playerScouting}
        subtitle="Hierarchical Bayes ratings across position-specific action components"
        sampleSize={`${playersData?.total ?? 0} qualified players`}
        units="Scale 1.0 - 10.0"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={positionGroup}
              onChange={(e) => setPositionGroup(e.target.value)}
              className="h-7 px-2 text-2xs rounded border border-border bg-surface text-foreground font-mono"
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
              className="h-7 px-2 text-2xs rounded border border-border bg-surface text-foreground font-mono"
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
