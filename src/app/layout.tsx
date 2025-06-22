import React from "react"
import type { Metadata } from "next"

import Header from "@/components/Header"
import BackgroundFX from "@/components/BackgroundFX"
import ClientWalletProvider from "@/components/ClientWalletProvider"

import "./globals.css"
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css"

export const metadata: Metadata = {
  title: "Kinky Swap - Decentralized Token Swaps",
  description: "Create and fulfill token swap orders from Aleo to Aztec",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 antialiased">
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <BackgroundFX />
        <ClientWalletProvider>
          <Header />
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  )
}