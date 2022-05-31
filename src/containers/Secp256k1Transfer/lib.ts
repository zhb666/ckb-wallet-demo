import {
  Indexer,
  helpers,
  Address,
  Script,
  RPC,
  hd,
  config,
  Cell,
  commons,
  core,
  WitnessArgs,
  toolkit,
  BI,
  CellCollector
} from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";

import { values } from "@ckb-lumos/base";
const { ScriptValue } = values;

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;
console.log(AGGRON4, "AGGRON4____");
console.log(LINA, "LINA");

const RPC_NETWORK = AGGRON4;

//  https://mainnet.ckb.dev
//  https://testnet.ckb.dev

const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";

const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
const rpc = new RPC(CKB_RPC_URL);
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  // Convert to public key
  const pubKey = hd.key.privateToPublic(privKey);
  console.log(pubKey, "pubKey___");
  const args = hd.key.publicKeyToBlake160(pubKey);
  console.log(args, "args___");

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  console.log(template, "template_____");
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args
  };
  // get address
  const address = helpers.generateAddress(lockScript, { config: RPC_NETWORK });
  console.log(address, "address____");
  return {
    lockScript,
    address,
    pubKey
  };
};

export async function capacityOf(address: string): Promise<BI> {
  // You need to check the RPC corresponding to the balance and transfer it to the corresponding aggron4 Lina
  const collector = indexer.collector({
    lock: helpers.parseAddress(address, { config: RPC_NETWORK })
  });

  console.log(collector, "collector___");

  // Convert to bi object
  let balance = BI.from(0);
  console.log(balance, "balance___");

  // Get balance
  for await (const cell of collector.collect()) {
    // balance++
    balance = balance.add(cell.cell_output.capacity);
    console.log(cell.cell_output.capacity, "cell.cell_output.capacity_____");
  }

  // sum
  return balance;
}

interface Options {
  from: string;
  to: string;
  amount: string;
  privKey: string;
}

// amount, from: fromAddr, to: toAddr, privKey
export async function transfer(options: Options): Promise<string> {
  let txSkeleton = helpers.TransactionSkeleton({ cellProvider: indexer });
  const fromScript = helpers.parseAddress(options.from, {
    config: RPC_NETWORK
  });
  const toScript = helpers.parseAddress(options.to, { config: RPC_NETWORK });
  console.log(txSkeleton, "txSkeleton____");
  console.log(fromScript, "fromScript___");
  console.log(toScript, "toScript___");

  // additional 0.001 ckb for tx fee
  // the tx fee could calculated by tx size
  // this is just a simple example

  // gas
  const neededCapacity = BI.from(options.amount).add(100000);
  console.log(neededCapacity, "neededCapacity_____");
  let collectedSum = BI.from(0);
  const collected: Cell[] = [];
  const collector = indexer.collector({ lock: fromScript, type: "empty" });
  for await (const cell of collector.collect()) {
    collectedSum = collectedSum.add(cell.cell_output.capacity);
    collected.push(cell);
    if (collectedSum >= neededCapacity) break;
  }

  if (collectedSum < neededCapacity) {
    throw new Error("Not enough CKB");
  }

  const transferOutput: Cell = {
    cell_output: {
      capacity: BI.from(options.amount).toHexString(),
      lock: toScript
    },
    data: "0x"
  };

  const changeOutput: Cell = {
    cell_output: {
      capacity: collectedSum.sub(neededCapacity).toHexString(),
      lock: fromScript
    },
    data: "0x"
  };

  txSkeleton = txSkeleton.update("inputs", inputs => inputs.push(...collected));
  txSkeleton = txSkeleton.update("outputs", outputs =>
    outputs.push(transferOutput, changeOutput)
  );
  // You also need to change the configuration here
  txSkeleton = txSkeleton.update("cellDeps", cellDeps =>
    cellDeps.push({
      out_point: {
        tx_hash: RPC_NETWORK.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
        index: RPC_NETWORK.SCRIPTS.SECP256K1_BLAKE160.INDEX
      },
      dep_type: RPC_NETWORK.SCRIPTS.SECP256K1_BLAKE160.DEP_TYPE
    })
  );

  const firstIndex = txSkeleton
    .get("inputs")
    .findIndex(input =>
      new ScriptValue(input.cell_output.lock, { validate: false }).equals(
        new ScriptValue(fromScript, { validate: false })
      )
    );
  if (firstIndex !== -1) {
    while (firstIndex >= txSkeleton.get("witnesses").size) {
      txSkeleton = txSkeleton.update("witnesses", witnesses =>
        witnesses.push("0x")
      );
    }
    let witness: string = txSkeleton.get("witnesses").get(firstIndex)!;
    const newWitnessArgs: WitnessArgs = {
      /* 65-byte zeros in hex */
      lock: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    };
    if (witness !== "0x") {
      const witnessArgs = new core.WitnessArgs(new toolkit.Reader(witness));
      const lock = witnessArgs.getLock();
      if (
        lock.hasValue() &&
        new toolkit.Reader(lock.value().raw()).serializeJson() !==
          newWitnessArgs.lock
      ) {
        throw new Error(
          "Lock field in first witness is set aside for signature!"
        );
      }
      const inputType = witnessArgs.getInputType();
      if (inputType.hasValue()) {
        newWitnessArgs.input_type = new toolkit.Reader(
          inputType.value().raw()
        ).serializeJson();
      }
      const outputType = witnessArgs.getOutputType();
      if (outputType.hasValue()) {
        newWitnessArgs.output_type = new toolkit.Reader(
          outputType.value().raw()
        ).serializeJson();
      }
    }
    witness = new toolkit.Reader(
      core.SerializeWitnessArgs(
        toolkit.normalizers.NormalizeWitnessArgs(newWitnessArgs)
      )
    ).serializeJson();
    txSkeleton = txSkeleton.update("witnesses", witnesses =>
      witnesses.set(firstIndex, witness)
    );
  }

  console.log(
    await commons.common.prepareSigningEntries(txSkeleton),
    "commons.common.prepareSigningEntries____"
  );

  // sign
  txSkeleton = await commons.common.prepareSigningEntries(txSkeleton);
  const message = txSkeleton.get("signingEntries").get(0)?.message;
  const Sig = hd.key.signRecoverable(message!, options.privKey);
  const tx = helpers.sealTransaction(txSkeleton, [Sig]);

  console.log(tx, "tx______");
  // return ""
  const hash = await rpc.send_transaction(tx, "passthrough");
  console.log("The transaction hash is", hash);

  return hash;
}
