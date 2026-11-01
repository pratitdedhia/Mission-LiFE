import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { fetchUnifiedInsights } from '../../src/services/analyticsService';
import InsightsView from '../../src/components/InsightsView';

describe('Unified Multi-Role Insights Engine', () => {
  beforeAll(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        key: (i: number) => Object.keys(store)[i] || null,
        length: 0
      } as any;
    }
  });

  it('Citizen insights: provides electricity consumption, baseline savings, and enforces Watts vs kWh separation', async () => {
    const user = {
      id: 'usr_citizen_pooja',
      name: 'Pooja Patel',
      role: 'citizen',
      city: 'Ahmedabad',
      locality: 'Navrangpura',
      lifeScore: 320,
      baselineDailyKwh: 8.5
    };

    const res = await fetchUnifiedInsights({
      user,
      timeRange: 'today',
      interval: 'hourly',
      district: 'Ahmedabad'
    });

    expect(res.role).toBe('citizen');
    expect(res.summary).toBeDefined();
    expect(res.summary.expectedBaselineKwh).toBeDefined();
    expect(res.summary.baselineRule).toBe('2026.1-SAVINGS');

    // Instantaneous Watts vs kWh separation verification
    expect(res.telemetry).toBeDefined();
    expect(res.telemetry.instantaneous_watts).toBeDefined();
    expect(typeof res.telemetry.instantaneous_watts).toBe('number');
    expect(res.summary.totalEnergyKwh).toBeDefined();
    expect(typeof res.summary.totalEnergyKwh).toBe('number');

    // Real citizen account is not simulated
    expect(res.telemetry.is_simulated).toBe(false);

    // Time series must be hourly for 'today'
    expect(res.timeSeries).toBeDefined();
    expect(res.timeSeries.length).toBeGreaterThan(0);
    expect(res.timeSeries[0]).toHaveProperty('label');
    expect(res.timeSeries[0]).toHaveProperty('energyKwh');
  });

  it('Simulated Wokwi meter tagging: user_12345 correctly flagged as simulated', async () => {
    const wokwiUser = {
      id: 'user_12345',
      name: 'Wokwi Simulator',
      role: 'citizen'
    };

    const res = await fetchUnifiedInsights({
      user: wokwiUser,
      timeRange: 'today',
      interval: 'hourly',
      district: 'Ahmedabad'
    });

    expect(res.telemetry.is_simulated).toBe(true);
    expect(res.telemetry.source_label).toContain('Simulated');
  });

  it('Forecasting threshold: displays insufficient data message when history is less than 7 days', async () => {
    const user = {
      id: 'usr_citizen_pooja',
      name: 'Pooja Patel',
      role: 'citizen'
    };

    const res = await fetchUnifiedInsights({
      user,
      timeRange: 'today',
      interval: 'hourly',
      district: 'Ahmedabad'
    });

    expect(res.forecast).toBeDefined();
    expect(res.forecast.status).toBe('insufficient_history');
    expect(res.forecast.message).toContain('Requires at least 7 active monitoring days');
    expect(res.forecast.projectedKwh).toBeNull();
  });

  it('Student insights: includes campus contribution and challenge metrics without privacy leaks', async () => {
    const studentUser = {
      id: 'usr_student_priyan',
      name: 'Priyan Patel',
      role: 'student',
      universityName: 'IIT Gandhinagar',
      department: 'Computer Science',
      lifeScore: 410
    };

    const res = await fetchUnifiedInsights({
      user: studentUser,
      timeRange: '7d',
      interval: 'daily',
      district: 'Gandhinagar'
    });

    expect(res.role).toBe('student');
    expect(res.studentData).toBeDefined();
    expect(res.studentData.personal).toBeDefined();
    expect(res.studentData.personal.actionsCount).toBeGreaterThanOrEqual(0);
    expect(res.studentData.campus.universityName).toBe('IIT Gandhinagar');
    expect(res.timeSeries.length).toBe(7);
  });

  it('Campus Leader insights: aggregates departmental stats while protecting individual student roll numbers', async () => {
    const leaderUser = {
      id: 'usr_leader_aarav',
      name: 'Aarav Mehta',
      role: 'campus_leader',
      universityName: 'IIT Gandhinagar'
    };

    const res = await fetchUnifiedInsights({
      user: leaderUser,
      timeRange: '30d',
      interval: 'weekly',
      district: 'Gandhinagar'
    });

    expect(res.role).toBe('campus_leader');
    expect(res.campusLeaderData).toBeDefined();
    expect(res.campusLeaderData.totalVerifiedCount).toBeGreaterThan(0);

    // Verify privacy safety: no collegeId or student email in comparison list
    res.campusLeaderData.studentComparisons.forEach((student: any) => {
      expect(student).not.toHaveProperty('collegeId');
      expect(student).not.toHaveProperty('studentEmail');
      expect(student).not.toHaveProperty('idCardPhotoUrl');
    });
  });

  it('Solar Partner insights: renders 6-stage rooftop pipeline and marks missing milestones honestly', async () => {
    const vendorUser = {
      id: 'usr_vendor_rajesh',
      name: 'Rajesh Shah',
      role: 'solar_vendor',
      companyName: 'Surya Urja Solutions Gujarat'
    };

    const res = await fetchUnifiedInsights({
      user: vendorUser,
      timeRange: '30d',
      interval: 'weekly',
      district: 'Ahmedabad'
    });

    expect(res.role).toBe('solar_vendor');
    expect(res.solarVendorData).toBeDefined();
    expect(res.solarVendorData.funnel).toBeDefined();
    expect(res.solarVendorData.funnel.length).toBe(6);

    // Check that stage 4 (Confirmed Purchases) is handled honestly
    const purchaseStage = res.solarVendorData.funnel.find((f: any) => f.stage.includes('Purchases'));
    expect(purchaseStage).toBeDefined();
    expect(purchaseStage.count).toBe(0);
    expect(purchaseStage.status).toBe('pending_recording');
    expect(purchaseStage.label).toBe('Not tracked yet');
  });

  it('State Admin insights: aggregates cross-role statewide energy impact and scheme targets', async () => {
    const adminUser = {
      id: 'usr_admin_neha',
      name: 'Dr. Neha Joshi',
      role: 'admin',
      department: 'Directorate of Energy Conservation'
    };

    const res = await fetchUnifiedInsights({
      user: adminUser,
      timeRange: '12m',
      interval: 'monthly',
      district: 'all'
    });

    expect(res.role).toBe('admin');
    expect(res.adminData).toBeDefined();
    expect(res.adminData.statewide).toBeDefined();
    expect(res.adminData.statewide.totalSolarKw).toBeGreaterThan(0);
    expect(res.timeSeries.length).toBe(12);
  });

  it('Component rendering: renders InsightsView for Citizen without throwing', () => {
    const html = renderToString(React.createElement(InsightsView, { user: { role: 'citizen', name: 'Pooja' } }));
    expect(html).toContain('Citizen Energy');
    expect(html).toContain('Consumed Energy');
  });

  it('Component rendering: renders InsightsView for Student without throwing', () => {
    const html = renderToString(React.createElement(InsightsView, { user: { role: 'student', name: 'Priyan' } }));
    expect(html).toContain('Student');
    expect(html).toContain('Campus Standing');
  });

  it('Component rendering: renders InsightsView for Campus Leader without throwing', () => {
    const html = renderToString(React.createElement(InsightsView, { user: { role: 'campus_leader', name: 'Aarav' } }));
    expect(html).toContain('Collegiate Squad');
    expect(html).toContain('Verified Eco-Students');
  });

  it('Component rendering: renders InsightsView for Solar Partner without throwing', () => {
    const html = renderToString(React.createElement(InsightsView, { user: { role: 'solar_vendor', name: 'Rajesh' } }));
    expect(html).toContain('Solar Rooftop');
    expect(html).toContain('Pipeline Volume');
  });

  it('Component rendering: renders InsightsView for State Admin without throwing', () => {
    const html = renderToString(React.createElement(InsightsView, { user: { role: 'admin', name: 'Dr. Neha' } }));
    expect(html).toContain('Gujarat State Department Master Insights');
    expect(html).toContain('Statewide Sinks');
  });
});
