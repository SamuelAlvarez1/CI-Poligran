// Verificación de integración de la API de FinTrack.
// Se ejecuta dentro del contenedor backend (Node 22, fetch nativo) con: node - < scripts/integration-check.js
// Usa datos ficticios y comprueba resultados concretos, no solo códigos HTTP.

const BASE = 'http://127.0.0.1:3000/api';

function fail(message) {
  console.error('FALLO:', message);
  process.exit(1);
}

function check(condition, message) {
  if (!condition) fail(message);
  console.log('OK  ', message);
}

async function request(method, path, body) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }
  return { status: response.status, body: json };
}

async function waitForHealth() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      const response = await request('GET', '/health');
      if (response.status === 200) return response.body;
    } catch {
      // La API todavía no acepta conexiones; se reintenta.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  fail('la API no respondió en /api/health tras 30 intentos');
}

async function main() {
  const health = await waitForHealth();
  check(health.status === 'ok' && health.database === 'up', `GET /api/health -> status=${health.status}, database=${health.database}`);

  const income = await request('POST', '/transactions', {
    description: 'CI ingreso de prueba',
    type: 'INCOME',
    category: 'Prueba',
    amount: '2500000.00',
    date: '2026-11-10',
  });
  check(income.status === 201 || income.status === 200, `POST ingreso responde ${income.status}`);

  const expense = await request('POST', '/transactions', {
    description: 'CI gasto de prueba',
    type: 'EXPENSE',
    category: 'Prueba',
    amount: '85000.50',
    date: '2026-11-10',
  });
  check(expense.status === 201 || expense.status === 200, `POST gasto responde ${expense.status}`);

  const list = await request('GET', '/transactions');
  const descriptions = Array.isArray(list.body) ? list.body.map((t) => t.description) : [];
  check(descriptions.includes('CI ingreso de prueba') && descriptions.includes('CI gasto de prueba'), 'GET /api/transactions contiene los dos movimientos');

  const summary = await request('GET', '/summary');
  check(
    summary.body.income === '2500000.00' && summary.body.expense === '85000.50' && summary.body.balance === '2414999.50',
    `GET /api/summary -> income=${summary.body.income}, expense=${summary.body.expense}, balance=${summary.body.balance} (esperado 2414999.50)`,
  );

  for (const item of list.body) {
    if (item.description.startsWith('CI ')) {
      const removed = await request('DELETE', `/transactions/${item.id}`);
      check(removed.status === 200, `DELETE movimiento ${item.id} responde ${removed.status}`);
    }
  }

  const after = await request('GET', '/transactions');
  check(Array.isArray(after.body) && after.body.length === 0, 'Tras eliminar, la tabla de movimientos queda vacía');

  const emptySummary = await request('GET', '/summary');
  check(emptySummary.body.balance === '0.00', `Balance tras limpiar = ${emptySummary.body.balance}`);

  console.log('Todas las verificaciones de la API pasaron.');
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
