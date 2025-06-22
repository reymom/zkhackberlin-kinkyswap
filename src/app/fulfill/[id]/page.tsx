"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, LucideRecycle, Loader2 } from "lucide-react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SwapOrder } from "@/types/order"
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"

const networkIcon = (n: "Aleo" | "Aztec") =>
    n === "Aleo"
        ? <Image src="/aleo.png" alt="Aleo" width={20} height={20} />
        : <Image src="/aztec.png" alt="Aztec" width={20} height={20} />

const PROGRAM_ID = "kinky_swap_escrow_v0.aleo"

const toLiteral = (rec: any) => {
    if (!rec) return "";
    if (typeof rec.toString === "function") return rec.toString();
    return JSON.stringify(rec);
}

export default function FulfillOrderPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [order, setOrder] = useState<SwapOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [executing, setExecuting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const workerRef = useRef<Worker | null>(null)
    const { connected, publicKey, requestExecution, requestRecords } = useWallet()

    useEffect(() => {
        fetch("/api/orders")
            .then(r => r.json())
            .then(d => {
                const found = (d.orders as SwapOrder[]).find(o => o.id === id)
                setOrder(found ?? null)
                setLoading(false)
            })
    }, [id])

    useEffect(() => {
        workerRef.current = new Worker(new URL("../../worker.ts", import.meta.url))
        return () => workerRef.current?.terminate()
    }, [])

    const onLock = useCallback(async () => {
        if (!order) return setMessage("Order data missing.");
        if (!connected) return setMessage("Connect your Aleo wallet.");
        if (!publicKey) return setMessage("Wallet connected, no public key?");
        if (!requestExecution) {
            return setMessage("Wallet lacks execution capability.");
        }
        const isPublic =
            (order.depositKind ?? "public").trim().toLowerCase() === "public";

        setExecuting(true)

        /* ------- If PRIVATE deposit, grab a record first ------- */
        let literal = "";
        if (!isPublic) {
            setMessage("Searching for KNK private record…");
            const KNK_ID =
                "3443843282313283355337459085696902919850365217539366784739393210722344986field";
            const recs = await requestRecords!("token_registry.aleo");
            console.log("found records:", recs, "records");
            const knk = recs.find(
                (r: any) => r.data.token_id.toString().split(".")[0] === KNK_ID && !r.spent,
            );
            if (!knk) {
                setExecuting(false);
                return setMessage("No unspent private KNK record.");
            }
            literal = toLiteral(knk);
        }

        /* ------- Wire worker <-> wallet execution ------- */
        workerRef.current!.onmessage = async ({ data }) => {
            if (data.type !== "inputs") return;
            try {
                /* Approve transaction */
                if (data.kind === "approvePublic") {
                    const tx = Transaction.createTransaction(
                        publicKey!,
                        WalletAdapterNetwork.TestnetBeta,
                        "token_registry.aleo",
                        "approve_public",
                        data.inputs,
                        1_000_000,
                        false,
                    );
                    await requestExecution!(tx);
                    setMessage("Approve tx sent. Waiting 20 s…");

                    /* fire escrow build after a short delay */
                    setTimeout(() => {
                        workerRef.current?.postMessage({
                            type: "escrowPublic",
                            secret: order.secretHash!,
                            amount: order.amountTo,
                            taker: publicKey!,
                        });
                    }, 20_000);
                    return;
                }

                /* Escrow transaction (public OR private) */
                const fn =
                    data.kind === "escrowPublic" ? "escrow_from_public" : "escrow_from_private";

                const tx = Transaction.createTransaction(
                    publicKey!,
                    WalletAdapterNetwork.TestnetBeta,
                    PROGRAM_ID,
                    fn,
                    data.inputs,
                    1_000_000,
                    false,
                );
                const txId = await requestExecution!(tx);
                setMessage(`Submitted: ${txId.slice(0, 8)}…`);
                setExecuting(false);
            } catch (err) {
                console.error(err);
                setMessage((err as Error).message);
                setExecuting(false);
            }
        };

        /* ------- Kick-off worker -------- */
        if (isPublic) {
            workerRef.current?.postMessage({
                type: "approvePublic",
                amount: order.amountTo,
            });
        } else {
            workerRef.current?.postMessage({
                type: "escrowPrivate",
                secret: order.secretHash!,
                amount: order.amountTo,
                taker: publicKey!,
                literal,
            });
        }
    }, [order, publicKey, connected]);

    const kindBadge = (k: "public" | "private") =>
        k === "public" ? (
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Public</Badge>
        ) : (
            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Private</Badge>
        );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="text-center mt-32 text-gray-300">
                Order not found.
            </div>
        )
    }

    return (
        <main className="container mx-auto px-4 py-16">
            <div className="max-w-xl mx-auto">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-col gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="self-start text-white hover:text-purple-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>

                        <CardTitle className="text-white flex items-center gap-2">
                            Fulfill Swap #{order.id.slice(0, 8)}
                            <div className="flex items-center gap-2">
                                {kindBadge(order.depositKind as "public" | "private")}
                                <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                                    Active
                                </Badge>
                            </div>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                            Lock {order.amountTo} {order.tokenTo} on {order.networkTo} to receive {order.amountFrom} {order.tokenFrom} on {order.networkFrom}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* amounts */}
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {networkIcon(order.networkFrom)}
                                    <span className="text-3xl font-bold text-white">{order.amountFrom}</span>
                                </div>
                                <p className="text-sm text-blue-400">{order.tokenFrom}</p>
                            </div>

                            <LucideRecycle className="h-6 w-6 text-gray-400" />

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {networkIcon(order.networkTo)}
                                    <span className="text-3xl font-bold text-white">{order.amountTo}</span>
                                </div>
                                <p className="text-sm text-blue-400">{order.tokenTo}</p>
                            </div>
                        </div>

                        <Button
                            onClick={onLock}
                            disabled={executing}
                            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3"
                        >
                            {executing ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Execute Escrow"
                            )}
                        </Button>

                        {message && (
                            <p className="text-sm text-center text-red-400">{message}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
