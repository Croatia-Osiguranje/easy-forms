export interface GlobalConfig {
  controls: Array<Control>;
  validators?: any;
}

interface Control {
  type: string;
  component: object;
}
