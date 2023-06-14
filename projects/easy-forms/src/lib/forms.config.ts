import { InjectionToken } from '@angular/core';
import { GlobalConfig } from './models/global.config';

export const FOR_ROOT_CONFIG_TOKEN = new InjectionToken<GlobalConfig>('forRoot() Easy forms Global Configuration.');
