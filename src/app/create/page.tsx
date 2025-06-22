"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { poseidonField } from "@/lib/poseidonField"

const NETWORKS = ["Aleo", "Aztec"] as const;
const TOKENS = ["KNK", "USDT"] as const;

export default function CreateOrderPage() {
    const [networkFrom, setNetworkFrom] = useState<"Aleo" | "Aztec">("Aleo");
    const [tokenFrom, setTokenFrom] = useState("KNK");
    const [networkTo, setNetworkTo] = useState<"Aleo" | "Aztec">("Aztec");

    const [amountFrom, setAmountFrom] = useState("");
    const [tokenTo, setTokenTo] = useState("KNK");
    const [amountTo, setAmountTo] = useState("");

    const [depositKind, setDepositKind] = useState<"private" | "public">("private");
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const createOrder = async () => {
        if (!amountFrom || !amountTo) return

        setIsCreating(true)
        try {
            const secret = crypto.randomUUID()
            const secretHash = await poseidonField(secret)
            localStorage.setItem(`order:${secretHash}`, secret)
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    networkFrom,
                    tokenFrom,
                    amountFrom,
                    networkTo,
                    tokenTo,
                    amountTo,
                    secretHash,
                    depositKind,
                }),
            })
            const { order } = await res.json()
            localStorage.setItem(`secretByOrder:${order.id}`, secret)
            router.push(`/fulfill/${order.id}`)
        } catch (error) {
            console.error("Failed to create order:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const swapSides = () => {
        setNetworkFrom(networkTo);
        setNetworkTo(networkFrom);
        setTokenFrom(tokenTo);
        setTokenTo(tokenFrom);
        setAmountFrom(amountTo);
        setAmountTo(amountFrom);
    };

    return (
        <main className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-white">Create Swap Order</CardTitle>
                        <CardDescription className="text-gray-300">
                            Set up a new token swap order for other users to fulfill
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-1 text-sm text-gray-300">
                                <input
                                    type="radio"
                                    value="private"
                                    checked={depositKind === "private"}
                                    onChange={() => setDepositKind("private")}
                                />
                                Private record
                            </label>
                            <label className="flex items-center gap-1 text-sm text-gray-300">
                                <input
                                    type="radio"
                                    value="public"
                                    checked={depositKind === "public"}
                                    onChange={() => setDepositKind("public")}
                                />
                                Public balance
                            </label>
                        </div>
                        {/* From Token */}
                        <section className="space-y-2">
                            <Label className="text-white">You're offering</Label>
                            <div className="flex !space-x-2">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amountFrom}
                                        onChange={(e) => setAmountFrom(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                {/* network */}
                                <Select value={networkFrom} onValueChange={v => setNetworkFrom(v as any)}>
                                    <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {NETWORKS.map(n => (
                                            <SelectItem key={n} value={n} className="text-white hover:bg-white/10">
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={tokenFrom} onValueChange={setTokenFrom}>
                                    <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {TOKENS.map(t => (
                                            <SelectItem key={t} value={t} className="text-white hover:bg-white/10">
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>

                        {/* Swap Button */}
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={swapSides}
                                className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white"
                            >
                                <ArrowDownUp className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* To Token */}
                        <section className="space-y-2">
                            <Label className="text-white">You want</Label>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amountTo}
                                        onChange={(e) => setAmountTo(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <Select value={networkTo} onValueChange={v => setNetworkTo(v as any)}>
                                    <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {NETWORKS.map(n => (
                                            <SelectItem key={n} value={n} className="text-white hover:bg-white/10">
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={tokenTo} onValueChange={setTokenTo}>
                                    <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {TOKENS.map(t => (
                                            <SelectItem key={t} value={t} className="text-white hover:bg-white/10">
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>

                        {/* Exchange Rate Display */}
                        {amountFrom && amountTo && (
                            <div className="p-4 bg-black/20 rounded-lg">
                                <p className="text-sm text-gray-300 text-center">
                                    Exchange Rate: 1 {tokenFrom} = {(Number.parseFloat(amountTo) / Number.parseFloat(amountFrom)).toFixed(6)}{" "}
                                    {tokenTo}
                                </p>
                            </div>
                        )}

                        {/* Create Order Button */}
                        <Button
                            onClick={createOrder}
                            disabled={!amountFrom || !amountTo || isCreating}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                        >
                            {isCreating ? "Creating Order..." : "Create Swap Order"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
