"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SwapOrder } from "@/types/order"

export default function OrdersPage() {
  const [orders, setOrders] = useState<SwapOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const tokenColor = (token: string) =>
    ({ KNK: "text-blue-400", USDT: "text-green-400" }[token] ?? "text-gray-300")

  const rate = (o: SwapOrder) =>
    (Number(o.amountTo) / Number(o.amountFrom)).toFixed(6)

  const networkIcon = (n: "Aleo" | "Aztec") =>
    n === "Aleo"
      ? <Image src="/aleo.png" alt="Aleo" width={20} height={20} />
      : <Image src="/aztec.png" alt="Aztec" width={20} height={20} />

  const kindBadge = (k: "public" | "private") =>
    k === "public" ? (
      <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Public</Badge>
    ) : (
      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Private</Badge>
    );

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Available Swap Orders</h1>
          <p className="text-gray-300 text-lg">Browse and fulfill token swap orders from other users</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
            <p className="text-gray-300 mt-4">Loading orders…</p>
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
            {orders.map(o => (
              <Card
                key={o.id}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Coins className="h-5 w-5 text-purple-400" />
                      Swap #{o.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {kindBadge(o.depositKind as "public" | "private")}
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* amounts & networks */}
                  <div className="flex items-center justify-between mb-4">
                    {/* from */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {networkIcon(o.networkFrom)}
                        <span className="text-2xl font-bold text-white">{o.amountFrom}</span>
                      </div>
                      <p className={`text-sm font-medium ${tokenColor(o.tokenFrom)}`}>{o.tokenFrom}</p>
                    </div>

                    <ArrowRight className="h-6 w-6 text-gray-400" />

                    {/* to */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {networkIcon(o.networkTo)}
                        <span className="text-2xl font-bold text-white">{o.amountTo}</span>
                      </div>
                      <p className={`text-sm font-medium ${tokenColor(o.tokenTo)}`}>{o.tokenTo}</p>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-300 text-center">
                      Rate: 1 {o.tokenFrom} = {rate(o)} {o.tokenTo}
                    </p>
                  </div>

                  <Link href={`/fulfill/${o.id}`}>
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
  )
}
