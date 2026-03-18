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
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { FarmerService, CropService } from "@/lib/storage";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { FarmerStatus, CropStage } from "@/lib/types";

const VARIETIES = ["Co 0238", "CoJ 64", "CoS 767", "CoLk 94184", "Co 86032", "Other"];
const STATUSES: FarmerStatus[] = ["active", "inactive", "pending"];
const STAGES: { value: CropStage; label: string }[] = [
  { value: "land_preparation", label: "Land Prep" },
  { value: "planting", label: "Planting" },
  { value: "germination", label: "Germination" },
  { value: "tillering", label: "Tillering" },
  { value: "grand_growth", label: "Grand Growth" },
  { value: "maturation", label: "Maturation" },
  { value: "harvested", label: "Harvested" },
];

export default function EditFarmerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { farmers, refreshFarmers, refreshCrops } = useCRM();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const farmer = farmers.find((f) => f.id === id);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    district: "",
    region: "",
    farmSizeAcres: "",
    caneVariety: "Co 0238",
    status: "active" as FarmerStatus,
    notes: "",
  });

  const [cropForm, setCropForm] = useState({
    stage: "planting" as CropStage,
    plantingDate: "",
    expectedHarvestDate: "",
    areaPlanteAcres: "",
    estimatedYieldTons: "",
    notes: "",
  });

  useEffect(() => {
    if (farmer) {
      setForm({
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district,
        region: farmer.region,
        farmSizeAcres: String(farmer.farmSizeAcres),
        caneVariety: farmer.caneVariety,
        status: farmer.status,
        notes: farmer.notes,
      });
    }
    (async () => {
      const crops = await CropService.getByFarmer(id!);
      const latest = crops[0];
      if (latest) {
        setCropForm({
          stage: latest.stage,
          plantingDate: latest.plantingDate.split("T")[0],
          expectedHarvestDate: latest.expectedHarvestDate.split("T")[0],
          areaPlanteAcres: String(latest.areaPlanteAcres),
          estimatedYieldTons: String(latest.estimatedYieldTons),
          notes: latest.notes,
        });
      }
      setLoading(false);
    })();
  }, [farmer, id]);

  const setF = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const setC = (key: string, value: string) => setCropForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      await FarmerService.update(id!, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        region: form.region.trim(),
        farmSizeAcres: parseFloat(form.farmSizeAcres) || 0,
        caneVariety: form.caneVariety,
        status: form.status,
        notes: form.notes.trim(),
      });
      if (cropForm.plantingDate) {
        await CropService.upsertForFarmer(id!, "2025-26", {
          stage: cropForm.stage,
          plantingDate: new Date(cropForm.plantingDate).toISOString(),
          expectedHarvestDate: cropForm.expectedHarvestDate
            ? new Date(cropForm.expectedHarvestDate).toISOString()
            : new Date().toISOString(),
          areaPlanteAcres: parseFloat(cropForm.areaPlanteAcres) || 0,
          estimatedYieldTons: parseFloat(cropForm.estimatedYieldTons) || 0,
          notes: cropForm.notes,
        });
      }
      await Promise.all([refreshFarmers(), refreshCrops()]);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Farmer</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={styles.saveBtn} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <FormSection title="Personal Information" colors={colors}>
          <FormField label="Full Name *" value={form.name} onChangeText={(v) => setF("name", v)} colors={colors} />
          <FormField label="Phone" value={form.phone} onChangeText={(v) => setF("phone", v)} keyboardType="phone-pad" colors={colors} />
        </FormSection>

        <FormSection title="Location" colors={colors}>
          <FormField label="Village" value={form.village} onChangeText={(v) => setF("village", v)} colors={colors} />
          <FormField label="District" value={form.district} onChangeText={(v) => setF("district", v)} colors={colors} />
          <FormField label="Region" value={form.region} onChangeText={(v) => setF("region", v)} colors={colors} />
        </FormSection>

        <FormSection title="Farm Details" colors={colors}>
          <FormField label="Farm Size (acres)" value={form.farmSizeAcres} onChangeText={(v) => setF("farmSizeAcres", v)} keyboardType="decimal-pad" colors={colors} />
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Cane Variety</Text>
            <View style={styles.chipRow}>
              {VARIETIES.map((v) => (
                <TouchableOpacity key={v} onPress={() => setF("caneVariety", v)} activeOpacity={0.7}
                  style={[styles.chip, { backgroundColor: form.caneVariety === v ? colors.primary : colors.surface, borderColor: form.caneVariety === v ? colors.primary : colors.border }]}>
                  <Text style={{ fontSize: 12, color: form.caneVariety === v ? "#fff" : colors.muted, fontWeight: "600" }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Status</Text>
            <View style={styles.chipRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity key={s} onPress={() => setF("status", s)} activeOpacity={0.7}
                  style={[styles.chip, { backgroundColor: form.status === s ? colors.primary : colors.surface, borderColor: form.status === s ? colors.primary : colors.border }]}>
                  <Text style={{ fontSize: 13, color: form.status === s ? "#fff" : colors.muted, fontWeight: "600", textTransform: "capitalize" }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FormSection>

        <FormSection title="Crop Progress (2025-26)" colors={colors}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Growth Stage</Text>
            <View style={styles.chipRow}>
              {STAGES.map((s) => (
                <TouchableOpacity key={s.value} onPress={() => setC("stage", s.value)} activeOpacity={0.7}
                  style={[styles.chip, { backgroundColor: cropForm.stage === s.value ? colors.primary : colors.surface, borderColor: cropForm.stage === s.value ? colors.primary : colors.border }]}>
                  <Text style={{ fontSize: 12, color: cropForm.stage === s.value ? "#fff" : colors.muted, fontWeight: "600" }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <FormField label="Planting Date (YYYY-MM-DD)" value={cropForm.plantingDate} onChangeText={(v) => setC("plantingDate", v)} placeholder="2025-06-01" colors={colors} />
          <FormField label="Expected Harvest (YYYY-MM-DD)" value={cropForm.expectedHarvestDate} onChangeText={(v) => setC("expectedHarvestDate", v)} placeholder="2026-01-15" colors={colors} />
          <FormField label="Area Planted (acres)" value={cropForm.areaPlanteAcres} onChangeText={(v) => setC("areaPlanteAcres", v)} keyboardType="decimal-pad" colors={colors} />
          <FormField label="Estimated Yield (tons)" value={cropForm.estimatedYieldTons} onChangeText={(v) => setC("estimatedYieldTons", v)} keyboardType="decimal-pad" colors={colors} />
        </FormSection>

        <FormSection title="Notes" colors={colors}>
          <TextInput
            value={form.notes}
            onChangeText={(v) => setF("notes", v)}
            placeholder="Additional notes…"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
          />
        </FormSection>
      </ScrollView>
    </ScreenContainer>
  );
}

function FormSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function FormField({ label, value, onChangeText, keyboardType, placeholder, colors }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: any; placeholder?: string; colors: any }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType ?? "default"}
        returnKeyType="next"
        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
      />
    </View>
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
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
});
