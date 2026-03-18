# SugarCRM – Sugarcane Farmer CRM: Interface Design

## App Overview
A mobile CRM for field agents and managers to track 70,000 sugarcane farmers — managing profiles, crop progress, deliveries, payments, and field visits.

---

## Color Palette
- **Primary Green:** `#2E7D32` (sugarcane/agriculture green)
- **Accent Amber:** `#F59E0B` (harvest/sugarcane gold)
- **Background Light:** `#F9FBF7` (soft off-white with green tint)
- **Background Dark:** `#0F1A0F` (deep forest dark)
- **Surface Light:** `#FFFFFF`
- **Surface Dark:** `#1A2B1A`
- **Foreground Light:** `#1A2B1A`
- **Foreground Dark:** `#E8F5E9`
- **Muted Light:** `#5A7A5A`
- **Muted Dark:** `#8FAF8F`
- **Border Light:** `#C8E6C9`
- **Border Dark:** `#2E4A2E`
- **Success:** `#4CAF50`
- **Warning:** `#F59E0B`
- **Error:** `#EF5350`

---

## Screen List

### Tab Bar (5 tabs)
1. **Dashboard** – Overview stats and quick actions
2. **Farmers** – Full farmer directory with search/filter
3. **Field Visits** – Log and manage field visits
4. **Deliveries** – Track cane deliveries and quantities
5. **Reports** – Summary reports and analytics

### Modal / Stack Screens
- **Farmer Profile** – Detailed farmer view
- **Add / Edit Farmer** – Form to create or update a farmer record
- **Farmer Crop Progress** – Crop stage, planting date, expected harvest
- **Payment History** – Payment records per farmer
- **Add Field Visit** – Log a new field visit with notes
- **Add Delivery** – Record a new cane delivery
- **Notifications** – App-wide alerts and reminders

---

## Primary Content & Functionality

### Dashboard
- Summary cards: Total Farmers, Active Crops, Pending Deliveries, Total Payments
- Recent Activity feed (last 5 field visits / deliveries)
- Quick action buttons: Add Farmer, Log Visit, Record Delivery
- Monthly delivery chart (bar chart using react-native-svg)

### Farmers Screen
- Searchable, filterable FlatList of all farmers
- Filter chips: All | Active | Inactive | Pending Harvest
- Each card shows: Name, ID, Village, Farm Size, Crop Stage badge
- FAB button to add a new farmer

### Farmer Profile
- Header: Name, Photo placeholder, Farmer ID, Phone
- Info grid: Village, District, Farm Size (acres), Variety
- Tabs within profile: Overview | Crop | Deliveries | Payments | Visits
- Edit button in header

### Field Visits Screen
- Chronological list of all visits
- Each item: Farmer name, Date, Agent, Visit type, Notes preview
- Filter by date range or farmer

### Deliveries Screen
- List of all deliveries sorted by date
- Each item: Farmer, Date, Quantity (tons), Quality grade, Status
- Summary bar: Total this season

### Reports Screen
- Season summary: Total cane delivered, Avg per farmer, Top regions
- Farmer status breakdown (pie chart)
- Export options (share as text summary)

---

## Key User Flows

### Add a New Farmer
1. Tap "Farmers" tab → FAB (+) button
2. Fill form: Name, Phone, Village, District, Farm Size, Variety, Status
3. Tap "Save" → Farmer appears in list

### Log a Field Visit
1. Tap "Field Visits" tab → (+) button
2. Search/select farmer → Fill: Date, Visit Type, Notes, Next Action
3. Tap "Save" → Visit logged, appears in farmer profile

### Record a Delivery
1. Tap "Deliveries" tab → (+) button
2. Select farmer, enter: Date, Quantity, Quality Grade
3. Tap "Save" → Delivery recorded, farmer stats updated

### View Farmer Progress
1. Tap farmer card → Profile screen
2. Tap "Crop" tab → See planting date, growth stage, expected harvest
3. Tap "Deliveries" tab → See all delivery records
4. Tap "Payments" tab → See payment history

---

## Navigation Structure
```
(tabs)/
  dashboard     ← Home/overview
  farmers       ← Farmer directory
  visits        ← Field visits
  deliveries    ← Delivery records
  reports       ← Analytics

(stack)/
  farmer/[id]           ← Farmer profile
  farmer/add            ← Add farmer form
  farmer/[id]/edit      ← Edit farmer form
  visit/add             ← Add field visit
  delivery/add          ← Add delivery
```

---

## Layout Principles
- **One-handed portrait** design throughout
- Bottom tab bar with 5 items, icon + label
- Cards with subtle shadow and rounded corners (12px)
- Green-tinted status badges for crop stages
- Large tap targets (min 44pt) for field use
- FlatList for all long lists (performance with 70k records)
- Search bar sticky at top of Farmers screen
