export class EcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private appName: string;

  constructor(hubUrl: string, apiKey: string, apiSecret: string, appName: string = 'LotOpsPro') {
    this.hubUrl = hubUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.appName = appName;
  }

  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const bodyStr = body ? JSON.stringify(body) : '';

    // Simple auth - just API key and secret headers (no HMAC signature needed)
    const headers: Record<string, string> = {
      'X-Api-Key': this.apiKey,
      'X-Api-Secret': this.apiSecret,
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
    return this.request('POST', '/sync/assets', { 
      appName: this.appName,
      assets: assets.map(a => ({
        ...a,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncNftBadges(badges: any[]) {
    return this.request('POST', '/sync/badges', { 
      appName: this.appName,
      badges 
    });
  }

  async syncActivityLogs(logs: any[]) {
    return this.request('POST', '/sync/activity', { 
      appName: this.appName,
      logs 
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ORBIT STAFFING / PAYROLL SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  async syncW2Payroll(year: number, employees: any[]) {
    return this.request('POST', '/sync/w2', { 
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
    return this.request('POST', '/sync/1099', { 
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
    return this.request('POST', '/sync/workers', { 
      appName: this.appName,
      workers: workers.map(w => ({
        ...w,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncContractors(contractors: any[]) {
    return this.request('POST', '/sync/contractors', { 
      appName: this.appName,
      contractors: contractors.map(c => ({
        ...c,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncTimesheets(timesheets: any[]) {
    return this.request('POST', '/sync/timesheets', { 
      appName: this.appName,
      timesheets: timesheets.map(t => ({
        ...t,
        sourceApp: this.appName,
        syncedAt: new Date().toISOString()
      }))
    });
  }

  async syncCertifications(certifications: any[]) {
    return this.request('POST', '/sync/certifications', { 
      appName: this.appName,
      certifications 
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ORBIT STAFFING QUERIES
  // ─────────────────────────────────────────────────────────────────────────────

  async getShopWorkers(shopId: string) {
    return this.request('GET', `/shops/${shopId}/workers`);
  }

  async getShopPayroll(shopId: string) {
    return this.request('GET', `/shops/${shopId}/payroll`);
  }

  async getPayrollSummary(year: number) {
    return this.request('GET', `/payroll/summary?year=${year}&app=${this.appName}`);
  }

  async get1099Summary(year: number) {
    return this.request('GET', `/1099/summary?year=${year}&app=${this.appName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CODE SNIPPET SHARING
  // ─────────────────────────────────────────────────────────────────────────────

  async pushSnippet(name: string, code: string, language: string, category: string, tags?: string[]) {
    return this.request('POST', '/snippets', {
      appName: this.appName,
      name,
      code,
      language,
      category,
      tags,
    });
  }

  async getSnippet(snippetId: string) {
    return this.request('GET', `/snippets/${snippetId}`);
  }

  async searchSnippets(query: string, language?: string, category?: string) {
    const params = new URLSearchParams({ query });
    if (language) params.append('language', language);
    if (category) params.append('category', category);
    return this.request('GET', `/snippets/search?${params.toString()}`);
  }

  async getSharedSnippets(limit = 50) {
    return this.request('GET', `/snippets?limit=${limit}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RELEASE MANAGEMENT (Auto-Version + Blockchain Hash Sync)
  // ─────────────────────────────────────────────────────────────────────────────

  async publishRelease(release: {
    version: string;
    title?: string;
    changelog?: string;
    blockchainTxHash?: string;
    buildHash?: string;
  }) {
    return this.request('POST', '/releases', {
      appName: this.appName,
      ...release,
      publishedAt: new Date().toISOString()
    });
  }

  async getLatestRelease() {
    return this.request('GET', `/releases/latest?app=${this.appName}`);
  }

  async getReleaseHistory(limit = 10) {
    return this.request('GET', `/releases?app=${this.appName}&limit=${limit}`);
  }

  async getNextVersion(bumpType: 'major' | 'minor' | 'patch' = 'patch') {
    return this.request('GET', `/releases/next-version?app=${this.appName}&bump=${bumpType}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HUB STATUS & LOGGING
  // ─────────────────────────────────────────────────────────────────────────────

  async getStatus() {
    return this.request('GET', '/status');
  }

  async getLogs(limit = 50, offset = 0) {
    return this.request('GET', `/logs?limit=${limit}&offset=${offset}&app=${this.appName}`);
  }

  async logActivity(action: string, details: any) {
    return this.request('POST', '/logs', { 
      appName: this.appName,
      action, 
      details 
    });
  }

  async registerApp(appMetadata: {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
  }) {
    return this.request('POST', '/apps/register', appMetadata);
  }

  async heartbeat() {
    return this.request('POST', '/heartbeat', {
      appName: this.appName,
      timestamp: new Date().toISOString(),
      status: 'active'
    });
  }
}

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
  
  ecosystemClient = new EcosystemClient(hubUrl, apiKey, apiSecret, 'LotOpsPro');
  console.log('[EcosystemClient] Connected to Darkwave Developer Hub');
  return ecosystemClient;
}

export function isHubConnected(): boolean {
  return getEcosystemClient() !== null;
}
