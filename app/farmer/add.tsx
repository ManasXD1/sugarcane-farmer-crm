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
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useCRM } from "@/lib/crm-context";
import { FarmerService } from "@/lib/storage";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { FarmerStatus } from "@/lib/types";

const VARIETIES = ["Co 0238", "CoJ 64", "CoS 767", "CoLk 94184", "Co 86032", "Other"];
const STATUSES: FarmerStatus[] = ["active", "inactive", "pending"];

export default function AddFarmerScreen() {
  const colors = useColors();
  const router = useRouter();
  const { refreshFarmers } = useCRM();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    district: "",
    region: "Uttar Pradesh",
    farmSizeAcres: "",
    caneVariety: "Co 0238",
    status: "active" as FarmerStatus,
    notes: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) return "Farmer name is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!form.village.trim()) return "Village is required";
    if (!form.district.trim()) return "District is required";
    if (!form.farmSizeAcres || isNaN(Number(form.farmSizeAcres))) return "Valid farm size is required";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Validation Error", err);
      return;
    }
    setSaving(true);
    try {
      await FarmerService.create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        region: form.region.trim(),
        farmSizeAcres: parseFloat(form.farmSizeAcres),
        caneVariety: form.caneVariety,
        status: form.status,
        notes: form.notes.trim(),
      });
      await refreshFarmers();
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save farmer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Farmer</Text>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.7}
          style={styles.saveBtn}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <FormSection title="Personal Information">
          <FormField label="Full Name *" value={form.name} onChangeText={(v) => set("name", v)} placeholder="e.g. Ram Prasad" colors={colors} />
          <FormField label="Phone Number *" value={form.phone} onChangeText={(v) => set("phone", v)} placeholder="e.g. 9876543210" keyboardType="phone-pad" colors={colors} />
        </FormSection>

        <FormSection title="Location">
          <FormField label="Village *" value={form.village} onChangeText={(v) => set("village", v)} placeholder="e.g. Rampur" colors={colors} />
          <FormField label="District *" value={form.district} onChangeText={(v) => set("district", v)} placeholder="e.g. Lucknow" colors={colors} />
          <FormField label="Region / State" value={form.region} onChangeText={(v) => set("region", v)} placeholder="e.g. Uttar Pradesh" colors={colors} />
        </FormSection>

        <FormSection title="Farm Details">
          <FormField
            label="Farm Size (acres) *"
            value={form.farmSizeAcres}
            onChangeText={(v) => set("farmSizeAcres", v)}
            placeholder="e.g. 3.5"
            keyboardType="decimal-pad"
            colors={colors}
          />
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Cane Variety</Text>
            <View style={styles.chipRow}>
              {VARIETIES.map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => set("caneVariety", v)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: form.caneVariety === v ? colors.primary : colors.surface,
                      borderColor: form.caneVariety === v ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13, color: form.caneVariety === v ? "#fff" : colors.muted, fontWeight: "600" }}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Status</Text>
            <View style={styles.chipRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => set("status", s)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: form.status === s ? colors.primary : colors.surface,
                      borderColor: form.status === s ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13, color: form.status === s ? "#fff" : colors.muted, fontWeight: "600", textTransform: "capitalize" }}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FormSection>

        <FormSection title="Notes">
          <TextInput
            value={form.notes}
            onChangeText={(v) => set("notes", v)}
            placeholder="Any additional notes about this farmer…"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            style={[
              styles.textarea,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
          />
        </FormSection>
      </ScrollView>
    </ScreenContainer>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  colors: any;
}) {
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
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    minWidth: 56,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: { gap: 6 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
