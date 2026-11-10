export type TransactionTypeName = 'INCOME' | 'EXPENSE';

export type AmountLine = {
  type: TransactionTypeName;
  amount: string;
};

export type FinancialSummary = {
  income: string;
  expense: string;
  balance: string;
};

const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

export function isPositiveAmount(value: string): boolean {
  if (!AMOUNT_PATTERN.test(value)) {
    return false;
  }

  return toCents(value) > 0n;
}

export function toCents(amount: string): bigint {
  const negative = amount.startsWith('-');
  const normalized = negative ? amount.slice(1) : amount;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
  return negative ? -cents : cents;
}

export function fromCents(cents: bigint): string {
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole.toString()}.${fraction}`;
}

// Suma en centavos enteros para no usar números de punto flotante.
export function summarize(lines: AmountLine[]): FinancialSummary {
  let income = 0n;
  let expense = 0n;

  for (const line of lines) {
    const cents = toCents(line.amount);
    if (line.type === 'INCOME') {
      income += cents;
    } else {
      expense += cents;
    }
  }

  return {
    income: fromCents(income),
    expense: fromCents(expense),
    balance: fromCents(income - expense),
  };
}
