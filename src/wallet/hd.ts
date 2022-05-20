import {
  mnemonic,
  ExtendedPrivateKey,
  Keystore,
  XPubStore
} from "@ckb-lumos/hd";
import CKB from "@nervosnetwork/ckb-sdk-core";

const nodeUrl = "https://testnet.ckb.dev/rpc";

const ckb = new CKB(nodeUrl);

// 生成助记词;
export async function Mnemonic() {
  const m = await mnemonic.generateMnemonic();
  console.log(m, "m====");

  const seed = mnemonic.mnemonicToSeedSync(m);
  console.log(seed, "seed====");

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log(extendedPrivateKey, "extendedPrivateKey====");

  // const keystore = Keystore.create(extendedPrivateKey, "123456");
  // console.log(keystore, "keystore====");

  return {
    m,
    extendedPrivateKey
  };
}

export function Test() {
  return 2;
}

// Mnemonic();

const address = ckb.utils.pubkeyToAddress(
  "0x4b63e58669d29857d6c5c22d1e74518a0c43b4673882936b9fc684cf8f00a05a",
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

console.log(address, "address____");
