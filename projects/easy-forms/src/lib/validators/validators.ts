import { AbstractControl, Validators as NgValidators, ValidatorFn } from '@angular/forms';
import { ValidationMessage } from './validation-message';
import { ValidatorParameters } from '../models/validator-input';

/**
 * Custom  validators and wrapper for internal Angular validators
 */
export class Validators {
  public static readonly emailValidationPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  public static readonly dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/](19|20)\d\d$/;

  /**
   * Validator that requires the control's value to be less than or equal to the provided number.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static min(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      const v = NgValidators.min(parameters.value);
      if (v(control)) {
        return new ValidationMessage(parameters.message, v);
      }
      return null;
    };
  }

  /**
   * Validator that requires the control's value to be less than or equal to the provided number.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static max(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      const v = NgValidators.max(parameters.value);
      if (v(control)) {
        return new ValidationMessage(parameters.message, v);
      }
      return null;
    };
  }

  /**
   * Validator that requires the control have a non-empty value.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static required(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      if (parameters.value) {
        const v = NgValidators.required(control);
        if (v) {
          return new ValidationMessage(parameters.message, v);
        }
      }
      return null;
    };
  }

  /**
   * Validator that requires the control's value to match a valid email pattern
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static email(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      if (!parameters.value || !control.value) {
        return null;
      }

      const valid = Validators.emailValidationPattern.test(control.value);

      if (!valid) {
        return new ValidationMessage(parameters.message, { email: true });
      }
      return null;
    };
  }

  /**
   * Validator that requires the length of the control's value to be greater than or equal
   * to the provided minimum length.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static minLength(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      const v = NgValidators.minLength(parameters.value);
      if (v(control)) {
        return new ValidationMessage(parameters.message, v);
      }
      return null;
    };
  }

  /**
   * Validator that requires the length of the control's value to be less than or equal
   * to the provided maximum length.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static maxLength(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      const v = NgValidators.maxLength(parameters.value);

      if (v(control)) {
        return new ValidationMessage(parameters.message, v);
      }
      return null;
    };
  }

  /**
   * Validator that requires the length of the control's value to be equal
   * to the provided length.
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static equalLength(parameters: ValidatorParameters): ValidatorFn {
    return (control: AbstractControl): null | ValidationMessage => {
      if (control.value.length !== parameters.value) {
        return new ValidationMessage(parameters.message, {
          equalLength: true,
        });
      }
      return null;
    };
  }

  /**
   * Validator that requires validated control and provided other control to match.
   * Enables validation message override
   * @param parameters Configuration value of the validator
   * @param currentControl Control that is been validated
   * @param controls List of controls that #currentControl belongs to
   * @returns ValidatorFn
   */
  static equalTo(parameters: { field: string; message: string }): ValidatorFn {
    return (control: any): null | ValidationMessage => {
      if (!parameters || !control.value || !control.parent) {
        return null;
      }

      if (!control.parent.get(parameters.field).value) {
        return null;
      }

      const valid = control.value === control.parent.get(parameters.field).value;
      const validationMessage = new ValidationMessage(parameters.message, { equalTo: true });
      const compareField = control.parent.get(parameters.field);

      if (valid) {
        compareField.setErrors(null);
        return null;
      }
      return validationMessage;
    };
  }
}
