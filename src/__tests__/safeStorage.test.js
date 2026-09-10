// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorageGet, safeStorageGetJSON, safeStorageSet, safeStorageRemove } from '../utils/safeStorage';

describe('safeStorage utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sets and retrieves string values safely', () => {
    const success = safeStorageSet('test_key', 'hello_world');
    expect(success).toBe(true);
    expect(safeStorageGet('test_key')).toBe('hello_world');
  });

  it('sets and retrieves JSON objects safely', () => {
    const obj = { name: 'Alice', role: 'Engineer' };
    const success = safeStorageSet('user_profile', obj);
    expect(success).toBe(true);
    expect(safeStorageGetJSON('user_profile')).toEqual(obj);
  });

  it('returns fallback if key does not exist or JSON is invalid', () => {
    expect(safeStorageGet('non_existent', 'default_val')).toBe('default_val');
    localStorage.setItem('invalid_json', '{broken-json');
    expect(safeStorageGetJSON('invalid_json', { fallback: true })).toEqual({ fallback: true });
  });

  it('removes keys safely', () => {
    safeStorageSet('temp_key', '123');
    expect(safeStorageGet('temp_key')).toBe('123');
    safeStorageRemove('temp_key');
    expect(safeStorageGet('temp_key')).toBeNull();
  });

  it('handles QuotaExceededError without throwing an unhandled exception', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    });

    const result = safeStorageSet('heavy_key', 'huge data');
    expect(result).toBe(false);
  });
});
