import type { Summary } from '../types';
import { formatCop } from '../format';

type SummaryCardsProps = {
  summary: Summary | null;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const balance = summary?.balance ?? '0.00';
  const balanceNegative = balance.startsWith('-');

  return (
    <section className="cards" aria-label="Resumen">
      <article className="card card-income">
        <h2>Ingresos</h2>
        <p>{summary ? formatCop(summary.income) : '—'}</p>
      </article>
      <article className="card card-expense">
        <h2>Gastos</h2>
        <p>{summary ? formatCop(summary.expense) : '—'}</p>
      </article>
      <article className={balanceNegative ? 'card card-negative' : 'card card-balance'}>
        <h2>Balance</h2>
        <p>{summary ? formatCop(summary.balance) : '—'}</p>
      </article>
    </section>
  );
}
