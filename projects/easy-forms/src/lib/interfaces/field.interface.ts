import { TriggerInterface } from '../triggers/trigger.interface';
import { ModelsConfig } from './models-config';

export interface FieldInterface {
  id: string;
  label?: string;
  groupName?: string;
  disabled?: boolean;
  type: string;
  value?: any;
  validators?: any;
  attributes?: object;
  transformers?: Array<any>;
  wrapperClass?: string;
  cssClass?: string;
  visible?: boolean;
  metaData?: any;
  children?: any;
  models?: ModelsConfig;
  triggers?: Array<TriggerInterface>;
  prefixFields?: boolean | string;
  tabIndex?: number;
  component?: any;
  direction?: 'row' | 'col';
}
