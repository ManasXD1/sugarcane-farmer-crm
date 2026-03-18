// ─── Enums ────────────────────────────────────────────────────────────────────

export type FarmerStatus = 'active' | 'inactive' | 'pending';

export type CropStage =
  | 'land_preparation'
  | 'planting'
  | 'germination'
  | 'tillering'
  | 'grand_growth'
  | 'maturation'
  | 'harvested';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export type VisitType =
  | 'routine'
  | 'crop_inspection'
  | 'problem_resolution'
  | 'harvest_planning'
  | 'payment_discussion';

export type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque' | 'mobile_money';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Farmer {
  id: string;
  farmerId: string; // e.g. "FRM-00001"
  name: string;
  phone: string;
  village: string;
  district: string;
  region: string;
  farmSizeAcres: number;
  caneVariety: string;
  status: FarmerStatus;
  notes: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface CropProgress {
  id: string;
  farmerId: string;
  season: string; // e.g. "2025-26"
  plantingDate: string; // ISO date
  expectedHarvestDate: string; // ISO date
  stage: CropStage;
  areaPlanteAcres: number;
  estimatedYieldTons: number;
  actualYieldTons?: number;
  notes: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string; // ISO date
  quantityTons: number;
  qualityGrade: QualityGrade;
  vehicleNumber: string;
  receivedBy: string;
  notes: string;
  season: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string; // ISO date
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  season: string;
  notes: string;
  createdAt: string;
}

export interface FieldVisit {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string; // ISO date
  visitType: VisitType;
  agentName: string;
  notes: string;
  nextAction: string;
  nextVisitDate?: string;
  createdAt: string;
}

// ─── Summary / Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalFarmers: number;
  activeFarmers: number;
  totalDeliveriesThisSeason: number;
  totalDeliveryTons: number;
  totalPaymentsThisSeason: number;
  pendingHarvest: number;
  visitsThisMonth: number;
}

export interface MonthlyDelivery {
  month: string; // e.g. "Jan"
  tons: number;
}
