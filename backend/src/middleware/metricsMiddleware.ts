import { Request, Response, NextFunction } from "express";
import { metricsService } from "../services/metricsService";

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  const originalEnd = res.end;

  res.end = function (
    this: Response,
    chunk?: any,
    encoding?: any,
    cb?: any,
  ): Response {
    const duration = (Date.now() - startTime) / 1000;

    const route = req.route?.path || req.path;

    metricsService.recordHttpRequest(
      req.method,
      route,
      res.statusCode,
      duration,
    );

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
