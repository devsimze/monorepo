"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    // Mock connecting to Freighter or another Stellar wallet
    setAddress("GB5Q6H276L5565XZ626Z3K6A4G4N4W6K2V3F2O7Z2E2A5D3G6F7N7X2P");
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
