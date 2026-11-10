export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
  id: number;
  description: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
  createdAt: string;
};

export type Summary = {
  income: string;
  expense: string;
  balance: string;
};

export type CreateTransactionInput = {
  description: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
};
