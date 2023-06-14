import { Field } from '../models/field';

export interface TransformerInterface {
  fromForm(value: any, field?: Field): any;
  toForm(value: any, field?: Field): any;
}
