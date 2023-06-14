import { StringHelper } from '../helpers/string.helper';
import { TransformerInterface } from '../interfaces/transformer-interface';

export class RemoveSpacesTransformer implements TransformerInterface {
  constructor() {}

  toForm(value: string) {
    return value;
  }

  fromForm(value: string) {
    return value ? StringHelper.removeSpaces(value) : value;
  }
}
