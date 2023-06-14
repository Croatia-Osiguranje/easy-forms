import { FormBuilderError } from '../errors/form-builder.error';
import { ToggleVisibilityTrigger } from './toggle-visibility.trigger';
import { TriggerInterface } from './trigger.interface';
import { TriggersEnum } from './triggers.enum';

export class TriggerFactory {
  public static create(trigger: TriggerInterface) {
    switch (trigger.action) {
      case TriggersEnum.toggleVisibility:
        return new ToggleVisibilityTrigger().loadModel(trigger);
      default:
        throw new FormBuilderError('Trigger does not exist!');
    }
  }
}
