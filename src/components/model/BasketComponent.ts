
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

import { IEvents } from "../base/Events";


export interface IBasketComponent {
  price: string;
}


export class BasketComponent extends Component<IBasketComponent> {
  protected basketList: HTMLElement;
  protected buttorBasket: HTMLElement;
  protected priceElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketList = ensureElement<HTMLElement>('.basket__list', this.container);
    this.buttorBasket = ensureElement<HTMLElement>('.basket__button', this.container);
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
  public get element(): HTMLElement {
    return this.container;
  }
}
