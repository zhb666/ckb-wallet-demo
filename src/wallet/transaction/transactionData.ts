import { get_transaction } from "../../rpc";
import { FinalDataObject, TransactionObject } from "../../type";
import { formatDate } from "../../utils";

async function transactionData(filterRes: any) {
  // Result data
  const finalData: FinalDataObject[] = [];
  for (let tabs of filterRes) {
    // output
    let outputs = tabs.filter(
      (item: { io_type: string }) => item.io_type != "input"
    );
    // input
    let inputs = tabs.filter(
      (item: { io_type: string }) => item.io_type != "output"
    );
    // income
    if (inputs.length == 0) {
      const res = await incomeFun(outputs);
      finalData.push(res);
    }
    // transfer accounts
    else {
      const res = await transferFun(inputs, outputs);
      finalData.push(res);
    }
  }

  return finalData;
}

// income related
const incomeFun = async (output: TransactionObject[]) => {
  const obj: FinalDataObject = {
    timestamp: "",
    amount: 0,
    hash: "",
    type: "",
    blockHeight: 0,
    state: ""
  };
  const res = await get_transaction(output[0].transaction.hash);
  obj.timestamp = formatDate(parseInt(res.header.timestamp));
  obj.hash = res.transaction.hash;
  obj.type = "add";
  obj.state = "success";
  obj.blockHeight = parseInt(res.header.number);
  // obj.money = (await getCapacity(res.transaction.outputs[0].capacity)).toString()
  obj.amount = "+" + parseInt(res.transaction.outputs[0].capacity) / 100000000;
  return obj;
};

// Transfer related
const transferFun = async (
  inputs: TransactionObject[],
  output: TransactionObject[]
) => {
  const obj: FinalDataObject = {
    timestamp: "",
    amount: 0,
    hash: "",
    type: "",
    blockHeight: 0,
    state: ""
  };

  // Make a separate request and get the header information
  const res = await get_transaction(inputs[0].transaction.hash);
  obj.timestamp = formatDate(parseInt(res.header.timestamp));
  obj.hash = res.transaction.hash;
  obj.type = "subtract";
  obj.state = "success";
  obj.blockHeight = parseInt(res.header.number);

  // previous_output
  for (let i = 0; i < inputs.length; i++) {
    let since = parseInt(inputs[i].transaction.inputs[i].previous_output.index);
    const res = await get_transaction(
      inputs[i].transaction.inputs[i].previous_output.tx_hash
    );

    obj.amount += parseInt(res.transaction.outputs[since].capacity);
  }
  obj.amount =
    "-" +
    (obj.amount -
      parseInt(
        output[0].transaction.outputs[parseInt(output[0].io_index)].capacity
      )) /
      100000000;
  return obj;
};

export { transactionData };