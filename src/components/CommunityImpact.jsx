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
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_LEADERBOARD } from '../data/initialData';
import { getCommunityFeed, createFeedPost, likeFeedPost } from '../services/firestoreService';
import { uploadProofImage } from '../services/storageService';

export default function CommunityImpact({ community, user }) {
  const [leaderboardTab, setLeaderboardTab] = useState('districts'); // 'districts' | 'campuses' | 'citizens'
  const [feedPosts, setFeedPosts] = useState([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTheme, setNewTheme] = useState('energy');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadFeed();
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
      const res = await uploadProofImage(selectedFile, user.id);
      if (res?.url) {
        photoUrl = res.url;
      }
    }

    const postObj = {
      authorName: user.name,
      authorCity: user.city || user.district || "Gujarat",
      avatarColor: "bg-emerald-600",
      theme: newTheme,
      title: newTitle,
      content: newContent,
      co2SavedKg: 2.5,
      points: 50,
      photoUrl: photoUrl,
      verified: true
    };

    const created = await createFeedPost(postObj);
    setFeedPosts(prev => [created, ...prev]);
    setIsPosting(false);
    setShowNewPostModal(false);
    setNewTitle('');
    setNewContent('');
    setSelectedFile(null);
    setPreviewUrl(null);

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const progressPercent = Math.min(
    100,
    ((community.co2SavedKg / community.co2TargetKg) * 100).toFixed(1)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Collective Action
            </span>
            <span className="text-xs font-mono text-zinc-500">Mission LiFE Gujarat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Community Impact & Social Wall
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aggregated carbon reduction across Gujarat districts, campus leaderboards, and verified citizen action stories.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Share Green Action</span>
        </button>
      </div>

      {/* 5 Big Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card-minimal p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Citizens Engaged</span>
          <span className="text-xl font-bold text-zinc-100 font-mono mt-0.5 block">
            {community.citizensCount.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400">33 Districts active</span>
        </div>

        <div className="card-minimal p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Actions Logged</span>
          <span className="text-xl font-bold text-zinc-100 font-mono mt-0.5 block">
            {community.actionsCompleted.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-zinc-500">Verified micro-tasks</span>
        </div>

        <div className="card-minimal p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase">Energy Conserved</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-amber-300 font-mono mt-0.5 block">
            {community.energySavedGWh} GWh
          </span>
          <span className="text-[10px] text-zinc-500">Demand response</span>
        </div>

        <div className="card-minimal p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">CO₂ Mitigated</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
            {(community.co2SavedKg / 1000).toFixed(1)}k kg
          </span>
          <span className="text-[10px] text-emerald-500/80">Goal: 200,000 kg</span>
        </div>

        <div className="card-minimal p-3.5 rounded-xl col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase">Water Saved</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xl font-bold text-cyan-300 font-mono mt-0.5 block">
            {community.waterSavedLitres}
          </span>
          <span className="text-[10px] text-zinc-500">Aerators & buckets</span>
        </div>
      </div>

      {/* Active Campaign Sprint Card */}
      <div className="card-minimal p-5 rounded-xl border-emerald-900/30 bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-0.5">
              Active Community Goal
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              {community.activeCampaign}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Collective sprint tracking residential cooling, peak load reduction, and rooftop solar adoption.
            </p>
          </div>
          <span className="text-xl font-extrabold text-emerald-400 font-mono self-start sm:self-auto">
            {progressPercent}%
          </span>
        </div>

        <div className="mt-4">
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
            <span>{community.co2SavedKg.toLocaleString('en-IN')} kg avoided</span>
            <span>Target: {community.co2TargetKg.toLocaleString('en-IN')} kg</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-tier Leaderboard & Social Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-Tier Leaderboards */}
        <div className="lg:col-span-5 card-minimal p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2125]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
              Green Leaderboards
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-[#17181c] rounded-md border border-[#23252a] text-[10px] font-mono">
              <button
                onClick={() => setLeaderboardTab('districts')}
                className={`px-2 py-0.5 rounded cursor-pointer ${leaderboardTab === 'districts' ? 'bg-zinc-700 text-zinc-100 font-bold' : 'text-zinc-500'}`}
              >
                Districts
              </button>
              <button
                onClick={() => setLeaderboardTab('campuses')}
                className={`px-2 py-0.5 rounded cursor-pointer ${leaderboardTab === 'campuses' ? 'bg-zinc-700 text-zinc-100 font-bold' : 'text-zinc-500'}`}
              >
                Campuses
              </button>
              <button
                onClick={() => setLeaderboardTab('citizens')}
                className={`px-2 py-0.5 rounded cursor-pointer ${leaderboardTab === 'citizens' ? 'bg-zinc-700 text-zinc-100 font-bold' : 'text-zinc-500'}`}
              >
                Citizens
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2.5">
            {leaderboardTab === 'districts' && (
              INITIAL_LEADERBOARD.districts.map((item) => (
                <div key={item.rank} className="p-3 bg-[#16171b] border border-[#22242a] rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                      item.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                      item.rank === 2 ? 'bg-zinc-400/20 text-zinc-300' :
                      item.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                      'text-zinc-500'
                    }`}>
                      {item.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-zinc-200 block">{item.name}</span>
                      <span className="text-[10px] text-zinc-500">{item.citizens} homes • {item.badge}</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">{item.points.toLocaleString()} pts</span>
                </div>
              ))
            )}

            {leaderboardTab === 'campuses' && (
              INITIAL_LEADERBOARD.campuses.map((item) => (
                <div key={item.rank} className="p-3 bg-[#16171b] border border-[#22242a] rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] text-zinc-400">
                      {item.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-zinc-200 block">{item.name}</span>
                      <span className="text-[10px] text-zinc-500">{item.members} students • {item.badge}</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">{item.points.toLocaleString()} pts</span>
                </div>
              ))
            )}

            {leaderboardTab === 'citizens' && (
              INITIAL_LEADERBOARD.citizens.map((item) => {
                const isMe = item.name.includes("You");
                return (
                  <div 
                    key={item.rank} 
                    className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
                      isMe 
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' 
                        : 'bg-[#16171b] border-[#22242a] text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] text-zinc-400">
                        {item.rank}
                      </span>
                      <div>
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[10px] text-zinc-500">{item.city} • {item.streak}d streak • {item.badge}</span>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">{item.points} pts</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Community Social Wall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2125]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
              Verified Citizen Actions Feed
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">Live Peer Validation</span>
          </div>

          <div className="space-y-4">
            {feedPosts.map((post) => {
              const hasLiked = post.likedBy?.includes(user.id);
              return (
                <div key={post.id} className="card-minimal rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
                  {/* Post Image */}
                  {post.photoUrl && (
                    <div className="w-full h-48 bg-zinc-900 overflow-hidden relative">
                      <img 
                        src={post.photoUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Proof</span>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${post.avatarColor || 'bg-zinc-700'} text-white flex items-center justify-center text-xs font-bold`}>
                          {post.authorName[0]}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-zinc-100 block">{post.authorName}</span>
                          <span className="text-[10px] text-zinc-500">{post.authorCity} • {post.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                        <span>-{post.co2SavedKg} kg CO₂</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 mt-2">{post.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{post.content}</p>

                    {/* Bottom Interactions */}
                    <div className="mt-4 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                          hasLiked 
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' 
                            : 'bg-[#16171b] border-[#24262c] text-zinc-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span>{post.likes || 0} Kudos</span>
                      </button>

                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
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

      {/* Share New Action Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#121316] border border-[#26282f] rounded-2xl p-6 shadow-2xl">
            <button 
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Community Feed
            </span>
            <h3 className="text-lg font-bold text-zinc-100 mt-2">
              Share Your Mission LiFE Action
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspire fellow citizens in Gujarat by sharing your sustainable daily practice.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switched entire kitchen to LED & installed low-flow tap aerator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Theme</label>
                <select
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Description / Reflection</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share details of how you did it and the noticeable difference..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Photo Proof (Optional)</label>
                {previewUrl ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-800">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute top-2 right-2 p-1 rounded bg-black/70 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-[#2a2c33] hover:border-emerald-500/50 rounded-lg cursor-pointer bg-[#16171b] text-xs text-zinc-400">
                    <Camera className="w-4 h-4 text-zinc-500" />
                    <span>Upload photo proof</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
              >
                <span>{isPosting ? 'Publishing to Cloud...' : 'Publish Action to Community'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
