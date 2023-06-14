/**
 * Trigger object and config interface
 */
export interface TriggerInterface {
  event: string;
  condition: Array<any>;
  nested?: string;
  action: string;
  pass: Array<string>;
  fail?: Array<string>;
  resetValues?: boolean;
}
