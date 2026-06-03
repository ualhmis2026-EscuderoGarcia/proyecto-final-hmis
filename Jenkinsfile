pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build React app') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Selenium JUnit tests') {
            steps {
                sh 'xvfb-run -a mvn -f selenium-junit/pom.xml test -Dwebdriver.gecko.driver=/var/lib/jenkins/selenium-drivers/geckodriver'
            }
            post {
                always {
                    junit 'selenium-junit/target/surefire-reports/TEST-*.xml'
                }
            }
        }
    }
}