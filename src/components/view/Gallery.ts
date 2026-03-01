
import { Component } from "../base/Component";

export interface IGallery {
  items: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set items(nodes: HTMLElement[]) {
    this.container.replaceChildren(...nodes);
  }
}