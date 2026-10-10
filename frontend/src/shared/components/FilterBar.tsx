import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import type { CompetitionOut, TeamSummary } from '../../api/types';

interface FilterBarProps {
  competitions: CompetitionOut[];
  teams: TeamSummary[];
  selectedCompetitionId?: number;
  selectedTeamId?: number;
  onSelectCompetition: (id?: number) => void;
  onSelectTeam: (id: number) => void;
  onOpenSearch: () => void;
}

export function FilterBar({
  competitions,
  teams,
  selectedCompetitionId,
  selectedTeamId,
  onSelectCompetition,
  onSelectTeam,
  onOpenSearch,
}: FilterBarProps) {
  return (
    <header className="h-12 border-b border-zinc-800/80 bg-zinc-950/80 px-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30">
      {/* Left side selectors */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">Scope:</span>
        </div>

        {/* Competition dropdown */}
        <select
          value={selectedCompetitionId ?? ''}
          onChange={(e) => onSelectCompetition(e.target.value ? Number(e.target.value) : undefined)}
          className="h-7 px-2.5 text-xs rounded border border-zinc-800 bg-zinc-900/90 text-zinc-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
        >
          <option value="">All Competitions</option>
          {competitions.map((comp) => (
            <option key={comp.competition_id} value={comp.competition_id}>
              {comp.name} ({comp.season})
            </option>
          ))}
        </select>

        {/* Team dropdown */}
        <select
          value={selectedTeamId ?? ''}
          onChange={(e) => onSelectTeam(Number(e.target.value))}
          className="h-7 px-2.5 text-xs rounded border border-zinc-800 bg-zinc-900/90 text-zinc-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans font-medium"
        >
          {teams.map((t) => (
            <option key={t.team.team_id} value={t.team.team_id}>
              {t.team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Center Search Shortcut */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2 px-3 py-1 rounded border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/60 text-xs text-zinc-400 transition-colors w-64 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span>Quick search...</span>
        </div>
        <kbd className="px-1.5 py-0.2 text-2xs font-mono text-zinc-500 bg-zinc-800/90 border border-zinc-700/60 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right side live status indicator */}
      <div className="flex items-center gap-3">
        <StatusIndicator showLatency />
      </div>
    </header>
  );
}
