export interface FinalDataObject {
  coinQuantity: any;
  timestamp: string;
  hash: string;
  type: string;
  blockHeight: number;
}

export interface TransactionObject {
  block_number: string;
  io_index: string;
  io_type: string;
  transaction: Transaction;
  tx_index: string;
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
