/**
 * Lot Ops Pro Version Information
 * Updated: December 5, 2025
 */

export const APP_VERSION = {
  major: 2,
  minor: 1,
  patch: 5,
  label: "Production",
  buildDate: "2025-12-05",
  codename: "Hallmark",
  buildHash: "C7A9B2D4E6F8A1C3E5B7D9F2A4C6E8B1D3F5A7C9E2B4D6F8A1C3E5B7D9F2A4C6", // Solana-style 64-char hex
  
  // Full version string
  get full() {
    return `v${this.major}.${this.minor}.${this.patch}`;
  },
  
  // Display version with label
  get display() {
    return `${this.full} ${this.label}`;
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
        "Stripe Payment Integration ($1.99 Public Badges)",
        "AI Background Removal (rembg)",
        "Lot Buddy Voice + Text Assistant",
        "Desktop Chat Dock with Mic Permissions",
        "Real-time GPS Tracking",
        "OCR VIN Scanning",
        "Weather-Aware Operations",
        "Multi-tenant White-Label",
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
