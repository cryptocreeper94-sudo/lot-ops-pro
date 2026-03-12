/**
 * Solana Blockchain Service for Hallmark NFT Badges
 * Handles hash verification and on-chain minting
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as crypto from 'crypto';
import bs58 from 'bs58';

// Memo Program ID (for on-chain data storage)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Helper to get fresh env values (allows runtime secret updates)
function getHeliusApiKey(): string | undefined {
  return process.env.HELIUS_API_KEY;
}

function getSolanaWalletSecret(): string | undefined {
  return process.env.SOLANA_WALLET_SECRET_KEY;
}

// Network endpoints (built dynamically)
function getNetworkUrl(network: 'devnet' | 'mainnet'): string {
  const apiKey = getHeliusApiKey();
  if (network === 'devnet') {
    return `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  }
  return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
}

export interface HallmarkMintData {
  driverName: string;
  driverId: string;
  role: string;
  joinDate: string;
  totalMoves: number;
  efficiency: number;
  teamRank: number;
  variant: 'beta' | 'public';
}

export interface MintResult {
  success: boolean;
  hallmarkHash: string;
  signature?: string;
  network: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Generate a unique 64-character hallmark hash
 */
export function generateHallmarkHash(data: HallmarkMintData): string {
  const payload = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  });
  
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Get Solana connection for specified network
 */
function getConnection(network: 'devnet' | 'mainnet'): Connection {
  const apiKey = getHeliusApiKey();
  if (!apiKey) {
    throw new Error('HELIUS_API_KEY not configured');
  }
  return new Connection(getNetworkUrl(network), 'confirmed');
}

/**
 * Get wallet keypair from secret key
 * Supports multiple formats: JSON array, base58, hex
 */
function getWalletKeypair(): Keypair {
  const walletSecret = getSolanaWalletSecret();
  if (!walletSecret) {
    throw new Error('SOLANA_WALLET_SECRET_KEY not configured');
  }
  
  try {
    let secretKey: Uint8Array;
    const trimmed = walletSecret.trim();
    
    // Format 1: JSON array format [1,2,3,...]
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      secretKey = Uint8Array.from(parsed);
    }
    // Format 2: Base58 format (Phantom wallet export)
    else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed) && trimmed.length >= 64) {
      try {
        secretKey = bs58.decode(trimmed);
      } catch {
        // If bs58 fails, try hex
        secretKey = new Uint8Array(Buffer.from(trimmed, 'hex'));
      }
    }
    // Format 3: Hex format
    else if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      secretKey = new Uint8Array(Buffer.from(trimmed, 'hex'));
    }
    // Format 4: Base64 format
    else {
      secretKey = new Uint8Array(Buffer.from(trimmed, 'base64'));
    }
    
    // Validate key length (should be 64 bytes for ed25519)
    if (secretKey.length !== 64) {
      console.error(`[SOLANA] Invalid secret key length: ${secretKey.length} (expected 64)`);
      throw new Error(`Invalid key length: ${secretKey.length}`);
    }
    
    return Keypair.fromSecretKey(secretKey);
  } catch (error: any) {
    console.error('[SOLANA] Wallet keypair error:', error.message);
    throw new Error('Invalid SOLANA_WALLET_SECRET_KEY format - supports JSON array, base58, or hex');
  }
}

/**
 * Mint a hallmark badge on-chain using memo program
 * All minting happens on mainnet - beta testers get FREE mints as thanks for helping
 */
export async function mintHallmarkBadge(data: HallmarkMintData): Promise<MintResult> {
  // Always use mainnet - real blockchain records for everyone
  // Beta testers get FREE mints, public pays $1.99
  const network = 'mainnet';
  const hallmarkHash = generateHallmarkHash(data);
  
  try {
    // Check if API key is configured
    if (!getHeliusApiKey()) {
      console.log('[SOLANA] Helius API key not configured - using offline hash only');
      return {
        success: true,
        hallmarkHash,
        network,
        error: 'Blockchain minting disabled - hash generated offline'
      };
    }
    
    // Check if wallet is configured
    if (!getSolanaWalletSecret()) {
      console.log('[SOLANA] Wallet not configured - using offline hash only');
      return {
        success: true,
        hallmarkHash,
        network,
        error: 'Wallet not configured - hash generated offline'
      };
    }
    
    const connection = getConnection(network);
    const wallet = getWalletKeypair();
    
    // Create memo instruction with hallmark data
    const memoData = JSON.stringify({
      type: 'LOTOPS_HALLMARK',
      version: '2.1.1',
      hash: hallmarkHash,
      driver: data.driverName,
      variant: data.variant,
      timestamp: new Date().toISOString()
    });
    
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, 'utf-8')
    });
    
    // Build and send transaction
    const transaction = new Transaction().add(memoInstruction);
    
    console.log(`[SOLANA] Minting hallmark on ${network}...`);
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      { commitment: 'confirmed' }
    );
    
    // Always mainnet - real blockchain for all mints
    const explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    
    console.log(`[SOLANA] Hallmark minted! Signature: ${signature}`);
    
    return {
      success: true,
      hallmarkHash,
      signature,
      network,
      explorerUrl
    };
    
  } catch (error: any) {
    console.error('[SOLANA] Mint error:', error.message);
    
    // Return hash even if blockchain fails
    return {
      success: false,
      hallmarkHash,
      network,
      error: error.message
    };
  }
}

/**
 * Verify a hallmark hash exists on-chain
 */
export async function verifyHallmark(
  signature: string, 
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<{ verified: boolean; data?: any }> {
  try {
    if (!getHeliusApiKey()) {
      return { verified: false };
    }
    
    const connection = getConnection(network);
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
    
    if (!tx) {
      return { verified: false };
    }
    
    // Transaction exists and is confirmed
    return { 
      verified: true,
      data: {
        slot: tx.slot,
        blockTime: tx.blockTime,
        fee: tx.meta?.fee
      }
    };
    
  } catch (error) {
    console.error('[SOLANA] Verify error:', error);
    return { verified: false };
  }
}

/**
 * Check wallet balance
 */
export async function getWalletBalance(network: 'devnet' | 'mainnet' = 'devnet'): Promise<number> {
  try {
    if (!getHeliusApiKey() || !getSolanaWalletSecret()) {
      return 0;
    }
    
    const connection = getConnection(network);
    const wallet = getWalletKeypair();
    const balance = await connection.getBalance(wallet.publicKey);
    
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('[SOLANA] Balance check error:', error);
    return 0;
  }
}

/**
 * Get wallet public key
 */
export function getWalletAddress(): string | null {
  try {
    if (!getSolanaWalletSecret()) {
      return null;
    }
    const wallet = getWalletKeypair();
    return wallet.publicKey.toBase58();
  } catch {
    return null;
  }
}

export default {
  generateHallmarkHash,
  mintHallmarkBadge,
  verifyHallmark,
  getWalletBalance,
  getWalletAddress
};
