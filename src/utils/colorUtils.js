/**
 * Utility functions for color conversions and theme-adaptive accent colors.
 */

// Curated high-contrast equivalents for predefined palettes in Dark Mode
const DARK_MODE_ACCENT_MAP = {
  '#1B6B3A': '#4ADE80', // Emerald Green -> Bright Mint / Emerald Green
  '#0F3A8C': '#60A5FA', // Navy Blue -> Bright Sky Blue
  '#800020': '#FB7185', // Deep Burgundy -> Bright Rose / Coral
  '#475569': '#94A3B8', // Slate Gray -> Light Slate Gray
  '#111827': '#E2E8F0', // Minimalist Charcoal -> Soft Off-White
  '#1E3A8A': '#60A5FA', // Dark Blue -> Bright Sky Blue
};

/**
 * Converts a hex color to HSL object { h, s, l }
 */
export function hexToHsl(hex) {
  if (!hex || typeof hex !== 'string') return { h: 0, s: 0, l: 0 };
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return { h: 0, s: 0, l: 0 };

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 0, s: 0, l: 0 };

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

/**
 * Converts HSL values to a hex color string #RRGGBB
 */
export function hslToHex(h, s, l) {
  h = (h % 360 + 360) % 360 / 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = x => Math.round(Math.max(0, Math.min(255, x * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts a hex color to RGB string "R, G, B"
 */
export function hexToRgbStr(hex) {
  if (!hex || typeof hex !== 'string') return '27, 107, 58';
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return '27, 107, 58';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return isNaN(r) || isNaN(g) || isNaN(b) ? '27, 107, 58' : `${r}, ${g}, ${b}`;
}

/**
 * Returns ideal text contrast color (#FFFFFF or #0F0F0E) for a given hex background/accent color
 */
export function getContrastTextColor(hex) {
  try {
    const { l } = hexToHsl(hex);
    return l > 0.58 ? '#0F0F0E' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

/**
 * Returns an accent color adapted for the current theme (light or dark).
 * - Light mode: returns the base accent color (e.g. dark rich tone).
 * - Dark mode: returns a bright, high-contrast variant of the accent color.
 */
export function getAdaptiveAccentColor(baseColor, theme) {
  const isDark = theme === 'dark';
  if (!baseColor) return isDark ? '#4ADE80' : '#1B6B3A';
  if (!isDark) return baseColor;

  const upperHex = baseColor.toUpperCase().trim();
  if (DARK_MODE_ACCENT_MAP[upperHex]) {
    return DARK_MODE_ACCENT_MAP[upperHex];
  }

  const lowerHex = baseColor.toLowerCase().trim();
  for (const [k, v] of Object.entries(DARK_MODE_ACCENT_MAP)) {
    if (k.toLowerCase() === lowerHex) return v;
  }

  // Custom hex color adaptation for dark mode
  try {
    const { h, s, l } = hexToHsl(baseColor);
    // If lightness is too dark (< 0.58), scale it up for high contrast on dark backgrounds
    if (l < 0.58) {
      const targetL = Math.max(0.68, l * 2.2);
      const targetS = Math.min(1, Math.max(0.60, s * 1.15));
      return hslToHex(h, targetS, Math.min(0.88, targetL));
    }
  } catch {
    // fallback
  }

  return baseColor;
}
