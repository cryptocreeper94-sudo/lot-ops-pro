import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, FileCode, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function HandoffTemplate() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const handoffTemplate = `
================================================================================
LOT OPS PRO - AGENT HANDOFF TEMPLATE
Two-Tier Hallmark System Implementation Guide
Version: 2.1.2 | Last Updated: December 5, 2025
================================================================================

## SYSTEM OVERVIEW

Lot Ops Pro is an autonomous lot management platform with a white-label hallmark 
system. The hallmark system has TWO ownership modes:

1. SUBSCRIBER MANAGED - Monthly SaaS ($15-25/driver/month)
   - Lot Ops Pro controls the hallmark, serials, data
   - Customers get full usage but no ownership

2. FRANCHISE OWNED - One-time fee + royalties
   - Customer owns their hallmark system completely
   - Full data portability and customization rights

================================================================================
## DATABASE SCHEMA (shared/schema.ts)
================================================================================

### customerHallmarks Table - Key Fields:

\`\`\`typescript
// OWNERSHIP MODE - Determines control
ownershipMode: text("ownership_mode").default("subscriber_managed")
// Values: "subscriber_managed" | "franchise_owned"

// FRANCHISE FIELDS
franchiseId: text("franchise_id")           // "LOT-NASH-001"
franchiseTier: text("franchise_tier")       // "standard" | "premium" | "enterprise"
territoryExclusive: boolean                  // Exclusive territory rights
territoryRegion: text("territory_region")   // "Nashville, TN"
franchiseFee: text("franchise_fee")         // "$10,000"
royaltyPercent: text("royalty_percent")     // "5%"
royaltyType: text("royalty_type")           // "percentage" | "per_vehicle" | "per_move"
royaltyAmount: text("royalty_amount")       // For per-unit: "$0.50"
supportTier: text("support_tier")           // "basic" | "priority" | "enterprise"
supportMonthlyFee: text("support_monthly_fee") // "$500"
franchiseStartDate: timestamp
franchiseRenewalDate: timestamp

// CUSTODY FIELDS
custodyOwner: text("custody_owner").default("lotops")
// "lotops" for managed, customer email for franchise-owned
custodyTransferDate: timestamp
previousOwner: text("previous_owner")
\`\`\`

### hallmarkCustodyTransfers Table:

\`\`\`typescript
// Tracks all ownership transfers from subscriber to franchise
hallmarkId: integer          // References customerHallmarks
stripeCustomerId: text
transferType: text           // "subscriber_to_franchise" | "franchise_upgrade"
fromMode: text               // "subscriber_managed"
toMode: text                 // "franchise_owned"
fromOwner: text              // "lotops" or previous owner
toOwner: text                // New owner email/identifier

// Financial terms
transferFee: text            // One-time transfer fee
franchiseFeeAgreed: text     // Franchise fee for this transfer
royaltyTerms: text           // JSON: {type, percent, amount}

// Assets transferred
serialSystemsTransferred: integer
assetsTransferred: integer
auditHistoryIncluded: boolean

// Approval chain
approvedBy: text             // Lot Ops admin who approved
customerAccepted: boolean
legalAgreementSigned: boolean
legalAgreementUrl: text

// Status
status: text                 // "pending" | "approved" | "completed" | "cancelled"
\`\`\`

================================================================================
## FRANCHISE TIERS & PRICING
================================================================================

### STANDARD FRANCHISE ($5,000)
- Single location only
- 5% royalty per vehicle
- $500/month support fee
- City-level territory (non-exclusive)
- 48hr support response
- 70/30 NFT badge revenue share (they keep 70%)

### PREMIUM FRANCHISE ($10,000) ★ MOST POPULAR
- Up to 5 locations
- 4% royalty per vehicle
- $750/month support fee
- Regional exclusive territory
- 24hr support response
- 80/20 NFT badge revenue share
- White-label mobile app option
- Dedicated account manager

### ENTERPRISE FRANCHISE ($25,000)
- Unlimited locations
- 3% royalty per vehicle
- $1,500/month support fee
- State/multi-state exclusive territory
- 4hr support response (24/7)
- 90/10 NFT badge revenue share
- Full white-label everything
- Sub-franchise rights
- Executive quarterly reviews

================================================================================
## CUSTODY TRANSFER PROCESS
================================================================================

When a subscriber wants to upgrade to franchise:

1. CREATE TRANSFER RECORD
   \`\`\`typescript
   POST /api/hallmark/custody-transfer
   {
     hallmarkId: 123,
     stripeCustomerId: "cus_xxx",
     transferType: "subscriber_to_franchise",
     franchiseFeeAgreed: "$10,000",
     royaltyTerms: { type: "percentage", percent: "4%", amount: null },
     toOwner: "customer@email.com"
   }
   \`\`\`

2. APPROVAL FLOW
   - Admin reviews and approves (sets approvedBy)
   - Customer accepts terms (sets customerAccepted, customerAcceptedAt)
   - Legal agreement signed (sets legalAgreementSigned, legalAgreementUrl)

3. EXECUTE TRANSFER
   - Clone hallmark data
   - Update customerHallmarks.ownershipMode to "franchise_owned"
   - Set custodyOwner to customer email
   - Set custodyTransferDate
   - Set previousOwner to "lotops"
   - Preserve all serial numbers and audit history
   - Update transfer status to "completed"

================================================================================
## REVENUE MODEL FOR LOT OPS PRO
================================================================================

### SUBSCRIBER REVENUE
| Stream              | Amount          |
|---------------------|-----------------|
| Monthly subscription| $15-25/driver   |
| NFT badge sales     | 100% retained   |
| Serial issuance     | Included        |

### FRANCHISE REVENUE
| Stream              | Amount          |
|---------------------|-----------------|
| Franchise fee       | $5K-$25K        |
| Transfer fee        | $2.5K-$5K       |
| Royalty             | 3-5% per vehicle|
| Monthly support     | $500-$1.5K      |
| NFT badge share     | 10-30%          |
| Serial issuance     | $0.01-0.05/each |

================================================================================
## KEY FILES & LOCATIONS
================================================================================

- Schema: shared/schema.ts (customerHallmarks, hallmarkCustodyTransfers)
- Storage: server/storage.ts (imports hallmarkCustodyTransfers table)
- Routes: server/routes.ts (API endpoints for hallmark operations)
- Franchise UI: client/src/pages/FranchiseOffer.tsx
- Hallmark Manager: client/src/pages/CustomerHallmarkManager.tsx
- Documentation: replit.md (Two-Tier Hallmark System section)

================================================================================
## API ENDPOINTS TO IMPLEMENT
================================================================================

\`\`\`typescript
// Create custody transfer request
POST /api/hallmark/custody-transfer

// Get transfer status
GET /api/hallmark/custody-transfer/:id

// Admin approve transfer
PATCH /api/hallmark/custody-transfer/:id/approve

// Customer accept terms
PATCH /api/hallmark/custody-transfer/:id/accept

// Execute transfer (internal, called after all approvals)
POST /api/hallmark/custody-transfer/:id/execute

// Get franchise pricing tiers
GET /api/franchise/tiers

// Request franchise (public form)
POST /api/franchise/request
\`\`\`

================================================================================
## MULTI-TENANT ISOLATION
================================================================================

All queries MUST filter by stripeCustomerId for data isolation:

\`\`\`typescript
// Example: Get customer's hallmark
const hallmark = await db
  .select()
  .from(customerHallmarks)
  .where(eq(customerHallmarks.stripeCustomerId, customerId))
  .limit(1);

// Check ownership mode
if (hallmark.ownershipMode === 'franchise_owned') {
  // Customer has full control
  // Allow custom formatting, exports, etc.
} else {
  // subscriber_managed
  // Restrict to read-only on certain operations
}
\`\`\`

================================================================================
## NFT BADGE REVENUE SPLIT
================================================================================

- Beta testers: FREE badges (minted on Solana Mainnet)
- Public users: $1.99 via Stripe checkout

For franchise owners, NFT badge revenue is split:
- Standard tier: 70% to franchise, 30% to Lot Ops
- Premium tier: 80% to franchise, 20% to Lot Ops
- Enterprise tier: 90% to franchise, 10% to Lot Ops

Tracking done via hallmarkId on each badge transaction.

================================================================================
## ENVIRONMENT VARIABLES
================================================================================

Required for this feature:
- DATABASE_URL - PostgreSQL (Neon)
- STRIPE_SECRET_KEY - Payment processing
- HELIUS_API_KEY - Solana RPC
- SOLANA_WALLET_SECRET_KEY - NFT minting wallet

================================================================================
## VERSION HISTORY
================================================================================

- v2.1.2 (Dec 5, 2025): Two-tier hallmark system, custody transfer, franchise page
- v2.1.1 (Dec 5, 2025): Stripe checkout for NFT badges, idempotency
- v2.1.0 (Dec 4, 2025): Solana Mainnet-only minting

================================================================================
END OF HANDOFF TEMPLATE
================================================================================
`.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(handoffTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-slate-400 hover:text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <FileCode className="w-3 h-3 mr-1" />
            Agent Handoff Template
          </Badge>
        </div>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">
                Two-Tier Hallmark System - Agent Handoff
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                One-click copy template for handing off implementation to another agent
              </CardDescription>
            </div>
            <Button
              onClick={handleCopy}
              className={`transition-all duration-300 ${
                copied 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
              data-testid="button-copy-template"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Template
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto text-sm text-slate-300 font-mono max-h-[70vh] overflow-y-auto">
                {handoffTemplate}
              </pre>
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                  data-testid="button-copy-inline"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <h4 className="font-semibold text-blue-300 mb-2">How to Use This Template</h4>
              <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                <li>Click the "Copy Template" button above</li>
                <li>Paste into a new agent conversation</li>
                <li>Agent will have full context for implementation</li>
                <li>Template includes schema, API endpoints, pricing, and business logic</li>
              </ol>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">2</div>
                <div className="text-sm text-slate-400">Ownership Modes</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">3</div>
                <div className="text-sm text-slate-400">Franchise Tiers</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">7</div>
                <div className="text-sm text-slate-400">Revenue Streams</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
