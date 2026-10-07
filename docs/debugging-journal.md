## Challenge: Empty ECR repos blocked first apply

**Date:** 2026-04-29

### Expected

Running `terraform apply` after `terraform destroy` would bring everything
back up cleanly: VPC, ECS, RDS, and the backend task pulling all three
container images.

### Actual

ALB returned 503 on /api/_ and /grafana/_. Backend ECS service stuck at
0 running / 1 pending / 1 desired. ECS event log:

CannotPullContainerError: pull image manifest has been retried 7 time(s):
failed to resolve ref ...todoapp-prometheus:latest: not found.

### Root cause

Chicken-and-egg between Terraform and CI. Terraform destroy had removed
the ECR repos for Prometheus and Grafana (the backend and frontend repos
survived because they had images that prevented deletion). When I merged
the observability PR to main, the deploy workflow ran — but the
deploy-prometheus and deploy-grafana jobs failed because the repos didn't
exist yet. Then terraform apply created the repos. Now the repos existed
but were empty, and the running backend task definition referenced
todoapp-prometheus:latest. ECS retried, kept failing.

### What I tried

- Confirmed via `aws ecr describe-images` that the prometheus and grafana
  repos didn't exist at all (RepositoryNotFoundException).
- Confirmed backend and frontend repos still had images from older deploys.
- Read the ECS service events to see exactly what was failing to pull.

### What fixed it

Re-ran the failed deploy jobs in GitHub Actions. By that point the repos
existed (terraform apply had created them), so the image pushes succeeded.
ECS detected the new images on its next retry and the backend task came up.

### Lesson

Infrastructure-as-code and CI/CD have an ordering dependency that's
invisible until it bites. The deploy workflow assumes ECR repos exist;
Terraform creates them. If the workflow runs first, it fails. The clean
fix is either (a) push images manually before first apply, (b) make
the workflow idempotent on missing repos with a meaningful error, or
(c) bootstrap ECR separately from the rest of the infrastructure so it
exists before any application deploy.

For Demena I'd just remember to do `terraform apply` first when bringing
the system back up — the cost of a more elegant solution isn't worth it
for a personal project.
