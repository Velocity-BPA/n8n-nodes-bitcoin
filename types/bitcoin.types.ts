/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Bitcoin Type Definitions
 * Comprehensive types for Bitcoin blockchain data structures
 */

// ============================================================================
// Network Types
// ============================================================================

export type BitcoinNetwork = 'mainnet' | 'testnet' | 'signet' | 'regtest';

// ============================================================================
// Address Types
// ============================================================================

export type AddressType =
  | 'p2pkh' // Legacy (1...)
  | 'p2sh' // Script Hash (3...)
  | 'p2wpkh' // Native SegWit (bc1q...)
  | 'p2wsh' // SegWit Script Hash (bc1q... longer)
  | 'p2tr' // Taproot (bc1p...)
  | 'unknown';

export interface AddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export interface AddressInfo {
  address: string;
  chain_stats: AddressStats;
  mempool_stats: AddressStats;
}

export interface AddressBalance {
  address: string;
  confirmed_satoshis: number;
  confirmed_btc: number;
  unconfirmed_satoshis: number;
  unconfirmed_btc: number;
  total_satoshis: number;
  total_btc: number;
}

// ============================================================================
// UTXO Types
// ============================================================================

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface UTXOInfo {
  txid: string;
  vout: number;
  value_satoshis: number;
  value_btc: number;
  confirmed: boolean;
  block_height: number | null;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface TransactionInput {
  txid: string;
  vout: number;
  prevout?: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm?: string;
  witness?: string[];
  is_coinbase: boolean;
  sequence: number;
}

export interface TransactionOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

export interface TransactionStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: TransactionInput[];
  vout: TransactionOutput[];
  size: number;
  weight: number;
  fee: number;
  status: TransactionStatus;
}

// ============================================================================
// Block Types
// ============================================================================

export interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

export interface BlockInfo {
  height: number;
  hash: string;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  difficulty: number;
  merkle_root: string;
  previous_block_hash: string;
  nonce?: number;
  bits?: number;
  version?: number;
}

// ============================================================================
// Mempool Types
// ============================================================================

export interface MempoolInfo {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: Array<[number, number]>;
}

// ============================================================================
// Fee Types
// ============================================================================

export interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface FeeInfo {
  fastest_fee: number;
  half_hour_fee: number;
  hour_fee: number;
  economy_fee: number;
  minimum_fee: number;
  unit: string;
}

// ============================================================================
// Event Types (for Triggers)
// ============================================================================

export interface NewBlockEvent {
  event: 'newBlock';
  height: number;
  hash: string;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  difficulty: number;
}

export interface AddressTransactionEvent {
  event: 'addressTransaction';
  address: string;
  txid: string;
  confirmed: boolean;
  blockHeight: number | null;
  blockTime: number | null;
  fee: number;
}

export interface TransactionConfirmedEvent {
  event: 'transactionConfirmed';
  txid: string;
  confirmations: number;
  blockHash: string;
  blockHeight: number;
}

export interface FeeRateChangeEvent {
  event: 'feeRateChange';
  feeType: string;
  previousFee: number;
  currentFee: number;
  changePercent: number;
  direction: 'increased' | 'decreased';
  allFees: RecommendedFees;
}

export type BitcoinEvent =
  | NewBlockEvent
  | AddressTransactionEvent
  | TransactionConfirmedEvent
  | FeeRateChangeEvent;

// ============================================================================
// Credential Types
// ============================================================================

export interface BitcoinApiCredentials {
  network: BitcoinNetwork;
  apiProvider: 'mempool' | 'customMempool';
  customApiUrl?: string;
}
