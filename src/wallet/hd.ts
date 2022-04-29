// import PWCore, {
//   Address,
//   AddressType,
//   ChainID,
//   HashType,
//   Script
// } from "@lay2/pw-core";

// import {
//   AddressPrefix,
//   AddressType as Type,
//   pubkeyToAddress
// } from "@nervosnetwork/ckb-sdk-utils";

import {
  mnemonic,
  ExtendedPrivateKey,
  Keystore,
  XPubStore
} from "@ckb-lumos/hd";
import CKB from "@nervosnetwork/ckb-sdk-core";

//  节点配置
const nodeUrl = "https://testnet.ckb.dev/rpc";

// 连接节点
const ckb = new CKB(nodeUrl);


// export const publicKeyToAddress = (
//   publicKey = "0x31ea8544d35b5cd20173f1f0979a8ac46a26a954d0d8cabeebb968b1d13c6ea3",
//   prefix = AddressPrefix.Testnet
// ) => {
//   const pubkey = publicKey.startsWith("0x") ? publicKey : `0x${publicKey}`;
//   console.log(
//     pubkeyToAddress(pubkey, {
//       prefix,
//       type: Type.HashIdx,
//       codeHashOrCodeHashIndex: "0x00"
//     })
//   );
// };
// publicKeyToAddress();
// const a = publicKeyToAddress();
// console.log(a(), "aaaa____");

// 生成助记词;
export async function Mnemonic() {
  const m = await mnemonic.generateMnemonic();
  console.log(m, "m====");

  // 生成二机制
  const seed = mnemonic.mnemonicToSeedSync(m);
  console.log(seed, "seed====");

  // 生成私钥和衍生私钥
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log(extendedPrivateKey, "extendedPrivateKey====");

  // 保存Keystore到本地,需要配合node
  // const keystore = Keystore.create(extendedPrivateKey, "123456");
  // console.log(keystore, "keystore====");

  return {
    m,
    extendedPrivateKey
  }

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

