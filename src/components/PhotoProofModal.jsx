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
    if (!selectedFile) {
      setError("Photo proof is mandatory to verify habit execution and claim points.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const uploadResult = await uploadProofImage(selectedFile, user.id);

      onProofConfirmed({
        missionId: mission.id,
        points: mission.points,
        co2Kg: mission.co2Kg,
        proofData: {
          url: uploadResult?.url || URL.createObjectURL(selectedFile),
          isCloudStorage: !!uploadResult?.isCloudStorage,
          notes: notes,
          userName: user.name,
          userCity: user.locality ? `${user.locality}, ${user.city || 'Gujarat'}` : (user.city || 'Gujarat'),
          theme: mission.theme,
          title: mission.title
        }
      });

      setUploading(false);
      onClose();
    } catch (err) {
      console.error("Proof confirmation error:", err);
      setUploading(false);
      setError("Failed to upload proof. Please retry.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
            Citizen Action Verification
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {mission.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {mission.description}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Dropzone / Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Photo Evidence (Stored in Firebase Storage)
            </label>

            {previewUrl ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 group">
                <img 
                  src={previewUrl} 
                  alt="Proof preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-[11px] font-medium text-white">
                  Photo loaded • Ready to sync
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-4 text-center">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Click to choose or take photo evidence
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  e.g., photo of 26°C AC display, cloth shopping bag, or segregated bins (Max 5MB)
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Habit Note / Comment (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Set thermostat to 26°C with fan speed 2, saved estimated 1.2 units!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Reward Summary */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">Award Upon Verification:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">+{mission.points} LiFE+ Pts</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700 dark:text-slate-200 font-mono">-{mission.co2Kg} kg CO₂</span>
            </div>
          </div>

          {/* Mandatory Photo Proof Guidance */}
          {!selectedFile && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Select or capture photo evidence to enable verification and claim points.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
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
