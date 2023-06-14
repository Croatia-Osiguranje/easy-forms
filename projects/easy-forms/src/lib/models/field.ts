import cloneDeep from 'lodash-es/cloneDeep';
import { Model } from './model';
import { TriggerInterface } from '../triggers/trigger.interface';
import { FieldInterface } from '../interfaces/field.interface';
import { ModelsConfig } from '../interfaces/models-config';
import { FormHelper } from '../helpers/formHelper';

export class Field extends Model implements FieldInterface {
  id!: string;
  label?: string;
  groupName?: string;
  disabled = false;
  type!: string;
  value: any = '';
  validators?: any;
  attributes?: any = {};
  transformers?: Array<any>;
  wrapperClass?: string = '';
  cssClass?: string = '';
  visible?: boolean = true;
  metaData?: any;
  children?: any;
  models?: ModelsConfig;
  triggers?: Array<TriggerInterface>;
  prefixFields: boolean | string = false;
  initialConfig!: FieldInterface;
  tabIndex?: number = 0;
  component?: any;
  direction?: 'row' | 'col' = 'row';

  override loadModel(input: FieldInterface): this {
    Object.assign(this, input);
    this.handleInitialConfig(input);
    return this;
  }

  private handleInitialConfig(input: any): void {
    this.initialConfig = cloneDeep(input);

    if (this.initialConfig.type === 'subForm') {
      this.setDefaultValues(this.initialConfig);
    }

    // Every control holds its own initialConfig. No need to hold all childrens initialConfigs.
    if (!this.isLeaf()) {
      this.initialConfig.children = [];
    }
  }

  /**
   * Sets default values to subFrom,
   * so later when subForms visibility is being toggled,
   * fields can get their initial default value
   * @param subForm: {FieldInterface} of type 'subForm'
   */
  private setDefaultValues(subForm: FieldInterface) {
    const value: any = {};
    subForm.children.forEach((field: any) => {
      if (field.type === 'subForm') {
        this.setDefaultValues(field);
      }
      const prefix = FormHelper.createPrefix(subForm as Field) || '';
      value[`${prefix}${field.id}`] = field.value;
    });
    subForm.value = value;
  }

  hasTriggers(): boolean {
    return this.triggers !== undefined;
  }

  valueIsSet(): boolean {
    return this.value !== '' && this.value !== undefined;
  }

  isStepLink() {
    return this.type === 'stepLink';
  }

  /**
   * assigns values from initialConfig and rebuilds children
   */
  reset() {
    if (this.isLeaf()) {
      Object.assign(this, this.initialConfig);
      return;
    }

    const { children, ...withoutChildren } = this.initialConfig;
    Object.assign(this, withoutChildren);
    this.children.forEach((child: any) => {
      child.reset();
    });
  }

  /**
   * The last field in the configuration tree
   */
  isLeaf() {
    return this.type !== 'fieldGroup' && this.type !== 'subForm';
  }
}
