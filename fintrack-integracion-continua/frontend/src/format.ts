import type { TransactionType } from './types';

export function formatCop(amount: string): string {
  const negative = amount.startsWith('-');
  const unsigned = negative ? amount.slice(1) : amount;
  const [whole, fraction = '00'] = unsigned.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimals = fraction.padEnd(2, '0').slice(0, 2);
  return `${negative ? '-' : ''}$${grouped},${decimals}`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}/${month}/${year}`;
}

export function typeLabel(type: TransactionType): string {
  return type === 'INCOME' ? 'Ingreso' : 'Gasto';
}
