import {
  Component,
  ComponentFactoryResolver,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { ControlFactoryService } from '../../services/control-factory.service';
import { EasyFormsError } from '../../exceptions/forms.exception';
import { ControlStatusChanges } from '../../interfaces/control-status-changes';
import { Field } from '../../models/field';
import { distinctUntilChanged } from 'rxjs/operators';
import { ControlStatusEnum } from '../../enums/control-status-enum';
import { Subscription } from 'rxjs';
import { FormHelper } from '../../helpers/formHelper';

@Component({
  selector: 'easy-control-factory',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ControlFactoryComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ControlFactoryComponent),
      multi: true,
    },
  ],
})
export class ControlFactoryComponent implements OnInit, OnDestroy, Validator {
  @Input() config!: Field;
  @Input() control!: UntypedFormControl;
  instance: any;
  controlStatusChangesSubscription!: Subscription;

  constructor(
    public injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private controlFactoryService: ControlFactoryService
  ) {}

  public ngOnInit(): void {
    this.createControl();
  }

  createControl() {
    let ngControlExist = true;
    try {
      this.injector.get(NgControl);
    } catch (error) {
      ngControlExist = false;
    }

    const currentControl: any = this.controlFactoryService.controls.find((_control: any) => {
      return _control.type === this.config.type;
    });

    if (!currentControl) {
      throw new EasyFormsError('Cannot find control for type: ' + this.config.type);
    }
    FormHelper.addValidators(this.config.validators, this.control, this.controlFactoryService.validators);

    const componentFactory: any = this.componentFactoryResolver.resolveComponentFactory(currentControl.component);
    const componentRef: any = this.viewContainerRef.createComponent(componentFactory);
    this.instance = componentRef.instance;
    this.instance.config = this.config;
    this.instance.control = this.control;
    componentRef.changeDetectorRef.detectChanges();

    if (!ngControlExist) {
      return;
    }

    if (typeof this.instance.writeValue !== 'function') {
      throw new EasyFormsError(this.instance.constructor.name + ' must implement ControlValueAccessor');
    }

    this.subscribeOnFormStatusChanges();

    this.injector.get(NgControl).valueAccessor = this.instance;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (typeof this.instance.validate === 'function') {
      const validator = this.instance as Validator;
      return validator.validate(control);
    }
    return null;
  }

  subscribeOnFormStatusChanges() {
    if (this.control && typeof this.instance.onStatusChanges === 'function') {
      const controlStatusChanges = this.instance as ControlStatusChanges;
      controlStatusChanges.onStatusChanges(this.control.status as ControlStatusEnum);
      this.controlStatusChangesSubscription = this.control.statusChanges
        .pipe(distinctUntilChanged())
        .subscribe((status: any) => {
          const controlStatus: ControlStatusEnum = status;
          controlStatusChanges.onStatusChanges(controlStatus);
        });
    }
  }

  ngOnDestroy(): void {
    this.controlStatusChangesSubscription?.unsubscribe();
  }
}
