pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "gopal161"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/codexa-frontend"
        BACKEND_IMAGE  = "${DOCKERHUB_USER}/codexa-backend"
    }

    stages {

        stage("Checkout Code") {
            steps {
                echo "Cloning repository..."
                git(
                    branch: 'main',
                    url: 'https://github.com/gopaljha16/codexa.git'
                )
                echo "Code cloned successfully!"
            }
        }

        stage("Docker Login") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage("Build Docker Images") {
            steps {
                sh '''
                    docker build -t $FRONTEND_IMAGE:latest ./frontend
                    docker build -t $BACKEND_IMAGE:latest ./backend
                '''
                echo "Images built successfully"
            }
        }

        stage("Push Docker Images") {
            steps {
                sh '''
                    docker push $FRONTEND_IMAGE:latest
                    docker push $BACKEND_IMAGE:latest
                '''
                echo "Docker images pushed to Docker Hub"
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
        success {
            echo "✅ CI pipeline completed successfully"
        }
        failure {
            echo "❌ CI pipeline failed"
        }
    }
}
