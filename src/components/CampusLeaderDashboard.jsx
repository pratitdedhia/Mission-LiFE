import React, { useState } from 'react';
import { 
  GraduationCap, 
  Trophy, 
  Zap, 
  Users, 
  Flame, 
  Send, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Share2
} from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/initialData';

export default function CampusLeaderDashboard({ user, onCompleteMission }) {
  const [sprints, setSprints] = useState([
    {
      id: "sprint_1",
      title: "Inter-Hostel AC 26°C Challenge",
      description: "Hostels 3, 5, and 7 compete to maintain AC setpoint at 26°C and shift laundry away from 6-10 PM peak hours.",
      participatingHostels: ["Hall 3 (Narmada)", "Hall 5 (Sabarmati)", "Hall 7 (Tapti)"],
      currentLeader: "Hall 5 (Sabarmati)",
      progressPercent: 78,
      kwhSaved: 3820,
      activeParticipants: 245
    },
    {
      id: "sprint_2",
      title: "Zero Food-Waste Mess Challenge",
      description: "Dining halls diverting 100% of organic waste to the campus biogas plant and vermicomposting facility.",
      participatingHostels: ["Central Dining Mess A", "Dining Mess B"],
      currentLeader: "Central Dining Mess A",
      progressPercent: 92,
      kwhSaved: 1450,
      activeParticipants: 380
    },
    {
      id: "sprint_3",
      title: "Solar Rooftop Campus Walk",
      description: "Interactive peer tour of IITGN's 320 kW rooftop solar installation on Academic Blocks 3 & 4.",
      participatingHostels: ["UG Freshers Squad", "Postgrad Climate Group"],
      currentLeader: "UG Freshers Squad",
      progressPercent: 64,
      kwhSaved: 890,
      activeParticipants: 160
    }
  ]);

  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeTheme, setNewChallengeTheme] = useState('energy');
  const [newChallengePoints, setNewChallengePoints] = useState(60);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCheerHostel = (sprintId) => {
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        return {
          ...s,
          activeParticipants: s.activeParticipants + 1,
          kwhSaved: s.kwhSaved + 40,
          progressPercent: Math.min(100, s.progressPercent + 2)
        };
      }
      return s;
    }));
    showToast("Cheered your campus squad! +40 kWh recorded to IITGN tally.");
  };

  const handleBroadcastChallenge = (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    const newSprint = {
      id: `sprint_${Date.now()}`,
      title: newChallengeTitle,
      description: `Campus-wide youth initiative initiated by ${user.name}.`,
      participatingHostels: ["Hostel Wing A", "Hostel Wing B", "Day Scholars"],
      currentLeader: "Campus Eco Squad",
      progressPercent: 10,
      kwhSaved: 100,
      activeParticipants: 42
    };

    setSprints([newSprint, ...sprints]);
    setNewChallengeTitle('');
    showToast("New campus green sprint broadcasted to 420+ students!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Campus Leader Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {user.campusName || "IIT Gandhinagar Eco Squad"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Trophy className="w-3.5 h-3.5" />
                  Rank #1 Campus in Gujarat
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Student Leader: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span> • Gujarat Youth Climate Fellowship
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>📍 Palaj, Gandhinagar, Gujarat</span>
                <span>👥 420+ Registered Student Volunteers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Campus sprint leaderboard link copied for WhatsApp/Telegram!")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Campus Link</span>
            </button>
          </div>
        </div>

        {/* Campus Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Squad Points</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">24,890</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">+120 pts today</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Hostel Energy Saved</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">18.4 <span className="text-xs font-normal">MWh</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">AC 26°C & Peak Shifting</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">CO₂ Avoided</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">12,400 <span className="text-xs font-normal">kg</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Audited by GEDA</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">ToD Peak Compliance</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">87%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Off-peak hostel power</p>
          </div>
        </div>
      </div>

      {/* Broadcast New Challenge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Broadcast New Campus Eco Sprint</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Mobilize hostel blocks, dining halls, and departments with customized Mission LiFE action tasks.
        </p>

        <form onSubmit={handleBroadcastChallenge} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Turn off hostel corridor lights after 11 PM or Zero-Food-Waste Lunch Friday"
            value={newChallengeTitle}
            onChange={(e) => setNewChallengeTitle(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Sprint</span>
          </button>
        </form>
      </div>

      {/* Sprints Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Active Campus Sustainability Sprints</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {sprints.length} Live
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sprints.map((sprint) => (
            <div 
              key={sprint.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Campus Challenge</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{sprint.activeParticipants} Students</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {sprint.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {sprint.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Sprint Goal</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{sprint.progressPercent}% Achieved</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${sprint.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leading Block:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sprint.currentLeader}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Energy Conserved:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{sprint.kwhSaved} kWh</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCheerHostel(sprint.id)}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔥</span>
                <span>Cheer & Record Action (+40 kWh)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gujarat Campus League Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Gujarat Inter-Campus Sustainability League</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Colleges and universities across Gujarat competing on verified energy savings and Mission LiFE points.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Members</th>
                <th className="py-2.5 px-3">LiFE Points</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {INITIAL_LEADERBOARD.campuses.map((c) => (
                <tr key={c.rank} className={c.rank === 1 ? "bg-amber-50/50 dark:bg-amber-950/20 font-semibold" : ""}>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${
                      c.rank === 1 ? 'bg-amber-400 text-slate-900' :
                      c.rank === 2 ? 'bg-slate-300 text-slate-900' :
                      c.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {c.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {c.members} students
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {c.points.toLocaleString()} pts
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {c.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}

