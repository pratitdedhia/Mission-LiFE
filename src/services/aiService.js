/**
 * Mission LiFE AI Coach Recommendation Service
 * Official Gujarat Energy Development Agency (GEDA) Climate Advisor
 * Powered by Adaptation Platform Provider Interface & Deterministic Fallback Engine.
 */

import { CustomAdaptationPlatformClient, DeterministicGEDAEngine } from './adaptationProviderInterface';

export const DEFAULT_ADAPTION_KEY = import.meta.env.VITE_ADAPTION_API_KEY || "pt_live_0e6c91c45a694ff6dd1f22bfcde423b5540456d8";
export const DEFAULT_ADAPTION_MODEL = import.meta.env.VITE_ADAPTION_MODEL || "deepseek-v4-flash";

const adaptationClient = new CustomAdaptationPlatformClient();
const deterministicEngine = new DeterministicGEDAEngine();

export async function getLifeRecommendation(userProfile, context = {}) {
  const { question = "", language = 'en' } = context;

  // 1. Attempt Cloud Adaptation Platform call if configured
  try {
    const aiResult = await adaptationClient.generateRecommendation(userProfile, { question, language });
    if (aiResult && aiResult.text) {
      return aiResult;
    }
  } catch (err) {
    // Cloud provider unconfigured, quota reached, or network offline:
    // Gracefully route to the certified deterministic GEDA energy intelligence engine.
  }

  // 2. Deterministic GEDA Energy Intelligence Engine
  return deterministicEngine.generateRecommendation(userProfile, { question, language });
}
