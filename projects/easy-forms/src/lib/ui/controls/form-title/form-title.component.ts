import { Component, Input, HostBinding } from "@angular/core";
import { FormHelper } from "../../../helpers/formHelper";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor } from "@angular/forms";

@Component({
  selector: "easy-form-title",
  templateUrl: "./form-title.component.html",
  styleUrls: [],
  standalone: true,
  imports: [CommonModule],
})
export class FormTitleComponent implements ControlValueAccessor {
  @Input() config: any;
  isTooltipOpen!: boolean;

  @HostBinding("class") class = "form__Title";

  getAriaDescribedByTooltipId(): string | null {
    return this.config?.attributes?.tooltip
      ? FormHelper.getFieldAriaDescribedByTooltipId(this.config.id)
      : null;
  }

  setTooltipOpen(status: boolean): void {
    this.isTooltipOpen = status;
  }

  writeValue(value: string): void {
      this.config.value = value;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onTouched = () => {};

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  propagateChange = (parametar: any) => {};


}
