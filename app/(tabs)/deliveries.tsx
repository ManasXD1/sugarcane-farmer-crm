import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Delivery } from "@/lib/types";

const GRADE_COLORS: Record<string, string> = {
  A: "#4CAF50",
  B: "#F59E0B",
  C: "#FF9800",
  D: "#EF5350",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const colors = useColors();
  const gradeColor = GRADE_COLORS[delivery.qualityGrade] ?? colors.muted;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.farmerName, { color: colors.foreground }]}>{delivery.farmerName}</Text>
          <Text style={[styles.dateText, { color: colors.muted }]}>{formatDate(delivery.date)}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={[styles.quantity, { color: colors.foreground }]}>
            {delivery.quantityTons.toFixed(2)} t
          </Text>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor + "20" }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>Grade {delivery.qualityGrade}</Text>
          </View>
        </View>
      </View>
      {(delivery.vehicleNumber || delivery.receivedBy) ? (
        <View style={[styles.cardMeta, { borderTopColor: colors.border }]}>
          {delivery.vehicleNumber ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <IconSymbol name="shippingbox.fill" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{delivery.vehicleNumber}</Text>
            </View>
          ) : null}
          {delivery.receivedBy ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <IconSymbol name="person.fill" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{delivery.receivedBy}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function DeliveriesScreen() {
  const { deliveries, stats, loading } = useCRM();
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#F59E0B" }]}>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <Text style={styles.headerSub}>Season 2025–26</Text>
      </View>

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {stats.totalDeliveryTons.toFixed(1)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Total Tons</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {stats.totalDeliveriesThisSeason}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Deliveries</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {stats.totalDeliveriesThisSeason > 0
              ? (stats.totalDeliveryTons / stats.totalDeliveriesThisSeason).toFixed(1)
              : "0"}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Avg Tons/Trip</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DeliveryCard delivery={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="shippingbox.fill" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No deliveries recorded yet</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/delivery/add" as any)}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: "#F59E0B" }]}
      >
        <IconSymbol name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  summaryBar: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, marginHorizontal: 8 },
  list: { padding: 16, paddingBottom: 90, gap: 10 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  farmerName: { fontSize: 15, fontWeight: "700" },
  dateText: { fontSize: 13, marginTop: 2 },
  quantity: { fontSize: 18, fontWeight: "800" },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  gradeText: { fontSize: 12, fontWeight: "700" },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  metaText: { fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
