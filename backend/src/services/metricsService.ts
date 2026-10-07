import promClient from "prom-client";

export class MetricsService {
  public register: promClient.Registry;

  public httpRequestsTotal: promClient.Counter;
  public httpRequestDuration: promClient.Histogram;

  public todosCreatedTotal: promClient.Counter;
  public todosDeletedTotal: promClient.Counter;
  public usersRegisteredTotal: promClient.Counter;

  constructor() {
    this.register = new promClient.Registry();

    promClient.collectDefaultMetrics({ register: this.register });

    this.httpRequestsTotal = new promClient.Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.register],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route"],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Time buckets in seconds
      registers: [this.register],
    });

    this.todosCreatedTotal = new promClient.Counter({
      name: "todos_created_total",
      help: "Total number of todos created",
      registers: [this.register],
    });

    this.todosDeletedTotal = new promClient.Counter({
      name: "todos_deleted_total",
      help: "Total number of todos deleted",
      registers: [this.register],
    });

    this.usersRegisteredTotal = new promClient.Counter({
      name: "users_registered_total",
      help: "Total number of users registered",
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });

    this.httpRequestDuration.observe({ method, route }, duration);
  }

  recordTodoCreated() {
    this.todosCreatedTotal.inc();
  }

  recordTodoDeleted() {
    this.todosDeletedTotal.inc();
  }

  recordUserRegistered() {
    this.usersRegisteredTotal.inc();
  }
}

export const metricsService = new MetricsService();
