pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1' // 替换为实际的AWS区域
        ECR_REGISTRY = '272557375378.dkr.ecr.${AWS_REGION}.amazonaws.com'
        ECR_REPOSITORY = 'lorenzo/babylon-staking-api' // 替换为实际的ECR仓库名称
        HELM_RELEASE_NAME = 'babylon-staking-api' // 替换为实际的Helm release名称
        HELM_CHART_DIR = 'babylon-staking-api'
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        GIT_CREDENTIALS = 'github-supertobby-token'
        GIT_BRANCH = 'main'
        WEBHOOK_URL = credentials('webhook-feishu-dev')
        PROJECT_DIR = '.' //代码仓库的Dockerfile目录,当前目录设置为.
        NAMESPACE = 'lorenzo'
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
                    // 登录到 AWS ECR
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """

                    // 推送 Docker 镜像到 AWS ECR
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                script {
                    //获取aws k8s kubeconfig
                    sh "aws eks update-kubeconfig --region ap-southeast-1  --name AiCluster"
                    // 使用 Helm 部署到 Kubernetes
                    git branch: GIT_BRANCH, credentialsId: GIT_CREDENTIALS, url: 'https://github.com/NeverFadeAI/helm-charts.git'
                    sh "pwd"
                    sh "ls -al"
                    sh "cd ${HELM_CHART_DIR}"
                    sh """
                    helm upgrade --install ${HELM_RELEASE_NAME} ./${HELM_CHART_DIR} \
                    --set image.tag=${IMAGE_TAG} \
                    --namespace ${NAMESPACE}
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
