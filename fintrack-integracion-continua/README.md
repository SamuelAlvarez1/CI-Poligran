# FinTrack

Aplicación web de demostración para registrar ingresos y gastos en pesos colombianos. Muestra un tablero con los totales, un formulario para crear movimientos y una tabla para consultarlos o eliminarlos.

FinTrack no es un producto financiero. Su objetivo es que un estudiante pueda explicar, con un ejemplo pequeño, cómo se comunican tres contenedores Docker y cómo ese proyecto se versiona en GitHub.

## Objetivo académico

Demostrar:

- un repositorio con frontend, backend y base de datos separados;
- una API REST entre el navegador y el backend;
- PostgreSQL accesible solo desde la red de Docker;
- persistencia de datos en un volumen;
- el arranque completo con un solo comando.

## Tecnologías

- Frontend: React, Vite y TypeScript.
- Backend: Node.js, NestJS y TypeScript.
- ORM y migraciones: Prisma.
- Base de datos: PostgreSQL 16.
- Contenedores: Docker y Docker Compose.
- Moneda única: COP, guardada como `NUMERIC(18,2)`.

## Arquitectura

El navegador descarga la interfaz desde el contenedor `frontend` y llama la API en el puerto publicado del contenedor `backend`. El backend no usa `localhost` para la base de datos: usa el nombre del servicio `db`.

```text
Navegador
  |  http://localhost:5173
  v
frontend (React + Vite)
  ^
  |  el navegador llama http://localhost:3000/api
  v
backend (NestJS) ---- red Docker "fintrack" ----> db (PostgreSQL)
                                                      |
                                               volumen fintrack-db
```

```mermaid
flowchart LR
  navegador["Navegador"]
  frontend["frontend :5173"]
  backend["backend :3000"]
  db["db PostgreSQL"]
  navegador -->|"páginas" | frontend
  navegador -->|"/api" | backend
  backend -->|"hostname db" | db
```

PostgreSQL no publica ningún puerto en la máquina anfitriona. La explicación más detallada está en [docs/arquitectura.md](docs/arquitectura.md).

## Estructura

```text
fintrack-integracion-continua/
├── frontend/          React, Vite y su Dockerfile
├── backend/           NestJS, Prisma y su Dockerfile
├── docs/              Notas de arquitectura
├── evidencias/        Carpeta para capturas del informe
├── compose.yaml       Los tres servicios
├── .env.example       Valores locales de demostración
├── .gitignore
└── README.md
```

## Requisitos previos

- Docker con Docker Compose v2.
- Git, si se va a publicar el repositorio en GitHub.

No hace falta instalar Node.js ni PostgreSQL en la máquina para ejecutar la aplicación. Node.js solo se necesita si las pruebas unitarias se quieren correr fuera de Docker.

Los usuarios y contraseñas del archivo `.env.example` y de `compose.yaml` son de demostración. No deben reutilizarse en un entorno real.

## Iniciar y detener

Desde esta carpeta:

```bash
docker compose up --build -d
```

Ese comando construye las imágenes, crea la red `fintrack`, crea el volumen `fintrack-db`, aplica las migraciones de Prisma y deja los tres servicios en segundo plano.

Comprobar el estado:

```bash
docker compose ps
```

La interfaz queda en <http://localhost:5173> y la API en <http://localhost:3000>.

Ver los registros del backend, donde aparece la aplicación de migraciones:

```bash
docker compose logs backend
```

Detener los contenedores sin borrar los datos:

```bash
docker compose down
```

Volver a iniciarlos, reutilizando el volumen:

```bash
docker compose up -d
```

Borrar también la base de datos de demostración:

```bash
docker compose down -v
```

## Endpoints

Todas las rutas cuelgan de `/api`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado de la API y de la conexión con PostgreSQL |
| `GET` | `/api/transactions` | Movimientos, del más reciente al más antiguo |
| `POST` | `/api/transactions` | Crea un movimiento |
| `DELETE` | `/api/transactions/:id` | Elimina un movimiento |
| `GET` | `/api/summary` | Total de ingresos, gastos y balance |

Ejemplo de creación. El monto viaja como texto para no usar un número de punto flotante:

```bash
curl -s -X POST http://localhost:3000/api/transactions \
  -H 'Content-Type: application/json' \
  -d '{"description":"Salario","type":"INCOME","category":"Trabajo","amount":"2500000.00","date":"2026-11-10"}'
```

Los campos obligatorios son descripción, tipo, categoría, monto y fecha. El tipo solo puede ser `INCOME` o `EXPENSE`. El monto debe ser mayor que cero y tener como máximo dos decimales. Una petición inválida responde `400`. Si el movimiento a eliminar no existe, la API responde `404`.

`GET /api/summary` responde con textos decimales, por ejemplo:

```json
{"income":"2500000.00","expense":"85000.50","balance":"2414999.50"}
```

El balance es ingresos menos gastos. Puede ser negativo.

## Validar la comunicación entre servicios

1. Abrir <http://localhost:5173>. Debe verse el nombre FinTrack, tres tarjetas, el formulario y la tabla.
2. Consultar la API:

   ```bash
   curl -s http://localhost:3000/api/health
   ```

   Una respuesta correcta incluye `"database":"up"`. Eso confirma que el contenedor `backend` alcanzó al contenedor `db` por el nombre `db`.
3. Crear un ingreso y un gasto desde el formulario, o con `curl`. La tabla y las tarjetas deben actualizarse.
4. Comprobar que los tres contenedores comparten la red:

   ```bash
   docker network inspect fintrack --format '{{range .Containers}}{{.Name}} {{end}}'
   ```

   Deben aparecer `fintrack-frontend`, `fintrack-backend` y `fintrack-db`.
5. Leer la tabla desde el contenedor de PostgreSQL, sin abrir un puerto en el anfitrión:

   ```bash
   docker compose exec db psql -U fintrack -d fintrack -c 'SELECT id, description, type, amount, date FROM transactions ORDER BY date DESC;'
   ```

El navegador no llama a `http://backend:3000`. Ese nombre solo existe dentro de la red Docker. La URL configurada en el frontend es `http://localhost:3000`, que es el puerto publicado del backend.

## Comprobar la persistencia

1. Registrar al menos un movimiento.
2. Recrear los contenedores sin borrar volúmenes:

   ```bash
   docker compose down
   docker compose up -d
   ```

3. Abrir de nuevo la interfaz o consultar:

   ```bash
   curl -s http://localhost:3000/api/transactions
   ```

   El movimiento debe seguir ahí porque vive en el volumen `fintrack-db`.
4. `docker compose down -v` elimina ese volumen. Después de ese comando la tabla vuelve a quedar vacía.

## Pruebas

La prueba automática cubre el cálculo del resumen: suma de ingresos, suma de gastos, balance y el caso de los centavos. No necesita PostgreSQL.

Dentro del contenedor, cuando ya está en ejecución:

```bash
docker compose exec backend npm test
```

En una máquina con Node.js, desde `backend/`:

```bash
npm install
npm test
```

La prueba de la aplicación completa es manual y está descrita en las dos secciones anteriores: crear un ingreso, crear un gasto, revisar el balance, ver la tabla, eliminar un movimiento y reiniciar los contenedores.

## Evidencias recomendadas

Guardar las capturas en [evidencias/](evidencias/README.md):

1. Árbol del repositorio y enlace del repositorio en GitHub.
2. `compose.yaml`, con la red, el volumen y la URL `db`.
3. `docker compose ps` con los tres servicios en ejecución.
4. Inspección de la red `fintrack` con los tres contenedores.
5. Respuesta de `GET /api/health` con `"database":"up"`.
6. Pantalla de FinTrack en computador y en un ancho móvil.
7. Alta de un ingreso y de un gasto, con las tarjetas actualizadas.
8. Tabla de movimientos y eliminación de un registro.
9. La misma consulta después de `docker compose down` y `docker compose up -d`.
10. Resultado de `docker compose exec backend npm test`.

## Integración continua con Jenkins (Entrega 2)

Jenkins ejecuta, en cada cambio de la rama `main` del repositorio, las etapas de validación de FinTrack: instalación, pruebas, compilación, construcción de imágenes y pruebas de integración sobre un entorno temporal. La infraestructura de Jenkins está en `../jenkins/`, el pipeline en `../Jenkinsfile` y el entorno aislado en `compose.ci.yaml`.

### Arquitectura de Jenkins

- `../jenkins/Dockerfile`: imagen `fintrack-jenkins:lts` basada en `jenkins/jenkins:lts-jdk21` (Jenkins 2.580.2, JDK 21). Agrega Node.js 22, Docker CLI 29.9.3 y Docker Compose v5.7.0.
- `../jenkins/compose.yaml`: contenedor `fintrack-jenkins`, separado de los servicios de FinTrack. Publica solo `127.0.0.1:8080`, usa el volumen `fintrack-jenkins-home` para `JENKINS_HOME` y `restart: unless-stopped`.
- Jenkins usa el socket Docker del anfitrión para construir y levantar el entorno de pruebas.

### Requisitos

- Docker Desktop (o Docker Engine) con Compose v2 en ejecución.
- Puerto 8080 libre en la máquina.

### Comandos

Desde la raíz del repositorio:

```bash
docker compose -f jenkins/compose.yaml up -d --build   # iniciar Jenkins
docker compose -f jenkins/compose.yaml ps              # estado
docker compose -f jenkins/compose.yaml logs -f         # registros
docker compose -f jenkins/compose.yaml stop            # detener conservando la configuración
docker compose -f jenkins/compose.yaml start           # reanudar
```

Interfaz web: <http://127.0.0.1:8080>.

Contraseña inicial (no se publica aquí):

```bash
docker exec fintrack-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Plugins

| Plugin | Obligatorio | Uso |
| --- | --- | --- |
| Git | Sí | Obtener el código desde GitHub |
| Pipeline (`workflow-aggregator`) | Sí | Ejecutar `Jenkinsfile` |
| Pipeline Stage View (`pipeline-stage-view`) | Recomendado | Ver las etapas del pipeline |
| JUnit | Recomendado | Mostrar los resultados de `backend/test-results/junit.xml` |

Los cuatro plugins se instalan en la imagen con `jenkins-plugin-cli`. Credentials viene incluido en Jenkins. No se instalaron complementos de GitHub porque el repositorio es público y se usa `Poll SCM`.

### Configuración de GitHub y del job

1. Crear el job `FinTrack-CI`, de tipo **Pipeline**.
2. En **Pipeline → Definition** elegir **Pipeline script from SCM**, SCM **Git**, Repository URL `https://github.com/SamuelAlvarez1/CI-Poligran.git`, Branch `*/main`, Script Path `Jenkinsfile`.
3. En **Build Triggers** activar **Poll SCM** con el calendario `H/2 * * * *`. El `Jenkinsfile` también declara `pollSCM`; tras el primer build Jenkins aplica esa configuración.

### Etapas del pipeline

| Etapa | Qué hace |
| --- | --- |
| 1. Checkout | Obtiene el repositorio y registra el commit procesado |
| 2. Validación del entorno | Muestra versiones de Node, npm, Git, Docker y Compose; valida `compose.ci.yaml` |
| 3. Instalar dependencias | `npm ci` en backend y frontend (`postinstall` genera el cliente Prisma) |
| 4. Pruebas backend | `npm run test:ci`: pruebas en modo no interactivo y reporte JUnit |
| 5. Compilar backend | `npm run build` (TypeScript) |
| 6. Compilar frontend | `npm run build` (TypeScript y Vite) |
| 7. Construir imágenes Docker | `docker compose -p fintrack-ci-<N> -f compose.ci.yaml build` |
| 8. Pruebas de integración | `scripts/integration-test.sh`: levanta db, backend y frontend; comprueba migraciones, health, flujo de movimientos y balance |
| 9. Resultados y artefactos | Archiva `frontend/dist` y registra el commit |

Si una etapa falla, las siguientes no se ejecutan. El bloque `post` siempre se ejecuta.

### Pruebas

Ejecución local de las pruebas con reporte JUnit:

```bash
cd backend
npm run test:ci
```

Las pruebas de integración se ejecutan desde el pipeline o a mano, con un nombre de proyecto propio:

```bash
CI_PROJECT=fintrack-ci-manual sh scripts/integration-test.sh
docker compose -p fintrack-ci-manual -f compose.ci.yaml down -v --remove-orphans --rmi local
```

### Aislamiento de entornos

- `compose.ci.yaml` no define `container_name`, no publica puertos al anfitrión y usa un volumen (`ci-db`) y una red propios del proyecto.
- Cada build usa `fintrack-ci-<BUILD_NUMBER>` como nombre de proyecto. Un build no comparte contenedores ni volúmenes con otro.
- La base de datos de CI es `fintrack_ci`. La de la aplicación (`fintrack`, volumen `fintrack-db`) no se modifica.
- La limpieza usa `down -v --remove-orphans --rmi local` con el nombre del proyecto. No se usan `docker system prune` ni `docker volume prune`.

### Detección automática de cambios

`Poll SCM` consulta GitHub cada dos minutos y lanza un build cuando detecta un commit nuevo en la rama. Jenkins no necesita recibir conexiones desde internet. Un webhook sería más inmediato, pero requiere una URL pública (por ejemplo un túnel), y eso queda fuera del alcance académico de esta entrega.

### Consideraciones de seguridad

- El socket `/var/run/docker.sock` da privilegios elevados sobre el motor Docker del anfitrión. Su uso está limitado a este entorno académico local.
- Jenkins solo escucha en `127.0.0.1`. No se desactivó el asistente de configuración inicial ni ningún mecanismo de seguridad.
- Las credenciales de `compose.ci.yaml` y `.env.example` son de demostración y no deben reutilizarse.

### Solución de problemas

- **`permission denied` al usar Docker dentro de Jenkins:** ajustar el GID del grupo del socket: `DOCKER_GID=$(stat -f %g /var/run/docker.sock) docker compose -f jenkins/compose.yaml up -d`.
- **Puerto 8080 ocupado:** cambiar la publicación en `jenkins/compose.yaml`, por ejemplo `127.0.0.1:8081:8080`.
- **Integración que no llega a `healthy`:** revisar `ci-logs.txt` en el artefacto del build, o ejecutar `docker compose -p <proyecto> -f compose.ci.yaml logs backend`.

### Detener Jenkins

```bash
docker compose -f jenkins/compose.yaml stop     # conserva la configuración y los jobs
docker compose -f jenkins/compose.yaml down     # elimina el contenedor; el volumen fintrack-jenkins-home se conserva
```

Eliminar también la configuración de Jenkins (irreversible): `docker compose -f jenkins/compose.yaml down -v`.
