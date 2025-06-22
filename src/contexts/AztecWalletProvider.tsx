"use client";

import {
    AztecWalletSdk,
    obsidion,
} from "@shieldswap/wallet-sdk";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const AztecCtx = createContext({
    connected: false,
    account: null as string | null,
    connect: async () => { },
    disconnect: () => { },
});

export function AztecWalletProvider({ children }: { children: React.ReactNode }) {
    const sdkRef = useRef<AztecWalletSdk | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    /* initialise SDK once */
    useEffect(() => {
        const init = async () => {
            const url =
                typeof window !== "undefined" ? window.location.origin : "https://kinkyswap.xyz";

            sdkRef.current = new AztecWalletSdk({
                aztecNode: "https://testnet.aztec.network:8080",
                connectors: [
                    obsidion({
                        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
                        metadata: {
                            name: "KinkySwap",
                            description: "Aleo ↔ Aztec token bridge",
                            url,
                            icons: [`${url}/logo.png`],
                        },
                    }),
                ],
            });
        };
        init().catch(console.error);
    }, []);

    const connect = async () => {
        if (!sdkRef.current) return;
        try {
            await sdkRef.current.connect("obsidion");
            const acc = await sdkRef.current.getAccount();
            setAccount(acc?.address.toString() ?? null);
        } catch (err) {
            console.warn("Aztec connect rejected / failed:", err);
        }
    };

    const disconnect = () => {
        sdkRef.current?.disconnect().catch(console.error);
        setAccount(null);
    };

    return (
        <AztecCtx.Provider value={{ connected: !!account, account, connect, disconnect }}>
            {children}
        </AztecCtx.Provider>
    );
}

export const useAztecWallet = () => useContext(AztecCtx);
