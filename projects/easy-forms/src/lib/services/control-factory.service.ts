import { Inject, Injectable } from '@angular/core';
import { GlobalConfig } from '../models/global.config';
import { FOR_ROOT_CONFIG_TOKEN } from '../forms.config';

import unionBy from 'lodash-es/unionBy';

@Injectable({
  providedIn: 'root',
})
export class ControlFactoryService {
  private _controls: any = [];

  private _validators = null;

  constructor(@Inject(FOR_ROOT_CONFIG_TOKEN) config: GlobalConfig) {
    this._controls = this.mapCustomControls(config);
    this._validators = config.validators;
  }

  private mapCustomControls(config: GlobalConfig) {
    if (!config) {
      return this._controls;
    }
    return unionBy(config.controls, this._controls, 'type');
  }

  get validators() {
    return this._validators;
  }

  get controls() {
    return this._controls;
  }
}
