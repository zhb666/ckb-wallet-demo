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
import CKB from "@nervosnetwork/ckb-sdk-core"

import { values } from "@ckb-lumos/base";
const { ScriptValue } = values;

// According to this, switch the main network and test network
export const { AGGRON4,LINA } = config.predefined;
console.log(AGGRON4,"AGGRON4____")
console.log(LINA, "LINA")

const RPC_NETWORK = AGGRON4



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
  console.log(pubKey,"pubKey___")
  const args = hd.key.publicKeyToBlake160(pubKey);
  console.log(args,"args___")

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  console.log(template,"template_____")
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args,
  };
  // get address
  const address = helpers.generateAddress(lockScript, { config: RPC_NETWORK });
  console.log(address,"address____")
  return {
    lockScript,
    address,
    pubKey,
  };
};

export async function capacityOf(address: string): Promise<BI> {
  // You need to check the RPC corresponding to the balance and transfer it to the corresponding aggron4 Lina
  const collector = indexer.collector({
    lock: helpers.parseAddress(address, { config: RPC_NETWORK }),
  });

  console.log(collector,"collector___")

  // Convert to bi object
  let balance = BI.from(0);
  console.log(balance,"balance___")

  // Get balance
  for await (const cell of collector.collect()) {
    // balance++
    balance = balance.add(cell.cell_output.capacity);
    console.log(cell.cell_output.capacity,"cell.cell_output.capacity_____")
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
export const transfer = async (options: Options) => {
  console.log(options,"options___")
  const privateKey = options.privKey // example private key

  const ckb = new CKB("https://testnet.ckb.dev") // instantiate the JS SDK with provided node url

  await ckb.loadDeps() // load the dependencies of secp256k1 algorithm which is used to verify the signature in transaction's witnesses.

  const publicKey = ckb.utils.privateKeyToPublicKey(privateKey)
  /**
   * to see the public key
   */
  // console.log(`Public key: ${publicKey}`)

  const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`
  /**
   * to see the public key hash
   */
  console.log(`Public key hash: ${publicKeyHash}`)

  const addresses = {
    mainnetAddress: ckb.utils.pubkeyToAddress(publicKey, {
      prefix: ckb.utils.AddressPrefix.Mainnet
    }),
    testnetAddress: ckb.utils.pubkeyToAddress(publicKey, {
      prefix: ckb.utils.AddressPrefix.Testnet
    })
  }

  console.log(ckb.config,"ckb.config______")

  /**
   * to see the addresses
   */
  // console.log(JSON.stringify(addresses, null, 2))

  // return


  if (!ckb.config.secp256k1Dep) return
  
  // hash
  // const fromScript = helpers.parseAddress(options.from, { config: RPC_NETWORK });

  const lock = {
    codeHash: ckb.config.secp256k1Dep.codeHash,
    hashType: ckb.config.secp256k1Dep.hashType,
    args: publicKeyHash
  }

  // const lock = {
  //   codeHash: fromScript.code_hash,
  //   hashType: fromScript.hash_type,
  //   args: fromScript.args
  // }

  console.log(lock,"lock_____")

  // console.log(lock,"lock_____")
  /**
   * load cells from lumos as `examples/sendTransactionWithLumosCollector.js` shows
   */
  const unspentCells = await ckb.loadCells({ indexer, CellCollector, lock })

  /**
   * to see the unspent cells
   */
  console.log(unspentCells,"unspentCells____")

  /**
   * send transaction
   */
  const toAddress = ckb.utils.privateKeyToAddress("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", {
    prefix: ckb.utils.AddressPrefix.Testnet
  })

  /**
   * @param fee - transaction fee, can be set in number directly, or use an reconciler to set by SDK
   *                               say, fee: BigInt(100000) means transaction fee is 100000 shannons
   *                                or, fee: { feeRate: '0x7d0', reconciler: ckb.utils.reconcilers.extraInputs } to set transaction fee by reconcilers.extraInputs with feeRate = 2000 shannons/Byte
   *
   * @external https://docs.nervos.org/docs/essays/faq#how-do-you-calculate-transaction-fee
   */
  const rawTransaction = await ckb.generateRawTransaction({
    fromAddress: options.from,
    toAddress:options.to,
    capacity: BigInt(options.amount),
    fee: BigInt(100000000),
    safeMode: true,
    cells: unspentCells,
    deps: ckb.config.secp256k1Dep,
  })

  console.log(rawTransaction,"rawTransaction____")


  const signedTx = ckb.signTransaction(privateKey)(rawTransaction)
  /**
   * to see the signed transaction
   */
  console.log(JSON.stringify(signedTx, null, 2))

  const realTxHash = await ckb.rpc.sendTransaction(signedTx)
  /**
   * to see the real transaction hash
   */
  console.log(`The real transaction hash is: ${realTxHash}`)
}

