/**
 * Student Verification & Campus Leader Action Content Service
 * Mission LiFE Citizen Engagement Platform
 */

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
    studentId: "usr_guest", // Can match default demo user
    studentName: "Priyan Patel",
    studentEmail: "priyan.patel@alumni.iitgn.ac.in",
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
  return { success: true, student: target };
}

export function rejectStudent(verificationId, reason = "Unclear ID or mismatched details") {
  const all = getStudentVerifications();
  const target = all.find(item => item.id === verificationId);
  if (!target) return { success: false, message: "Record not found" };

  target.status = "rejected";
  target.rejectionReason = reason;

  saveStudentVerifications(all);
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
