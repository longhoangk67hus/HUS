/**
 * Service Response - Tương tự ServiceResponse trong C#
 * Dùng để wrap kết quả trả về từ service layer
 */
export class ServiceResponse<T = any> {
  isSuccess: boolean = true;
  data?: T;
  errorCode?: number;
  errorMessage?: string;
  validateResults?: ValidationResult[];
  serverTime?: Date;

  constructor(data?: T) {
    this.data = data;
    this.serverTime = new Date();
  }

  static success<T>(data?: T): ServiceResponse<T> {
    const response = new ServiceResponse<T>(data);
    response.isSuccess = true;
    return response;
  }

  static error<T>(errorMessage: string, errorCode?: number): ServiceResponse<T> {
    const response = new ServiceResponse<T>();
    response.isSuccess = false;
    response.errorMessage = errorMessage;
    response.errorCode = errorCode;
    return response;
  }

  static validationError<T>(validateResults: ValidationResult[]): ServiceResponse<T> {
    const response = new ServiceResponse<T>();
    response.isSuccess = false;
    response.validateResults = validateResults;
    response.errorMessage = 'Validation failed';
    response.errorCode = 400;
    return response;
  }
}

/**
 * Validation Result - Kết quả validate
 */
export interface ValidationResult {
  field: string;
  message: string;
  value?: any;
}
