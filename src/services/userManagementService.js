/**
 * GEDA State Administrator User Management & Login Control Service
 * Mission LiFE Citizen Engagement Platform
 */

import { DEMO_USERS } from '../data/initialData';
import { getStudentVerifications } from './studentVerificationService';

const USERS_STORAGE_KEY = 'life_all_managed_users';
const CURRENT_AUTH_KEY = 'mission_life_auth_user';

export const INITIAL_MANAGED_USERS = [
  {
    id: "usr_citizen_pooja",
    name: "Pooja Patel",
    email: "citizen.pooja@gujaratlife.in",
    role: "citizen",
    roleTitle: "Residential Citizen",
    phone: "+91 98250 12345",
    district: "Ahmedabad",
    city: "Ahmedabad",
    locality: "Navrangpura",
    authProvider: "Email / Password",
    status: "active",
    lifeScore: 780,
    co2SavedKg: 428,
    streak: 7,
    solarStatus: "Feasibility Calculated (2.5 kW)",
    joinedDate: "2026-09-01",
    lastLogin: "Today at 08:24 PM"
  },
  {
    id: "usr_campus_aarav",
    name: "Aarav Mehta",
    email: "campus.aarav@iitgn.ac.in",
    role: "campus_leader",
    roleTitle: "Campus Youth Leader",
    phone: "+91 97129 44321",
    district: "Gandhinagar",
    city: "Gandhinagar",
    locality: "Palaj Campus",
    campusName: "IIT Gandhinagar",
    authProvider: "Institutional SSO",
    status: "active",
    lifeScore: 1420,
    co2SavedKg: 195,
    streak: 21,
    solarStatus: "Campus Rooftop Lead (320 kW)",
    joinedDate: "2026-08-15",
    lastLogin: "Today at 08:12 PM"
  },
  {
    id: "usr_vendor_rajesh",
    name: "Rajesh Shah",
    email: "vendor.rajesh@suryaurjagujarat.in",
    role: "solar_vendor",
    roleTitle: "GEDA Empanelled Installer",
    phone: "+91 79 2658 9100",
    district: "Ahmedabad",
    city: "Ahmedabad",
    locality: "Bodakdev, SG Highway",
    companyName: "Surya Urja Solutions Gujarat",
    licenseId: "GEDA-EMP-SOLAR-2026-088",
    authProvider: "GEDA Partner Portal",
    status: "active",
    lifeScore: 2180,
    co2SavedKg: 310,
    streak: 34,
    solarStatus: "Empanelled Installer Tier-1",
    joinedDate: "2026-07-01",
    lastLogin: "Today at 08:18 PM"
  },
  {
    id: "usr_admin_neha",
    name: "Dr. Neha Joshi",
    email: "admin.neha@geda.gujarat.gov.in",
    role: "admin",
    roleTitle: "GEDA State Energy Officer",
    phone: "+91 79 2325 7200",
    district: "Gandhinagar",
    city: "Gandhinagar",
    locality: "Sector 11 (GEDA Bhavan)",
    department: "Directorate of Energy Conservation",
    authProvider: "Gov.in SSO / 2FA",
    status: "active",
    lifeScore: 3400,
    co2SavedKg: 240,
    streak: 45,
    solarStatus: "Statewide Oversight",
    joinedDate: "2026-06-01",
    lastLogin: "Active Now"
  },
  {
    id: "usr_stu_priyan",
    name: "Priyan Patel",
    email: "priyan.patel@alumni.iitgn.ac.in",
    role: "citizen",
    roleTitle: "Student Volunteer",
    phone: "+91 99090 55432",
    district: "Gandhinagar",
    city: "Gandhinagar",
    locality: "Hostel Hall 5",
    campusName: "IIT Gandhinagar",
    collegeId: "23BCE094",
    authProvider: "Google OAuth",
    status: "active",
    lifeScore: 375,
    co2SavedKg: 21.6,
    streak: 5,
    solarStatus: "Not Applicable",
    joinedDate: "2026-10-24",
    lastLogin: "Yesterday"
  },
  {
    id: "usr_citizen_kinjal",
    name: "Kinjal Shah",
    email: "kinjal.shah@gmail.com",
    role: "citizen",
    roleTitle: "Residential Citizen",
    phone: "+91 98980 77651",
    district: "Ahmedabad",
    city: "Ahmedabad",
    locality: "Satellite",
    authProvider: "Email / Password",
    status: "active",
    lifeScore: 640,
    co2SavedKg: 180,
    streak: 12,
    solarStatus: "Installed & Live (2.0 kW)",
    joinedDate: "2026-09-10",
    lastLogin: "2 days ago"
  },
  {
    id: "usr_campus_rohan",
    name: "Rohan Desai",
    email: "rohan.desai@svnit.ac.in",
    role: "campus_leader",
    roleTitle: "Campus Youth Leader",
    phone: "+91 98241 88990",
    district: "Surat",
    city: "Surat",
    locality: "Ichchhanath",
    campusName: "SVNIT Surat",
    authProvider: "Institutional SSO",
    status: "active",
    lifeScore: 910,
    co2SavedKg: 145,
    streak: 15,
    solarStatus: "Campus Rooftop (240 kW)",
    joinedDate: "2026-09-15",
    lastLogin: "Yesterday"
  },
  {
    id: "usr_vendor_bhavin",
    name: "Bhavin Patel",
    email: "bhavin.patel@adanisolar.in",
    role: "solar_vendor",
    roleTitle: "Tier-1 Solar Partner",
    phone: "+91 79 2555 7788",
    district: "Ahmedabad",
    city: "Ahmedabad",
    locality: "Navrangpura",
    companyName: "Adani Solar Power Hub",
    licenseId: "GEDA-EMP-SOLAR-2026-042",
    authProvider: "GEDA Partner Portal",
    status: "active",
    lifeScore: 1890,
    co2SavedKg: 280,
    streak: 25,
    solarStatus: "Empanelled Installer Tier-1",
    joinedDate: "2026-07-15",
    lastLogin: "3 days ago"
  },
  {
    id: "usr_citizen_vikram",
    name: "Vikram Mehta",
    email: "vikram.mehta@vadodara.life.in",
    role: "citizen",
    roleTitle: "Residential Citizen",
    phone: "+91 98790 11223",
    district: "Vadodara",
    city: "Vadodara",
    locality: "Alkapuri",
    authProvider: "Email / Password",
    status: "pending",
    lifeScore: 190,
    co2SavedKg: 45,
    streak: 2,
    solarStatus: "Survey Requested (3 kW)",
    joinedDate: "2026-10-28",
    lastLogin: "4 days ago"
  }
];

export function getAllManagedUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to read managed users:", e);
  }
  saveManagedUsers(INITIAL_MANAGED_USERS);
  return INITIAL_MANAGED_USERS;
}

export function saveManagedUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save managed users:", e);
  }
}

export function updateManagedUser(userId, updates) {
  const users = getAllManagedUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, error: "User not found" };

  const updatedUser = { ...users[index], ...updates, lastUpdated: new Date().toISOString() };
  users[index] = updatedUser;
  saveManagedUsers(users);

  // If this matches the active logged in session, update the current user object too
  try {
    const currentRaw = localStorage.getItem(CURRENT_AUTH_KEY);
    if (currentRaw) {
      const currentUser = JSON.parse(currentRaw);
      if (currentUser.id === userId || currentUser.email === updatedUser.email) {
        localStorage.setItem(CURRENT_AUTH_KEY, JSON.stringify({ ...currentUser, ...updates }));
      }
    }
  } catch (e) {}

  return { success: true, user: updatedUser };
}

export function createManagedUser(userData) {
  const users = getAllManagedUsers();
  const newId = `usr_${Date.now()}`;
  const newUser = {
    id: newId,
    name: userData.name || "New Registered Citizen",
    email: userData.email,
    role: userData.role || "citizen",
    roleTitle: userData.role === 'admin' ? 'State Energy Officer' :
               userData.role === 'solar_vendor' ? 'GEDA Empanelled Installer' :
               userData.role === 'campus_leader' ? 'Campus Youth Leader' : 'Residential Citizen',
    phone: userData.phone || "+91 98000 00000",
    district: userData.district || "Ahmedabad",
    city: userData.city || userData.district || "Ahmedabad",
    locality: userData.locality || "City Center",
    campusName: userData.campusName || null,
    companyName: userData.companyName || null,
    authProvider: userData.authProvider || "Admin Provisioned",
    status: userData.status || "active",
    lifeScore: Number(userData.lifeScore) || 100,
    co2SavedKg: Number(userData.co2SavedKg) || 10,
    streak: Number(userData.streak) || 1,
    solarStatus: userData.solarStatus || "None",
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: "Never"
  };

  users.unshift(newUser);
  saveManagedUsers(users);
  return { success: true, user: newUser };
}

export function deleteManagedUser(userId) {
  const users = getAllManagedUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveManagedUsers(filtered);
  return { success: true };
}

export function toggleUserStatus(userId) {
  const users = getAllManagedUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false };
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  return updateManagedUser(userId, { status: newStatus });
}
