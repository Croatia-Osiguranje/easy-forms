import { Component, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
import { FormHelper } from '../../../helpers/formHelper';
import { ControlStatusEnum } from '../../../enums/control-status-enum';
import { ControlStatusChanges } from '../../../interfaces/control-status-changes';
import { CommonModule } from '@angular/common';
import { AttributesDirective } from '../../../directives/attributes.directive';

@Component({
  selector: 'easy-textarea',
  templateUrl: './textarea.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule,AttributesDirective ],
})
export class TextareaComponent implements ControlValueAccessor, ControlStatusChanges {
  @Input() config: any;
  value!: string; // using ng model because event passed from input does not recognize mask
  hasValue = false; // append class on wrapper if value exist
  isFocused = false; // append class on wrapper if field is in focus

  fieldTouched = false;
  fieldStatus: ControlStatusEnum | null = null;

  constructor() {}

  writeValue(value: any) {
    if (value !== undefined && value !== null) {
      if (value !== '') {
        this.hasValue = true;
      }
      this.value = value;
      return;
    }

    this.resetFieldProperties();
    return;
  }

  resetFieldProperties(): void {
    this.hasValue = false;
    this.isFocused = false;
    this.value = '';
    this.fieldTouched = false;
    this.fieldStatus = null;
  }

  propagateChange = (parametar: any) => {};

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onTouched = () => {};

  onBlur() {
    if (!this.fieldTouched) {
      this.fieldTouched = true;
    }

    this.isFocused = false;
    this.onTouched();
  }

  onFocus() {
    this.isFocused = true;
  }

  onStatusChanges(status: ControlStatusEnum): void {
    if (status) {
      this.fieldStatus = status;
    }
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  textChanged(event: any) {
    const inputValue = this.config.attributes.date ? event.target.value : this.value;
    this.propagateChange(inputValue);
    if (this.value !== '') {
      this.hasValue = true;
      return;
    }
    this.hasValue = false;
    return;
  }

  getAriaDescribedByIds(): string | null {
    return [this.getAriaDescribedByErrorId(), this.getAriaDescribedByHelpId()].filter((val) => val).join(' ') || null;
  }

  getAriaDescribedByHelpId(): string | null {
    return this.config.help ? FormHelper.getFieldAriaDescribedByHelpId(this.config.id) : null;
  }

  getAriaDescribedByErrorId(): string | null {
    return this.isFieldInvalid() ? FormHelper.getFieldAriaDescribedByErrorId(this.config.id) : null;
  }

  isFieldInvalid(): boolean | null {
    return this.fieldTouched && this.fieldStatus === ControlStatusEnum.invalid ? true : null;
  }

  isFieldRequired(): boolean {
    return this.config?.attributes?.required || this.config?.validators?.required || null;
  }
}
