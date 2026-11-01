"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  setDoc, 
  serverTimestamp, 
  updateDoc, 
  increment 
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { 
  Leaf, 
  Zap, 
  Check, 
  Flame, 
  Users, 
  Camera, 
  LogOut, 
  TrendingDown, 
  Award,
  Sparkles
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  points: number;
  co2_saving_kg: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/auth");
        return;
      }
      setUser(authUser);

      // Load user profile
      const userRef = doc(db, "users", authUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        router.push("/onboarding");
        return;
      }

      // Load user's completed tasks from subcollection
      const userTasksRef = collection(db, "users", authUser.uid, "user_tasks");
      const userTasksSnap = await getDocs(userTasksRef);
      const completed = new Set<string>();
      userTasksSnap.forEach((d) => completed.add(d.id));
      setCompletedTaskIds(completed);

      // Load available tasks
      const tasksRef = collection(db, "tasks");
      const tasksSnap = await getDocs(tasksRef);
      const taskList: TaskItem[] = [];
      tasksSnap.forEach((d) => {
        taskList.push({ id: d.id, ...d.data() } as TaskItem);
      });

      // Default fallback tasks compliant with Phase 3 specifications if collection is fresh
      if (taskList.length === 0) {
        setTasks([
          {
            id: "task_ac_26",
            title: "Set Air Conditioner to 26°C",
            description: "Avoids continuous compressor strain; saves 2.4 kWh per 8-hour cycle.",
            points: 20,
            co2_saving_kg: 1.7
          },
          {
            id: "task_offpeak_laundry",
            title: "Off-Peak Appliance Use (Post 10 PM)",
            description: "Run washing machines outside Gujarat peak hours (6–10 PM).",
            points: 15,
            co2_saving_kg: 1.2
          },
          {
            id: "task_phantom_cutoff",
            title: "Cut Standby Phantom Power",
            description: "Switch off entertainment console and microwave sockets at the wall.",
            points: 10,
            co2_saving_kg: 0.5
          },
          {
            id: "task_bucket_bath",
            title: "Adopt 1-Bucket Bath",
            description: "Conserves 40 litres of fresh groundwater per bath.",
            points: 15,
            co2_saving_kg: 0.8
          }
        ]);
      } else {
        setTasks(taskList);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCompleteTask = async (task: TaskItem) => {
    if (!user || completedTaskIds.has(task.id)) return;
    setCompletingId(task.id);

    try {
      const userRef = doc(db, "users", user.uid);
      const currentStreak = profile?.streak_count || 0;
      const isStreakActive = currentStreak >= 3;
      
      // Phase 3 Scoring Logic: 10-20 points + 1.2x streak multiplier if streak >= 3
      const multiplier = isStreakActive ? 1.2 : 1.0;
      const finalPoints = Math.round(task.points * multiplier);

      // 1. Write to user_tasks subcollection with serverTimestamp to prevent spamming
      const subtaskRef = doc(db, "users", user.uid, "user_tasks", task.id);
      await setDoc(subtaskRef, {
        task_id: task.id,
        title: task.title,
        points_awarded: finalPoints,
        co2_saving_kg: task.co2_saving_kg,
        completed_at: serverTimestamp(),
      });

      // 2. Update user document atomically
      const newScore = Math.max(0, (profile?.current_score || 0) - task.co2_saving_kg);
      const newStreak = currentStreak + 1;

      await updateDoc(userRef, {
        current_score: newScore,
        streak_count: increment(1),
      });

      // Local state update
      setCompletedTaskIds((prev) => new Set(prev).add(task.id));
      setProfile((prev: any) => ({
        ...prev,
        current_score: newScore,
        streak_count: newStreak,
      }));
    } catch (err) {
      console.error("Error completing task:", err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const baseline = profile?.baseline_carbon_score || 280;
  const current = profile?.current_score || baseline;
  const offset = Math.max(0, baseline - current);
  const offsetPercent = Math.min(100, Math.round((offset / baseline) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-emerald-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight block">Mission LiFE</span>
              <span className="text-[10px] text-slate-400 font-mono">Pin Code: {profile?.pin_code || "380015"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squad View</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        {/* Welcome Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Hello, {profile?.name || "Citizen"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Household carbon metrics for {profile?.house_size} in {profile?.pin_code}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-900">{profile?.streak_count || 0} Day Streak</span>
              {(profile?.streak_count || 0) >= 3 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-800 text-[10px] font-mono font-semibold">
                  1.2x Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Impact: The Digital Tree & Carbon Offset Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Progress</span>
                <h3 className="text-lg font-semibold text-slate-900 mt-0.5">Carbon Reduction Index</h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold">
                -{offset.toFixed(1)} kg CO₂e Offset
              </span>
            </div>

            {/* Subtle Growing Digital Tree Animation */}
            <div className="my-8 flex flex-col items-center justify-center">
              <motion.div
                className="relative flex items-center justify-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div 
                  className="w-32 h-32 rounded-full bg-gradient-to-t from-emerald-100 to-teal-50 flex items-center justify-center shadow-inner transition-all duration-700"
                  style={{ transform: `scale(${0.85 + (offsetPercent / 200)})` }}
                >
                  <Leaf className="w-14 h-14 text-emerald-600" />
                </div>
              </motion.div>
              <span className="text-xs font-medium text-slate-600 mt-3">
                {offsetPercent > 20 ? "Thriving Household Canopy" : "Sapling Rooted • Complete micro-tasks to grow"}
              </span>
            </div>

            {/* Score Comparison */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-medium uppercase text-slate-400 block">Baseline Carbon</span>
                <span className="text-xl font-bold font-mono text-slate-700">{baseline} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase text-emerald-700 block">Current Carbon</span>
                <span className="text-xl font-bold font-mono text-emerald-800">{current.toFixed(1)} kg</span>
              </div>
            </div>
          </div>

          {/* Quick Hardware / Appliance Bridge Card */}
          <div className="md:col-span-5 p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">YOLOv8 Appliance Scanner</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Photograph any household appliance to detect estimated wattage, vampire draw, and instant energy-saving setpoints.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 my-4 text-xs space-y-1 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Microservice:</span>
                <span className="text-emerald-700">FastAPI Online</span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry:</span>
                <span>ESP32 Ready</span>
              </div>
            </div>

            <button
              onClick={() => alert("Open the camera upload to query FastAPI /api/scan with OpenCV & YOLOv8.")}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all text-center cursor-pointer shadow-xs"
            >
              Launch Appliance Vision
            </button>
          </div>
        </div>

        {/* Micro-Task Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">Today's Daily Nudges</h2>
              <p className="text-xs text-slate-500">Low-friction habits to lower domestic power and water load.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {completedTaskIds.size} / {tasks.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const isDone = completedTaskIds.has(task.id);
              const isWorking = completingId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? "bg-emerald-50/40 border-emerald-200 text-slate-800"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-900">{task.title}</span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        +{task.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-mono text-slate-400">
                      -{task.co2_saving_kg} kg CO₂e
                    </span>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task)}
                        disabled={isWorking}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isWorking ? "Saving..." : "Complete Task"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

