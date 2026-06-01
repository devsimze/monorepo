"use client"

import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, LogOut, ExternalLink } from "lucide-react"

export function ConnectWalletButton() {
  const { publicKey, connected, connecting, freighterInstalled, connect, disconnect } = useWallet()

  if (!freighterInstalled) {
    return (
      <a
        href="https://chrome.google.com/webstore/detail/freighter/eoppcpbndeheinkjjdkhlnjepjcfhgfc"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          size="sm"
          className="border-3 border-foreground font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Install Freighter
        </Button>
      </a>
    )
  }

  if (connected && publicKey) {
    const truncated = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold bg-muted border-2 border-foreground px-2 py-1">
          {truncated}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="border-3 border-foreground font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={connect}
      disabled={connecting}
      className="border-3 border-foreground font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
    >
      {connecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      Connect Wallet
    </Button>
  )
}
