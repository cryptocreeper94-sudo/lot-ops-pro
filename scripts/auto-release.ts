/**
 * Auto-Release Script
 * Runs during build to auto-bump version and sync to Darkwave Hub
 * Triggered automatically on Replit publish/republish
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const VERSION_FILE = path.join(process.cwd(), 'shared/version.ts');

interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  label: string;
  codename: string;
}

function parseVersion(): VersionInfo {
  const content = fs.readFileSync(VERSION_FILE, 'utf-8');
  const majorMatch = content.match(/major:\s*(\d+)/);
  const minorMatch = content.match(/minor:\s*(\d+)/);
  const patchMatch = content.match(/patch:\s*(\d+)/);
  const labelMatch = content.match(/label:\s*"([^"]+)"/);
  const codenameMatch = content.match(/codename:\s*"([^"]+)"/);

  return {
    major: parseInt(majorMatch?.[1] || '2'),
    minor: parseInt(minorMatch?.[1] || '1'),
    patch: parseInt(patchMatch?.[1] || '0'),
    label: labelMatch?.[1] || 'Production',
    codename: codenameMatch?.[1] || 'Release'
  };
}

function generateBuildHash(version: string): string {
  const data = JSON.stringify({
    version,
    timestamp: new Date().toISOString(),
    random: Math.random().toString(36)
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function writeVersion(v: VersionInfo, buildHash: string): void {
  const today = new Date().toISOString().split('T')[0];
  
  const content = `/**
 * Lot Ops Pro Version Information
 * Auto-updated by build script on ${today}
 */

export const APP_VERSION = {
  major: ${v.major},
  minor: ${v.minor},
  patch: ${v.patch},
  label: "${v.label}",
  buildDate: "${today}",
  codename: "${v.codename}",
  buildHash: "${buildHash}",
  
  // Full version string
  get full() {
    return \`v\${this.major}.\${this.minor}.\${this.patch}\`;
  },
  
  // Display version with label
  get display() {
    return \`\${this.full} \${this.label}\`;
  },
  
  // Build info for developer dashboard
  get buildInfo() {
    return {
      version: this.full,
      label: this.label,
      buildDate: this.buildDate,
      codename: this.codename,
      buildHash: this.buildHash,
      features: [
        "PWA Mobile-First Design",
        "Two-Tier Hallmark System (Subscriber + Franchise)",
        "Franchise Ownership & Custody Transfer",
        "Serial Number Generation",
        "NFT Driver Badges (Solana Mainnet)",
        "Stripe Payment Integration",
        "AI Background Removal (rembg)",
        "Lot Buddy Voice + Text Assistant",
        "Real-time GPS Tracking",
        "OCR VIN Scanning",
        "Weather-Aware Operations",
        "Multi-tenant White-Label",
        "Darkwave Hub Auto-Sync",
      ]
    };
  }
};

// Blockchain configuration - ALL minting on Solana Mainnet
export const BLOCKCHAIN_CONFIG = {
  // Network (Mainnet only - real blockchain for all badges)
  network: {
    name: "Solana Mainnet",
    rpcUrl: "https://mainnet.helius-rpc.com/?api-key=HELIUS_API_KEY",
    explorer: "https://explorer.solana.com",
  },
  
  // Pricing by variant
  pricing: {
    beta: {
      price: 0, // FREE for beta testers (thank you gift)
      label: "FREE Collector's Edition",
    },
    public: {
      price: 1.99, // $1.99 for public users
      label: "Verified NFT Badge",
    }
  },
  
  // Hash generation for hallmark verification
  generateHash: (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Generate 64-character hex hash
    const timestamp = Date.now().toString(16);
    const baseHash = Math.abs(hash).toString(16).toUpperCase();
    return (baseHash + timestamp).padStart(64, '0').slice(0, 64);
  }
};

export default APP_VERSION;
`;

  fs.writeFileSync(VERSION_FILE, content, 'utf-8');
}

async function syncToHub(version: string, buildHash: string): Promise<void> {
  const hubUrl = process.env.DARKWAVE_HUB_URL;
  const apiKey = process.env.DARKWAVE_API_KEY;
  const apiSecret = process.env.DARKWAVE_API_SECRET;

  if (!hubUrl || !apiKey || !apiSecret) {
    console.log('[AutoRelease] Hub credentials not configured - skipping sync');
    return;
  }

  try {
    const response = await fetch(`${hubUrl}/releases`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'X-Api-Secret': apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName: 'LotOpsPro',
        version: `v${version}`,
        title: 'Auto-Release',
        changelog: `Automated build release v${version}`,
        buildHash,
        publishedAt: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log(`[AutoRelease] Synced v${version} to Darkwave Hub`);
    } else {
      console.log(`[AutoRelease] Hub sync response: ${response.status}`);
    }
  } catch (error) {
    console.log('[AutoRelease] Hub sync skipped:', (error as Error).message);
  }
}

async function main() {
  console.log('[AutoRelease] Starting auto-release...');
  
  // Parse current version
  const current = parseVersion();
  console.log(`[AutoRelease] Current: v${current.major}.${current.minor}.${current.patch}`);
  
  // Bump patch version
  const newVersion: VersionInfo = {
    ...current,
    patch: current.patch + 1
  };
  
  const versionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
  const buildHash = generateBuildHash(versionString);
  
  console.log(`[AutoRelease] New: v${versionString}`);
  console.log(`[AutoRelease] Hash: ${buildHash.slice(0, 16)}...`);
  
  // Write updated version file
  writeVersion(newVersion, buildHash);
  console.log('[AutoRelease] Updated shared/version.ts');
  
  // Sync to Darkwave Hub
  await syncToHub(versionString, buildHash);
  
  console.log('[AutoRelease] Complete!');
}

main().catch(console.error);
