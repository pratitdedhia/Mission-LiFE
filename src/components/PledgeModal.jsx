import React, { useRef, useState } from 'react';
import { X, Award, Download, CheckCircle, ShieldCheck, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PledgeModal({ isOpen, onClose, user, onPledgeSigned }) {
  const [pledged, setPledged] = useState(user.pledgeSigned || false);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const handleTakePledge = () => {
    setPledged(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onPledgeSigned) {
      onPledgeSigned({
        pledgeSigned: true,
        pledgeDate: new Date().toISOString().split('T')[0],
        certificateId: `GEDA-LIFE-2026-${(user.district || 'GUJ').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Borders
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, 1116, 716);

    // Header Tag
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText('GUJARAT ENERGY DEVELOPMENT AGENCY (GEDA)', 600, 110);

    ctx.font = '700 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MISSION LiFE CITIZEN PLEDGE', 600, 175);

    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Lifestyle for Environment • Government of Gujarat Initiative', 600, 215);

    // Divider Line
    ctx.strokeStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(350, 245);
    ctx.lineTo(850, 245);
    ctx.stroke();

    // Body
    ctx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#d4d4d8';
    ctx.fillText('This certificate of environmental stewardship is proudly awarded to', 600, 300);

    // Citizen Name
    ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#34d399';
    ctx.fillText(user.name || 'Citizen', 600, 375);

    // City & Pledge Text
    ctx.font = '400 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#e4e4e7';
    ctx.fillText(`Resident of ${user.city || user.district || 'Gujarat'}, India`, 600, 425);

    ctx.font = '400 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#a1a1aa';
    const pledgeText1 = "For committing to sustainable living: conserving electricity, reducing peak grid loads,";
    const pledgeText2 = "eliminating single-use plastics, conserving water, and fostering circular green habits under Mission LiFE.";
    ctx.fillText(pledgeText1, 600, 495);
    ctx.fillText(pledgeText2, 600, 525);

    // Footer Info
    const certId = user.certificateId || `GEDA-LIFE-2026-AHM-8821`;
    const dateStr = user.pledgeDate || new Date().toISOString().split('T')[0];

    ctx.textAlign = 'left';
    ctx.font = '600 14px monospace';
    ctx.fillStyle = '#71717a';
    ctx.fillText(`CERTIFICATE ID: ${certId}`, 100, 680);
    ctx.fillText(`ISSUED: ${dateStr}`, 100, 710);

    ctx.textAlign = 'right';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#10b981';
    ctx.fillText("Director, GEDA", 1100, 680);
    ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#71717a';
    ctx.fillText("Gujarat Energy Development Agency", 1100, 705);

    // Download trigger
    const link = document.createElement('a');
    link.download = `Mission_LiFE_Certificate_${(user.name || 'Citizen').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const certId = user.certificateId || `GEDA-LIFE-2026-AHM-8821`;
  const dateStr = user.pledgeDate || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121316] border border-[#2a2c34] rounded-2xl p-6 sm:p-8 shadow-2xl my-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!pledged ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded">
              GEDA Mission LiFE Pledge
            </span>
            <h2 className="text-2xl font-bold text-zinc-100 mt-3">
              Take the Citizen LiFE Pledge
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Join over 24,000 citizens in Gujarat committing to mindful consumption and climate responsibility.
            </p>

            {/* Pledge Card Text */}
            <div className="my-6 p-5 bg-[#17181c] border border-[#26282f] rounded-xl text-left text-xs sm:text-sm text-zinc-300 space-y-2.5 leading-relaxed">
              <p className="font-semibold text-emerald-300">"I pledge to make environmental sustainability my daily lifestyle by:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                <li>Conserving electricity and setting ACs to 26°C or higher</li>
                <li>Shifting heavy appliance loads to green off-peak hours</li>
                <li>Refusing single-use plastic and carrying reusable bags</li>
                <li>Segregating household waste at source into wet and dry</li>
                <li>Conserving water and promoting rooftop solar adoption"</li>
              </ul>
            </div>

            <button
              onClick={handleTakePledge}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg cursor-pointer inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>I Solemnly Take the Mission LiFE Pledge</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#22242a] mb-5">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Verified Stewardship</span>
                <h3 className="text-lg font-bold text-zinc-100">Official Mission LiFE Certificate</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="relative p-6 sm:p-8 bg-[#0c0d10] border-2 border-emerald-600/40 rounded-xl text-center shadow-inner overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
                GUJARAT ENERGY DEVELOPMENT AGENCY
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
                MISSION LiFE CERTIFICATE
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Lifestyle for Environment • Government of Gujarat</p>

              <div className="my-6">
                <p className="text-xs text-zinc-400">Awarded to</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                  {user.name}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Resident of {user.city || user.district || 'Gujarat'}, India
                </p>
              </div>

              <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed border-t border-b border-zinc-800/80 py-3">
                For active commitment to domestic energy conservation, single-use plastic elimination, water security, and sustainable living under Mission LiFE.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
                <div className="text-left">
                  <div>ID: {certId}</div>
                  <div>DATE: {dateStr}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold font-sans">Director, GEDA</div>
                  <div className="text-[10px]">Verified Digital Credential</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

