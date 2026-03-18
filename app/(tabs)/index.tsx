import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { FieldVisit, Delivery } from "@/lib/types";

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        minWidth: "45%",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: color + "20",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <IconSymbol name={icon as any} size={20} color={color} />
        </View>
        <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>{value}</Text>
      {subtitle ? (
        <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function ActivityItem({ item }: { item: FieldVisit | Delivery }) {
  const colors = useColors();
  const isVisit = "visitType" in item;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isVisit ? "#2E7D3220" : "#F59E0B20",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <IconSymbol
          name={isVisit ? "mappin.and.ellipse" : "shippingbox.fill"}
          size={18}
          color={isVisit ? "#2E7D32" : "#F59E0B"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
          {item.farmerName}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {isVisit
            ? `Field visit · ${(item as FieldVisit).agentName}`
            : `Delivery · ${(item as Delivery).quantityTons.toFixed(1)}t`}
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: colors.muted }}>{formatDate(item.date)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { stats, visits, deliveries, loading } = useCRM();
  const colors = useColors();
  const router = useRouter();

  // Merge and sort recent activity
  const recentActivity = [
    ...visits.slice(0, 5),
    ...deliveries.slice(0, 5),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.muted }}>Loading CRM data…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 28,
          }}
        >
          <Text style={{ fontSize: 13, color: "#A5D6A7", fontWeight: "500" }}>
            Season 2025–26
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 2 }}>
            SugarCRM Dashboard
          </Text>
          <Text style={{ fontSize: 13, color: "#C8E6C9", marginTop: 4 }}>
            Managing {stats.totalFarmers.toLocaleString()} sugarcane farmers
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -12 }}>
          {/* Stat Cards */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <StatCard
              label="Total Farmers"
              value={stats.totalFarmers.toLocaleString()}
              icon="person.2.fill"
              color={colors.primary}
              subtitle={`${stats.activeFarmers} active`}
            />
            <StatCard
              label="Crops Growing"
              value={stats.pendingHarvest}
              icon="leaf.fill"
              color="#4CAF50"
              subtitle="pending harvest"
            />
            <StatCard
              label="Deliveries"
              value={`${stats.totalDeliveryTons.toFixed(0)}t`}
              icon="shippingbox.fill"
              color="#F59E0B"
              subtitle={`${stats.totalDeliveriesThisSeason} trips`}
            />
            <StatCard
              label="Payments"
              value={formatCurrency(stats.totalPaymentsThisSeason)}
              icon="banknote.fill"
              color="#7B61FF"
              subtitle="this season"
            />
          </View>

          {/* Visits This Month */}
          <View
            style={{
              backgroundColor: colors.primary + "15",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
          >
            <IconSymbol name="mappin.and.ellipse" size={22} color={colors.primary} />
            <Text style={{ marginLeft: 10, fontSize: 14, color: colors.foreground, fontWeight: "600" }}>
              {stats.visitsThisMonth} field visits this month
            </Text>
          </View>

          {/* Quick Actions */}
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 10 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Add Farmer", icon: "person.fill", route: "/farmer/add", color: colors.primary },
              { label: "Log Visit", icon: "mappin.and.ellipse", route: "/visit/add", color: "#F59E0B" },
              { label: "Delivery", icon: "shippingbox.fill", route: "/delivery/add", color: "#7B61FF" },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route as any)}
                style={{
                  flex: 1,
                  backgroundColor: action.color + "15",
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: action.color + "30",
                }}
                activeOpacity={0.7}
              >
                <IconSymbol name={action.icon as any} size={22} color={action.color} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: action.color, marginTop: 6 }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
            Recent Activity
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {recentActivity.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 20 }}>
                No recent activity
              </Text>
            ) : (
              recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
