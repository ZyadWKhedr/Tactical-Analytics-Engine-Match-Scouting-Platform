import React, { useState } from 'react';
import { PitchCanvas } from '../../shared/components/PitchCanvas';
import { useTheme } from '../../shared/lib/useTheme';
import { useI18n } from '../../shared/i18n';
import { ArrowRight, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';

export function StyleGuidePage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);

  const colors = [
    { name: '--bg', token: 'bg-bg', desc: 'Canvas background' },
    { name: '--bg-raised', token: 'bg-bg-raised', desc: 'Cards, drawers, panels' },
    { name: '--bg-sunken', token: 'bg-bg-sunken', desc: 'Inputs, table stripes' },
    { name: '--ink', token: 'bg-ink', textToken: 'text-bg', desc: 'Primary typography' },
    { name: '--ink-2', token: 'bg-ink-2', textToken: 'text-bg', desc: 'Secondary body text' },
    { name: '--ink-3', token: 'bg-ink-3', textToken: 'text-bg', desc: 'Captions, disabled text' },
    { name: '--rule', token: 'bg-rule', desc: '1px hairlines' },
    { name: '--rule-strong', token: 'bg-rule-strong', textToken: 'text-bg', desc: '2px section title rules' },
    { name: '--accent', token: 'bg-accent', textToken: 'text-accent-ink', desc: 'Vermilion red focus accent' },
    { name: '--positive', token: 'bg-positive', textToken: 'text-white', desc: 'Favorable delta' },
    { name: '--negative', token: 'bg-negative', textToken: 'text-white', desc: 'Adverse delta' },
    { name: '--warning', token: 'bg-warning', textToken: 'text-white', desc: 'Alert / cautionary state' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header className="border-b border-rule pb-6">
        <div className="text-2xs uppercase tracking-widest font-mono text-ink-3 mb-1">
          DESIGN TOKENS & ARTIFACT SPECIFICATION
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-ink tracking-tight font-normal">
          Editorial Football Archive Style Guide
        </h1>
        <p className="text-sm md:text-base text-ink-2 mt-2 max-w-2xl leading-relaxed">
          Inspired by printed football archives and architectural monographs. High-contrast serif headlines, monospace tabular data, hairline dividers, and a single vermilion accent.
        </p>
      </header>

      {/* 01 / TYPOGRAPHY SCALE */}
      <section className="space-y-6">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            01 / Typographic Scale & Hierarchy
          </span>
        </div>

        <div className="p-6 rounded bg-bg-raised border border-rule space-y-6">
          <div className="border-b border-rule pb-4">
            <span className="text-3xs font-mono text-ink-3 block uppercase">Display Hero (56px / Fraunces Serif)</span>
            <div className="text-4xl sm:text-5xl md:text-6xl font-serif text-ink tracking-tight leading-none mt-1">
              Tactical Fault Lines in Deep Build-Up
            </div>
          </div>

          <div className="border-b border-rule pb-4">
            <span className="text-3xs font-mono text-ink-3 block uppercase">Section Title (32px / Fraunces Serif)</span>
            <div className="text-2xl sm:text-3xl font-serif text-ink mt-1">
              Phase 02: Spatial Resistance & Press Triggers
            </div>
          </div>

          <div className="border-b border-rule pb-4">
            <span className="text-3xs font-mono text-ink-3 block uppercase">Body Copy (15-16px / Inter Grotesk)</span>
            <p className="text-sm sm:text-base text-ink leading-relaxed mt-1 max-w-prose">
              The defensive block concedes high danger when forced to transition laterally. Full-backs tuck inwards, exposing the wide channels (Zones 21 & 25) to rapid overlaps.
            </p>
          </div>

          <div>
            <span className="text-3xs font-mono text-ink-3 block uppercase">Captions & Figures (11-12px / JetBrains Mono)</span>
            <div className="text-xs font-mono text-ink-3 uppercase tracking-wider mt-1">
              FIG. 04 — PASSING NETWORK CENTRALITY & EXPECTED THREAT (n = 38 FIXTURES)
            </div>
          </div>
        </div>
      </section>

      {/* 02 / COLOR TOKENS */}
      <section className="space-y-6">
        <div className="border-t-2 border-rule-strong pt-3 flex items-center justify-between">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            02 / Color Tokens & Palette
          </span>
          <button
            onClick={toggleTheme}
            className="text-2xs font-mono text-accent hover:underline"
          >
            Toggle Theme ({theme})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {colors.map((c) => (
            <div key={c.name} className="p-3 rounded border border-rule bg-bg-raised space-y-2">
              <div className={`h-12 w-full rounded border border-rule ${c.token} flex items-center justify-center`}>
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

      {/* 03 / STAT NUMERALS & EVIDENCE CARDS */}
      <section className="space-y-6">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            03 / Editorial Stat Numerals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded bg-bg-raised border border-rule">
            <span className="text-3xs font-mono uppercase text-ink-3 block">OVERALL SQUAD RATING</span>
            <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">9.2</div>
            <div className="text-2xs font-mono text-positive mt-1">+0.4 vs league mean</div>
          </div>

          <div className="p-5 rounded bg-bg-raised border border-rule">
            <span className="text-3xs font-mono uppercase text-ink-3 block">DANGER CREATED (XT / 90)</span>
            <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">1.84</div>
            <div className="text-2xs font-mono text-accent mt-1">98th percentile in Europe</div>
          </div>

          <div className="p-5 rounded bg-bg-raised border border-rule">
            <span className="text-3xs font-mono uppercase text-ink-3 block">VULNERABILITY INDEX</span>
            <div className="text-4xl font-serif font-bold text-ink mt-1 tabular-nums">0.28</div>
            <div className="text-2xs font-mono text-negative mt-1">Zone 14 central leak</div>
          </div>
        </div>
      </section>

      {/* 04 / FIGURES & DISCLOSURES */}
      <section className="space-y-6">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            04 / Figures, Plates & Progressive Disclosure
          </span>
        </div>

        <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <span className="text-3xs font-mono uppercase text-ink-3 block">PLATE 01 / TACTICAL PITCH</span>
              <h3 className="text-lg font-serif font-bold text-ink">Spatial Density on 105×68m Canvas</h3>
            </div>
            <span className="text-2xs font-mono text-ink-3">FIFA Standard Coordinates</span>
          </div>

          <div className="max-w-xl mx-auto py-2">
            <PitchCanvas className="border border-rule">
              {/* Sample shot dots sized by xG */}
              <circle cx="92" cy="34" r="3.2" fill="var(--accent)" fillOpacity="0.8" stroke="var(--ink)" strokeWidth="0.4" />
              <circle cx="88" cy="28" r="2.0" fill="var(--positive)" fillOpacity="0.8" stroke="var(--ink)" strokeWidth="0.4" />
              <circle cx="84" cy="42" r="1.5" fill="var(--ink-2)" fillOpacity="0.6" stroke="var(--ink)" strokeWidth="0.4" />
            </PitchCanvas>
          </div>

          <div className="border-t border-rule pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs font-mono text-ink-3">
            <span>Fig. 01 — Shot locations & scoring probability (xG). Dot area is proportional to √xG.</span>
            <button
              onClick={() => setIsDisclosureOpen(!isDisclosureOpen)}
              className="text-accent hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{t.howToReadThis}</span>
              {isDisclosureOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {isDisclosureOpen && (
            <div className="p-3 rounded bg-bg-sunken border border-rule text-xs text-ink-2 leading-relaxed animate-in fade-in duration-100">
              <strong className="text-ink font-serif block mb-1">Interpretation Guide:</strong>
              Each bubble indicates an unassisted or assisted shot on goal. Vermilion markers indicate successful goals scored; green circles designate high-probability chances denied by goalkeeper intervention.
            </div>
          )}
        </div>
      </section>

      {/* 05 / BUTTONS & CONTROLS */}
      <section className="space-y-6">
        <div className="border-t-2 border-rule-strong pt-3">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            05 / Controls, Badges & Interactive States
          </span>
        </div>

        <div className="p-5 rounded bg-bg-raised border border-rule flex flex-wrap items-center gap-4">
          <button className="px-4 py-2 rounded text-xs font-mono font-bold bg-accent text-accent-ink hover:opacity-90 transition-opacity">
            Primary Action (Solid Accent)
          </button>

          <button className="px-4 py-2 rounded text-xs font-mono font-medium border border-rule bg-bg-sunken text-ink hover:bg-bg transition-colors">
            Secondary Button
          </button>

          <button className="text-xs font-mono text-accent hover:underline inline-flex items-center gap-1">
            <span>Text Underline Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-0.5 rounded text-3xs font-mono uppercase tracking-wider text-ink border border-rule bg-bg-sunken">
            TAG / 1PX OUTLINE
          </span>
        </div>
      </section>
    </div>
  );
}
