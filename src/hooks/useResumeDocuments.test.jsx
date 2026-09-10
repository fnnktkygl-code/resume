// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useResumeDocuments from './useResumeDocuments';
import { DEFAULT_DATA } from '../utils/constants';

describe('useResumeDocuments Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const setupHook = (initialData = DEFAULT_DATA) => {
    const dispatch = vi.fn();
    const setImportSnapshot = vi.fn();
    const setStep = vi.fn();
    const setIsCvManagerOpen = vi.fn();
    const t = (k) => k;

    const hookResult = renderHook(() =>
      useResumeDocuments({
        data: initialData,
        dispatch,
        importSnapshot: null,
        setImportSnapshot,
        setStep,
        setIsCvManagerOpen,
        language: 'fr',
        t
      })
    );

    return {
      ...hookResult,
      dispatch,
      setStep,
      setIsCvManagerOpen
    };
  };

  it('initializes with a default CV in list and persists to localStorage', () => {
    const { result } = setupHook();

    expect(result.current.cvList.length).toBe(1);
    expect(result.current.activeCvId).toBe('default');
    expect(result.current.cvList[0].name).toBe('Mon CV Principal');

    const storedList = JSON.parse(localStorage.getItem('resume-builder-cv-list'));
    expect(storedList).toHaveLength(1);
    expect(storedList[0].id).toBe('default');
  });

  it('creates a new CV and switches to it', () => {
    const { result, dispatch, setIsCvManagerOpen } = setupHook();

    act(() => {
      result.current.handleCreateCv();
    });

    expect(result.current.cvList.length).toBe(2);
    expect(result.current.activeCvId).not.toBe('default');
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_DATA' }));
    expect(setIsCvManagerOpen).toHaveBeenCalledWith(false);
  });

  it('duplicates an existing CV', () => {
    const { result } = setupHook();

    act(() => {
      result.current.handleDuplicateCv('default');
    });

    expect(result.current.cvList.length).toBe(2);
    expect(result.current.cvList[1].name).toContain('copy');
  });

  it('renames an existing CV', () => {
    const { result } = setupHook();

    act(() => {
      result.current.handleRenameCv('default', 'CV Ingénieur Cloud');
    });

    expect(result.current.cvList[0].name).toBe('CV Ingénieur Cloud');
    const storedList = JSON.parse(localStorage.getItem('resume-builder-cv-list'));
    expect(storedList[0].name).toBe('CV Ingénieur Cloud');
  });

  it('loads a targeted CV and updates active state', () => {
    const { result, dispatch } = setupHook();

    act(() => {
      result.current.handleCreateCv();
    });

    const secondId = result.current.activeCvId;

    act(() => {
      result.current.handleLoadCv('default');
    });

    expect(result.current.activeCvId).toBe('default');
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_DATA' }));
  });
});
