import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { logMetrics } from '@aws-lambda-powertools/metrics';
import { logger } from '../utils/logger/logHandler';
import { tracer } from '../utils/tracer/traceHandler';
import { serverlessMiddyLogger } from '@nx-observability/serverless-middy-logger';
import { MetricService } from '../utils/metrics/metricService';
import { errorHandlerMiddleware } from './errorHandlerMiddleware';
import { errorHandler } from '../utils/errors/errorHandler';

export const middyConfig = () => {
  const middlewares = [
    errorHandlerMiddleware(errorHandler),
    captureLambdaHandler(tracer),
    logMetrics(MetricService.withDefaults().getMetricsInstance(), {
      captureColdStartMetric: true,
    }),
    serverlessMiddyLogger(logger),
  ];

  return middlewares;
};
