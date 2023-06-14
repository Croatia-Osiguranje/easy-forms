import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Field } from '../../models/field';
import { FormHelper } from '../../helpers/formHelper';
import { Subscription } from 'rxjs';
import { ControlService } from '../../services/control.service';

@Component({
  selector: 'easy-control',
  templateUrl: './control.component.html',
})
export class ControlComponent implements OnInit, OnDestroy {
  @Input() control: any;

  @Input() config: Field = new Field();
  @Output() handleTriggersEvent: EventEmitter<Field> = new EventEmitter();

  @HostBinding('class') class: any;

  formSubscription: Subscription = new Subscription();

  constructor(private controlService: ControlService) {}

  ngOnInit(): void {
    this.loadConfig();
    this.setHostBindingClass();
    this.emitDefaultValue();
    this.subscribeOnFormChanges();
  }

  emitDefaultValue() {
    if (this.control && !this.config.isStepLink()) {
      this.emitValue(this.control.value);
    }
    if (this.config.type === 'hidden') {
      this.emitValue(this.config.value);
    }
  }

  subscribeOnFormChanges() {
    this.formSubscription?.unsubscribe();
    this.formSubscription = this.control?.valueChanges.subscribe((value: any) => {
      this.handleTriggers();
      this.emitValue(value);
      if (this.control.valid) {
        this.emitValidStatus(value);
      }
    });
  }

  emitValue(value: any) {
    this.controlService.setFieldValueChanged(this.config, value);
  }

  emitValidStatus(value: any) {
    this.controlService.setFieldValidStatusChanged(this.config, value);
  }

  handleTriggers() {
    if (this.config.triggers) {
      this.handleTriggersEvent.emit(this.config);
    }
  }

  private loadConfig() {
    if (this.config instanceof Field) {
      return;
    }
    this.config = FormHelper.loadConfig(this.config);
  }

  getFormGroupValidationClass() {
    return FormHelper.getFormGroupValidationClass(this.control);
  }

  isVisible(config: any) {
    return config.visible;
  }

  setHostBindingClass() {
    if (this.config.visible) {
      this.class = this.config.wrapperClass;
    }
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  getFieldId(): string | null {
    return this.config?.id || null;
  }
}
