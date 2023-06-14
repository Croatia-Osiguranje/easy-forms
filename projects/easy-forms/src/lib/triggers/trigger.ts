import { UntypedFormGroup } from '@angular/forms';
import { Model } from '../models/model'; 
import { Field } from '../models/field';
import { TriggerInterface } from './trigger.interface';

/**
 * Triggers in Formbuilder trigger some action on form.
 * For example when the value is set show some fields
 */
export abstract class Trigger extends Model implements TriggerInterface {
  event!: string;
  action!: string;
  condition!: Array<string>;
  nested?: string;
  fail: Array<string> = [];
  pass!: Array<string>;
  resetValues!: boolean;

  abstract testCondition(value: any): boolean;
  abstract apply(controlsConfig: Array<Field>, form: UntypedFormGroup, passes: boolean): any;
}
