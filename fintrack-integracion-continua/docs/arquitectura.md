# Arquitectura de los tres contenedores

FinTrack usa un solo archivo, `compose.yaml`, para definir la red, el volumen y los tres servicios.

## Quién habla con quién

- El contenedor `frontend` solo entrega la aplicación React. No consulta PostgreSQL y no contiene la lógica del balance.
- El navegador, que corre fuera de Docker, pide la interfaz a `http://localhost:5173` y los datos a `http://localhost:3000`.
- El contenedor `backend` escucha en el puerto 3000 dentro de la red y ese puerto se publica en el anfitrión.
- El contenedor `db` no publica puertos. Solo acepta conexiones que llegan por la red `fintrack`.
- La variable `DATABASE_URL` del backend usa el host `db`, que es el nombre DNS del servicio. Si se cambiara por `localhost`, el backend buscaría PostgreSQL dentro de su propio contenedor y no lo encontraría.

## Arranque

1. PostgreSQL inicia y su healthcheck ejecuta `pg_isready`.
2. El backend espera a que ese healthcheck esté sano.
3. Antes de abrir la API, el entrypoint ejecuta `prisma migrate deploy`. Si la base todavía no acepta conexiones, reintenta durante un minuto.
4. NestJS empieza a escuchar y su healthcheck consulta `GET /api/health`.
5. El frontend espera a que el backend esté sano y publica el puerto 5173.

## Datos

La tabla única se llama `transactions`. El monto es `DECIMAL(18,2)`. El cálculo del balance se hace con centavos enteros en el backend, no con números de punto flotante.

El volumen se llama `fintrack-db` y está montado en `/var/lib/postgresql/data`. Por eso los movimientos sobreviven a `docker compose down` y a un nuevo `docker compose up -d`.

## CORS

El backend solo acepta el origen `http://localhost:5173`. Otro origen recibe el bloqueo del navegador. Las pruebas con `curl` no envían ese origen y no quedan afectadas por CORS.
