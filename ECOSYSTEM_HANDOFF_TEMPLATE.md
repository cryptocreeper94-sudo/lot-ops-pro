# Ecosystem Integration Handoff Template

**From:** Lot Ops Pro (Asset Tracking System)
**To:** Darkwave Developer Hub / Other Ecosystem Apps
**Version:** v2.1.7 | **Date:** December 7, 2025

---

## OVERVIEW

This document provides everything needed to integrate with the Darkwave Developer Hub ecosystem. It includes:
1. EcosystemClient class for hub communication
2. Asset tracking schema (generalized)
3. Three-level access system (Personal/Company/Admin)
4. Multi-tenant data isolation pattern
5. API endpoint templates

---

## 1. ECOSYSTEM CLIENT CLASS

Copy this entire class to connect your app to the Darkwave Developer Hub:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: server/ecosystemClient.ts
// ═══════════════════════════════════════════════════════════════════════════════

import crypto from 'crypto';

export class EcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private appName: string;

  constructor(hubUrl: string, apiKey: string, apiSecret: string, appName: string) {
    this.hubUrl = hubUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.appName = appName;
  }

  private generateSignature(body: string, timestamp: string): string {
    const message = `${body}${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  private async request(method: string, endpoint: string, body?: any): Promise<any> {
    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(bodyStr, timestamp);

    const headers: Record<string, string> = {
      'X-Api-Key': this.apiKey,
      'X-Api-Secret': this.apiSecret,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'X-App-Name': this.appName,
      'Content-Type': 'application/json',
    };

    const url = `${this.hubUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? bodyStr : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hub error: ${response.status} - ${error}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[EcosystemClient] Request failed: ${error.message}`);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET TRACKING SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  async syncAssets(assets: any[]) {
    return this.request('POST', '/api/ecosystem/sync/assets', { 
      appName: this.appName,
      assets: assets.map(a => ({
        ...a,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncNftBadges(badges: any[]) {
    return this.request('POST', '/api/ecosystem/sync/badges', { 
      appName: this.appName,
      badges 
    });
  }

  async syncActivityLogs(logs: any[]) {
    return this.request('POST', '/api/ecosystem/sync/activity', { 
      appName: this.appName,
      logs 
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ORBIT STAFFING / PAYROLL SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  async syncW2Payroll(year: number, employees: any[]) {
    return this.request('POST', '/api/ecosystem/sync/w2', { 
      appName: this.appName,
      year, 
      employees: employees.map(e => ({
        ...e,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async sync1099Payments(year: number, contractors: any[]) {
    return this.request('POST', '/api/ecosystem/sync/1099', { 
      appName: this.appName,
      year, 
      contractors: contractors.map(c => ({
        ...c,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncWorkers(workers: any[]) {
    return this.request('POST', '/api/ecosystem/sync/workers', { 
      appName: this.appName,
      workers: workers.map(w => ({
        ...w,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncTimesheets(timesheets: any[]) {
    return this.request('POST', '/api/ecosystem/sync/timesheets', { 
      appName: this.appName,
      timesheets: timesheets.map(t => ({
        ...t,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ORBIT STAFFING QUERIES
  // ─────────────────────────────────────────────────────────────────────────────

  async getShopWorkers(shopId: string) {
    return this.request('GET', `/api/ecosystem/shops/${shopId}/workers`);
  }

  async getShopPayroll(shopId: string) {
    return this.request('GET', `/api/ecosystem/shops/${shopId}/payroll`);
  }

  async getPayrollSummary(year: number) {
    return this.request('GET', `/api/ecosystem/payroll/summary?year=${year}&app=${this.appName}`);
  }

  async get1099Summary(year: number) {
    return this.request('GET', `/api/ecosystem/1099/summary?year=${year}&app=${this.appName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CODE SNIPPET SHARING
  // ─────────────────────────────────────────────────────────────────────────────

  async pushSnippet(name: string, code: string, language: string, category: string, tags?: string[]) {
    return this.request('POST', '/api/ecosystem/snippets', {
      appName: this.appName,
      name,
      code,
      language,
      category,
      tags,
    });
  }

  async getSnippet(snippetId: string) {
    return this.request('GET', `/api/ecosystem/snippets/${snippetId}`);
  }

  async searchSnippets(query: string, language?: string, category?: string) {
    const params = new URLSearchParams({ query });
    if (language) params.append('language', language);
    if (category) params.append('category', category);
    return this.request('GET', `/api/ecosystem/snippets/search?${params.toString()}`);
  }

  async getSharedSnippets(limit = 50) {
    return this.request('GET', `/api/ecosystem/snippets?limit=${limit}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HUB STATUS & LOGGING
  // ─────────────────────────────────────────────────────────────────────────────

  async getStatus() {
    return this.request('GET', '/api/ecosystem/status');
  }

  async getLogs(limit = 50, offset = 0) {
    return this.request('GET', `/api/ecosystem/logs?limit=${limit}&offset=${offset}&app=${this.appName}`);
  }

  async logActivity(action: string, details: any) {
    return this.request('POST', '/api/ecosystem/logs', { 
      appName: this.appName,
      action, 
      details 
    });
  }

  async heartbeat() {
    return this.request('POST', '/api/ecosystem/heartbeat', {
      appName: this.appName,
      timestamp: new Date().toISOString(),
      status: 'active'
    });
  }
}

// Singleton pattern for client initialization
let ecosystemClient: EcosystemClient | null = null;

export function getEcosystemClient(): EcosystemClient | null {
  if (ecosystemClient) return ecosystemClient;
  
  const hubUrl = process.env.DARKWAVE_HUB_URL;
  const apiKey = process.env.DARKWAVE_API_KEY;
  const apiSecret = process.env.DARKWAVE_API_SECRET;
  
  if (!hubUrl || !apiKey || !apiSecret) {
    console.log('[EcosystemClient] Hub credentials not configured - running in standalone mode');
    return null;
  }
  
  ecosystemClient = new EcosystemClient(hubUrl, apiKey, apiSecret, 'YOUR_APP_NAME');
  console.log('[EcosystemClient] Connected to Darkwave Developer Hub');
  return ecosystemClient;
}

export function isHubConnected(): boolean {
  return getEcosystemClient() !== null;
}
```

---

## 2. ASSET TRACKING SCHEMA (GENERALIZED)

Use this Drizzle schema for asset tracking with multi-tenant isolation:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: shared/schema.ts (Asset Tracking Tables)
// ═══════════════════════════════════════════════════════════════════════════════

import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// Main asset tracking table
export const assetTracking = pgTable("asset_tracking", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull(), // Multi-tenant isolation key
  assetNumber: text("asset_number").notNull(),
  assetName: text("asset_name"),
  assetType: text("asset_type").default("vehicle"),
  serialNumber: text("serial_number"),
  qrCode: text("qr_code"),
  hallmarkStamp: text("hallmark_stamp"), // Unique blockchain/hash identifier
  status: text("status").default("active"),
  location: text("location"),
  notes: text("notes"),
  currentOwner: integer("current_owner"),
  currentOwnerName: text("current_owner_name"),
  originalAssignedTo: integer("original_assigned_to"),
  originalAssignedToName: text("original_assigned_to_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset history for audit trail
export const assetHistory = pgTable("asset_history", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  action: text("action").notNull(),
  actionDescription: text("action_description"),
  performedBy: integer("performed_by"),
  performedByName: text("performed_by_name"),
  hallmarkStamp: text("hallmark_stamp"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scan logs for user activity tracking
export const scanLogs = pgTable("scan_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scannedValue: text("scanned_value"),
  scanType: text("scan_type").default("vin"),
  location: text("location"),
  scannedAt: timestamp("scanned_at").defaultNow(),
});
```

---

## 3. THREE-LEVEL ACCESS SYSTEM

Implement this pattern for tiered data access:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// THREE-LEVEL ACCESS PATTERN
// ═══════════════════════════════════════════════════════════════════════════════

// LEVEL 1: PERSONAL - User sees only their own data
async function getUserActivity(userId: number) {
  // Only returns data where user_id = current user
  const badges = await db.select().from(nftBadges).where(eq(nftBadges.userId, userId));
  const history = await db.select().from(assetHistory).where(eq(assetHistory.performedBy, userId));
  const scans = await db.select().from(scanLogs).where(eq(scanLogs.userId, userId));
  return { badges, history, scans };
}

// LEVEL 2: COMPANY - Supervisor sees company-wide data (filtered by tenantId)
async function searchAssets(query: string, tenantId?: string) {
  if (tenantId) {
    // Multi-tenant isolation: filter by company
    return db.execute(sql`
      SELECT * FROM asset_tracking 
      WHERE tenant_id = ${tenantId}
        AND (asset_name ILIKE ${'%' + query + '%'} 
             OR asset_number ILIKE ${'%' + query + '%'}
             OR serial_number ILIKE ${'%' + query + '%'})
      ORDER BY updated_at DESC
    `);
  }
  // LEVEL 3: ADMIN - Developer/admin sees all data
  return db.execute(sql`
    SELECT * FROM asset_tracking 
    WHERE asset_name ILIKE ${'%' + query + '%'}
       OR asset_number ILIKE ${'%' + query + '%'}
    ORDER BY updated_at DESC
  `);
}

// Route example with access level check
app.get("/api/assets/search", async (req, res) => {
  const user = await getUser(req.session.userId);
  
  // Determine access level
  const tenantId = user.role === "admin" 
    ? undefined  // Admin sees all
    : user.tenantId;  // Others see only their company
    
  const results = await searchAssets(req.query.q, tenantId);
  res.json(results);
});
```

---

## 4. ENVIRONMENT VARIABLES

Add these to your app:

```bash
# Darkwave Developer Hub Connection
DARKWAVE_HUB_URL=https://darkwavestudios.io
DARKWAVE_API_KEY=dw_app_your_key_here
DARKWAVE_API_SECRET=dw_secret_your_secret_here
```

---

## 5. API ROUTES TEMPLATE

Add these routes to connect to the ecosystem:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM SYNC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Check hub connection status
app.get("/api/ecosystem/status", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) {
    return res.json({ connected: false, standalone: true });
  }
  const status = await client.getStatus();
  res.json({ connected: true, ...status });
});

// Sync assets to hub
app.post("/api/ecosystem/sync/assets", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) return res.status(503).json({ message: "Hub not configured" });
  
  const assets = await storage.getAllAssets();
  const result = await client.syncAssets(assets);
  res.json({ success: true, synced: assets.length, result });
});

// Sync workers to Orbit Staffing
app.post("/api/ecosystem/sync/workers", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) return res.status(503).json({ message: "Hub not configured" });
  
  const workers = await storage.getAllWorkers();
  const result = await client.syncWorkers(workers);
  res.json({ success: true, synced: workers.length, result });
});

// Sync payroll data (W2 and 1099)
app.post("/api/ecosystem/sync/payroll", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) return res.status(503).json({ message: "Hub not configured" });
  
  const { year, employees, contractors } = req.body;
  if (employees?.length) await client.syncW2Payroll(year, employees);
  if (contractors?.length) await client.sync1099Payments(year, contractors);
  res.json({ success: true });
});

// Push code snippet to share with other apps
app.post("/api/ecosystem/push-snippet", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) return res.status(503).json({ message: "Hub not configured" });
  
  const { name, code, language, category, tags } = req.body;
  const result = await client.pushSnippet(name, code, language, category, tags);
  res.json({ success: true, result });
});

// Get shared snippets from ecosystem
app.get("/api/ecosystem/snippets", async (req, res) => {
  const client = getEcosystemClient();
  if (!client) return res.status(503).json({ message: "Hub not configured" });
  
  const snippets = await client.getSharedSnippets();
  res.json(snippets);
});
```

---

## 6. REQUIRED HUB ENDPOINTS (for Darkwave Developer Hub)

The hub needs to expose these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ecosystem/status | Return hub status |
| POST | /api/ecosystem/sync/assets | Receive asset data from apps |
| POST | /api/ecosystem/sync/workers | Receive worker data |
| POST | /api/ecosystem/sync/w2 | Receive W2 payroll data |
| POST | /api/ecosystem/sync/1099 | Receive 1099 contractor data |
| POST | /api/ecosystem/sync/timesheets | Receive timesheet data |
| GET | /api/ecosystem/shops/:id/workers | Get workers for a shop |
| GET | /api/ecosystem/shops/:id/payroll | Get payroll for a shop |
| GET | /api/ecosystem/payroll/summary | Get payroll summary |
| POST | /api/ecosystem/snippets | Store code snippet |
| GET | /api/ecosystem/snippets | List shared snippets |
| GET | /api/ecosystem/snippets/search | Search snippets |
| GET | /api/ecosystem/snippets/:id | Get specific snippet |
| POST | /api/ecosystem/logs | Log activity |
| GET | /api/ecosystem/logs | Get activity logs |
| POST | /api/ecosystem/heartbeat | App health check |

---

## 7. SIGNATURE VERIFICATION (Hub Side)

The hub should verify incoming requests:

```typescript
function verifySignature(req: Request): boolean {
  const apiKey = req.headers['x-api-key'];
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];
  
  // Look up API secret for this key
  const apiSecret = getSecretForKey(apiKey);
  if (!apiSecret) return false;
  
  // Recreate signature
  const body = JSON.stringify(req.body);
  const message = `${body}${timestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
    
  return signature === expectedSignature;
}
```

---

## NOTES FOR IMPLEMENTATION

1. **tenantId**: Replace with your tenant isolation key (stripeCustomerId, companyId, etc.)
2. **YOUR_APP_NAME**: Replace with your app's identifier
3. **Access Levels**: Adjust role names to match your auth system
4. **Date Filtering**: searchAssets supports optional startDate/endDate parameters

---

**Questions?** Contact the ecosystem team or check the hub documentation.
