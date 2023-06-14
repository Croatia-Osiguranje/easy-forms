import { UntypedFormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Field } from '../models/field';
import { TriggerFactory } from '../triggers/trigger.factory';
import { ControlService } from '../services/control.service';
import { FormHelper } from '../helpers/formHelper';

@Component({
  selector: 'easy-controls',
  templateUrl: './controls.component.html',
})
export class ControlsComponent implements OnInit {
  @Input() config!: Array<Field>;
  @Input() form!: UntypedFormGroup;
  @Input() isGroup!: boolean;

  constructor(private controlService: ControlService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadConfig();
    this.config.forEach((field) => {
      if (field.triggers) {
        this.handleTriggers(field);
      }
    });
  }

  private loadConfig() {
    if (this.config) {
      this.config = this.config.map((field) => {
        if (field instanceof Field) {
          return field;
        }
        return FormHelper.loadConfig(field);
      });
      this.cdr.detectChanges();
    }
  }

  isVisible(config: any) {
    return config.visible;
  }

  handleTriggers(field: Field): void {
    field.triggers?.forEach((triggerConfig) => {
      const trigger = TriggerFactory.create(triggerConfig);
      const passes = trigger.testCondition(this.getValue(field.id));
      this.config = trigger.apply(this.config, this.form, passes);
    });
  }

  private getValue(fieldId: string) {
    return this.form.get(fieldId)?.value;
  }

  trackByFunction(index: any, control: any) {
    return control.id;
  }

  getSubform(control: any) {
    const formGroup = this.form.get(control.id) as UntypedFormGroup;
    if (!formGroup) {
      return new UntypedFormGroup({});
    }
    return formGroup;
  }
}
