import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

@Catch(BadRequestException, UnprocessableEntityException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : exceptionResponse;

    // Detect missing field vs invalid type
    const isMissingField =
      Array.isArray(message) &&
      message.some((msg) =>
        msg.toLowerCase().includes('should not be empty'),
      );

    if (isMissingField) {
      return response.status(400).json({
        status: 'error',
        message: 'Missing or empty name',
      });
    }

    return response.status(422).json({
      status: 'error',
      message: 'Invalid type',
    });
  }
}