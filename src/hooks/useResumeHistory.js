import { useReducer, useState, useEffect, useCallback, useRef } from 'react';

export default function useResumeHistory(reducer, initialData) {
  const [data, dispatch] = useReducer(
    reducer, 
    initialData, 
    (arg) => typeof arg === 'function' ? arg() : arg
  );
  const [aiSnapshot, setAiSnapshot] = useState(null);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  
  const lastPushedStateRef = useRef(JSON.stringify(data));
  const debounceTimerRef = useRef(null);

  // Sync ref when initialData changes initially, but don't overwrite if we already have edits
  useEffect(() => {
    lastPushedStateRef.current = JSON.stringify(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSnapshot = useCallback(() => {
    setAiSnapshot(structuredClone(data));
  }, [data]);

  const restoreSnapshot = useCallback(() => {
    if (aiSnapshot) {
      dispatch({ type: 'SET_DATA', payload: aiSnapshot });
      setAiSnapshot(null);
    }
  }, [aiSnapshot]);

  const pushToHistory = useCallback((newState) => {
    const serialized = JSON.stringify(newState);
    if (serialized === lastPushedStateRef.current) return;

    const previousState = JSON.parse(lastPushedStateRef.current);

    setPast(prev => {
      const nextPast = [...prev, previousState];
      if (nextPast.length > 50) nextPast.shift();
      return nextPast;
    });
    setFuture([]); // Clear future on new edits
    lastPushedStateRef.current = serialized;
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture(prev => [data, ...prev]);
    
    lastPushedStateRef.current = JSON.stringify(previous);
    dispatch({ type: 'SET_DATA', payload: previous });
  }, [past, data]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);
    setPast(prev => [...prev, data]);

    lastPushedStateRef.current = JSON.stringify(next);
    dispatch({ type: 'SET_DATA', payload: next });
  }, [future, data]);

  // Debounced history push on data change
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      pushToHistory(data);
    }, 1000); // Debounce typing history to 1s

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [data, pushToHistory]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return [
    data,
    dispatch,
    {
      past,
      future,
      undo,
      redo,
      aiSnapshot,
      setAiSnapshot,
      saveSnapshot,
      restoreSnapshot
    }
  ];
}
