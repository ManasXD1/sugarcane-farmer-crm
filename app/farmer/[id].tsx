import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  CropService,
  DeliveryService,
  PaymentService,
  VisitService,
} from "@/lib/storage";
import type { CropProgress, Delivery, Payment, FieldVisit } from "@/lib/types";

const STAGE_LABELS: Record<string, string> = {
  land_preparation: "Land Preparation",
  planting: "Planting",
  germination: "Germination",
  tillering: "Tillering",
  grand_growth: "Grand Growth",
  maturation: "Maturation",
  harvested: "Harvested",
};

const STAGE_ORDER = [
  "land_preparation",
  "planting",
  "germination",
  "tillering",
  "grand_growth",
  "maturation",
  "harvested",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

type TabKey = "overview" | "crop" | "deliveries" | "payments" | "visits";

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { farmers, refreshAll } = useCRM();
  const colors = useColors();
  const router = useRouter();

  const farmer = farmers.find((f) => f.id === id);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [crops, setCrops] = useState<CropProgress[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [c, d, p, v] = await Promise.all([
      CropService.getByFarmer(id),
      DeliveryService.getByFarmer(id),
      PaymentService.getByFarmer(id),
      VisitService.getByFarmer(id),
    ]);
    setCrops(c);
    setDeliveries(d.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setPayments(p.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setVisits(v.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!farmer) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>Farmer not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "crop", label: "Crop" },
    { key: "deliveries", label: "Deliveries" },
    { key: "payments", label: "Payments" },
    { key: "visits", label: "Visits" },
  ];

  const latestCrop = crops[0];
  const totalDeliveries = deliveries.reduce((s, d) => s + d.quantityTons, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <IconSymbol name="arrow.left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{farmer.name.charAt(0)}</Text>
          </View>
          <Text style={styles.headerName}>{farmer.name}</Text>
          <Text style={styles.headerSub}>{farmer.farmerId} · {farmer.caneVariety}</Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  farmer.status === "active"
                    ? "#4CAF5040"
                    : farmer.status === "inactive"
                    ? "#EF535040"
                    : "#F59E0B40",
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    farmer.status === "active"
                      ? "#A5D6A7"
                      : farmer.status === "inactive"
                      ? "#EF9A9A"
                      : "#FBBF24",
                },
              ]}
            >
              {farmer.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/farmer/${id}/edit` as any)}
          activeOpacity={0.7}
          style={styles.editBtn}
        >
          <IconSymbol name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.muted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <View style={{ gap: 12 }}>
              <InfoSection title="Contact & Location">
                <InfoRow icon="phone.fill" label="Phone" value={farmer.phone} colors={colors} />
                <InfoRow icon="location.fill" label="Village" value={farmer.village} colors={colors} />
                <InfoRow icon="building.2.fill" label="District" value={farmer.district} colors={colors} />
                <InfoRow icon="map.fill" label="Region" value={farmer.region} colors={colors} />
              </InfoSection>
              <InfoSection title="Farm Details">
                <InfoRow icon="leaf.fill" label="Farm Size" value={`${farmer.farmSizeAcres} acres`} colors={colors} />
                <InfoRow icon="tag.fill" label="Variety" value={farmer.caneVariety} colors={colors} />
                <InfoRow icon="calendar" label="Registered" value={formatDate(farmer.createdAt)} colors={colors} />
              </InfoSection>
              <InfoSection title="Season Summary">
                <InfoRow icon="shippingbox.fill" label="Total Delivered" value={`${totalDeliveries.toFixed(1)} tons`} colors={colors} />
                <InfoRow icon="banknote.fill" label="Total Paid" value={formatCurrency(totalPayments)} colors={colors} />
                <InfoRow icon="mappin.and.ellipse" label="Field Visits" value={`${visits.length}`} colors={colors} />
              </InfoSection>
              {farmer.notes ? (
                <InfoSection title="Notes">
                  <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 20 }}>
                    {farmer.notes}
                  </Text>
                </InfoSection>
              ) : null}
            </View>
          )}

          {/* CROP TAB */}
          {activeTab === "crop" && (
            <View style={{ gap: 12 }}>
              {latestCrop ? (
                <>
                  <InfoSection title={`Season ${latestCrop.season}`}>
                    <InfoRow icon="calendar" label="Planted" value={formatDate(latestCrop.plantingDate)} colors={colors} />
                    <InfoRow icon="calendar" label="Expected Harvest" value={formatDate(latestCrop.expectedHarvestDate)} colors={colors} />
                    <InfoRow icon="leaf.fill" label="Area Planted" value={`${latestCrop.areaPlanteAcres} acres`} colors={colors} />
                    <InfoRow icon="shippingbox.fill" label="Est. Yield" value={`${latestCrop.estimatedYieldTons} tons`} colors={colors} />
                    {latestCrop.actualYieldTons ? (
                      <InfoRow icon="checkmark.circle.fill" label="Actual Yield" value={`${latestCrop.actualYieldTons} tons`} colors={colors} />
                    ) : null}
                  </InfoSection>
                  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Growth Stage</Text>
                    <View style={{ marginTop: 12, gap: 8 }}>
                      {STAGE_ORDER.map((stage, idx) => {
                        const currentIdx = STAGE_ORDER.indexOf(latestCrop.stage);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const color = isCurrent ? colors.primary : isPast ? colors.success : colors.border;
                        return (
                          <View key={stage} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: color,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {(isPast || isCurrent) && (
                                <IconSymbol name="checkmark" size={12} color="#fff" />
                              )}
                            </View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: isCurrent ? "700" : "400",
                                color: isCurrent ? colors.primary : isPast ? colors.foreground : colors.muted,
                              }}
                            >
                              {STAGE_LABELS[stage]}
                            </Text>
                            {isCurrent && (
                              <View style={[styles.currentBadge, { backgroundColor: colors.primary + "20" }]}>
                                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: "700" }}>CURRENT</Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </>
              ) : (
                <EmptyState icon="leaf.fill" message="No crop records yet" />
              )}
              <TouchableOpacity
                onPress={() => router.push(`/farmer/${id}/edit` as any)}
                activeOpacity={0.7}
                style={[styles.addBtn, { borderColor: colors.primary }]}
              >
                <IconSymbol name="plus" size={16} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Update Crop Progress</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DELIVERIES TAB */}
          {activeTab === "deliveries" && (
            <View style={{ gap: 10 }}>
              {deliveries.length > 0 && (
                <View style={[styles.summaryBar, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>
                    Total: {totalDeliveries.toFixed(1)} tons · {deliveries.length} deliveries
                  </Text>
                </View>
              )}
              {deliveries.length === 0 ? (
                <EmptyState icon="shippingbox.fill" message="No deliveries recorded" />
              ) : (
                deliveries.map((d) => (
                  <View key={d.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
                        {d.quantityTons.toFixed(2)} tons
                      </Text>
                      <View style={[styles.gradeBadge, { backgroundColor: "#F59E0B20" }]}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#F59E0B" }}>
                          Grade {d.qualityGrade}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
                      {formatDate(d.date)} · {d.vehicleNumber}
                    </Text>
                    {d.receivedBy ? (
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                        Received by: {d.receivedBy}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
              <TouchableOpacity
                onPress={() => router.push(`/delivery/add?farmerId=${id}&farmerName=${encodeURIComponent(farmer.name)}` as any)}
                activeOpacity={0.7}
                style={[styles.addBtn, { borderColor: colors.primary }]}
              >
                <IconSymbol name="plus" size={16} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Record Delivery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <View style={{ gap: 10 }}>
              {payments.length > 0 && (
                <View style={[styles.summaryBar, { backgroundColor: "#7B61FF15", borderColor: "#7B61FF30" }]}>
                  <Text style={{ color: "#7B61FF", fontWeight: "700" }}>
                    Total Paid: {formatCurrency(totalPayments)}
                  </Text>
                </View>
              )}
              {payments.length === 0 ? (
                <EmptyState icon="banknote.fill" message="No payments recorded" />
              ) : (
                payments.map((p) => (
                  <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                        {formatCurrency(p.amount)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, textTransform: "capitalize" }}>
                        {p.method.replace("_", " ")}
                      </Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
                      {formatDate(p.date)} · Ref: {p.referenceNumber}
                    </Text>
                  </View>
                ))
              )}
              <TouchableOpacity
                onPress={() => router.push(`/payment/add?farmerId=${id}&farmerName=${encodeURIComponent(farmer.name)}` as any)}
                activeOpacity={0.7}
                style={[styles.addBtn, { borderColor: "#7B61FF" }]}
              >
                <IconSymbol name="plus" size={16} color="#7B61FF" />
                <Text style={[styles.addBtnText, { color: "#7B61FF" }]}>Add Payment</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* VISITS TAB */}
          {activeTab === "visits" && (
            <View style={{ gap: 10 }}>
              {visits.length === 0 ? (
                <EmptyState icon="mappin.and.ellipse" message="No field visits recorded" />
              ) : (
                visits.map((v) => (
                  <View key={v.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, textTransform: "capitalize" }}>
                        {v.visitType.replace("_", " ")}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>{formatDate(v.date)}</Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                      Agent: {v.agentName}
                    </Text>
                    {v.notes ? (
                      <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 6, lineHeight: 18 }} numberOfLines={3}>
                        {v.notes}
                      </Text>
                    ) : null}
                    {v.nextAction ? (
                      <View style={[styles.nextActionBox, { backgroundColor: colors.primary + "10" }]}>
                        <IconSymbol name="arrow.right" size={12} color={colors.primary} />
                        <Text style={{ fontSize: 12, color: colors.primary, flex: 1 }}>{v.nextAction}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
              <TouchableOpacity
                onPress={() => router.push(`/visit/add?farmerId=${id}&farmerName=${encodeURIComponent(farmer.name)}` as any)}
                activeOpacity={0.7}
                style={[styles.addBtn, { borderColor: "#F59E0B" }]}
              >
                <IconSymbol name="plus" size={16} color="#F59E0B" />
                <Text style={[styles.addBtnText, { color: "#F59E0B" }]}>Log Field Visit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={{ marginTop: 10, gap: 8 }}>{children}</View>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <IconSymbol name={icon as any} size={16} color={colors.muted} />
      <Text style={{ fontSize: 13, color: colors.muted, width: 100 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: colors.foreground, flex: 1, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <IconSymbol name={icon as any} size={44} color={colors.border} />
      <Text style={{ color: colors.muted, fontSize: 15, marginTop: 8 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backBtn: {
    padding: 8,
    marginTop: 4,
  },
  editBtn: {
    padding: 8,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarTextLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  headerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#C8E6C9",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tabBar: {
    borderBottomWidth: 1,
    flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryBar: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextActionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
});
