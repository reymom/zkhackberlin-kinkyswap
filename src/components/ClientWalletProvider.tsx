"use client"

import React, { useMemo } from "react"
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui"
import { LeoWalletAdapter } from "aleo-adapters"
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"

import "@demox-labs/aleo-wallet-adapter-reactui/styles.css"
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
    const wallets = useMemo(() => [new LeoWalletAdapter({ appName: "FusiSwap" })], [])

    return (
        <WalletProvider
            wallets={wallets}
            decryptPermission={DecryptPermission.UponRequest}
            network={WalletAdapterNetwork.TestnetBeta}
            autoConnect
        >
            <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
    )
}
