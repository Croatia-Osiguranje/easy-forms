export class EasyFormsError extends Error {
  override name = 'EasyForms Error';
  override message!: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EasyFormsError.prototype);
  }
}
