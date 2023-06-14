import { TransformerInterface } from '../interfaces/transformer-interface';
import { StringHelper } from './../helpers/string.helper';

export class InitCapitalizeTransformer implements TransformerInterface {
  constructor() {}

  toForm(value: string) {
    return value;
  }

  fromForm(value: string) {
    if (!value) {
      return value;
    }
    return StringHelper.initCapitalize(value);
  }
}
