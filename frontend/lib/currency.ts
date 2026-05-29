export type DisplayCurrency = 'NGN' | 'USDC'

export function formatNgn(amount: number | string): string {
  const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(n)) return '₦0.00'
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatUsdc(amount: number | string): string {
  const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(n)) return '0.00 USDC'
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
}

export function formatDual(ngn: number | string, usdc: number | string): string {
  return `${formatNgn(ngn)} · ${formatUsdc(usdc)}`
}

export function formatByPreference(
  amountNgn: number | string,
  amountUsdc: number | string,
  preference: DisplayCurrency,
): string {
  return preference === 'USDC' ? formatUsdc(amountUsdc) : formatNgn(amountNgn)
}
