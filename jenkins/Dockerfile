# Jenkins para la demostración de integración continua de FinTrack.
# Es infraestructura separada de los contenedores de la aplicación.
#
# Incluye: Jenkins LTS con JDK 21, Git, Docker CLI, plugin Docker Compose y Node.js 22.
# Node.js se copia desde la imagen oficial node:22 para usar una versión fija
# sin instalar paquetes manuales.

ARG JENKINS_IMAGE=jenkins/jenkins:lts-jdk21
ARG NODE_IMAGE=node:22-bookworm-slim

FROM ${NODE_IMAGE} AS node

FROM ${JENKINS_IMAGE}

ARG TARGETARCH
ARG DOCKER_VERSION=29.9.3
ARG COMPOSE_VERSION=v5.7.0

USER root

COPY --from=node /usr/local/ /usr/local/

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) DOCKER_ARCH=x86_64 ;; \
      arm64) DOCKER_ARCH=aarch64 ;; \
      *) echo "Arquitectura no soportada: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl; \
    rm -rf /var/lib/apt/lists/*; \
    curl -fsSL "https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-${DOCKER_VERSION}.tgz" -o /tmp/docker.tgz; \
    tar -xzf /tmp/docker.tgz -C /tmp; \
    install -m 0755 /tmp/docker/docker /usr/local/bin/docker; \
    rm -rf /tmp/docker /tmp/docker.tgz; \
    mkdir -p /usr/local/lib/docker/cli-plugins; \
    curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
      -o /usr/local/lib/docker/cli-plugins/docker-compose; \
    chmod 0755 /usr/local/lib/docker/cli-plugins/docker-compose; \
    node --version; \
    npm --version; \
    docker --version; \
    docker compose version

# Plugins mínimos: Git, Pipeline (workflow-aggregator), visualización de etapas y reportes JUnit.
RUN jenkins-plugin-cli --plugins git workflow-aggregator pipeline-stage-view junit

USER jenkins
