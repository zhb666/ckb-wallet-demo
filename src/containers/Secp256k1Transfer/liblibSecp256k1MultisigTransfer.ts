import {
  Indexer,
  helpers,
  Script,
  RPC,
  hd,
  config,
  Cell,
  commons,
  core,
  WitnessArgs,
  toolkit,
  BI
} from "@ckb-lumos/lumos";
import { values } from "@ckb-lumos/base";
import {
  parseFromInfo,
  MultisigScript
} from "@ckb-lumos/common-scripts/lib/from_info";
import { BIish } from "@ckb-lumos/bi";

const { ScriptValue } = values;

const { AGGRON4 } = config.predefined;

const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
const rpc = new RPC(CKB_RPC_URL);
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

const ALICE = {
  PRIVATE_KEY:
    "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40",
  ARGS: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
};

const BOB = {
  PRIVATE_KEY:
    "0x3bc65932a75f76c5b6a04660e4d0b85c2d9b5114efa78e6e5cf7ad0588ca09c8",
  ARGS: "0x99dbe610c43186696e1f88cb7b59252d4c92afda"
};

const CHARLES = {
  PRIVATE_KEY:
    "0xbe06025fbd8c74f65a513a28e62ac56f3227fcb307307a0f2a0ef34d4a66e81f",
  ARGS: "0xc055df68fdd47c6a5965b9ab21cd6825d8696a76"
};

const TO_ADDRESS = "ckt1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fys07ens3";

/**
 * Generate fromInfo for multisig transfer.
 * @param R The provided signatures must match at least the first R items of the Pubkey list.
 * @param M M of N signatures must be provided to unlock the cell. N equals to the size of publicKeyHashes.
 * @param publicKeyHashes The list of Lock Args generated by the blake160 function that extracts
 * the first 20 bytes of a public key hash.
 *
 * R, M are single byte unsigned integers that ranges from 0 to 255.
 * R must no more than M.
 */
function generateMofNMultisigInfo(
  R: number,
  M: number,
  publicKeyHashes: string[]
): MultisigScript {
  return {
    R,
    M,
    publicKeyHashes
  };
}

type Account = {
  fromScript: Script;
  multisigScript: string | undefined;
};

function generateAccountFromMultisigInfo(fromInfo: MultisigScript): Account {
  const { fromScript, multisigScript } = parseFromInfo(fromInfo, {
    config: AGGRON4
  });
  return {
    fromScript,
    multisigScript
  };
}

interface Options {
  fromInfo: MultisigScript;
  toAddress: string;
  amount: string;
  privKeys: string[];
}

export async function transfer(options: Options): Promise<string> {
  let txSkeleton = helpers.TransactionSkeleton({});

  const { fromScript, multisigScript } = generateAccountFromMultisigInfo(
    options.fromInfo
  );
  // const fromScript = helpers.parseAddress(options.from, {
  //   config: AGGRON4
  // });
  const toScript = helpers.parseAddress(options.toAddress, { config: AGGRON4 });

  // additional 0.001 ckb for tx fee
  // the tx fee could calculated by tx size
  // this is just a simple example
  const neededCapacity = BI.from(options.amount).add(100000);
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
  txSkeleton = txSkeleton.update("cellDeps", cellDeps =>
    cellDeps.push({
      out_point: {
        tx_hash: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.TX_HASH,
        index: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.INDEX
      },
      dep_type: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.DEP_TYPE
    })
  );

  const firstIndex = txSkeleton.get("inputs").findIndex(input =>
    // @ts-ignore
    new ScriptValue(input.cell_output.lock, { validate: false }).equals(
      // @ts-ignore
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
    let newWitnessArgs: WitnessArgs;
    const SECP_SIGNATURE_PLACEHOLDER =
      "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    newWitnessArgs = {
      lock:
        "0x" +
        multisigScript!.slice(2) +
        SECP_SIGNATURE_PLACEHOLDER.slice(2).repeat(options.fromInfo.M)
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

  txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
  const message = txSkeleton.get("signingEntries").get(0)?.message;

  let pubkeyHashN: string = "";
  options.fromInfo.publicKeyHashes.forEach(publicKeyHash => {
    pubkeyHashN += publicKeyHash.slice(2);
  });

  let sigs: string = "";
  options.privKeys.forEach(privKey => {
    if (privKey !== "") {
      let sig = hd.key.signRecoverable(message!, privKey);
      sig = sig.slice(2);
      sigs += sig;
    }
  });

  sigs =
    "0x00" +
    ("00" + options.fromInfo.R.toString(16)).slice(-2) +
    ("00" + options.fromInfo.M.toString(16)).slice(-2) +
    ("00" + options.fromInfo.publicKeyHashes.length.toString(16)).slice(-2) +
    pubkeyHashN +
    sigs;

  const tx = helpers.sealTransaction(txSkeleton, [sigs]);
  const hash = await rpc.send_transaction(tx, "passthrough");
  console.log("The transaction hash is", hash);

  return hash;
}

// Multisig transfer example
export default function main() {
  const fromInfo = generateMofNMultisigInfo(2, 2, [
    ALICE.ARGS,
    BOB.ARGS,
    CHARLES.ARGS
  ]);
  const privKeys = [ALICE.PRIVATE_KEY, BOB.PRIVATE_KEY];
  transfer({
    fromInfo,
    toAddress: TO_ADDRESS,
    amount: "1180000000000",
    privKeys
  });
}

// main();
