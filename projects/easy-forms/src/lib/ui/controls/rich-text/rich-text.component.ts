import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'easy-rich-text',
  templateUrl: './rich-text.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RichTextComponent implements OnInit {
  @Input() config: any;

  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: true,
  })
  dynamicComponentContainer!: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    if (this.config.component && this.config.value) {
      console.warn(
        'control.value is used by default but you should not define both control.value and control.component. Please define only one of them in configuration'
      );
    }
    if (this.config.component) {
      this.dynamicComponentContainer.clear();
      const componentFactory = this.resolver.resolveComponentFactory(this.config.component);
      this.dynamicComponentContainer.createComponent(componentFactory);
    }
  }
}
