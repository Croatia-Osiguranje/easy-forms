import { Trigger } from './trigger';
import get from 'lodash-es/get';
import { UntypedFormGroup } from '@angular/forms';

import { OperatorTypeEnum } from '../enums/operator-type-enum';
import { Field } from '../models/field';
import { FormHelper } from '../helpers/formHelper';

export class ToggleVisibilityTrigger extends Trigger {
  override resetValues = true;

  testCondition(value: any) {
    if (this.nested) {
      value = get(value, this.nested);
    }

    if (this.condition[0] === 'equals' || this.condition[0] === OperatorTypeEnum.eq) {
      return value === this.condition[1];
    }

    // TODO: see if lodash has something for checking empty
    // Empty is '', [], {}, false, null, empty Map or Set but not 0
    if (this.condition[0] === OperatorTypeEnum.empty) {
      if (value === 0) {
        return false;
      }

      if (!value) {
        return true;
      }

      if (Array.isArray(value) || typeof value === 'string' || value instanceof String) {
        return value.length === 0;
      }

      if (value instanceof Map || value instanceof Set) {
        return value.size === 0;
      }

      if ({}.toString.call(value) === '[object Object]') {
        return Object.keys(value).length === 0;
      }
    }

    return false;
  }

  apply(controlsConfig: Array<Field>, form: UntypedFormGroup, passes: boolean): Array<Field> {
    return controlsConfig.map((controlConfig) => {
      if (controlConfig.type === 'fieldGroup') {
        controlConfig.children = controlConfig.children.map((childControl: any) => {
          return this.updateControl(childControl, passes, form);
        });
      }

      return this.updateControl(controlConfig, passes, form);
    });
  }

  private updateControl(controlConfig: any, passes: any, form: any) {
    const formControl = form.get(controlConfig.id);

    if (this.pass.includes(controlConfig.id)) {
      controlConfig.visible = passes;
      if (!formControl) {
        return controlConfig;
      }
      FormHelper.toggleField(controlConfig, formControl, { reset: this.resetValues }, controlConfig.visible);
    }

    if (this.fail.includes(controlConfig.id)) {
      controlConfig.visible = !passes;
      if (!formControl) {
        return controlConfig;
      }
      FormHelper.toggleField(controlConfig, formControl, { reset: this.resetValues }, controlConfig.visible);
    }

    return controlConfig;
  }
}
