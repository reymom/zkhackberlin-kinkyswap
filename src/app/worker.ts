import { initThreadPool } from "@provablehq/sdk";

/**********************************************************************
 * Kinky Swap — Aleo escrow helper
 *
 * Builds **input arrays** for the four transitions in
 * `kinky_swap_escrow_v0.aleo`.
 *
 * parent-thread -> worker
 * ---------------------------------------------
 * { type:"escrowPublic",   secret, amount, taker            }
 * { type:"escrowPrivate",  secret, amount, taker,  literal  }
 * { type:"withdrawPublic", secret, amount, recipient        }
 * { type:"withdrawPrivate",secret, amount, recipient        }
 *
 * worker -> parent-thread
 * ---------------------------------------------
 * { type:"inputs", kind:"escrowPublic",   inputs:[ ... ] }
 * { type:"inputs", kind:"escrowPrivate",  inputs:[ ... ] }
 * { type:"inputs", kind:"withdrawPublic", inputs:[ ... ] }
 * { type:"inputs", kind:"withdrawPrivate",inputs:[ ... ] }
 *********************************************************************/

await initThreadPool();

const TOKEN_ID =
  "3443843282313283355337459085696902919850365217539366784739393210722344986field";

const ensureField = (x: string) =>
  typeof x === "string" && x.endsWith("field") ? x : `${x}field`;

const u128 = (x: string) => `${x}u128`;

const toMicro = (x: string) =>
  `${BigInt(Math.round(Number(x) * 1_000_000))}u128`;

type EscrowPubMsg = {
  type: "escrowPublic";
  secret: string;
  amount: string; // human (credits)  e.g. "12.5"
  taker: string; // public Aleo addr
};

type EscrowPrivMsg = {
  type: "escrowPrivate";
  secret: string;
  amount: string;
  taker: string;
  literal: string; // token_registry.aleo/Token literal **with _nonce**
};

type WithdrawPubMsg = {
  type: "withdrawPublic";
  secret: string;
  amount: string;
  recipient: string; // public Aleo addr (taker)
};

type WithdrawPrivMsg = {
  type: "withdrawPrivate";
  secret: string;
  amount: string;
  recipient: string; // private recipient addr (no “.private” suffix)
};

type Msg = EscrowPubMsg | EscrowPrivMsg | WithdrawPubMsg | WithdrawPrivMsg;

onmessage = ({ data }: MessageEvent<Msg>) => {
  console.log("worker received", data);
  try {
    switch (data.type) {
      case "escrowPublic": {
        const inputs = [
          ensureField(data.secret),
          TOKEN_ID,
          toMicro(data.amount), // amount u128
          `${Math.floor(Date.now() / 1e3) + 7_200}u32`, // withdraw_block (2h)
          data.taker,
        ];
        postMessage({ type: "inputs", kind: "escrowPublic", inputs });
        break;
      }

      case "escrowPrivate": {
        const inputs = [
          ensureField(data.secret),
          data.literal,
          TOKEN_ID,
          toMicro(data.amount),
          `${Math.floor(Date.now() / 1e3) + 7_200}u32`,
          data.taker,
        ];
        postMessage({ type: "inputs", kind: "escrowPrivate", inputs });
        break;
      }

      case "withdrawPublic": {
        const inputs = [
          ensureField(data.secret),
          TOKEN_ID,
          data.recipient,
          toMicro(data.amount),
        ];
        postMessage({ type: "inputs", kind: "withdrawPublic", inputs });
        break;
      }

      case "withdrawPrivate": {
        const inputs = [
          ensureField(data.secret),
          TOKEN_ID,
          toMicro(data.amount),
          `${data.recipient}.private`,
        ];
        postMessage({ type: "inputs", kind: "withdrawPrivate", inputs });
        break;
      }
    }
  } catch (err) {
    postMessage({ type: "error", error: (err as Error).message });
  }
};
