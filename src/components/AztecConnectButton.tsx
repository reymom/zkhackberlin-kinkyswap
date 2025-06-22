"use client";

import { useAztecWallet } from "@/contexts/AztecWalletProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AztecConnectButton() {
    const { connected, account, connect, disconnect } = useAztecWallet();
    const short = account
        ? `${account.slice(0, 6)}…${account.slice(-4)}`
        : "Connect Aztec";

    const base =
        "wallet-adapter-button wallet-adapter-button-trigger flex items-center gap-2 font-medium cursor-pointer"; // 🚫 removed opacity-80

    const disconnected =
        "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white";

    const connectedCls = "bg-white/10 hover:bg-white/20 text-white";


    return (
        <Button
            onClick={connected ? disconnect : connect}
            className={`${base} ${connected ? connectedCls : disconnected
                }`}
        >
            <Image
                src="/aztec.png"
                alt="Aztec"
                width={30}
                height={30}
                priority={false}
            />
            {short}
        </Button>
    );
}
