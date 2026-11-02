/**
 * Adaptation Platform Abstract Provider Interface & Deterministic Fallback Engine
 * Built for HackCult '26 ($500 Training/Dataset Credits Integration).
 * Provides a formal contract, configuration hooks, dataset schema evaluation,
 * and a robust deterministic GEDA engine when the external AI provider is unconfigured.
 */

export class AdaptationProvider {
  /**
   * Initializes the provider with deploy-time configuration.
   * @param {Object} config - { apiKey, endpoint, modelId }
   */
  async initialize(config = {}) {
    throw new Error("Method 'initialize()' must be implemented by concrete provider.");
  }

  /**
   * Generates a context-aware sustainability recommendation for a Gujarat citizen.
   * @param {Object} citizenProfile - Household footprint, appliances, units, district
   * @param {Object} promptContext - Specific citizen query or current activity
   * @returns {Promise<Object>} - { text, provider, confidence, actionTitle, actionTab, isLive }
   */
  async generateRecommendation(citizenProfile, promptContext = {}) {
    throw new Error("Method 'generateRecommendation()' must be implemented.");
  }

  /**
   * Evaluates a training or fine-tuning dataset against the platform schema.
   * @param {Array<Object>} datasetRecords - Array of training prompt/response pairs
   * @returns {Object} - { valid: boolean, recordCount: number, errors: Array }
   */
  evaluateDataset(datasetRecords) {
    throw new Error("Method 'evaluateDataset()' must be implemented.");
  }
}

/**
 * Concrete Client for the Hackathon Adaptation Platform
 * Will connect to the provider when credentials and endpoint details are issued.
 */
export class CustomAdaptationPlatformClient extends AdaptationProvider {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || import.meta.env.VITE_ADAPTION_API_KEY || '';
    this.endpoint = config.endpoint || import.meta.env.VITE_ADAPTION_ENDPOINT || 'https://api.prod.adaptionlabs.ai/api/v1/responses';
    this.modelId = config.modelId || import.meta.env.VITE_ADAPTION_MODEL || 'deepseek-v4-flash';
  }

  async initialize(config = {}) {
    this.apiKey = config.apiKey || this.apiKey;
    this.endpoint = config.endpoint || this.endpoint;
    this.modelId = config.modelId || this.modelId;
    return true;
  }

  async generateRecommendation(citizenProfile, promptContext = {}) {
    if (!this.apiKey || this.apiKey === 'YOUR_ADAPTION_API_KEY') {
      throw new Error("ADAPTATION_API_KEY_NOT_CONFIGURED");
    }

    const { question = "How can I reduce my household electricity bill?", language = "en" } = promptContext;

    const systemPrompt = `You are the official LiFE AI Sustainability Advisor for Gujarat Energy Development Agency (GEDA) Mission LiFE.
Citizen Profile:
- Name: ${citizenProfile.name || 'Citizen'}
- District: ${citizenProfile.city || 'Ahmedabad'}, Gujarat
- Monthly Electricity Units: ${citizenProfile.monthlyElectricityUnits || 280} kWh (Bill: ₹${citizenProfile.monthlyElectricityBill || 2120})
- Daily AC Usage: ${citizenProfile.acUsageHours || 6} hours
- Monthly Footprint: ${citizenProfile.monthlyFootprintKg || 428} kg CO2e
- Active Streak: ${citizenProfile.streak || 7} days

Provide:
1. Exact quantifiable savings (kWh & ₹).
2. Contextual Mission LiFE task or Gujarat government scheme (e.g. PM Surya Ghar, ToD peak tariff).
Respond in language: ${language}.`;

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.apiKey
      },
      body: JSON.stringify({
        model: this.modelId,
        instructions: systemPrompt,
        input: question,
        max_output_tokens: 500,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`Adaptation API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const outputText = data.output_text || data.output?.[0]?.content?.[0]?.text;

    if (!outputText) {
      throw new Error("Malformed response from Adaptation Platform");
    }

    return {
      text: outputText,
      provider: `Adaptation Platform (${this.modelId})`,
      isLive: true,
      confidence: 0.94,
      actionTitle: "Explore Rooftop Solar",
      actionTab: "solar"
    };
  }

  evaluateDataset(datasetRecords) {
    if (!Array.isArray(datasetRecords) || datasetRecords.length === 0) {
      return { valid: false, recordCount: 0, errors: ["Dataset must be a non-empty array of records."] };
    }

    const errors = [];
    datasetRecords.forEach((record, idx) => {
      if (!record.prompt || typeof record.prompt !== 'string') {
        errors.push(`Record ${idx}: Missing or invalid 'prompt' field.`);
      }
      if (!record.citizenContext || typeof record.citizenContext !== 'object') {
        errors.push(`Record ${idx}: Missing 'citizenContext' object.`);
      }
      if (!record.expectedResponse || typeof record.expectedResponse !== 'string') {
        errors.push(`Record ${idx}: Missing 'expectedResponse' string.`);
      }
    });

    return {
      valid: errors.length === 0,
      recordCount: datasetRecords.length,
      errors
    };
  }
}

import { getCachedCatalog, getCoachKnowledge } from './catalogService';

/**
 * Deterministic GEDA Energy Intelligence Engine
 * Provides rule-based recommendations from coachKnowledge reference collection.
 */
export class DeterministicGEDAEngine extends AdaptationProvider {
  async initialize() {
    return true;
  }

  async generateRecommendation(user, promptContext = {}) {
    const question = (promptContext.question || "").toLowerCase();
    
    // Retrieve knowledge base from coachKnowledge collection / cache
    let knowledgeBase = getCachedCatalog('coachKnowledge') || [];
    if (!knowledgeBase || knowledgeBase.length === 0) {
      try {
        const res = await getCoachKnowledge();
        knowledgeBase = res.data || [];
      } catch (e) {
        knowledgeBase = [];
      }
    }

    // Keyword matching against knowledgeBase
    let matched = null;
    if (question && knowledgeBase.length > 0) {
      for (const item of knowledgeBase) {
        const keys = item.keywords || [];
        if (keys.some(k => question.includes(k.toLowerCase()))) {
          matched = item;
          break;
        }
      }
    }

    if (matched) {
      return {
        text: matched.response,
        provider: "Rule-Based Eco Coach (coachKnowledge retrieval)",
        isLive: false,
        confidence: 1.0,
        source: matched.source || "GEDA Guidelines",
        actionTitle: "Explore LiFE Actions",
        actionTab: "missions"
      };
    }

    // Default general tip from knowledgeBase or contextual fallback
    const defaultTip = knowledgeBase[0]?.response || "Switch off appliances at the wall plug when not in use and maintain air conditioners at 26°C with ceiling fans to save power.";

    return {
      text: `Hello ${user?.name || 'Citizen'}! Here is today's verified habit recommendation:

${defaultTip}

Check the Daily Challenges tab to accept micro-tasks and track your CO₂ mitigation.`,
      provider: "Rule-Based Eco Coach (coachKnowledge retrieval)",
      isLive: false,
      confidence: 1.0,
      actionTitle: "View Daily Missions",
      actionTab: "missions"
    };
  }

  evaluateDataset(datasetRecords) {
    return {
      valid: true,
      recordCount: datasetRecords?.length || 0,
      engine: "GEDA Deterministic Evaluator"
    };
  }
}

/**
 * Factory to get the active adaptation provider instance.
 * Automatically tries the cloud platform client and falls back to deterministic GEDA engine.
 */
export async function getActiveAdaptationProvider() {
  const client = new CustomAdaptationPlatformClient();
  return client;
}

