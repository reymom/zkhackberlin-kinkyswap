import { buildPoseidon } from "circomlibjs";

const strToBigInt = (s: string): bigint => {
  let hex = s.replace(/[^a-fA-F0-9]/g, "");

  if (hex.length === 0) {
    hex = Buffer.from(s, "utf8").toString("hex");
  }

  if (hex.length % 2) hex = "0" + hex;

  return BigInt("0x" + hex);
};

/** Poseidon(secret) to "<bigInt>field"  */
export async function poseidonField(secret: string): Promise<string> {
  const Poseidon = await buildPoseidon();
  const bigSecret = strToBigInt(secret);
  const big = Poseidon.F.toString(Poseidon([bigSecret]));
  return `${big}field`;
}
