import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { ControlValueAccessor, FormsModule } from "@angular/forms";
import { StringHelper } from "../../../helpers/string.helper";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { ControlStatusEnum } from "../../../enums/control-status-enum";
import { FormHelper } from "../../../helpers/formHelper";
import { ControlStatusChanges } from "../../../interfaces/control-status-changes";
import { CommonModule } from "@angular/common";
import { AttributesDirective } from "../../../directives/attributes.directive";

@Component({
  selector: "easy-phone-number",
  templateUrl: "./phone-number.component.html",
  standalone: true,
  imports: [CommonModule, AttributesDirective, NgxMaskDirective, FormsModule],
  providers: [provideNgxMask(), NgxMaskPipe],
})
export class PhoneNumberComponent
  implements ControlValueAccessor, ControlStatusChanges
{
  @Input() config: any;

  value = "";
  isFocused = false; // append class on wrapper if field is in focus
  isBlur = false; // append class on wrapper if field is blur

  maxLength = 12;
  phoneNumberRegex = /^[0-9 ]*$/;

  fieldTouched = false;
  fieldStatus: ControlStatusEnum | null = null;
  isTooltipOpen!: boolean;

  constructor(
    private maskPipe: NgxMaskPipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  writeValue(value: any) {
    if (value !== undefined && value !== null) {
      if (value !== "") {
        this.value = this.maskPipe.transform(value, this.getMask(value));
      }
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.resetFieldProperties();
    this.changeDetectorRef.detectChanges();
    return;
  }

  resetFieldProperties(): void {
    this.isFocused = false;
    this.isBlur = false;
    this.value = "";
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
    this.isBlur = true;
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
    const numbersOnly = this.phoneNumberRegex.test(event.target.value);
    if (!numbersOnly) {
      event.target.value = event.target.value.replace(/[^0-9 \.]+/g, "");
      return;
    }

    const value = StringHelper.removeSpaces(event.target.value);
    this.value = this.maskPipe.transform(value, this.getMask(value));
    this.maxLength = this.getMaxLength(this.value);
    this.propagateChange(value);
    this.changeDetectorRef.detectChanges();
  }

  getMask(value: any) {
    return value.startsWith("0") ? "000 000 00000" : "00 000 00000";
  }

  getMaxLength(value: any) {
    return value.startsWith("0") ? 12 : 11;
  }

  getAriaDescribedByIds(): string | null {
    return (
      [this.getAriaDescribedByErrorId(), this.getAriaDescribedByHelpId()]
        .filter((val) => val)
        .join(" ") || null
    );
  }

  getAriaDescribedByHelpId(): string | null {
    return this.config.help
      ? FormHelper.getFieldAriaDescribedByHelpId(this.config.id)
      : null;
  }

  getAriaDescribedByErrorId(): string | null {
    return this.isFieldInvalid()
      ? FormHelper.getFieldAriaDescribedByErrorId(this.config.id)
      : null;
  }

  getAriaDescribedByTooltipId(): string | null {
    return this.config?.attributes?.tooltip
      ? FormHelper.getFieldAriaDescribedByTooltipId(this.config.id)
      : null;
  }

  setTooltipOpen(status: boolean): void {
    this.isTooltipOpen = status;
  }

  isFieldInvalid(): boolean | null {
    return this.fieldTouched && this.fieldStatus === ControlStatusEnum.invalid
      ? true
      : null;
  }

  isFieldRequired(): boolean {
    return (
      this.config?.attributes?.required ||
      this.config?.validators?.required ||
      null
    );
  }
}
