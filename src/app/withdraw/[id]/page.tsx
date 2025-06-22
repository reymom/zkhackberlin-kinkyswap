"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletAdapterNetwork, Transaction } from "@demox-labs/aleo-wallet-adapter-base";
import { Loader2 } from "lucide-react";
import type { SwapOrder } from "@/types/order";

const PROGRAM_ID = "kinky_swap_escrow_v0.aleo";

export default function WithdrawPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const worker = useRef<Worker | null>(null);
    const [order, setOrder] = useState<SwapOrder | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const { connected, publicKey, requestExecution } = useWallet();

    /* ──────────  fetch order  ────────── */
    useEffect(() => {
        fetch("/api/orders")
            .then(r => r.json())
            .then(d => setOrder((d.orders as SwapOrder[]).find(o => o.id === id) ?? null));
    }, [id]);

    /* ──────────  spawn worker once  ──── */
    useEffect(() => {
        worker.current = new Worker(new URL("../../../zkEscrowWorker.ts", import.meta.url));
        return () => worker.current?.terminate();
    }, []);

    /* ──────────  taker CLAIM (public)  ─ */
    const onClaim = useCallback(() => {
        if (!order || !order.secretHash) { setMsg("secret missing"); return; }
        if (!connected || !publicKey || !requestExecution) {
            setMsg("connect wallet first"); return;
        }
        setBusy(true); setMsg("building…");

        worker.current!.onmessage = async ({ data }) => {
            if (data.type !== "inputs") return;
            try {
                const tx = Transaction.createTransaction(
                    publicKey,
                    WalletAdapterNetwork.TestnetBeta,
                    PROGRAM_ID,
                    "withdraw_to_public",
                    data.inputs,
                    1_000_000,
                    false
                );
                const txId = await requestExecution(tx);
                setMsg(`submitted ${txId.slice(0, 8)}…`);
                router.push("/orders");
            } catch (e: any) { setMsg(e.message); }
            finally { setBusy(false); }
        };

        worker.current!.postMessage({
            type: "withdrawPublic",
            secret: order.secretHash,
            amount: order.amountFrom,     // what taker receives
            recipient: publicKey,
        });
    }, [order, connected, publicKey]);

    /* ──────────  maker REFUND (private) ─ */
    const onRefund = useCallback(() => {
        if (!order || !order.secretHash) { setMsg("secret missing"); return; }
        if (!connected || !publicKey || !requestExecution) {
            setMsg("connect wallet first"); return;
        }
        /* 👇 your UI should only enable this AFTER t1 has passed! */
        setBusy(true); setMsg("building refund…");

        worker.current!.onmessage = async ({ data }) => {
            if (data.type !== "inputs") return;
            try {
                const tx = Transaction.createTransaction(
                    publicKey,
                    WalletAdapterNetwork.TestnetBeta,
                    PROGRAM_ID,
                    "withdraw_to_private",
                    data.inputs,
                    1_000_000,
                    false
                );
                const txId = await requestExecution(tx);
                setMsg(`refund tx ${txId.slice(0, 8)}…`);
                router.push("/orders");
            } catch (e: any) { setMsg(e.message); }
            finally { setBusy(false); }
        };

        worker.current!.postMessage({
            type: "withdrawPrivate",
            secret: order.secretHash,
            amount: order.amountTo,
            recipient: publicKey.replace(".aleo", ""),
        });
    }, [order, connected, publicKey]);

    /* ──────────  trivial UI  ─────────── */
    if (!order) return <p className="p-8 text-gray-400">loading…</p>;

    return (
        <main className="max-w-lg mx-auto mt-16 space-y-4">
            <h1 className="text-2xl text-white">Withdraw / Refund</h1>

            <button
                disabled={busy}
                onClick={onClaim}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded"
            >{busy ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Claim (taker)"}</button>

            <button
                disabled={busy}
                onClick={onRefund}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded"
            >Refund (maker)</button>

            {msg && <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg}</p>}
        </main>
    );
}
