"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Shield, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-100">
      {/* Navigation Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900 text-lg">Mission LiFE</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Empowering Citizen Climate Action
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.15]">
            See your impact.<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Lower your bills.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Bridge macro climate objectives with daily micro habits. Measure household carbon, take simple micro-actions, and power your neighborhood squad.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              <span>Calculate Your Baseline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/community"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-sm transition-all"
            >
              Explore Pin Code Squads
            </Link>
          </div>
        </motion.div>

        {/* 3 Value Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left"
        >
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Precise Carbon Baseline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answer 3 simple questions on your living space, electricity consumption, and daily transit to generate an instant CO₂e score.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 mb-4 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Actionable Micro-Nudges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn points and build streaks with low-effort, high-impact tasks like shifting high-draw appliances out of peak grid hours.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 mb-4 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Local Pin Code Squads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hyper-competitive individual leaderboards. Your personal savings roll up collectively into your postal code squad total.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500">
        Mission LiFE Initiative • Lifestyle for Environment • Government of India
      </footer>
    </div>
  );
}
