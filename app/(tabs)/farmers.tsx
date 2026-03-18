import {
  FlatList,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Farmer, FarmerStatus } from "@/lib/types";

const CROP_STAGE_LABELS: Record<string, string> = {
  land_preparation: "Land Prep",
  planting: "Planting",
  germination: "Germination",
  tillering: "Tillering",
  grand_growth: "Grand Growth",
  maturation: "Maturation",
  harvested: "Harvested",
};

const STAGE_COLORS: Record<string, string> = {
  land_preparation: "#9E9E9E",
  planting: "#8BC34A",
  germination: "#4CAF50",
  tillering: "#2E7D32",
  grand_growth: "#1B5E20",
  maturation: "#F59E0B",
  harvested: "#7B61FF",
};

type FilterType = "all" | FarmerStatus;

function FarmerCard({ farmer, cropStage }: { farmer: Farmer; cropStage?: string }) {
  const colors = useColors();
  const router = useRouter();
  const stageColor = cropStage ? STAGE_COLORS[cropStage] ?? colors.muted : colors.muted;
  const stageLabel = cropStage ? CROP_STAGE_LABELS[cropStage] ?? cropStage : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/farmer/${farmer.id}` as any)}
      activeOpacity={0.75}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {farmer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={[styles.farmerName, { color: colors.foreground }]} numberOfLines={1}>
            {farmer.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  farmer.status === "active"
                    ? "#4CAF5020"
                    : farmer.status === "inactive"
                    ? "#EF535020"
                    : "#F59E0B20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    farmer.status === "active"
                      ? "#4CAF50"
                      : farmer.status === "inactive"
                      ? "#EF5350"
                      : "#F59E0B",
                },
              ]}
            >
              {farmer.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.farmerId, { color: colors.muted }]}>{farmer.farmerId}</Text>
        <View style={styles.cardMeta}>
          <IconSymbol name="location.fill" size={12} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {farmer.village}, {farmer.district}
          </Text>
          <Text style={[styles.metaDot, { color: colors.muted }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {farmer.farmSizeAcres} ac
          </Text>
        </View>
        {stageLabel ? (
          <View style={[styles.stageBadge, { backgroundColor: stageColor + "20" }]}>
            <View style={[styles.stageDot, { backgroundColor: stageColor }]} />
            <Text style={[styles.stageText, { color: stageColor }]}>{stageLabel}</Text>
          </View>
        ) : null}
      </View>
      <IconSymbol name="chevron.right" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function FarmersScreen() {
  const { farmers, cropProgress, loading } = useCRM();
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Build a map of farmerId -> latest crop stage
  const cropStageMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of cropProgress) {
      map[c.farmerId] = c.stage;
    }
    return map;
  }, [cropProgress]);

  const filtered = useMemo(() => {
    let list = farmers;
    if (filter !== "all") list = list.filter((f) => f.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.farmerId.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.phone.includes(q),
      );
    }
    return list;
  }, [farmers, filter, query]);

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Farmers</Text>
        <Text style={styles.headerSub}>{farmers.length.toLocaleString()} registered</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, ID, village…"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setFilter(opt.value)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: filter === opt.value ? colors.primary : colors.surface,
                borderColor: filter === opt.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === opt.value ? "#fff" : colors.muted },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FarmerCard farmer={item} cropStage={cropStageMap[item.id]} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="person.2.fill" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {query ? "No farmers match your search" : "No farmers found"}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/farmer/add" as any)}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: colors.primary }]}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#C8E6C9",
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardLeft: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  farmerId: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageText: {
    fontSize: 11,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
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
