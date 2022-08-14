import { Cell } from "@ckb-lumos/base";
import { request } from "../service/index";
import { IndexerTransaction, Terminator } from "../service/type";
import { CKB_RPC_URL } from "../config";

const ckbLightClientRPC = CKB_RPC_URL;

const DefaultTerminator: Terminator = () => {
  return { stop: false, push: true };
};

const script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: "0x2760d76d61cafcfc1a83d9d3d6b70c36fa9d4b1a"
};

interface ScriptObject {
  code_hash: string;
  hash_type: string;
  args: string;
}

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

/**
 * @description: get_cells
 */
export async function get_cells(script?: ScriptObject) {
  const infos: Cell[] = [];
  let cursor: string | undefined;
  const res = await request(2, ckbLightClientRPC, "get_cells", [
    {
      script,
      script_type: "lock"
    },
    "asc",
    "0x640"
  ]);

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
  return res;
}

/**
 * @description: get_transaction
 */
export async function get_transaction(hash: string) {
  const res = await request(1, ckbLightClientRPC, "get_transaction", [hash]);
  return res;
}

/**
 * @description: get_header
 */
export async function get_header(hash: string) {
  const res = await request(1, ckbLightClientRPC, "get_header", [hash]);
  return res;
}

/**
 * @description: get_peers
 */
export async function get_peers() {
  const res = await request(1, ckbLightClientRPC, "get_peers", []);
  return res;
}

/**
 * @description: send_transaction
 */
export async function send_transaction(tx: any) {
  const res = await request(1, ckbLightClientRPC, "send_transaction", [tx]);
  return res;
}
