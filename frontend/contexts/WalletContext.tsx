"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { isFreighterInstalled, connectWallet, disconnectWallet, signTransaction } from "@/lib/freighter"

const STORAGE_KEY = "shelterflex_wallet"

interface WalletContextType {
  publicKey: string | null
  connected: boolean
  connecting: boolean
  freighterInstalled: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function truncatePublicKey(key: string): string {
  if (key.length <= 8) return key
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    isFreighterInstalled().then(setFreighterInstalled)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.publicKey) {
          setPublicKey(parsed.publicKey)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const pk = await connectWallet()
      setPublicKey(pk)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ publicKey: pk }))
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey(null)
    disconnectWallet()
  }, [])

  const handleSignTransaction = useCallback(async (xdr: string): Promise<string> => {
    return signTransaction(xdr)
  }, [])

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected: publicKey !== null,
        connecting,
        freighterInstalled: freighterInstalled === true,
        connect,
        disconnect,
        signTransaction: handleSignTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
