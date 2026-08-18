import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  // Polyfill ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = window.ResizeObserver;

  // Polyfill IntersectionObserver
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = window.IntersectionObserver;

  // Polyfill window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // Polyfill scrollTo and scrollIntoView
  window.scrollTo = () => {};
  if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = () => {};
  }

  // Polyfill URL.createObjectURL
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:http://localhost/mock-blob-url';
    URL.revokeObjectURL = () => {};
  }
}
