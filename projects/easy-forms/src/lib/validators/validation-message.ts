import { ValidationErrors } from '@angular/forms';
export class ValidationMessage {
  message: string;
  validationError: ValidationErrors;

  constructor(message: string, ve: ValidationErrors) {
    this.message = message;
    this.validationError = ve;
  }
}
