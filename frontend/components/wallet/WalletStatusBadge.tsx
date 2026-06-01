"use client"

import { useWallet } from "@/contexts/WalletContext"
import { Wallet, Loader2, Unlink } from "lucide-react"

export function WalletStatusBadge() {
  const { publicKey, connected, connecting, freighterInstalled } = useWallet()

  if (!freighterInstalled) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-foreground bg-muted text-xs font-bold">
        <Unlink className="h-3 w-3" />
        No Wallet
      </span>
    )
  }

  if (connecting) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-foreground bg-accent text-xs font-bold">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting
      </span>
    )
  }

  if (connected && publicKey) {
    const truncated = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-foreground bg-secondary text-xs font-bold">
        <Wallet className="h-3 w-3" />
        {truncated}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-foreground bg-muted text-xs font-bold">
      <Wallet className="h-3 w-3" />
      Disconnected
    </span>
  )
}
