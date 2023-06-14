import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { ControlValueAccessor, FormsModule } from "@angular/forms";
import { Field } from "../../../models/field";
import { CommonModule } from "@angular/common";

@Component({
  selector: "easy-radio-group",
  templateUrl: "./radio-group.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() removeBorder = false;
  @Input() config!: Field;
  value: any;

  constructor(private cdr: ChangeDetectorRef) {}

  propagateChange = (parametar: any) => {};

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onRadioButtonSelect(value: any) {
    this.value = value;
    this.cdr.detectChanges();
    this.propagateChange(this.value);
  }

  registerOnTouched(fn: any): void {}

  writeValue(value: any) {
    if (value !== undefined && value != null) {
      this.value = value;
      this.cdr.detectChanges();
    }
  }
}
