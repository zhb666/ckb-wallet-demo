import { transfer } from "../src/containers/Transfer-demo2/lib";

const options = {
  from: "ckt1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fys07ens3",
  to: "ckt1qyq9suqw8dlmfe9zfhpeapceypr3mmjax3msymwkae",
  privKey: "0x1234567812345678123456781234567812345678123456781234567812345678",
  amount: "8800000000"
};

test("test transfer", async () => {
  //   expect(await transfer(options)).toBeTruthy();
  //   jest.setTimeout(10 * 1000);
  expect(await transfer(options)).toMatch("0x");
});
