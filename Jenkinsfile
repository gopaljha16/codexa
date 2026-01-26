pipeline {
    agent any

    options {
        cleanWs()   // clean workspace before each build
    }

    
    environment {
        DOCKERHUB_USER = "gopal161"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/codexa-frontend"
        BACKEND_IMAGE  = "${DOCKERHUB_USER}/codexa-backend"
    }

    triggers {
        githubPush()   // webhook trigger
    }

    stages {
       stage('Checkout Code') {
            steps {
                checkout scm   // <-- CLONE happens here
            }
        }
       stage("Done clone"){
        steps{
            echo "check code if pushed and cloned sucessfully"
        }
       }
    }
}
