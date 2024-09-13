pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'
        ECR_REGISTRY = '272557375378.dkr.ecr.${AWS_REGION}.amazonaws.com'
        ECR_REPOSITORY = 'tomo/babylon-staking'
        HELM_RELEASE_NAME = 'babylon-staking'
        HELM_CHART_DIR = 'babylon-staking'
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        GIT_CREDENTIALS = 'github-supertobby-token'
        GIT_BRANCH = 'main'
        WEBHOOK_URL = credentials('webhook-feishu-dev')
        PROJECT_DIR = '.'
        NAMESPACE = 'tomo'
    }


    stages {

        stage('Set Image Tag') {
            steps {
                script {
                    IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    DOCKER_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -f ${PROJECT_DIR}/Dockerfile -t ${DOCKER_IMAGE} ."
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """

                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                script {
                    sh "aws eks update-kubeconfig --region ap-southeast-1  --name AiCluster"
                    git branch: GIT_BRANCH, credentialsId: GIT_CREDENTIALS, url: 'https://github.com/NeverFadeAI/helm-charts.git'
                    sh "cd ${HELM_CHART_DIR}"
                    sh """
                    helm upgrade --install ${HELM_RELEASE_NAME} ./${HELM_CHART_DIR} \
                    --set image.tag=${IMAGE_TAG} \
                    --namespace ${NAMESPACE} \
                    --create-namespace
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                def buildStatus = currentBuild.currentResult
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def buildTime = new Date().format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone('UTC'))

                def payload = """
                {
                    "msg_type": "post",
                    "content": {
                        "post": {
                            "zh_cn": {
                                "title": "jenkins build ",
                                "content": [
                                    [{
                                            "tag": "text",
                                            "text": "job: ${jobName}\\n"
                                        },
                                        {
                                            "tag": "text",
                                            "text": "status: ${buildStatus}\\n"
                                        },
                                        {
                                            "tag": "text",
                                            "text": "github branch: ${GIT_BRANCH}\\n"
                                        },
                                        {
                                            "tag": "text",
                                            "text": "time: ${buildTime}\\n"
                                        },
                                        {
                                            "tag": "text",
                                            "text": "number: ${buildNumber}\\n"
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                }
                """
                httpRequest(
                    acceptType: 'APPLICATION_JSON',
                    contentType: 'APPLICATION_JSON',
                    httpMode: 'POST',
                    requestBody: payload,
                    url: WEBHOOK_URL
                )
            }
            cleanWs()
        }
    }
}
