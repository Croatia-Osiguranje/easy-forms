import { ControlStatusEnum } from '../enums/control-status-enum';

export interface ControlStatusChanges {
  /**
   * Fired everytime when formControl's status changed
   * @param status of single formControl (VALID, INVALID, DISABLED, PENDING)
   */
  onStatusChanges(status: ControlStatusEnum): void;
}
