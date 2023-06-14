import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'easy-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: [],
})
export class SubmitButtonComponent {
  @Input() disabled = false;
  @Input() buttonText = 'Pošalji';
  @Input() buttonCssClass!: string;
  @Input() wrapperCssClass!: string;
  @Input() form!: AbstractControl;
  @Output() clickSubmit: EventEmitter<any> = new EventEmitter();

  constructor() {}

  onButtonClick() {
    if (this.form?.invalid) {
      this.form.markAllAsTouched();
      this.scrollAndFocusFirstInvalidField();
      return;
    }
    this.clickSubmit.emit();
  }

  scrollAndFocusFirstInvalidField(): void {
    const firstInvalidField = this.findFirstInvalidField();
    if (firstInvalidField) {
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth' });
    }
  }

  findFirstInvalidField(): any {
    let firstInvalidField = document.querySelector('easy-control-factory.ng-invalid')?.nextElementSibling;
    firstInvalidField = firstInvalidField ? firstInvalidField : document.querySelector('.ng-invalid');

    if (!firstInvalidField) {
      return;
    }
    const nativeHtmlElement = this.findHtmlNativeElement(firstInvalidField);
    if (nativeHtmlElement) {
      return nativeHtmlElement;
    }
    return firstInvalidField;
  }

  findHtmlNativeElement(element: Element): any {
    const htmlNativeElements = ['input', 'select', 'textarea'];
    let foundElement = null;
    for (const elementName of htmlNativeElements) {
      foundElement = element.querySelector(elementName);
      if (foundElement) {
        break;
      }
    }
    return foundElement;
  }
}
