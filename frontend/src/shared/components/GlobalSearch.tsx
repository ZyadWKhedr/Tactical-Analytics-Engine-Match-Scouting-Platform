import React, { useState, useEffect } from 'react';
import { Search, X, Shield, User, ArrowRight } from 'lucide-react';
import { useTeamsQuery, usePlayerRatingsQuery } from '../api/queries';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: number) => void;
  onSelectPlayer?: (playerId: number) => void;
}

export function GlobalSearch({ isOpen, onClose, onSelectTeam }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const { data: teams } = useTeamsQuery();
  const { data: playersData } = usePlayerRatingsQuery(
    query.trim().length > 1 ? { search: query.trim(), limit: 8 } : undefined
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTeams = (teams || []).filter((t) =>
    t.team.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const matchedPlayers = playersData?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 py-3 border-b border-border bg-surface/80">
          <Search className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, players, scouting files... (esc to close)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground mr-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-2xs font-mono text-muted-foreground bg-surface border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Teams section */}
          {filteredTeams.length > 0 && (
            <div>
              <div className="px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Clubs & Squads
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredTeams.map((t) => (
                  <button
                    key={t.team.team_id}
                    onClick={() => {
                      onSelectTeam(t.team.team_id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-left hover:bg-surface group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500" />
                      <span className="font-medium text-foreground group-hover:text-emerald-500">
                        {t.team.name}
                      </span>
                      <span className="text-2xs font-mono text-muted-foreground">
                        {t.competition_name || 'League'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-2xs font-mono text-muted-foreground">
                      <span>Rating: {t.rating.team.toFixed(1)}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Players section */}
          {matchedPlayers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Scouted Players
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedPlayers.map((p) => (
                  <button
                    key={p.player.player_id}
                    onClick={() => {
                      if (p.team?.team_id) onSelectTeam(p.team.team_id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-left hover:bg-surface group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500" />
                      <span className="font-medium text-foreground group-hover:text-emerald-500">
                        {p.player.name}
                      </span>
                      <span className="text-2xs font-mono text-muted-foreground">
                        {p.position_group} · {p.team?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-2xs font-mono text-muted-foreground">
                      <span className="text-emerald-500 font-semibold">{p.rating.toFixed(1)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredTeams.length === 0 && matchedPlayers.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground font-mono">
              No matching clubs or players found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
