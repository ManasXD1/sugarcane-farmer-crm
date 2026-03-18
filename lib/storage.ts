import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Farmer,
  CropProgress,
  Delivery,
  Payment,
  FieldVisit,
  QualityGrade,
  PaymentMethod,
} from './types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  FARMERS: 'crm_farmers',
  CROP_PROGRESS: 'crm_crop_progress',
  DELIVERIES: 'crm_deliveries',
  PAYMENTS: 'crm_payments',
  FIELD_VISITS: 'crm_field_visits',
  FARMER_COUNTER: 'crm_farmer_counter',
};

// ─── Generic Helpers ──────────────────────────────────────────────────────────

async function getAll<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function saveAll<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function getNextFarmerNumber(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.FARMER_COUNTER);
  const next = raw ? parseInt(raw, 10) + 1 : 1;
  await AsyncStorage.setItem(KEYS.FARMER_COUNTER, String(next));
  return next;
}

// ─── Farmer Service ───────────────────────────────────────────────────────────

export const FarmerService = {
  async getAll(): Promise<Farmer[]> {
    return getAll<Farmer>(KEYS.FARMERS);
  },

  async getById(id: string): Promise<Farmer | undefined> {
    const farmers = await this.getAll();
    return farmers.find((f) => f.id === id);
  },

  async create(data: Omit<Farmer, 'id' | 'farmerId' | 'createdAt' | 'updatedAt'>): Promise<Farmer> {
    const farmers = await this.getAll();
    const num = await getNextFarmerNumber();
    const farmer: Farmer = {
      ...data,
      id: generateId(),
      farmerId: `FRM-${String(num).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    farmers.push(farmer);
    await saveAll(KEYS.FARMERS, farmers);
    return farmer;
  },

  async update(id: string, data: Partial<Farmer>): Promise<Farmer | undefined> {
    const farmers = await this.getAll();
    const idx = farmers.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    farmers[idx] = { ...farmers[idx], ...data, updatedAt: new Date().toISOString() };
    await saveAll(KEYS.FARMERS, farmers);
    return farmers[idx];
  },

  async delete(id: string): Promise<void> {
    const farmers = await this.getAll();
    await saveAll(KEYS.FARMERS, farmers.filter((f) => f.id !== id));
  },

  async search(query: string): Promise<Farmer[]> {
    const farmers = await this.getAll();
    const q = query.toLowerCase();
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.farmerId.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.phone.includes(q),
    );
  },
};

// ─── Crop Progress Service ────────────────────────────────────────────────────

export const CropService = {
  async getAll(): Promise<CropProgress[]> {
    return getAll<CropProgress>(KEYS.CROP_PROGRESS);
  },

  async getByFarmer(farmerId: string): Promise<CropProgress[]> {
    const all = await this.getAll();
    return all.filter((c) => c.farmerId === farmerId);
  },

  async create(data: Omit<CropProgress, 'id' | 'updatedAt'>): Promise<CropProgress> {
    const all = await this.getAll();
    const item: CropProgress = {
      ...data,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    };
    all.push(item);
    await saveAll(KEYS.CROP_PROGRESS, all);
    return item;
  },

  async update(id: string, data: Partial<CropProgress>): Promise<CropProgress | undefined> {
    const all = await this.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    await saveAll(KEYS.CROP_PROGRESS, all);
    return all[idx];
  },

  async upsertForFarmer(farmerId: string, season: string, data: Partial<CropProgress>): Promise<CropProgress> {
    const all = await this.getAll();
    const idx = all.findIndex((c) => c.farmerId === farmerId && c.season === season);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      await saveAll(KEYS.CROP_PROGRESS, all);
      return all[idx];
    }
    return this.create({
      farmerId,
      season,
      plantingDate: data.plantingDate ?? new Date().toISOString(),
      expectedHarvestDate: data.expectedHarvestDate ?? new Date().toISOString(),
      stage: data.stage ?? 'planting',
      areaPlanteAcres: data.areaPlanteAcres ?? 0,
      estimatedYieldTons: data.estimatedYieldTons ?? 0,
      notes: data.notes ?? '',
    });
  },
};

// ─── Delivery Service ─────────────────────────────────────────────────────────

export const DeliveryService = {
  async getAll(): Promise<Delivery[]> {
    return getAll<Delivery>(KEYS.DELIVERIES);
  },

  async getByFarmer(farmerId: string): Promise<Delivery[]> {
    const all = await this.getAll();
    return all.filter((d) => d.farmerId === farmerId);
  },

  async create(data: Omit<Delivery, 'id' | 'createdAt'>): Promise<Delivery> {
    const all = await this.getAll();
    const item: Delivery = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    await saveAll(KEYS.DELIVERIES, all);
    return item;
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await saveAll(KEYS.DELIVERIES, all.filter((d) => d.id !== id));
  },

  async getSeasonTotal(season: string): Promise<number> {
    const all = await this.getAll();
    return all
      .filter((d) => d.season === season)
      .reduce((sum, d) => sum + d.quantityTons, 0);
  },
};

// ─── Payment Service ──────────────────────────────────────────────────────────

export const PaymentService = {
  async getAll(): Promise<Payment[]> {
    return getAll<Payment>(KEYS.PAYMENTS);
  },

  async getByFarmer(farmerId: string): Promise<Payment[]> {
    const all = await this.getAll();
    return all.filter((p) => p.farmerId === farmerId);
  },

  async create(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const all = await this.getAll();
    const item: Payment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    await saveAll(KEYS.PAYMENTS, all);
    return item;
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await saveAll(KEYS.PAYMENTS, all.filter((p) => p.id !== id));
  },
};

// ─── Field Visit Service ──────────────────────────────────────────────────────

export const VisitService = {
  async getAll(): Promise<FieldVisit[]> {
    return getAll<FieldVisit>(KEYS.FIELD_VISITS);
  },

  async getByFarmer(farmerId: string): Promise<FieldVisit[]> {
    const all = await this.getAll();
    return all.filter((v) => v.farmerId === farmerId);
  },

  async create(data: Omit<FieldVisit, 'id' | 'createdAt'>): Promise<FieldVisit> {
    const all = await this.getAll();
    const item: FieldVisit = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    await saveAll(KEYS.FIELD_VISITS, all);
    return item;
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await saveAll(KEYS.FIELD_VISITS, all.filter((v) => v.id !== id));
  },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

export async function seedDemoData(): Promise<void> {
  const existing = await FarmerService.getAll();
  if (existing.length > 0) return; // Already seeded

  const villages = ['Rampur', 'Sultanpur', 'Barabanki', 'Sitapur', 'Hardoi', 'Lakhimpur', 'Pilibhit', 'Shahjahanpur'];
  const districts = ['Lucknow', 'Barabanki', 'Sitapur', 'Hardoi', 'Lakhimpur Kheri', 'Pilibhit', 'Shahjahanpur'];
  const varieties = ['Co 0238', 'CoJ 64', 'CoS 767', 'CoLk 94184', 'Co 86032'];
  const stages: CropProgress['stage'][] = ['planting', 'germination', 'tillering', 'grand_growth', 'maturation', 'harvested'];
  const agents = ['Rajesh Kumar', 'Sunita Devi', 'Amit Singh', 'Priya Sharma'];
  const visitTypes: FieldVisit['visitType'][] = ['routine', 'crop_inspection', 'harvest_planning'];

  const farmerNames = [
    'Ram Prasad', 'Shyam Lal', 'Mohan Singh', 'Suresh Kumar', 'Ramesh Yadav',
    'Dinesh Chandra', 'Vijay Bahadur', 'Anil Kumar', 'Santosh Singh', 'Mukesh Verma',
    'Harish Chandra', 'Devendra Pratap', 'Rajendra Singh', 'Umesh Kumar', 'Girish Pal',
    'Mahesh Yadav', 'Naresh Kumar', 'Kamlesh Singh', 'Rakesh Verma', 'Sanjay Mishra',
  ];

  const season = '2025-26';
  const farmers: Farmer[] = [];

  for (let i = 0; i < farmerNames.length; i++) {
    const num = i + 1;
    const farmer: Farmer = {
      id: generateId(),
      farmerId: `FRM-${String(num).padStart(5, '0')}`,
      name: farmerNames[i],
      phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      village: villages[i % villages.length],
      district: districts[i % districts.length],
      region: 'Uttar Pradesh',
      farmSizeAcres: parseFloat((Math.random() * 8 + 1).toFixed(1)),
      caneVariety: varieties[i % varieties.length],
      status: i < 16 ? 'active' : i < 18 ? 'inactive' : 'pending',
      notes: '',
      createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    farmers.push(farmer);
  }

  await AsyncStorage.setItem(KEYS.FARMERS, JSON.stringify(farmers));
  await AsyncStorage.setItem(KEYS.FARMER_COUNTER, String(farmerNames.length));

  // Seed crop progress
  const crops: CropProgress[] = farmers.slice(0, 16).map((f, i) => ({
    id: generateId(),
    farmerId: f.id,
    season,
    plantingDate: new Date(Date.now() - (180 - i * 5) * 86400000).toISOString(),
    expectedHarvestDate: new Date(Date.now() + (60 + i * 3) * 86400000).toISOString(),
    stage: stages[i % stages.length],
    areaPlanteAcres: f.farmSizeAcres,
    estimatedYieldTons: parseFloat((f.farmSizeAcres * 25).toFixed(1)),
    notes: '',
    updatedAt: new Date().toISOString(),
  }));
  await saveAll(KEYS.CROP_PROGRESS, crops);

  // Seed deliveries
  const deliveries: Delivery[] = [];
  for (let i = 0; i < 30; i++) {
    const farmer = farmers[i % farmers.length];
    deliveries.push({
      id: generateId(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      date: new Date(Date.now() - i * 2 * 86400000).toISOString(),
      quantityTons: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      qualityGrade: (['A', 'B', 'C'] as QualityGrade[])[i % 3],
      vehicleNumber: `UP32-${String(1000 + i)}`,
      receivedBy: agents[i % agents.length],
      notes: '',
      season,
      createdAt: new Date().toISOString(),
    });
  }
  await saveAll(KEYS.DELIVERIES, deliveries);

  // Seed payments
  const payments: Payment[] = [];
  for (let i = 0; i < 20; i++) {
    const farmer = farmers[i % farmers.length];
    payments.push({
      id: generateId(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      date: new Date(Date.now() - i * 3 * 86400000).toISOString(),
      amount: Math.round(Math.random() * 50000 + 10000),
      method: (['bank_transfer', 'cash', 'cheque'] as PaymentMethod[])[i % 3],
      referenceNumber: `PAY-${String(2025001 + i)}`,
      season,
      notes: '',
      createdAt: new Date().toISOString(),
    });
  }
  await saveAll(KEYS.PAYMENTS, payments);

  // Seed field visits
  const visits: FieldVisit[] = [];
  for (let i = 0; i < 25; i++) {
    const farmer = farmers[i % farmers.length];
    visits.push({
      id: generateId(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      visitType: visitTypes[i % visitTypes.length],
      agentName: agents[i % agents.length],
      notes: `Crop looking healthy. Irrigation done. Farmer advised on ${i % 2 === 0 ? 'fertilizer application' : 'pest management'}.`,
      nextAction: i % 2 === 0 ? 'Follow up in 2 weeks' : 'Check irrigation status',
      nextVisitDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  await saveAll(KEYS.FIELD_VISITS, visits);
}
