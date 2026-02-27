import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

export interface ICard {
  title: string;
  price: string;
}

export class Card<T = unknown> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  protected _title = '';

  constructor(container: HTMLElement) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>(".card__title", this.container);
    this.priceElement = ensureElement<HTMLElement>(".card__price", this.container);
    
  }

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
  }

  protected getTitleForAlt(): string {
    return this._title;
  }

  set price(value: string) {
    this.priceElement.textContent = value;
  }
}