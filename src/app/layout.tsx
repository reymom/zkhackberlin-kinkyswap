import React from "react"
import Metadata from "next"

import Header from "@/components/Header"
import ClientWalletProvider from "@/components/ClientWalletProvider"

import "@demox-labs/aleo-wallet-adapter-reactui/styles.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kiky Swap - Decentralized Token Swaps",
  description: "Create and fulfill token swap orders from Aleo to Aztec",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientWalletProvider>
          <Header />
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  )
}