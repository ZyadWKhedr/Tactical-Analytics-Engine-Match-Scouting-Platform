import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatInt,
  formatPercent,
  formatPercentile,
  formatRating,
  getRatingColor,
  getDeltaColor,
} from './utils';
import { getVulnerabilityColor, getViridisColor } from './colors';

describe('Formatting Utilities', () => {
  it('formats numbers with standard decimal places', () => {
    expect(formatNumber(1.2345, 2)).toBe('1.23');
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('formats integers with thousands separators', () => {
    expect(formatInt(1941)).toBe('1,941');
    expect(formatInt(2460000)).toBe('2,460,000');
    expect(formatInt(null)).toBe('—');
  });

  it('formats percentages correctly', () => {
    expect(formatPercent(0.456, 1)).toBe('45.6%');
    expect(formatPercent(1.0, 0)).toBe('100%');
    expect(formatPercent(null)).toBe('—');
  });

  it('formats percentiles with proper ordinal suffixes', () => {
    expect(formatPercentile(91)).toBe('91st');
    expect(formatPercentile(82)).toBe('82nd');
    expect(formatPercentile(73)).toBe('73rd');
    expect(formatPercentile(64)).toBe('64th');
    expect(formatPercentile(11)).toBe('11th');
    expect(formatPercentile(12)).toBe('12th');
    expect(formatPercentile(13)).toBe('13th');
    expect(formatPercentile(null)).toBe('—');
  });

  it('formats ratings and assigns correct semantic classes', () => {
    expect(formatRating(7.45)).toBe('7.5');
    expect(getRatingColor(8.2)).toContain('emerald');
    expect(getRatingColor(3.8)).toContain('rose');
    expect(getDeltaColor(0.5)).toContain('emerald');
    expect(getDeltaColor(-0.5)).toContain('rose');
  });
});

describe('Color Interpolators', () => {
  it('returns valid viridis RGB string', () => {
    const col = getViridisColor(0.5);
    expect(col).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
  });

  it('returns tactical vulnerability classification', () => {
    const lowVuln = getVulnerabilityColor(0.1, 1.0);
    expect(lowVuln.fillOpacity).toBeLessThan(0.5);

    const highVuln = getVulnerabilityColor(0.9, 1.0);
    expect(highVuln.fillOpacity).toBeGreaterThan(0.8);
  });
});
