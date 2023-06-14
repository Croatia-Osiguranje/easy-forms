import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[easyAttributes]',
  standalone: true,
})
export class AttributesDirective implements OnInit {
  @Input() easyAttributes: any;
  constructor(private el: ElementRef) {}

  ignoreAttributes = ['class', 'mask', 'date', 'tooltip', 'countries'];

  ngOnInit() {
    Object.entries(this.easyAttributes).forEach(([key, value]) => {
      if (key === 'autofocus') {
        // TODO : remove timeout and fix problem with circular dependency problem
        setTimeout(() => {
          this.el.nativeElement.focus();
        }, 100);
        return;
      }
      if (value && !this.isAttributeIgnored(key)) {
        this.el.nativeElement.setAttribute(key, value);
      }
    });
  }

  isAttributeIgnored(name: string) {
    let ignoreAttribute = false;
    this.ignoreAttributes.forEach((attribute) => {
      if (attribute === name) {
        ignoreAttribute = true;
      }
    });
    return ignoreAttribute;
  }
}
