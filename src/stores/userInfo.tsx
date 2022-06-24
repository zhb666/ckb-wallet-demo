/*
 * @Author: zouxionglin
 * @Description: file content
 */
import { useState } from "react";
import { createModel } from "hox";
import { ScriptObject } from "../type"


function useCounter() {
  const [script, setScript] = useState<ScriptObject>({
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hash_type: "type",
    args: "0xf498b54dde9043354a2efe68c65ef8365f255a4a"
  });

  const userScript = (script: ScriptObject) => setScript(script);

  return {
    script,
    setScript
  };
}

export default createModel(useCounter);
