"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Coins, List, Wallet, Zap } from "lucide-react"

export default function Home() {
    const [account, setAccount] = useState(null)
    const [executing, setExecuting] = useState(false)
    const workerRef = useRef<Worker | null>(null)

    const generateAccount = async () => {
        workerRef.current?.postMessage("key")
    }

    async function execute() {
        setExecuting(true)
        workerRef.current?.postMessage("execute")
    }

    interface AleoWorkerMessageEvent {
        type: string
        result: any
    }

    useEffect(() => {
        workerRef.current = new Worker(new URL("worker.ts", import.meta.url))
        workerRef.current.onmessage = (event: MessageEvent<AleoWorkerMessageEvent>) => {
            if (event.data.type === "key") {
                setAccount(event.data.result)
            } else if (event.data.type === "execute") {
                setExecuting(false)
            }
            alert(`WebWorker Response => ${event.data.result}`)
        }
        return () => {
            workerRef.current?.terminate()
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 blur-3xl" />

            <div className="relative">
                {/* Header */}
                <header className="border-b border-white/10 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Zap className="h-8 w-8 text-purple-400" />
                                <span className="text-2xl font-bold text-white">AleoSwap</span>
                            </div>
                            <nav className="hidden md:flex items-center space-x-6">
                                <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
                                    Create Order
                                </Link>
                                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors">
                                    Browse Orders
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="container mx-auto px-4 py-16">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                            Decentralized Token Swaps
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Create and fulfill token swap orders on the Aleo blockchain with zero-knowledge privacy
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link href="/create">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                                >
                                    <Coins className="mr-2 h-5 w-5" />
                                    Create Swap Order
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/orders">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3"
                                >
                                    <List className="mr-2 h-5 w-5" />
                                    Browse Orders
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Coins className="mr-2 h-6 w-6 text-purple-400" />
                                    Create Orders
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Set up token swap orders with your desired exchange rates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/create">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Creating</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <List className="mr-2 h-6 w-6 text-blue-400" />
                                    Browse & Fulfill
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Find and fulfill existing swap orders from other users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/orders">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Browse Orders</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Aleo Integration Section */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Wallet className="mr-2 h-6 w-6 text-teal-400" />
                                Aleo Wallet Integration
                            </CardTitle>
                            <CardDescription className="text-gray-300">Connect your Aleo account to start trading</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={generateAccount}
                                className="w-full bg-teal-600 hover:bg-teal-700"
                                variant={account ? "outline" : "default"}
                            >
                                {account ? "Account Connected" : "Generate Account"}
                            </Button>

                            {account && (
                                <div className="p-4 bg-black/20 rounded-lg">
                                    <p className="text-sm text-gray-300 break-all">Account: {JSON.stringify(account)}</p>
                                </div>
                            )}

                            <Button
                                onClick={execute}
                                disabled={executing}
                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                            >
                                {executing ? "Executing..." : "Execute HelloWorld.aleo"}
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}