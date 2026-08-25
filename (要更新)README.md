# SRE Portfolio

================================================
## プロジェクト概要

本リポジトリは、AWSおよびKubernetesを利用したSREポートフォリオです。
NPB12球団の選手年齢分布を表示するWebアプリケーションを題材とし、
アプリケーション開発ではなく、インフラ構築・CI/CD・可観測性・負荷試験・障害試験を中心に実装しています。
実務を意識し、Infrastructure as Code、継続的デリバリー、監視、ログ収集、運用改善までを一連の流れとして構築しました。


================================================
## アーキテクチャ

※ 後日、構成図を追加予定


================================================
## 使用技術

| 分類                   | 技術                       |
| ---------------------- | -------------------------- |
| Frontend               | React, Next.js             |
| Backend                | FastAPI                    |
| Database               | Amazon RDS for MySQL       |
| Container              | Docker                     |
| Orchestration          | Amazon EKS                 |
| Infrastructure as Code | Terraform                  |
| CI/CD                  | GitHub Actions, Amazon ECR |
| Monitoring             | Prometheus, Grafana        |
| Logging                | Loki, Promtail             |
| Load Testing           | k6                         |


================================================
## CI/CD

CI/CDにはGitHub Actionsを利用しています。
Frontend・Backendはそれぞれ独立したWorkflowで管理しており、
Dockerイメージを作成してAmazon ECRへPushした後、Amazon EKSへRolling Updateを実施します。
現在は運用確認を目的として、自動実行ではなく `workflow_dispatch` による手動実行でデプロイを行っています。


================================================
## Observability

可観測性の構成は以下の通りです。

* Prometheusによるメトリクス収集
* Grafana Dashboardによる可視化
* Loki・Promtailによるログ収集
* Grafana Exploreによるログ確認


================================================
## Load Testing

負荷試験にはk6を利用しています。
実施内容は以下の通りです。

* Baseline Test
* Threshold設定
* ALB経由での負荷試験
* Grafanaによるメトリクス確認
* Lokiによるログ確認


================================================
## Failure Testing

障害試験の実施内容は以下の通りです。

* Pod削除
* Service Selector変更
* ConfigMap(DB_HOST)変更
* 障害発生および復旧確認


================================================
## ディレクトリ構成

sre-portfolio
├── .github
├── backend
├── db
├── frontend
├── k8s
├── load-tests
├── terraform
└── README.md


================================================
## 実装方法

1. TerraformでAWSリソースを作成
2. DockerイメージをAmazon ECRへPush(GitHub Actionsを手動実行)
3. Kubernetesマニフェストを適用
4. ALB経由でアプリケーションへアクセス

※ AWS認証情報、GitHub Secretsなどの機密情報は本リポジトリには含まれていません。


================================================
## 今後の改善

* DashboardのUI改善
* 年齢分布の可視化
* ポジション別人数の可視化
* 投打割合の可視化
* 平均年齢の表示