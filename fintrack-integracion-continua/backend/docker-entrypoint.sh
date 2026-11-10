#!/bin/sh
set -eu

echo "Aplicando migraciones de Prisma..."
attempt=1
max_attempts=30

while true; do
  if output=$(./node_modules/.bin/prisma migrate deploy 2>&1); then
    printf '%s\n' "$output"
    break
  fi

  printf '%s\n' "$output"

  if ! printf '%s' "$output" | grep -Eq "P1001|Can't reach database server|ECONNREFUSED|timeout"; then
    echo "La migración falló por un error distinto a la disponibilidad de PostgreSQL."
    exit 1
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "PostgreSQL no estuvo disponible a tiempo."
    exit 1
  fi

  echo "PostgreSQL no responde. Reintento ${attempt}/${max_attempts}..."
  attempt=$((attempt + 1))
  sleep 2
done

echo "Migraciones aplicadas. Iniciando la API..."
exec node dist/main.js
