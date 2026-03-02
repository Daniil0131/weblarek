import { ensureElement } from "../../utils/utils";
import { Card } from "../view/Card";

export interface ICardBasket {
  index: number;
  title: string;
  price: string;
}
export interface ICardBasketActions {
  onRemove?: () => void;
}

export class CardBasket extends Card<ICardBasket> {
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement;

  constructor(container: HTMLLIElement, actions?: ICardBasketActions) {
    super(container);

    this.indexEl = ensureElement(".basket__item-index", this.container);
    this.deleteBtn = ensureElement<HTMLButtonElement>(".basket__item-delete", this.container);

    if (actions?.onRemove) {
      this.deleteBtn.addEventListener("click", actions.onRemove);
    }
    
  }

  set index(value: number) {
    this.indexEl.textContent = String(value);
  }
}