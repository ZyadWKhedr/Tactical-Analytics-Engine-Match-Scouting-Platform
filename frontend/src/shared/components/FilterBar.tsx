import React from 'react';
import { Search, SlidersHorizontal, Sun, Moon, Globe } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { useI18n, Language } from '../i18n';
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
  onOpenSettings,
}: FilterBarProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-rule bg-bg-raised/95 px-4 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0">
      {/* Left side selectors */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-ink-3 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-ink-3" />
          <span className="hidden sm:inline uppercase text-3xs font-semibold tracking-wider">{t.scope}</span>
        </div>

        {/* Competition dropdown */}
        <select
          value={selectedCompetitionId ?? ''}
          onChange={(e) => onSelectCompetition(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 px-2.5 text-xs rounded border border-rule bg-bg-sunken text-ink focus:outline-none focus:ring-1 focus:ring-accent font-sans max-w-[150px] sm:max-w-[200px]"
        >
          <option value="">{t.allCompetitions}</option>
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
          className="h-8 px-2.5 text-xs rounded border border-rule bg-bg-sunken text-ink focus:outline-none focus:ring-1 focus:ring-accent font-sans font-medium max-w-[160px] sm:max-w-[220px]"
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
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded border border-rule bg-bg-sunken/60 hover:bg-bg-sunken text-xs text-ink-3 transition-colors w-56 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span>{t.quickSearch}</span>
        </div>
        <kbd className="px-1.5 py-0.2 text-3xs font-mono text-ink-3 bg-bg-raised border border-rule rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right side controls: Language, Theme, Settings & Health Status */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center rounded border border-rule bg-bg-sunken p-0.5 text-xs font-mono">
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded text-3xs font-bold transition-colors ${
              language === 'en'
                ? 'bg-bg-raised text-accent shadow-2xs'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-1.5 py-0.5 rounded text-3xs font-bold transition-colors ${
              language === 'ar'
                ? 'bg-bg-raised text-accent shadow-2xs'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-rule bg-bg-sunken hover:bg-bg text-ink transition-colors"
          title={t.themeToggle}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-warning" /> : <Moon className="w-3.5 h-3.5 text-ink-2" />}
        </button>

        {/* Live Status Indicator */}
        <StatusIndicator showLatency />
      </div>
    </header>
  );
}
