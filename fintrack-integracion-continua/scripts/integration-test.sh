#!/bin/sh
# Pruebas de integración de FinTrack sobre un entorno temporal y aislado.
# Requiere CI_PROJECT (nombre único del proyecto Compose).
# La limpieza NO se hace aquí: la ejecuta el post del Jenkinsfile, incluso si esta prueba falla.
set -eu

: "${CI_PROJECT:?Defina CI_PROJECT, por ejemplo fintrack-ci-7}"

COMPOSE="docker compose -p ${CI_PROJECT} -f compose.ci.yaml"

echo ">> Levantando servicios con espera de healthchecks (máximo 180 s)"
$COMPOSE up -d --wait --wait-timeout 180

echo ">> Estado de los contenedores"
$COMPOSE ps

echo ">> Migraciones de Prisma: la tabla transactions debe existir en fintrack_ci"
$COMPOSE exec -T db psql -U fintrack -d fintrack_ci -tAc "SELECT to_regclass('public.transactions');" \
  | grep -qx transactions
echo "Tabla transactions encontrada"

echo ">> Disponibilidad del frontend"
$COMPOSE exec -T frontend node -e "fetch('http://127.0.0.1:5173/').then((r)=>{if(!r.ok){throw new Error('HTTP '+r.status)}console.log('Frontend HTTP', r.status)}).catch((e)=>{console.error(e);process.exit(1)})"

echo ">> Backend: GET /api/health, POST, GET, balance y DELETE con verificación de resultados"
$COMPOSE exec -T backend node - < scripts/integration-check.js

echo "INTEGRACIÓN EXITOSA"
