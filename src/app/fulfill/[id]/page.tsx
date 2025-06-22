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
        if (!order) {
            setMessage("Order data missing — refresh the page.")
            return
        }
        if (!connected) {
            setMessage("Connect your Aleo wallet first.")
            return
        }
        if (!publicKey) {
            setMessage("Wallet connected, but no public key?")
            return
        }
        if (!requestExecution) {
            setMessage("This wallet cannot sign executions (needs Leo / Nightly).")
            return
        }
        if (!order.secretHash) {
            setMessage("Maker forgot to attach secretHash — ask them to recreate.")
            return
        }
        setExecuting(true)

        setMessage("Searching for KNK private record…")
        const KNK_ID =
            "3443843282313283355337459085696902919850365217539366784739393210722344986field";
        const recs = await requestRecords!("token_registry.aleo");
        console.log("found records:", recs, "records");
        const knk = recs.find((r: any) =>
            r.data.token_id.toString().split(".")[0] === KNK_ID && !r.spent
        );
        if (!knk) {
            setMessage("No unspent private KNK record found.");
            setExecuting(false);
            return;
        }

        setMessage("Building transaction…")

        /* ask web-worker for properly formatted inputs */
        workerRef.current!.onmessage = async ({ data }) => {
            if (data.type !== "inputs") return;

            console.log("worker inputs:", data.inputs)
            try {
                const tx = Transaction.createTransaction(
                    publicKey!,
                    WalletAdapterNetwork.TestnetBeta,
                    PROGRAM_ID,
                    data.kind === "escrowPublic"
                        ? "escrow_from_public"
                        : "escrow_from_private",
                    data.inputs,
                    1_000_000,
                    false
                );
                const txId = await requestExecution!(tx);
                setMessage(`Submitted: ${txId.slice(0, 8)}…`);
            } catch (err) {
                console.error(err);
                setMessage((err as Error).message);
            }
        }

        workerRef.current?.postMessage({
            type: "escrowPublic",
            secret: order.secretHash,
            amount: order.amountTo,
            taker: publicKey!,
        });
    }, [order, publicKey])

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
                            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                                Active
                            </Badge>
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
