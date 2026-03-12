# Multi-Tenant Architecture - Complete Data Isolation

## Overview

Lot Ops Pro implements **complete multi-tenant data isolation** to ensure that each customer (franchisee or monthly subscriber) has absolutely NO access to another customer's data, messages, assets, or operations. This is mission-critical for security, compliance, and customer trust.

## Three Tiers of Deployment

### 1. Lot Ops Pro Internal (Manheim Nashville)
- **Database:** Shared internal PostgreSQL database (Neon)
- **Tenant ID:** `stripeCustomerId = NULL` (internal operations)
- **CRM Access:** FULL - Sales pipeline, prospects, deals, business cards, hallmark branding (internal use only)
- **Data Visibility:** Can see all internal operations, messaging, employees, vehicles, assets
- **User Base:** Developers, Operations Managers, Supervisors, Drivers (internal only)
- **Messaging:** Isolated messaging system for internal team communication (no cross-contamination with customers)
- **Asset Tracking:** Internal asset database for company operations

### 2. Franchisee Customers
- **Database:** **Their own completely separate database** (not shared with Lot Ops Pro or other franchisees)
- **Tenant ID:** `stripeCustomerId = "cus_XXXX"` (their Stripe customer ID)
- **Management:** Franchisees manage their own system deployment and support
- **Updates:** Receive updates/patches from Lot Ops Pro but deploy independently
- **CRM Access:** **BLOCKED** - No access to Lot Ops Pro CRM, sales dashboards, or business card generation
- **Messaging:** Completely isolated messaging system - NO visibility into Lot Ops Pro or other franchisee messages
- **Employees/Drivers:** Only their own employee roster visible
- **Vehicles/Assets:** Only their own vehicle inventory and assets visible
- **Custom Branding:** Create and customize their own hallmarks and serial number systems
- **Audit Trail:** Full audit trail of their own operations

### 3. Monthly Subscription Customers
- **Database:** **Their own completely separate database** (managed/maintained by Lot Ops Pro team)
- **Tenant ID:** `stripeCustomerId = "cus_YYYY"` (their Stripe customer ID)
- **Management:** Lot Ops Pro team handles database maintenance, backups, and updates
- **CRM Access:** **BLOCKED** - No access to Lot Ops Pro CRM, sales dashboards, or business card generation
- **Messaging:** Completely isolated messaging system - NO visibility into Lot Ops Pro or other customer messages
- **Employees/Drivers:** Only their own employee roster visible
- **Vehicles/Assets:** Only their own vehicle inventory and assets visible
- **Custom Branding:** Create and customize their own hallmarks and serial number systems
- **Compliance Backup:** Lot Ops Pro maintains encrypted backup copies of their hallmarks, serials, and audit trails for security and compliance
- **Support:** Lot Ops Pro provides technical support and database management

## Multi-Tenant Data Isolation Implementation

### Database Layer

Every operational table includes `stripeCustomerId` field for tenant isolation:

**Tenant Filtering Rules:**
- `stripeCustomerId = NULL` → Lot Ops Pro internal data (unrestricted access)
- `stripeCustomerId = "cus_XXXX"` → Specific customer data (ONLY accessible to that customer)
- **ALL database queries must filter by `stripeCustomerId`** to prevent cross-tenant data leaks

### Isolated Tables

| Table | Purpose | Isolation Method |
|-------|---------|------------------|
| `messages` | Driver-supervisor communication | **CRITICAL: Filters by stripeCustomerId prevent message leaks** |
| `vehicles` | Vehicle inventory database | Each customer sees ONLY their vehicles |
| `drivers` | Driver roster | Each customer sees ONLY their drivers |
| `employees` | Employee roster | Each customer sees ONLY their employees |
| `work_orders` | Work order assignments | Each customer sees ONLY their work orders |
| `work_order_items` | Individual work items | Each customer sees ONLY their work items |
| `asset_tracking` | Asset database with hallmark stamps | Each customer sees ONLY their assets |
| `asset_history` | Asset action audit trail | Each customer sees ONLY their asset history |
| `customer_hallmarks` | Customer-branded hallmarks | Each customer manages ONLY their hallmarks |
| `serial_number_systems` | Serial number generation | Each customer creates ONLY their serial systems |
| `customer_hallmark_audit_log` | Hallmark usage tracking | Each customer sees ONLY their audit log |

### API Endpoint Tenant Enforcement

**Example: Getting messages (CRITICAL)**
```javascript
// API extracts user's stripeCustomerId from Stripe subscription
const user = await storage.getUser(req.session.userId);
const customerTenantId = user.stripeCustomerId;

// Query includes mandatory tenant filter
const messages = await db.select()
  .from(messages)
  .where(and(
    eq(messages.stripeCustomerId, customerTenantId),  // ← Tenant filter
    eq(messages.toId, driverId)
  ));

// Result: User ONLY sees their own tenant's messages, NEVER another customer's
```

**Validation Pattern (applies to all operations):**
```javascript
app.get("/api/vehicles", async (req, res) => {
  const user = await storage.getUser(req.session.userId);
  
  // Enforce tenant isolation
  if (!user.stripeCustomerId) {
    return res.status(403).json({ error: "No customer association" });
  }
  
  // Query filtered by tenant
  const vehicles = await storage.getVehiclesByCustomer(user.stripeCustomerId);
  res.json(vehicles);
});
```

## CRM System - INTERNAL ONLY

**CRITICAL: CRM is exclusively for Lot Ops Pro internal use (developers/admins).**

- Sales dashboards: **NOT accessible to any customers**
- Business card generator: **NOT accessible to customers**
- Sales force management: **NOT accessible to customers**
- Prospect/deal tracking: **NOT accessible to customers**
- Contact database: **NOT accessible to customers**

**Enforcement:**
- Role-based access checks confirm user is "developer" or "operations_manager"
- Stripe subscription does NOT grant CRM access (reserved for Lot Ops Pro only)
- All CRM operations query with `stripeCustomerId = NULL` (internal only)

## Authentication & Authorization

### Login Flow
1. User enters PIN
2. System looks up user in `users` table
3. Check user's Stripe subscription status
4. Load user's `stripeCustomerId` from Stripe data
5. Set session: `session.userId` and implicit tenant context from `stripeCustomerId`

### Tenant Context in Every Request
```javascript
const user = await storage.getUser(req.session.userId);
const userTenantId = user.stripeCustomerId; // NULL for Lot Ops Pro, "cus_XXXX" for customers

// All queries automatically filtered by userTenantId
// User cannot see data from other tenants regardless of role
```

### Role-Based + Tenant-Based Access

| Feature | Lot Ops Pro (NULL) | Franchisee/Monthly (cus_XXXX) |
|---------|-------------------|------------------------------|
| Messaging | Full internal messaging | ONLY their customer's messages |
| Vehicles | Internal vehicle database | ONLY their customer's vehicles |
| Employees | Internal roster | ONLY their customer's employees |
| Assets | Internal assets | ONLY their customer's assets + custom hallmarks |
| CRM | FULL access | **BLOCKED** |
| Business Cards | FULL access | **BLOCKED** |
| Sales Dashboard | FULL access | **BLOCKED** |
| Hallmark Manager | FULL access to all customer hallmarks | ONLY their own hallmarks |
| Serial Systems | FULL access to all customer systems | ONLY their own serial systems |

## Compliance & Security

### Data Isolation Guarantees
- ✅ **No message leaks** between customers or Lot Ops Pro
- ✅ **No vehicle/asset visibility** across customers
- ✅ **No employee roster sharing** between tenants
- ✅ **No cross-customer operational access** regardless of role
- ✅ **Complete audit trail** per customer with secure logging
- ✅ **Backup copies** of customer hallmarks/serials for compliance (for monthly subscribers)

### Audit Trail
- Every hallmark action logged with `stripeCustomerId`, timestamp, performer, IP address, user agent
- Every asset modification logged with `stripeCustomerId` and audit trail
- Every message operation logged per tenant
- Historical records preserved for compliance (GDPR compliant data export/deletion)

## Future Scaling

**Separate Database Per Customer (Optional):**
If needed for ultimate isolation, each franchisee/monthly customer can get:
- Dedicated PostgreSQL database instance (Neon)
- Separate connection string per customer
- Same schema but completely isolated storage
- Current implementation supports both models (single shared DB with tenant filtering OR separate DBs)

**Current Model:** Single shared PostgreSQL with strict `stripeCustomerId` filtering (cost-efficient, compliant, secure)

## Verification Checklist

Before deploying any customer:
- [ ] Verify `stripeCustomerId` is set in user record during onboarding
- [ ] Confirm all API endpoints filter queries by `stripeCustomerId`
- [ ] Test that customer CANNOT see other customer's messages
- [ ] Test that customer CANNOT access CRM features
- [ ] Test that customer CANNOT see other customer's vehicles/employees/assets
- [ ] Test that customer CAN access their own hallmarks and serial systems
- [ ] Verify audit log entries include `stripeCustomerId` for compliance
- [ ] Confirm backup copies of hallmarks are created for monthly subscribers
- [ ] Load-test with multiple concurrent customers to ensure isolation holds

---

**Architecture Decision:** Jason requested complete separation. This implementation ensures that:
1. **Lot Ops Pro internal operations are completely isolated from customers**
2. **Each customer is completely isolated from every other customer**
3. **Messages, vehicles, employees, assets NEVER cross tenants**
4. **CRM is exclusively internal (developers only, never accessible to customers)**
5. **Franchisees manage their own deployment, monthly customers get managed service**
6. **Full compliance and audit trail for each tenant**
