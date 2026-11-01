/**
 * Student Verification & Campus Leader Action Content Service
 * Mission LiFE Citizen Engagement Platform
 * Dual-persisted via Cloud Firestore with local storage cache fallback.
 */

import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'life_student_verifications';

export const POPULAR_UNIVERSITIES = [
  "IIT Gandhinagar",
  "Gujarat University",
  "Nirma University",
  "Pandit Deendayal Energy University (PDEU)",
  "SVNIT Surat",
  "L.D. College of Engineering (LDCE)",
  "Maharaja Sayajirao University of Baroda (MSU)",
  "DA-IICT Gandhinagar",
  "Marwadi University",
  "Charotar University of Science and Technology (CHARUSAT)"
];

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil & Environmental Engineering",
  "Chemical & Materials Engineering",
  "Energy & Sustainability Studies",
  "Commerce & Business Administration (MBA)",
  "Sciences & Humanities",
  "Biotechnology & Health Sciences"
];

const INITIAL_VERIFICATIONS = [
  {
    id: "stu_ver_1",
    studentId: "usr_student_priyan",
    studentName: "Priyan Patel",
    studentEmail: "student.priyan@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "23BCE094",
    department: "Computer Science & Engineering",
    yearOfStudy: "2nd Year (Batch 2023-27)",
    residenceType: "Hostel Hall 5 (Sabarmati)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    status: "verified",
    submittedAt: "2026-10-24T10:15:00Z",
    verifiedAt: "2026-10-24T14:30:00Z",
    actionsCount: 14,
    totalPoints: 375,
    co2SavedKg: 21.6,
    recentActions: [
      { action: "Set hostel AC to 26°C with ceiling fan assist", date: "Today, 14:10", co2Kg: 1.2, points: 25 },
      { action: "Dining mess zero organic food-waste tray", date: "Today, 13:00", co2Kg: 0.8, points: 20 },
      { action: "Switched off laptop & desk plug sockets overnight", date: "Yesterday", co2Kg: 0.4, points: 15 },
      { action: "Used campus bicycle for Academic Block travel", date: "2 days ago", co2Kg: 1.6, points: 30 }
    ]
  },
  {
    id: "stu_ver_2",
    studentId: "usr_student_devansh",
    studentName: "Devansh Shah",
    studentEmail: "devansh.s@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2023BCSE042",
    department: "Computer Science & Engineering",
    yearOfStudy: "3rd Year (Batch 2022-26)",
    residenceType: "Hostel Hall 5 (Sabarmati)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "pending",
    submittedAt: "2026-11-01T09:40:00Z",
    verifiedAt: null,
    actionsCount: 0,
    totalPoints: 0,
    co2SavedKg: 0,
    recentActions: []
  },
  {
    id: "stu_ver_3",
    studentId: "usr_student_pooja",
    studentName: "Pooja Trivedi",
    studentEmail: "pooja.t@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2022BEE019",
    department: "Electrical & Electronics Engineering",
    yearOfStudy: "4th Year (Batch 2021-25)",
    residenceType: "Hostel Hall 3 (Narmada)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    status: "pending",
    submittedAt: "2026-11-01T11:20:00Z",
    verifiedAt: null,
    actionsCount: 0,
    totalPoints: 0,
    co2SavedKg: 0,
    recentActions: []
  },
  {
    id: "stu_ver_4",
    studentId: "usr_student_kavya",
    studentName: "Kavya Patel",
    studentEmail: "kavya.patel@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2024BME088",
    department: "Mechanical Engineering",
    yearOfStudy: "1st Year (Batch 2024-28)",
    residenceType: "Day Scholar (Gandhinagar)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    status: "pending",
    submittedAt: "2026-11-01T15:05:00Z",
    verifiedAt: null,
    actionsCount: 0,
    totalPoints: 0,
    co2SavedKg: 0,
    recentActions: []
  },
  {
    id: "stu_ver_5",
    studentId: "usr_student_rohan",
    studentName: "Rohan Parikh",
    studentEmail: "rohan.p@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2021BCHE014",
    department: "Chemical & Materials Engineering",
    yearOfStudy: "4th Year (Batch 2021-25)",
    residenceType: "Hostel Hall 7 (Tapti)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "verified",
    submittedAt: "2026-10-18T14:20:00Z",
    verifiedAt: "2026-10-18T16:00:00Z",
    actionsCount: 22,
    totalPoints: 580,
    co2SavedKg: 34.5,
    recentActions: [
      { action: "Shifted laundry loads to off-peak night hours", date: "Today, 11:30", co2Kg: 2.4, points: 35 },
      { action: "Turned off standby socket loads for gaming PC", date: "Yesterday", co2Kg: 0.6, points: 15 },
      { action: "Carried personal thermal flask instead of plastic cups", date: "3 days ago", co2Kg: 0.3, points: 10 }
    ]
  },
  {
    id: "stu_ver_6",
    studentId: "usr_student_ananya",
    studentName: "Ananya Joshi",
    studentEmail: "ananya.j@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2022BCSE105",
    department: "Computer Science & Engineering",
    yearOfStudy: "3rd Year (Batch 2022-26)",
    residenceType: "Hostel Hall 5 (Sabarmati)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    status: "verified",
    submittedAt: "2026-10-12T09:10:00Z",
    verifiedAt: "2026-10-12T11:45:00Z",
    actionsCount: 28,
    totalPoints: 720,
    co2SavedKg: 42.8,
    recentActions: [
      { action: "Maintained AC at 26°C with corridor window shut", date: "Today, 15:45", co2Kg: 1.2, points: 25 },
      { action: "Organized hostel e-waste collection bin drive", date: "2 days ago", co2Kg: 4.5, points: 60 },
      { action: "Zero-waste dining plate during campus banquet", date: "4 days ago", co2Kg: 1.0, points: 20 }
    ]
  },
  {
    id: "stu_ver_7",
    studentId: "usr_student_siddharth",
    studentName: "Siddharth Dave",
    studentEmail: "siddharth.d@iitgn.ac.in",
    universityName: "IIT Gandhinagar",
    collegeId: "2023BMSE009",
    department: "Energy & Sustainability Studies",
    yearOfStudy: "2nd Year (Batch 2023-27)",
    residenceType: "Day Scholar (Gandhinagar)",
    idCardPhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    status: "verified",
    submittedAt: "2026-10-20T16:00:00Z",
    verifiedAt: "2026-10-20T17:15:00Z",
    actionsCount: 16,
    totalPoints: 410,
    co2SavedKg: 24.3,
    recentActions: [
      { action: "Electric scooter commute to campus from Gandhinagar sector 7", date: "Today, 08:30", co2Kg: 2.1, points: 30 },
      { action: "Solar rooftop terrace inspection tour attendance", date: "Yesterday", co2Kg: 3.0, points: 40 }
    ]
  }
];

export function getStudentVerifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VERIFICATIONS));
      return INITIAL_VERIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load student verifications:", e);
    return INITIAL_VERIFICATIONS;
  }
}

export function saveStudentVerifications(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save student verifications:", e);
  }
}

/**
 * Asynchronously synchronizes student verifications between Firestore and local cache.
 * Populates Firestore with baseline university cohort if remote collection is empty.
 */
export async function syncStudentVerificationsFromFirestore() {
  if (!db) return getStudentVerifications();
  try {
    const colRef = collection(db, 'studentVerifications');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remoteItems = [];
      snap.forEach(d => remoteItems.push({ id: d.id, ...d.data() }));
      saveStudentVerifications(remoteItems);
      return remoteItems;
    } else {
      // Seed Firestore with authoritative cohort
      const initial = getStudentVerifications();
      for (const item of initial) {
        await setDoc(doc(db, 'studentVerifications', item.id), {
          ...item,
          serverTimestamp: serverTimestamp()
        }).catch(() => {});
      }
      return initial;
    }
  } catch (err) {
    console.warn("Firestore student verification sync fallback:", err.message);
    return getStudentVerifications();
  }
}

async function persistVerificationDoc(entry) {
  if (!db || !entry?.id) return;
  try {
    await setDoc(doc(db, 'studentVerifications', entry.id), {
      ...entry,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore student doc write fallback:", err.message);
  }
}

export function getStudentVerificationForUser(userId, userEmail = '') {
  const all = getStudentVerifications();
  return all.find(item => item.studentId === userId || (userEmail && item.studentEmail === userEmail)) || null;
}

export function submitStudentVerification({
  userId,
  studentName,
  studentEmail,
  universityName,
  collegeId,
  department,
  yearOfStudy,
  residenceType,
  idCardPhotoUrl
}) {
  const all = getStudentVerifications();
  const existingIdx = all.findIndex(item => item.studentId === userId);

  const newEntry = {
    id: existingIdx >= 0 ? all[existingIdx].id : `stu_ver_${Date.now()}`,
    studentId: userId,
    studentName: studentName || "Student Volunteer",
    studentEmail: studentEmail || "student@campus.ac.in",
    universityName: universityName || "IIT Gandhinagar",
    collegeId: collegeId || "23BCE000",
    department: department || "Computer Science & Engineering",
    yearOfStudy: yearOfStudy || "2nd Year",
    residenceType: residenceType || "Hostel",
    idCardPhotoUrl: idCardPhotoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    status: "pending",
    submittedAt: new Date().toISOString(),
    verifiedAt: null,
    actionsCount: existingIdx >= 0 ? all[existingIdx].actionsCount : 0,
    totalPoints: existingIdx >= 0 ? all[existingIdx].totalPoints : 0,
    co2SavedKg: existingIdx >= 0 ? all[existingIdx].co2SavedKg : 0,
    recentActions: existingIdx >= 0 ? all[existingIdx].recentActions : []
  };

  if (existingIdx >= 0) {
    all[existingIdx] = newEntry;
  } else {
    all.unshift(newEntry);
  }

  saveStudentVerifications(all);
  persistVerificationDoc(newEntry);
  return newEntry;
}

export function verifyStudent(verificationId, verifiedBy = "Aarav Mehta") {
  const all = getStudentVerifications();
  const target = all.find(item => item.id === verificationId);
  if (!target) return { success: false, message: "Record not found" };

  target.status = "verified";
  target.verifiedAt = new Date().toISOString();
  target.verifiedBy = verifiedBy;
  target.rejectionReason = null;

  saveStudentVerifications(all);
  persistVerificationDoc(target);
  return { success: true, student: target };
}

export function rejectStudent(verificationId, reason = "Unclear ID or mismatched details") {
  const all = getStudentVerifications();
  const target = all.find(item => item.id === verificationId);
  if (!target) return { success: false, message: "Record not found" };

  target.status = "rejected";
  target.rejectionReason = reason;

  saveStudentVerifications(all);
  persistVerificationDoc(target);
  return { success: true, student: target };
}

export function recordStudentAction(userId, actionTitle, points, co2Kg) {
  const all = getStudentVerifications();
  const student = all.find(item => item.studentId === userId && item.status === "verified");
  if (!student) return false;

  student.actionsCount = (student.actionsCount || 0) + 1;
  student.totalPoints = (student.totalPoints || 0) + points;
  student.co2SavedKg = Number(((student.co2SavedKg || 0) + co2Kg).toFixed(1));

  if (!student.recentActions) student.recentActions = [];
  student.recentActions.unshift({
    action: actionTitle,
    date: "Just now",
    co2Kg,
    points
  });

  if (student.recentActions.length > 20) {
    student.recentActions.pop();
  }

  saveStudentVerifications(all);
  persistVerificationDoc(student);
  return true;
}

export function getCampusStudentSummary(targetUniversity = "IIT Gandhinagar") {
  const all = getStudentVerifications();
  // Filter for matching university (case-insensitive substring match)
  const normTarget = targetUniversity.toLowerCase();
  const universityStudents = all.filter(item => 
    item.universityName.toLowerCase().includes("iit") || 
    normTarget.includes(item.universityName.toLowerCase()) || 
    item.universityName.toLowerCase().includes(normTarget)
  );

  const verifiedStudents = universityStudents.filter(item => item.status === "verified");
  const pendingStudents = universityStudents.filter(item => item.status === "pending");
  const rejectedStudents = universityStudents.filter(item => item.status === "rejected");

  const totalActions = verifiedStudents.reduce((acc, s) => acc + (s.actionsCount || 0), 0);
  const totalPoints = verifiedStudents.reduce((acc, s) => acc + (s.totalPoints || 0), 0);
  const totalCo2SavedKg = verifiedStudents.reduce((acc, s) => acc + (s.co2SavedKg || 0), 0);

  // Department breakdown
  const departmentMap = {};
  verifiedStudents.forEach(s => {
    const dept = s.department || "General Engineering";
    if (!departmentMap[dept]) {
      departmentMap[dept] = { count: 0, points: 0, co2SavedKg: 0 };
    }
    departmentMap[dept].count += 1;
    departmentMap[dept].points += s.totalPoints || 0;
    departmentMap[dept].co2SavedKg = Number((departmentMap[dept].co2SavedKg + (s.co2SavedKg || 0)).toFixed(1));
  });

  // Flat sorted feed of student actions
  const recentActionFeed = [];
  verifiedStudents.forEach(s => {
    (s.recentActions || []).forEach(act => {
      recentActionFeed.push({
        studentName: s.studentName,
        collegeId: s.collegeId,
        department: s.department,
        residenceType: s.residenceType,
        action: act.action,
        date: act.date,
        points: act.points,
        co2Kg: act.co2Kg
      });
    });
  });

  return {
    universityName: targetUniversity,
    totalVerifiedCount: verifiedStudents.length,
    pendingCount: pendingStudents.length,
    rejectedCount: rejectedStudents.length,
    totalActions,
    totalPoints,
    totalCo2SavedKg: Number(totalCo2SavedKg.toFixed(1)),
    pendingList: pendingStudents,
    verifiedList: verifiedStudents,
    departmentBreakdown: departmentMap,
    recentActionFeed: recentActionFeed.slice(0, 15)
  };
}

/**
 * Official Base University Squads for Gujarat Collegiate Sustainability League
 */
export const BASE_UNIVERSITIES = [
  {
    id: "uni_iitgn",
    name: "IIT Gandhinagar Eco Squad",
    shortName: "IIT Gandhinagar",
    aliases: ["iit gandhinagar", "iitgn", "iit gn", "palaj"],
    city: "Gandhinagar",
    district: "Gandhinagar",
    leader: "Aarav Mehta",
    badge: "🏆 Net-Zero Campus",
    baseStudents: 420,
    basePoints: 84890,
    baseCo2Kg: 12400
  },
  {
    id: "uni_svnit",
    name: "SVNIT Surat Eco-Warriors",
    shortName: "SVNIT Surat",
    aliases: ["svnit", "svnit surat", "sardar vallabhbhai national institute", "surat nit"],
    city: "Surat",
    district: "Surat",
    leader: "Dr. R. Patel",
    badge: "🥈 Solar Innovation",
    baseStudents: 270,
    basePoints: 71400,
    baseCo2Kg: 9800
  },
  {
    id: "uni_msu",
    name: "MS University Vadodara",
    shortName: "MS University",
    aliases: ["ms university", "msu", "maharaja sayajirao", "baroda", "vadodara"],
    city: "Vadodara",
    district: "Vadodara",
    leader: "Prof. Trivedi",
    badge: "🥉 Plastic Free Zone",
    baseStudents: 230,
    basePoints: 59200,
    baseCo2Kg: 7900
  },
  {
    id: "uni_gu",
    name: "Gujarat University Green League",
    shortName: "Gujarat University",
    aliases: ["gujarat university", "gu ahmedabad", "gu", "navrangpura"],
    city: "Ahmedabad",
    district: "Ahmedabad",
    leader: "H. Desai",
    badge: "⭐ Energy Shift Champion",
    baseStudents: 310,
    basePoints: 52100,
    baseCo2Kg: 6850
  },
  {
    id: "uni_nirma",
    name: "Nirma University Eco-Council",
    shortName: "Nirma University",
    aliases: ["nirma", "nirma university", "sg highway nirma"],
    city: "Ahmedabad",
    district: "Ahmedabad",
    leader: "K. Shah",
    badge: "⭐ Circular Campus",
    baseStudents: 190,
    basePoints: 44300,
    baseCo2Kg: 5600
  },
  {
    id: "uni_pdeu",
    name: "PDEU Gandhinagar CleanTech",
    shortName: "PDEU",
    aliases: ["pdeu", "pandit deendayal", "pdpu", "petroleum university"],
    city: "Gandhinagar",
    district: "Gandhinagar",
    leader: "M. Dave",
    badge: "⭐ Geothermal & Solar",
    baseStudents: 180,
    basePoints: 39800,
    baseCo2Kg: 4900
  },
  {
    id: "uni_ldce",
    name: "L.D. College of Engineering (LDCE)",
    shortName: "LDCE",
    aliases: ["ldce", "ld college", "l.d. college", "lalbhai dalpatbhai"],
    city: "Ahmedabad",
    district: "Ahmedabad",
    leader: "S. Parikh",
    badge: "⭐ E-Waste Pioneers",
    baseStudents: 210,
    basePoints: 36500,
    baseCo2Kg: 4400
  },
  {
    id: "uni_daiict",
    name: "DA-IICT Green Computing",
    shortName: "DA-IICT",
    aliases: ["da-iict", "daiict", "dhirubhai ambani institute", "da iict"],
    city: "Gandhinagar",
    district: "Gandhinagar",
    leader: "Prof. Joshi",
    badge: "⭐ Smart Campus IoT",
    baseStudents: 150,
    basePoints: 31200,
    baseCo2Kg: 3820
  },
  {
    id: "uni_marwadi",
    name: "Marwadi University Eco Cell",
    shortName: "Marwadi University",
    aliases: ["marwadi", "marwadi university", "rajkot marwadi"],
    city: "Rajkot",
    district: "Rajkot",
    leader: "Dr. Mehta",
    badge: "⭐ Water Harvesting Hub",
    baseStudents: 135,
    basePoints: 26400,
    baseCo2Kg: 3120
  },
  {
    id: "uni_charusat",
    name: "CHARUSAT Sustainability Club",
    shortName: "CHARUSAT",
    aliases: ["charusat", "charotar university", "changa", "charusat anand"],
    city: "Changa / Anand",
    district: "Anand",
    leader: "Prof. Patel",
    badge: "⭐ Green Chemistry",
    baseStudents: 120,
    basePoints: 22100,
    baseCo2Kg: 2710
  }
];

/**
 * Universal university matcher for student verification records
 */
export function matchesUniversity(studentUniName = '', baseUni) {
  if (!studentUniName || !baseUni) return false;
  const s = studentUniName.toLowerCase().trim();
  const name = (baseUni.name || '').toLowerCase().trim();
  const short = (baseUni.shortName || '').toLowerCase().trim();

  if (s === name || s === short) return true;
  if (name.includes(s) || s.includes(name) || short.includes(s) || s.includes(short)) return true;

  if (Array.isArray(baseUni.aliases)) {
    if (baseUni.aliases.some(alias => s.includes(alias.toLowerCase()) || alias.toLowerCase().includes(s))) {
      return true;
    }
  }
  return false;
}

/**
 * Authoritative University Leaderboard Engine
 * Aggregates verified student contributions dynamically into university rankings
 */
export function getUniversityLeaderboard() {
  const verifiedStudents = getStudentVerifications().filter(s => s.status === 'verified');

  const rankings = BASE_UNIVERSITIES.map(u => {
    // Find all verified students associated to this university using universal matcher
    const studentsForUni = verifiedStudents.filter(s => matchesUniversity(s.universityName, u));

    const additionalPoints = studentsForUni.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const additionalCo2 = studentsForUni.reduce((sum, s) => sum + (s.co2SavedKg || 0), 0);
    const liveStudentCount = u.baseStudents + studentsForUni.length;
    const livePoints = u.basePoints + additionalPoints;
    const liveCo2Kg = Math.round(u.baseCo2Kg + additionalCo2);

    return {
      id: u.id,
      name: u.name,
      shortName: u.shortName,
      city: u.city,
      district: u.district,
      leader: u.leader,
      badge: u.badge,
      students: liveStudentCount,
      points: livePoints,
      co2AvoidedKg: liveCo2Kg,
      verifiedRosterCount: studentsForUni.length,
      verifiedRoster: studentsForUni
    };
  });

  // Track matched student IDs to detect any custom universities registered by students
  const matchedStudentIds = new Set();
  rankings.forEach(r => {
    (r.verifiedRoster || []).forEach(s => matchedStudentIds.add(s.id));
  });

  const unmatchedStudents = verifiedStudents.filter(s => !matchedStudentIds.has(s.id));
  const customUniMap = {};
  unmatchedStudents.forEach(s => {
    const uName = s.universityName || 'Other College';
    if (!customUniMap[uName]) {
      customUniMap[uName] = {
        id: `uni_custom_${uName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: `${uName} Eco Squad`,
        shortName: uName,
        city: 'Gujarat',
        district: 'Gujarat',
        leader: 'Student Lead',
        badge: '🌱 Emerging Green Squad',
        students: 0,
        points: 0,
        co2AvoidedKg: 0,
        verifiedRosterCount: 0,
        verifiedRoster: []
      };
    }
    customUniMap[uName].students += 1;
    customUniMap[uName].points += (s.totalPoints || 0);
    customUniMap[uName].co2AvoidedKg += Math.round(s.co2SavedKg || 0);
    customUniMap[uName].verifiedRosterCount += 1;
    customUniMap[uName].verifiedRoster.push(s);
  });

  Object.values(customUniMap).forEach(cUni => rankings.push(cUni));

  // Sort by total points descending
  rankings.sort((a, b) => b.points - a.points);

  // Assign live rank
  return rankings.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}

// Campus Sprints Storage
const SPRINTS_STORAGE_KEY = (uni) => `life_campus_sprints_${(uni || 'IIT Gandhinagar').replace(/\s+/g, '_')}`;

export const DEFAULT_CAMPUS_SPRINTS = [
  {
    id: "sprint_hostel_ac26",
    title: "Inter-Hostel AC 26°C Challenge",
    theme: "save_energy",
    category: "Campus Sprint",
    description: "Hostels 3, 5, and 7 compete to maintain AC thermostat setpoints at 26°C with corridor window shut and shift heavy laundry away from 6–10 PM peak.",
    impactSummary: "Reduces aggregate hostel cooling draw • Saves ~3.8 MWh peak power",
    points: 75,
    co2Kg: 2.4,
    organizer: "Aarav Mehta (Campus Youth Leader)",
    organizerRole: "Campus Leader",
    requiresPhotoProof: true,
    photoGuidance: "Upload photo of your hostel room AC remote/display set at 26°C or higher.",
    activeParticipants: 245,
    progressPercent: 78,
    participatingHostels: ["Hall 3 (Narmada)", "Hall 5 (Sabarmati)", "Hall 7 (Tapti)"],
    status: "active"
  },
  {
    id: "sprint_zero_food_mess",
    title: "Zero Food-Waste Mess Challenge",
    theme: "sustainable_food",
    category: "Campus Sprint",
    description: "Dining halls diverting 100% of organic food waste to campus biogas digester and organic vermicomposting beds.",
    impactSummary: "Zero leftover food on dining tray • Clean plate verification",
    points: 50,
    co2Kg: 1.8,
    organizer: "Central Dining Mess Committee",
    organizerRole: "Campus Committee",
    requiresPhotoProof: true,
    photoGuidance: "Upload photo of your finished, clean dining hall tray at the tray return station.",
    activeParticipants: 380,
    progressPercent: 92,
    participatingHostels: ["Central Dining Mess A", "Dining Mess B"],
    status: "active"
  },
  {
    id: "sprint_solar_rooftop_walk",
    title: "Solar Rooftop Campus Walk & Shadow Audit",
    theme: "save_energy",
    category: "Campus Sprint",
    description: "Interactive peer tour of IITGN's 320 kW rooftop solar installation on Academic Blocks 3 & 4 with physical shadow survey.",
    impactSummary: "Hands-on solar orientation audit • Rooftop generation check",
    points: 100,
    co2Kg: 5.0,
    organizer: "Green Club & Energy Cell",
    organizerRole: "Student Technical Club",
    requiresPhotoProof: true,
    photoGuidance: "Upload photo at the Academic Block terrace solar inverter or panel array.",
    activeParticipants: 160,
    progressPercent: 64,
    participatingHostels: ["UG Freshers Squad", "Postgrad Climate Group"],
    status: "active"
  },
  {
    id: "sprint_hostel_power_cut",
    title: "Hostel Corridor Standby Power Cut",
    theme: "save_energy",
    category: "Campus Sprint",
    description: "Coordinate with hostel wing mates to turn off corridor lighting and common room lounge appliances post 11 PM.",
    impactSummary: "Cuts idle vampire nighttime consumption across hostel wings",
    points: 40,
    co2Kg: 1.1,
    organizer: "Hostel Student Council",
    organizerRole: "Student Council",
    requiresPhotoProof: true,
    photoGuidance: "Upload photo of switched-off corridor lighting or lounge entertainment switch.",
    activeParticipants: 190,
    progressPercent: 83,
    participatingHostels: ["All Campus Hostel Wings"],
    status: "active"
  },
  {
    id: "sprint_campus_ewaste_drive",
    title: "Campus E-Waste & Cable Recycling Drive",
    theme: "e_waste",
    category: "Campus Sprint",
    description: "Hand over retired smartphone charging cords, dead laptop battery packs, and electronics to the campus library green bin.",
    impactSummary: "Safe circular e-waste recycling • Diverts heavy metals from municipal landfills",
    points: 60,
    co2Kg: 3.5,
    organizer: "Youth Climate Fellowship",
    organizerRole: "Campus Green Chapter",
    requiresPhotoProof: true,
    photoGuidance: "Upload photo of e-waste deposit into the designated library green bin.",
    activeParticipants: 140,
    progressPercent: 70,
    participatingHostels: ["Central Library Green Bin", "Student Activity Center"],
    status: "active"
  }
];

export function getCampusLeaderSprints(universityName = "IIT Gandhinagar") {
  const key = SPRINTS_STORAGE_KEY(universityName);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(DEFAULT_CAMPUS_SPRINTS));
    return DEFAULT_CAMPUS_SPRINTS;
  } catch (e) {
    return DEFAULT_CAMPUS_SPRINTS;
  }
}

export function broadcastCampusLeaderSprint(universityName = "IIT Gandhinagar", newSprint) {
  const sprints = getCampusLeaderSprints(universityName);
  const updated = [newSprint, ...sprints];
  const key = SPRINTS_STORAGE_KEY(universityName);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save broadcasted sprint", e);
  }
  return updated;
}

