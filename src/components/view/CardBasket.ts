import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

export interface ICardBasket {
  id: string;
  index: number;
  title: string;
  price: string;
}

export class CardBasket extends Component<ICardBasket> {
  private indexEl: HTMLElement;
  private titleEl: HTMLElement;
  private priceEl: HTMLElement;
  private deleteBtn: HTMLButtonElement;

  constructor(private events: IEvents, container: HTMLLIElement) {
    super(container);

    this.indexEl = ensureElement(".basket__item-index", this.container);
    this.titleEl = ensureElement(".card__title", this.container);
    this.priceEl = ensureElement(".card__price", this.container);
    this.deleteBtn = ensureElement<HTMLButtonElement>(".basket__item-delete", this.container);

    this.deleteBtn.addEventListener("click", () => {
      const id = this.container.dataset.id;
      if (!id) return;
      this.events.emit("basket:remove", { id });
    });
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  set index(value: number) {
    this.indexEl.textContent = String(value);
  }

  set title(value: string) {
    this.titleEl.textContent = value;
  }

  set price(value: string) {
    this.priceEl.textContent = value;
  }
}