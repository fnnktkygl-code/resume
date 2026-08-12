/**
 * Smart Gemini & Gemma Quota Rotator — Resume Builder
 * 
 * Hierarchy & Quota Optimization:
 * 1. Performance & High Capacity (15 RPM / 500 RPD):
 *    - gemini-3.5-flash-lite
 *    - gemini-3.1-flash-lite
 *    - gemini-2.5-flash-lite
 * 
 * 2. Premium Quality Flash (5 RPM / 20 RPD):
 *    - gemini-3.5-flash
 *    - gemini-3.6-flash
 *    - gemini-2.5-flash
 * 
 * 3. Gemma 4 & Gemma 2 High-Quota Models (30 RPM / 14.4K RPD):
 *    - gemma-4-31b-it
 *    - gemma-4-26b-a4b-it
 *    - gemma-2-27b-it
 * 
 * 4. Production Fallbacks:
 *    - gemini-2.0-flash
 *    - gemini-1.5-flash
 */

const MODEL_CASCADE_TIERS = [
  // TIER 1: Modèles Lite Haute Capacité (15 RPM / 500 RPD) — Performance & Rapidité
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',

  // TIER 2: Modèles Standard Flash (5 RPM / 20 RPD) — Qualité Supérieure
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',

  // TIER 3: Modèles Gemma 4 & Gemma 2 Réserve (30 RPM / 14 400 RPD) — Inépuisable (14.4K RPD)
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
  'gemma-2-27b-it',

  // TIER 4: Modèles Production Fallback
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

// In-memory model cooldown registry (lasts across warm serverless invocations)
const modelCooldownMap = new Map(); // modelName -> cooldownTimestamp

let lastCallTimestamp = 0;

async function enforcePacingDelay(delayMs = 150) {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < delayMs) {
    await new Promise((resolve) => setTimeout(resolve, delayMs - elapsed));
  }
  lastCallTimestamp = Date.now();
}

export async function callGeminiApi({ apiKey, prompt, contents, generationConfig, systemInstruction, tools }) {
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
      await enforcePacingDelay(150);

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

      if (tools) {
        bodyPayload.tools = tools;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per model

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.warn(`[Gemini Rotator] Model ${modelName} status ${response.status}:`, errorBody);

        // If rate-limited (429), place model in 5-minute cooldown!
        if (response.status === 429) {
          const cooldownEnd = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString();
          console.warn(`🚨 [QUOTA ALERT] Model '${modelName}' rate-limited (HTTP 429). Placed in 5-min cooldown until ${cooldownEnd}. Cascading to next fallback tier...`);
          modelCooldownMap.set(modelName, Date.now() + 5 * 60 * 1000); // 5 min cooldown
          lastErr = new Error(errorBody.error?.message || `Rate limit on ${modelName}`);
          continue;
        }

        // If unavailable (404/400), cascade immediately to next tier
        if (response.status === 404 || response.status === 400) {
          console.warn(`⚠️ [MODEL CASCADE] Model '${modelName}' returned HTTP ${response.status}. Cascading to next tier...`);
          lastErr = new Error(errorBody.error?.message || `Unavailable ${modelName}`);
          continue;
        }

        throw new Error(errorBody.error?.message || `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        console.log(`✅ [AI MODEL SUCCESS] Executed successfully using tier model: '${modelName}'`);
        return generatedText;
      } else {
        throw new Error(`Empty response from ${modelName}`);
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
