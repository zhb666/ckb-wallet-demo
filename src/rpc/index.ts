import { request, requestBatch } from "../service/index";
import { GetLiveCellsResult } from "../service/type";

const ckbLightClientRPC = "http://localhost:9000/";
const ckbIndexer = "http://localhost:8116/";

const set_scripts_params = [
  [
    {
      script: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
      },
      block_number: "0x0"
    }
  ]
];

/**
 * @description: set_scripts
 * @param {script{code_hash,hash_type,args}}
 * @return {any}
 */

export async function setScripts() {
  const res = await request(
    1,
    ckbLightClientRPC,
    "set_scripts",
    set_scripts_params
  );
  console.log(res, "set_scripts");
  return res;
}

/**
 * @description: get_scripts
 * @param {[]}
 * @return {any}
 */
export async function getScripts() {
  const res = await request(1, ckbLightClientRPC, "get_scripts", []);
  console.log(res, "get_scripts");
  return res;
}

const get_cells_params = [
  {
    script: {
      code_hash:
        "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      hash_type: "type",
      args: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
    },
    script_type: "lock"
  },
  "asc",
  "0x64"
];

/**
 * @description: get_cells
 */
export async function get_cells() {
  const res = await request(
    2,
    ckbLightClientRPC,
    "get_cells",
    get_cells_params
  );
  console.log(res, "get_cells");
  return res;
}

const get_transactions_params = [
  {
    script: {
      code_hash:
        "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      hash_type: "type",
      args: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
    },
    script_type: "lock"
  },
  "asc",
  "0x64"
];

/**
 * @description: get_transactions
 */
export async function get_transactions() {
  const res = await request(
    2,
    ckbLightClientRPC,
    "get_transactions",
    get_transactions_params
  );
  console.log(res, "get_transactions");
  return res;
}

const get_cells_capacity_params = [
  {
    script: {
      code_hash:
        "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      hash_type: "type",
      args: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
    },
    script_type: "lock"
  }
];

/**
 * @description: get_cells_capacity
 */
export async function get_cells_capacity() {
  const res = await request(
    2,
    ckbLightClientRPC,
    "get_cells_capacity",
    get_cells_capacity_params
  );
  console.log(res, "get_cells_capacity");
  return res;
}
