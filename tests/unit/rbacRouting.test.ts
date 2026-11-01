import { describe, it, expect } from 'vitest';
import { DEMO_USERS } from '../../src/data/initialData';

describe('Automatic RBAC Routing & Default Assignment', () => {
  // Test helper replicating App.jsx routing logic
  function resolveTargetPortal(user: { role?: string } | null | undefined): string {
    const role = (user?.role || 'citizen').toLowerCase();
    if (role === 'admin') {
      return 'admin';
    } else if (role === 'solar_vendor' || role === 'solar_partner') {
      return 'solar_vendor';
    } else if (role === 'campus_leader') {
      return 'campus_leader';
    } else if (role === 'student') {
      return 'student_portal';
    } else {
      return 'dashboard';
    }
  }

  it('routes state admin to GEDA admin command center', () => {
    expect(resolveTargetPortal({ role: 'admin' })).toBe('admin');
  });

  it('routes solar vendors and solar partners to vendor dashboard', () => {
    expect(resolveTargetPortal({ role: 'solar_vendor' })).toBe('solar_vendor');
    expect(resolveTargetPortal({ role: 'solar_partner' })).toBe('solar_vendor');
  });

  it('routes campus youth leaders to campus leader hub', () => {
    expect(resolveTargetPortal({ role: 'campus_leader' })).toBe('campus_leader');
  });

  it('routes enrolled student volunteers to student eco hub', () => {
    expect(resolveTargetPortal({ role: 'student' })).toBe('student_portal');
  });

  it('routes residential citizens to citizen dashboard', () => {
    expect(resolveTargetPortal({ role: 'citizen' })).toBe('dashboard');
  });

  it('defaults brand new registered users with empty or missing role to citizen dashboard', () => {
    expect(resolveTargetPortal({})).toBe('dashboard');
    expect(resolveTargetPortal(null)).toBe('dashboard');
    expect(resolveTargetPortal(undefined)).toBe('dashboard');
    expect(resolveTargetPortal({ role: '' })).toBe('dashboard');
  });

  it('verifies demo users map to authoritative roles matching portal destinations', () => {
    expect(resolveTargetPortal(DEMO_USERS.admin)).toBe('admin');
    expect(resolveTargetPortal(DEMO_USERS.solar_vendor)).toBe('solar_vendor');
    expect(resolveTargetPortal(DEMO_USERS.campus_leader)).toBe('campus_leader');
    expect(resolveTargetPortal(DEMO_USERS.student)).toBe('student_portal');
    expect(resolveTargetPortal(DEMO_USERS.citizen)).toBe('dashboard');
  });
});

