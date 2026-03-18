import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
const store: Record<string, string> = {};
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn(async (key: string) => { delete store[key]; }),
    clear: vi.fn(async () => { Object.keys(store).forEach((k) => delete store[k]); }),
  },
}));

import { FarmerService, DeliveryService, PaymentService, VisitService, CropService } from "../lib/storage";

beforeEach(async () => {
  // Clear store before each test
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("FarmerService", () => {
  it("creates a farmer with auto-generated farmerId", async () => {
    const farmer = await FarmerService.create({
      name: "Ram Prasad",
      phone: "9876543210",
      village: "Rampur",
      district: "Lucknow",
      region: "Uttar Pradesh",
      farmSizeAcres: 3.5,
      caneVariety: "Co 0238",
      status: "active",
      notes: "",
    });
    expect(farmer.id).toBeTruthy();
    expect(farmer.farmerId).toMatch(/^FRM-\d{5}$/);
    expect(farmer.name).toBe("Ram Prasad");
    expect(farmer.status).toBe("active");
  });

  it("retrieves all farmers", async () => {
    await FarmerService.create({ name: "Farmer A", phone: "111", village: "V1", district: "D1", region: "R1", farmSizeAcres: 2, caneVariety: "Co 0238", status: "active", notes: "" });
    await FarmerService.create({ name: "Farmer B", phone: "222", village: "V2", district: "D2", region: "R2", farmSizeAcres: 3, caneVariety: "CoJ 64", status: "inactive", notes: "" });
    const all = await FarmerService.getAll();
    expect(all).toHaveLength(2);
  });

  it("updates a farmer", async () => {
    const farmer = await FarmerService.create({ name: "Old Name", phone: "000", village: "V", district: "D", region: "R", farmSizeAcres: 1, caneVariety: "Co 0238", status: "active", notes: "" });
    const updated = await FarmerService.update(farmer.id, { name: "New Name", status: "inactive" });
    expect(updated?.name).toBe("New Name");
    expect(updated?.status).toBe("inactive");
  });

  it("deletes a farmer", async () => {
    const farmer = await FarmerService.create({ name: "To Delete", phone: "000", village: "V", district: "D", region: "R", farmSizeAcres: 1, caneVariety: "Co 0238", status: "active", notes: "" });
    await FarmerService.delete(farmer.id);
    const all = await FarmerService.getAll();
    expect(all.find((f) => f.id === farmer.id)).toBeUndefined();
  });

  it("searches farmers by name", async () => {
    await FarmerService.create({ name: "Ram Prasad", phone: "111", village: "Rampur", district: "D1", region: "R1", farmSizeAcres: 2, caneVariety: "Co 0238", status: "active", notes: "" });
    await FarmerService.create({ name: "Shyam Lal", phone: "222", village: "Sultanpur", district: "D2", region: "R2", farmSizeAcres: 3, caneVariety: "CoJ 64", status: "active", notes: "" });
    const results = await FarmerService.search("ram");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Ram Prasad");
  });
});

describe("DeliveryService", () => {
  it("creates a delivery record", async () => {
    const delivery = await DeliveryService.create({
      farmerId: "farmer-1",
      farmerName: "Ram Prasad",
      date: new Date().toISOString(),
      quantityTons: 15.5,
      qualityGrade: "A",
      vehicleNumber: "UP32-1234",
      receivedBy: "Agent Kumar",
      notes: "",
      season: "2025-26",
    });
    expect(delivery.id).toBeTruthy();
    expect(delivery.quantityTons).toBe(15.5);
    expect(delivery.qualityGrade).toBe("A");
  });

  it("retrieves deliveries by farmer", async () => {
    await DeliveryService.create({ farmerId: "f1", farmerName: "F1", date: new Date().toISOString(), quantityTons: 10, qualityGrade: "A", vehicleNumber: "", receivedBy: "", notes: "", season: "2025-26" });
    await DeliveryService.create({ farmerId: "f2", farmerName: "F2", date: new Date().toISOString(), quantityTons: 20, qualityGrade: "B", vehicleNumber: "", receivedBy: "", notes: "", season: "2025-26" });
    const f1Deliveries = await DeliveryService.getByFarmer("f1");
    expect(f1Deliveries).toHaveLength(1);
    expect(f1Deliveries[0].quantityTons).toBe(10);
  });

  it("calculates season total", async () => {
    await DeliveryService.create({ farmerId: "f1", farmerName: "F1", date: new Date().toISOString(), quantityTons: 10, qualityGrade: "A", vehicleNumber: "", receivedBy: "", notes: "", season: "2025-26" });
    await DeliveryService.create({ farmerId: "f2", farmerName: "F2", date: new Date().toISOString(), quantityTons: 25.5, qualityGrade: "B", vehicleNumber: "", receivedBy: "", notes: "", season: "2025-26" });
    const total = await DeliveryService.getSeasonTotal("2025-26");
    expect(total).toBeCloseTo(35.5);
  });
});

describe("PaymentService", () => {
  it("creates a payment record", async () => {
    const payment = await PaymentService.create({
      farmerId: "f1",
      farmerName: "Ram Prasad",
      date: new Date().toISOString(),
      amount: 25000,
      method: "bank_transfer",
      referenceNumber: "PAY-001",
      season: "2025-26",
      notes: "",
    });
    expect(payment.id).toBeTruthy();
    expect(payment.amount).toBe(25000);
    expect(payment.method).toBe("bank_transfer");
  });

  it("retrieves payments by farmer", async () => {
    await PaymentService.create({ farmerId: "f1", farmerName: "F1", date: new Date().toISOString(), amount: 10000, method: "cash", referenceNumber: "R1", season: "2025-26", notes: "" });
    await PaymentService.create({ farmerId: "f2", farmerName: "F2", date: new Date().toISOString(), amount: 20000, method: "cheque", referenceNumber: "R2", season: "2025-26", notes: "" });
    const f1Payments = await PaymentService.getByFarmer("f1");
    expect(f1Payments).toHaveLength(1);
    expect(f1Payments[0].amount).toBe(10000);
  });
});

describe("VisitService", () => {
  it("creates a field visit record", async () => {
    const visit = await VisitService.create({
      farmerId: "f1",
      farmerName: "Ram Prasad",
      date: new Date().toISOString(),
      visitType: "routine",
      agentName: "Agent Kumar",
      notes: "Crop looking healthy",
      nextAction: "Follow up in 2 weeks",
    });
    expect(visit.id).toBeTruthy();
    expect(visit.visitType).toBe("routine");
    expect(visit.agentName).toBe("Agent Kumar");
  });

  it("retrieves visits by farmer", async () => {
    await VisitService.create({ farmerId: "f1", farmerName: "F1", date: new Date().toISOString(), visitType: "routine", agentName: "A1", notes: "", nextAction: "" });
    await VisitService.create({ farmerId: "f2", farmerName: "F2", date: new Date().toISOString(), visitType: "crop_inspection", agentName: "A2", notes: "", nextAction: "" });
    const f1Visits = await VisitService.getByFarmer("f1");
    expect(f1Visits).toHaveLength(1);
    expect(f1Visits[0].visitType).toBe("routine");
  });
});

describe("CropService", () => {
  it("creates and retrieves crop progress", async () => {
    const crop = await CropService.create({
      farmerId: "f1",
      season: "2025-26",
      plantingDate: new Date().toISOString(),
      expectedHarvestDate: new Date().toISOString(),
      stage: "tillering",
      areaPlanteAcres: 3,
      estimatedYieldTons: 75,
      notes: "",
    });
    expect(crop.id).toBeTruthy();
    expect(crop.stage).toBe("tillering");
    const crops = await CropService.getByFarmer("f1");
    expect(crops).toHaveLength(1);
  });

  it("upserts crop progress for same farmer+season", async () => {
    await CropService.upsertForFarmer("f1", "2025-26", { stage: "planting", plantingDate: new Date().toISOString(), expectedHarvestDate: new Date().toISOString(), areaPlanteAcres: 2, estimatedYieldTons: 50, notes: "" });
    await CropService.upsertForFarmer("f1", "2025-26", { stage: "tillering" });
    const crops = await CropService.getByFarmer("f1");
    expect(crops).toHaveLength(1);
    expect(crops[0].stage).toBe("tillering");
  });
});
