import { ExistingItemError } from './customErrors/existingItemError';
import { NotFoundError } from './customErrors/notFoundError';
import { SystemError } from './customErrors/systemError';
import { ValidationError } from './customErrors/validationError';
import type { ErrorType } from './types/errorType';

export const errorDictionary = new Map<string, ErrorType>([
  [ValidationError.name, { status: 400, code: 'validation_error' }],
  [ExistingItemError.name, { status: 400, code: 'database_error' }],
  [SystemError.name, { status: 500, code: 'internal_server_error' }],
  [NotFoundError.name, { status: 404, code: 'not_found' }],
]);
