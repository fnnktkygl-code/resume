// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useResumeHistory from './useResumeHistory';
import resumeReducer from '../reducers/resumeReducer';

describe('useResumeHistory hook', () => {
  const initialData = {
    personal: { name: 'Bob' },
    headings: {},
    summary: 'Initial summary',
    experience: [],
    customSections: [],
    sectionOrder: []
  };

  test('initializes state correctly', () => {
    const { result } = renderHook(() => useResumeHistory(resumeReducer, initialData));
    const [data] = result.current;
    expect(data).toEqual(initialData);
  });

  test('dispatches action to update state', () => {
    const { result } = renderHook(() => useResumeHistory(resumeReducer, initialData));
    
    act(() => {
      const dispatch = result.current[1];
      dispatch({ type: 'UPDATE_SUMMARY', payload: 'New summary' });
    });

    const [data] = result.current;
    expect(data.summary).toBe('New summary');
  });

  test('saves and restores snapshot', () => {
    const { result } = renderHook(() => useResumeHistory(resumeReducer, initialData));

    act(() => {
      const { saveSnapshot } = result.current[2];
      saveSnapshot();
    });

    act(() => {
      const dispatch = result.current[1];
      dispatch({ type: 'UPDATE_SUMMARY', payload: 'AI mutated summary' });
    });

    expect(result.current[0].summary).toBe('AI mutated summary');

    act(() => {
      const { restoreSnapshot } = result.current[2];
      restoreSnapshot();
    });

    expect(result.current[0].summary).toBe('Initial summary');
  });

  test('undo and redo work as expected after debounced delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useResumeHistory(resumeReducer, initialData));
    
    act(() => {
      const dispatch = result.current[1];
      dispatch({ type: 'UPDATE_SUMMARY', payload: 'State 2' });
    });

    // Avancer le temps de 1000ms pour déclencher le debounce de l'historique
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      const { undo } = result.current[2];
      undo();
    });

    expect(result.current[0].summary).toBe('Initial summary');

    act(() => {
      const { redo } = result.current[2];
      redo();
    });

    expect(result.current[0].summary).toBe('State 2');
    vi.useRealTimers();
  });
});
