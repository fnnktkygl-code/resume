/**
 * Industry-Standard Global Collision-Aware Floating Tooltip Manager
 * Automatically positions tooltips in a top-level portal on document.body,
 * detecting viewport edges, auto-flipping, and clamping positions so tooltips
 * are NEVER clipped or cut off by container bounds or screen edges.
 */

const VIEWPORT_PADDING = 10;
const ARROW_GAP = 8;

class TooltipManager {
  constructor() {
    this.container = null;
    this.contentEl = null;
    this.arrowEl = null;
    this.activeTrigger = null;
    this.showTimer = null;
    this.hideTimer = null;
    this.isInitialized = false;

    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
  }

  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    // Create portal container
    this.container = document.createElement('div');
    this.container.id = 'global-portal-tooltip';
    this.container.setAttribute('role', 'tooltip');
    this.container.setAttribute('aria-hidden', 'true');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 999999;
      opacity: 0;
      transform: scale(0.96);
      transition: opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1), transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity, top, left;
      display: none;
    `;

    this.contentEl = document.createElement('div');
    this.contentEl.className = 'global-tooltip-content';
    this.contentEl.style.cssText = `
      background: var(--tooltip-bg, rgba(15, 23, 42, 0.94));
      color: var(--tooltip-text, #ffffff);
      padding: 6px 12px;
      border-radius: 8px;
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      font-size: 11.5px;
      font-weight: 500;
      line-height: 1.35;
      letter-spacing: 0.015em;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16));
      max-width: 320px;
      word-break: break-word;
      white-space: normal;
      text-align: center;
    `;

    this.arrowEl = document.createElement('div');
    this.arrowEl.className = 'global-tooltip-arrow';
    this.arrowEl.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: var(--tooltip-bg, rgba(15, 23, 42, 0.94));
      border: 1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16));
      transform: rotate(45deg);
      pointer-events: none;
    `;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.container.appendChild(this.contentEl);
    this.container.appendChild(this.arrowEl);
    document.body.appendChild(this.container);

    // Global Delegated Event Listeners
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('focusin', this.handleFocusIn, true);
    document.addEventListener('focusout', this.handleFocusOut, true);
    document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.updatePosition, { passive: true });
    document.addEventListener('keydown', this.handleKeyDown, true);

    this.isInitialized = true;
  }

  destroy() {
    if (!this.isInitialized) return;
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('focusin', this.handleFocusIn, true);
    document.removeEventListener('focusout', this.handleFocusOut, true);
    document.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.updatePosition);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isInitialized = false;
  }

  handleTouchStart() {
    this.hide(true);
  }

  findTrigger(target) {
    if (!target || !(target instanceof Element)) return null;
    return target.closest('[data-tooltip]');
  }

  isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.matchMedia && 
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  }

  handleMouseOver(e) {
    if (this.isTouchDevice()) return;
    const trigger = this.findTrigger(e.target);
    if (!trigger) return;
    const text = trigger.getAttribute('data-tooltip');
    if (!text || !text.trim()) return;

    this.show(trigger, text);
  }

  handleMouseOut(e) {
    const trigger = this.findTrigger(e.target);
    if (!trigger || trigger !== this.activeTrigger) return;
    this.hide();
  }

  handleFocusIn(e) {
    if (this.isTouchDevice()) return;
    const trigger = this.findTrigger(e.target);
    if (!trigger) return;
    const text = trigger.getAttribute('data-tooltip');
    if (!text || !text.trim()) return;

    this.show(trigger, text);
  }

  handleFocusOut(e) {
    const trigger = this.findTrigger(e.target);
    if (!trigger || trigger !== this.activeTrigger) return;
    this.hide();
  }

  handleScroll() {
    if (this.activeTrigger) {
      this.updatePosition();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && this.activeTrigger) {
      this.hide(true);
    }
  }

  show(triggerEl, text) {
    clearTimeout(this.hideTimer);
    this.activeTrigger = triggerEl;

    this.showTimer = setTimeout(() => {
      if (!this.container || !this.activeTrigger) return;

      this.contentEl.textContent = text;
      this.container.style.display = 'block';
      this.container.setAttribute('aria-hidden', 'false');

      // Update position before animating in
      this.updatePosition();

      requestAnimationFrame(() => {
        if (this.container && this.activeTrigger) {
          this.container.style.opacity = '1';
          this.container.style.transform = 'scale(1)';
        }
      });
    }, 60);
  }

  hide(immediate = false) {
    clearTimeout(this.showTimer);
    if (!this.container || !this.activeTrigger) return;

    if (immediate) {
      this.container.style.opacity = '0';
      this.container.style.transform = 'scale(0.96)';
      this.container.style.display = 'none';
      this.container.setAttribute('aria-hidden', 'true');
      this.activeTrigger = null;
      return;
    }

    this.container.style.opacity = '0';
    this.container.style.transform = 'scale(0.96)';
    this.container.setAttribute('aria-hidden', 'true');

    this.hideTimer = setTimeout(() => {
      if (this.container && !this.activeTrigger) {
        this.container.style.display = 'none';
      }
    }, 160);

    this.activeTrigger = null;
  }

  updatePosition() {
    if (!this.container || !this.activeTrigger) return;

    const triggerRect = this.activeTrigger.getBoundingClientRect();
    
    // If element is not visible or outside screen, hide
    if (triggerRect.width === 0 && triggerRect.height === 0) {
      this.hide(true);
      return;
    }

    const tooltipWidth = this.container.offsetWidth;
    const tooltipHeight = this.container.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let preferredPos = (this.activeTrigger.getAttribute('data-tooltip-pos') || 'top').toLowerCase();

    // Auto-flip logic based on collision with viewport edges
    let actualPos = preferredPos;

    if (preferredPos === 'top') {
      if (triggerRect.top - tooltipHeight - ARROW_GAP < VIEWPORT_PADDING) {
        // Not enough space on top -> Flip to bottom
        actualPos = 'bottom';
      }
    } else if (preferredPos === 'bottom') {
      if (triggerRect.bottom + tooltipHeight + ARROW_GAP > viewportHeight - VIEWPORT_PADDING) {
        // Not enough space on bottom -> Flip to top
        actualPos = 'top';
      }
    } else if (preferredPos === 'left') {
      if (triggerRect.left - tooltipWidth - ARROW_GAP < VIEWPORT_PADDING) {
        // Not enough space on left -> Flip to right
        actualPos = 'right';
      }
    } else if (preferredPos === 'right') {
      if (triggerRect.right + tooltipWidth + ARROW_GAP > viewportWidth - VIEWPORT_PADDING) {
        // Not enough space on right -> Flip to left
        actualPos = 'left';
      }
    }

    // Secondary fallback: if still colliding after flip, default to bottom or top with most space
    if (actualPos === 'top' && triggerRect.top - tooltipHeight - ARROW_GAP < VIEWPORT_PADDING) {
      actualPos = 'bottom';
    } else if (actualPos === 'bottom' && triggerRect.bottom + tooltipHeight + ARROW_GAP > viewportHeight - VIEWPORT_PADDING) {
      actualPos = 'top';
    }

    let top = 0;
    let left = 0;

    if (actualPos === 'top' || actualPos === 'bottom') {
      // Horizontal centering on trigger
      const idealLeft = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
      left = Math.max(VIEWPORT_PADDING, Math.min(viewportWidth - tooltipWidth - VIEWPORT_PADDING, idealLeft));

      if (actualPos === 'top') {
        top = triggerRect.top - tooltipHeight - ARROW_GAP;
      } else {
        top = triggerRect.bottom + ARROW_GAP;
      }

      // Position Arrow
      const triggerCenterX = triggerRect.left + (triggerRect.width / 2);
      const arrowLeft = Math.max(8, Math.min(tooltipWidth - 16, triggerCenterX - left - 4));
      
      this.arrowEl.style.left = `${arrowLeft}px`;
      this.arrowEl.style.right = 'auto';

      if (actualPos === 'top') {
        this.arrowEl.style.top = 'auto';
        this.arrowEl.style.bottom = '-4px';
        this.arrowEl.style.borderTop = 'none';
        this.arrowEl.style.borderLeft = 'none';
        this.arrowEl.style.borderBottom = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
        this.arrowEl.style.borderRight = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
      } else {
        this.arrowEl.style.bottom = 'auto';
        this.arrowEl.style.top = '-4px';
        this.arrowEl.style.borderBottom = 'none';
        this.arrowEl.style.borderRight = 'none';
        this.arrowEl.style.borderTop = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
        this.arrowEl.style.borderLeft = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
      }
    } else {
      // Horizontal placements: left or right
      const idealTop = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
      top = Math.max(VIEWPORT_PADDING, Math.min(viewportHeight - tooltipHeight - VIEWPORT_PADDING, idealTop));

      if (actualPos === 'left') {
        left = triggerRect.left - tooltipWidth - ARROW_GAP;
      } else {
        left = triggerRect.right + ARROW_GAP;
      }

      // Position Arrow
      const triggerCenterY = triggerRect.top + (triggerRect.height / 2);
      const arrowTop = Math.max(6, Math.min(tooltipHeight - 14, triggerCenterY - top - 4));

      this.arrowEl.style.top = `${arrowTop}px`;
      this.arrowEl.style.bottom = 'auto';

      if (actualPos === 'left') {
        this.arrowEl.style.left = 'auto';
        this.arrowEl.style.right = '-4px';
        this.arrowEl.style.borderLeft = 'none';
        this.arrowEl.style.borderBottom = 'none';
        this.arrowEl.style.borderTop = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
        this.arrowEl.style.borderRight = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
      } else {
        this.arrowEl.style.right = 'auto';
        this.arrowEl.style.left = '-4px';
        this.arrowEl.style.borderTop = 'none';
        this.arrowEl.style.borderRight = 'none';
        this.arrowEl.style.borderBottom = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
        this.arrowEl.style.borderLeft = '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.16))';
      }
    }

    // Safety clamping on final coordinates to guarantee zero clipping
    const finalTop = Math.max(VIEWPORT_PADDING, Math.min(viewportHeight - tooltipHeight - VIEWPORT_PADDING, top));
    const finalLeft = Math.max(VIEWPORT_PADDING, Math.min(viewportWidth - tooltipWidth - VIEWPORT_PADDING, left));

    this.container.style.top = `${finalTop}px`;
    this.container.style.left = `${finalLeft}px`;
  }
}

export const globalTooltipManager = new TooltipManager();
