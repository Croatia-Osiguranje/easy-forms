import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  ValidationErrors,
  Validator,
} from "@angular/forms";

@Component({
  selector: "easy-checkbox-single",
  templateUrl: "./checkbox-single.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class CheckboxSingleComponent
  implements ControlValueAccessor, Validator
{
  @Input() config: any;
  value: any;

  propagateChange = (parametar: any) => {};

  onTouched = () => {};

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onCheckboxSelect(value: any) {
    this.value = value;
    this.onTouched();
    this.propagateChange(this.value);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(value: any) {
    if (value !== undefined && value != null) {
      this.value = value;
    }
  }

  validate({ value }: AbstractControl): ValidationErrors | null {
    return null;
  }
}
