import React, { useState, useEffect } from 'react';
import {
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
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { getStateLeaderboard } from '../repositories/leaderboardRepository';
import { getCommunityFeed, createFeedPost, likeFeedPost } from '../services/firestoreService';
import { uploadProofImage } from '../services/storageService';
import { BRANDING } from '../config/branding';

export default function CommunityImpact({ community = {}, user = {} }) {
  const { t } = useTranslation();
  const [leaderboardTab, setLeaderboardTab] = useState('citizens'); // 'citizens' | 'districts' | 'campuses'
  const [feedPosts, setFeedPosts] = useState([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [stateLeaderboard, setStateLeaderboard] = useState(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTheme, setNewTheme] = useState('energy');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadFeed();
    getStateLeaderboard().then(data => setStateLeaderboard(data));
  }, []);

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
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPosting(true);
    let photoUrl = "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80";

    if (selectedFile) {
      const res = await uploadProofImage(selectedFile, user.id || 'usr_anonymous');
      if (res?.url) {
        photoUrl = res.url;
      }
    }

    const postObj = {
      authorName: user.name || 'Gujarat Citizen',
      authorCity: user.locality ? `${user.locality}, ${user.city || 'Gujarat'}` : (user.city || "Gujarat"),
      avatarColor: "bg-emerald-600",
      theme: newTheme,
      title: newTitle,
      content: newContent,
      co2SavedKg: 2.5,
      points: 50,
      photoUrl: photoUrl,
      verified: true,
      verificationType: "Citizen photo-submitted"
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
    Math.round(((community.co2SavedKg || 12400) / (community.co2TargetKg || 25000)) * 100)
  );

  const districtRankings = [
    { rank: 1, name: 'Ahmedabad Urban', citizens: 1420, points: 284000, badge: '🏆 Top Solar District' },
    { rank: 2, name: 'Surat Municipal', citizens: 1190, points: 241000, badge: '🥈 Water Conservation Leader' },
    { rank: 3, name: 'Vadodara Central', citizens: 980, points: 198000, badge: '🥉 Peak Shift Champion' },
    { rank: 4, name: 'Gandhinagar Green Belt', citizens: 760, points: 165000, badge: '⭐ 100% LED Saturation' },
    { rank: 5, name: 'Rajkot West', citizens: 640, points: 132000, badge: '⭐ E-Waste Pioneer' }
  ];

  const campusRankings = [
    { rank: 1, name: 'IIT Gandhinagar Green Club', members: 320, points: 84000, badge: '🏅 Net-Zero Campus' },
    { rank: 2, name: 'SVNIT Surat Eco-Warriors', members: 270, points: 71000, badge: '🥈 Solar Innovation' },
    { rank: 3, name: 'MS University Vadodara', members: 230, points: 59000, badge: '🥉 Plastic Free Zone' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              Community & Social Proof
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gujarat LiFE Champions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {t('community.header', 'Collective Action & Leaderboards')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track district benchmarks, celebrate verified citizen milestones, and build collaborative social accountability.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors self-start flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Share Sustainable Action</span>
        </button>
      </div>

      {/* Active Campaign Sprint Card */}
      <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-0.5">
              Active Community Goal
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {community.activeCampaign || 'Ahmedabad 10,000 Homes AC at 24°C Sprint'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Collective sprint tracking residential cooling, peak load reduction, and rooftop solar adoption.
            </p>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono self-start sm:self-auto">
            {progressPercent}%
          </span>
        </div>

        <div className="mt-4">
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
            <span>{(community.co2SavedKg || 12400).toLocaleString('en-IN')} kg avoided</span>
            <span>Target: {(community.co2TargetKg || 25000).toLocaleString('en-IN')} kg</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-tier Leaderboard & Social Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-Tier Leaderboards */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Regional Leaderboards
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
              <button
                onClick={() => setLeaderboardTab('citizens')}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${leaderboardTab === 'citizens' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
              >
                Citizens
              </button>
              <button
                onClick={() => setLeaderboardTab('districts')}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${leaderboardTab === 'districts' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
              >
                Districts
              </button>
              <button
                onClick={() => setLeaderboardTab('campuses')}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${leaderboardTab === 'campuses' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
              >
                Campuses
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2.5">
            {leaderboardTab === 'citizens' && (
              (stateLeaderboard?.rankings || []).map((item) => {
                const isMe = item.displayName.includes(user.name || '') || item.uid === user.id;
                return (
                  <div
                    key={item.uid}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs border transition-colors ${isMe
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${item.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                            item.rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                              'text-slate-400'
                        }`}>
                        {item.rank}
                      </span>
                      <div>
                        <span className="font-semibold block">{item.displayName} {isMe && '(You)'}</span>
                        <span className="text-[10px] text-slate-400">{item.district} • {item.streak}d streak</span>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.points.toLocaleString()} pts</span>
                  </div>
                );
              })
            )}

            {leaderboardTab === 'districts' && (
              districtRankings.map((item) => (
                <div key={item.rank} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${item.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                          item.rank === 3 ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-600' :
                            'text-slate-400'
                      }`}>
                      {item.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.citizens} homes • {item.badge}</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.points.toLocaleString()} pts</span>
                </div>
              ))
            )}

            {leaderboardTab === 'campuses' && (
              campusRankings.map((item) => (
                <div key={item.rank} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] text-slate-400">
                      {item.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.members} students • {item.badge}</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.points.toLocaleString()} pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Community Social Wall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Citizen Actions Feed
              </h3>
              <p className="text-[10px] text-slate-400">Citizen-reported sustainable practices & photo uploads</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Peer Validation</span>
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
                        <span>Citizen Photo Evidence</span>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${post.avatarColor || 'bg-emerald-600'} text-white flex items-center justify-center text-xs font-bold`}>
                          {post.authorName ? post.authorName[0] : 'C'}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block">{post.authorName}</span>
                          <span className="text-[10px] text-slate-400">{post.authorCity} • {post.timestamp}</span>
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
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${hasLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes || 0} Kudos</span>
                      </button>

                      <span className="text-[10px] font-bold text-slate-400 uppercase">
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
        <span>{BRANDING.disclaimers.verification} {BRANDING.disclaimers.communityData}</span>
      </div>

      {/* Share New Action Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Citizen Social Feed
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Share Your Sustainability Practice
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Inspire fellow citizens in {user.city || 'Gujarat'} by sharing a photo of your sustainable habit.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switched entire kitchen to LED & installed low-flow tap aerator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Theme</label>
                <select
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="energy">Save Energy</option>
                  <option value="water">Save Water</option>
                  <option value="plastic">Reduce Single-Use Plastic</option>
                  <option value="waste">Waste & Composting</option>
                  <option value="lifestyle">Green Mobility & Health</option>
                  <option value="ewaste">E-Waste Recycled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description / Reflection</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share details of how you did it and the noticeable difference..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Photo Evidence (Firebase Storage)</label>
                {previewUrl ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>Upload photo evidence</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>{isPosting ? 'Publishing to Firebase...' : 'Publish Action to Community'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}