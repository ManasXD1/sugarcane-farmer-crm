import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  FarmerService,
  CropService,
  DeliveryService,
  PaymentService,
  VisitService,
  seedDemoData,
} from './storage';
import type {
  Farmer,
  CropProgress,
  Delivery,
  Payment,
  FieldVisit,
  DashboardStats,
} from './types';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface CRMContextValue {
  // Data
  farmers: Farmer[];
  deliveries: Delivery[];
  payments: Payment[];
  visits: FieldVisit[];
  cropProgress: CropProgress[];
  stats: DashboardStats;

  // Loading
  loading: boolean;

  // Refresh
  refreshAll: () => Promise<void>;
  refreshFarmers: () => Promise<void>;
  refreshDeliveries: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshVisits: () => Promise<void>;
  refreshCrops: () => Promise<void>;
}

const CRMContext = createContext<CRMContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CRMProvider({ children }: { children: ReactNode }) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [cropProgress, setCropProgress] = useState<CropProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFarmers = useCallback(async () => {
    const data = await FarmerService.getAll();
    setFarmers(data.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const refreshDeliveries = useCallback(async () => {
    const data = await DeliveryService.getAll();
    setDeliveries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const refreshPayments = useCallback(async () => {
    const data = await PaymentService.getAll();
    setPayments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const refreshVisits = useCallback(async () => {
    const data = await VisitService.getAll();
    setVisits(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const refreshCrops = useCallback(async () => {
    const data = await CropService.getAll();
    setCropProgress(data);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshFarmers(),
      refreshDeliveries(),
      refreshPayments(),
      refreshVisits(),
      refreshCrops(),
    ]);
  }, [refreshFarmers, refreshDeliveries, refreshPayments, refreshVisits, refreshCrops]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await seedDemoData();
      await refreshAll();
      setLoading(false);
    })();
  }, [refreshAll]);

  // Compute dashboard stats
  const currentSeason = '2025-26';
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats: DashboardStats = {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter((f) => f.status === 'active').length,
    totalDeliveriesThisSeason: deliveries.filter((d) => d.season === currentSeason).length,
    totalDeliveryTons: deliveries
      .filter((d) => d.season === currentSeason)
      .reduce((sum, d) => sum + d.quantityTons, 0),
    totalPaymentsThisSeason: payments
      .filter((p) => p.season === currentSeason)
      .reduce((sum, p) => sum + p.amount, 0),
    pendingHarvest: cropProgress.filter(
      (c) => c.season === currentSeason && c.stage !== 'harvested',
    ).length,
    visitsThisMonth: visits.filter((v) => new Date(v.date) >= monthStart).length,
  };

  return (
    <CRMContext.Provider
      value={{
        farmers,
        deliveries,
        payments,
        visits,
        cropProgress,
        stats,
        loading,
        refreshAll,
        refreshFarmers,
        refreshDeliveries,
        refreshPayments,
        refreshVisits,
        refreshCrops,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCRM(): CRMContextValue {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
