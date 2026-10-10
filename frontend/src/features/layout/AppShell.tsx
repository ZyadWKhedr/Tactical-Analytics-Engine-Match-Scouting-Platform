import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  Award,
  Swords,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FilterBar } from '../../shared/components/FilterBar';
import { GlobalSearch } from '../../shared/components/GlobalSearch';
import { useMetaQuery, useTeamsQuery } from '../../shared/api/queries';
import { useI18n } from '../../shared/i18n';

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
    { id: 'home', label: t.home, icon: LayoutDashboard },
    { id: 'opponent', label: t.opponentReport, icon: Target },
    { id: 'squads', label: t.squadRatings, icon: Award },
    { id: 'players', label: t.playerScouting, icon: Users },
    { id: 'matchup', label: t.matchupSimulator, icon: Swords },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Modern Tactical Navigation Sidebar (Collapsible) */}
      <aside
        className={`shrink-0 border-e border-[var(--border)] bg-[var(--panel)] flex flex-col justify-between select-none transition-all duration-200 z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Brand */}
          <div
            className={`h-14 border-b border-[var(--border)] flex items-center shrink-0 bg-[var(--panel)] ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5 gap-2'
            }`}
          >
            {!isCollapsed ? (
              <>
                <div
                  onClick={() => onTabChange('home')}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0 flex-1"
                  title="Tactical OS"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="font-sans font-bold text-white text-sm">T</span>
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="text-sm font-bold text-[var(--text)] tracking-tight whitespace-nowrap block leading-tight font-sans">
                      {t.brandName}
                    </span>
                    <span className="text-3xs text-[var(--text-3)] font-sans mt-0.5 whitespace-nowrap block">
                      {t.brandSubtitle}
                    </span>
                  </div>
                </div>

                {/* Sidebar Collapse Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--panel-2)] transition-colors focus:outline-none shrink-0 cursor-pointer"
                  title={language === 'ar' ? 'طي القائمة' : 'Collapse sidebar'}
                >
                  {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </>
            ) : (
              /* When Collapsed: Clean centered Logo Button that expands on click */
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-[var(--accent)] hover:opacity-90 flex items-center justify-center text-white transition-all shadow-xs cursor-pointer group"
                title={language === 'ar' ? 'توسيع القائمة' : 'Expand sidebar'}
              >
                <span className="font-sans font-bold text-sm group-hover:hidden">T</span>
                {language === 'ar' ? (
                  <ChevronLeft className="w-4 h-4 hidden group-hover:block" />
                ) : (
                  <ChevronRight className="w-4 h-4 hidden group-hover:block" />
                )}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto font-sans">
            {!isCollapsed && (
              <div className="px-2.5 py-1.5 text-3xs font-semibold uppercase tracking-wider text-[var(--text-3)] font-mono">
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold shadow-xs'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg)]">
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

        <main className="flex-1 overflow-y-auto bg-[var(--bg)]">
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
