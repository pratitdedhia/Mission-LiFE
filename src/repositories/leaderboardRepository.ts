import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface LeaderboardRanking {
  uid: string;
  displayName: string;
  district: string;
  points: number;
  rank: number;
  streak: number;
}

export interface LeaderboardDoc {
  id: string;
  scope: 'state' | 'district' | 'ward';
  title: string;
  lastUpdated: string;
  rankings: LeaderboardRanking[];
}

export async function getStateLeaderboard(): Promise<LeaderboardDoc> {
  try {
    const snap = await getDoc(doc(db, 'leaderboards', 'state_overall'));
    if (snap.exists()) {
      return snap.data() as LeaderboardDoc;
    }
  } catch (err) {
    console.warn('Leaderboard fetch fallback:', err);
  }

  return {
    id: 'state_overall',
    scope: 'state',
    title: 'Gujarat State LiFE Champions',
    lastUpdated: new Date().toISOString(),
    rankings: [
      { uid: 'usr_citizen_pooja', displayName: 'Pooja Patel', district: 'Ahmedabad', points: 780, rank: 1, streak: 7 },
      { uid: 'usr_aarav_iitgn', displayName: 'Aarav Mehta', district: 'Gandhinagar', points: 740, rank: 2, streak: 12 },
      { uid: 'usr_rajesh_surat', displayName: 'Rajesh Shah', district: 'Surat', points: 690, rank: 3, streak: 5 },
      { uid: 'usr_priya_baroda', displayName: 'Priya Dave', district: 'Vadodara', points: 610, rank: 4, streak: 4 },
      { uid: 'usr_kunal_rajkot', displayName: 'Kunal Vora', district: 'Rajkot', points: 580, rank: 5, streak: 3 }
    ]
  };
}

