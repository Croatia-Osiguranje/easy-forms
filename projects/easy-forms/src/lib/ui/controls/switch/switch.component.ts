import { Component } from '@angular/core';
import { CheckboxSingleComponent } from '../checkbox-single/checkbox-single.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'easy-switch',
  templateUrl: './switch.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SwitchComponent extends CheckboxSingleComponent {}
