import { useCallback, useEffect, useState } from 'react';
import { createTransaction, deleteTransaction, getSummary, getTransactions } from './api';
import { SummaryCards } from './components/SummaryCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import type { CreateTransactionInput, Summary, Transaction } from './types';

export function App() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const [nextSummary, nextTransactions] = await Promise.all([getSummary(), getTransactions()]);
    setSummary(nextSummary);
    setTransactions(nextTransactions);
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;
    reload()
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }
        const message = loadError instanceof Error ? loadError.message : 'No fue posible cargar los datos';
        setError(message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reload]);

  async function handleCreate(input: CreateTransactionInput) {
    await createTransaction(input);
    await reload();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este movimiento?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await reload();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'No fue posible eliminar el movimiento';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <header>
        <div className="header-inner">
          <h1>FinTrack</h1>
          <p>Ingresos y gastos en pesos colombianos</p>
        </div>
      </header>
      <main>
        {error ? <p className="banner">{error}</p> : null}
        {loading ? <p className="status">Cargando movimientos...</p> : null}
        <SummaryCards summary={summary} />
        <TransactionForm onCreate={handleCreate} />
        <TransactionTable
          transactions={transactions}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </main>
    </>
  );
}
