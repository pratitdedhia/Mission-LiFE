import { z } from 'zod';

export const UserRoleSchema = z.enum(['citizen', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  uid: z.string(),
  phone: z.string().optional(),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().url().nullable().optional(),
  role: UserRoleSchema.default('citizen'),
  districtId: z.string(), // e.g. "ahmedabad", "surat"
  wardId: z.string().optional(),
  communityId: z.string().optional(), // Society or apartment link
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime(),
  hasCompletedOnboarding: z.boolean().default(false)
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const HouseholdProfileSchema = z.object({
  userId: z.string(),
  districtId: z.string(),
  discom: z.enum(['UGVCL', 'MGVCL', 'DGVCL', 'PGVCL', 'TORRENT_POWER']),
  consumerNumber: z.string().optional(),
  occupants: z.number().int().min(1).max(25),
  acCount: z.number().int().min(0).max(10).default(1),
  acUsageHoursDaily: z.number().min(0).max(24).default(6),
  hasEv: z.boolean().default(false),
  hasWaterPump: z.boolean().default(true),
  hasRooftopAccess: z.boolean().default(true),
  avgMonthlyBillInr: z.number().nonnegative(),
  avgMonthlyUnitsKwh: z.number().nonnegative(),
  primaryCookingFuel: z.enum(['LPG', 'PNG', 'INDUCTION']).default('LPG'),
  lpgCylindersYear: z.number().nonnegative().default(10),
  dailyCommuteKm: z.number().nonnegative().default(15),
  primaryVehicleType: z.enum(['petrol_car', 'diesel_car', 'cng_car', 'ev_car', 'two_wheeler_petrol', 'two_wheeler_ev', 'public_transport']).default('two_wheeler_petrol'),
  updatedAt: z.string().datetime()
});
export type HouseholdProfile = z.infer<typeof HouseholdProfileSchema>;

export const FootprintBaselineSchema = z.object({
  userId: z.string(),
  baselineMonthlyKwh: z.number().nonnegative(),
  baselineMonthlyCo2Kg: z.number().nonnegative(),
  categoryBreakdown: z.object({
    electricity: z.number().nonnegative(),
    transport: z.number().nonnegative(),
    cooking: z.number().nonnegative(),
    waste: z.number().nonnegative(),
    water: z.number().nonnegative()
  }),
  verifiedVia: z.enum(['ocr_bill', 'manual_entry']),
  billImageUrl: z.string().url().nullable().optional(),
  ocrConfidence: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime()
});
export type FootprintBaseline = z.infer<typeof FootprintBaselineSchema>;

export const FootprintEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  periodMonth: z.string(), // "2026-10"
  actualUnitsKwh: z.number().nonnegative(),
  actualBillInr: z.number().nonnegative(),
  totalCo2Kg: z.number().nonnegative(),
  deltaVsBaselineKg: z.number(), // negative means reduced
  percentReduction: z.number(),
  breakdown: z.object({
    electricity: z.number().nonnegative(),
    transport: z.number().nonnegative(),
    cooking: z.number().nonnegative(),
    waste: z.number().nonnegative(),
    water: z.number().nonnegative()
  }),
  recordedAt: z.string().datetime()
});
export type FootprintEntry = z.infer<typeof FootprintEntrySchema>;

export const LifeThemeIdSchema = z.enum([
  'save_energy',
  'save_water',
  'reduce_plastic',
  'sustainable_food',
  'waste_reduction',
  'healthy_lifestyle',
  'e_waste'
]);
export type LifeThemeId = z.infer<typeof LifeThemeIdSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  themeId: LifeThemeIdSchema,
  titleKey: z.string(), // i18n key e.g. "tasks.ac24.title"
  descriptionKey: z.string(),
  impactSummary: z.string(),
  basePoints: z.number().int().positive(),
  co2SavingsKg: z.number().positive(),
  requiresPhotoProof: z.boolean().default(false),
  photoInstructionsKey: z.string().optional(),
  active: z.boolean().default(true),
  order: z.number().int().default(0)
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskCompletionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string(),
  dateKey: z.string(), // "YYYY-MM-DD" for idempotency deduplication
  photoUrl: z.string().url().nullable().optional(),
  imagePerceptualHash: z.string().nullable().optional(),
  aiConfidence: z.number().min(0).max(1).nullable().optional(),
  verificationStatus: z.enum(['auto_approved', 'manual_review', 'rejected']).default('auto_approved'),
  pointsAwarded: z.number().int().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
  streakMultiplierApplied: z.number().default(1.0),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime()
});
export type TaskCompletion = z.infer<typeof TaskCompletionSchema>;

export const UserNudgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  templateId: z.string(),
  headlineKey: z.string(),
  bodyKey: z.string(),
  contextMetadata: z.object({
    temperature: z.number().optional(),
    isPeakHour: z.boolean().optional(),
    solarRadiation: z.number().optional()
  }).optional(),
  estimatedSavingsKwh: z.number().positive(),
  status: z.enum(['delivered', 'accepted', 'dismissed']).default('delivered'),
  acceptedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime()
});
export type UserNudge = z.infer<typeof UserNudgeSchema>;

export const BadgeSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  icon: z.string(),
  category: z.string(),
  pointsRequired: z.number().int().nonnegative()
});
export type Badge = z.infer<typeof BadgeSchema>;

export const RewardSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  partnerName: z.string(),
  category: z.string(),
  pointsCost: z.number().int().positive(),
  voucherValueInr: z.number().positive(),
  discountDetails: z.string(),
  expiryDays: z.number().int().default(30),
  stockAvailable: z.number().int().default(100)
});
export type Reward = z.infer<typeof RewardSchema>;

export const RedemptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  rewardId: z.string(),
  redemptionCode: z.string(),
  pointsCost: z.number().int().positive(),
  status: z.enum(['active', 'used', 'expired']).default('active'),
  redeemedAt: z.string().datetime(),
  expiresAt: z.string().datetime()
});
export type Redemption = z.infer<typeof RedemptionSchema>;

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  districtId: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  gedaEmpanelledId: z.string(),
  rating: z.number().min(1).max(5),
  projectsCompleted: z.number().int().nonnegative(),
  isGedaCertified: z.boolean().default(true),
  lat: z.number(),
  lng: z.number(),
  brandsHandled: z.array(z.string())
});
export type Vendor = z.infer<typeof VendorSchema>;

export const SolarLeadSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhone: z.string(),
  districtId: z.string(),
  vendorId: z.string().nullable().optional(),
  recommendedCapacityKw: z.number().positive(),
  roofAreaSqFt: z.number().positive(),
  estimatedMonthlyBillInr: z.number().positive(),
  eligibleSubsidyInr: z.number().positive(),
  netCostInr: z.number().positive(),
  status: z.enum(['submitted', 'survey_scheduled', 'quote_issued', 'installed']).default('submitted'),
  createdAt: z.string().datetime()
});
export type SolarLead = z.infer<typeof SolarLeadSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  actorUid: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  diff: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().datetime()
});
export type AuditLog = z.infer<typeof AuditLogSchema>;
