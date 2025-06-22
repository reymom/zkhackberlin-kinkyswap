"use client"

import { ArrowRight, Coins, List, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
    return (
        <div className="relative">
            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                        Kinky Token Swaps
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        A zero-knowledge private swap matching engine — for the tasteful and anonymous.
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

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Wallet className="mr-2 h-6 w-6 text-teal-400" />
                            Aleo Wallet
                        </CardTitle>
                        <CardDescription className="text-gray-300">Connect your Aleo account to start trading</CardDescription>
                    </CardHeader>
                </Card>
            </main>
        </div>
    )
}
