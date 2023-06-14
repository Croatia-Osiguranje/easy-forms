import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { ControlValueAccessor, FormsModule } from "@angular/forms";
import { DynamicMaxLengthInterface } from "../../../interfaces/dynamic-max-length";
import { FormHelper } from "../../../helpers/formHelper";
import { ControlStatusEnum } from "../../../enums/control-status-enum";
import { ControlStatusChanges } from "../../../interfaces/control-status-changes";
import { CommonModule } from "@angular/common";
import { AttributesDirective } from "../../../directives/attributes.directive";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";

@Component({
  selector: "easy-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./../control.scss"],
  standalone: true,
  imports: [CommonModule, AttributesDirective, NgxMaskDirective, FormsModule],
  providers: [provideNgxMask()],
})
export class InputComponent
  implements ControlValueAccessor, OnInit, ControlStatusChanges
{
  @Input() config: any;
  value!: string; // using ng model because event passed from input does not recognize mask
  valueExist = false; // append class on wrapper if value exist
  isFocused = false; // append class on wrapper if field is in focus
  isBlur = false; // append class on wrapper if field is blur

  controlMask!: string;
  maxLength: any;
  prependConfig: any;

  fieldTouched = false;
  fieldStatus: ControlStatusEnum | null = null;
  isTooltipOpen!: boolean;
  showPassword = false;
  showPasswordButtonHover = false;
  passwordControl = false;

  @ViewChild("inputRef") inputRef!: ElementRef;
  constructor() {}

  writeValue(value: any) {
    if (value !== undefined && value !== null) {
      if (value !== "") {
        this.valueExist = true;
      }
      this.value = value;
      return;
    }

    this.resetFieldProperties();
    return;
  }

  resetFieldProperties(): void {
    this.valueExist = false;
    this.isFocused = false;
    this.isBlur = false;
    this.value = "";
    this.fieldTouched = false;
    this.fieldStatus = null;
  }

  ngOnInit() {
    this.passwordControl = this.isPasswordControl();
    this.controlMask = this.getMask();
    this.prependConfig = this.config.attributes.prepend;
    this.maxLength = this.config.attributes.maxlength
      ? this.config.attributes.maxlength
      : null;
  }

  getMask() {
    if (!this.config.attributes.mask) {
      return "";
    }
    return this.config.attributes.mask;
  }

  prependExist() {
    return (this.value || this.isFocused) && this.prependConfig;
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
    let inputValue: string = this.config.attributes.date
      ? event.target.value
      : this.value;
    if (this.prependConfig?.includeInFieldValue) {
      inputValue = this.prependConfig.value.concat(inputValue);
    }
    if (this.config.attributes.dynamicMaxLength) {
      const dynamicMaxLengthHelperDeclaration =
        this.config.attributes.dynamicMaxLength;
      const dynamicMaxLengthHelper: DynamicMaxLengthInterface =
        new dynamicMaxLengthHelperDeclaration();
      this.maxLength = dynamicMaxLengthHelper.getDynamicMaxLength(
        inputValue,
        this.config.attributes.maxlength
      );
      this.inputRef.nativeElement.setAttribute("maxlength", this.maxLength);
    }

    this.propagateChange(inputValue);

    if (this.value !== "") {
      this.valueExist = true;
      return;
    }

    this.valueExist = false;
    return;
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

  isPasswordControl() {
    const type = this.config?.attributes?.type;
    if (!type) {
      return false;
    }
    return type === "password";
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.inputRef.nativeElement.type = this.getPasswordFieldType(
      this.showPassword
    );
  }

  getPasswordFieldType(showPassword: boolean) {
    if (showPassword) {
      return "text";
    }
    return "password";
  }
}
