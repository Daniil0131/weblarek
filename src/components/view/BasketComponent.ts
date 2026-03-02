import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

export interface IBasketComponent {
  price: string;
  disabled: boolean;
}

export class BasketComponent extends Component<IBasketComponent> {
  protected basketList: HTMLElement;
  protected orderButton: HTMLButtonElement;
  protected priceElement: HTMLElement;


  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketList = ensureElement<HTMLElement>(".basket__list", this.container);
    this.orderButton = ensureElement<HTMLButtonElement>(".basket__button", this.container);
    this.priceElement = ensureElement<HTMLElement>(".basket__price", this.container);


    this.orderButton.addEventListener("click", () => {
      this.events.emit("order:open");
    });
  }
  
  set disabled(value: boolean) {
    this.orderButton.disabled = value;
  }

  set price(value: string) {
    this.priceElement.textContent = value;
  }

  set items(nodes: HTMLElement[]) {
    this.basketList.replaceChildren(...nodes);
  }
}