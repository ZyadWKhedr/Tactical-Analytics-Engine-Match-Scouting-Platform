import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  Award,
  Swords,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FilterBar } from '../../shared/components/FilterBar';
import { GlobalSearch } from '../../shared/components/GlobalSearch';
import { useMetaQuery, useTeamsQuery } from '../../shared/api/queries';
import { useI18n } from '../../shared/i18n';
import { formatInt } from '../../shared/lib/utils';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: meta } = useMetaQuery();
  const { data: teams } = useTeamsQuery(selectedCompetitionId);
  const { t } = useI18n();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t.executiveHome, icon: LayoutDashboard },
    { id: 'opponent', label: t.opponentReport, icon: Target },
    { id: 'squads', label: t.squadRatings, icon: Award },
    { id: 'players', label: t.playerScouting, icon: Users },
    { id: 'matchup', label: t.matchupSimulator, icon: Swords },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Tactical Navigation Sidebar (Collapsible & Responsive) */}
      <aside
        className={`shrink-0 border-r border-border bg-card flex flex-col justify-between select-none transition-all duration-200 z-40 ${
          isCollapsed ? 'w-16' : 'w-56 sm:w-60'
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="h-13 px-3.5 border-b border-border flex items-center justify-between gap-2">
            <div
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
              title="Tactical OS — Match Intelligence"
            >
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-bold tracking-tight text-foreground font-mono leading-none truncate">
                    {t.brandName}
                  </div>
                  <div className="text-3xs font-mono text-muted-foreground mt-0.5 leading-none truncate">
                    {t.brandSubtitle}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors focus:outline-none"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-3xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                {t.scoutingModules}
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-surface text-emerald-500 dark:text-emerald-400 border border-border font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface/60'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Context */}
        {!isCollapsed && (
          <div className="p-3 border-t border-border text-2xs font-mono text-muted-foreground space-y-1 bg-card/50">
            <div className="flex justify-between">
              <span>{t.matches}</span>
              <span className="text-foreground tabular-nums">{formatInt(meta?.n_matches ?? 1941)}</span>
            </div>
            <div className="flex justify-between">
              <span>SPADL Events</span>
              <span className="text-foreground tabular-nums">2.46M</span>
            </div>
            <div className="flex justify-between">
              <span>Pitch Surface</span>
              <span className="text-foreground">105×68m</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <FilterBar
          competitions={meta?.competitions || []}
          teams={teams || []}
          selectedCompetitionId={selectedCompetitionId}
          selectedTeamId={selectedTeamId}
          onSelectCompetition={onSelectCompetitionId}
          onSelectTeam={onSelectTeamId}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-background/60">
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
