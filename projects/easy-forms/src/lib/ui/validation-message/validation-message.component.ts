import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormHelper } from '../../helpers/formHelper';

@Component({
  selector: 'easy-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
})
export class ValidationMessageComponent {
  @Input() control!: AbstractControl;
  @Input() fieldId: string | null = null;

  constructor() {}

  isControlTouched() {
    return this.control?.touched;
  }

  getAriaDescribedByReferenceId(): string | null {
    return this.fieldId ? FormHelper.getFieldAriaDescribedByErrorId(this.fieldId) : null;
  }
}
