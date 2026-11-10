import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPositiveAmount, summarize } from './calculate-summary';

describe('resumen financiero', () => {
  it('calcula el balance como ingresos menos gastos', () => {
    const result = summarize([
      { type: 'INCOME', amount: '2500000.00' },
      { type: 'EXPENSE', amount: '85000.50' },
      { type: 'EXPENSE', amount: '14500.25' },
    ]);

    assert.equal(result.income, '2500000.00');
    assert.equal(result.expense, '99500.75');
    assert.equal(result.balance, '2400499.25');
  });

  it('suma centavos sin el error de 0.1 + 0.2', () => {
    const result = summarize([
      { type: 'INCOME', amount: '0.10' },
      { type: 'INCOME', amount: '0.20' },
    ]);

    assert.equal(result.income, '0.30');
    assert.equal(result.expense, '0.00');
    assert.equal(result.balance, '0.30');
  });

  it('permite un balance negativo', () => {
    const result = summarize([
      { type: 'INCOME', amount: '1000.00' },
      { type: 'EXPENSE', amount: '2500.00' },
    ]);

    assert.equal(result.balance, '-1500.00');
  });

  it('devuelve ceros cuando no hay movimientos', () => {
    assert.deepEqual(summarize([]), {
      income: '0.00',
      expense: '0.00',
      balance: '0.00',
    });
  });
});

describe('monto positivo', () => {
  it('acepta montos mayores que cero con hasta dos decimales', () => {
    assert.equal(isPositiveAmount('0.01'), true);
    assert.equal(isPositiveAmount('150000.50'), true);
  });

  it('rechaza cero, negativos y más de dos decimales', () => {
    assert.equal(isPositiveAmount('0'), false);
    assert.equal(isPositiveAmount('0.00'), false);
    assert.equal(isPositiveAmount('-10.00'), false);
    assert.equal(isPositiveAmount('10.555'), false);
  });
});
