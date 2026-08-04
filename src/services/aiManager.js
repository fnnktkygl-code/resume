/**
 * Global AI Task & Cache Manager — Resume Builder
 * Provides:
 * 1. Persistent LocalStorage & In-Memory API Caching (24h TTL)
 * 2. In-Flight Request Deduplication (prevents duplicate API calls)
 * 3. Background Task Persistence (allows user to navigate/close modal without losing progress)
 * 4. Dynamic Step-by-Step Loading Progress Callbacks
 */

const CACHE_PREFIX = 'resume_ai_cache_v2_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

// In-Memory cache map & pending promises map
const inMemoryCache = new Map();
const pendingRequests = new Map();

/**
 * Generate a deterministic hash key for an AI request payload
 */
export function generatePayloadKey(endpoint, payload) {
  try {
    const jsonStr = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `${CACHE_PREFIX}${endpoint}_${Math.abs(hash)}`;
  } catch {
    return `${CACHE_PREFIX}${endpoint}_${Date.now()}`;
  }
}

/**
 * Retrieve cached response if valid and not expired
 */
export function getCachedAiResponse(key) {
  if (!key) return null;

  // 1. Check in-memory cache first
  if (inMemoryCache.has(key)) {
    const item = inMemoryCache.get(key);
    if (Date.now() < item.expiry) {
      return item.data;
    }
    inMemoryCache.delete(key);
  }

  // 2. Check localStorage
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() < parsed.expiry) {
        inMemoryCache.set(key, parsed);
        return parsed.data;
      }
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[AICache] localStorage read error:', e);
  }
  return null;
}

/**
 * Set cached response in memory and localStorage
 */
export function setCachedAiResponse(key, data) {
  if (!key || !data) return;
  const cacheItem = {
    data,
    expiry: Date.now() + CACHE_TTL_MS,
    cachedAt: new Date().toISOString()
  };

  inMemoryCache.set(key, cacheItem);
  try {
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (e) {
    console.warn('[AICache] localStorage write error:', e);
  }
}

/**
 * Execute an AI API request with caching, deduplication, and progress tracking
 */
export async function executeCachedAiRequest(endpoint, payload, fetcher, options = {}) {
  const { bypassCache = false, onProgress, taskName = 'ai-request' } = options;
  const key = generatePayloadKey(endpoint, payload);

  // 1. Return cached result if available and not bypassing
  if (!bypassCache) {
    const cachedData = getCachedAiResponse(key);
    if (cachedData) {
      console.log(`[AICache] Serving cached response for ${endpoint}`);
      if (onProgress) {
        onProgress({ progress: 100, step: 'Chargé depuis le cache instantané ⚡', isDone: true });
      }
      return cachedData;
    }
  }

  // 2. Deduplicate in-flight requests
  if (pendingRequests.has(key)) {
    console.log(`[AICache] Joining existing in-flight request for ${endpoint}`);
    return pendingRequests.get(key);
  }

  // 3. Register background task state for modal persistence
  const taskState = {
    id: key,
    taskName,
    status: 'running',
    progress: 10,
    step: 'Initialisation de la requête IA...',
    result: null,
    error: null,
    startTime: Date.now()
  };
  saveActiveTaskState(taskState);

  const requestPromise = (async () => {
    try {
      if (onProgress) onProgress({ progress: 20, step: 'Connexion aux serveurs Gemini...' });
      
      const result = await fetcher();

      // Store in cache
      setCachedAiResponse(key, result);

      // Update background task state
      taskState.status = 'completed';
      taskState.progress = 100;
      taskState.result = result;
      saveActiveTaskState(taskState);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-task-completed', { detail: { key, result, taskName } }));
      }

      return result;
    } catch (err) {
      taskState.status = 'failed';
      taskState.error = err.message || 'Error executing request';
      saveActiveTaskState(taskState);
      throw err;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Background Task Persistence helpers
 */
const ACTIVE_TASKS_KEY = 'resume_active_ai_tasks_v1';

export function saveActiveTaskState(taskState) {
  try {
    const tasks = getActiveTaskStates();
    tasks[taskState.id] = taskState;
    localStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
  } catch {}
}

export function getActiveTaskStates() {
  try {
    const raw = localStorage.getItem(ACTIVE_TASKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getActiveTaskById(id) {
  const tasks = getActiveTaskStates();
  return tasks[id] || null;
}
