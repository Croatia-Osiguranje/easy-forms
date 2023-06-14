/* eslint-disable @typescript-eslint/default-param-last */
import { AbstractControl, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import cloneDeep from 'lodash-es/cloneDeep';
import { Field } from '../models/field';
import { FieldInterface } from '../interfaces/field.interface';
import { Validators } from '../validators/validators';
import { TransformerInterface } from '../interfaces/transformer-interface';

export class FormHelper {
  public static createControls(fields: Array<any>) {
    const controls: any = {};
    const fieldTypesExcludedFromForm = ['hidden', 'formTitle', 'errorField', 'richText'];

    fields = fields.filter((field) => !fieldTypesExcludedFromForm.includes(field.type));

    fields.forEach((fieldConfig) => {
      if (fieldConfig.type === 'subForm') {
        controls[fieldConfig.id] = new UntypedFormGroup(FormHelper.createControls(fieldConfig.children));
        if (!fieldConfig.visible) {
          controls[fieldConfig.id].disable();
        }
        return;
      }

      if (fieldConfig.type === 'fieldGroup') {
        fieldConfig.children.forEach((childControl: any) => {
          controls[childControl.id] = FormHelper.createControl(childControl, fields);
        });
        return;
      }

      controls[fieldConfig.id] = FormHelper.createControl(fieldConfig, fields);
    });
    return controls;
  }

  public static createControl(field: any, fields?: any): UntypedFormControl {
    let validators: any[] = [];

    if (field.validators) {
      validators = FormHelper.createValidators(field.validators, field, fields);
    }
    const transformedValue = FormHelper.applyToFormTransformers(field.value, field);
    return new UntypedFormControl({ value: transformedValue, disabled: !field.visible }, validators);
  }

  public static createValidators(_validators: any, currentControl: any, controls: any) {
    return Object.keys(_validators)
      .filter((key) => {
        try {
          const validators = Validators[key as keyof Validators] as any;
          validators(_validators[key], currentControl, controls);
          return true;
        } catch (e) {
          return false;
        }
      })
      .map((key) => {
        const validators = Validators[key as keyof Validators] as any;
        return validators(_validators[key], currentControl, controls);
      });
  }

  public static getFormGroupValidationClass(formControl: AbstractControl) {
    if (!formControl) {
      return '';
    }

    return formControl.touched && formControl.invalid ? 'isError' : 'isValid';
  }

  public static addValidators(_validators: any, currentControl: any, customValidators: any) {
    if (!_validators || !currentControl) {
      return;
    }
    Object.keys(_validators).forEach((key) => {
      if (!customValidators?.[key]) {
        return;
      }
      currentControl?.setValidators([
        currentControl.validator,
        customValidators[key](_validators[key], currentControl),
      ]);
    });
  }

  public static getConfigById(controls: Array<Field>, id: string, returnedProp?: string) {
    const config: any = controls.find((controlConfig) => {
      return controlConfig.id === id;
    });
    return returnedProp ? config[returnedProp] : config;
  }

  /**
   * Loads form control config into Field object
   * @param config Field config respecting FieldInterface
   */
  public static loadConfig(config: FieldInterface): Field {
    const field = new Field().loadModel(config);

    if (field.isLeaf()) {
      return field;
    }

    field.children = FormHelper.loadChildren(field.children);
    return field;
  }

  /**
   * Traverses through controls array and loads field object with data
   * @param children Array of field configuration repecting FieldInterface
   * @param childrenPrefix child Id prefix. If set all childrend will have given prefix in id.
   */
  public static loadChildren(children: Array<FieldInterface>, idPrefix = '', model?: any): Array<Field> {
    let tabIndex = 0;
    return children.map((childField) => {
      const clonedChild = cloneDeep(childField);
      if (idPrefix) {
        clonedChild.id = idPrefix + clonedChild.id;
      }

      const childControl = new Field().loadModel(clonedChild);

      if (model) {
        childControl.value = model[childControl.id];
      }

      if (childControl.isLeaf()) {
        childControl.tabIndex = ++tabIndex;
        return childControl;
      }

      const prefix = FormHelper.createPrefix(childControl);

      let relationModel = model;

      if (model && childControl.type !== 'fieldGroup') {
        relationModel = model[childControl.id];
      }

      childControl.children = FormHelper.loadChildren(childControl.children, prefix, relationModel);
      return childControl;
    });
  }

  /**
   * Creates prefix for children from control config
   * @param fieldConfig Field config object
   */
  static createPrefix(fieldConfig: Field): string {
    return fieldConfig.prefixFields === true ? fieldConfig.id : (fieldConfig.prefixFields as string);
  }

  /**
   * Sets visibility to true (shows control) in UI
   */
  public static showField(controlConfig: Field, formControl: AbstractControl, options = { reset: true }) {
    if (controlConfig.type === 'fieldGroup') {
      controlConfig.children.forEach((child: any) => {
        const childControl = formControl?.get(child.id);
        if (!childControl) {
          return;
        }
        FormHelper.showField(child, childControl);
      });
    }

    if (formControl?.enabled) {
      return;
    }

    controlConfig.visible = true;
    if (options.reset) {
      formControl?.reset(controlConfig.initialConfig.value, { emitEvent: false });
    }
    formControl?.enable({ emitEvent: false });
    formControl?.updateValueAndValidity();
  }

  /**
   * Sets visibility to false (hides control) in UI, resets if opted
   */
  public static hideField(controlConfig: Field, formControl: AbstractControl, options = { reset: true }) {
    if (controlConfig.type === 'fieldGroup') {
      controlConfig.children.forEach((child: Field) => {
        FormHelper.hideField(child, formControl?.get(child.id) as AbstractControl);
      });
      return;
    }

    if (formControl?.disabled) {
      return;
    }

    controlConfig.visible = false;
    if (options.reset) {
      formControl?.reset();
    }
    formControl?.disable({ emitEvent: false });
  }

  // eslint-disable-next-line @typescript-eslint/default-param-last
  public static toggleField(
    controlConfig: Field,
    formControl: AbstractControl,
    options = { reset: true },
    show: boolean
  ) {
    if (show) {
      FormHelper.showField(controlConfig, formControl, options);
      return;
    }
    FormHelper.hideField(controlConfig, formControl, options);
  }

  public static whenLeaf(array: Array<Field>, callback: (item: Field) => void) {
    array.forEach((item) => {
      if (!item.isLeaf()) {
        FormHelper.whenLeaf(item.children, callback);
        return;
      }
      callback(item);
    });
  }

  /**
   * function applying transformers if they are defined in field configuration.
   * Value from control is transformed and prepared for config
   * @param value that needs to be transformed
   * @param field configuration of the Field
   */
  static applyFromFormTransformers(value: any, field: Field): any {
    let transformedValue = value;
    field.transformers?.forEach((_transformer) => {
      const transformer: TransformerInterface = new _transformer();
      transformedValue = transformer.fromForm(transformedValue, field);
    });
    return transformedValue;
  }

  /**
   * function applying transformers if they are defined in field configuration.
   * Value from fields is transformed and prepared for control
   * @param value that needs to be transformed
   * @param field configuration of the Field
   */
  static applyToFormTransformers(value: any, field: Field): any {
    if (!value) {
      return value;
    }

    if (!field?.transformers || !field.transformers.length) {
      return value;
    }

    let transformedValue = value;

    field.transformers.forEach((_transformer) => {
      const transformer: TransformerInterface = new _transformer();
      transformedValue = transformer.toForm(transformedValue, field);
    });

    return transformedValue;
  }

  /**
   * function applying transformers if they are defined in field configuration.
   * Value from fields is transformed and prepared for control
   *
   * @note Might be useful in future
   */
  static applyToFormTransformersToAll(fields: Array<Field>) {
    FormHelper.whenLeaf(fields, (field) => {
      field.transformers?.forEach((_transformer: any) => {
        const transformer: TransformerInterface = new _transformer();
        if (field.value !== '' && field.value !== null) {
          field.value = transformer.toForm(field.value);
        }
      });
    });
  }

  static getFieldAriaDescribedByHelpId(fieldId = ''): string {
    return fieldId ? `${fieldId}Help` : '';
  }

  static getFieldAriaDescribedByErrorId(fieldId = ''): string {
    return fieldId ? `${fieldId}Error` : '';
  }

  static getFieldAriaDescribedByTooltipId(fieldId = ''): string {
    return fieldId ? `${fieldId}TooltipText` : '';
  }
}
