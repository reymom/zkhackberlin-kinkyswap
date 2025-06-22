"use client"

import Link from "next/link"
import Image from "next/image"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { DecryptPermission } from "@demox-labs/aleo-wallet-adapter-base"

export default function Header() {
    const { connected, wallet, wallets, publicKey, requestRecords } = useWallet()

    useEffect(() => {
        console.log("wallets:", wallets)
        console.log("selected wallet:", wallet)
        console.log("publicKey:", publicKey)
    }, [wallet, wallets, publicKey])

    const fetchPrivateTokenBalances = useCallback(async () => {
        if (!connected || !publicKey || !requestRecords) return

        try {
            const tokenRecords = await requestRecords("token_registry.aleo")
            console.log("Token Records:", tokenRecords)
            const TOKEN_ID =
                "3443843282313283355337459085696902919850365217539366784739393210722344986field"
            const matching = tokenRecords?.find((r: any) => {
                const rawTokenId = r["data"]["token_id"]?.toString().split(".")[0];
                return rawTokenId === TOKEN_ID && !r["spent"];
            });
            if (matching) {
                const amountStr = matching.data.amount?.toString().split("u128")[0];
                const amount = Number(amountStr) / 1_000_000;
                console.log("KinkyToken Private Balance:", amount.toFixed(6));
            }
        } catch (err) {
            console.error("Balance fetch error:", err)
        }
    }, [connected, requestRecords, publicKey])

    useEffect(() => {
        if (connected) {
            fetchPrivateTokenBalances()
        }
    }, [connected, fetchPrivateTokenBalances])

    return (
        <header className="border-b border-white/10 backdrop-blur-sm z-10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer">
                    <Image
                        src="/logo.png"
                        alt="KinkySwap Logo"
                        width={32}
                        height={32}
                        className="h-10 w-10"
                        priority
                    />
                    <span className="text-4xl font-semibold text-white">KinkySwap</span>
                </div>
                <nav className="flex gap-6 items-center text-sm">
                    <Link
                        href="/create"
                        className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                        Create Order
                    </Link>
                    <Link href="/orders" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                        Browse Orders
                    </Link>
                    <WalletMultiButton className="cursor-pointer" decryptPermission={DecryptPermission.AutoDecrypt} />
                </nav>
            </div>
        </header>
    )
}
