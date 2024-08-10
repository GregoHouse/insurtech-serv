/**
 * Middleware to centralize error handling
 *
 * @param errorHandler Is a function src/utils/errors/errorHandler.ts
 * @returns
 */
export function errorHandlerMiddleware(errorHandler) {
  const onError = async (request) => {
    if (request.error instanceof Error) {
      request.response = errorHandler(request.error);
    } else {
      request.response = {
        statusCode: 500,
        body: JSON.stringify({
          code: 'internal_server_error',
          message: 'unknown error',
        }),
      };
    }
  };
  return {
    onError,
  };
}
