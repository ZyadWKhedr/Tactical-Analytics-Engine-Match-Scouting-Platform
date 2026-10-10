import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  Award,
  Swords,
  Settings as SettingsIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { FilterBar } from '../../shared/components/FilterBar';
import { GlobalSearch } from '../../shared/components/GlobalSearch';
import { useMetaQuery, useTeamsQuery } from '../../shared/api/queries';
import { useI18n } from '../../shared/i18n';
import { formatInt } from '../../shared/lib/utils';

export type NavTab = 'home' | 'opponent' | 'squads' | 'players' | 'matchup' | 'settings' | 'styleguide';

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
  const { t, language } = useI18n();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t.executiveHome, icon: LayoutDashboard },
    { id: 'opponent', label: t.opponentReport, icon: Target },
    { id: 'squads', label: t.squadRatings, icon: Award },
    { id: 'players', label: t.playerScouting, icon: Users },
    { id: 'matchup', label: t.matchupSimulator, icon: Swords },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
    { id: 'styleguide', label: t.styleGuide, icon: BookOpen },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink font-sans">
      {/* Tactical Navigation Sidebar (Collapsible & Editorial) */}
      <aside
        className={`shrink-0 border-e border-rule bg-bg-raised flex flex-col justify-between select-none transition-all duration-200 z-40 ${
          isCollapsed ? 'w-16' : 'w-60 sm:w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Brand */}
          <div className="h-14 px-3.5 border-b border-rule flex items-center justify-between gap-2 shrink-0 bg-bg-raised">
            <div
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0"
              title="Tactical OS — Football Scouting & Intelligence Archive"
            >
              <div className="w-7 h-7 rounded border border-accent/40 bg-accent/10 flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-accent text-sm">T</span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-sm font-bold font-serif text-ink tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block leading-none">
                    {t.brandName}
                  </span>
                  <span className="text-3xs font-mono text-ink-3 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block leading-none mt-1">
                    {t.brandSubtitle}
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded text-ink-3 hover:text-ink hover:bg-bg-sunken transition-colors focus:outline-none shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {language === 'ar' ? (
                isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {!isCollapsed && (
              <div className="px-2.5 py-1.5 text-3xs font-semibold uppercase tracking-widest text-ink-3 font-mono">
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
                      ? 'bg-bg-sunken text-accent font-semibold border-s-2 border-accent shadow-2xs'
                      : 'text-ink-2 hover:text-ink hover:bg-bg-sunken/60'
                  } ${isCollapsed ? 'justify-center px-0 border-s-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-ink-3'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Context */}
          {!isCollapsed && (
            <div className="p-3.5 border-t border-rule text-2xs font-mono text-ink-3 space-y-1 bg-bg-sunken/40 shrink-0">
              <div className="flex justify-between">
                <span>{t.matches}</span>
                <span className="text-ink tabular-nums font-bold">{formatInt(meta?.n_matches ?? 1941)}</span>
              </div>
              <div className="flex justify-between">
                <span>SPADL Corpus</span>
                <span className="text-ink tabular-nums font-bold">2.46M</span>
              </div>
              <div className="flex justify-between">
                <span>Pitch Surface</span>
                <span className="text-ink">105×68m</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg">
        <FilterBar
          competitions={meta?.competitions || []}
          teams={teams || []}
          selectedCompetitionId={selectedCompetitionId}
          selectedTeamId={selectedTeamId}
          onSelectCompetition={onSelectCompetitionId}
          onSelectTeam={onSelectTeamId}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => onTabChange('settings')}
        />

        <main className="flex-1 overflow-y-auto bg-bg/80">
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
