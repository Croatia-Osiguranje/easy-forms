import { TransformerInterface } from '../interfaces/transformer-interface';

export class ToUpperCaseTransformer implements TransformerInterface {
  constructor() {}
  toForm(value: string) {
    return value;
  }

  fromForm(value: string) {
    return value?.toUpperCase();
  }
}
