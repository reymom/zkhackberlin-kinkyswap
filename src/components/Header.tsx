"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { useCallback, useEffect, useState } from "react"
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";

export default function Header() {
    const { connected, connect, wallet, wallets, publicKey, requestRecords } = useWallet()
    const [walletSelected, setWalletSelected] = useState(false)
    const [balance, setBalance] = useState<string | null>(null)

    useEffect(() => {
        console.log("wallets:", wallets)
        console.log("selected wallet:", wallet)
        console.log("publicKey:", publicKey)
    }, [wallet, wallets, publicKey])

    const fetchBalance = useCallback(async () => {
        if (connected && requestRecords && publicKey) {
            const records = await requestRecords("credits.aleo")
            const unspent = records?.find((r: any) => r.microcredits && !r.spent)
            if (unspent) {
                const amount = Number(unspent.microcredits) / 1_000_000 // microcredits to credits
                setBalance(amount.toFixed(6))
            }
        }
    }, [connected, requestRecords, publicKey])

    useEffect(() => {
        if (connected) {
            fetchBalance()
        } else {
            setBalance(null)
        }
    }, [connected, fetchBalance])

    return (
        <header className="border-b border-white/10 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Wallet className="text-purple-400 h-6 w-6" />
                    <span className="text-lg font-semibold text-white">KinkySwap</span>
                </div>
                <nav className="flex gap-6 items-center text-sm">
                    <Link href="/create" className="text-gray-300 hover:text-white transition">
                        Create Order
                    </Link>
                    <Link href="/orders" className="text-gray-300 hover:text-white transition">
                        Browse Orders
                    </Link>
                    <WalletMultiButton />
                </nav>
            </div>
            {connected && publicKey && (
                <div className="text-xs text-gray-400 px-4 py-1 text-right">
                    Connected: <span className="text-white">{publicKey.toString()}</span>
                    {balance && (
                        <div className="text-teal-300">
                            Balance: <strong>{balance}</strong> credits
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}
