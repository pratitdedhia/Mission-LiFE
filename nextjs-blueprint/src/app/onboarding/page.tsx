"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ArrowRight, ArrowLeft, Home, Zap, Car, Check, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [pinCode, setPinCode] = useState("380015");
  const [houseSize, setHouseSize] = useState("2 BHK");
  const [occupants, setOccupants] = useState(3);
  const [monthlyKwh, setMonthlyKwh] = useState(240);
  const [commuteMode, setCommuteMode] = useState("Two-wheeler");
  const [dailyCommuteKm, setDailyCommuteKm] = useState(15);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
      } else {
        setCurrentUser(user);
        setName(user.displayName || "Citizen");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Carbon Emission Factor: 0.71 kg CO2e per kWh (Indian National Grid Factor)
  // Commute emission factors: Two-wheeler (0.045), Petrol Car (0.18), Transit (0.03), EV (0.05)
  const calculateBaseline = () => {
    const electricityCo2 = monthlyKwh * 0.71;
    let commuteFactor = 0.045;
    if (commuteMode === "Petrol Car") commuteFactor = 0.18;
    else if (commuteMode === "Transit") commuteFactor = 0.03;
    else if (commuteMode === "EV") commuteFactor = 0.05;

    const monthlyCommuteCo2 = dailyCommuteKm * 30 * commuteFactor;
    return Math.round(electricityCo2 + monthlyCommuteCo2);
  };

  const handleComplete = async () => {
    if (!currentUser) return;
    setSaving(true);

    const baselineScore = calculateBaseline();

    try {
      // Create user document as specified in Phase 2
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        name: name || "Citizen",
        pin_code: pinCode,
        house_size: houseSize,
        occupants: Number(occupants),
        monthly_kwh: Number(monthlyKwh),
        commute_mode: commuteMode,
        daily_commute_km: Number(dailyCommuteKm),
        baseline_carbon_score: baselineScore,
        current_score: baselineScore, // Initial score matches baseline
        streak_count: 0,
        created_at: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating user profile in Firestore:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-emerald-100">
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600 rounded-full"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>STEP {step} OF 3</span>
          <span className="font-mono">Mission LiFE Baseline</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Your Living Space</h2>
                  <p className="text-xs text-slate-500">Tell us about your home and neighborhood.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Patel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pin Code (Postal Area)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="380015"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Home Configuration</label>
                  <select
                    value={houseSize}
                    onChange={(e) => setHouseSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4+ BHK / Villa">4+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Occupants</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={occupants}
                    onChange={(e) => setOccupants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Electricity Usage</h2>
                  <p className="text-xs text-slate-500">Average monthly consumption in kilowatt-hours.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-3xl font-bold font-mono text-slate-900">{monthlyKwh}</span>
                <span className="text-xs text-slate-500 block mt-1">units (kWh) / month</span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  Est. Bill: ₹{(monthlyKwh * 6.5).toFixed(0)} • Carbon: {(monthlyKwh * 0.71).toFixed(1)} kg CO₂e
                </span>
              </div>

              <div>
                <input
                  type="range"
                  min="60"
                  max="1200"
                  step="10"
                  value={monthlyKwh}
                  onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>60 kWh</span>
                  <span>1200 kWh</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Daily Commute</h2>
                  <p className="text-xs text-slate-500">Mode of personal or public transit.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {["Two-wheeler", "Petrol Car", "Transit", "EV"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCommuteMode(mode)}
                    className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      commuteMode === mode
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1.5 font-medium">
                  <span>Daily Distance Travelled</span>
                  <span className="font-mono text-emerald-700">{dailyCommuteKm} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="80"
                  step="1"
                  value={dailyCommuteKm}
                  onChange={(e) => setDailyCommuteKm(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                <span>Calculated Baseline Score:</span>
                <span className="font-bold text-base font-mono">{calculateBaseline()} kg CO₂e / mo</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Complete Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

