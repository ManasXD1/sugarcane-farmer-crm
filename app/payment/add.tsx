import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { PaymentService } from "@/lib/storage";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { PaymentMethod } from "@/lib/types";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "mobile_money", label: "Mobile Money" },
];

export default function AddPaymentScreen() {
  const { farmerId, farmerName } = useLocalSearchParams<{ farmerId?: string; farmerName?: string }>();
  const colors = useColors();
  const router = useRouter();
  const { farmers, refreshPayments } = useCRM();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    farmerId: farmerId ?? "",
    farmerName: farmerName ? decodeURIComponent(farmerName) : "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    method: "bank_transfer" as PaymentMethod,
    referenceNumber: `PAY-${Date.now()}`,
    season: "2025-26",
    notes: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.farmerId) { Alert.alert("Error", "Please select a farmer"); return; }
    if (!form.amount || isNaN(Number(form.amount))) { Alert.alert("Error", "Valid amount is required"); return; }
    setSaving(true);
    try {
      await PaymentService.create({
        farmerId: form.farmerId,
        farmerName: form.farmerName,
        date: new Date(form.date).toISOString(),
        amount: parseFloat(form.amount),
        method: form.method,
        referenceNumber: form.referenceNumber.trim(),
        season: form.season,
        notes: form.notes.trim(),
      });
      await refreshPayments();
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <View style={[styles.header, { backgroundColor: "#7B61FF" }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={styles.saveBtn} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>FARMER</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {form.farmerName ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{form.farmerName}</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>{form.farmerId}</Text>
                </View>
                <TouchableOpacity onPress={() => { set("farmerId", ""); set("farmerName", ""); }} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={22} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>Select a farmer:</Text>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {farmers.slice(0, 30).map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => { set("farmerId", f.id); set("farmerName", f.name); }}
                      activeOpacity={0.7}
                      style={[styles.farmerOption, { borderBottomColor: colors.border }]}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{f.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>{f.farmerId} · {f.village}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>PAYMENT DETAILS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Date *</Text>
              <TextInput value={form.date} onChangeText={(v) => set("date", v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Amount (₹) *</Text>
              <TextInput value={form.amount} onChangeText={(v) => set("amount", v)} placeholder="e.g. 25000" placeholderTextColor={colors.muted}
                keyboardType="numeric" style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Payment Method</Text>
              <View style={styles.chipRow}>
                {METHODS.map((m) => (
                  <TouchableOpacity key={m.value} onPress={() => set("method", m.value)} activeOpacity={0.7}
                    style={[styles.chip, { backgroundColor: form.method === m.value ? "#7B61FF" : colors.surface, borderColor: form.method === m.value ? "#7B61FF" : colors.border }]}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: form.method === m.value ? "#fff" : colors.muted }}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Reference Number</Text>
              <TextInput value={form.referenceNumber} onChangeText={(v) => set("referenceNumber", v)} placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Notes</Text>
              <TextInput value={form.notes} onChangeText={(v) => set("notes", v)} placeholder="Optional notes…" placeholderTextColor={colors.muted}
                multiline numberOfLines={3} style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: "#fff" },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, minWidth: 56, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  form: { padding: 16, paddingBottom: 40, gap: 16 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginLeft: 4 },
  sectionCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  farmerOption: { paddingVertical: 10, borderBottomWidth: 1 },
});
