import type { CreateTransactionInput, Summary, Transaction } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function getApiUrl(): string {
  return API_URL;
}

export async function getSummary(): Promise<Summary> {
  return request<Summary>('/api/summary');
}

export async function getTransactions(): Promise<Transaction[]> {
  return request<Transaction[]>('/api/transactions');
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  return request<Transaction>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteTransaction(id: number): Promise<Transaction> {
  return request<Transaction>(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(`No fue posible conectar con la API en ${API_URL}`);
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join('. ');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    return 'No fue posible completar la operación';
  }

  return 'No fue posible completar la operación';
}
