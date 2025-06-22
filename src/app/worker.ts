import { initThreadPool } from "@provablehq/sdk";

await initThreadPool();

const TOKEN_ID =
  "3443843282313283355337459085696902919850365217539366784739393210722344986field";

type Msg =
  | {
      type: "createEscrow";
      secret: string;
      amount: string;
      taker: string;
      record: string;
    }
  | {
      type: "withdrawEscrow";
      secret: string;
      amount: string;
      recipient: string;
    };

const ensureField = (x: string) =>
  typeof x === "string" && x.endsWith("field") ? x : `${x}field`;

const toMicro = (x: string) =>
  `${BigInt(Math.round(Number(x) * 1_000_000))}u128`;

onmessage = ({ data }: MessageEvent<Msg>) => {
  console.log("worker received", data);
  switch (data.type) {
    case "createEscrow":
      postMessage({
        type: "createEscrowInputs",
        inputs: [
          ensureField(data.secret),
          data.record,
          TOKEN_ID,
          toMicro(data.amount),
          `${Math.floor(Date.now() / 1000) + 7200}u32`,
          data.taker,
        ],
      });
      break;

    case "withdrawEscrow":
      postMessage({
        type: "withdrawEscrowInputs",
        inputs: [
          ensureField(data.secret),
          TOKEN_ID,
          data.recipient,
          `${data.amount}u128`,
        ],
      });
      break;
  }
};
