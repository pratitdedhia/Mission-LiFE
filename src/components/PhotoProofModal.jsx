import React, { useState } from 'react';
import { X, Upload, Camera, Check, AlertCircle } from 'lucide-react';
import { uploadProofImage } from '../services/storageService';

export default function PhotoProofModal({ 
  isOpen, 
  onClose, 
  mission, 
  user, 
  onProofConfirmed 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !mission) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5 MB. Please select a smaller photo.");
        return;
      }
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      let uploadResult = null;
      if (selectedFile) {
        uploadResult = await uploadProofImage(selectedFile, user.id);
      }

      onProofConfirmed({
        missionId: mission.id,
        points: mission.points,
        co2Kg: mission.co2Kg,
        proofData: uploadResult ? {
          url: uploadResult.url,
          isCloudStorage: uploadResult.isCloudStorage,
          notes: notes,
          userName: user.name,
          userCity: user.city,
          theme: mission.theme,
          title: mission.title
        } : null
      });

      setUploading(false);
      onClose();
    } catch (err) {
      console.error("Proof confirmation error:", err);
      setUploading(false);
      setError("Failed to record proof. Proceeding with offline verification.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#121316] border border-[#26282f] rounded-2xl p-6 sm:p-7 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            Mission Verification
          </span>
          <h2 className="text-xl font-bold text-zinc-100 mt-2">
            {mission.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {mission.description}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Dropzone / Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Photo Evidence (Firebase Storage)
            </label>

            {previewUrl ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#2e313a] bg-zinc-900 group">
                <img 
                  src={previewUrl} 
                  alt="Proof preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-zinc-200 hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                  Photo loaded • Ready to sync
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#2b2d35] hover:border-emerald-500/50 rounded-xl cursor-pointer bg-[#16171b] hover:bg-[#1a1c21] transition-colors p-4 text-center">
                <Camera className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-xs font-medium text-zinc-300">
                  Click to select photo evidence
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  e.g., photo of 26°C AC display, cloth bag, or segregated bin (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Citizen Note */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Habit Note / Comment (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Set thermostat to 26°C with fan at speed 2, saved 1.2 units!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Reward Summary */}
          <div className="p-3 bg-[#17181c] rounded-lg border border-[#23252a] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Award Upon Verification:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold font-mono">+{mission.points} LiFE Pts</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-mono">-{mission.co2Kg} kg CO₂</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg border border-[#2a2c33] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {uploading ? (
                <span>Syncing Evidence...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify & Claim Points</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
