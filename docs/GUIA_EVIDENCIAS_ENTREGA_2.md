# Guía de evidencias – Entrega 2 (Jenkins e integración continua)

Proyecto: FinTrack · Asignatura: Integración Continua · Politécnico Grancolombiano
Repositorio: https://github.com/SamuelAlvarez1/CI-Poligran

Orden cronológico de ejecución. Cada figura indica si la evidencia es **[AUTOMÁTICA]** (la genera el pipeline o un comando) o **[MANUAL]** (requiere interacción en el navegador o en GitHub).

**Antes de capturar:** oculte cualquier contraseña, token o valor de `initialAdminPassword` que aparezca en pantalla. Las credenciales de `compose.ci.yaml` y `.env.example` son de demostración; aun así, es recomendable no mostrarlas en primer plano.

Todas las carpetas de capturas van en `evidencias/` (ver [evidencias/README.md](../fintrack-integracion-continua/evidencias/README.md)).

---

## Instalación de Jenkins

### Figura 1 – Dockerfile y Docker Compose de Jenkins
- **Acción:** abrir los archivos en el editor.
- **Pantalla:** `jenkins/Dockerfile` y `jenkins/compose.yaml`.
- **Debe aparecer:** `FROM jenkins/jenkins:lts-jdk21`, instalación de Docker CLI 29.9.3 y Compose v5.7.0, `127.0.0.1:8080:8080` y `/var/run/docker.sock`.
- **Resultado esperado:** configuración que separa Jenkins de FinTrack.
- **Qué demuestra:** Jenkins se define como infraestructura versionada.
- **Nombre sugerido:** `fig01_dockerfile_compose_jenkins.png`
- **Tipo:** [MANUAL]

### Figura 2 – Construcción de la imagen Docker
- **Acción:** `docker build -t fintrack-jenkins:lts jenkins/`
- **Pantalla:** terminal.
- **Debe aparecer:** las líneas `node --version` (v22.23.5), `docker --version` (29.9.3), `docker compose version` (v5.7.0) y `Done` de `jenkins-plugin-cli`, con `DONE` al final.
- **Resultado esperado:** imagen `fintrack-jenkins:lts` creada.
- **Qué demuestra:** las herramientas quedan fijadas dentro de la imagen.
- **Nombre sugerido:** `fig02_build_imagen_jenkins.png`
- **Tipo:** [AUTOMÁTICA] (salida del comando)

### Figura 3 – Contenedor Jenkins en ejecución
- **Acción:** `docker compose -f jenkins/compose.yaml ps`
- **Pantalla:** terminal.
- **Debe aparecer:** `fintrack-jenkins`, `Up ... ` y `127.0.0.1:8080->8080/tcp`.
- **Resultado esperado:** Jenkins escucha solo en la máquina local.
- **Nombre sugerido:** `fig03_contenedor_jenkins_ps.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 4 – Pantalla inicial de Jenkins
- **Acción:** abrir <http://127.0.0.1:8080>, pegar la contraseña inicial obtenida con `docker exec fintrack-jenkins cat /var/jenkins_home/secrets/initialAdminPassword`, y capturar la pantalla de desbloqueo **sin** mostrar la contraseña.
- **Pantalla:** "Unlock Jenkins" (antes de escribir la contraseña) o la pantalla de inicio posterior.
- **Debe aparecer:** el título Unlock Jenkins y la ruta del archivo de contraseña, sin el valor.
- **Resultado esperado:** Jenkins 2.580.2 instalado y accesible.
- **Nombre sugerido:** `fig04_pantalla_inicial_jenkins.png`
- **Tipo:** [MANUAL]

### Figura 5 – Instalación de complementos
- **Acción:** en el asistente elegir **Install suggested plugins** o, si ya están en la imagen, verificar en **Manage Jenkins → Plugins → Installed**.
- **Pantalla:** lista de plugins instalados.
- **Debe aparecer:** Git, Pipeline, Pipeline Stage View y JUnit.
- **Resultado esperado:** complementos obligatorios disponibles.
- **Nombre sugerido:** `fig05_plugins_instalados.png`
- **Tipo:** [MANUAL]

### Figura 6 – Panel principal de Jenkins
- **Acción:** abrir el panel principal después del asistente.
- **Pantalla:** Dashboard de Jenkins.
- **Resultado esperado:** Jenkins listo para crear el job.
- **Nombre sugerido:** `fig06_panel_principal_jenkins.png`
- **Tipo:** [MANUAL]

---

## Configuración del pipeline

### Figura 7 – Archivo Jenkinsfile
- **Acción:** abrir `Jenkinsfile` en el editor.
- **Pantalla:** `Jenkinsfile` en la raíz del repositorio.
- **Debe aparecer:** `pollSCM('H/2 * * * *')`, las nueve etapas con nombres numerados y el bloque `post { always { ... } }` con `down -v --remove-orphans --rmi local`.
- **Nombre sugerido:** `fig07_jenkinsfile.png`
- **Tipo:** [MANUAL]

### Figura 8 – Jenkinsfile publicado en GitHub
- **Acción:** abrir el repositorio en GitHub, rama `main`, y mostrar `Jenkinsfile`.
- **Pantalla:** <https://github.com/SamuelAlvarez1/CI-Poligran>.
- **Resultado esperado:** el archivo aparece en la rama principal después de publicar el cambio.
- **Estado actual:** **PENDIENTE DE PUBLICACIÓN.** Los cambios están en la rama local `ci/jenkins-integracion-continua` y no se han subido a GitHub.
- **Tipo:** [MANUAL] (requiere push autorizado)

### Figura 9 – Creación del proyecto FinTrack-CI
- **Acción:** **New Item** → nombre `FinTrack-CI` → tipo **Pipeline** → **OK**.
- **Pantalla:** formulario de creación del job.
- **Debe aparecer:** el nombre `FinTrack-CI` y el tipo Pipeline seleccionado.
- **Nombre sugerido:** `fig09_creacion_fintrack_ci.png`
- **Tipo:** [MANUAL]

### Figura 10 – Configuración del repositorio, rama y Jenkinsfile
- **Acción:** en **Pipeline**, elegir **Pipeline script from SCM** → **Git** → URL `https://github.com/SamuelAlvarez1/CI-Poligran.git` → Branch `*/main` → Script Path `Jenkinsfile`.
- **Pantalla:** sección Pipeline de la configuración del job.
- **Nombre sugerido:** `fig10_configuracion_scm_rama_jenkinsfile.png`
- **Tipo:** [MANUAL]

### Figura 11 – Configuración de Poll SCM
- **Acción:** en **Build Triggers**, activar **Poll SCM** con `H/2 * * * *` → **Save**.
- **Pantalla:** sección Build Triggers.
- **Debe aparecer:** `H/2 * * * *`.
- **Resultado esperado:** Jenkins consulta el repositorio cada dos minutos.
- **Nombre sugerido:** `fig11_poll_scm.png`
- **Tipo:** [MANUAL]

---

## Ejecución del pipeline

### Figura 12 – Primera ejecución del pipeline
- **Acción:** **Build Now** en `FinTrack-CI`.
- **Pantalla:** lista de builds, con el número del primer build.
- **Resultado esperado:** build `#1` en estado SUCCESS o FAILURE según el resultado real.
- **Nombre sugerido:** `fig12_primera_ejecucion.png`
- **Tipo:** [MANUAL]

### Figura 13 – Visualización general de las etapas
- **Acción:** abrir el build y la vista **Pipeline Stage View**.
- **Debe aparecer:** las nueve etapas con su duración y estado.
- **Nombre sugerido:** `fig13_stage_view.png`
- **Tipo:** [MANUAL]

### Figura 14 – Resultados de las pruebas automatizadas
- **Acción:** abrir **Test Result** del build.
- **Debe aparecer:** 6 pruebas (4 de resumen financiero y 2 de monto positivo) con el número de exitosas y fallidas.
- **Verificación local ya realizada:** `npm run test:ci` ejecutó 6 pruebas, 6 exitosas, 0 fallidas, y generó `test-results/junit.xml`.
- **Nombre sugerido:** `fig14_resultados_pruebas.png`
- **Tipo:** [AUTOMÁTICA] en Jenkins; [MANUAL] la captura.

### Figura 15 – Compilación del backend
- **Acción:** abrir la consola de la etapa **5. Compilar backend**.
- **Debe aparecer:** `tsc -p tsconfig.build.json` sin errores de TypeScript.
- **Nombre sugerido:** `fig15_compilacion_backend.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 16 – Compilación del frontend
- **Acción:** abrir la consola de la etapa **6. Compilar frontend**.
- **Debe aparecer:** `vite build`, `built in ...` y los archivos de `dist/`.
- **Verificación local ya realizada:** `npm run build` del frontend terminó con `✓ built in 518ms`.
- **Nombre sugerido:** `fig16_compilacion_frontend.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 17 – Construcción de imágenes Docker
- **Acción:** abrir la consola de la etapa **7. Construir imagenes Docker**.
- **Debe aparecer:** `Image fintrack-ci-<N>-backend Built` y `Image fintrack-ci-<N>-frontend Built`.
- **Nombre sugerido:** `fig17_build_imagenes_docker.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 18 – Ejecución de las pruebas de integración
- **Acción:** abrir la consola de la etapa **8. Pruebas de integracion**.
- **Debe aparecer:** `Levantando servicios`, `Container ... Healthy` para db, backend y frontend, y la línea `INTEGRACIÓN EXITOSA`.
- **Verificación local ya realizada:** `sh scripts/integration-test.sh` con `CI_PROJECT=fintrack-ci-1` terminó con código 0 y `INTEGRACIÓN EXITOSA`.
- **Nombre sugerido:** `fig18_pruebas_integracion.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 19 – Comprobación de salud de la API y PostgreSQL
- **Acción:** en la consola de la etapa 8, localizar las líneas de verificación.
- **Debe aparecer:** `OK   GET /api/health -> status=ok, database=up` y `Tabla transactions encontrada`.
- **Nombre sugerido:** `fig19_health_api_postgresql.png`
- **Tipo:** [AUTOMÁTICA]

### Figura 20 – Resultado final SUCCESS
- **Acción:** abrir el build y capturar el estado final.
- **Debe aparecer:** `Finished: SUCCESS` en la consola o el icono verde del build.
- **Estado actual:** **PENDIENTE DE EJECUCIÓN EN JENKINS.** Las etapas se ejecutaron localmente con los mismos comandos; el pipeline en Jenkins aún no se ha lanzado.
- **Nombre sugerido:** `fig20_resultado_success.png`
- **Tipo:** [AUTOMÁTICA]

---

## Detección y corrección de errores

> **Advertencia:** los escenarios B y C requieren una rama de prueba publicada en GitHub. No se han realizado. Ver el informe técnico, sección "Pendientes".

### Figura 21 – Commit que desencadena una ejecución automática
- **Acción:** publicar un commit de prueba en `main` (solo con autorización) y mostrar el commit en GitHub.
- **Nombre sugerido:** `fig21_commit_disparador.png`
- **Tipo:** [MANUAL]. **PENDIENTE DE AUTORIZACIÓN.**

### Figura 22 – Evidencia de que Jenkins detectó el cambio
- **Acción:** en Jenkins, mostrar el build nuevo con la causa **Started by an SCM change**.
- **Nombre sugerido:** `fig22_deteccion_cambio.png`
- **Tipo:** [AUTOMÁTICA] en Jenkins; [MANUAL] la captura. **PENDIENTE.**

### Figura 23 – Pipeline fallido por una prueba controlada
- **Acción:** en una rama de pruebas (no en `main`), introducir un fallo temporal en `calculate-summary.test.ts`, publicar la rama y ejecutar el build.
- **Debe aparecer:** etapa 4 en rojo, `FAILURE` y las etapas 5 a 9 sin ejecutar.
- **Nombre sugerido:** `fig23_pipeline_fallido.png`
- **Tipo:** [MANUAL]. **PENDIENTE.**

### Figura 24 – Log donde se identifique la causa del fallo
- **Acción:** abrir la consola de la etapa 4 y localizar la prueba que falló.
- **Nombre sugerido:** `fig24_log_causa_fallo.png`
- **Tipo:** [AUTOMÁTICA] en Jenkins; [MANUAL] la captura. **PENDIENTE.**

### Figura 25 – Commit que corrige el error
- **Acción:** revertir el cambio temporal en la rama de pruebas, publicar el commit y mostrar el historial.
- **Nombre sugerido:** `fig25_commit_correccion.png`
- **Tipo:** [MANUAL]. **PENDIENTE.**

### Figura 26 – Pipeline exitoso después de la corrección
- **Acción:** mostrar el build posterior a la corrección con `Finished: SUCCESS`.
- **Nombre sugerido:** `fig26_pipeline_exitoso_correccion.png`
- **Tipo:** [MANUAL]. **PENDIENTE.**

### Figura 27 – Historial de ejecuciones de Jenkins
- **Acción:** abrir la página principal del job `FinTrack-CI` con la lista de builds.
- **Debe aparecer:** los builds con su resultado (SUCCESS y FAILURE).
- **Nombre sugerido:** `fig27_historial_ejecuciones.png`
- **Tipo:** [MANUAL]. **PENDIENTE.**

---

## Limpieza de evidencias

Después de cada build, comprobar que no quedan recursos temporales:

```bash
docker ps -a --filter "name=fintrack-ci-" --format '{{.Names}}'
docker volume ls --filter "name=fintrack-ci-" -q
docker network ls --filter "name=fintrack-ci-" -q
```

Todos los comandos deben devolver salida vacía. Esta comprobación es una evidencia adicional de la limpieza.
