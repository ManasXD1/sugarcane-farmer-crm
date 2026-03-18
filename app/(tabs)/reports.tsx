import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Share } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMemo } from "react";

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

function BarChart({ data, maxValue, color }: { data: { label: string; value: number }[]; maxValue: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.barChart}>
      {data.map((item) => {
        const pct = maxValue > 0 ? item.value / maxValue : 0;
        return (
          <View key={item.label} style={styles.barItem}>
            <Text style={[styles.barValue, { color: colors.foreground }]}>
              {item.value > 0 ? item.value.toFixed(0) : ""}
            </Text>
            <View style={[styles.barBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  { height: `${Math.max(pct * 100, 2)}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: colors.muted }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ReportsScreen() {
  const { farmers, deliveries, payments, visits, cropProgress, stats } = useCRM();
  const colors = useColors();

  // Deliveries by month (last 6 months)
  const monthlyDeliveries = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-IN", { month: "short" });
      months[key] = 0;
    }
    for (const d of deliveries) {
      const date = new Date(d.date);
      const key = date.toLocaleDateString("en-IN", { month: "short" });
      if (key in months) months[key] += d.quantityTons;
    }
    return Object.entries(months).map(([label, value]) => ({ label, value }));
  }, [deliveries]);

  const maxDelivery = Math.max(...monthlyDeliveries.map((d) => d.value), 1);

  // Top villages by delivery
  const topVillages = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of deliveries) {
      const farmer = farmers.find((f) => f.id === d.farmerId);
      if (farmer) {
        map[farmer.village] = (map[farmer.village] ?? 0) + d.quantityTons;
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([village, tons]) => ({ village, tons }));
  }, [deliveries, farmers]);

  // Crop stage breakdown
  const stageBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cropProgress) {
      map[c.stage] = (map[c.stage] ?? 0) + 1;
    }
    return map;
  }, [cropProgress]);

  // Farmer status breakdown
  const statusBreakdown = {
    active: farmers.filter((f) => f.status === "active").length,
    inactive: farmers.filter((f) => f.status === "inactive").length,
    pending: farmers.filter((f) => f.status === "pending").length,
  };

  const handleShare = async () => {
    const text = `SugarCRM Season 2025-26 Report\n\n` +
      `Total Farmers: ${stats.totalFarmers}\n` +
      `Active Farmers: ${stats.activeFarmers}\n` +
      `Total Deliveries: ${stats.totalDeliveriesThisSeason} trips\n` +
      `Total Cane Delivered: ${stats.totalDeliveryTons.toFixed(1)} tons\n` +
      `Total Payments: ${formatCurrency(stats.totalPaymentsThisSeason)}\n` +
      `Field Visits This Month: ${stats.visitsThisMonth}\n\n` +
      `Top Villages:\n` +
      topVillages.map((v, i) => `${i + 1}. ${v.village}: ${v.tons.toFixed(1)} tons`).join("\n");
    await Share.share({ message: text, title: "SugarCRM Season Report" });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSub}>Season 2025–26 Summary</Text>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={styles.shareBtn}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Season Overview */}
          <SectionCard title="Season Overview" colors={colors}>
            <StatRow label="Total Farmers" value={stats.totalFarmers.toLocaleString()} />
            <StatRow label="Active Farmers" value={stats.activeFarmers.toLocaleString()} color={colors.success} />
            <StatRow label="Inactive Farmers" value={statusBreakdown.inactive.toString()} color={colors.error} />
            <StatRow label="Pending Farmers" value={statusBreakdown.pending.toString()} color={colors.warning} />
            <StatRow label="Total Deliveries" value={`${stats.totalDeliveriesThisSeason} trips`} />
            <StatRow label="Total Cane Delivered" value={`${stats.totalDeliveryTons.toFixed(1)} tons`} color={colors.primary} />
            <StatRow label="Avg per Delivery" value={
              stats.totalDeliveriesThisSeason > 0
                ? `${(stats.totalDeliveryTons / stats.totalDeliveriesThisSeason).toFixed(1)} tons`
                : "—"
            } />
            <StatRow label="Total Payments" value={formatCurrency(stats.totalPaymentsThisSeason)} color="#7B61FF" />
            <StatRow label="Crops Growing" value={`${stats.pendingHarvest} fields`} />
            <StatRow label="Field Visits (this month)" value={stats.visitsThisMonth.toString()} />
          </SectionCard>

          {/* Monthly Delivery Chart */}
          <SectionCard title="Monthly Deliveries (tons)" colors={colors}>
            <BarChart data={monthlyDeliveries} maxValue={maxDelivery} color={colors.primary} />
          </SectionCard>

          {/* Top Villages */}
          <SectionCard title="Top Villages by Delivery" colors={colors}>
            {topVillages.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 12 }}>No data yet</Text>
            ) : (
              topVillages.map((v, i) => (
                <View key={v.village} style={[styles.rankRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.rankBadge, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.rankNum, { color: colors.primary }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.rankLabel, { color: colors.foreground }]}>{v.village}</Text>
                  <Text style={[styles.rankValue, { color: colors.primary }]}>{v.tons.toFixed(1)} t</Text>
                </View>
              ))
            )}
          </SectionCard>

          {/* Crop Stage Breakdown */}
          <SectionCard title="Crop Stage Breakdown" colors={colors}>
            {Object.keys(stageBreakdown).length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 12 }}>No crop data</Text>
            ) : (
              Object.entries(stageBreakdown).map(([stage, count]) => (
                <View key={stage} style={[styles.stageRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.stageLabel, { color: colors.foreground }]}>
                    {stage.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.stageBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.stageBarFill,
                          {
                            width: `${(count / cropProgress.length) * 100}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.stageCount, { color: colors.muted }]}>{count}</Text>
                  </View>
                </View>
              ))
            )}
          </SectionCard>

          {/* Payment Summary */}
          <SectionCard title="Payment Summary" colors={colors}>
            <StatRow label="Total Paid (Season)" value={formatCurrency(stats.totalPaymentsThisSeason)} color="#7B61FF" />
            <StatRow label="Total Payments" value={`${payments.length} transactions`} />
            <StatRow
              label="Avg Payment"
              value={
                payments.length > 0
                  ? formatCurrency(stats.totalPaymentsThisSeason / payments.length)
                  : "—"
              }
            />
          </SectionCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionCard({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "#C8E6C9", marginTop: 2 },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, gap: 14 },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: "700" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 6,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barValue: { fontSize: 9, marginBottom: 2, fontWeight: "600" },
  barBg: {
    width: "100%",
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: { fontSize: 10, marginTop: 4, textAlign: "center" },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum: { fontSize: 13, fontWeight: "800" },
  rankLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
  rankValue: { fontSize: 14, fontWeight: "700" },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  stageLabel: { fontSize: 13, flex: 1 },
  stageBar: {
    width: 80,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  stageBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  stageCount: { fontSize: 13, fontWeight: "600", width: 24, textAlign: "right" },
});
