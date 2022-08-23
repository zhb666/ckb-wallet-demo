import { helpers, Address, Script, hd } from "@ckb-lumos/lumos";
import {
  mnemonic,
  ExtendedPrivateKey
  // Keystore,
  // XPubStore
} from "@ckb-lumos/hd";
import { RPC_NETWORK } from "../../config";

// Mnemonic
export async function Mnemonic() {
  const m = await mnemonic.generateMnemonic();
  const seed = mnemonic.mnemonicToSeedSync(m);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  return {
    m,
    extendedPrivateKey
  };
}

// PrivateKey args
export async function getPrivateKeyAgs(m: string, type: number) {
  let privateKeyAgs, extendedPrivateKey;
  // import PrivateKey
  if (type !== 3) {
    const seed = mnemonic.mnemonicToSeedSync(m);
    extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);

    privateKeyAgs = generateAccountFromPrivateKey(
      extendedPrivateKey.privateKey
    );
  } else {
    privateKeyAgs = generateAccountFromPrivateKey(m);
  }

  return {
    m: type !== 3 ? m : "import privateKey",
    // @ts-ignore
    privateKey: type !== 3 ? extendedPrivateKey.privateKey : m,
    privateKeyAgs,
    type: type == 1 ? "create" : "import"
  };
}

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};

export const generateAccountFromPrivateKey = (privKey: string): Account => {
  // Convert to public key
  const pubKey = hd.key.privateToPublic(privKey);
  const args = hd.key.publicKeyToBlake160(pubKey);

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args
  };
  // get address
  const address = helpers.encodeToAddress(lockScript, { config: RPC_NETWORK });
  return {
    lockScript,
    address,
    pubKey
  };
};
