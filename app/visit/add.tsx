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
import { VisitService } from "@/lib/storage";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { VisitType } from "@/lib/types";

const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: "routine", label: "Routine" },
  { value: "crop_inspection", label: "Crop Inspection" },
  { value: "problem_resolution", label: "Problem Resolution" },
  { value: "harvest_planning", label: "Harvest Planning" },
  { value: "payment_discussion", label: "Payment Discussion" },
];

export default function AddVisitScreen() {
  const { farmerId, farmerName } = useLocalSearchParams<{ farmerId?: string; farmerName?: string }>();
  const colors = useColors();
  const router = useRouter();
  const { farmers, refreshVisits } = useCRM();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    farmerId: farmerId ?? "",
    farmerName: farmerName ? decodeURIComponent(farmerName) : "",
    date: new Date().toISOString().split("T")[0],
    visitType: "routine" as VisitType,
    agentName: "",
    notes: "",
    nextAction: "",
    nextVisitDate: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.farmerId) { Alert.alert("Error", "Please select a farmer"); return; }
    if (!form.agentName.trim()) { Alert.alert("Error", "Agent name is required"); return; }
    setSaving(true);
    try {
      await VisitService.create({
        farmerId: form.farmerId,
        farmerName: form.farmerName,
        date: new Date(form.date).toISOString(),
        visitType: form.visitType,
        agentName: form.agentName.trim(),
        notes: form.notes.trim(),
        nextAction: form.nextAction.trim(),
        nextVisitDate: form.nextVisitDate ? new Date(form.nextVisitDate).toISOString() : undefined,
      });
      await refreshVisits();
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <View style={[styles.header, { backgroundColor: "#F59E0B" }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Field Visit</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={styles.saveBtn} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Farmer */}
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

        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>VISIT DETAILS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Visit Date *</Text>
              <TextInput value={form.date} onChangeText={(v) => set("date", v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Visit Type</Text>
              <View style={styles.chipRow}>
                {VISIT_TYPES.map((t) => (
                  <TouchableOpacity key={t.value} onPress={() => set("visitType", t.value)} activeOpacity={0.7}
                    style={[styles.chip, { backgroundColor: form.visitType === t.value ? "#F59E0B" : colors.surface, borderColor: form.visitType === t.value ? "#F59E0B" : colors.border }]}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: form.visitType === t.value ? "#fff" : colors.muted }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Agent Name *</Text>
              <TextInput value={form.agentName} onChangeText={(v) => set("agentName", v)} placeholder="Your name" placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
          </View>
        </View>

        {/* Notes & Follow-up */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>NOTES & FOLLOW-UP</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Visit Notes</Text>
              <TextInput value={form.notes} onChangeText={(v) => set("notes", v)} placeholder="Observations, crop condition, issues found…"
                placeholderTextColor={colors.muted} multiline numberOfLines={4}
                style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Next Action</Text>
              <TextInput value={form.nextAction} onChangeText={(v) => set("nextAction", v)} placeholder="e.g. Follow up on irrigation in 2 weeks"
                placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Next Visit Date (YYYY-MM-DD)</Text>
              <TextInput value={form.nextVisitDate} onChangeText={(v) => set("nextVisitDate", v)} placeholder="Optional"
                placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
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
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 100, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  farmerOption: { paddingVertical: 10, borderBottomWidth: 1 },
});
