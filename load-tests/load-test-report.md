# Load Test Report

## Purpose

Validate that the application can handle baseline traffic on EKS and that metrics and logs can be observed during the load test.

## Target Environment

- Kubernetes: Amazon EKS
- Entry Point: ALB Ingress
- Backend: FastAPI
- Observability: Prometheus, Grafana, Loki, Promtail
- Load Testing Tool: k6

## Test Scenario

The baseline load test sends requests to the main API endpoints through the ALB.

Target endpoints:

- `/health`
- `/team-metrics`
- `/alerts`
- `/alert-rules`

Script:

- `load-tests/k6/baseline.js`

## Load Profile

- Virtual Users: 5
- Duration: 1 minute

## Thresholds

The following SLO-like thresholds were defined in k6:

- Request failure rate: `< 1%`
- p95 response time: `< 500ms`
- Check success rate: `> 95%`

## Test Result

The baseline load test against the EKS ALB completed successfully.

- k6 checks passed
- Request failure rate was within the threshold
- p95 response time was within the threshold
- Main API endpoints returned successful responses

## Metrics Observation

During the load test, Kubernetes metrics were observed in Grafana.

Observed dashboards:

- Kubernetes / Compute Resources / Namespace (Pods)
- Kubernetes / Compute Resources / Cluster

Findings:

- CPU and memory usage showed only minor increases under the baseline workload.
- Network traffic increased during the k6 execution.
- No abnormal resource spikes were observed.
- No pod restarts were observed.

## Log Observation

Application logs were observed using Grafana Explore with Loki.

Findings:

- Application logs were collected from `giants-namespace`.
- Backend request logs were visible in Loki.
- Successful HTTP 200 responses were confirmed during the test.
- No critical application errors or unexpected exceptions were observed.

## Issue Found and Resolved

During log observation, Promtail pods were initially in `Pending` state.

Resolution:

- Removed the non-essential `loki-canary` DaemonSet.
- Restarted the Promtail DaemonSet.
- Confirmed Promtail became `Running` on both nodes.
- Confirmed application logs became visible in Loki.

This confirmed that the log collection pipeline was functioning correctly after remediation.

## Conclusion

The baseline load test confirmed that the application can handle light baseline traffic on EKS while remaining observable through metrics and logs.

The system showed stable behavior under the tested workload, with no significant CPU or memory pressure, no pod instability, and no critical application errors.

## Future Improvements

- Add higher-load scenarios.
- Add spike test and stress test scenarios.
- Store k6 results as CI artifacts if needed.
- Add alert rules based on latency or error rate.