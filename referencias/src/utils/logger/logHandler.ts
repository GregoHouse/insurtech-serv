import { Logger } from '@nx-observability/logger';

const context: object = Logger.getDefaultContext();
export const logger = Logger.getInstance({
  context: {
    aws_account_id: process.env['AWS_ACCOUNT_ID'] || 'N/A',
    aws_region: process.env['AWS_REGION'] || 'N/A',
    ...context,
  },
});
