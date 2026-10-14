export function formatMoney(valueInMinorUnits, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format((valueInMinorUnits || 0) / 100)
}

export function humanizeStatus(status = '') {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
