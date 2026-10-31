/**
 * Mission LiFE AI Coach Recommendation Service
 * Official Gujarat Energy Development Agency (GEDA) Climate Advisor
 */

export const DEFAULT_ADAPTION_KEY = "pt_live_0e6c91c45a694ff6dd1f22bfcde423b5540456d8";
export const DEFAULT_ADAPTION_MODEL = "deepseek-v4-flash";

export async function getLifeRecommendation(userProfile, context = {}) {
  const { question = "", language = 'en' } = context;
  const apiKey = localStorage.getItem('adaption_api_key') || DEFAULT_ADAPTION_KEY;
  const model = localStorage.getItem('adaption_model') || DEFAULT_ADAPTION_MODEL;

  // System instructions tailored for GEDA & Mission LiFE
  const systemInstructions = `You are the official LiFE AI Sustainability Advisor for Gujarat Energy Development Agency (GEDA) Mission LiFE.
Citizen Context:
- Name: ${userProfile.name || 'Citizen'}
- City / District: ${userProfile.city || 'Ahmedabad'}, Gujarat
- Monthly Electricity Consumption: ${userProfile.monthlyElectricityUnits || 280} kWh (Bill: ₹${userProfile.monthlyElectricityBill || 2100})
- Daily AC Runtime: ${userProfile.acUsageHours || 6} hours
- Daily Commute: ${userProfile.dailyTravelKm || 18} km via ${userProfile.vehicleType || 'petrol_car'}
- Current Footprint: ${userProfile.monthlyFootprintKg || 428} kg CO2e / month
- Active Streak: ${userProfile.streak || 7} days | LiFE Score: ${userProfile.lifeScore || 780}

Respond concisely and practically. Include:
1. Immediate quantifiable reduction tip (kWh, Litres, or kg CO2 saved).
2. Estimated monthly rupee savings on power/fuel bills.
3. Relevant Mission LiFE micro-action or government scheme (e.g., PM Surya Ghar Muft Bijli Yojana, ToD off-peak hours).
Keep it encouraging, empowering, and precise. Respond in language: ${language}.`;

  // 1. Try Direct Adaption Platform REST API
  if (apiKey) {
    try {
      const directResponse = await fetch("https://api.prod.adaptionlabs.ai/api/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey
        },
        body: JSON.stringify({
          model: model,
          instructions: systemInstructions,
          input: question,
          max_output_tokens: 500,
          temperature: 0.7
        })
      });

      if (directResponse.ok) {
        const data = await directResponse.json();
        const text = data.output_text || 
          (data.output && data.output[0]?.content && data.output[0]?.content[0]?.text) || 
          null;

        if (text) {
          return {
            text: text,
            isAdaptationPlatform: true,
            provider: `Adaptation AI (${model})`,
            actionTitle: "Explore Rooftop Solar",
            actionTab: "solar"
          };
        }
      }
    } catch (directErr) {
      // CORS or network fallback
    }

    // Try proxy
    try {
      const proxyResponse = await fetch('/api/adaption/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Adaption-Key": apiKey
        },
        body: JSON.stringify({
          apiKey,
          prompt: question,
          userProfile,
          language,
          model
        })
      });

      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        if (proxyData.text) {
          return {
            text: proxyData.text,
            isAdaptationPlatform: true,
            provider: `Adaptation AI (${model})`,
            actionTitle: "Explore Rooftop Solar",
            actionTab: "solar"
          };
        }
      }
    } catch (proxyErr) {}
  }

  // Resilient High-Intelligence Local GEDA Rule Engine Fallback
  return generateIntelligentFallback(userProfile, question, language);
}

function generateIntelligentFallback(user, question = "", lang = 'en') {
  const q = question.toLowerCase();

  if (q.includes("solar") || q.includes("rooftop") || q.includes("subsidy") || q.includes("sun")) {
    const kwNeeded = Math.max(1, Math.round((user.monthlyElectricityUnits / 120) * 10) / 10);
    const subsidy = kwNeeded >= 3 ? 78000 : Math.round(kwNeeded * 26000);
    const annualSavings = Math.round(kwNeeded * 1400 * 7.5);

    return {
      text: `Based on your monthly consumption of **${user.monthlyElectricityUnits} kWh**, a **${kwNeeded} kW Rooftop Solar system** is ideal for your home.

Key Projections:
• **PM Surya Ghar Subsidy**: You qualify for **₹${subsidy.toLocaleString('en-IN')}** in Central Financial Assistance.
• **Annual Power Bill Savings**: Approx **₹${annualSavings.toLocaleString('en-IN')} / year**.
• **Clean Energy Generated**: ~${Math.round(kwNeeded * 1400)} units annually.
• **CO₂ Mitigated**: ~${(kwNeeded * 1.15).toFixed(1)} tonnes / year.

Use the Solar Advisor tab to inspect exact roof area feasibility and request a certified GEDA installer callback.`,
      isAdaptationPlatform: false,
      provider: "GEDA Solar Intelligence Engine",
      actionTitle: "Open Solar Advisor",
      actionTab: "solar"
    };
  }

  if (q.includes("bill") || q.includes("electricity") || q.includes("power") || q.includes("peak") || q.includes("ac")) {
    const acSavings = Math.round(user.acUsageHours * 0.18 * 30 * 7.5);
    return {
      text: `Your current electricity bill is approx **₹${user.monthlyElectricityBill || 2120}/month** (${user.monthlyElectricityUnits} kWh).

**High-Impact Actions to Cut Bill by 25-35%:**
1. **Calibrate AC to 26°C**: Setting your AC at 26°C instead of 21°C saves ~₹${acSavings}/month and ${Math.round(user.acUsageHours * 0.4 * 30)} kg CO₂.
2. **Shift to Off-Peak Hours (11 PM - 6 AM)**: Run washing machines, dishwashers, and EV charging during green off-peak hours under Gujarat's ToD tariff to cut unit cost from ₹9.20 to ₹5.40.
3. **Cut Phantom Standby Loads**: Turn off switches at the wall for entertainment consoles and microwave ovens.`,
      isAdaptationPlatform: false,
      provider: "GEDA Efficiency Intelligence",
      actionTitle: "Log AC Eco-Set Mission",
      actionTab: "missions"
    };
  }

  if (q.includes("waste") || q.includes("plastic") || q.includes("compost")) {
    return {
      text: `Managing waste at source is one of Mission LiFE's core pillars!

**Action Plan for ${user.city || 'Gujarat'}:**
• **Dual-Bin Segregation**: Segregate wet kitchen greens from dry recyclables. Composting wet waste prevents methane emissions at municipal landfills.
• **Say No to Single-Use Plastic**: Carry a cloth bag for daily vegetable markets; this single habit prevents ~400 plastic bags per household annually.
• **E-Waste Handover**: Deposit old chargers and batteries at authorized GEDA collection points instead of mixed waste bins.`,
      isAdaptationPlatform: false,
      provider: "Mission LiFE Circular Advisor",
      actionTitle: "View Waste Missions",
      actionTab: "missions"
    };
  }

  // General default personalized response
  return {
    text: `Hello ${user.name}! Your current carbon footprint is **${user.monthlyFootprintKg} kg CO₂e / month** (${user.footprintDeltaPercent}% improvement).

**Your Top 3 Recommended Actions Today:**
1. **Energy**: Maintain AC at 26°C and switch off idle electronics to conserve ~1.1 kg CO₂ today.
2. **Mobility**: For trips under 3 km, switch from ${user.vehicleType.replace('_', ' ')} to cycling or walking.
3. **Community Sprint**: Check the active *Gujarat 200,000 kg CO₂ Avoided* campaign in the Community tab and log today's micro-tasks!`,
    isAdaptationPlatform: false,
    provider: "GEDA Mission LiFE AI Advisor",
    actionTitle: "View Daily Missions",
    actionTab: "missions"
  };
}
