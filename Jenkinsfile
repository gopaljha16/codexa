pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "gopal161"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/codexa-frontend"
        BACKEND_IMAGE  = "${DOCKERHUB_USER}/codexa-backend"
    }

    stages {
        stage("Code") {
            steps {
                echo "Cloning repository..."
                git branch: 'main',
                    url: 'https://github.com/gopaljha16/codexa.git'
                echo "Code cloned successfully!"
            }
        }
       stage("Done clone"){
        steps{
            echo "check code if pushed and cloned sucessfully"
        }
       }
    }
}
