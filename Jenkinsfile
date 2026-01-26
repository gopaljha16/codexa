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
                git branch: 'main',
                    url: 'https://github.com/gopaljha16/codexa.git'
                echo "Code cloned successfully!"
            }
        }

        stage("Docker Login") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',   // 👈 make sure this exists
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

 
    }


}
