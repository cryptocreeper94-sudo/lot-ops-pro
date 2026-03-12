import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simplified PIN-based auth for internal use
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  pin: varchar("pin", { length: 10 }).notNull().unique(), // 4-digit PIN or badge number
  name: text("name").notNull(), // Display name
  email: text("email"), // Email for Stripe subscriptions
  role: text("role").default("driver").notNull(), // supervisor, driver, merchandising, imaging
  department: text("department"), // Transport, Merch, Imaging, etc.
  isActive: boolean("is_active").default(true).notNull(),
  profilePhoto: text("profile_photo"), // Base64 encoded image for instant messaging avatars
  termsAccepted: boolean("terms_accepted").default(false).notNull(), // Whether user accepted Terms of Service
  termsAcceptedAt: timestamp("terms_accepted_at"), // When they accepted ToS
  mustChangePin: boolean("must_change_pin").default(false).notNull(), // Forces PIN change on next login (temporary PIN security)
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id"), // Current subscription ID
  subscriptionTier: text("subscription_tier").default("demo"), // demo, scanner, lite, pro, enterprise
  subscriptionActive: boolean("subscription_active").default(false), // Whether subscription is active
  // AUDIT TRAIL - Track who created this PIN/account
  createdBy: text("created_by"), // Name of person who registered them (supervisor/ops manager)
  createdByEmployeeId: integer("created_by_employee_id"), // Link to employees table to get temp/permanent status
  createdByEmployeeType: text("created_by_employee_type"), // "permanent" or "temporary" - captured at time of creation
  createdAt: timestamp("created_at").defaultNow().notNull(), // When PIN account was created (not when user registered)
  // Van Driver Fuel Code Storage
  fuelCode: text("fuel_code"), // Fuel card code for van drivers to store and retrieve
});

// Daily Access Codes (Two-Factor Authentication)
export const dailyAccessCodes = pgTable("daily_access_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(), // 6-digit daily code
  date: text("date").notNull().unique(), // "2025-11-22" format
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // End of day
  isActive: boolean("is_active").default(true).notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation - NULL for internal Lot Ops Pro
  phoneLast4: varchar("phone_last_4", { length: 4 }).notNull(), // Last 4 of phone number (permanent driver ID)
  name: text("name").notNull(), // Driver's full name
  employeeId: integer("employee_id"), // Linked to permanent roster
  status: text("status").notNull().default("idle"), // "idle", "busy", "break"
  isOnRoster: boolean("is_on_roster").default(false), // Added to today's roster by supervisor
  currentZone: text("current_zone"),
  lastActive: timestamp("last_active").defaultNow(),
  gpsLatitude: text("gps_latitude"),
  gpsLongitude: text("gps_longitude"),
  gpsUpdatedAt: timestamp("gps_updated_at"),
  profilePhoto: text("profile_photo"), // Base64 encoded image or URL
  vanNumber: text("van_number"), // Current van assignment (e.g., "VAN001")
  vanDriverApprovalStatus: text("van_driver_approval_status").default("pending"), // pending, approved, denied
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // CRITICAL: Multi-tenant isolation - NULL for internal Lot Ops Pro
  fromId: varchar("from_id").notNull(), // "Supervisor" or Driver Number or Supervisor ID (phone last 4)
  fromName: text("from_name"), // Display name for sender
  fromRole: text("from_role"), // "supervisor", "driver", "operations_manager"
  toId: varchar("to_id"), // Specific Driver/Supervisor Number or null for broadcast
  toName: text("to_name"), // Display name for recipient
  toRole: text("to_role"), // "supervisor", "driver", "operations_manager", "all_supervisors"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isOfficial: boolean("is_official").default(false).notNull(), // Official company messages (saved/logged) vs Private (not stored long-term)
});

export const evChargingLogs = pgTable("ev_charging_logs", {
  id: serial("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  vin: text("vin").notNull(),
  workOrder: text("work_order"),
  action: text("action").notNull(), // 'plugged_in', 'unplugged'
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- PERMANENT EMPLOYEE ROSTER ---
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation - NULL for internal Lot Ops Pro
  name: text("name").notNull(),
  badgeNumber: varchar("badge_number").notNull(), // Permanent ID (e.g. "EMP001") or Temp Badge (e.g. "7348")
  phoneLast4: varchar("phone_last_4", { length: 4 }), // Last 4 of phone (permanent driver ID)
  department: text("department").default("Transport"), // Transport, Merch, Imaging, etc.
  role: text("role").default("driver"), // driver, trainee, lead, supervisor
  type: text("type").default("permanent"), // permanent, temporary
  employmentStatus: text("employment_status").default("active").notNull(), // "active", "temporary", "terminated", "dnr" (do not return)
  isActive: boolean("is_active").default(true), // Still employed (deprecated - use employmentStatus)
  isOnShiftToday: boolean("is_on_shift_today").default(false), // Actively working today (toggle per shift)
  terminationDate: text("termination_date"), // "2025-11-20" - when terminated/DNR'd
  terminationReason: text("termination_reason"), // Why they were terminated
  profilePhoto: text("profile_photo"), // Base64 encoded image or URL
  designation: text("designation"), // Special title assigned by Teresa (e.g., "Safety Advisor", "Service Truck Driver")
  notes: text("notes"), // Additional notes about employee
  hireDate: text("hire_date"), // "2025-01-15" - when they started
  tempStartDate: text("temp_start_date"), // "2025-11-20" - when temp assignment started
  tempEndDate: text("temp_end_date"), // "2025-11-27" - when temp assignment expires
  tempDurationWeeks: integer("temp_duration_weeks"), // How many weeks temp is assigned (1, 2, 4 for 1 month, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- EMPLOYEE DESIGNATIONS (Titles Teresa can assign) ---
export const employeeDesignations = pgTable("employee_designations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(), // e.g., "Safety Representative", "Team Lead", "Trainer"
  description: text("description"), // What this designation means
  createdBy: text("created_by"), // Teresa's name/ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- VEHICLE TRACKING (Smart Scanner Data) ---
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation - NULL for internal Lot Ops Pro
  vin: varchar("vin", { length: 17 }).notNull(),
  workOrder: text("work_order"),
  year: text("year"),
  make: text("make"),
  model: text("model"),
  dealer: text("dealer"),
  mileage: text("mileage"), // Vehicle mileage from sticker
  currentLocation: text("current_location"), // Current lot/zone (e.g., "515", "DSC")
  nextLocation: text("next_location"), // Routing destination
  saleWeek: text("sale_week"), // Week number (1-52)
  saleLane: text("sale_lane"), // Lane number (1-55)
  saleSpot: text("sale_spot"), // Spot number within lane (e.g., 113 in "46:113")
  saleDay: text("sale_day"), // Tuesday, Wednesday, Thursday
  overflowParking: text("overflow_parking"), // Overflow location identifier (e.g., "Drive Lane 41-51", "Grass Line 515", "Arena 600", "Arena 700")
  gpsLatitude: text("gps_latitude"), // Last known GPS position
  gpsLongitude: text("gps_longitude"),
  lastScannedBy: text("last_scanned_by"), // Driver/user who last scanned
  lastScannedAt: timestamp("last_scanned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- WORK ORDERS (Teresa's Assignment Lists) ---
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation - NULL for internal Lot Ops Pro
  title: text("title").notNull(), // "Move to Sale - Wednesday"
  description: text("description"),
  type: text("type").notNull().default("move_to_sale"), // move_to_sale, inventory_check, etc.
  jobType: text("job_type"), // clean_side, sold_lots, sailing_lists, shops_ready
  priority: text("priority").default("normal"), // high, normal, low
  assignedTo: text("assigned_to"), // Driver PIN or "unassigned"
  assignedVan: text("assigned_van"), // Van number
  assignedCrew: text("assigned_crew"), // Crew name/number
  status: text("status").default("pending"), // pending, in_progress, completed
  totalCars: integer("total_cars").default(0),
  completedCars: integer("completed_cars").default(0),
  createdBy: text("created_by").notNull(), // Supervisor PIN
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// --- WORK ORDER ITEMS (Individual Cars in Work Order) ---
export const workOrderItems = pgTable("work_order_items", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation - NULL for internal Lot Ops Pro
  workOrderId: integer("work_order_id").notNull(),
  vin: varchar("vin", { length: 17 }).notNull(),
  currentLocation: text("current_location"),
  targetLocation: text("target_location").notNull(),
  status: text("status").default("pending"), // pending, completed, inoperable
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  inoperable: boolean("inoperable").default(false), // Vehicle can't be moved
});

// --- OVERFLOW PARKING ZONES (Emergency Parking Areas) ---
export const overflowParkingZones = pgTable("overflow_parking_zones", {
  id: serial("id").primaryKey(),
  zoneType: text("zone_type").notNull(), // "drive_lane", "grass_line", "arena"
  zoneIdentifier: text("zone_identifier").notNull(), // e.g., "Drive Lane 41-51", "Grass Line 515", "Arena 600", "Arena 700"
  description: text("description"), // "Between Lane 41 and Lane 51 (Tuesday Sale Lanes)"
  associatedLanes: text("associated_lanes"), // Lanes this is between/beside (comma-separated for drive lanes)
  maxCapacity: integer("max_capacity"), // Estimated car capacity
  isActive: boolean("is_active").default(true).notNull(),
  usageRestrictions: text("usage_restrictions"), // "Non-sale days only", "No Monday-Tuesday preceding sales", "Anytime"
  notes: text("notes"), // Additional details
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- LANE CONFIGURATIONS (Dynamic by Week) ---
export const laneConfigs = pgTable("lane_configs", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(), // e.g., 47, 48
  laneNumber: integer("lane_number").notNull(), // e.g., 13, 42, 516
  saleDay: text("sale_day"), // "Tuesday", "Wednesday", "Thursday"
  totalSpots: integer("total_spots").notNull().default(0), // e.g., 248
  reverseOrientation: boolean("reverse_orientation").default(false).notNull(), // Toggle if lane starts on opposite side
  isOverflow: boolean("is_overflow").default(false).notNull(), // Special overflow designation
  overflowLabel: text("overflow_label"), // "Overflow 20", "Overflow A", "Overflow B"
  spotsPerDesignation: integer("spots_per_designation").default(1).notNull(), // How many spots per parking designation (1, 2, or 3). e.g., Lane 41 counts by 2s, Lanes 31/32/42 count by 3s
  notes: text("notes"), // "LP at spot 100", "FH near end", custom config notes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- DAILY CREW ASSIGNMENTS (Teresa's Daily Role Setup) ---
export const crewAssignments = pgTable("crew_assignments", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // "2025-11-20" - today's date
  shift: text("shift").notNull().default("first_shift"), // "first_shift", "second_shift"
  phoneLastFour: varchar("phone_last_four", { length: 4 }).notNull(), // "7777"
  name: text("name").notNull(), // "John Smith"
  assignedRole: text("assigned_role").notNull(), // "van_driver", "inventory_driver", "supervisor", "off_duty"
  assignedBy: text("assigned_by").notNull(), // "Teresa" or supervisor PIN
  notes: text("notes"), // "Fill-in for Mike"
  assignedToVanDriver: varchar("assigned_to_van_driver", { length: 4 }), // "5555" - phone last 4 of van driver this crew member works under (inventory drivers only)
  crewId: varchar("crew_id", { length: 50 }), // "CREW_VAN5555" - crew identifier for quick grouping
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- LOT SPACE TRACKING (Inventory Capacity Management) ---
export const lotSpaces = pgTable("lot_spaces", {
  id: serial("id").primaryKey(),
  lotNumber: varchar("lot_number").notNull().unique(), // "515", "513", "DSC", "REG"
  lotName: text("lot_name").notNull(), // "Main Inventory", "Dealer Special Cars"
  capacity: integer("capacity").notNull().default(0), // Total parking spots
  currentOccupancy: integer("current_occupancy").notNull().default(0), // Cars currently parked
  zoneType: text("zone_type").default("inventory"), // "inventory", "sale_lane", "holding"
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"), // "Between rows 52 and 46", "Front section only"
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// --- LOT CAPACITY REPORTS (Real-time field observations) ---
export const lotCapacityReports = pgTable("lot_capacity_reports", {
  id: serial("id").primaryKey(),
  section: varchar("section").notNull(), // Inventory section (e.g., "515", "505", "504", "591", etc.)
  row: varchar("row").notNull(), // Row number within section (e.g., "1", "2", "3")
  availableSpots: integer("available_spots").notNull(), // Estimated open spots in this section+row
  reportedBy: text("reported_by").notNull(), // Name or phone last 4
  reportedByRole: text("reported_by_role"), // "supervisor", "driver", "operations_manager", "van_driver", "inventory_driver"
  notes: text("notes"), // "Rough estimate", "Front section only", etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- VEHICLE MOVES LOG (Movement History for Space Calculations) ---
export const vehicleMoves = pgTable("vehicle_moves", {
  id: serial("id").primaryKey(),
  vin: varchar("vin", { length: 17 }).notNull(),
  driverNumber: varchar("driver_number").notNull(),
  fromLocation: text("from_location"), // Where picked up (null if new arrival)
  toLocation: text("to_location").notNull(), // Where dropped off
  moveType: text("move_type").default("bulk"), // "bulk", "ev_ops", "crunch", "sale_prep"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  gpsLatitude: text("gps_latitude"),
  gpsLongitude: text("gps_longitude"),
});

// --- GPS WAYPOINTS (Auto-learning facility layout from scans) ---
export const gpsWaypoints = pgTable("gps_waypoints", {
  id: serial("id").primaryKey(),
  section: varchar("section").notNull(), // "515", "504", "591", "643" (inventory or sale lane)
  row: varchar("row"), // Row within section (e.g., "1", "2", "3") - optional
  spot: varchar("spot"), // Specific spot number (e.g., "20", "185") - optional
  latitude: text("latitude").notNull(), // GPS latitude
  longitude: text("longitude").notNull(), // GPS longitude
  capturedBy: text("captured_by").notNull(), // Driver who scanned here
  workOrder: varchar("work_order"), // Work order number that was scanned at this location
  locationType: text("location_type").default("inventory"), // "inventory", "sale_lane", "overflow"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(), // False if lane moved/deactivated
});

// --- SHIFT CONFIGURATIONS (Manheim Nashville Schedule) ---
export const shiftConfigs = pgTable("shift_configs", {
  id: serial("id").primaryKey(),
  shiftName: text("shift_name").notNull(), // "First Shift", "Second Shift", "Saturday Shift"
  startTime: text("start_time").notNull(), // "06:00" (24-hour format)
  endTime: text("end_time").notNull(), // "15:30"
  daysOfWeek: text("days_of_week").array().notNull(), // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  lunchDuration: integer("lunch_duration").default(30), // 30 minutes
  breakCount: integer("break_count").default(2), // Two 15-minute breaks
  breakDuration: integer("break_duration").default(15), // 15 minutes each
  isActive: boolean("is_active").default(true).notNull(),
  canBeExtended: boolean("can_be_extended").default(true).notNull(), // Teresa can extend
  canBeAbbreviated: boolean("can_be_abbreviated").default(true).notNull(), // Teresa can shorten
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- DRIVER SHIFTS (Clock In/Out Tracking with Full Persistence) ---
export const driverShifts = pgTable("driver_shifts", {
  id: serial("id").primaryKey(),
  driverNumber: varchar("driver_number").notNull(),
  driverName: text("driver_name").notNull(),
  shiftType: text("shift_type").default("first_shift"), // "first_shift", "second_shift", "saturday_shift"
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  scheduledStart: text("scheduled_start"), // "06:00" - original scheduled start
  scheduledEnd: text("scheduled_end"), // "15:30" - original scheduled end
  actualStart: text("actual_start"), // "06:15" - actual clock in time
  actualEnd: text("actual_end"), // "15:45" - actual clock out time
  wasExtended: boolean("was_extended").default(false), // Teresa extended shift
  wasAbbreviated: boolean("was_abbreviated").default(false), // Teresa shortened shift
  date: text("date").notNull(), // "2025-11-20" for easy querying by day
  dayOfWeek: text("day_of_week"), // "Monday", "Tuesday", etc.
  totalHours: text("total_hours"), // "8.5" calculated on clock out
  totalMoves: integer("total_moves").default(0),
  avgMovesPerHour: text("avg_moves_per_hour"), // "4.8" MPH for that shift
  totalMilesDriven: text("total_miles_driven"), // "45.3" miles calculated from GPS tracking
  avgMilesPerMove: text("avg_miles_per_move"), // "0.8" miles per move average
  status: text("status").default("active"), // "active", "completed"
  notes: text("notes"), // Any special notes about the shift
});

// --- BREAK LOGS (Complete Break History Tracking) ---
export const breakLogs = pgTable("break_logs", {
  id: serial("id").primaryKey(),
  driverNumber: varchar("driver_number").notNull(),
  breakType: text("break_type").notNull(), // "lunch", "break"
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: text("duration"), // "30 minutes" calculated on end
  date: text("date").notNull(), // "2025-11-20"
  notes: text("notes"),
});

// --- DRIVER STATS (Aggregated Daily/Weekly/Monthly Performance) ---
export const driverStats = pgTable("driver_stats", {
  id: serial("id").primaryKey(),
  driverNumber: varchar("driver_number").notNull(),
  driverName: text("driver_name").notNull(),
  periodType: text("period_type").notNull(), // "daily", "weekly", "monthly", "yearly", "all_time"
  periodKey: text("period_key").notNull(), // "2025-11-20", "2025-W47", "2025-11", "2025", "all_time"
  totalMoves: integer("total_moves").default(0),
  totalHours: text("total_hours"), // "38.5"
  avgMovesPerHour: text("avg_moves_per_hour"), // "4.8"
  totalMilesDriven: text("total_miles_driven"), // "245.7" total miles for this period
  avgMilesPerMove: text("avg_miles_per_move"), // "0.9" average miles per move
  avgMilesPerHour: text("avg_miles_per_hour"), // "6.4" miles driven per hour worked
  efficiencyScore: integer("efficiency_score"), // 0-100 calculated efficiency rating
  attendanceRate: text("attendance_rate"), // "95.2%" - percentage of scheduled days worked
  estimatedBonus: integer("estimated_bonus").default(0), // In dollars
  rank: integer("rank"), // Rank among all drivers for this period
  status: text("status").default("in_progress"), // "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- DRIVER NOTES & REPORTS (Notepad with Supervisor Reporting) ---
export const driverNotes = pgTable("driver_notes", {
  id: serial("id").primaryKey(),
  driverNumber: varchar("driver_number").notNull(),
  driverName: text("driver_name").notNull(),
  noteType: text("note_type").notNull(), // "personal", "report_to_supervisor"
  noteContent: text("note_content").notNull(),
  location: text("location"), // Where they were when they wrote the note
  isRead: boolean("is_read").default(false).notNull(), // For supervisor reports
  isResolved: boolean("is_resolved").default(false).notNull(), // Supervisor can mark as handled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDriverNoteSchema = createInsertSchema(driverNotes).omit({ id: true, createdAt: true });
export type InsertDriverNote = z.infer<typeof insertDriverNoteSchema>;
export type DriverNote = typeof driverNotes.$inferSelect;

// --- SEVERE WEATHER ALERTS (NWS Alert Tracking) ---
export const weatherAlerts = pgTable("weather_alerts", {
  id: serial("id").primaryKey(),
  alertId: text("alert_id").notNull().unique(), // NWS alert ID
  eventType: text("event_type").notNull(), // "Tornado Warning", "Severe Thunderstorm Warning"
  severity: text("severity").notNull(), // "Extreme", "Severe", "Moderate"
  urgency: text("urgency").notNull(), // "Immediate", "Expected"
  headline: text("headline").notNull(),
  description: text("description").notNull(),
  instruction: text("instruction"),
  areaDesc: text("area_desc").notNull(), // Affected areas
  onset: timestamp("onset").notNull(), // When it starts
  expires: timestamp("expires").notNull(), // When it expires
  broadcastSent: boolean("broadcast_sent").default(false).notNull(), // Did we notify everyone?
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SAFETY INCIDENTS (Accident/Violation/Hazard Reporting) ---
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  reportedBy: varchar("reported_by").notNull(), // Driver number or "Teresa"
  reporterName: text("reporter_name").notNull(),
  reporterBadgeNumber: varchar("reporter_badge_number"), // Employee badge number
  reporterEmployeeType: text("reporter_employee_type"), // "permanent", "temporary"
  incidentType: text("incident_type").notNull(), // "accident", "near_miss", "safety_violation", "hazard", "equipment_damage", "injury"
  urgency: text("urgency").notNull(), // "urgent", "general", "low"
  title: text("title").notNull(), // Short description
  description: text("description").notNull(), // Full details
  lotLocation: text("lot_location"), // Specific lot/section (e.g., "515", "DSC", "Lane 42")
  location: text("location"), // Where it happened (GPS or lot description)
  photoUrl: text("photo_url"), // Base64 encoded photo
  videoUrl: text("video_url"), // Base64 encoded video (up to 10MB, 10 seconds)
  vin: text("vin"), // If related to a specific vehicle
  witnessed: boolean("witnessed").default(false), // Did others see it?
  witnessNames: text("witness_names"), // Who else was there
  witnessCount: integer("witness_count"), // How many people saw it
  pdfReportUrl: text("pdf_report_url"), // Generated PDF report path
  notifiedSupervisor: boolean("notified_supervisor").default(false).notNull(),
  notifiedOpsManager: boolean("notified_ops_manager").default(false).notNull(),
  notifiedSafetyRep: boolean("notified_safety_rep").default(false).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedBy: text("resolved_by"), // Who handled it (Teresa)
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({ id: true, createdAt: true });
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;

// --- SPEED VIOLATIONS (GPS Speed Monitoring) ---
export const speedViolations = pgTable("speed_violations", {
  id: serial("id").primaryKey(),
  driverNumber: varchar("driver_number").notNull(),
  driverName: text("driver_name").notNull(),
  speed: integer("speed").notNull(), // MPH
  speedLimit: integer("speed_limit").default(15).notNull(),
  location: text("location"), // GPS coordinates or lot area
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSpeedViolationSchema = createInsertSchema(speedViolations).omit({ id: true, createdAt: true });
export type InsertSpeedViolation = z.infer<typeof insertSpeedViolationSchema>;
export type SpeedViolation = typeof speedViolations.$inferSelect;

// --- AI SUGGESTIONS (Smart Lot Management Recommendations) ---
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  suggestionType: text("suggestion_type").notNull(), // "inventory_placement", "overflow_alert", "efficiency_tip"
  priority: text("priority").default("normal"), // "critical", "high", "normal", "low"
  title: text("title").notNull(), // "Lot 515 at 95% capacity"
  message: text("message").notNull(), // "Start putting inventory between rows 52 and 46"
  targetLot: text("target_lot"), // "515", "DSC" - which lot this affects
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Suggestions can auto-expire
});

// --- AI CONVERSATIONS (Persistent AI Assistant Chat Threads) ---
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Driver number, supervisor ID, or role identifier
  userName: text("user_name"), // Display name
  userRole: text("user_role"), // "driver", "supervisor", "operations_manager"
  title: text("title").default("New Conversation"), // Auto-generated from first message
  isActive: boolean("is_active").default(true).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- AI MESSAGES (Individual messages in AI conversations) ---
export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(), // Links to aiConversations
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  wasSpoken: boolean("was_spoken").default(false), // Whether this was voice input
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- FACILITIES (Multi-Location Support for Enterprise Scalability) ---
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  facilityCode: varchar("facility_code").notNull().unique(), // "NSH", "ORL", "HNL", "LAS"
  facilityName: text("facility_name").notNull(), // "Manheim Nashville", "Manheim Orlando"
  address: text("address").notNull(), // Full street address
  city: text("city").notNull(),
  state: varchar("state", { length: 2 }).notNull(), // "TN", "FL", "HI"
  zipCode: varchar("zip_code", { length: 10 }),
  country: varchar("country", { length: 2 }).default("US").notNull(), // "US", "CA", "MX"
  timezone: text("timezone").notNull(), // "America/Chicago", "Pacific/Honolulu"
  gpsCenterLat: text("gps_center_lat").notNull(), // Center point for facility map
  gpsCenterLng: text("gps_center_lng").notNull(),
  gpsBoundsNorth: text("gps_bounds_north"), // Facility boundaries for GPS tracking
  gpsBoundsSouth: text("gps_bounds_south"),
  gpsBoundsEast: text("gps_bounds_east"),
  gpsBoundsWest: text("gps_bounds_west"),
  acreage: integer("acreage"), // Facility size (e.g., 263 acres)
  facilityMapUrl: text("facility_map_url"), // URL or path to uploaded facility map image
  isActive: boolean("is_active").default(true).notNull(),
  setupCompletedBy: text("setup_completed_by"), // Who configured this location
  notes: text("notes"), // "Primary auction site", "Specialty vehicle facility"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- WEEKLY LANE MAPS (Dynamic Weekly Configuration Management) ---
export const weeklyMaps = pgTable("weekly_maps", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull().unique(), // e.g., 48
  year: integer("year").notNull(), // 2025
  effectiveDate: text("effective_date"), // "November 19, 2025"
  mapImageUrl: text("map_image_url"), // Path to uploaded map image
  isActive: boolean("is_active").default(false).notNull(), // Only one week can be active
  uploadedBy: text("uploaded_by"), // Developer/supervisor PIN
  notes: text("notes"), // "Wednesday & Tuesday lanes", any special notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- SAFETY REPRESENTATIVE (Who is currently the Safety Advisor) ---
export const safetyRepresentative = pgTable("safety_representative", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().unique(), // Links to employees table
  employeeName: text("employee_name").notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull().unique(), // For auto-login detection
  customPin: varchar("custom_pin", { length: 10 }).notNull().unique(), // Safety advisor's chosen PIN
  assignedBy: text("assigned_by").notNull(), // Teresa's PIN or "supervisor"
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(), // Can be deactivated
  notes: text("notes"), // Teresa's notes about this person
});

// --- EMAIL CONTACTS (Teresa's saved email addresses) ---
export const emailContacts = pgTable("email_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Driver Manager", "Regional Director"
  email: text("email").notNull(),
  category: text("category"), // "management", "hr", "safety", "operations"
  notes: text("notes"),
  addedBy: text("added_by").notNull(), // Teresa's PIN
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
});

// --- SAFETY TOPICS (Pre-shift meeting ideas, safety reminders) ---
export const safetyTopics = pgTable("safety_topics", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "ppe", "speeding", "weather", "vehicle_safety", "emergency_procedures"
  title: text("title").notNull(), // "Proper Safety Vest Usage"
  content: text("content").notNull(), // Full text for pre-shift speech
  bulletPoints: text("bullet_points").array(), // ["Always wear high-vis vest", "Reflective strips required"]
  suggestedFrequency: text("suggested_frequency"), // "weekly", "monthly", "as_needed"
  lastUsed: timestamp("last_used"),
  timesUsed: integer("times_used").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: text("created_by"), // "system" or safety advisor PIN
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SAFETY MESSAGES (Messages sent by Safety Advisor to drivers) ---
export const safetyMessages = pgTable("safety_messages", {
  id: serial("id").primaryKey(),
  fromId: varchar("from_id").notNull(), // Safety Advisor's PIN
  fromName: text("from_name").notNull(), // Safety Advisor's name
  toId: varchar("to_id"), // Specific driver number or null for broadcast
  toName: text("to_name"), // Driver name or "All Drivers"
  messageType: text("message_type").notNull(), // "safety_reminder", "violation_warning", "general_announcement"
  subject: text("subject").notNull(), // "Speed Limit Reminder"
  content: text("content").notNull(),
  relatedIncidentId: integer("related_incident_id"), // Link to safety incident if applicable
  isRead: boolean("is_read").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- SHIFT INSTRUCTIONS (Operations Manager creates for Supervisor) ---
export const shiftInstructions = pgTable("shift_instructions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // "2025-11-20"
  priority: text("priority").default("normal"), // "urgent", "normal", "info"
  title: text("title").notNull(), // "Heavy Chute Day - Extra Van Needed"
  content: text("content").notNull(), // Full instructions
  createdBy: text("created_by").notNull(), // Operations Manager PIN
  createdByTitle: text("created_by_title").default("Operations Manager"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- MANAGEMENT NOTES (Operations Manager ↔ Supervisor Communication) ---
export const managementNotes = pgTable("management_notes", {
  id: serial("id").primaryKey(),
  fromRole: text("from_role").notNull(), // "operations_manager", "supervisor"
  fromTitle: text("from_title").notNull(), // "Operations Manager", "Lot Supervisor"
  toRole: text("to_role").notNull(), // "operations_manager", "supervisor"
  toTitle: text("to_title").notNull(), // "Operations Manager", "Lot Supervisor"
  noteType: text("note_type").notNull(), // "shift_recap", "issue_report", "request", "general"
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SENT EMAILS (Log of all emails sent through system) ---
export const sentEmails = pgTable("sent_emails", {
  id: serial("id").primaryKey(),
  sentBy: text("sent_by").notNull(), // PIN or name
  sentByRole: text("sent_by_role").notNull(), // "operations_manager", "supervisor"
  recipientType: text("recipient_type").notNull(), // "company_wide", "external", "individual"
  recipients: text("recipients").array(), // ["all_staff"] or ["john@example.com", "jane@example.com"]
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").default("sent"), // "sent", "failed", "pending"
});

// --- SAVED DOCUMENTS (Local file storage for reports, PDFs, etc.) ---
export const savedDocuments = pgTable("saved_documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // "pdf", "xlsx", "docx", "csv", "txt", "image"
  fileSize: integer("file_size"), // Size in bytes
  fileData: text("file_data").notNull(), // Base64 encoded file content
  category: text("category"), // "reports", "schedules", "safety", "performance", "other"
  description: text("description"),
  uploadedBy: text("uploaded_by").notNull(), // User PIN
  uploadedByRole: text("uploaded_by_role").notNull(), // "supervisor", "operations_manager"
  uploadedByName: text("uploaded_by_name").notNull(),
  uploadDate: text("upload_date").notNull(), // "2025-11-20" for easy filtering
  createdAt: timestamp("created_at").defaultNow().notNull(),
  tags: text("tags").array(), // ["weekly-report", "first-shift", "november"]
});

// --- USER DOCUMENTS (PDFs sent TO specific users - saved in their profile) ---
export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Driver number, PIN, or badge number
  userName: text("user_name").notNull(),
  userRole: text("user_role"), // "driver", "supervisor", "operations_manager", "inventory_driver"
  documentType: text("document_type").notNull(), // "safety_incident", "backpay_notice", "performance_report", "general"
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded PDF or document
  fileSize: integer("file_size"), // Size in bytes
  description: text("description"),
  sentBy: text("sent_by").notNull(), // Who sent this to the user
  sentByName: text("sent_by_name").notNull(),
  sentByRole: text("sent_by_role"), // "operations_manager", "supervisor", "safety_rep"
  isRead: boolean("is_read").default(false).notNull(),
  isSaved: boolean("is_saved").default(false).notNull(), // User can save to keep permanently
  relatedIncidentId: integer("related_incident_id"), // Link to safety incident if applicable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// --- SAFETY MATERIALS (Shared resource library for all drivers) ---
export const safetyMaterials = pgTable("safety_materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // "MSDS: Battery Acid Handling", "Q4 2025 Safety Training"
  description: text("description"), // Brief description of what this is
  materialType: text("material_type").notNull(), // "msds", "training", "policy", "regulation", "link", "document"
  fileData: text("file_data"), // Base64 encoded PDF/document (null if it's a link)
  fileSize: integer("file_size"), // Size in bytes
  externalLink: text("external_link"), // URL to external resource (slideshow, video, etc.)
  category: text("category"), // "chemical_safety", "vehicle_safety", "ppe", "weather", "emergency"
  isActive: boolean("is_active").default(true).notNull(), // Can be archived when outdated
  uploadedBy: text("uploaded_by").notNull(), // PIN of uploader
  uploadedByName: text("uploaded_by_name").notNull(),
  uploadedByRole: text("uploaded_by_role"), // "operations_manager", "supervisor", "safety_rep"
  effectiveDate: text("effective_date"), // "2025-11-20" - when this policy/regulation takes effect
  expirationDate: text("expiration_date"), // When it becomes outdated (if applicable)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  pin: true,
  name: true,
  role: true,
  department: true,
  profilePhoto: true,
});

export const insertDailyAccessCodeSchema = createInsertSchema(dailyAccessCodes).omit({
  id: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).pick({
  phoneLast4: true,
  name: true,
  status: true,
  currentZone: true,
  isOnRoster: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  name: true,
  badgeNumber: true,
  department: true,
  role: true,
  type: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromId: true,
  fromName: true,
  fromRole: true,
  toId: true,
  toName: true,
  toRole: true,
  content: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDailyAccessCode = z.infer<typeof insertDailyAccessCodeSchema>;
export type DailyAccessCode = typeof dailyAccessCodes.$inferSelect;

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const insertEvChargingLogSchema = createInsertSchema(evChargingLogs).pick({
  driverId: true,
  vin: true,
  workOrder: true,
  action: true,
  location: true,
});

export type InsertEvChargingLog = z.infer<typeof insertEvChargingLogSchema>;
export type EvChargingLog = typeof evChargingLogs.$inferSelect;

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export const insertWorkOrderItemSchema = createInsertSchema(workOrderItems).omit({
  id: true,
  completedAt: true
});

export const insertLaneConfigSchema = createInsertSchema(laneConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCrewAssignmentSchema = createInsertSchema(crewAssignments).omit({
  id: true,
  createdAt: true
});

export const insertLotSpaceSchema = createInsertSchema(lotSpaces).omit({
  id: true,
  lastUpdated: true
});

export const insertLotCapacityReportSchema = createInsertSchema(lotCapacityReports).omit({
  id: true,
  timestamp: true
});

export const insertVehicleMoveSchema = createInsertSchema(vehicleMoves).omit({
  id: true,
  timestamp: true
});

export const insertGpsWaypointSchema = createInsertSchema(gpsWaypoints).omit({
  id: true,
  timestamp: true
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  timestamp: true
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export type InsertWorkOrderItem = z.infer<typeof insertWorkOrderItemSchema>;
export type WorkOrderItem = typeof workOrderItems.$inferSelect;

export type InsertLaneConfig = z.infer<typeof insertLaneConfigSchema>;
export type LaneConfig = typeof laneConfigs.$inferSelect;

export type InsertCrewAssignment = z.infer<typeof insertCrewAssignmentSchema>;
export type CrewAssignment = typeof crewAssignments.$inferSelect;

export type InsertLotSpace = z.infer<typeof insertLotSpaceSchema>;
export type LotSpace = typeof lotSpaces.$inferSelect;

export type InsertLotCapacityReport = z.infer<typeof insertLotCapacityReportSchema>;
export type LotCapacityReport = typeof lotCapacityReports.$inferSelect;

export type InsertVehicleMove = z.infer<typeof insertVehicleMoveSchema>;
export type VehicleMove = typeof vehicleMoves.$inferSelect;

export type InsertGpsWaypoint = z.infer<typeof insertGpsWaypointSchema>;
export type GpsWaypoint = typeof gpsWaypoints.$inferSelect;

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Facility = typeof facilities.$inferSelect;

export const insertEmployeeDesignationSchema = createInsertSchema(employeeDesignations).omit({ id: true, createdAt: true });
export type InsertEmployeeDesignation = z.infer<typeof insertEmployeeDesignationSchema>;
export type EmployeeDesignation = typeof employeeDesignations.$inferSelect;

export const insertSafetyRepresentativeSchema = createInsertSchema(safetyRepresentative).omit({ id: true, assignedAt: true });
export type InsertSafetyRepresentative = z.infer<typeof insertSafetyRepresentativeSchema>;
export type SafetyRepresentative = typeof safetyRepresentative.$inferSelect;

export const insertEmailContactSchema = createInsertSchema(emailContacts).omit({ id: true, createdAt: true, lastUsed: true });
export type InsertEmailContact = z.infer<typeof insertEmailContactSchema>;
export type EmailContact = typeof emailContacts.$inferSelect;

export const insertSafetyTopicSchema = createInsertSchema(safetyTopics).omit({ id: true, createdAt: true, lastUsed: true });
export type InsertSafetyTopic = z.infer<typeof insertSafetyTopicSchema>;
export type SafetyTopic = typeof safetyTopics.$inferSelect;

export const insertSafetyMessageSchema = createInsertSchema(safetyMessages).omit({ id: true, timestamp: true });
export type InsertSafetyMessage = z.infer<typeof insertSafetyMessageSchema>;
export type SafetyMessage = typeof safetyMessages.$inferSelect;

export const insertShiftInstructionSchema = createInsertSchema(shiftInstructions).omit({ id: true, createdAt: true });
export type InsertShiftInstruction = z.infer<typeof insertShiftInstructionSchema>;
export type ShiftInstruction = typeof shiftInstructions.$inferSelect;

export const insertManagementNoteSchema = createInsertSchema(managementNotes).omit({ id: true, createdAt: true });
export type InsertManagementNote = z.infer<typeof insertManagementNoteSchema>;
export type ManagementNote = typeof managementNotes.$inferSelect;

export const insertSentEmailSchema = createInsertSchema(sentEmails).omit({ id: true, sentAt: true });

export const insertSavedDocumentSchema = createInsertSchema(savedDocuments).omit({ id: true, createdAt: true });

export type InsertSavedDocument = z.infer<typeof insertSavedDocumentSchema>;
export type SavedDocument = typeof savedDocuments.$inferSelect;
export type InsertSentEmail = z.infer<typeof insertSentEmailSchema>;
export type SentEmail = typeof sentEmails.$inferSelect;

// Exotic Car Key Tracking - Security system for high-value vehicles in Lots 180/190
export const exoticKeyTracking = pgTable("exotic_key_tracking", {
  id: serial("id").primaryKey(),
  workOrder: text("work_order").notNull(), // Vehicle work order
  vin: text("vin"), // Vehicle VIN
  lotNumber: text("lot_number").notNull(), // "180" or "190"
  assignedBy: text("assigned_by").notNull(), // Supervisor/Teresa who assigned the move
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  keyDeliveryLocation: text("key_delivery_location").notNull(), // "clean_side_desk" or "assigning_supervisor"
  inventoryDriverId: text("inventory_driver_id"), // Who parked the car
  inventoryDriverName: text("inventory_driver_name"),
  inventoryDriverConfirmedAt: timestamp("inventory_driver_confirmed_at"), // When key was given to van driver
  vanDriverId: text("van_driver_id"), // Who received the key
  vanDriverName: text("van_driver_name"),
  vanDriverConfirmedAt: timestamp("van_driver_confirmed_at"), // When key was delivered to desk/supervisor
  status: text("status").default("pending").notNull(), // "pending", "key_with_van_driver", "key_secured", "verified_by_patrol"
  patrolVerifiedBy: text("patrol_verified_by"), // James or other patrol driver who verified no key in car
  patrolVerifiedAt: timestamp("patrol_verified_at"),
  notes: text("notes"),
});

// Theme Requests - Users can request custom team themes
export const themeRequests = pgTable("theme_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Phone last 4 or employee ID of requester
  userName: text("user_name").notNull(), // Name of person requesting
  teamName: text("team_name").notNull(), // Team name (e.g., "USC Trojans", "Mississippi State Bulldogs")
  sport: text("sport").notNull(), // "NFL", "MLB", "NBA", "NHL", "CFB", "CBB", "Other"
  primaryColor: text("primary_color").notNull(), // Hex color or gradient string
  secondaryColor: text("secondary_color").notNull(), // Hex color or gradient string
  logoUrl: text("logo_url"), // Optional logo URL
  status: text("status").default("pending").notNull(), // "pending", "approved", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedBy: text("reviewed_by"), // Who approved/rejected it
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"), // Additional notes from requester or reviewer
});

export const insertExoticKeyTrackingSchema = createInsertSchema(exoticKeyTracking).omit({ 
  id: true, 
  assignedAt: true, 
  inventoryDriverConfirmedAt: true, 
  vanDriverConfirmedAt: true,
  patrolVerifiedAt: true
});
export type InsertExoticKeyTracking = z.infer<typeof insertExoticKeyTrackingSchema>;
export type ExoticKeyTracking = typeof exoticKeyTracking.$inferSelect;

export const insertThemeRequestSchema = createInsertSchema(themeRequests).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertThemeRequest = z.infer<typeof insertThemeRequestSchema>;
export type ThemeRequest = typeof themeRequests.$inferSelect;

// Audit Logging - Compliance & Security
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: text("user_name"),
  action: text("action").notNull(), // "login", "logout", "create_facility", "incident_reported", "data_exported"
  resourceType: text("resource_type"), // "user", "facility", "driver", "incident", "report"
  resourceId: text("resource_id"),
  changes: text("changes"), // JSON string of before/after values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").default("success"), // "success", "failure"
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Data Consent Tracking - GDPR Compliance
export const consentLogs = pgTable("consent_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  consentType: text("consent_type").notNull(), // "privacy_policy", "terms_of_service", "data_collection"
  accepted: boolean("accepted").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertConsentLogSchema = createInsertSchema(consentLogs).omit({ id: true, timestamp: true });
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;
export type ConsentLog = typeof consentLogs.$inferSelect;

// Compliance Incidents - Safety & Regulatory
export const complianceIncidents = pgTable("compliance_incidents", {
  id: serial("id").primaryKey(),
  reportedBy: integer("reported_by").notNull(),
  reporterName: text("reporter_name"),
  incidentType: text("incident_type").notNull(), // "injury", "near_miss", "hazard", "violation", "safety_concern"
  severity: text("severity").notNull(), // "critical", "high", "medium", "low"
  description: text("description").notNull(),
  location: text("location"),
  witnesses: text("witnesses"), // JSON array
  evidenceUrl: text("evidence_url"), // Photo/video URLs
  investigatedBy: integer("investigated_by"),
  resolutionDescription: text("resolution_description"),
  resolutionDate: timestamp("resolution_date"),
  status: text("status").default("open"), // "open", "investigating", "resolved", "closed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertComplianceIncidentSchema = createInsertSchema(complianceIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplianceIncident = z.infer<typeof insertComplianceIncidentSchema>;
export type ComplianceIncident = typeof complianceIncidents.$inferSelect;

// CRM - Comprehensive Sales Management
export const salesPeople = pgTable("sales_people", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assignedBy: integer("assigned_by").notNull(), // Developer/Admin who assigned
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  territory: text("territory"), // Geographic or account-based territory
  commission: numeric("commission"), // Commission percentage
  status: text("status").default("active"), // "active", "inactive", "on_leave"
  hireDate: timestamp("hire_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  facilityName: text("facility_name").notNull(),
  industryType: text("industry_type"), // "auto_auction", "dealership", "manufacturing", "equipment_yard"
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  assignedTo: integer("assigned_to"), // Sales person ID
  sourceChannel: text("source_channel"), // "referral", "cold_call", "website", "trade_show", "other"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  prospectId: integer("prospect_id").notNull().references(() => prospects.id),
  dealName: text("deal_name").notNull(),
  stage: text("stage").notNull(), // "prospecting", "qualification", "negotiation", "closed_won", "closed_lost"
  value: numeric("value"),
  expectedCloseDate: timestamp("expected_close_date"),
  closedDate: timestamp("closed_date"),
  ownedBy: integer("owned_by"), // Sales person ID
  probability: integer("probability"), // 0-100
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesContacts = pgTable("sales_contacts", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"), // Job title
  email: text("email").notNull(),
  phone: text("phone"),
  department: text("department"), // "operations", "management", "finance", "it"
  notes: text("notes"),
  businessCardUrl: text("business_card_url"),
  hallmarkAssigned: text("hallmark_assigned"), // Brand/theme name
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessCards = pgTable("business_cards", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => salesContacts.id),
  title: text("title").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  logoUrl: text("logo_url"),
  colors: text("colors"), // JSON: {primary, secondary, accent}
  hallmarkTheme: text("hallmark_theme"), // Brand theme
  generatedUrl: text("generated_url"), // URL to download PDF
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hallmarks = pgTable("hallmarks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Brand name: "Lot Ops Pro", "Manheim Nashville", "Premiere Auto", etc.
  description: text("description"),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  accentColor: text("accent_color"),
  logoUrl: text("logo_url"),
  favicon: text("favicon"),
  fontFamily: text("font_family"), // "DM Sans", "Inter", etc.
  tagline: text("tagline"), // Company tagline
  website: text("website"),
  socialMedia: text("social_media"), // JSON: {linkedin, twitter, instagram, facebook}
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by"), // Developer/Admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesActivityLog = pgTable("sales_activity_log", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  activityType: text("activity_type"), // "call", "email", "meeting", "proposal_sent", "follow_up"
  description: text("description").notNull(),
  completedBy: integer("completed_by"), // Sales person
  activityDate: timestamp("activity_date").defaultNow(),
  nextFollowUp: timestamp("next_follow_up"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesPersonSchema = createInsertSchema(salesPeople).omit({ id: true, createdAt: true });
export type InsertSalesPerson = z.infer<typeof insertSalesPersonSchema>;
export type SalesPerson = typeof salesPeople.$inferSelect;

export const insertProspectSchema = createInsertSchema(prospects).omit({ id: true, createdAt: true });
export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export const insertSalesContactSchema = createInsertSchema(salesContacts).omit({ id: true, createdAt: true });
export type InsertSalesContact = z.infer<typeof insertSalesContactSchema>;
export type SalesContact = typeof salesContacts.$inferSelect;

export const insertBusinessCardSchema = createInsertSchema(businessCards).omit({ id: true, createdAt: true });
export type InsertBusinessCard = z.infer<typeof insertBusinessCardSchema>;
export type BusinessCard = typeof businessCards.$inferSelect;

export const insertHallmarkSchema = createInsertSchema(hallmarks).omit({ id: true, createdAt: true });
export type InsertHallmark = z.infer<typeof insertHallmarkSchema>;
export type Hallmark = typeof hallmarks.$inferSelect;

export const insertSalesActivitySchema = createInsertSchema(salesActivityLog).omit({ id: true, createdAt: true });
export type InsertSalesActivity = z.infer<typeof insertSalesActivitySchema>;
export type SalesActivity = typeof salesActivityLog.$inferSelect;

// Asset Tracking - Hallmark Stamping & Full History - Multi-tenant per stripeCustomerId
export const assetTracking = pgTable("asset_tracking", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant: Customer subscription ID or NULL for internal
  assetNumber: text("asset_number").notNull(), // Unique asset identifier per customer
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type"), // "vehicle", "equipment", "document", "device", etc.
  serialNumber: text("serial_number"),
  qrCode: text("qr_code"), // QR code identifier
  hallmarkStamp: text("hallmark_stamp").notNull(), // Hallmark ID/name that stamped it
  originalAssignedTo: integer("original_assigned_to"), // User ID who originally assigned
  originalAssignedToName: text("original_assigned_to_name"),
  currentOwner: integer("current_owner"), // Current user ID
  currentOwnerName: text("current_owner_name"),
  status: text("status").default("active"), // "active", "archived", "lost", "disposed"
  location: text("location"), // Current location
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetHistory = pgTable("asset_history", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  assetId: integer("asset_id").notNull().references(() => assetTracking.id),
  action: text("action").notNull(), // "created", "assigned", "transferred", "modified", "status_change"
  actionDescription: text("action_description"),
  performedBy: integer("performed_by"), // User who performed action
  performedByName: text("performed_by_name"),
  fromValue: text("from_value"),
  toValue: text("to_value"),
  hallmarkStamp: text("hallmark_stamp"), // Which hallmark was active
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetTrackingSchema = createInsertSchema(assetTracking).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAssetTracking = z.infer<typeof insertAssetTrackingSchema>;
export type AssetTracking = typeof assetTracking.$inferSelect;

export const insertAssetHistorySchema = createInsertSchema(assetHistory).omit({ id: true, createdAt: true });
export type InsertAssetHistory = z.infer<typeof insertAssetHistorySchema>;
export type AssetHistory = typeof assetHistory.$inferSelect;

// Customer Hallmarks - Multi-tenant branding per subscription
// TWO OWNERSHIP MODES:
// 1. "subscriber_managed" - Lot Ops Pro controls hallmark, serials, data (monthly SaaS)
// 2. "franchise_owned" - Customer owns hallmark fully, can customize everything
export const customerHallmarks = pgTable("customer_hallmarks", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(), // Links to customer subscription
  hallmarkName: text("hallmark_name").notNull(), // Brand name: "Manheim Nashville", "Premier Dealership", etc.
  hallmarkDescription: text("hallmark_description"),
  primaryColor: text("primary_color").notNull(), // #0f172a
  secondaryColor: text("secondary_color").notNull(), // #1e293b
  accentColor: text("accent_color"),
  logoUrl: text("logo_url"),
  favicon: text("favicon"),
  fontFamily: text("font_family"), // "DM Sans", "Inter", etc.
  tagline: text("tagline"),
  website: text("website"),
  socialMedia: text("social_media"), // JSON: {linkedin, twitter, instagram, facebook}
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  // OWNERSHIP & FRANCHISE FIELDS
  ownershipMode: text("ownership_mode").default("subscriber_managed"), // "subscriber_managed" or "franchise_owned"
  franchiseId: text("franchise_id"), // Unique franchise identifier (e.g., "LOT-NASH-001")
  franchiseTier: text("franchise_tier"), // "standard", "premium", "enterprise"
  territoryExclusive: boolean("territory_exclusive").default(false), // Exclusive territory rights
  territoryRegion: text("territory_region"), // "Nashville, TN", "Southeast US", etc.
  franchiseFee: text("franchise_fee"), // One-time fee paid: "$10,000"
  royaltyPercent: text("royalty_percent"), // Ongoing royalty: "5%"
  royaltyType: text("royalty_type"), // "percentage", "per_vehicle", "per_move", "flat_monthly"
  royaltyAmount: text("royalty_amount"), // For per-unit: "$0.50", for flat: "$500"
  supportTier: text("support_tier"), // "basic", "priority", "enterprise"
  supportMonthlyFee: text("support_monthly_fee"), // "$500", "$1000", etc.
  franchiseStartDate: timestamp("franchise_start_date"), // When franchise agreement started
  franchiseRenewalDate: timestamp("franchise_renewal_date"), // When franchise renews
  
  // CUSTODY & TRANSFER FIELDS
  custodyOwner: text("custody_owner").default("lotops"), // "lotops" for managed, customer email for owned
  custodyTransferDate: timestamp("custody_transfer_date"), // When ownership transferred
  previousOwner: text("previous_owner"), // For audit: who owned before transfer
  
  // VERSION STAMP
  systemVersion: text("system_version"), // Version stamp: "v2.1.1" - auto-stamped at creation
  systemBuild: text("system_build"), // Build date: "2025-12-05"
  hallmarkHash: text("hallmark_hash"), // Unique 64-char hash for verification
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CUSTODY TRANSFER LOG - Track all ownership transfers from subscriber to franchise
export const hallmarkCustodyTransfers = pgTable("hallmark_custody_transfers", {
  id: serial("id").primaryKey(),
  hallmarkId: integer("hallmark_id").notNull(), // References customerHallmarks
  stripeCustomerId: text("stripe_customer_id").notNull(),
  
  // Transfer details
  transferType: text("transfer_type").notNull(), // "subscriber_to_franchise", "franchise_upgrade", "territory_expansion"
  fromMode: text("from_mode").notNull(), // "subscriber_managed"
  toMode: text("to_mode").notNull(), // "franchise_owned"
  fromOwner: text("from_owner").notNull(), // "lotops" or previous owner
  toOwner: text("to_owner").notNull(), // New owner email/identifier
  
  // Financial terms
  transferFee: text("transfer_fee"), // One-time transfer fee paid
  franchiseFeeAgreed: text("franchise_fee_agreed"), // Franchise fee for this transfer
  royaltyTerms: text("royalty_terms"), // JSON: {type, percent, amount}
  
  // Assets transferred
  serialSystemsTransferred: integer("serial_systems_transferred"), // Count of serial systems
  assetsTransferred: integer("assets_transferred"), // Count of assets
  auditHistoryIncluded: boolean("audit_history_included").default(true),
  
  // Approval chain
  approvedBy: text("approved_by"), // Lot Ops Pro admin who approved
  customerAccepted: boolean("customer_accepted").default(false),
  customerAcceptedAt: timestamp("customer_accepted_at"),
  legalAgreementSigned: boolean("legal_agreement_signed").default(false),
  legalAgreementUrl: text("legal_agreement_url"), // Link to signed franchise agreement
  
  // Status
  status: text("status").default("pending"), // "pending", "approved", "completed", "cancelled"
  notes: text("notes"),
  
  systemVersion: text("system_version"), // Version at time of transfer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertHallmarkCustodyTransferSchema = createInsertSchema(hallmarkCustodyTransfers).omit({ id: true, createdAt: true });
export type InsertHallmarkCustodyTransfer = z.infer<typeof insertHallmarkCustodyTransferSchema>;
export type HallmarkCustodyTransfer = typeof hallmarkCustodyTransfers.$inferSelect;

// FRANCHISE TIERS - Configurable pricing and features per tier
export const franchiseTiers = pgTable("franchise_tiers", {
  id: serial("id").primaryKey(),
  tierCode: text("tier_code").notNull().unique(), // "standard", "premium", "enterprise"
  tierName: text("tier_name").notNull(), // "Standard Franchise", "Premium Franchise", etc.
  description: text("description"),
  
  // Pricing
  franchiseFee: integer("franchise_fee").notNull(), // One-time fee in cents: 500000 = $5,000
  royaltyPercent: text("royalty_percent").notNull(), // "5%", "4%", "3%"
  royaltyType: text("royalty_type").default("percentage"), // "percentage", "per_vehicle", "per_move"
  royaltyPerUnit: integer("royalty_per_unit"), // For per-unit: amount in cents
  supportMonthlyFee: integer("support_monthly_fee").notNull(), // Monthly support in cents: 50000 = $500
  transferFee: integer("transfer_fee").notNull(), // Transfer fee in cents: 250000 = $2,500
  
  // Features
  maxLocations: integer("max_locations").default(1), // 1, 5, unlimited (-1)
  territoryExclusive: boolean("territory_exclusive").default(false),
  territoryLevel: text("territory_level"), // "city", "regional", "state", "multi_state"
  supportResponseHours: integer("support_response_hours").default(48), // 48, 24, 4
  nftRevenueSharePercent: integer("nft_revenue_share_percent").default(70), // Franchisee keeps 70%, 80%, 90%
  whitelabelApp: boolean("whitelabel_app").default(false),
  dedicatedAccountManager: boolean("dedicated_account_manager").default(false),
  subFranchiseRights: boolean("sub_franchise_rights").default(false),
  customDevelopmentHours: integer("custom_development_hours").default(0),
  
  // Display
  featured: boolean("featured").default(false), // Highlight as "Most Popular"
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// FRANCHISE APPLICATIONS - Track prospective franchisees
export const franchiseApplications = pgTable("franchise_applications", {
  id: serial("id").primaryKey(),
  
  // Applicant info
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  website: text("website"),
  
  // Business details
  businessType: text("business_type"), // "auto_auction", "dealership", "fleet_management", etc.
  currentLocations: integer("current_locations").default(1),
  estimatedVehiclesPerMonth: integer("estimated_vehicles_per_month"),
  currentSoftware: text("current_software"), // What they use now
  
  // Requested franchise details
  requestedTierId: integer("requested_tier_id"), // References franchiseTiers
  requestedTerritoryRegion: text("requested_territory_region"),
  requestedTerritoryState: text("requested_territory_state"),
  
  // Existing subscriber info (if upgrading)
  existingStripeCustomerId: text("existing_stripe_customer_id"),
  existingHallmarkId: integer("existing_hallmark_id"),
  isUpgrade: boolean("is_upgrade").default(false), // Subscriber → Franchise upgrade
  
  // Application process
  status: text("status").default("pending"), // "pending", "reviewing", "approved", "rejected", "converted"
  reviewNotes: text("review_notes"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Conversion (when approved and becomes franchise)
  convertedToHallmarkId: integer("converted_to_hallmark_id"),
  convertedAt: timestamp("converted_at"),
  
  source: text("source"), // "website", "referral", "sales_call", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// FRANCHISE PAYMENTS - Track royalties, support fees, and other payments
export const franchisePayments = pgTable("franchise_payments", {
  id: serial("id").primaryKey(),
  hallmarkId: integer("hallmark_id").notNull(), // References customerHallmarks
  stripeCustomerId: text("stripe_customer_id"),
  
  // Payment details
  paymentType: text("payment_type").notNull(), // "franchise_fee", "royalty", "support", "transfer_fee", "nft_share"
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").default("usd"),
  
  // Period (for recurring payments)
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
  // Royalty-specific
  vehiclesProcessed: integer("vehicles_processed"), // For royalty calculations
  royaltyRate: text("royalty_rate"), // "5%", "$0.50/vehicle", etc.
  
  // NFT share specific
  nftBadgesSold: integer("nft_badges_sold"),
  grossNftRevenue: integer("gross_nft_revenue"), // Total NFT sales in cents
  lotOpsShare: integer("lot_ops_share"), // Our cut in cents
  
  // Payment status
  status: text("status").default("pending"), // "pending", "paid", "failed", "refunded"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  paidAt: timestamp("paid_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TERRITORY REGISTRY - Track exclusive territories
export const franchiseTerritories = pgTable("franchise_territories", {
  id: serial("id").primaryKey(),
  hallmarkId: integer("hallmark_id").notNull(), // References customerHallmarks
  
  // Territory definition
  territoryName: text("territory_name").notNull(), // "Nashville Metro", "Southeast Region", etc.
  territoryType: text("territory_type").notNull(), // "city", "metro", "county", "state", "region"
  
  // Geographic details
  states: text("states"), // JSON array: ["TN", "KY", "GA"]
  counties: text("counties"), // JSON array of county names
  cities: text("cities"), // JSON array of city names
  zipCodes: text("zip_codes"), // JSON array of zip codes
  
  // Exclusivity
  isExclusive: boolean("is_exclusive").default(true),
  exclusivityStartDate: timestamp("exclusivity_start_date"),
  exclusivityEndDate: timestamp("exclusivity_end_date"), // null = perpetual
  
  // Status
  status: text("status").default("active"), // "active", "pending", "expired", "revoked"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFranchiseTierSchema = createInsertSchema(franchiseTiers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFranchiseTier = z.infer<typeof insertFranchiseTierSchema>;
export type FranchiseTier = typeof franchiseTiers.$inferSelect;

export const insertFranchiseApplicationSchema = createInsertSchema(franchiseApplications).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFranchiseApplication = z.infer<typeof insertFranchiseApplicationSchema>;
export type FranchiseApplication = typeof franchiseApplications.$inferSelect;

export const insertFranchisePaymentSchema = createInsertSchema(franchisePayments).omit({ id: true, createdAt: true });
export type InsertFranchisePayment = z.infer<typeof insertFranchisePaymentSchema>;
export type FranchisePayment = typeof franchisePayments.$inferSelect;

export const insertFranchiseTerritorySchema = createInsertSchema(franchiseTerritories).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFranchiseTerritory = z.infer<typeof insertFranchiseTerritorySchema>;
export type FranchiseTerritory = typeof franchiseTerritories.$inferSelect;

// Serial Number System - Custom serial generation per customer
export const serialNumberSystems = pgTable("serial_number_systems", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull(), // Links to customer
  systemName: text("system_name").notNull(), // "Default", "Vehicle Inventory", etc.
  prefix: text("prefix").notNull(), // "AST", "VEH", "SYS" - prepended to serial
  startingNumber: integer("starting_number").default(1),
  currentNumber: integer("current_number").default(1),
  separator: text("separator").default("-"), // Separator between prefix and number
  paddingZeros: integer("padding_zeros").default(5), // Number of zeros to pad: AST-00001
  suffixPattern: text("suffix_pattern"), // Optional: {date}, {month}, {year} for dynamic suffixes
  hallmarkId: integer("hallmark_id"), // References customerHallmarks
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer Hallmark Audit Log - Track all hallmark usage and changes
export const customerHallmarkAuditLog = pgTable("customer_hallmark_audit_log", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  hallmarkId: integer("hallmark_id"),
  action: text("action").notNull(), // "created", "updated", "used", "deleted", "exported"
  description: text("description"),
  assetCount: integer("asset_count"), // Number of assets stamped if "used"
  performedBy: text("performed_by"), // Email or user identifier
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  systemVersion: text("system_version"), // Version at time of action: "v2.1.1"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerHallmarkSchema = createInsertSchema(customerHallmarks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomerHallmark = z.infer<typeof insertCustomerHallmarkSchema>;
export type CustomerHallmark = typeof customerHallmarks.$inferSelect;

export const insertSerialNumberSystemSchema = createInsertSchema(serialNumberSystems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSerialNumberSystem = z.infer<typeof insertSerialNumberSystemSchema>;
export type SerialNumberSystem = typeof serialNumberSystems.$inferSelect;

export const insertCustomerHallmarkAuditLogSchema = createInsertSchema(customerHallmarkAuditLog).omit({ id: true, createdAt: true });
export type InsertCustomerHallmarkAuditLog = z.infer<typeof insertCustomerHallmarkAuditLogSchema>;
export type CustomerHallmarkAuditLog = typeof customerHallmarkAuditLog.$inferSelect;

// Shift Codes - Per-shift daily security codes (Supervisor-managed)
export const shiftCodes = pgTable("shift_codes", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  code: varchar("code", { length: 6 }).notNull(), // 6-digit random code
  shift: text("shift").notNull(), // "first" or "second"
  date: text("date").notNull(), // "2025-11-22" format
  createdBy: text("created_by").notNull(), // Supervisor name who generated it
  createdByEmployeeId: integer("created_by_employee_id"), // Link to employees table for full details
  createdByEmployeeType: text("created_by_employee_type"), // "permanent" or "temporary" - captured at time of creation (snapshot)
  createdByEmploymentStatus: text("created_by_employment_status"), // "active", "temporary", "terminated", "dnr" - captured at time (snapshot)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // End of shift (12pm for first, 6pm for second)
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertShiftCodeSchema = createInsertSchema(shiftCodes).omit({ id: true, createdAt: true });
export type InsertShiftCode = z.infer<typeof insertShiftCodeSchema>;
export type ShiftCode = typeof shiftCodes.$inferSelect;

// SERVICE DRIVER ASSIGNMENTS - Manager/Supervisor assigns service driver + truck + safety rep
export const serviceDriverAssignments = pgTable("service_driver_assignments", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  assignedBy: text("assigned_by").notNull(), // Supervisor/Manager name
  assignedByEmployeeId: integer("assigned_by_employee_id"),
  
  // Service Driver Assignment
  serviceDriverId: integer("service_driver_id"), // References employees table
  serviceDriverName: text("service_driver_name"),
  serviceDriverStartDate: text("service_driver_start_date"), // "2025-11-20"
  serviceDriverEndDate: text("service_driver_end_date"), // "2025-12-18" or null for ongoing
  serviceDriverDurationWeeks: integer("service_driver_duration_weeks"), // 1, 2, 4 for 1/2/4 weeks
  
  // Service Truck Assignment
  serviceVehicleId: integer("service_vehicle_id"), // References vehicles table
  serviceVehicleVin: text("service_vehicle_vin"),
  serviceTruckStartDate: text("service_truck_start_date"), // "2025-11-20"
  serviceTruckEndDate: text("service_truck_end_date"), // "2025-12-18" or null for ongoing
  serviceTruckDurationWeeks: integer("service_truck_duration_weeks"),
  
  // Safety Representative Assignment
  safetyRepId: integer("safety_rep_id"), // References employees table
  safetyRepName: text("safety_rep_name"),
  safetyRepStartDate: text("safety_rep_start_date"), // Usually temp - not persistent
  safetyRepEndDate: text("safety_rep_end_date"), // Usually same day or end of shift
  safetyRepDurationWeeks: integer("safety_rep_duration_weeks"),
  
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SERVICE WORK ORDERS - Supervisor/Driver creates work order for service driver
export const serviceWorkOrders = pgTable("service_work_orders", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  serviceDriverId: integer("service_driver_id").notNull(), // Who is assigned to fix it
  serviceDriverName: text("service_driver_name"),
  
  vin: varchar("vin", { length: 17 }).notNull(),
  workOrder: text("work_order"),
  vehicleLocation: text("vehicle_location"), // Which lot/section
  
  jobType: text("job_type").notNull(), // "tire_pressure", "gas_fill", "battery_jump", "detail", "damage_repair", etc
  jobDescription: text("job_description"),
  
  priority: text("priority").default("normal"), // "high", "normal", "low"
  status: text("status").default("pending"), // "pending", "in_progress", "completed", "cancelled"
  
  createdBy: text("created_by").notNull(), // Supervisor or driver who reported
  createdByRole: text("created_by_role"), // "supervisor", "driver", "van_driver"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  completedAt: timestamp("completed_at"),
});

// SERVICE WORK COMPLETION - Service driver notes what was done
export const serviceWorkCompletions = pgTable("service_work_completions", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  workOrderId: integer("work_order_id").notNull(), // References serviceWorkOrders
  serviceDriverId: integer("service_driver_id").notNull(),
  serviceDriverName: text("service_driver_name"),
  
  vin: varchar("vin", { length: 17 }).notNull(),
  vehicleLocation: text("vehicle_location"),
  
  jobType: text("job_type").notNull(),
  actionsTaken: text("actions_taken").notNull(), // What was actually done
  notesAndObservations: text("notes_and_observations"), // Additional notes
  
  partsUsed: text("parts_used"), // What supplies/parts were used
  timeSpentMinutes: integer("time_spent_minutes"),
  
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  hallmarkStamp: text("hallmark_stamp"), // Auto timestamp for permanent record
});

export const insertServiceDriverAssignmentSchema = createInsertSchema(serviceDriverAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertServiceDriverAssignment = z.infer<typeof insertServiceDriverAssignmentSchema>;
export type ServiceDriverAssignment = typeof serviceDriverAssignments.$inferSelect;

export const insertServiceWorkOrderSchema = createInsertSchema(serviceWorkOrders).omit({ id: true, createdAt: true });
export type InsertServiceWorkOrder = z.infer<typeof insertServiceWorkOrderSchema>;
export type ServiceWorkOrder = typeof serviceWorkOrders.$inferSelect;

export const insertServiceWorkCompletionSchema = createInsertSchema(serviceWorkCompletions).omit({ id: true, completedAt: true });
export type InsertServiceWorkCompletion = z.infer<typeof insertServiceWorkCompletionSchema>;
export type ServiceWorkCompletion = typeof serviceWorkCompletions.$inferSelect;

// --- PIN LOGIN TRACKING (Beta Testing & User Rewards) ---
export const pinLoginTracking = pgTable("pin_login_tracking", {
  id: serial("id").primaryKey(),
  pin: varchar("pin", { length: 10 }).notNull(), // The 3-digit PIN used
  userName: text("user_name"), // Name of person who logged in (extracted from users table)
  userRole: text("user_role"), // Role of person (driver, inventory, supervisor, etc.)
  userId: integer("user_id"), // Foreign key to users table
  loginTimestamp: timestamp("login_timestamp").defaultNow().notNull(),
  loginDate: text("login_date").notNull(), // "2025-11-26" for easy filtering
  loginTime: text("login_time"), // "14:35:22" for display
  ipAddress: text("ip_address"), // Request IP
  isBetaTester: boolean("is_beta_tester").default(true).notNull(), // Mark as beta tester
  notes: text("notes"), // Optional notes about this tester
});

export const insertPinLoginTrackingSchema = createInsertSchema(pinLoginTracking).omit({ id: true, loginTimestamp: true });
export type InsertPinLoginTracking = z.infer<typeof insertPinLoginTrackingSchema>;
export type PinLoginTracking = typeof pinLoginTracking.$inferSelect;

// --- EQUIPMENT CHECKOUT LOGS (Van Driver Equipment Tracking) ---
export const equipmentLogs = pgTable("equipment_logs", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(), // References users.id
  driverName: text("driver_name").notNull(),
  driverNumber: text("driver_number").notNull(), // Driver badge/phone number
  date: text("date").notNull(), // ISO date format (e.g., "2025-11-26")
  shift: text("shift").notNull(), // "first" or "second"
  flashlight: boolean("flashlight").notNull().default(true), // true = checked out, false = missing
  jumpBox: boolean("jump_box").notNull().default(true),
  tc75Scanner: boolean("tc75_scanner").notNull().default(true),
  twoWayRadio: boolean("two_way_radio").notNull().default(true),
  missingNotes: text("missing_notes"), // Notes describing missing items
  reportedMissing: boolean("reported_missing").notNull().default(false), // true if any items missing
  reportedAt: text("reported_at"), // Timestamp when missing items were reported
}, (table) => ({
  uniqueDriverDateShift: unique("unique_driver_date_shift").on(table.driverId, table.date, table.shift),
}));

export const insertEquipmentLogSchema = createInsertSchema(equipmentLogs).omit({ id: true });
export type InsertEquipmentLog = z.infer<typeof insertEquipmentLogSchema>;
export type EquipmentLog = typeof equipmentLogs.$inferSelect;

// --- DAILY ROSTER (Teresa's daily prefilled driver roster) ---
export const dailyRoster = pgTable("daily_roster", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // "2025-11-26" format
  shift: text("shift").notNull(), // "first" or "second"
  employeeName: text("employee_name").notNull(), // Name of driver
  phoneLast4: varchar("phone_last_4", { length: 4 }).notNull(), // Driver's phone last 4
  employeeType: text("employee_type").notNull(), // "permanent" or "temporary"
  approvedByRole: text("approved_by_role"), // "supervisor" or "operations_manager"
  approvedByName: text("approved_by_name"), // Name of approver
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDailyRosterSchema = createInsertSchema(dailyRoster).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyRoster = z.infer<typeof insertDailyRosterSchema>;
export type DailyRoster = typeof dailyRoster.$inferSelect;

// --- VAN DRIVER APPROVAL REQUESTS ---
export const vanDriverApprovalRequests = pgTable("van_driver_approval_requests", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhoneLast4: varchar("driver_phone_last4", { length: 4 }).notNull(),
  requestStatus: text("request_status").notNull().default("pending"), // pending, approved, denied
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedBy: text("reviewed_by"), // Supervisor/manager name
  reviewedAt: timestamp("reviewed_at"), // When they approved/denied
  decisionReason: text("decision_reason"), // Optional reason for approval/denial
});

export const insertVanDriverApprovalRequestSchema = createInsertSchema(vanDriverApprovalRequests).omit({ id: true, requestedAt: true, reviewedAt: true });
export type InsertVanDriverApprovalRequest = z.infer<typeof insertVanDriverApprovalRequestSchema>;
export type VanDriverApprovalRequest = typeof vanDriverApprovalRequests.$inferSelect;

// --- SHIFT CODE WITH ROSTER VISIBILITY (Gates 6-digit code until roster check) ---
export const shiftCodeRosterVisibility = pgTable("shift_code_roster_visibility", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  shift: text("shift").notNull(),
  driverPhoneLast4: varchar("driver_phone_last4", { length: 4 }).notNull(),
  shiftCode: varchar("shift_code", { length: 6 }).notNull(), // 6-digit shift code
  codeVisibleAfterDriverCode: boolean("code_visible_after_driver_code").default(false), // True when driver code verified
  messageSent: boolean("message_sent").default(false), // True when shift code message sent to driver
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShiftCodeRosterVisibilitySchema = createInsertSchema(shiftCodeRosterVisibility).omit({ id: true, createdAt: true });
export type InsertShiftCodeRosterVisibility = z.infer<typeof insertShiftCodeRosterVisibilitySchema>;
export type ShiftCodeRosterVisibility = typeof shiftCodeRosterVisibility.$inferSelect;

// --- SHIFT WEATHER LOGS (Track every shift with weather conditions, assignments, and metrics) ---
export const shiftWeatherLogs = pgTable("shift_weather_logs", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  // Driver/User Info
  userId: text("user_id").notNull(), // Driver number or employee ID
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(), // "van_driver", "inventory_driver", "supervisor", "operations_manager"
  userPhoneLast4: text("user_phone_last4"), // Last 4 digits for lookup
  
  // Shift Details
  date: text("date").notNull(), // "2025-11-28" for easy querying
  dayOfWeek: text("day_of_week").notNull(), // "Friday"
  shiftType: text("shift_type").notNull(), // "first_shift", "second_shift", "saturday_shift"
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  shiftStatus: text("shift_status").default("active"), // "active", "completed", "incomplete"
  
  // Assignment Details (what they were assigned to do that day)
  assignedRole: text("assigned_role"), // Role they were assigned for this shift
  assignedCrew: text("assigned_crew"), // Crew ID they were assigned to (e.g., "CREW_VAN5555")
  assignedVanDriver: text("assigned_van_driver"), // Van driver they worked under (for inventory drivers)
  assignedLots: text("assigned_lots"), // Which lots they were assigned to work
  assignedZone: text("assigned_zone"), // Zone or area assigned
  assignmentNotes: text("assignment_notes"), // Any notes about their assignment
  
  // Weather Conditions (captured at clock-in)
  weatherTemp: text("weather_temp"), // "45°F"
  weatherTempHigh: text("weather_temp_high"), // "52°F"
  weatherTempLow: text("weather_temp_low"), // "38°F"
  weatherCondition: text("weather_condition"), // "Partly Cloudy", "Rainy", "Sunny"
  weatherIcon: text("weather_icon"), // Weather icon code
  weatherHumidity: text("weather_humidity"), // "65%"
  weatherWindSpeed: text("weather_wind_speed"), // "12 mph"
  weatherWindDirection: text("weather_wind_direction"), // "NW"
  weatherPrecipitation: text("weather_precipitation"), // "0.2 in"
  weatherVisibility: text("weather_visibility"), // "10 mi"
  weatherUvIndex: text("weather_uv_index"), // "3"
  weatherSunrise: text("weather_sunrise"), // "6:45 AM"
  weatherSunset: text("weather_sunset"), // "4:32 PM"
  weatherAlert: text("weather_alert"), // Any active weather alerts
  weatherCapturedAt: timestamp("weather_captured_at"), // When weather was fetched
  
  // Location (for weather accuracy)
  latitude: text("latitude").default("36.1627"), // Nashville default
  longitude: text("longitude").default("-86.7816"),
  locationName: text("location_name").default("Manheim Nashville"),
  
  // Performance Metrics Achieved
  totalMoves: integer("total_moves").default(0), // Number of vehicles moved
  totalHoursWorked: text("total_hours_worked"), // "8.5"
  totalMilesDriven: text("total_miles_driven"), // "45.3"
  avgMovesPerHour: text("avg_moves_per_hour"), // "4.8" MPH
  avgMilesPerMove: text("avg_miles_per_move"), // "0.9"
  efficiencyScore: integer("efficiency_score"), // 0-100 calculated rating
  quotaTarget: integer("quota_target"), // Daily quota target
  quotaAchieved: boolean("quota_achieved").default(false), // Did they hit quota?
  
  // Break and Overtime Tracking
  breakDurationMinutes: integer("break_duration_minutes").default(0),
  lunchDurationMinutes: integer("lunch_duration_minutes").default(0),
  overtimeMinutes: integer("overtime_minutes").default(0),
  
  // Safety & Incidents
  incidentsCount: integer("incidents_count").default(0),
  safetyNotes: text("safety_notes"),
  
  // Notes & Review
  shiftNotes: text("shift_notes"), // General notes about the shift
  supervisorNotes: text("supervisor_notes"), // Notes from supervisor
  reviewedBySupervisor: boolean("reviewed_by_supervisor").default(false),
  reviewedByName: text("reviewed_by_name"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Data Flags
  isSandboxEntry: boolean("is_sandbox_entry").default(false), // Sandbox mode entry
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShiftWeatherLogSchema = createInsertSchema(shiftWeatherLogs).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertShiftWeatherLog = z.infer<typeof insertShiftWeatherLogSchema>;
export type ShiftWeatherLog = typeof shiftWeatherLogs.$inferSelect;

// --- USER PREFERENCES (Persistent settings per user) ---
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(), // PIN or user identifier
  weatherZipcode: varchar("weather_zipcode"), // Preferred zipcode for weather
  weatherLatitude: text("weather_latitude"), // Preferred latitude
  weatherLongitude: text("weather_longitude"), // Preferred longitude
  weatherLocationName: text("weather_location_name"), // Display name for location
  dashboardLayout: text("dashboard_layout"), // Custom dashboard layout preferences
  notificationsEnabled: boolean("notifications_enabled").default(true),
  soundEnabled: boolean("sound_enabled").default(true),
  theme: text("theme").default("dark"), // "dark", "light", "system"
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// --- AI LOT OPTIMIZATION SUGGESTIONS ---
export const aiOptimizationSuggestions = pgTable("ai_optimization_suggestions", {
  id: serial("id").primaryKey(),
  
  // Context
  facilityId: varchar("facility_id").default("manheim_nashville"), // For multi-facility support
  analysisType: text("analysis_type").notNull(), // "capacity", "routing", "staffing", "scheduling"
  
  // Current State Analysis
  currentUtilization: integer("current_utilization"), // Overall % utilized
  peakCapacity: integer("peak_capacity"), // Max vehicles that can be stored
  currentInventory: integer("current_inventory"), // Current vehicles on lot
  congestionZones: text("congestion_zones").array(), // List of congested areas
  underutilizedZones: text("underutilized_zones").array(), // List of empty areas
  
  // AI Generated Insights
  suggestionTitle: text("suggestion_title").notNull(), // "Redistribute vehicles from Lot 515 to Lot 513"
  suggestionDescription: text("suggestion_description").notNull(), // Detailed explanation
  expectedImpact: text("expected_impact"), // "Reduce congestion by 25%"
  priority: text("priority").default("medium"), // "critical", "high", "medium", "low"
  confidenceScore: integer("confidence_score"), // 0-100 AI confidence
  
  // Action Items
  actionItems: text("action_items").array(), // List of specific actions
  estimatedTimeToImplement: text("estimated_time_to_implement"), // "30 minutes"
  estimatedCostSavings: text("estimated_cost_savings"), // "$500/week"
  
  // Status Tracking
  status: text("status").default("pending"), // "pending", "accepted", "rejected", "implemented"
  implementedBy: text("implemented_by"),
  implementedAt: timestamp("implemented_at"),
  rejectionReason: text("rejection_reason"),
  
  // Weather Context (for outdoor operations)
  weatherCondition: text("weather_condition"),
  weatherTemp: text("weather_temp"),
  
  // Timestamps
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Suggestions can expire
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiOptimizationSuggestionSchema = createInsertSchema(aiOptimizationSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertAiOptimizationSuggestion = z.infer<typeof insertAiOptimizationSuggestionSchema>;
export type AiOptimizationSuggestion = typeof aiOptimizationSuggestions.$inferSelect;

// --- FACILITY CONFIGURATIONS (Multi-facility support) ---
export const facilityConfigs = pgTable("facility_configs", {
  id: serial("id").primaryKey(),
  facilityId: varchar("facility_id").notNull().unique(), // "manheim_nashville", "manheim_atlanta"
  facilityName: text("facility_name").notNull(), // "Manheim Nashville"
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipcode: varchar("zipcode"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timezone: text("timezone").default("America/Chicago"),
  
  // Capacity & Layout
  totalCapacity: integer("total_capacity"), // Total vehicle spots
  totalLots: integer("total_lots"), // Number of lots
  totalLanes: integer("total_lanes"), // Number of sale lanes
  footprintMapUrl: text("footprint_map_url"), // URL to uploaded facility map
  
  // Contact Info
  primaryContact: text("primary_contact"),
  primaryPhone: text("primary_phone"),
  primaryEmail: text("primary_email"),
  
  // Settings
  operatingHours: text("operating_hours"), // JSON string of hours
  saleDays: text("sale_days").array(), // ["Tuesday", "Wednesday", "Thursday"]
  isActive: boolean("is_active").default(true).notNull(),
  
  // White Label
  brandingLogoUrl: text("branding_logo_url"),
  primaryColor: text("primary_color").default("#3B82F6"), // Hex color
  secondaryColor: text("secondary_color").default("#1E40AF"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilityConfigSchema = createInsertSchema(facilityConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertFacilityConfig = z.infer<typeof insertFacilityConfigSchema>;
export type FacilityConfig = typeof facilityConfigs.$inferSelect;

// --- DRIVER ASSIGNMENT LISTS (Supervisor/Manager → Driver workflow) ---
export const driverAssignmentLists = pgTable("driver_assignment_lists", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"),
  
  // Who sent and who receives
  assignedBy: text("assigned_by").notNull(), // Supervisor/Manager name or ID
  assignedByRole: text("assigned_by_role").notNull(), // "supervisor", "operations_manager"
  assignedTo: text("assigned_to").notNull(), // Driver phone last 4 or badge
  assignedToName: text("assigned_to_name"), // Driver's display name
  
  // Assignment type and content
  assignmentType: text("assignment_type").notNull(), // "list", "crunch_lanes", "custom"
  title: text("title"), // Brief title: "AM List #1", "Crunch 501-505"
  content: text("content").notNull(), // Full list/instructions (can be multi-line)
  laneGroup: text("lane_group"), // For crunch: "501-505", "513-515", "516-518", "591-599"
  lanes: text("lanes").array(), // Individual lanes selected ["501", "502", "503"]
  
  // Status tracking
  status: text("status").default("pending").notNull(), // "pending", "in_progress", "completed", "cancelled"
  completedAt: timestamp("completed_at"),
  completedNote: text("completed_note"), // Driver's completion message
  
  // Supervisor response after completion
  responseType: text("response_type"), // "another_list", "crunch_lanes", "custom", null
  responseContent: text("response_content"), // Next assignment content
  responseSentAt: timestamp("response_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDriverAssignmentListSchema = createInsertSchema(driverAssignmentLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  responseSentAt: true
});
export type InsertDriverAssignmentList = z.infer<typeof insertDriverAssignmentListSchema>;
export type DriverAssignmentList = typeof driverAssignmentLists.$inferSelect;

// --- SAVED ASSIGNMENT TEMPLATES (Reusable lists supervisors can save) ---
export const assignmentTemplates = pgTable("assignment_templates", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"),
  
  name: text("name").notNull(), // "Morning Chute List", "VIP Lane Crunch"
  description: text("description"),
  templateType: text("template_type").notNull(), // "list", "crunch"
  content: text("content").notNull(), // The actual list content
  laneGroup: text("lane_group"), // For crunch templates
  lanes: text("lanes").array(),
  
  createdBy: text("created_by").notNull(),
  createdByRole: text("created_by_role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssignmentTemplateSchema = createInsertSchema(assignmentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true
});
export type InsertAssignmentTemplate = z.infer<typeof insertAssignmentTemplateSchema>;
export type AssignmentTemplate = typeof assignmentTemplates.$inferSelect;

// --- FACILITY ROUTING CODES (Configurable per facility) ---
export const facilityRoutingCodes = pgTable("facility_routing_codes", {
  id: serial("id").primaryKey(),
  facilityId: varchar("facility_id").notNull(), // "manheim_nashville", "manheim_atlanta"
  
  code: varchar("code").notNull(), // "DTL", "DSC", "REG", "PREP"
  destination: text("destination").notNull(), // "Detail", "Disclosure (Lot 257)"
  destinationLot: varchar("destination_lot"), // "257", "227", etc.
  description: text("description"), // "Detail shop for vehicle prep"
  category: text("category").default("routing"), // "routing", "service", "sale", "holding"
  
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilityRoutingCodeSchema = createInsertSchema(facilityRoutingCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertFacilityRoutingCode = z.infer<typeof insertFacilityRoutingCodeSchema>;
export type FacilityRoutingCode = typeof facilityRoutingCodes.$inferSelect;

// --- FACILITY LOT ZONES (Configurable zones per facility) ---
export const facilityLotZones = pgTable("facility_lot_zones", {
  id: serial("id").primaryKey(),
  facilityId: varchar("facility_id").notNull(),
  
  zoneCode: varchar("zone_code").notNull(), // "501", "A1", "NORTH-1"
  zoneName: text("zone_name").notNull(), // "Main Inventory", "Sale Lane Block A"
  zoneType: text("zone_type").notNull(), // "inventory", "sale_lane", "holding", "service", "overflow"
  
  capacity: integer("capacity").default(0),
  currentOccupancy: integer("current_occupancy").default(0),
  
  // Layout info
  rows: integer("rows"), // Number of rows in zone
  spotsPerRow: integer("spots_per_row"),
  numberingPattern: text("numbering_pattern").default("sequential"), // "sequential", "even_odd", "alpha", "custom"
  flowDirection: text("flow_direction").default("s_pattern"), // "s_pattern", "linear", "circular"
  
  // GPS boundaries for zone
  gpsNorth: text("gps_north"),
  gpsSouth: text("gps_south"),
  gpsEast: text("gps_east"),
  gpsWest: text("gps_west"),
  
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilityLotZoneSchema = createInsertSchema(facilityLotZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertFacilityLotZone = z.infer<typeof insertFacilityLotZoneSchema>;
export type FacilityLotZone = typeof facilityLotZones.$inferSelect;

// --- FACILITY ASSIGNMENT TYPES (Configurable assignment types per facility) ---
export const facilityAssignmentTypes = pgTable("facility_assignment_types", {
  id: serial("id").primaryKey(),
  facilityId: varchar("facility_id").notNull(),
  
  typeCode: varchar("type_code").notNull(), // "work_order", "vin", "ticket", "barcode"
  typeName: text("type_name").notNull(), // "Work Order Driven", "VIN Driven"
  description: text("description"),
  
  // Input configuration
  inputFormat: text("input_format"), // Regex pattern for validation
  inputLength: integer("input_length"), // Expected length
  inputExample: text("input_example"), // "1234567" or "1HGCM82633A123456"
  
  isPrimary: boolean("is_primary").default(false), // Main assignment type for this facility
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilityAssignmentTypeSchema = createInsertSchema(facilityAssignmentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertFacilityAssignmentType = z.infer<typeof insertFacilityAssignmentTypeSchema>;
export type FacilityAssignmentType = typeof facilityAssignmentTypes.$inferSelect;

// --- NFT DRIVER BADGES (Hallmark Employee ID Cards on Blockchain) ---
export const driverNftBadges = pgTable("driver_nft_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Links to users table
  driverName: text("driver_name").notNull(),
  avatarUrl: text("avatar_url"), // Background-removed avatar image
  role: text("role").notNull(), // "driver", "supervisor", etc.
  joinDate: text("join_date").notNull(), // When they joined
  
  // NFT Metadata
  hallmarkHash: varchar("hallmark_hash", { length: 64 }).notNull().unique(), // Unique blockchain hash
  variant: text("variant").notNull(), // "beta" or "public"
  blockchainNetwork: text("blockchain_network").default("solana_devnet"), // "solana_devnet", "solana_mainnet"
  mintAddress: text("mint_address"), // Solana mint address when minted
  metadataUri: text("metadata_uri"), // IPFS/Arweave URI for metadata
  
  // Stats snapshot at time of minting
  totalMoves: integer("total_moves").default(0),
  efficiency: integer("efficiency").default(0), // percentage
  quotaCompletion: integer("quota_completion").default(0), // percentage
  avgMph: numeric("avg_mph").default("0"),
  shiftsWorked: integer("shifts_worked").default(0),
  teamRank: integer("team_rank").default(0),
  teamSize: integer("team_size").default(0),
  achievements: text("achievements"), // JSON array of achievement strings
  
  // Purchase/Download tracking
  isPurchased: boolean("is_purchased").default(false),
  purchaseAmount: numeric("purchase_amount"), // $2.99 for public
  stripePaymentId: text("stripe_payment_id"),
  downloadCount: integer("download_count").default(0),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  
  // Timestamps
  mintedAt: timestamp("minted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDriverNftBadgeSchema = createInsertSchema(driverNftBadges).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertDriverNftBadge = z.infer<typeof insertDriverNftBadgeSchema>;
export type DriverNftBadge = typeof driverNftBadges.$inferSelect;

// Driver Acknowledgments - For tracking safety/compliance acknowledgments like hands-free policy
export const driverAcknowledgments = pgTable("driver_acknowledgments", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  driverShiftId: integer("driver_shift_id"), // FK to driver_shifts.id (optional if no active shift)
  driverNumber: varchar("driver_number", { length: 10 }).notNull(), // Driver's phone last 4 or PIN
  driverName: text("driver_name").notNull(), // Driver's full name
  ackType: text("ack_type").notNull(), // "hands_free", "ppe", "device_policy", etc.
  ackMessageVersion: text("ack_message_version"), // Track policy version shown
  date: text("date").notNull(), // "2025-12-02" for easy daily reporting
  recordSource: text("record_source").default("driver_app"), // "driver_app", "supervisor_console"
  acknowledgedAt: timestamp("acknowledged_at").defaultNow().notNull(),
});

export const insertDriverAcknowledgmentSchema = createInsertSchema(driverAcknowledgments).omit({
  id: true,
  acknowledgedAt: true
});
export type InsertDriverAcknowledgment = z.infer<typeof insertDriverAcknowledgmentSchema>;
export type DriverAcknowledgment = typeof driverAcknowledgments.$inferSelect;

// --- RELEASE VERSION CONTROL ---
export const releases = pgTable("releases", {
  id: serial("id").primaryKey(),
  version: text("version").notNull().unique(), // "v2.1.8", "beta.0", etc.
  versionType: text("version_type").notNull(), // "beta", "stable", "hotfix", "major"
  versionNumber: integer("version_number").notNull(), // Auto-incrementing for sorting
  title: text("title"), // Optional release title (e.g., "Pixar Buddy Pro")
  changelog: text("changelog").notNull(), // JSON stringified changelog array
  highlights: text("highlights"), // JSON stringified array of key highlights
  status: text("status").default("draft").notNull(), // "draft", "published"
  publishedAt: timestamp("published_at"),
  
  // Solana blockchain verification
  isBlockchainVerified: boolean("is_blockchain_verified").default(false),
  blockchainTxHash: text("blockchain_tx_hash"), // Solana transaction signature
  releaseHash: text("release_hash"), // SHA-256 hash of release data
  
  createdBy: text("created_by"), // Who created this release
  notes: text("notes"), // Internal notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  isBlockchainVerified: true,
  blockchainTxHash: true,
  releaseHash: true
});
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;

// --- POLICY ACKNOWLEDGMENTS (Consolidated Settings-Based Sign-offs) ---
export const policyAcknowledgments = pgTable("policy_acknowledgments", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  userId: integer("user_id"), // FK to users.id (optional - can be null for anonymous/demo)
  userPin: varchar("user_pin", { length: 10 }), // User's PIN for identification
  userName: text("user_name"), // Display name at time of acknowledgment
  userRole: text("user_role"), // Role at time of acknowledgment
  
  // Policy Information
  policyKey: text("policy_key").notNull(), // "hands_free", "location_permission", "terms_of_service", "safety_rules"
  policyVersion: text("policy_version").default("1.0"), // Track which version they acknowledged
  policyTitle: text("policy_title"), // Human-readable title shown at time of ack
  
  // Acknowledgment Details
  signatureMethod: text("signature_method").default("checkbox"), // "checkbox", "typed_name", "pin_confirm"
  signatureName: text("signature_name"), // If typed_name, what they typed
  
  // Location Permission Specific
  locationPermissionStatus: text("location_permission_status"), // "granted", "denied", "prompt"
  
  // Metadata
  deviceInfo: text("device_info"), // Browser/device info for audit
  ipAddress: text("ip_address"), // IP for audit (hashed or partial)
  
  acknowledgedAt: timestamp("acknowledged_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Some policies may need periodic re-acknowledgment
});

export const insertPolicyAcknowledgmentSchema = createInsertSchema(policyAcknowledgments).omit({
  id: true,
  acknowledgedAt: true
});
export type InsertPolicyAcknowledgment = z.infer<typeof insertPolicyAcknowledgmentSchema>;
export type PolicyAcknowledgment = typeof policyAcknowledgments.$inferSelect;

// --- EMPLOYEE PORTAL: COMPANY NEWS & ANNOUNCEMENTS ---
export const employeeNews = pgTable("employee_news", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  // Content
  title: text("title").notNull(),
  summary: text("summary"), // Short preview text
  content: text("content").notNull(), // Full article content (markdown or plain text)
  imageUrl: text("image_url"), // Optional header image (base64 or URL)
  category: text("category").default("announcement"), // "announcement", "safety", "recognition", "event", "update"
  priority: text("priority").default("normal"), // "urgent", "high", "normal", "low"
  
  // Publishing
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"), // Optional expiration date
  isPinned: boolean("is_pinned").default(false), // Pin to top of feed
  
  // Author info
  authorId: integer("author_id"), // FK to users.id
  authorName: text("author_name").notNull(),
  authorRole: text("author_role"), // "operations_manager", "supervisor"
  
  // Engagement tracking
  viewCount: integer("view_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeNewsSchema = createInsertSchema(employeeNews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true
});
export type InsertEmployeeNews = z.infer<typeof insertEmployeeNewsSchema>;
export type EmployeeNews = typeof employeeNews.$inferSelect;

// --- EMPLOYEE PORTAL: QUICK LINKS (Company Resources) ---
export const employeeQuickLinks = pgTable("employee_quick_links", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  title: text("title").notNull(), // "Benefits Portal", "Time Clock", "HR"
  url: text("url").notNull(), // External or internal link
  description: text("description"), // Short description
  icon: text("icon"), // Icon name from lucide-react (e.g., "Building", "Clock", "Heart")
  category: text("category").default("general"), // "benefits", "hr", "payroll", "training", "general"
  sortOrder: integer("sort_order").default(0), // For custom ordering
  isActive: boolean("is_active").default(true),
  
  createdBy: integer("created_by"), // FK to users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeQuickLinkSchema = createInsertSchema(employeeQuickLinks).omit({
  id: true,
  createdAt: true
});
export type InsertEmployeeQuickLink = z.infer<typeof insertEmployeeQuickLinkSchema>;
export type EmployeeQuickLink = typeof employeeQuickLinks.$inferSelect;

// --- EMPLOYEE PORTAL: RECOGNITION & AWARDS ---
export const employeeRecognitions = pgTable("employee_recognitions", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  // Recognition details
  recognitionType: text("recognition_type").notNull(), // "driver_of_month", "safety_star", "team_player", "milestone", "custom"
  title: text("title").notNull(), // "Driver of the Month - December 2024"
  description: text("description"), // Why they earned it
  
  // Recipient
  recipientId: integer("recipient_id"), // FK to users.id or employees.id
  recipientName: text("recipient_name").notNull(),
  recipientPhoto: text("recipient_photo"), // Photo URL or base64
  recipientDepartment: text("recipient_department"),
  
  // Award details
  awardPeriod: text("award_period"), // "December 2024", "Q4 2024", "2024"
  badgeIcon: text("badge_icon"), // Icon or badge image
  
  // Publishing
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  
  // Author
  awardedBy: integer("awarded_by"), // FK to users.id
  awardedByName: text("awarded_by_name"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeRecognitionSchema = createInsertSchema(employeeRecognitions).omit({
  id: true,
  createdAt: true,
  publishedAt: true
});
export type InsertEmployeeRecognition = z.infer<typeof insertEmployeeRecognitionSchema>;
export type EmployeeRecognition = typeof employeeRecognitions.$inferSelect;

// --- EMPLOYEE PORTAL: NEWS READ TRACKING ---
export const employeeNewsReads = pgTable("employee_news_reads", {
  id: serial("id").primaryKey(),
  newsId: integer("news_id").notNull(), // FK to employeeNews.id
  userId: integer("user_id"), // FK to users.id
  userPin: varchar("user_pin", { length: 10 }), // User's PIN
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// --- EMPLOYEE PORTAL: POSTING PERMISSIONS (Delegation) ---
export const employeeNewsPermissions = pgTable("employee_news_permissions", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  userId: integer("user_id").notNull(), // FK to users.id - who has permission
  userName: text("user_name"),
  userRole: text("user_role"),
  
  canCreateNews: boolean("can_create_news").default(true),
  canEditNews: boolean("can_edit_news").default(false),
  canDeleteNews: boolean("can_delete_news").default(false),
  canCreateRecognitions: boolean("can_create_recognitions").default(false),
  canManageLinks: boolean("can_manage_links").default(false),
  
  grantedBy: integer("granted_by"), // FK to users.id - who gave permission
  grantedByName: text("granted_by_name"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration
});

export const insertEmployeeNewsPermissionSchema = createInsertSchema(employeeNewsPermissions).omit({
  id: true,
  grantedAt: true
});
export type InsertEmployeeNewsPermission = z.infer<typeof insertEmployeeNewsPermissionSchema>;
export type EmployeeNewsPermission = typeof employeeNewsPermissions.$inferSelect;

// --- SCANNED LIST ASSIGNMENTS (OCR List Scanner for Drivers) ---
export const scannedLists = pgTable("scanned_lists", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  
  // Assignment Info
  title: text("title").notNull(), // "Sold Cars - Lane 20" or auto-generated from scan
  description: text("description"), // Optional notes
  assignedToDriverId: integer("assigned_to_driver_id"), // FK to drivers.id or users.id
  assignedToDriverName: text("assigned_to_driver_name"),
  assignedToDriverPin: text("assigned_to_driver_pin"),
  
  // Supervisor who assigned it (or self-assigned by driver)
  assignedByName: text("assigned_by_name"),
  assignedByRole: text("assigned_by_role"),
  
  // Original scanned image
  originalImageBase64: text("original_image_base64"), // The scanned paper image
  ocrRawText: text("ocr_raw_text"), // Raw OCR output before parsing
  
  // Parsed list items (JSON array of items)
  items: text("items").notNull(), // JSON: [{id, text, completed, completedAt}]
  totalItems: integer("total_items").default(0),
  completedItems: integer("completed_items").default(0),
  
  // Status
  status: text("status").default("active").notNull(), // "active", "completed", "cancelled"
  
  // Location context
  lane: text("lane"), // e.g., "Lane 20"
  zone: text("zone"), // e.g., "Clean Side"
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"), // When driver started working
  completedAt: timestamp("completed_at"), // When marked complete
  
  // Completion notification
  supervisorNotified: boolean("supervisor_notified").default(false),
  supervisorNotifiedAt: timestamp("supervisor_notified_at"),
});

export const insertScannedListSchema = createInsertSchema(scannedLists).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  supervisorNotifiedAt: true
});
export type InsertScannedList = z.infer<typeof insertScannedListSchema>;
export type ScannedList = typeof scannedLists.$inferSelect;

// --- EMPLOYEE RECORDS (Employee Files - Personnel Activity Tracking) ---
export const employeeRecords = pgTable("employee_records", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"), // Multi-tenant isolation
  employeeId: integer("employee_id").notNull(), // Links to employees table
  recordType: text("record_type").notNull(), // "move", "attendance", "incident", "note", "acknowledgment"
  eventDate: text("event_date").notNull(), // "2025-12-11" format
  shiftType: text("shift_type"), // "first_shift", "second_shift"
  description: text("description"),
  metrics: text("metrics"), // JSON string for flexible data
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeRecordSchema = createInsertSchema(employeeRecords).omit({
  id: true,
  createdAt: true
});
export type InsertEmployeeRecord = z.infer<typeof insertEmployeeRecordSchema>;
export type EmployeeRecord = typeof employeeRecords.$inferSelect;
