import freighterApi from '@stellar/freighter-api'

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    return await freighterApi.isConnected()
  } catch {
    return false
  }
}

export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection requires browser environment')
  }
  const { address } = await freighterApi.getAddress()
  if (!address) {
    throw new Error('Failed to get public key from Freighter')
  }
  return address
}

export function disconnectWallet(): void {
  const KEY = 'shelterflex_wallet'
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY)
  }
}

export async function signTransaction(xdr: string): Promise<string> {
  const result = await freighterApi.signTransaction(xdr, {
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
  if (!result || !result.signedTxXdr) {
    throw new Error('Failed to sign transaction')
  }
  return result.signedTxXdr
}
