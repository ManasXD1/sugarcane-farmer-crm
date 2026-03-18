// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // CRM Tabs
  "chart.bar.fill": "bar-chart",
  "person.2.fill": "people",
  "mappin.and.ellipse": "place",
  "shippingbox.fill": "local-shipping",
  "doc.text.fill": "description",
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "pencil": "edit",
  "trash": "delete",
  "magnifyingglass": "search",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "square.and.arrow.up": "share",
  "bell.fill": "notifications",
  "gear": "settings",
  "phone.fill": "phone",
  "location.fill": "location-on",
  "calendar": "calendar-today",
  "clock.fill": "access-time",
  "star.fill": "star",
  "info.circle": "info",
  "exclamationmark.triangle.fill": "warning",
  "person.fill": "person",
  "person.crop.circle.fill": "account-circle",
  "leaf.fill": "eco",
  "cart.fill": "shopping-cart",
  "banknote.fill": "payments",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "arrow.clockwise": "refresh",
  "list.bullet": "list",
  "slider.horizontal.3": "tune",
  "map.fill": "map",
  "building.2.fill": "business",
  "tag.fill": "label",
  "note.text": "note",
  "tray.fill": "inbox",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-vert",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
