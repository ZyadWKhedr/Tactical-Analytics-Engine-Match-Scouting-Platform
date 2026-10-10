/**
 * Perceptually uniform color interpolators for football tactical visualizations (Viridis / Magma / Sequential Danger).
 * Adheres to strict analytical standards (no rainbow palettes).
 */

// Calibrated sequential color stops for pitch vulnerability and spatial density
export function getViridisColor(t: number): string {
  // Clamp t to [0, 1]
  const clamped = Math.max(0, Math.min(1, t));
  
  // Interpolated RGB values approximating viridis
  const c0 = [68, 1, 84];     // Dark purple
  const c1 = [59, 82, 139];   // Blue
  const c2 = [33, 145, 140];  // Teal
  const c3 = [94, 201, 98];   // Green
  const c4 = [253, 231, 37];  // Yellow

  let r, g, b;
  if (clamped < 0.25) {
    const f = clamped / 0.25;
    r = c0[0] + (c1[0] - c0[0]) * f;
    g = c0[1] + (c1[1] - c0[1]) * f;
    b = c0[2] + (c1[2] - c0[2]) * f;
  } else if (clamped < 0.5) {
    const f = (clamped - 0.25) / 0.25;
    r = c1[0] + (c2[0] - c1[0]) * f;
    g = c1[1] + (c2[1] - c1[1]) * f;
    b = c1[2] + (c2[2] - c1[2]) * f;
  } else if (clamped < 0.75) {
    const f = (clamped - 0.5) / 0.25;
    r = c2[0] + (c3[0] - c2[0]) * f;
    g = c2[1] + (c3[1] - c2[1]) * f;
    b = c2[2] + (c3[2] - c2[2]) * f;
  } else {
    const f = (clamped - 0.75) / 0.25;
    r = c3[0] + (c4[0] - c3[0]) * f;
    g = c3[1] + (c4[1] - c3[1]) * f;
    b = c3[2] + (c4[2] - c3[2]) * f;
  }

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Magma / Tactical Vulnerability sequential colormap (dark slate -> amber -> intense crimson)
export function getVulnerabilityColor(vulnIndex: number, maxExpected = 1.0): { bg: string; text: string; fillOpacity: number } {
  const norm = Math.max(0, Math.min(1, vulnIndex / maxExpected));
  
  if (norm < 0.25) {
    // Low vulnerability - solid defensive sector
    return {
      bg: 'rgba(51, 65, 85, 0.4)', // slate-700
      text: '#94a3b8',
      fillOpacity: 0.35,
    };
  } else if (norm < 0.5) {
    // Moderate / average exposure
    return {
      bg: 'rgba(71, 85, 105, 0.65)',
      text: '#cbd5e1',
      fillOpacity: 0.55,
    };
  } else if (norm < 0.75) {
    // High vulnerability - key opponent exploitation target
    return {
      bg: 'rgba(217, 119, 6, 0.75)', // amber-600
      text: '#fef3c7',
      fillOpacity: 0.75,
    };
  } else {
    // Severe vulnerability / blind spot
    return {
      bg: 'rgba(225, 29, 72, 0.85)', // rose-600
      text: '#ffe4e6',
      fillOpacity: 0.88,
    };
  }
}
