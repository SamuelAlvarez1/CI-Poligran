import type { Transaction } from '../types';
import { formatCop, formatDate, typeLabel } from '../format';

type TransactionTableProps = {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
  deletingId: number | null;
};

export function TransactionTable({ transactions, onDelete, deletingId }: TransactionTableProps) {
  return (
    <section className="panel">
      <h2>Historial</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.category}</td>
                  <td>{typeLabel(transaction.type)}</td>
                  <td className={transaction.type === 'INCOME' ? 'amount income' : 'amount expense'}>
                    {formatCop(transaction.amount)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="danger"
                      disabled={deletingId === transaction.id}
                      onClick={() => {
                        void onDelete(transaction.id);
                      }}
                    >
                      {deletingId === transaction.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
