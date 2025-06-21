"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp, ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

const TOKENS = [
    { symbol: "ALEO", name: "Aleo", color: "text-purple-400" },
    { symbol: "USDC", name: "USD Coin", color: "text-blue-400" },
    { symbol: "ETH", name: "Ethereum", color: "text-gray-300" },
    { symbol: "BTC", name: "Bitcoin", color: "text-orange-400" },
]

export default function CreateOrderPage() {
    const [tokenA, setTokenA] = useState("ALEO")
    const [amountA, setAmountA] = useState("")
    const [tokenB, setTokenB] = useState("USDC")
    const [amountB, setAmountB] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const createOrder = async () => {
        if (!amountA || !amountB) return

        setIsCreating(true)
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenA, amountA, tokenB, amountB }),
            })
            const { order } = await res.json()
            router.push(`/fulfill/${order.id}`)
        } catch (error) {
            console.error("Failed to create order:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const swapTokens = () => {
        setTokenA(tokenB)
        setTokenB(tokenA)
        setAmountA(amountB)
        setAmountB(amountA)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 blur-3xl" />

            <div className="relative">
                {/* Header */}
                <header className="border-b border-white/10 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                                <span>Back to Home</span>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Coins className="h-6 w-6 text-purple-400" />
                                <span className="text-xl font-bold text-white">Create Swap Order</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl text-white">Create Swap Order</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Set up a new token swap order for other users to fulfill
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* From Token */}
                                <div className="space-y-2">
                                    <Label className="text-white">You're offering</Label>
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={amountA}
                                                onChange={(e) => setAmountA(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Select value={tokenA} onValueChange={setTokenA}>
                                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-white/20">
                                                {TOKENS.map((token) => (
                                                    <SelectItem key={token.symbol} value={token.symbol} className="text-white hover:bg-white/10">
                                                        <span className={token.color}>{token.symbol}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Swap Button */}
                                <div className="flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={swapTokens}
                                        className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        <ArrowDownUp className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* To Token */}
                                <div className="space-y-2">
                                    <Label className="text-white">You want</Label>
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={amountB}
                                                onChange={(e) => setAmountB(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Select value={tokenB} onValueChange={setTokenB}>
                                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-white/20">
                                                {TOKENS.map((token) => (
                                                    <SelectItem key={token.symbol} value={token.symbol} className="text-white hover:bg-white/10">
                                                        <span className={token.color}>{token.symbol}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Exchange Rate Display */}
                                {amountA && amountB && (
                                    <div className="p-4 bg-black/20 rounded-lg">
                                        <p className="text-sm text-gray-300 text-center">
                                            Exchange Rate: 1 {tokenA} = {(Number.parseFloat(amountB) / Number.parseFloat(amountA)).toFixed(6)}{" "}
                                            {tokenB}
                                        </p>
                                    </div>
                                )}

                                {/* Create Order Button */}
                                <Button
                                    onClick={createOrder}
                                    disabled={!amountA || !amountB || isCreating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                                >
                                    {isCreating ? "Creating Order..." : "Create Swap Order"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}