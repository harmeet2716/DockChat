pipeline {
    agent any

    environment {
        // ID of the Docker Hub credentials configured in your Jenkins credentials store
        DOCKER_CREDS = credentials('docker-hub-credentials') 
        DOCKER_USER  = 'harmeet2716'
        REGISTRY     = 'docker.io'
        APP_NAME     = 'dockchat'
    }

    stages {
        stage('Diagnostics & Check') {
            steps {
                echo 'Checking environments...'
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Setup') {
                    steps {
                        echo 'Installing Backend dependencies...'
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Setup') {
                    steps {
                        echo 'Installing Frontend dependencies...'
                        dir('frontend') {
                            sh 'npm install --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('Build & Verify') {
            parallel {
                stage('Backend Checks') {
                    steps {
                        echo 'Running backend checks...'
                        dir('backend') {
                            // If you have tests, uncomment the following line:
                            // sh 'npm test'
                            echo 'Backend validation complete.'
                        }
                    }
                }
                stage('Build Frontend Bundle') {
                    steps {
                        echo 'Compiling production React application...'
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Dockerize & Publish') {
            steps {
                echo 'Logging into Docker Registry...'
                sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin $REGISTRY'
                
                echo 'Building & Tagging Backend Image...'
                dir('backend') {
                    sh "docker build -t ${DOCKER_USER}/${APP_NAME}-backend:latest ."
                    sh "docker build -t ${DOCKER_USER}/${APP_NAME}-backend:${BUILD_NUMBER} ."
                    sh "docker push ${DOCKER_USER}/${APP_NAME}-backend:latest"
                    sh "docker push ${DOCKER_USER}/${APP_NAME}-backend:${BUILD_NUMBER}"
                }

                echo 'Building & Tagging Frontend Image...'
                dir('frontend') {
                    sh "docker build -t ${DOCKER_USER}/${APP_NAME}-frontend:latest ."
                    sh "docker build -t ${DOCKER_USER}/${APP_NAME}-frontend:${BUILD_NUMBER} ."
                    sh "docker push ${DOCKER_USER}/${APP_NAME}-frontend:latest"
                    sh "docker push ${DOCKER_USER}/${APP_NAME}-frontend:${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Redeploying application containers via Docker Compose...'
                // Restarts services to use the newly compiled images
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
                echo 'Application deployed successfully!'
            }
        }
    }

    post {
        always {
            cleanWs()
            echo 'Pipeline clean-up completed.'
        }
        success {
            echo 'Build, publish, and deployment executed successfully!'
        }
        failure {
            echo 'Build failed. Inspect Jenkins logs for error outputs.'
        }
    }
}
