// Pipeline de integración continua de FinTrack.
// Definición: "Pipeline script from SCM", rama principal, Script Path: Jenkinsfile.
// La aplicación vive en la subcarpeta fintrack-integracion-continua/.

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 45, unit: 'MINUTES')
    }

    // Poll SCM: Jenkins consulta GitHub cada ~2 minutos. No requiere exponer Jenkins a internet.
    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        APP_DIR    = 'fintrack-integracion-continua'
        // Nombre único por build: evita colisiones entre ejecuciones y con la app original.
        CI_PROJECT = "fintrack-ci-${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
                sh 'echo "Commit procesado: $(git rev-parse HEAD)"'
                echo "Rama: ${env.GIT_BRANCH}"
            }
        }

        stage('2. Validacion del entorno') {
            steps {
                sh '''
                    set -eu
                    node --version
                    npm --version
                    git --version
                    docker version --format 'Docker server: {{.Server.Version}}'
                    docker compose version
                    test -f "${APP_DIR}/compose.ci.yaml"
                    test -f "${APP_DIR}/backend/package-lock.json"
                    test -f "${APP_DIR}/frontend/package-lock.json"
                    test -f "${APP_DIR}/scripts/integration-test.sh"
                    cd "${APP_DIR}"
                    docker compose -p "${CI_PROJECT}" -f compose.ci.yaml config -q
                    echo "Configuracion de Compose valida"
                '''
            }
        }

        stage('3. Instalar dependencias') {
            steps {
                dir("${APP_DIR}/backend") {
                    sh 'npm ci'
                }
                dir("${APP_DIR}/frontend") {
                    sh 'npm ci'
                }
            }
        }

        stage('4. Pruebas backend') {
            steps {
                dir("${APP_DIR}/backend") {
                    sh 'npm run test:ci'
                }
            }
            post {
                always {
                    junit testResults: "${APP_DIR}/backend/test-results/junit.xml", allowEmptyResults: true
                }
            }
        }

        stage('5. Compilar backend') {
            steps {
                dir("${APP_DIR}/backend") {
                    sh 'npm run build'
                }
            }
        }

        stage('6. Compilar frontend') {
            steps {
                dir("${APP_DIR}/frontend") {
                    sh 'npm run build'
                }
            }
        }

        stage('7. Construir imagenes Docker') {
            steps {
                dir(APP_DIR) {
                    sh 'docker compose -p "$CI_PROJECT" -f compose.ci.yaml build'
                }
            }
        }

        stage('8. Pruebas de integracion') {
            steps {
                dir(APP_DIR) {
                    sh 'sh scripts/integration-test.sh'
                }
            }
            post {
                always {
                    dir(APP_DIR) {
                        sh 'docker compose -p "$CI_PROJECT" -f compose.ci.yaml logs --no-color > ci-logs.txt 2>&1 || true'
                        archiveArtifacts artifacts: "${APP_DIR}/ci-logs.txt", allowEmptyArchive: true
                    }
                }
            }
        }

        stage('9. Resultados y artefactos') {
            steps {
                dir("${APP_DIR}/frontend") {
                    archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
                }
                echo "Commit procesado: ${env.GIT_COMMIT}"
            }
        }
    }

    post {
        // Limpieza incondicional: solo elimina recursos de este proyecto Compose.
        // No usa docker system prune ni docker volume prune.
        always {
            dir(APP_DIR) {
                sh 'docker compose -p "$CI_PROJECT" -f compose.ci.yaml down -v --remove-orphans --rmi local || true'
            }
        }
    }
}
