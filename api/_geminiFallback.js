/**
 * Smart Gemini Quota & Model Rotator — Resume Builder
 * Inspired by RIANE Portfolio AI Quota Router architecture:
 * 1. Maintains active cooldown tracker per model when HTTP 429 (Rate Limit / Quota) is hit.
 * 2. Seamlessly falls back to alternative active models without raising errors to the user.
 * 3. Enforces pacing delays between requests to eliminate burst limits.
 */

const MODEL_CASCADE_TIERS = [
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro-latest',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b'
];

// In-memory model cooldown registry (lasts across warm serverless invocations)
const modelCooldownMap = new Map(); // modelName -> cooldownTimestamp

let lastCallTimestamp = 0;

async function enforcePacingDelay(delayMs = 200) {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < delayMs) {
    await new Promise((resolve) => setTimeout(resolve, delayMs - elapsed));
  }
  lastCallTimestamp = Date.now();
}

export async function callGeminiApi({ apiKey, prompt, contents, generationConfig, systemInstruction }) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MASTER is missing in environment variables');
  }

  let lastErr = null;
  const now = Date.now();

  for (const modelName of MODEL_CASCADE_TIERS) {
    // Check if this model is currently in cooldown (e.g. 5 minutes after a 429)
    const cooldownUntil = modelCooldownMap.get(modelName) || 0;
    if (now < cooldownUntil) {
      console.log(`[Gemini Rotator] Skipping ${modelName} (in cooldown until ${new Date(cooldownUntil).toISOString()})`);
      continue;
    }

    try {
      await enforcePacingDelay(200);

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const bodyPayload = {};
      if (contents) {
        bodyPayload.contents = contents;
      } else if (prompt) {
        bodyPayload.contents = [{ parts: [{ text: prompt }] }];
      }

      if (generationConfig) {
        bodyPayload.generationConfig = generationConfig;
      }

      if (systemInstruction) {
        bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.warn(`[Gemini Rotator] Model ${modelName} status ${response.status}:`, errorBody);

        // If rate-limited (429), place model in 5-minute cooldown!
        if (response.status === 429) {
          modelCooldownMap.set(modelName, Date.now() + 5 * 60 * 1000); // 5 min cooldown
          lastErr = new Error(errorBody.error?.message || `Rate limit on ${modelName}`);
          continue;
        }

        // If invalid model name or not found (404/400), cascade immediately
        if (response.status === 404 || response.status === 400) {
          lastErr = new Error(errorBody.error?.message || `Unavailable ${modelName}`);
          continue;
        }

        throw new Error(errorBody.error?.message || `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText;
      }
    } catch (err) {
      console.warn(`[Gemini Rotator] Call to ${modelName} failed:`, err.message);
      lastErr = err;
    }
  }

  // If all models in cooldown or failed, clear cooldowns and throw clean error
  modelCooldownMap.clear();
  throw lastErr || new Error('All Gemini model tiers are temporarily busy. Please retry in a moment.');
}
