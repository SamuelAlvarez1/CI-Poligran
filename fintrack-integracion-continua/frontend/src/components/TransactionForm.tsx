import { useState, type FormEvent } from 'react';
import type { CreateTransactionInput, TransactionType } from '../types';

type TransactionFormProps = {
  onCreate: (input: CreateTransactionInput) => Promise<void>;
};

const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

export function TransactionForm({ onCreate }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('INCOME');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const descriptionValue = description.trim();
    const categoryValue = category.trim();
    const amountValue = normalizeAmount(amount);

    if (!descriptionValue || !categoryValue || !date) {
      setError('Completa descripción, categoría y fecha.');
      return;
    }

    if (!isPositiveAmount(amountValue)) {
      setError('El monto debe ser mayor que cero. Usa hasta dos decimales, por ejemplo 150000.50.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        description: descriptionValue,
        type,
        category: categoryValue,
        amount: amountValue,
        date,
      });
      setDescription('');
      setCategory('');
      setAmount('');
      setType('INCOME');
      setDate(todayIso());
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'No fue posible guardar el movimiento';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <h2>Registrar movimiento</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Descripción
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            maxLength={200}
          />
        </label>
        <div className="form-row">
          <label>
            Tipo
            <select value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </select>
          </label>
          <label>
            Categoría
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Salario, alimentación..."
              required
              maxLength={80}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Monto (COP)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="150000.50"
              required
            />
          </label>
          <label>
            Fecha
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar movimiento'}
        </button>
      </form>
    </section>
  );
}

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function normalizeAmount(value: string): string {
  const trimmed = value.trim().replace(/\s/g, '');
  if (trimmed.includes(',') && !trimmed.includes('.')) {
    return trimmed.replace(',', '.');
  }
  return trimmed;
}

function isPositiveAmount(value: string): boolean {
  if (!AMOUNT_PATTERN.test(value)) {
    return false;
  }

  const [whole, fraction = ''] = value.split('.');
  const cents = `${whole}${(fraction + '00').slice(0, 2)}`.replace(/^0+/, '');
  return cents.length > 0;
}
