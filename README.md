# SRE Portfolio - Giants Performance Dashboard

## Overview

読売ジャイアンツのチーム成績を可視化するWebアプリケーションを題材として、
AWS /Kubernetesを中心としたインフラ構築、IaC、CI/CD、Observability、Alerting、負荷試験、障害試験までを実践するために構築したSREポートフォリオです。
アプリケーションを動作させるだけではなく、本番運用を想定して以下を実装・検証しています。

-   TerraformによるAWSインフラのIaC化
-   Amazon EKSによるコンテナオーケストレーション
-   GitHub ActionsによるコンテナBuild / Deploy
-   Prometheus / Grafanaによるメトリクス監視
-   Loki / Promtailによるログ収集・可視化
-   PrometheusRule / Alertmanagerによる障害検知・外部通知
-   k6による負荷試験
-   意図的な障害発生による監視・復旧フローの検証

個人開発環境のため実サービスとして常時稼働させるのではなく、AWS利用料金を考慮し、検証時にTerraformで環境を構築し、検証終了後に削除できる構成としています。

## Architecture

``` text
                              Internet
                                  │
                                  ▼
                      Application Load Balancer
                          (ALB Ingress)
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
        Frontend Service                  Backend Service
                 │                                 │
                 ▼                                 ▼
       Next.js Pods × 2                  FastAPI Pods × 2
                                                   │
                                                   ▼
                                               RDS MySQL

                         AWS / VPC

              ┌─────────────────────────────────────┐
              │             Public Subnets          │
              │                                     │
              │     ALB        NAT Gateway          │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │            Private Subnets          │
              │                                     │
              │   EKS Worker Nodes     RDS MySQL    │
              └─────────────────────────────────────┘

                         CI/CD

                       GitHub
                          │
                          ▼
                    GitHub Actions
                          │
                    Docker Build
                          │
                          ▼
                     Amazon ECR
                          │
                          ▼
                         EKS

                  Observability / Alerting

                 Kubernetes / Application
                          │
               ┌──────────┴──────────┐
               │                     │
               ▼                     ▼
           Prometheus             Promtail
               │                     │
          ┌────┴────┐                ▼
          │         │               Loki
          ▼         ▼                │
       Grafana  Alertmanager         ▼
                    │             Grafana
                    ▼
              Email Notification
```

## Technology Stack

  Category                  Technology
  ------------------------- -------------------------------
  Cloud                     AWS
  Container Orchestration   Amazon EKS / Kubernetes
  Infrastructure as Code    Terraform
  Load Balancer             AWS Application Load Balancer
  Container Registry        Amazon ECR
  Database                  Amazon RDS for MySQL
  Frontend                  React / Next.js
  Backend                   FastAPI / Python
  Container                 Docker
  CI/CD                     GitHub Actions
  Metrics                   Prometheus
  Visualization             Grafana
  Logging                   Loki / Promtail
  Alerting                  PrometheusRule / Alertmanager
  Load Testing              k6
  Version Control           Git / GitHub

## Application

読売ジャイアンツのチーム成績を表示するWebダッシュボードです。
FrontendをReact / Next.js、Backend APIをFastAPIで構築し、BackendからRDSMySQLへアクセスします。
ALB Ingressによるパスベースルーティングを行い、FrontendとBackendAPIを同一のエントリーポイントから利用できる構成としています。
本プロジェクトではアプリケーション機能そのものよりも、
アプリケーションを安定して提供するためのインフラ設計・自動化・監視・障害検知・検証を主な対象としています。

## Infrastructure

AWSインフラストラクチャはTerraformで構築・管理しています。
VPC内に2つのAvailability Zoneを使用し、それぞれPublic Subnet / PrivateSubnetを配置しています。

``` text
VPC (10.0.0.0/16)

├── ap-northeast-1a
│   ├── Public Subnet  (10.0.1.0/24)
│   └── Private Subnet (10.0.11.0/24)
│
└── ap-northeast-1c
    ├── Public Subnet  (10.0.2.0/24)
    └── Private Subnet (10.0.12.0/24)
```

EKS Worker NodeはPrivate Subnetへ配置し、外部への通信はPublicSubnet上のNAT Gatewayを経由します。
RDS MySQLについてもPrivateSubnetへ配置し、インターネットから直接アクセスできない構成としています。
Terraformで管理している主要なAWSリソースは以下です。

-   VPC
-   Public / Private Subnet
-   Internet Gateway
-   NAT Gateway
-   Elastic IP
-   Route Table
-   Amazon EKS
-   EKS Managed Node Group
-   Amazon ECR
-   Amazon RDS for MySQL
-   IAM Role / Policy
-   Security Group

### Amazon EKS

Amazon EKS Managed Node Groupを2つのPrivate Subnetに配置しています。
Worker Nodeを複数Availability ZoneのPrivateSubnetへ配置し、単一Subnetへ依存しない構成としています。

  Setting         Value
  --------------- ----------
  Instance Type   t3.small
  Minimum Nodes   2
  Desired Nodes   3
  Maximum Nodes   5

### Amazon RDS

BackendのデータストアとしてAmazon RDS for MySQLを利用しています。
RDSはPrivate Subnetへ配置し、`publicly_accessible = false`とすることでインターネットから直接アクセスできない構成としています。

  Setting          Value
  ---------------- -------------
  Engine           MySQL 8.0
  Instance Class   db.t3.micro
  Storage          20 GB gp2
  Public Access    Disabled
  Multi-AZ         Disabled

### Amazon ECR

Frontend / BackendそれぞれにAmazon ECR Repositoryを作成しています。
コンテナイメージpush時にはImageScanを実行するよう、以下を設定しています。

``` hcl
image_scanning_configuration {
  scan_on_push = true
}
```

## Kubernetes

Frontend / BackendをAmazon EKS上で稼働させています。

### Deployment

Frontend / Backendをそれぞれ2 Replicaで構成しています。
DeploymentにはRollingUpdate Strategyを設定しています。

  Component   Framework           Container Port   Replicas
  ----------- ----------------- ---------------- ----------
  Frontend    React / Next.js               3000          2
  Backend     FastAPI                       8000          2

### Health Check

Frontend / Backendそれぞれに以下のProbeを設定しています。
Backendでは `/health` Endpoint、Frontendでは `/`を利用して状態を確認しています。
起動途中やReady状態ではないPodへのトラフィック送信を防止し、異常状態となったコンテナをKubernetesによって再起動できる構成としています。

``` text
startupProbe
    └─ アプリケーションの起動確認
readinessProbe
    └─ トラフィックを受け付けられる状態か確認
livenessProbe
    └─ コンテナが正常に動作しているか確認
```

### Resource Management

Frontend / BackendにCPU / Memoryのrequests・limitsを設定しています。
これらの値はKubernetes上でのリソース管理だけでなく、PrometheusによるCPU/ Memory Alertの基準にも利用しています。

### ConfigMap / Secret

BackendのDatabase接続情報について、非機密情報と認証情報を分離しています。
認証情報をDeployment Manifestへ直接記述しない構成としています。

``` text
ConfigMap
├── DB_HOST
├── DB_PORT
└── DB_NAME

Secret
├── DB_USER
└── DB_PASSWORD
```

## Ingress

AWS Load Balancer Controllerを利用し、KubernetesIngressからinternet-facing Application Load Balancerを利用しています。
ALBからPodへの転送にはIP Target Modeを使用しています。
パスベースでFrontend /Backendへルーティングします。本ポートフォリオではHTTP（Port80）で公開しています。

``` text
ALB
 │
 ├── /health
 ├── /team-metrics
 ├── /alerts
 ├── /alert-rules
 └── /alert-history
 │        ↓
 │   Backend Service
 │        ↓
 │   Backend Pods
 │
 └── /
          ↓
     Frontend Service
          ↓
     Frontend Pods
```

## CI/CD

Frontend / BackendそれぞれにGitHub Actions Workflowを用意しています。
本環境ではAWSリソースを常時稼働させていないため、自動デプロイではなく`workflow_dispatch` による手動実行方式としています。
Frontend / BackendのWorkflowを分離し、それぞれ個別にBuild /Deployできる構成としています。
Deploymentの再起動後には `kubectl rollout status`を実行し、Rolloutの完了をWorkflow内で確認しています。
AWS認証情報、AWS Account ID、EKS Cluster NameなどはGitHubSecretsから取得し、Workflowへ直接記述しない構成としています。

### Deployment Flow

``` text
GitHub Actions
      ↓
Source Code Checkout
      ↓
AWS Authentication
      ↓
Amazon ECR Login
      ↓
Docker Build
      ↓
Docker Push
      ↓
Amazon ECR
      ↓
EKS kubeconfig Update
      ↓
kubectl rollout restart
      ↓
kubectl rollout status
```

## Observability

### Metrics - Prometheus / Grafana

kube-prometheus-stackを利用し、Prometheus / Grafanaを導入しています。
PrometheusでKubernetesおよびPodのメトリクスを収集し、GrafanaDashboardから状態を確認できる構成としています。
主な監視対象は以下です。

-   Pod / Deploymentの状態
-   CPU使用量
-   Memory使用量
-   Kubernetesリソースの状態

### Logging - Loki / Promtail

Kubernetes上のログを収集・確認するため、Loki /Promtailを導入しています。
Grafanaから収集したログを確認できる構成としています。

## Alerting

PrometheusRuleとAlertmanagerを利用し、Kubernetes上の障害や高負荷状態を検知してメール通知する仕組みを構築しています。
Alerting Pipelineは以下です。Alertmanagerでは `warning` / `critical`のAlertをメールへ通知するよう設定しています。
また `sendResolved: true`を設定し、障害発生時だけでなく復旧時にも通知します。

``` text
PrometheusRule
      ↓
Prometheus
      ↓
Pending / Firing
      ↓
Alertmanager
      ↓
Email Notification
```

### Alerting Verification

Backend / Frontend Deploymentを意図的に停止し、Deployment UnavailableAlertの動作を確認しています。
これにより、障害発生 → 検知 → 通知 → 復旧 → 復旧通知までのAlertingPipelineをE2Eで検証しています。

``` text
Deployment停止
      ↓
Prometheus
      ↓
Pending
      ↓
Firing
      ↓
Alertmanager
      ↓
障害発生メール
      ↓
Deployment復旧
      ↓
Resolved
      ↓
復旧メール
```

## Load Testing

負荷試験にはk6を使用しています。
通常時のAPI負荷試験に加え、Prometheusで設定したCPUAlertが実際に発火することを確認するための負荷試験を実施しています。
CPUAlertについては、k6による継続的なリクエストで負荷を発生させ、設定した閾値を超えた状態が継続した際にAlertがFiringすることを確認しました。
MemoryAlertについても、検証時のみ一時的に閾値を変更してFiringを確認し、検証後に本来の閾値へ戻しています。

## Failure Testing

監視・Alertingが実際の障害時に機能することを確認するため、意図的な障害試験を実施しています。
確認した主な内容は以下です。

-   Backend Deployment停止時の障害検知
-   Frontend Deployment停止時の障害検知
-   Prometheus AlertのPending → Firing遷移
-   Deployment復旧後のAlert解消
-   Alertmanagerによる障害発生通知
-   Alertmanagerによる復旧通知
-   k6によるCPU Alert発火
-   Memory Alertの発火条件確認

## SRE Design Decisions

### 1. Infrastructure as Code

AWSリソースをTerraformで管理し、環境をコードから再構築できるようにしています。

### 2. Private Subnet

EKS Worker NodeおよびRDSをPrivate Subnetへ配置しています。
特にRDSはPublicAccessを無効化し、インターネットから直接接続できない構成としています。

### 3. Application Health

Kubernetesのstartup / readiness / livenessProbeを利用し、アプリケーションの起動状態、トラフィック受付可否、生存状態を個別に確認しています。

### 4. Resource Management

CPU / Memoryのrequests・limitsを設定し、KubernetesのScheduling /Resource ManagementとPrometheus Alertの両方に利用しています。

### 5. Observability

MetricsとLogsをそれぞれ、下記の流れで確認できるようにしています。

``` text
Metrics → Prometheus → Grafana
Logs    → Promtail → Loki → Grafana
```

### 6. Alerting

監視データを可視化するだけではなく、運用者が異常を認識できるようAlertmanagerによる外部通知を実装しています。
さらに障害発生時のFiring通知だけでなく、復旧時のResolved通知まで確認しています。

### 7. Verification

監視設定が実際に機能することを確認するため、k6による負荷試験やDeployment停止による障害試験を実施しています。

## Security

### IAM / IRSA

Amazon EKSからAWSリソースへアクセスするためのIAMRoleを、用途ごとに分離しています。

#### EKS Cluster

EKS Clusterには専用のIAM Roleを作成し、以下のAWS ManagedPolicyを付与しています。

``` text
EKS Cluster
    ↓
giants-role-eks-cluster
    ↓
AmazonEKSClusterPolicy
```

#### EKS Worker Node

EKS Managed Node Groupについても専用のIAMRoleを作成し、以下のPolicyを付与しています。
ECRについてはReadOnly Policyとし、WorkerNodeにはコンテナイメージの取得に必要な権限のみを付与しています。

-   AmazonEKSWorkerNodePolicy
-   AmazonEKS_CNI_Policy
-   AmazonEC2ContainerRegistryReadOnly

``` text
EKS Worker Nodes
    ↓
giants-role-eks-node
    │
    ├── AmazonEKSWorkerNodePolicy
    ├── AmazonEKS_CNI_Policy
    └── AmazonEC2ContainerRegistryReadOnly
```

#### AWS Load Balancer Controller / IRSA

AWS Load Balancer Controllerについては、Worker NodeのIAMRoleを利用するのではなく、
IRSA（IAM Roles for ServiceAccounts）を使用しています。
TerraformでEKS ClusterのOIDC ProviderをIAMへ登録し、
Kubernetes上の`kube-system/aws-load-balancer-controller` ServiceAccountと専用IAMRoleを関連付けています。
IAM RoleのTrust Policyでは、以下のServiceAccountからの`sts:AssumeRoleWithWebIdentity` を許可しています。
これにより、AWS Load Balancer Controllerが必要とするAWS権限をWorker NodeRoleから分離し、専用IAM Roleとして管理しています。

``` text
system:serviceaccount:kube-system:aws-load-balancer-controller
```

### Secret Management

DB
Passwordやメール通知に使用する認証情報などの機密情報は、実値をGitリポジトリへ保存しない方針としています。
Git上には実値を含まないdummy Manifestのみを配置し、実環境ではKubernetesSecretとして管理します。

### GitHub Actions

AWS Credentialsなどの認証情報はGitHubSecretsから取得し、Workflowファイルへ直接記述しない構成としています。

### Container Image

Amazon ECRでは `scan_on_push = true`を設定し、コンテナイメージpush時にImage Scanを実行します。

## Cost Management

本プロジェクトは個人ポートフォリオのため、AWS環境を常時稼働させていません。
EKS、NATGateway、RDS、ALBなど継続的に料金が発生するリソースが存在するため、検証時にTerraformで環境を構築し、検証終了後に削除する運用としています。
また、本番環境であれば冗長化を検討する構成についても、個人環境ではコストとのトレードオフから以下としています。
本番環境では可用性要件に応じて、各AZへのNAT Gateway配置やRDSMulti-AZ構成などを検討します。
そのため、本ポートフォリオでは常設の公開URLを提供していません。

## Repository Structure

``` text
sre-portfolio/
├── backend/                       # FastAPI Backend
├── frontend/                      # Next.js Frontend
│
├── terraform/
│   ├── ecr.tf                     # Amazon ECR
│   ├── eks.tf                     # Amazon EKS
│   ├── iam.tf                     # IAM
│   ├── network.tf                 # VPC / Subnet / NAT / Route
│   ├── rds.tf                     # Amazon RDS
│   ├── sg.tf                      # Security Group
│   ├── provider.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── k8s/
│   ├── manifests/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── deployment_backend.yaml
│   │   ├── deployment_frontend.yaml
│   │   ├── service_backend.yaml
│   │   ├── service_frontend.yaml
│   │   ├── ingress.yaml
│   │   ├── serviceaccount.yaml
│   │   └── secret-dummy.yaml
│   │
│   ├── alert/
│   │   ├── giants-alert-rules.yaml
│   │   ├── alertmanager-config.yaml
│   │   └── alertmanagersecret-dummy.yaml
│   │
│   └── observability/
│       ├── values-loki.yaml
│       └── values-promtail.yaml
│
├── load-test/
│   └── k6/
│
├── .github/
│   └── workflows/
│       ├── githubaction_backend.yaml
│       └── githubaction_frontend.yaml
│
└── README.md
```

※実際の認証情報を含むSecretManifestやTerraform変数ファイルなどはGit管理対象外としています。

## Environment Lifecycle

本環境は常時稼働させないため、検証時にAWS /Kubernetes環境を再構築します。
概ね以下の流れで環境を利用します。

``` text
Terraform
    │
    ▼
terraform apply
    │
    ▼
AWS Infrastructure
    │
    ├── VPC / Network
    ├── EKS
    ├── ECR
    └── RDS
    │
    ▼
Kubernetes Manifests
    │
    ▼
Application Deployment
    │
    ▼
Observability Stack
    │
    ├── Prometheus / Grafana
    └── Loki / Promtail
    │
    ▼
PrometheusRule / Alertmanager
    │
    ▼
Load / Failure Testing
    │
    ▼
terraform destroy
```

## Current Limitations / Future Improvements

本ポートフォリオでは個人開発環境としてコストと実装範囲を考慮し、本番環境と比較していくつか簡略化しています。

### High Availability

現在はNAT Gatewayを1台、RDSをSingle-AZで構成しています。
本番環境では可用性要件に応じて、NAT GatewayのAZ単位での配置やRDSMulti-AZを検討します。

### HTTPS

現在のALB IngressはHTTPのみで公開しています。
本番環境ではACMCertificateを利用したHTTPS化とHTTPからHTTPSへのRedirectを検討します。

### Secret Management

現在はKubernetes Secretを利用しています。
本番環境ではAWS SecretsManagerなどの外部Secret管理サービスとの連携を検討します。

### Alert Notification

現在はメールによるAlert通知を実装しています。
実運用ではSlack /PagerDutyなどとの連携や、Severityに応じた通知先・EscalationPolicyを検討します。

### SLI / SLO

現在はKubernetes / Infrastructure Metricsを中心に監視しています。
本番運用ではAvailabilityやLatencyなどのSLIを定義し、SLO / ErrorBudgetに基づいた信頼性管理へ発展させることを検討します。

## What I Learned

本プロジェクトを通して、AWSやKubernetesの構築だけではなく、以下を一連のシステムとして設計・構築・検証しました。
特に、**監視ツールを導入するだけではなく、実際に負荷や障害を発生させ、検知・通知・復旧まで確認すること**を重視しました。

-   Terraformによるインフラの再現性
-   Public / Private Subnetを利用したAWSネットワーク設計
-   Amazon EKS上でのコンテナ運用
-   Kubernetes ProbeによるHealth Check
-   requests / limitsによるResource Management
-   GitHub ActionsによるBuild / Deploy
-   Prometheus / GrafanaによるMetrics Monitoring
-   Loki / PromtailによるLogging
-   PrometheusRule / Alertmanagerによる障害検知・通知
-   k6によるLoad Testing
-   意図的な障害発生によるFailure Testing
-   AWS利用料金を考慮した環境ライフサイクル
