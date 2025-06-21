# KinkySwap 🔐💋

_A zero-knowledge private swap matching engine — for the tasteful and anonymous._

![zkHack Berlin](https://img.shields.io/badge/zkHack-Berlin-purple)
![Built on Aleo](https://img.shields.io/badge/Built%20on-Aleo-1f8ef1)
![MIT License](https://img.shields.io/badge/license-MIT-green)

## Overview

**KinkySwap** is a fully-private OTC swap engine where orders are:

- Created off-chain and sealed in encrypted Aleo notes
- Fulfilled on-demand via per-order escrow programs
- Executed privately using the Aleo ZK stack

---

## Features

- 🧠 **Private intents**: Orders are created and sealed in zk notes.
- 🔐 **Per-swap escrows**: On fulfillment, a dedicated Aleo program runs the logic.
- 🌐 **Next.js frontend**: React-based frontend with WebWorker ZK execution.
- 📦 **Redis orderbook**: Store and fetch pending orders for demo/trading.

---

## Tech Stack

- [Aleo](https://aleo.org/) — ZK programming language and VM
- [`@provablehq/sdk`](https://github.com/provable-technology/sdk) — Aleo Web SDK
- [Next.js 14](https://nextjs.org/docs/app) with App Router
- Redis (via Vercel KV)
- TailwindCSS 4

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/reymom/zkhackberlin-kinkyswap
cd zkhackberlin-kinkyswap

# Install deps
npm install

# Start dev server
npm run dev
```

Create a `.env.local`:

```bash
REDIS_URL=redis://default:<password>@<host>:<port>
```
