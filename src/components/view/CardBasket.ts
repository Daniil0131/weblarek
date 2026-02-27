import type { IProduct } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";
import type { IEvents } from "../base/Events";

export type TCardBasket = Pick<IProduct, "title" | "price"> & {
  index: number;
};

export class CardBasket extends Card<TCardBasket> {
  protected indexElement: HTMLElement;
  protected deleteButton: HTMLButtonElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    private product: IProduct
  ) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container
    );

    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    this.deleteButton.addEventListener("click", () => {
      this.events.emit("basket:remove", this.product);
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

}