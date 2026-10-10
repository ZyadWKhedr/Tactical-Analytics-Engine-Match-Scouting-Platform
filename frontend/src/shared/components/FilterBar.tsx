import React from 'react';
import { Search, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { useI18n } from '../i18n';
import { useTheme } from '../lib/useTheme';
import type { CompetitionOut, TeamSummary } from '../../api/types';

interface FilterBarProps {
  competitions: CompetitionOut[];
  teams: TeamSummary[];
  selectedCompetitionId?: number;
  selectedTeamId?: number;
  onSelectCompetition: (id?: number) => void;
  onSelectTeam: (id: number) => void;
  onOpenSearch: () => void;
  onOpenSettings?: () => void;
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
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--panel)]/95 px-4 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0 font-sans backdrop-blur-sm">
      {/* Left side selectors */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)] font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-3)]" />
          <span className="hidden sm:inline uppercase text-3xs font-semibold tracking-wider">{t.scope}</span>
        </div>

        {/* Custom Styled Competition dropdown */}
        <div className="relative">
          <select
            value={selectedCompetitionId ?? ''}
            onChange={(e) => onSelectCompetition(e.target.value ? Number(e.target.value) : undefined)}
            className="h-8 ps-2.5 pe-7 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-sans font-medium appearance-none cursor-pointer max-w-[150px] sm:max-w-[200px]"
          >
            <option value="">{t.allCompetitions}</option>
            {competitions.map((comp) => (
              <option key={comp.competition_id} value={comp.competition_id}>
                {comp.name} ({comp.season})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2 text-[var(--text-3)]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Custom Styled Team dropdown */}
        <div className="relative">
          <select
            value={selectedTeamId ?? ''}
            onChange={(e) => onSelectTeam(Number(e.target.value))}
            className="h-8 ps-2.5 pe-7 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-sans font-medium appearance-none cursor-pointer max-w-[160px] sm:max-w-[220px]"
          >
            {teams.map((teamItem) => (
              <option key={teamItem.team.team_id} value={teamItem.team.team_id}>
                {teamItem.team.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2 text-[var(--text-3)]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Center Search Shortcut */}
      <button
        onClick={onOpenSearch}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] hover:bg-[var(--border)] text-xs text-[var(--text-3)] transition-colors w-56 justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span>{t.quickSearch}</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-3xs font-mono text-[var(--text-3)] bg-[var(--panel)] border border-[var(--border)] rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right side controls: Language, Theme, Settings & Health Status */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-0.5 text-xs font-mono">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-3xs font-bold transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-[var(--panel)] text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2 py-0.5 rounded text-3xs font-bold transition-colors cursor-pointer ${
              language === 'ar'
                ? 'bg-[var(--panel)] text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] hover:bg-[var(--border)] text-[var(--text)] transition-colors cursor-pointer"
          title={t.themeToggle}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[var(--text-2)]" />}
        </button>

        {/* Live Status Indicator */}
        <StatusIndicator showLatency />
      </div>
    </header>
  );
}
