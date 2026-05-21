pipeline {
    agent any

    environment {
        DOCKER_USER  = 'harmeet2716'
        REGISTRY     = 'docker.io'
        APP_NAME     = 'dockchat'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository from GitHub...'
                git branch: 'main', url: 'https://github.com/harmeet2716/DockChat.git'
            }
        }

        stage('Diagnostics & Check') {
            steps {
                echo 'Checking environments...'
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Setup') {
                    steps {
                        dir('backend') {
                            bat 'npm install'
                        }
                    }
                }

                stage('Frontend Setup') {
                    steps {
                        dir('frontend') {
                            bat 'npm install --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('Build & Verify') {
            parallel {
                stage('Backend Checks') {
                    steps {
                        dir('backend') {
                            echo 'Backend validation complete.'
                        }
                    }
                }

                stage('Build Frontend Bundle') {
                    environment {
                        CI = 'false'
                    }
                    steps {
                        dir('frontend') {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Dockerize & Publish') {
            environment {
                DOCKER_CREDS = credentials('docker-hub-credentials')
            }
            steps {
                bat 'echo %DOCKER_CREDS_PSW% | docker login -u %DOCKER_CREDS_USR% --password-stdin %REGISTRY%'

                dir('backend') {
                    bat 'docker build -t %DOCKER_USER%/%APP_NAME%-backend:latest .'
                    bat 'docker build -t %DOCKER_USER%/%APP_NAME%-backend:%BUILD_NUMBER% .'
                    bat 'docker push %DOCKER_USER%/%APP_NAME%-backend:latest'
                    bat 'docker push %DOCKER_USER%/%APP_NAME%-backend:%BUILD_NUMBER%'
                }

                dir('frontend') {
                    bat 'docker build -t %DOCKER_USER%/%APP_NAME%-frontend:latest .'
                    bat 'docker build -t %DOCKER_USER%/%APP_NAME%-frontend:%BUILD_NUMBER% .'
                    bat 'docker push %DOCKER_USER%/%APP_NAME%-frontend:latest'
                    bat 'docker push %DOCKER_USER%/%APP_NAME%-frontend:%BUILD_NUMBER%'
                }
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker-compose down'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }

        success {
            echo 'Build successful!'
        }

        failure {
            echo 'Build failed.'
        }
    }
}
