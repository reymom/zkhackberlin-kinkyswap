"use client"

import React, { useMemo } from "react"
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui"
import { LeoWalletAdapter } from "aleo-adapters"
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
    const wallets = useMemo(() => [new LeoWalletAdapter({ appName: "FusiSwap" })], [])

    return (
        <WalletProvider
            wallets={wallets}
            programs={["token_registry.aleo"]}
            decryptPermission={DecryptPermission.AutoDecrypt}
            network={WalletAdapterNetwork.TestnetBeta}
            autoConnect={false}
        >
            <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
    )
}
