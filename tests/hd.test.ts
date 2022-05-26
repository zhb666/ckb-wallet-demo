import { add } from "./hd";
const hd = require("../src/wallet/hd");
const { Test } = hd;
// import { Mnemonic } from "../src/wallet/hd";

test("two plus two is four", () => {
  expect(Test(2, 2)).toBe(4);
});

// test("测试字符串中是否包含 ll", async () => {
//   expect((await Mnemonic()).extendedPrivateKey).toMatch("0x");
// });
