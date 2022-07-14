import {
  mnemonic,
  ExtendedPrivateKey,
  Keystore,
  XPubStore
} from "@ckb-lumos/hd";
import { generateAccountFromPrivateKey } from "../containers/Transfer-demo2/lib";
import CKB from "@nervosnetwork/ckb-sdk-core";

const nodeUrl = "https://testnet.ckb.dev/rpc";

const ckb = new CKB(nodeUrl);

// Mnemonic
export async function Mnemonic() {
  const m = await mnemonic.generateMnemonic();
  const seed = mnemonic.mnemonicToSeedSync(m);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  // const keystore = Keystore.create(extendedPrivateKey, "123456");
  // console.log(keystore, "keystore====");
  return {
    m,
    extendedPrivateKey
  };
}

// PrivateKey ags
export async function getPrivateKeyAgs(m: string, type: boolean) {
  const seed = mnemonic.mnemonicToSeedSync(m);

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log(extendedPrivateKey, "extendedPrivateKey====");

  const privateKeyAgs = generateAccountFromPrivateKey(
    extendedPrivateKey.privateKey
  );

  return {
    m,
    privateKey: extendedPrivateKey.privateKey,
    privateKeyAgs,
    type: type ? "create" : "import"
  };
}

const address = ckb.utils.pubkeyToAddress(
  "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40",
  {
    prefix: ckb.utils.AddressPrefix.Testnet,
    type: ckb.utils.AddressType.HashIdx,
    codeHashOrCodeHashIndex: "0x00"
  }
);

// // BIP 44  m/44'/309'/0'
// const newAddress = new Address(
//   "ckt1qyqgt6utu8sgd33mm70au28j06cx69yu3ztsrvay9x",
//   `m/44'/309'/0'/0/0`
// );
