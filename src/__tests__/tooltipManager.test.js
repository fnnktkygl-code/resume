// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../test/setup';
import { globalTooltipManager } from '../utils/tooltipManager';

describe('Global Floating Tooltip Manager', () => {
  let triggerBtn;

  beforeEach(() => {
    vi.useFakeTimers();
    globalTooltipManager.init();

    triggerBtn = document.createElement('button');
    triggerBtn.setAttribute('data-tooltip', 'Basculer en Mode Sombre');
    triggerBtn.setAttribute('data-tooltip-pos', 'top');
    triggerBtn.getBoundingClientRect = () => ({
      top: 10,
      left: 100,
      right: 140,
      bottom: 40,
      width: 40,
      height: 30,
      x: 100,
      y: 10
    });
    document.body.appendChild(triggerBtn);
  });

  afterEach(() => {
    globalTooltipManager.destroy();
    if (triggerBtn && triggerBtn.parentNode) {
      triggerBtn.parentNode.removeChild(triggerBtn);
    }
    vi.useRealTimers();
  });

  it('initializes single portal container on document.body', () => {
    const portal = document.getElementById('global-portal-tooltip');
    expect(portal).toBeInTheDocument();
    expect(portal.getAttribute('role')).toBe('tooltip');
  });

  it('shows tooltip content on mouseover and hides on mouseout', () => {
    const portal = document.getElementById('global-portal-tooltip');
    const content = portal.querySelector('.global-tooltip-content');

    // Trigger mouseover
    triggerBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(100);

    expect(content.textContent).toBe('Basculer en Mode Sombre');
    expect(portal.style.display).toBe('block');

    // Trigger mouseout
    triggerBtn.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    vi.advanceTimersByTime(200);

    expect(portal.getAttribute('aria-hidden')).toBe('true');
  });

  it('auto-flips to bottom when element is at the very top of viewport', () => {
    const portal = document.getElementById('global-portal-tooltip');

    triggerBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(100);

    // Because trigger top is 10px, it should auto-flip from 'top' to 'bottom'
    // and top coordinate should be placed below trigger (40 + ARROW_GAP)
    const currentTop = parseInt(portal.style.top, 10);
    expect(currentTop).toBeGreaterThanOrEqual(40);
  });

  it('hides immediately when Escape key is pressed', () => {
    const portal = document.getElementById('global-portal-tooltip');

    triggerBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(100);
    expect(portal.style.display).toBe('block');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(portal.getAttribute('aria-hidden')).toBe('true');
  });
});
