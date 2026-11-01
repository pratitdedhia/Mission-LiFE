import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Trophy,
  Users,
  TrendingUp,
  Zap,
  Droplets,
  Award,
  Flame,
  Heart,
  MessageSquare,
  Plus,
  ShieldCheck,
  Camera,
  X,
  Share2,
  Info,
  Filter,
  CheckCircle2,
  Sparkles,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { getCommunityFeed, createFeedPost, likeFeedPost } from '../services/firestoreService';
import { uploadProofImage } from '../services/storageService';
import { 
  getStudentVerifications, 
  getUniversityLeaderboard,
  matchesUniversity,
  POPULAR_UNIVERSITIES 
} from '../services/studentVerificationService';
import StudentProfileModal from './StudentProfileModal';
import { BRANDING } from '../config/branding';

export default function CommunityImpact({ community = {}, user = {} }) {
  const { t } = useTranslation();
  
  // Role separation: Citizen vs Student / Campus Leader
  const userRole = user.role || 'citizen';
  const isStudentOrCampus = userRole === 'student' || userRole === 'campus_leader';

  const [leaderboardTab, setLeaderboardTab] = useState(isStudentOrCampus ? 'campuses' : 'citizens'); // 'campuses' | 'students' for students, 'citizens' | 'districts' | 'campuses' for citizens
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState('IIT Gandhinagar');
  const [feedPosts, setFeedPosts] = useState([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRollNo, setNewRollNo] = useState(user.collegeId || '');
  const [newHostel, setNewHostel] = useState(user.residenceType || 'Hostel Hall 5');
  const [newLocality, setNewLocality] = useState(user.locality ? `${user.locality}, ${user.city || 'Gujarat'}` : (user.city || 'Bodakdev, Ahmedabad'));
  const [newTheme, setNewTheme] = useState('energy');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadFeed();
    loadStudents();
  }, []);

  const loadStudents = () => {
    const all = getStudentVerifications();
    const verified = all.filter(s => s.status === 'verified');
    // Sort by points descending
    verified.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    setVerifiedStudents(verified);
  };

  const loadFeed = async () => {
    const posts = await getCommunityFeed();
    setFeedPosts(posts);
  };

  const handleLike = async (postId) => {
    confetti({
      particleCount: 25,
      spread: 30,
      origin: { y: 0.8 }
    });
    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likedBy?.includes(user.id);
        return {
          ...p,
          likes: hasLiked ? p.likes - 1 : p.likes + 1,
          likedBy: hasLiked ? p.likedBy.filter(id => id !== user.id) : [...(p.likedBy || []), user.id]
        };
      }
      return p;
    }));
    await likeFeedPost(postId, user.id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Please provide an action title.");
      return;
    }
    if (isStudentOrCampus && !newRollNo.trim()) {
      alert("Please enter your Student Roll / College ID.");
      return;
    }
    if (!newContent.trim()) {
      alert("Please describe your action details and impact.");
      return;
    }

    setIsPosting(true);
    let photoUrl = isStudentOrCampus 
      ? "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
      : "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80";

    if (selectedFile) {
      const res = await uploadProofImage(selectedFile, user.id || (isStudentOrCampus ? 'usr_student' : 'usr_citizen'));
      if (res?.url) {
        photoUrl = res.url;
      }
    }

    const postObj = {
      authorName: user.name || (isStudentOrCampus ? 'Campus Student Volunteer' : 'Gujarat Citizen'),
      authorCity: isStudentOrCampus 
        ? (user.campusName ? user.campusName.split(' ')[0] : 'IIT Gandhinagar')
        : (newLocality || user.locality || user.city || 'Ahmedabad, Gujarat'),
      authorDetails: isStudentOrCampus 
        ? `Roll: ${newRollNo || '23BCE094'} • ${newHostel || 'Hall 5'}`
        : (newLocality || 'Residential Citizen'),
      avatarColor: isStudentOrCampus ? "bg-blue-600" : "bg-emerald-600",
      theme: newTheme,
      title: newTitle,
      content: newContent,
      co2SavedKg: 1.5,
      points: 25,
      photoUrl: photoUrl,
      verified: true,
      verificationType: isStudentOrCampus ? "Verified Student Evidence" : "Citizen Photo Evidence"
    };

    const res = await createFeedPost(postObj);
    setIsPosting(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setShowNewPostModal(false);
      setNewTitle('');
      setNewContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      loadFeed();
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((community.co2SavedKg || 142854) / (community.co2TargetKg || 200000)) * 100)
  );

  // Dynamic authoritative university rankings
  const universityRankings = getUniversityLeaderboard();

  // Citizen rankings for normal state residents
  const citizenRankings = [
    { rank: 1, name: 'Pooja Patel', city: 'Bodakdev, Ahmedabad', points: user.id === 'usr_citizen_pooja' ? (user.lifeScore || 780) : 780, streak: 7, badge: '🏆 Rooftop Solar Leader' },
    { rank: 2, name: 'Aarav Mehta', city: 'Palaj, Gandhinagar', points: 740, streak: 12, badge: '🥈 Youth Energy Champion' },
    { rank: 3, name: 'Rajesh Shah', city: 'Adajan, Surat', points: 690, streak: 5, badge: '🥉 Peak Shift Pioneer' },
    { rank: 4, name: 'Priya Dave', city: 'Alkapuri, Vadodara', points: 610, streak: 4, badge: '⭐ Zero-Waste Household' },
    { rank: 5, name: 'Kunal Vora', city: 'Kalawad Rd, Rajkot', points: 580, streak: 3, badge: '⭐ Water Harvesting Champion' },
    { rank: 6, name: 'Hitesh Gandhi', city: 'Kudasan, Gandhinagar', points: 520, streak: 6, badge: '⭐ EV Commuter' },
    { rank: 7, name: 'Kinjal Shah', city: 'Satellite, Ahmedabad', points: 490, streak: 4, badge: '⭐ Solar Water Heater' }
  ];

  // District rankings for Gujarat state
  const districtRankings = [
    { rank: 1, name: 'Ahmedabad Urban', citizens: 14200, points: 284000, co2AvoidedKg: 48500, badge: '🏆 Top Solar District' },
    { rank: 2, name: 'Surat Municipal', citizens: 12100, points: 241000, co2AvoidedKg: 42100, badge: '🥈 Water Conservation Leader' },
    { rank: 3, name: 'Gandhinagar Green Belt', citizens: 8400, points: 198000, co2AvoidedKg: 32800, badge: '🥇 Net-Zero Capital' },
    { rank: 4, name: 'Vadodara Central', citizens: 9800, points: 165000, co2AvoidedKg: 26400, badge: '🥉 Peak Shift Champion' },
    { rank: 5, name: 'Rajkot Municipal', citizens: 7600, points: 132000, co2AvoidedKg: 21000, badge: '⭐ Solar Pump Pioneer' },
    { rank: 6, name: 'Bhavnagar Coastal', citizens: 5400, points: 98000, co2AvoidedKg: 15600, badge: '⭐ Wind & Solar Hybrid' },
    { rank: 7, name: 'Kutch Renewable Zone', citizens: 4800, points: 89000, co2AvoidedKg: 14200, badge: '⭐ Solar Park Leader' }
  ];

  // Filter students by selected university using authoritative matcher
  const filteredStudents = verifiedStudents.filter(s => {
    if (selectedUniversityFilter === 'all') return true;
    const targetUni = universityRankings.find(u => u.shortName === selectedUniversityFilter || u.name === selectedUniversityFilter);
    if (targetUni) {
      return matchesUniversity(s.universityName, targetUni);
    }
    const fLower = selectedUniversityFilter.toLowerCase();
    const uLower = (s.universityName || '').toLowerCase();
    return uLower.includes(fLower) || fLower.includes(uLower) || uLower.includes(fLower.split(' ')[0]);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isStudentOrCampus
                ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60'
            }`}>
              {isStudentOrCampus ? <GraduationCap className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              <span>{isStudentOrCampus ? 'Campus Sustainability League' : 'Community & Social Proof'}</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isStudentOrCampus ? 'Gujarat Universities & Colleges' : 'Gujarat LiFE Champions'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {isStudentOrCampus ? 'Campus & Student Leaderboards' : 'Collective Action & Leaderboards'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isStudentOrCampus 
              ? 'Track university squad benchmarks, celebrate verified student eco-actions, and power inter-college sustainability rankings.'
              : 'Track district benchmarks, celebrate verified citizen milestones, and build collaborative social accountability.'}
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors self-start flex items-center gap-1.5 ${
            isStudentOrCampus ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isStudentOrCampus ? 'Post Student Eco-Action' : 'Share Sustainable Action'}</span>
        </button>
      </div>

      {/* Active Campaign Sprint Card */}
      <div className={`p-5 rounded-2xl border ${
        isStudentOrCampus
          ? 'border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 to-emerald-50/40 dark:from-blue-950/20 dark:to-slate-900'
          : 'border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
              isStudentOrCampus ? 'text-blue-800 dark:text-blue-400' : 'text-emerald-800 dark:text-emerald-400'
            }`}>
              {isStudentOrCampus ? 'Active Inter-University Sprint' : 'Active Community Goal'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isStudentOrCampus 
                ? 'Gujarat Universities 200,000 kg CO₂ Avoidance Sprint'
                : 'Gujarat Mission LiFE: 200,000 kg CO₂ Avoided Sprint'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {isStudentOrCampus 
                ? 'Collective student challenge tracking hostel AC efficiency at 26°C, zero dining waste, and off-peak laundry shifts across Gujarat campuses.'
                : 'Collective sprint tracking residential cooling, peak load reduction, and rooftop solar adoption.'}
            </p>
          </div>
          <span className={`text-2xl font-extrabold font-mono self-start sm:self-auto ${
            isStudentOrCampus ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'
          }`}>
            {progressPercent}%
          </span>
        </div>

        <div className="mt-4">
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isStudentOrCampus
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
            <span>{(community.co2SavedKg || 142854).toLocaleString('en-IN')} kg avoided</span>
            <span>Target: {(community.co2TargetKg || 200000).toLocaleString('en-IN')} kg</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard & Social Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Rankings */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isStudentOrCampus ? 'Campus Rankings' : 'Regional Leaderboards'}
            </h3>
            
            {/* Toggle Tabs */}
            {isStudentOrCampus ? (
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setLeaderboardTab('campuses')}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                    leaderboardTab === 'campuses' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Universities
                </button>
                <button
                  onClick={() => setLeaderboardTab('students')}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                    leaderboardTab === 'students' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Top Students
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setLeaderboardTab('citizens')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    leaderboardTab === 'citizens' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Citizens
                </button>
                <button
                  onClick={() => setLeaderboardTab('districts')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    leaderboardTab === 'districts' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Districts
                </button>
                <button
                  onClick={() => setLeaderboardTab('campuses')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    leaderboardTab === 'campuses' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Campuses
                </button>
              </div>
            )}
          </div>

          {/* CITIZENS LEADERBOARD (for Citizens) */}
          {!isStudentOrCampus && leaderboardTab === 'citizens' && (
            <div className="space-y-2.5">
              {citizenRankings.map((c) => {
                const isCurrentUser = c.name === user.name || (user.id === 'usr_citizen_pooja' && c.rank === 1);
                return (
                  <div 
                    key={c.rank}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs border transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                        c.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        c.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                        c.rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                        'text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {c.rank}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{c.name}</span>
                          {isCurrentUser && <span className="text-[10px] text-emerald-600 font-bold">(You)</span>}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                          <span>{c.city}</span>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400">{c.badge}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">{c.points.toLocaleString()} pts</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.streak}d streak 🔥</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DISTRICTS LEADERBOARD (for Citizens) */}
          {!isStudentOrCampus && leaderboardTab === 'districts' && (
            <div className="space-y-2.5">
              {districtRankings.map((d) => (
                <div 
                  key={d.rank}
                  className={`p-3 rounded-xl flex items-center justify-between text-xs border transition-colors ${
                    d.rank === 1
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                      d.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      d.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                      d.rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                      'text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {d.rank}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">{d.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{d.citizens.toLocaleString()} citizens • {d.badge}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">{d.points.toLocaleString()} pts</span>
                    <span className="text-[10px] text-slate-400 font-mono">-{d.co2AvoidedKg.toLocaleString()} kg CO₂</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 1: UNIVERSITIES LEADERBOARD */}
          {leaderboardTab === 'campuses' && (
            <div className="space-y-3">
              {universityRankings.map((item) => {
                const userUni = user.universityName || user.campusName || user.university || '';
                const isUserSquad = matchesUniversity(userUni, item);

                return (
                  <div 
                    key={item.id || item.rank} 
                    className={`p-3.5 rounded-xl text-xs border transition-all ${
                      isUserSquad
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs ring-1 ring-blue-400/30'
                        : item.rank === 1
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                          item.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                          item.rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                          'text-slate-400 bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {item.rank}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white truncate">{item.name}</span>
                            {isUserSquad && (
                              <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full font-sans">
                                🏅 Your Squad
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <span>{item.city}</span>
                            <span>•</span>
                            <span>Leader: {item.leader}</span>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400">{item.badge}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold block">{item.points.toLocaleString()} pts</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">-{item.co2AvoidedKg.toLocaleString()} kg CO₂</span>
                      </div>
                    </div>

                    {/* Interactive Roster Pill */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {item.students.toLocaleString()} active student volunteers
                      </span>
                      {isStudentOrCampus ? (
                        <button
                          onClick={() => {
                            setSelectedUniversityFilter(item.shortName);
                            setLeaderboardTab('students');
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>View Students Roster ({item.verifiedRosterCount || item.students})</span>
                          <span>→</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Collegiate LiFE League
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TOP STUDENTS ASSOCIATED TO UNIVERSITY (for Students & Leaders) */}
          {isStudentOrCampus && leaderboardTab === 'students' && (
            <div className="space-y-3">
              {/* University Selector for Student Leaderboard */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold">Campus Squad:</span>
                <select
                  value={selectedUniversityFilter}
                  onChange={(e) => setSelectedUniversityFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none max-w-[230px] truncate"
                >
                  <option value="all">All Gujarat Campuses ({verifiedStudents.length} Students)</option>
                  {universityRankings.map((u) => (
                    <option key={u.id} value={u.shortName}>
                      {u.shortName} ({u.verifiedRosterCount || 0} verified)
                    </option>
                  ))}
                </select>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No Verified Students in {selectedUniversityFilter} yet
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Students can submit their institutional student ID through the Student Sustainability Portal for verification by their Campus Youth Leader.
                  </p>
                  <button
                    onClick={() => setSelectedUniversityFilter('all')}
                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View All Gujarat Campuses →
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredStudents.map((stu, idx) => {
                    const rank = idx + 1;
                    const isUser = stu.studentId === user.id || stu.studentName === user.name;
                    return (
                      <div
                        key={stu.id}
                        onClick={() => setSelectedStudentModal(stu)}
                        className={`p-3 rounded-xl flex items-center justify-between text-xs border transition-all cursor-pointer group hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xs ${
                          isUser
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                        title="Click to view full student environmental dossier"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                            rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                            rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                            'text-slate-400 bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {rank}
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {stu.studentName}
                              </span>
                              {isUser && <span className="text-[10px] text-emerald-600 font-bold">(You)</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{stu.collegeId}</span>
                              <span>•</span>
                              <span className="truncate">{stu.residenceType}</span>
                              <span>•</span>
                              <span className="truncate text-slate-500">{stu.universityName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex items-center gap-3">
                          <div>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">+{stu.totalPoints} pts</span>
                            <span className="text-[10px] text-slate-400 font-mono">-{stu.co2SavedKg} kg CO₂</span>
                          </div>
                          <span className="hidden sm:inline text-blue-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Actions Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{isStudentOrCampus ? 'Campus & Student Actions Feed' : 'Citizen Actions Feed'}</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {isStudentOrCampus 
                  ? 'Verified student eco-actions & photographic evidence'
                  : 'Citizen reported sustainable practices & photo uploads'}
              </p>
            </div>
            <span className={`text-[11px] font-mono font-bold flex items-center gap-1 ${
              isStudentOrCampus ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isStudentOrCampus ? 'Verified Student Evidence' : 'Peer Validation'}</span>
            </span>
          </div>

          <div className="space-y-4">
            {feedPosts.map((post) => {
              const hasLiked = post.likedBy?.includes(user.id);
              return (
                <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  
                  {/* Post Image */}
                  {post.photoUrl && (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <img
                        src={post.photoUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isStudentOrCampus ? 'Student Photo Evidence' : 'Citizen Photo Evidence'}</span>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${post.avatarColor || (isStudentOrCampus ? 'bg-blue-600' : 'bg-emerald-600')} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                          {isStudentOrCampus ? '🎓' : (post.authorName ? post.authorName[0] : '🌱')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">{post.authorName}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                              isStudentOrCampus 
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                            }`}>
                              {post.authorCity}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{post.authorDetails || (isStudentOrCampus ? 'Campus Volunteer' : 'Gujarat Resident')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                        <span>-{post.co2SavedKg} kg CO₂</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{post.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{post.content}</p>

                    {/* Bottom Interactions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          hasLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes || 0} Kudos</span>
                      </button>

                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Theme: {post.theme}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclosures note */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>{BRANDING.disclaimers.verification} All impact benchmarks and CO₂ metrics are audited under authoritative Gujarat Energy Development Agency (GEDA) rules.</span>
      </div>

      {/* Share New Action Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
              isStudentOrCampus
                ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {isStudentOrCampus ? 'Student Eco-Feed' : 'Citizen LiFE Feed'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {isStudentOrCampus ? 'Share Student Sustainability Practice' : 'Share Household Sustainable Action'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {isStudentOrCampus 
                ? 'Inspire your university peers by logging your habit with photographic evidence.'
                : 'Inspire citizens across Gujarat by logging your residential sustainable habit.'}
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Action Title <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isStudentOrCampus ? "e.g. Set hostel AC to 26°C with corridor window shut" : "e.g. Switched to 3.2 kW Rooftop Solar under PM Surya Ghar"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-medium ${
                    isStudentOrCampus ? 'focus:border-blue-500' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              {isStudentOrCampus ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Student Roll / College ID <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23BCE094"
                      value={newRollNo}
                      onChange={(e) => setNewRollNo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Hostel / Campus Housing <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hall 5 (Sabarmati)"
                      value={newHostel}
                      onChange={(e) => setNewHostel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Your Locality & City <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bodakdev, SG Highway, Ahmedabad"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  LiFE Theme <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer font-medium ${
                    isStudentOrCampus ? 'focus:border-blue-500' : 'focus:border-emerald-500'
                  }`}
                >
                  <option value="energy">Save Energy (AC setpoint / Standby Loads / Rooftop Solar)</option>
                  <option value="water">Save Water (Rainwater Harvesting / Tap Aerator)</option>
                  <option value="food">Sustainable Food Systems (Millet Diet / Clean Plate)</option>
                  <option value="plastic">Say No to Single-Use Plastic (Cloth Tote Bags)</option>
                  <option value="lifestyle">Healthy Lifestyles (Cycling / EV Commute)</option>
                  <option value="ewaste">Reduce E-Waste (Cable & Battery Recycling)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Details & Impact <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={isStudentOrCampus ? "Describe your action e.g. Coordinated with hostel wing mates to turn off corridor lights after 11 PM..." : "Describe your household action e.g. Replaced incandescent bulbs with BEE 5-star LEDs and set AC thermostat to 26°C..."}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-medium ${
                    isStudentOrCampus ? 'focus:border-blue-500' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Photo Evidence <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-800/40">
                  {previewUrl ? (
                    <div className="flex items-center justify-between gap-3">
                      <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                      <span className="text-xs text-emerald-600 font-semibold">Photo Attached</span>
                      <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-xs text-rose-500 underline cursor-pointer">Remove</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                      <Camera className="w-4 h-4" />
                      <span>Upload Evidence Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    isStudentOrCampus ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPosting ? 'Posting...' : 'Post Action (+25 pts)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE LIVE STUDENT PROFILE & AUDIT MODAL */}
      <StudentProfileModal
        student={selectedStudentModal}
        isOpen={!!selectedStudentModal}
        onClose={() => setSelectedStudentModal(null)}
        isLeader={userRole === 'campus_leader'}
      />
    </div>
  );
}
