export function formatMoney(cents: number, currency: 'JPY'|'USD'='JPY') {
  const amount = cents / 100
  return new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount)
}
