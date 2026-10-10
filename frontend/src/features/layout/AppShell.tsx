import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  Award,
  Swords,
  Layers,
} from 'lucide-react';
import { FilterBar } from '../../shared/components/FilterBar';
import { GlobalSearch } from '../../shared/components/GlobalSearch';
import { useMetaQuery, useTeamsQuery } from '../../shared/api/queries';

export type NavTab = 'home' | 'opponent' | 'squads' | 'players' | 'matchup';

interface AppShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedTeamId: number;
  onSelectTeamId: (teamId: number) => void;
  selectedCompetitionId?: number;
  onSelectCompetitionId: (compId?: number) => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  onTabChange,
  selectedTeamId,
  onSelectTeamId,
  selectedCompetitionId,
  onSelectCompetitionId,
  children,
}: AppShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: meta } = useMetaQuery();
  const { data: teams } = useTeamsQuery(selectedCompetitionId);

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Executive Home', icon: LayoutDashboard },
    { id: 'opponent', label: 'Opponent Report', icon: Target },
    { id: 'squads', label: 'Squad Ratings', icon: Award },
    { id: 'players', label: 'Player Scouting', icon: Users },
    { id: 'matchup', label: 'Matchup Simulator', icon: Swords },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Tactical Left Navigation Sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between select-none">
        <div>
          {/* Header Brand */}
          <div
            onClick={() => onTabChange('home')}
            className="h-12 px-4 border-b border-zinc-800/80 flex items-center gap-2.5 cursor-pointer hover:bg-zinc-900/50 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-zinc-100 font-mono">
                TACTICAL OS
              </div>
              <div className="text-3xs font-mono text-zinc-500 -mt-0.5">
                Match Intelligence
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            <div className="px-2.5 py-1 text-3xs font-semibold uppercase tracking-wider text-zinc-600 font-mono">
              Scouting Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-emerald-400 border border-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Context */}
        <div className="p-3 border-t border-zinc-800/80 text-2xs font-mono text-zinc-500 space-y-1 bg-zinc-950">
          <div className="flex justify-between">
            <span>Matches</span>
            <span className="text-zinc-400 tabular-nums">{meta?.n_matches ?? 1941}</span>
          </div>
          <div className="flex justify-between">
            <span>SPADL Events</span>
            <span className="text-zinc-400 tabular-nums">2.46M</span>
          </div>
          <div className="flex justify-between">
            <span>Pitch Surface</span>
            <span className="text-zinc-400">105×68m</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        <FilterBar
          competitions={meta?.competitions || []}
          teams={teams || []}
          selectedCompetitionId={selectedCompetitionId}
          selectedTeamId={selectedTeamId}
          onSelectCompetition={onSelectCompetitionId}
          onSelectTeam={onSelectTeamId}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-zinc-950/60">
          {children}
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTeam={(teamId) => {
          onSelectTeamId(teamId);
          onTabChange('opponent');
        }}
      />
    </div>
  );
}
