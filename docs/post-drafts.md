# Post drafts — Demena observability

## Draft 1 — CI Race Condition

Rough story (what happened, what I noticed, what I fixed):

I was wiring up the Grafana CI job when I noticed something. Three deploy
jobs all said `needs: test`. None of them said they needed each other.
GitHub Actions would start them all at the same time the moment tests
passed.

The problem: deploy-backend updates the ECS task definition. But the task
definition references three images — backend, prometheus, grafana. ECS
pulls all three when it rolls a new task. If deploy-backend finished
before deploy-prometheus or deploy-grafana finished pushing their `:latest`
tags, ECS would pull the _previous_ :latest and run stale sidecar config.

Fix: needs: [test, deploy-prometheus, deploy-grafana]

Lesson: Parallelism in CI is correct by default for _independent_ jobs,
but ECS task definitions create implicit dependencies between jobs that
GitHub Actions can't see.

Visual: workflow DAG showing deploy-backend correctly waiting for both
sidecar builds.

## Draft 2 — Sidecar Pattern

Rough story:

I had to choose: run Prometheus and Grafana as sidecars in the same ECS
task as the backend, or split them out as separate ECS services.

Sidecar wins:

- Shared network namespace = Prometheus scrapes localhost:8008
- No service discovery, no Cloud Map, no internal ALB
- Less Terraform

Separate service wins:

- Independent deploys (observability team can ship without backend deploy)
- Cleaner separation of concerns
- Production-realistic

For a solo project the sidecar pattern made sense. For a real production
setup with multiple teams, I'd split.

Visual: ECS task definition diagram with three containers in one task.

## Draft 3 — Grafana subpath gotcha (combine both findings)

Rough story:

Two subpath bugs, same theme.

One: Grafana behind ALB at /grafana/* needs GF_SERVER_SERVE_FROM_SUB_PATH=true.
Otherwise its static assets load from /public/... and 404. The ALB health
check also has to be at /grafana/api/health, not /api/health, because the
subpath rewrite applies to *every\* URL Grafana serves, including its own
health endpoint.

Two: ALB path-pattern conditions are exact-prefix matchers. /grafana/_
matches /grafana/login, /grafana/dashboards, but does NOT match the bare
URL /grafana (no trailing slash). The bare URL falls through to the
default rule, which routes to the frontend. To handle both, the rule
needs ["/grafana", "/grafana/_"].

Lesson: subpath routing has cascading effects. The reverse proxy rewrites
URLs, the upstream service has to know it's at a subpath, and the routing
rule has to handle both with-and-without-slash variants.

Visual: ALB rule editor showing the dual-pattern condition.
