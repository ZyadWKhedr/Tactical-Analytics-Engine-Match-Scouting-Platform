import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  useOpponentBlueprintQuery,
  useZonesQuery,
  useMatchShotsQuery,
  usePassingNetworkQuery,
  useMatchesQuery,
} from '../../shared/api/queries';
import { DataTable } from '../../shared/components/DataTable';
import { ShotMap } from '../../shared/components/ShotMap';
import { PassNetwork } from '../../shared/components/PassNetwork';
import { ZoneGrid } from '../../shared/components/ZoneGrid';
import { formatNumber, formatPercent, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import {
  Shield,
  Activity,
  Crosshair,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import type { PressTrigger, TopPlayer } from '../../api/types';

interface OpponentReportPageProps {
  teamId: number;
}

export function OpponentReportPage({ teamId }: OpponentReportPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attack' | 'defence' | 'press'>('overview');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [openDisclosure, setOpenDisclosure] = useState<string | null>(null);
  const { t } = useI18n();

  // Queries
  const { data: blueprint, isLoading: bpLoading, isError: bpError, refetch: refetchBp } =
    useOpponentBlueprintQuery(teamId);
  const { data: zonesData, isLoading: zonesLoading } = useZonesQuery(teamId);
  const { data: recentMatches } = useMatchesQuery({ teamId, limit: 1 });
  const latestMatchId = recentMatches?.[0]?.match_id;

  const { data: shotsData, isLoading: shotsLoading } = useMatchShotsQuery(latestMatchId);
  const { data: passingData, isLoading: passLoading } = usePassingNetworkQuery(latestMatchId, teamId);

  const teamName = blueprint?.team?.name || 'Selected Club';

  // Press Triggers Columns
  const pressColumns: ColumnDef<PressTrigger, any>[] = [
    {
      accessorKey: 'trigger',
      header: 'Situational Trigger',
      cell: (info) => (
        <span className="font-medium text-ink">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'engagement_rate',
      header: 'Press Rate',
      cell: (info) => (
        <span className="font-mono tabular-nums text-positive font-bold">
          {formatPercent(info.getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'league_rate',
      header: 'League Avg',
      cell: (info) => (
        <span className="font-mono tabular-nums text-ink-3">
          {formatPercent(info.getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'lift',
      header: 'Lift Factor',
      cell: (info) => {
        const lift = info.getValue<number>();
        return (
          <span className="font-mono tabular-nums text-ink font-bold">
            {lift > 0 ? `+${(lift * 100).toFixed(1)}%` : `${(lift * 100).toFixed(1)}%`}
          </span>
        );
      },
    },
    {
      accessorKey: 'z',
      header: 'Z-Score',
      cell: (info) => (
        <span className="font-mono tabular-nums text-ink-3">
          {formatNumber(info.getValue<number>(), 2)}σ
        </span>
      ),
    },
    {
      accessorKey: 'opportunities',
      header: 'Sample (n)',
      cell: (info) => (
        <span className="font-mono tabular-nums text-ink-3">
          {info.getValue()} opps
        </span>
      ),
    },
  ];

  // Key Players Columns
  const playerColumns: ColumnDef<TopPlayer, any>[] = [
    {
      accessorKey: 'player.name',
      header: t.scoutedPlayers,
      cell: (info) => (
        <span className="font-medium text-ink">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'position',
      header: t.role,
      cell: (info) => (
        <span className="font-mono text-2xs text-ink-3">{info.getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'rating',
      header: t.rating,
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 1)}</span>;
      },
    },
    {
      accessorKey: 'minutes',
      header: t.minutes,
      cell: (info) => (
        <span className="font-mono tabular-nums text-ink-2">{info.getValue<number>() ?? '—'}</span>
      ),
    },
  ];

  const toggleDisclosure = (id: string) => {
    setOpenDisclosure(openDisclosure === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-8 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* 04 / OPPONENT DOSSIER HEADER */}
      <header className="border-b border-rule pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-2xs font-mono font-bold uppercase tracking-widest text-ink-3">
            04 / SCOUTING DOSSIER & OPPONENT ARCHIVE
          </div>
          
          {/* Simple vs Advanced Toggle */}
          <div className="flex items-center gap-1.5 p-0.5 rounded border border-rule bg-bg-sunken text-2xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setIsAdvancedMode(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isAdvancedMode
                  ? 'bg-bg-raised text-accent font-bold shadow-2xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {t.simpleView}
            </button>
            <button
              onClick={() => setIsAdvancedMode(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                isAdvancedMode
                  ? 'bg-bg-raised text-accent font-bold shadow-2xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {t.advancedView}
            </button>
          </div>
        </div>

        {/* Serif Headline stating the primary takeaway */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ink tracking-tight font-normal leading-tight">
          {teamName}: {blueprint?.weaknesses?.[0]?.label ?? 'Vulnerable in Wide Build-Up Phase'}
        </h1>

        {/* Standfirst / Subtitle answering the single primary question */}
        <p className="text-base sm:text-lg text-ink-2 font-serif italic max-w-3xl leading-relaxed">
          How does {teamName} attack, and where are their defensive fault lines?
        </p>

        {/* Issue metadata row */}
        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs font-mono text-ink-3 border-t border-rule/60">
          <span>ARCHIVE ISSUE 2017/18</span>
          <span>•</span>
          <span>{blueprint?.matches ?? 38} FIXTURES ANALYSED</span>
          <span>•</span>
          <span>BAYESIAN RATING: <strong className="text-ink">{blueprint?.rating?.team?.toFixed(1) ?? '8.5'} / 10</strong></span>
          <span>•</span>
          <span>ARCHETYPE: <strong className="text-ink">{blueprint?.playstyle?.label || blueprint?.playstyle?.archetype || 'Fluid Possession'}</strong></span>
        </div>
      </header>

      {/* KEY TAKEAWAYS BLOCK (Coach Plain-English Brief) */}
      <section className="p-5 sm:p-6 rounded bg-bg-raised border border-rule space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-ink">
              {t.keyTakeaways}
            </h2>
          </div>
          <span className="text-3xs font-mono text-ink-3">30-Second Match Prep</span>
        </div>

        <ol className="space-y-3 font-serif text-sm sm:text-base text-ink leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="font-mono text-xs text-accent font-bold pt-0.5 shrink-0">01.</span>
            <span>
              <strong>Primary Danger Channel:</strong> {teamName} creates the bulk of their scoring threat through{' '}
              <span className="text-accent underline cursor-pointer" onClick={() => setActiveTab('attack')}>
                {blueprint?.strengths?.[0]?.label ?? 'Direct Transition Overloads'}
              </span>{' '}
              (ranking in the top {100 - (blueprint?.strengths?.[0]?.percentile ?? 92)}% of the league).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-mono text-xs text-accent font-bold pt-0.5 shrink-0">02.</span>
            <span>
              <strong>Defensive Fracture Zone:</strong> Concedes highest expected danger in wide areas;{' '}
              <span className="text-accent underline cursor-pointer" onClick={() => setActiveTab('defence')}>
                {blueprint?.weaknesses?.[0]?.label ?? 'Half-Space Entry Resistance'}
              </span>{' '}
              falls to the bottom {blueprint?.weaknesses?.[0]?.percentile ?? 18}% efficiency tier.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-mono text-xs text-accent font-bold pt-0.5 shrink-0">03.</span>
            <span>
              <strong>Press Trigger Recommendation:</strong> Apply compact double-teams on lateral back passes; their engagement lift increases significantly during sideline trap sequences.
            </span>
          </li>
        </ol>
      </section>

      {/* TACTICAL NAVIGATION TABS */}
      <div className="border-b border-rule flex items-center gap-1 sm:gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: '01 / Executive Overview' },
          { id: 'attack', label: '02 / Attacking Threat (Fig. 01)' },
          { id: 'defence', label: '03 / Pitch Zones (Plate 01)' },
          { id: 'press', label: '04 / Press & Distribution (Plate 02)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 01: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Numerals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded bg-bg-raised border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">{t.overallRating}</span>
              <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">
                {formatNumber(blueprint?.rating?.team, 1)}
              </div>
              <div className="text-2xs font-mono text-ink-3 mt-1">Scale 1.0 - 10.0 (Bayesian)</div>
            </div>

            <div className="p-5 rounded bg-bg-raised border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">{t.attackPower}</span>
              <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">
                {formatNumber(blueprint?.rating?.attack, 1)}
              </div>
              <div className="text-2xs font-mono text-accent mt-1">{t.dangerCreated}</div>
            </div>

            <div className="p-5 rounded bg-bg-raised border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">{t.defenceRating}</span>
              <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">
                {formatNumber(blueprint?.rating?.defence, 1)}
              </div>
              <div className="text-2xs font-mono text-positive mt-1">{t.zoneResistance}</div>
            </div>
          </div>

          {/* Tactical Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Strengths */}
            <div className="p-5 rounded bg-bg-raised border border-rule space-y-3">
              <div className="flex items-center gap-2 border-b border-rule pb-2">
                <CheckCircle2 className="w-4 h-4 text-positive shrink-0" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  {t.strengths}
                </h3>
              </div>
              <div className="space-y-2">
                {blueprint?.strengths?.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-bg-sunken/60">
                    <span className="font-medium text-ink">{s.label}</span>
                    <span className="font-mono text-positive font-bold">{formatPercentile(s.percentile)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Weaknesses */}
            <div className="p-5 rounded bg-bg-raised border border-rule space-y-3">
              <div className="flex items-center gap-2 border-b border-rule pb-2">
                <AlertTriangle className="w-4 h-4 text-negative shrink-0" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  {t.weaknesses}
                </h3>
              </div>
              <div className="space-y-2">
                {blueprint?.weaknesses?.map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-bg-sunken/60">
                    <span className="font-medium text-ink">{w.label}</span>
                    <span className="font-mono text-negative font-bold">{formatPercentile(w.percentile)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Scouted Players Table */}
          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                {t.keyPlayerThreats}
              </h3>
              <span className="text-3xs font-mono text-ink-3">Sorted by Contextual Rating</span>
            </div>

            <DataTable
              columns={playerColumns}
              data={blueprint?.top_players?.slice(0, 5) || []}
              pageSize={5}
            />
          </div>
        </div>
      )}

      {/* TAB 02: ATTACKING THREAT (FIG. 01 SHOT MAP) */}
      {activeTab === 'attack' && (
        <div className="space-y-6">
          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <span className="text-3xs font-mono uppercase text-ink-3 block">FIG. 01 / EXPECTED GOALS SHOT DISPERSION</span>
                <h3 className="text-lg font-serif font-bold text-ink">Shot Locations & Scoring Probability (xG)</h3>
              </div>
              <span className="text-2xs font-mono text-ink-3">{shotsData?.length ?? 0} shots recorded</span>
            </div>

            <div className="max-w-2xl mx-auto py-2">
              <ShotMap shots={shotsData || []} isLoading={shotsLoading} />
            </div>

            <div className="border-t border-rule pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs font-mono text-ink-3">
              <span>Fig. 01 — Individual shot outcomes on 105×68m FIFA pitch. Bubble area is proportional to √xG.</span>
              <button
                onClick={() => toggleDisclosure('shots')}
                className="text-accent hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{t.howToReadThis}</span>
                {openDisclosure === 'shots' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {openDisclosure === 'shots' && (
              <div className="p-3 rounded bg-bg-sunken border border-rule text-xs text-ink-2 leading-relaxed animate-in fade-in duration-100">
                <strong className="text-ink font-serif block mb-1">Interpretation Guide:</strong>
                xG (Expected Goals) represents the statistical probability (0.00 to 1.00) that a given shot results in a goal based on distance, angle, body part, and defensive pressure. Green dots denote goals scored; darker dots represent saved/off-target attempts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 03: PITCH ZONES (PLATE 01 ZONE MATRIX) */}
      {activeTab === 'defence' && (
        <div className="space-y-6">
          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <span className="text-3xs font-mono uppercase text-ink-3 block">PLATE 01 / 6×5 SPATIAL VULNERABILITY</span>
                <h3 className="text-lg font-serif font-bold text-ink">Defensive Sector Resistance & Conceded Chains</h3>
              </div>
              <span className="text-2xs font-mono text-ink-3">30 Tactical Sectors</span>
            </div>

            <div className="max-w-2xl mx-auto py-2">
              <ZoneGrid data={zonesData} isLoading={zonesLoading} />
            </div>

            <div className="border-t border-rule pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs font-mono text-ink-3">
              <span>Plate 01 — 6 Bands × 5 Channels. Darker red highlights sectors where the opponent concedes disproportionate chance chains.</span>
              <button
                onClick={() => toggleDisclosure('zones')}
                className="text-accent hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{t.howToReadThis}</span>
                {openDisclosure === 'zones' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {openDisclosure === 'zones' && (
              <div className="p-3 rounded bg-bg-sunken border border-rule text-xs text-ink-2 leading-relaxed animate-in fade-in duration-100">
                <strong className="text-ink font-serif block mb-1">Interpretation Guide:</strong>
                Vulnerability index reflects conceded danger normalized per 1,000 opponent touches. High vulnerability in wide channels suggests full-backs overcommit forward, creating exploit space on transition.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 04: PRESS & DISTRIBUTION (PLATE 02 PASS NETWORK) */}
      {activeTab === 'press' && (
        <div className="space-y-6">
          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <span className="text-3xs font-mono uppercase text-ink-3 block">PLATE 02 / PASSING NETWORK & CENTRALITY</span>
                <h3 className="text-lg font-serif font-bold text-ink">Passing Topology & Spatial Node Distribution</h3>
              </div>
              <span className="text-2xs font-mono text-ink-3">{passingData?.nodes?.length ?? 11} Starters</span>
            </div>

            <div className="max-w-2xl mx-auto py-2">
              <PassNetwork data={passingData} isLoading={passLoading} />
            </div>

            <div className="border-t border-rule pt-3 text-2xs font-mono text-ink-3">
              Plate 02 — Average player positions on the 105×68m pitch. Arrow thickness denotes passing volume between teammates.
            </div>
          </div>

          {/* Press Triggers Table */}
          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                {t.situationalPressTriggers}
              </h3>
              <span className="text-3xs font-mono text-ink-3">Statistically Significant Lift Factors</span>
            </div>

            <DataTable
              columns={pressColumns}
              data={blueprint?.press_triggers?.slice(0, 6) || []}
              pageSize={6}
            />
          </div>
        </div>
      )}
    </div>
  );
}
