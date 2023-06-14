export class StringHelper {
  public static removeSpaces(value: string): string {
    return value.replace(/\s/g, '');
  }

  public static capitalize(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  }

  public static initCapitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
