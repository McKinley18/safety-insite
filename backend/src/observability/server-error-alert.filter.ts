import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { emitOperationalEvent } from './operational-events';
import { noteServerError, serverErrorCountInWindow } from './operational-alerts';

/**
 * §291 (MO-1) — REPEATED APPLICATION FAILURES BECOME ONE ALERT, NOT FOUR HUNDRED.
 *
 * §291 requires "repeated HTTP 500/application failures" to be a monitored condition, and equally
 * requires that ordinary 401/402/404/400/409 traffic never alert. Those are two different
 * questions and this filter is where they separate: only responses at 500 and above are counted,
 * and the count -- not the individual failure -- is what raises an event.
 *
 * It CHANGES NO RESPONSE. It observes, delegates to Nest's own handling, and is therefore unable
 * to alter what a client sees or to convert a handled error into an unhandled one.
 */
@Catch()
export class ServerErrorAlertFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    try {
      const status = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      if (status >= 500) {
        const crossedThreshold = noteServerError();
        if (crossedThreshold) {
          const request = host.switchToHttp().getRequest();
          emitOperationalEvent('service.error_rate_exceeded', {
            // The PATH, never the body, the query or the params: §268 forbids content, and a
            // request body is exactly where customer content lives.
            path: typeof request?.route?.path === 'string' ? request.route.path : 'unknown',
            method: typeof request?.method === 'string' ? request.method : 'unknown',
            statusCode: status,
            countInWindow: serverErrorCountInWindow(),
            failureKind: exception instanceof Error ? exception.name : 'UnknownError',
          });
        }
      }
    } catch {
      // Never let the observer break the thing it observes.
    }
    super.catch(exception, host);
  }
}
