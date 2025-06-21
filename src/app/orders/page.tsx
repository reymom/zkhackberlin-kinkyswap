"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Coins, TrendingUp } from "lucide-react"

interface Order {
  id: string
  tokenA: string
  amountA: string
  tokenB: string
  amountB: string
  createdAt?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getTokenColor = (token: string) => {
    const colors: { [key: string]: string } = {
      ALEO: "text-purple-400",
      USDC: "text-blue-400",
      ETH: "text-gray-300",
      BTC: "text-orange-400",
    }
    return colors[token] || "text-gray-300"
  }

  const getExchangeRate = (order: Order) => {
    const rate = Number.parseFloat(order.amountB) / Number.parseFloat(order.amountA)
    return rate.toFixed(6)
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
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">Available Orders</span>
              </div>
              <Link href="/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Coins className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Available Swap Orders</h1>
              <p className="text-gray-300 text-lg">Browse and fulfill token swap orders from other users</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Available</h3>
                  <p className="text-gray-300 mb-6">Be the first to create a swap order!</p>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Create First Order
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center">
                          <Coins className="mr-2 h-5 w-5 text-purple-400" />
                          Swap Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{order.amountA}</p>
                          <p className={`text-sm font-medium ${getTokenColor(order.tokenA)}`}>{order.tokenA}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{order.amountB}</p>
                          <p className={`text-sm font-medium ${getTokenColor(order.tokenB)}`}>{order.tokenB}</p>
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-300 text-center">
                          Rate: 1 {order.tokenA} = {getExchangeRate(order)} {order.tokenB}
                        </p>
                      </div>

                      <Link href={`/fulfill/${order.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                          Fulfill Order
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
