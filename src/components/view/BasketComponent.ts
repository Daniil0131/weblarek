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
  protected emptyElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketList = ensureElement<HTMLElement>(".basket__list", this.container);
    this.orderButton = ensureElement<HTMLButtonElement>(".basket__button", this.container);
    this.priceElement = ensureElement<HTMLElement>(".basket__price", this.container);

    this.emptyElement =
      this.container.querySelector<HTMLElement>(".basket__empty") ??
      this.createEmptyElement();

    this.orderButton.addEventListener("click", () => {
      this.events.emit("order:open");
    });
  }

  private createEmptyElement(): HTMLElement {
    const p = document.createElement("p");
    p.className = "basket__empty";
    p.textContent = "Корзина пуста";
    this.basketList.before(p);
    return p;
  }

  set disabled(value: boolean) {
    this.orderButton.disabled = value;
  }

  set price(value: string) {
    this.priceElement.textContent = value;
  }

  set items(nodes: HTMLElement[]) {
    const isEmpty = nodes.length === 0;

    this.emptyElement.style.display = isEmpty ? "" : "none";

    this.basketList.replaceChildren(...nodes);
  }
}