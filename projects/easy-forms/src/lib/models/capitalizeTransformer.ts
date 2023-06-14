import { StringHelper } from '../helpers/string.helper';
import { TransformerInterface } from '../interfaces/transformer-interface';

export class CapitalizeTransformer implements TransformerInterface {
  constructor() {}

  toForm(value: string) {
    return value;
  }

  fromForm(value: string) {
    if (!value) {
      return value;
    }
    return StringHelper.capitalize(value);
  }
}
