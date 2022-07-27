export interface FinalDataObject {
  amount: any;
  timestamp: string;
  hash: string;
  type: string;
  state: string;
  blockHeight: number | string;
}
export interface TransactionObject {
  block_number: string;
  io_index: string;
  io_type: string;
  transaction: Transaction;
  tx_index: string;
}

export interface ScriptObject {
  code_hash: string;
  hash_type: string;
  args: string;
}

interface Transaction {
  cell_deps: Celldep[];
  hash: string;
  header_deps: any[];
  inputs: Input[];
  outputs: Output[];
  outputs_data: string[];
  version: string;
  witnesses: string[];
}

interface Output {
  capacity: string;
  lock: Lock;
  type?: any;
}

interface Lock {
  args: string;
  code_hash: string;
  hash_type: string;
}

interface Input {
  previous_output: Outpoint;
  since: string;
}

interface Celldep {
  dep_type: string;
  out_point: Outpoint;
}

interface Outpoint {
  index: string;
  tx_hash: string;
}

export interface WalletListObject {
  m: string;
  privateKey: string;
  privateKeyAgs: PrivateKeyAgs;
  type: string;
}

interface PrivateKeyAgs {
  lockScript: LockScript;
  address: string;
  pubKey: string;
}

interface LockScript {
  code_hash: string;
  hash_type: string;
  args: string;
}

export interface DaoDataObject {
  amount: any;
  timestamp?: string;
  compensation: bigint;
  remainingCycleMinutes: number;
  remainingEpochs: number;
  txHash: string;
  type: string;
  state?: string;
  unlockable: boolean;
}

export interface DAOUnlockableAmount {
  state?: string;
  timestamp?: string;
  type: "deposit" | "withdraw";
  amount: bigint;
  compensation: bigint;
  unlockable: boolean;
  remainingCycleMinutes: number;
  remainingEpochs: number;
  txHash: string;
}

export enum FeeRate {
  SLOW = 1000,
  NORMAL = 100000,
  FAST = 10000000
}
