export class FormBuilderError extends Error {
  override name = 'Solid FormBuilder error';
  override message!: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, FormBuilderError.prototype);
  }
}
