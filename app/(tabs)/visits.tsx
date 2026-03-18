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
import type { FieldVisit, VisitType } from "@/lib/types";

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  routine: "Routine Visit",
  crop_inspection: "Crop Inspection",
  problem_resolution: "Problem Resolution",
  harvest_planning: "Harvest Planning",
  payment_discussion: "Payment Discussion",
};

const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  routine: "#4CAF50",
  crop_inspection: "#2E7D32",
  problem_resolution: "#EF5350",
  harvest_planning: "#F59E0B",
  payment_discussion: "#7B61FF",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VisitCard({ visit }: { visit: FieldVisit }) {
  const colors = useColors();
  const typeColor = VISIT_TYPE_COLORS[visit.visitType] ?? colors.primary;
  const typeLabel = VISIT_TYPE_LABELS[visit.visitType] ?? visit.visitType;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + "20" }]}>
          <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.muted }]}>{formatDate(visit.date)}</Text>
      </View>
      <Text style={[styles.farmerName, { color: colors.foreground }]}>{visit.farmerName}</Text>
      <Text style={[styles.agentText, { color: colors.muted }]}>Agent: {visit.agentName}</Text>
      {visit.notes ? (
        <Text style={[styles.notes, { color: colors.foreground }]} numberOfLines={2}>
          {visit.notes}
        </Text>
      ) : null}
      {visit.nextAction ? (
        <View style={[styles.nextAction, { backgroundColor: colors.primary + "10" }]}>
          <IconSymbol name="arrow.right" size={12} color={colors.primary} />
          <Text style={[styles.nextActionText, { color: colors.primary }]} numberOfLines={1}>
            {visit.nextAction}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function VisitsScreen() {
  const { visits, loading } = useCRM();
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#F59E0B" }]}>
        <Text style={styles.headerTitle}>Field Visits</Text>
        <Text style={styles.headerSub}>{visits.length} total visits logged</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VisitCard visit={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="mappin.and.ellipse" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No field visits recorded yet</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/visit/add" as any)}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: "#F59E0B" }]}
      >
        <IconSymbol name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  list: { padding: 16, paddingBottom: 90, gap: 10 },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 12, fontWeight: "700" },
  dateText: { fontSize: 12 },
  farmerName: { fontSize: 16, fontWeight: "700" },
  agentText: { fontSize: 13 },
  notes: { fontSize: 13, lineHeight: 18, opacity: 0.85 },
  nextAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  nextActionText: { fontSize: 12, flex: 1 },
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
