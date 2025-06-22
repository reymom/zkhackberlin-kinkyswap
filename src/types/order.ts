export interface SwapOrder {
  id: string;
  networkFrom: "Aleo" | "Aztec";
  tokenFrom: string;
  amountFrom: string;
  networkTo: "Aleo" | "Aztec";
  tokenTo: string;
  amountTo: string;
  secretHash: string;
  depositKind: "private" | "public";
  maker: string | null;
  timestamp: number;
}
