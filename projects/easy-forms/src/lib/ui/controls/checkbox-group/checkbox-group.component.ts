import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";

@Component({
  selector: "easy-checkbox-group",
  templateUrl: "./checkbox-group.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class CheckboxGroupComponent implements ControlValueAccessor {
  @Input() config: any;
  value: any = [];

  propagateChange = (parametar: any) => {};

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onCheckboxSelect(value: any) {
    this.handleCheckboxSelect(value);
    this.propagateChange(this.value);
  }

  handleCheckboxSelect(value: any) {
    if (!this.isChecked(value)) {
      this.value.push(value);
      return;
    }

    this.value.splice(this.value.indexOf(value), 1);
  }

  registerOnTouched(fn: any): void {}

  writeValue(value: any) {
    if (value !== undefined && value != null && value !== "") {
      this.value = [...this.value, ...(Array.isArray(value) ? value : [value])];
    }
  }

  isChecked(value: any): boolean {
    return Array.isArray(this.value) && this.value.includes(value);
  }
}
