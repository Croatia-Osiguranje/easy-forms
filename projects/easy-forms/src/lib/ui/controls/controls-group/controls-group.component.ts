import { Component, Input } from '@angular/core';

@Component({
  selector: 'easy-controls-group',
  templateUrl: './controls-group.component.html',
})
export class ControlsGroupComponent {
  @Input() isGroup!: boolean;
  constructor() {}
}
