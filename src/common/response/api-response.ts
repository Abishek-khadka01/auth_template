export class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
  timestamp: string;

  private constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T | null,
    errors: string[] | null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T,
    message = 'Success',
    statusCode = 200,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, statusCode, message, data, null);
  }

  static failure<T = null>(
    message: string,
    statusCode = 400,
    errors: string[] | null = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, statusCode, message, null, errors);
  }
}
