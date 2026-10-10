import React, { useState } from 'react';
import { Pitch } from '../../shared/components/PitchCanvas';
import { PitchHeatmap } from '../../shared/components/PitchHeatmap';
import { ShotMap } from '../../shared/components/ShotMap';
import { ZoneGrid } from '../../shared/components/ZoneGrid';
import { PassNetwork } from '../../shared/components/PassNetwork';
import { ChannelDangerBar } from '../../shared/components/ChannelDangerBar';
import { FormTimeline } from '../../shared/components/FormTimeline';
import { PercentileBars } from '../../shared/components/PercentileBars';
import { useTheme } from '../../shared/lib/useTheme';
import { useI18n } from '../../shared/i18n';
import { Sun, Moon, HelpCircle } from 'lucide-react';
import type { ShotOut, ZonesOut, PassingNetworkOut, HeatmapOut } from '../../api/types';

export function StyleGuidePage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  // Color tokens catalog
  const colors = [
    { name: '--bg', token: 'bg-bg', desc: 'Canvas background' },
    { name: '--bg-raised', token: 'bg-bg-raised', desc: 'Cards, drawers, panels' },
    { name: '--bg-sunken', token: 'bg-bg-sunken', desc: 'Inputs, table stripes' },
    { name: '--ink', token: 'bg-ink', textToken: 'text-bg', desc: 'Primary typography' },
    { name: '--ink-2', token: 'bg-ink-2', textToken: 'text-bg', desc: 'Secondary body text' },
    { name: '--ink-3', token: 'bg-ink-3', textToken: 'text-bg', desc: 'Captions, disabled text' },
    { name: '--rule', token: 'bg-rule', desc: '1px hairlines' },
    { name: '--rule-strong', token: 'bg-rule-strong', textToken: 'text-bg', desc: '2px section rules' },
    { name: '--accent', token: 'bg-accent', textToken: 'text-accent-ink', desc: 'Vermilion focus accent' },
    { name: '--positive', token: 'bg-positive', textToken: 'text-white', desc: 'Favorable delta' },
    { name: '--negative', token: 'bg-negative', textToken: 'text-white', desc: 'Adverse delta' },
    { name: '--warning', token: 'bg-warning', textToken: 'text-white', desc: 'Alert / caution state' },
    { name: '--pitch', token: 'bg-pitch', desc: 'Pitch SVG surface' },
    { name: '--pitch-line', token: 'bg-pitch-line', desc: '1px pitch markings' },
  ];

  // Sample data for visualizations in Style Guide
  const sampleShots: ShotOut[] = [
    { action_id: 1, minute: 14, period_id: 1, player: { player_id: 101, name: 'M. Depay' }, team_id: 675, x: 92.4, y: 36.2, xg: 0.42, is_goal: true, bodypart: 'Right Foot', shot_type: 'open_play' },
    { action_id: 2, minute: 28, period_id: 1, player: { player_id: 102, name: 'N. Fekir' }, team_id: 675, x: 86.1, y: 44.5, xg: 0.12, is_goal: false, bodypart: 'Left Foot', shot_type: 'open_play' },
    { action_id: 3, minute: 55, period_id: 2, player: { player_id: 103, name: 'B. Traoré' }, team_id: 675, x: 96.2, y: 28.0, xg: 0.28, is_goal: true, bodypart: 'Head', shot_type: 'set_piece' },
    { action_id: 4, minute: 68, period_id: 2, player: { player_id: 104, name: 'M. Dembélé' }, team_id: 675, x: 94.0, y: 33.5, xg: 0.35, is_goal: false, bodypart: 'Right Foot', shot_type: 'open_play' },
    { action_id: 5, minute: 82, period_id: 2, player: { player_id: 102, name: 'N. Fekir' }, team_id: 675, x: 79.5, y: 31.0, xg: 0.06, is_goal: false, bodypart: 'Left Foot', shot_type: 'open_play' },
  ];

  const sampleZones: ZonesOut = {
    team: { team_id: 675, name: 'Olympique Lyonnais' },
    corridors: [
      { corridor: 'flank', mean_vulnerability: 0.32, conceded_shot_chains: 18, conceded_goals: 4 },
      { corridor: 'half_space', mean_vulnerability: 0.28, conceded_shot_chains: 12, conceded_goals: 2 },
      { corridor: 'central', mean_vulnerability: 0.18, conceded_shot_chains: 8, conceded_goals: 1 },
    ],
    entry_routes: { flank_right: 0.44, central: 0.24, flank_left: 0.32 },
    grid: Array.from({ length: 30 }).map((_, i) => {
      const band = i % 6;
      const channel = Math.floor(i / 6);
      const isWorst = (band === 4 && channel === 3) || (band === 5 && channel === 4);
      const corridorType: 'flank' | 'half_space' | 'central' =
        channel === 0 || channel === 4 ? 'flank' : channel === 2 ? 'central' : 'half_space';
      return {
        zone_id: i,
        zone_name: `Zone ${i + 1}`,
        band,
        channel,
        band_name: `Band ${band + 1}`,
        channel_name: `Channel ${channel + 1}`,
        corridor: corridorType,
        vulnerability_index: isWorst ? 0.38 : Number((0.04 + Math.sin(i) * 0.12).toFixed(2)),
        conceded_entries_p90: isWorst ? 14.2 : 5.8,
        conceded_xt_per_entry: 0.04,
        conceded_shot_chains: isWorst ? 18 : 6,
        conceded_goals: isWorst ? 2 : 0,
        clean_recovery_rate: 0.54,
        exposure_rank_in_team: i + 1,
      };
    }),
  };

  const samplePassNetwork: PassingNetworkOut = {
    match_id: 101,
    team: { team_id: 675, name: 'Olympique Lyonnais' },
    min_passes: 3,
    total_passes: 480,
    nodes: [
      { player: { player_id: 1, name: 'Anthony Lopes' }, x: 12, y: 34, passes_completed: 28, passes_received: 14, degree_centrality: 0.35, betweenness: 0.1 },
      { player: { player_id: 2, name: 'Marcelo' }, x: 32, y: 22, passes_completed: 48, passes_received: 38, degree_centrality: 0.62, betweenness: 0.3 },
      { player: { player_id: 3, name: 'Jason Denayer' }, x: 34, y: 46, passes_completed: 52, passes_received: 42, degree_centrality: 0.68, betweenness: 0.4 },
      { player: { player_id: 4, name: 'Tanguy Ndombélé' }, x: 54, y: 36, passes_completed: 68, passes_received: 64, degree_centrality: 0.88, betweenness: 0.7 },
      { player: { player_id: 5, name: 'Houssem Aouar' }, x: 62, y: 24, passes_completed: 58, passes_received: 52, degree_centrality: 0.82, betweenness: 0.5 },
      { player: { player_id: 6, name: 'Nabil Fekir' }, x: 74, y: 38, passes_completed: 44, passes_received: 48, degree_centrality: 0.76, betweenness: 0.4 },
      { player: { player_id: 7, name: 'Memphis Depay' }, x: 86, y: 28, passes_completed: 32, passes_received: 42, degree_centrality: 0.71, betweenness: 0.3 },
    ],
    edges: [
      { source: 2, target: 3, count: 18 },
      { source: 2, target: 4, count: 24 },
      { source: 3, target: 4, count: 28 },
      { source: 4, target: 5, count: 32 },
      { source: 4, target: 6, count: 22 },
      { source: 5, target: 7, count: 19 },
    ],
  };

  const sampleHeatmap: HeatmapOut = {
    nx: 32,
    ny: 24,
    pitch_length: 105.0,
    pitch_width: 68.0,
    counts: [],
    max_count: 35,
    n_actions: 1420,
    filter: {},
    sigma: 1.0,
    p98_count: 32,
    density: Array.from({ length: 24 }).map((_, y) =>
      Array.from({ length: 32 }).map((_, x) => {
        // High density in attacking right wing (x > 20, y > 14)
        const d1 = Math.exp(-(((x - 24) ** 2) / 28 + ((y - 17) ** 2) / 16));
        const d2 = Math.exp(-(((x - 18) ** 2) / 36 + ((y - 12) ** 2) / 24));
        return Math.min(Math.max(d1 * 0.9 + d2 * 0.45, 0), 1);
      })
    ),
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header className="border-b border-rule pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs uppercase tracking-widest font-mono text-ink-3 mb-1">
            DESIGN SYSTEM & COMPONENT SPECIFICATION
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-ink tracking-tight font-normal">
            Tactical OS Style Guide & Visual Gallery
          </h1>
          <p className="text-sm md:text-base text-ink-2 mt-1 max-w-2xl leading-relaxed font-sans">
            Complete gallery of reusable SVG pitch primitives and editorial chart components in both Light and Dark themes.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-rule bg-bg-raised text-xs font-mono text-ink hover:bg-bg-sunken transition-colors self-start sm:self-auto shrink-0"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-ink-2" />}
          <span>Toggle Theme ({theme})</span>
        </button>
      </header>

      {/* 01 / TYPOGRAPHY & NUMERALS */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            01 / Typography Rules & Number Hierarchy
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule space-y-6">
          <div className="border-b border-rule pb-4">
            <span className="text-3xs font-mono text-ink-3 block uppercase">Serif Headline (Max 2 lines)</span>
            <div className="text-2xl sm:text-3xl font-serif text-ink tracking-tight mt-1">
              Lyon create most danger down the right wing and are vulnerable on set pieces.
            </div>
          </div>

          <div className="border-b border-rule pb-4">
            <span className="text-3xs font-mono text-ink-3 block uppercase">48px Tabular Numeral Rating Row (No Boxes, Hairline Dividers)</span>
            <div className="grid grid-cols-3 divide-x divide-rule border-y border-rule py-4 mt-2">
              <div className="px-4 text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">Overall Rating</span>
                <span className="text-4xl sm:text-5xl font-serif font-bold text-ink tabular-nums">7.8</span>
                <span className="text-3xs text-ink-2 block pt-1">Top 18% in Europe</span>
              </div>
              <div className="px-4 text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">Attack</span>
                <span className="text-4xl sm:text-5xl font-serif font-bold text-accent tabular-nums">8.4</span>
                <span className="text-3xs text-ink-2 block pt-1">1.84 xG / 90</span>
              </div>
              <div className="px-4 text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">Defence</span>
                <span className="text-4xl sm:text-5xl font-serif font-bold text-ink tabular-nums">6.2</span>
                <span className="text-3xs text-ink-2 block pt-1">1.32 xG conceded</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-3xs font-mono text-ink-3 block uppercase">UI Text & Captions</span>
            <p className="text-xs text-ink font-sans leading-relaxed mt-1">
              Sidebar and UI text use Inter regular 14px. Monospace is strictly reserved for kickers, captions, and table numbers.
            </p>
          </div>
        </div>
      </section>

      {/* 02 / COLOR TOKENS */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            02 / Editorial Color Tokens
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {colors.map((c) => (
            <div key={c.name} className="p-3 rounded border border-rule bg-bg-raised space-y-2">
              <div className={`h-10 w-full rounded border border-rule ${c.token} flex items-center justify-center`}>
                <span className={`text-2xs font-mono font-bold ${c.textToken || 'text-ink'}`}>{c.name}</span>
              </div>
              <div>
                <div className="text-2xs font-mono font-bold text-ink">{c.name}</div>
                <div className="text-3xs font-sans text-ink-3">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 / HERO VISUAL: PITCH HEATMAP */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            03 / Visualization Component: &lt;PitchHeatmap /&gt;
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule">
          <PitchHeatmap
            data={sampleHeatmap}
            title="Smoothed Danger Density Map"
            subtitle="Sequential colormap from transparent to accent with direct pitch callout"
            sampleSize="n = 38 matches"
            annotationText="Primary danger: right wing overloads"
            annotationX={78}
            annotationY={48}
          />
        </div>
      </section>

      {/* 04 / SHOT MAP */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            04 / Visualization Component: &lt;ShotMap /&gt;
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule space-y-3">
          <div className="border-b border-rule pb-2">
            <h3 className="text-sm font-serif font-bold text-ink">Shot Locations & Expected Goals (xG)</h3>
            <p className="text-2xs text-ink-3 font-sans">Glyphs sized by √xG; goals outlined in accent with pulse ring</p>
          </div>
          <ShotMap shots={sampleShots} showSummaryBar />
        </div>
      </section>

      {/* 05 / ZONE VULNERABILITY MAP */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            05 / Visualization Component: &lt;ZoneGrid /&gt; (Vulnerability Map)
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule space-y-3">
          <div className="border-b border-rule pb-2">
            <h3 className="text-sm font-serif font-bold text-ink">Zone Conceded Danger Index</h3>
            <p className="text-2xs text-ink-3 font-sans">Pitch split into 30 zones with 2 highest vulnerability sectors highlighted</p>
          </div>
          <ZoneGrid data={sampleZones} />
        </div>
      </section>

      {/* 06 / PASSING NETWORK */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            06 / Visualization Component: &lt;PassNetwork /&gt;
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule space-y-3">
          <div className="border-b border-rule pb-2">
            <h3 className="text-sm font-serif font-bold text-ink">Average Player Position & Pass Centrality</h3>
            <p className="text-2xs text-ink-3 font-sans">Node sizes reflect touch involvement; edge thickness shows passing volume</p>
          </div>
          <PassNetwork data={samplePassNetwork} />
        </div>
      </section>

      {/* 07 / SUPPORTING VISUALS: CHANNEL DANGER, FORM TIMELINE, PERCENTILE BARS */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            07 / Supporting Visuals: Channel Bars, Timeline & Percentiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChannelDangerBar
            channels={{ left: 32, centre: 24, right: 44 }}
            title="Channel Attack Share"
          />

          <FormTimeline
            title="Form Timeline"
            subtitle="Last 5 matches with paired xG bars"
          />

          <PercentileBars
            title="Percentile Profile"
            subtitle="Benchmarked vs European league mean"
          />
        </div>
      </section>
    </div>
  );
}
