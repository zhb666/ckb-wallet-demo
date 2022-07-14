import { Cell } from "@ckb-lumos/base";
import { request, requestBatch } from "../service/index";
import {
  GetLiveCellsResult,
  IndexerTransaction,
  SearchKey,
  SearchKeyFilter,
  Terminator
} from "../service/type";

const ckbLightClientRPC = "http://localhost:9000/";
const ckbIndexer = "http://localhost:8116/";

const DefaultTerminator: Terminator = () => {
  return { stop: false, push: true };
};

// const a = [
//   {
//     script: {
//       code_hash:
//         "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//       hash_type: "type",
//       args: "0x58700e3b7fb4e4a24dc39e871920471dee5d3477"
//     },
//     script_type: "lock"
//   }
// ];
// 0xf498b54dde9043354a2efe68c65ef8365f255a4a
const script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: "0x7c227c9bd36082f3cc36f4aca95192c582b5e5fa"
};

interface ScriptObject {
  code_hash: string;
  hash_type: string;
  args: string;
}

const set_scripts_params = [
  [
    {
      script,
      block_number: "0x0"
    }
  ]
];

/**
 * @description: set_scripts
 * @param {script{code_hash,hash_type,args}}
 * @return {any}
 */

export async function setScripts(script: ScriptObject, block_number: string) {
  const res = await request(1, ckbLightClientRPC, "set_scripts", [
    [
      {
        script,
        block_number
      }
    ]
  ]);
  return res;
}

/**
 * @description: get_tip_header
 * @param {[]}
 * @return {header}
 */
export async function getTipHeader() {
  const res = await request(1, ckbLightClientRPC, "get_tip_header", []);
  return res;
}

/**
 * @description: get_scripts
 * @param {[]}
 * @return {any}
 */
export async function getScripts() {
  const res = await request(1, ckbLightClientRPC, "get_scripts", []);
  return res;
}

const get_cells_params = [
  {
    script,
    script_type: "lock"
  },
  "asc",
  "0x64"
];

/**
 * @description: get_cells
 */
export async function get_cells() {
  const infos: Cell[] = [];
  let cursor: string | undefined;
  const res = await request(
    2,
    ckbLightClientRPC,
    "get_cells",
    get_cells_params
  );
  console.log(res, "get_cells");

  // 处理数据
  while (true) {
    const liveCells = res.objects;
    cursor = res.last_cursor;
    const index = 0;
    const sizeLimit = 100;
    for (const liveCell of liveCells) {
      const cell: Cell = {
        cell_output: liveCell.output,
        data: liveCell.output_data,
        out_point: liveCell.out_point,
        block_number: liveCell.block_number
      };
      const { stop, push } = DefaultTerminator(index, cell);
      if (push) {
        infos.push(cell);
      }
      if (stop) {
        return {
          objects: infos,
          lastCursor: cursor
        };
      }
    }
    if (liveCells.length <= sizeLimit) {
      break;
    }
  }

  return {
    objects: infos,
    lastCursor: cursor
  };
  //   return res;
}

/**
 * @description: get_transactions
 */
export async function get_transactions(
  script: ScriptObject,
  lastCursor?: string
) {
  let infos: IndexerTransaction[] = [];
  let cursor: string | undefined;
  const sizeLimit = 500;
  const order = "desc"; //desc ｜ asc
  // 0x1e0 480
  const get_transactions_params: any = [
    {
      script,
      script_type: "lock",
      filter: script
      // group_by_transaction: true
    },
    order,
    "0x1e0"
  ];
  if (lastCursor) {
    get_transactions_params.push({ after_cursor: lastCursor });
  }

  const res = await request(
    2,
    ckbLightClientRPC,
    "get_transactions",
    get_transactions_params
  );
  while (true) {
    const txs = res.objects;
    cursor = res.last_cursor as string;
    infos = infos.concat(txs);
    if (txs.length <= sizeLimit) {
      break;
    }
  }
  return {
    objects: infos,
    lastCursor: cursor
  };
}

const get_cells_capacity_params = [
  {
    script,
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

const get_transaction_params = [
  {
    script,
    script_type: "lock"
  }
];

/**
 * @description: get_transaction
 */
export async function get_transaction(hash: string) {
  const res = await request(1, ckbLightClientRPC, "get_transaction", [hash]);
  return res;
}

/**
 * @description: get_peers
 */
export async function get_peers() {
  const res = await request(1, ckbLightClientRPC, "get_peers", []);
  return res;
}
