import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { SwapOrder } from "@/types/order";

const ORDERBOOK_KEY = "orderbook";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    networkFrom,
    tokenFrom,
    amountFrom,
    networkTo,
    tokenTo,
    amountTo,
    secretHash,
    depositKind,
    maker = null,
  } = body;

  if (![networkFrom, networkTo].every((n) => n === "Aleo" || n === "Aztec"))
    return NextResponse.json(
      { success: false, error: "Invalid network" },
      { status: 400 }
    );
  const id = crypto.randomUUID();
  const order: SwapOrder = {
    id,
    networkFrom,
    tokenFrom,
    amountFrom,
    networkTo,
    tokenTo,
    amountTo,
    secretHash,
    depositKind,
    maker,
    timestamp: Date.now(),
  };

  const client = await redis;
  await client.rPush(ORDERBOOK_KEY, JSON.stringify(order));
  return NextResponse.json({ success: true, order });
}

export async function GET() {
  const client = await redis;
  const raw = await client.lRange(ORDERBOOK_KEY, 0, -1);
  const orders = raw.map((entry) => JSON.parse(entry));
  return NextResponse.json({ success: true, orders });
}
