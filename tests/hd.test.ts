import { add } from "./hd";
// const hd = require("../src/wallet/hd");
// const { Test } = hd;
import { Mnemonic } from "../src/wallet/hd";

test("test extendedPrivateKey.privateKey", async () => {
  expect((await Mnemonic()).extendedPrivateKey.chainCode).toMatch("0x");
});

test("test extendedPrivateKey.chainCode", async () => {
  expect((await Mnemonic()).extendedPrivateKey.privateKey).toMatch("0x");
});
