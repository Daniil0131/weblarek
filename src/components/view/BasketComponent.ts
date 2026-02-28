
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

import { IEvents } from "../base/Events";


export interface IBasketComponent {
  price: string;
  disabled: boolean;
}

export class BasketComponent extends Component<IBasketComponent> {
  protected basketList: HTMLElement;
  protected buttorBasket: HTMLButtonElement;
  protected priceElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketList = ensureElement<HTMLElement>('.basket__list', this.container);
    this.buttorBasket = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this.priceElement = ensureElement<HTMLElement>('.basket__price', this.container);

    this.buttorBasket.addEventListener('click', () => {
      this.events.emit('order:open');
    });
  }

  set price(value: string) {
    this.priceElement.textContent = value;
  }

  set items(nodes: HTMLElement[]) {
    this.basketList.replaceChildren(...nodes);
  }

  set disabled(value: boolean) {
    this.buttorBasket.disabled = value;
  }
}