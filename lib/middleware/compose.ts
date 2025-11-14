import { NextRequest, NextResponse } from 'next/server';

type Middleware = (
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) => Promise<NextResponse>;

/**
 * Compose multiple middleware functions
 * Executes middleware in order from left to right
 */
export function composeMiddleware(...middlewares: Middleware[]) {
  return async (
    request: NextRequest,
    finalHandler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // Build the middleware chain from right to left
    let handler = finalHandler;

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middleware = middlewares[i];
      const nextHandler = handler;
      handler = (req: NextRequest) => middleware(req, nextHandler);
    }

    return handler(request);
  };
}

/**
 * Helper to create a route handler with middleware
 */
export function withMiddleware(
  middlewares: Middleware[],
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const composedMiddleware = composeMiddleware(...middlewares);
  return (request: NextRequest) => composedMiddleware(request, handler);
}
