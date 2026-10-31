/**
 * Mission LiFE Citizen Engagement Application Data Types
 * Gujarat Energy Development Agency (GEDA)
 */

export type MissionTheme = 
  | 'energy'
  | 'water'
  | 'plastic'
  | 'food'
  | 'waste'
  | 'lifestyle'
  | 'ewaste';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  district: string;
  state: string;
  householdSize: number;
  monthlyElectricityUnits: number;
  monthlyElectricityBill: number;
  acUsageHours: number;
  vehicleType: 'petrol_car' | 'diesel_car' | 'ev' | 'two_wheeler' | 'public_transit';
  dailyTravelKm: number;
  lpgCylindersYear: number;
  waterHabits: 'mindful' | 'moderate' | 'high';
  wasteSegregation: 'strict' | 'partial' | 'none';
  dietHabits: 'vegan' | 'vegetarian' | 'omnivore';
  lifeScore: number;
  scoreTodayDelta: number;
  streak: number;
  level: number;
  levelTitle: string;
  monthlyFootprintKg: number;
  footprintDeltaPercent: number;
  pledgeSigned: boolean;
  pledgeDate?: string;
  certificateId?: string;
  breakdown: {
    energy: number;
    transport: number;
    cooking: number;
    water: number;
    waste: number;
    food?: number;
  };
  completedMissions: string[];
  badges: string[];
  joinedDate: string;
}

export interface Mission {
  id: string;
  title: string;
  theme: MissionTheme;
  category: string;
  icon: string;
  points: number;
  co2Kg: number;
  difficulty: 'Easy' | 'Medium' | 'Special';
  isPromoted: boolean;
  description: string;
  hint?: string;
  requiresProof?: boolean;
}

export interface CommunityFeedPost {
  id: string;
  authorName: string;
  authorCity: string;
  avatarColor: string;
  theme: string;
  title: string;
  content: string;
  co2SavedKg: number;
  points: number;
  likes: number;
  likedBy: string[];
  timestamp: string;
  photoUrl?: string;
  verified: boolean;
  createdAt?: string;
}

export interface SolarInquiry {
  userId: string;
  userName: string;
  userCity: string;
  phone: string;
  pincode: string;
  recommendedKw: number;
  estimatedBill: number;
  roofArea: number;
  roofType: string;
  discom: string;
  referenceCode: string;
  status: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'solar' | 'ewaste' | 'ev' | 'waste';
  city: string;
  district: string;
  rating: number;
  reviews: number;
  badge: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  verified: boolean;
}

