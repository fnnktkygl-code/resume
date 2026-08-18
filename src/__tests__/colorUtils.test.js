import { describe, it, expect } from 'vitest';
import {
  hexToHsl,
  hslToHex,
  hexToRgbStr,
  getContrastTextColor,
  getAdaptiveAccentColor,
} from '../utils/colorUtils';

describe('colorUtils', () => {
  describe('hexToHsl and hslToHex', () => {
    it('converts 6-char and 3-char hex to HSL correctly', () => {
      const red = hexToHsl('#ff0000');
      expect(red.h).toBeCloseTo(0);
      expect(red.s).toBeCloseTo(1);
      expect(red.l).toBeCloseTo(0.5);

      const shortHex = hexToHsl('#f00');
      expect(shortHex.h).toBeCloseTo(0);
      expect(shortHex.s).toBeCloseTo(1);
      expect(shortHex.l).toBeCloseTo(0.5);
    });

    it('handles invalid hex gracefully', () => {
      expect(hexToHsl('')).toEqual({ h: 0, s: 0, l: 0 });
      expect(hexToHsl(null)).toEqual({ h: 0, s: 0, l: 0 });
      expect(hexToHsl('not-a-color')).toEqual({ h: 0, s: 0, l: 0 });
    });

    it('round-trips standard colors accurately', () => {
      const pureBlue = '#0000ff';
      const hsl = hexToHsl(pureBlue);
      const backToHex = hslToHex(hsl.h, hsl.s, hsl.l);
      expect(backToHex.toLowerCase()).toBe(pureBlue);
    });
  });

  describe('hexToRgbStr', () => {
    it('converts hex to comma-separated RGB string', () => {
      expect(hexToRgbStr('#ffffff')).toBe('255, 255, 255');
      expect(hexToRgbStr('#000000')).toBe('0, 0, 0');
      expect(hexToRgbStr('#1B6B3A')).toBe('27, 107, 58');
      expect(hexToRgbStr('#fff')).toBe('255, 255, 255');
    });

    it('falls back to default RGB string on invalid inputs', () => {
      expect(hexToRgbStr('')).toBe('27, 107, 58');
      expect(hexToRgbStr(null)).toBe('27, 107, 58');
      expect(hexToRgbStr('xyz')).toBe('27, 107, 58');
    });
  });

  describe('getContrastTextColor', () => {
    it('returns white text for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('#FFFFFF');
      expect(getContrastTextColor('#0F3A8C')).toBe('#FFFFFF');
      expect(getContrastTextColor('#111827')).toBe('#FFFFFF');
    });

    it('returns dark text for light backgrounds', () => {
      expect(getContrastTextColor('#ffffff')).toBe('#0F0F0E');
      expect(getContrastTextColor('#fef08a')).toBe('#0F0F0E');
      expect(getContrastTextColor('#e2e8f0')).toBe('#0F0F0E');
    });

    it('safely handles invalid inputs', () => {
      expect(getContrastTextColor('')).toBe('#FFFFFF');
      expect(getContrastTextColor(null)).toBe('#FFFFFF');
    });
  });

  describe('getAdaptiveAccentColor', () => {
    it('returns mapped bright color in dark mode for standard dark presets', () => {
      expect(getAdaptiveAccentColor('#1B6B3A', 'dark')).toBe('#4ADE80');
      expect(getAdaptiveAccentColor('#0F3A8C', 'dark')).toBe('#60A5FA');
      expect(getAdaptiveAccentColor('#800020', 'dark')).toBe('#FB7185');
    });

    it('returns original color in light mode', () => {
      expect(getAdaptiveAccentColor('#1B6B3A', 'light')).toBe('#1B6B3A');
      expect(getAdaptiveAccentColor('#0F3A8C', 'light')).toBe('#0F3A8C');
    });

    it('boosts luminance in dark mode for custom very dark colors', () => {
      const darkPurple = '#200530';
      const adapted = getAdaptiveAccentColor(darkPurple, 'dark');
      const hsl = hexToHsl(adapted);
      expect(hsl.l).toBeGreaterThanOrEqual(0.55);
    });
  });
});
