import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageComponent } from './ui/validation-message/validation-message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlsComponent } from './ui/controls.component';
import { ControlsGroupComponent } from './ui/controls/controls-group/controls-group.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ControlComponent } from './ui/controls/control.component';
import { GlobalConfig } from './models/global.config';
import { FOR_ROOT_CONFIG_TOKEN } from './forms.config';
import { ControlFactoryComponent } from './ui/controls/control-factory.component';
import { SubmitButtonComponent } from './ui/submit-button/submit-button.component';
import { ControlFactoryService } from './services/control-factory.service';
import { ControlService } from './services/control.service';

@NgModule({
  declarations: [
    ValidationMessageComponent,
    ControlsComponent,
    ControlsGroupComponent,
    SafeHtmlPipe,
    ControlComponent,
    ControlFactoryComponent,
    SubmitButtonComponent,
  ],
  exports: [
    ValidationMessageComponent,
    ControlsComponent,
    SafeHtmlPipe,
    ControlComponent,
    ControlFactoryComponent,
    SubmitButtonComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class EasyFormsModule {
  static forRoot(config: GlobalConfig): ModuleWithProviders<EasyFormsModule> {
    return {
      ngModule: EasyFormsModule,
      providers: [
        {
          provide: FOR_ROOT_CONFIG_TOKEN,
          useValue: config,
        },
      ],
    };
  }

  static forChild(config: GlobalConfig): ModuleWithProviders<EasyFormsModule> {
    console.log(config);
    return {
      ngModule: EasyFormsModule,
      providers: [
        {
          provide: FOR_ROOT_CONFIG_TOKEN,
          useValue: config,
        },
        ControlFactoryService,
        ControlService,
      ],
    };
  }
}
