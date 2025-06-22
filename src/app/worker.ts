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

const ESCROW_ADDR =
  "aleo19qtdssr2d45lfwxsy9928qn7veaw9mupntu9kg6z9h888ztvucrqg7tr5z";

const ensureField = (x: string) =>
  typeof x === "string" && x.endsWith("field") ? x : `${x}field`;

const toMicro = (x: string) =>
  `${BigInt(Math.round(Number(x) * 1_000_000))}u128`;

type ApprovePubMsg = { type: "approvePublic"; amount: string };

type EscrowPubMsg = {
  type: "escrowPublic";
  secret: string;
  amount: string;
  taker: string;
};

type EscrowPrivMsg = {
  type: "escrowPrivate";
  secret: string;
  amount: string;
  taker: string;
  literal: string;
};

type WithdrawPubMsg = {
  type: "withdrawPublic";
  secret: string;
  amount: string;
  recipient: string;
};

type WithdrawPrivMsg = {
  type: "withdrawPrivate";
  secret: string;
  amount: string;
  recipient: string;
};

type Msg =
  | ApprovePubMsg
  | EscrowPubMsg
  | EscrowPrivMsg
  | WithdrawPubMsg
  | WithdrawPrivMsg;

onmessage = ({ data }: MessageEvent<Msg>) => {
  console.log("worker received", data);
  try {
    switch (data.type) {
      case "approvePublic": {
        const inputs = [TOKEN_ID, ESCROW_ADDR, toMicro(data.amount)];
        postMessage({ type: "inputs", kind: "approvePublic", inputs });
        break;
      }

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
