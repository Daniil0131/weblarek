import { IProduct } from "../../types";
import { categoryMap } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";

export type TCardPreview = Pick<IProduct, "title" | "price" | "image" | "category" | "description">;


type CategoryKey = keyof typeof categoryMap;

export class CardPreview extends Card<TCardPreview> {
  protected categoryElement: HTMLElement;
  protected textElement: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected imageElement: HTMLImageElement;
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: { onClick?: (evt: MouseEvent) => void }) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);
    this.textElement = ensureElement<HTMLElement>(".card__text", this.container);
    this.basketButton = ensureElement<HTMLButtonElement>(".card__button", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);
    this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);
    if (actions?.onClick) {
      this.basketButton.addEventListener("click", actions.onClick);
    }
  }

  set categoryOther(value: string) {
    this.categoryElement.textContent = value;

    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(
        categoryMap[key as CategoryKey],
        key === value
      );
    }
  }

  set text(value: string) {
    this.textElement.textContent = value;
  }

  set image(value: string) {
    this.setImage(this.imageElement, value, this.title);
  }
  set buttonText(value: string) {
    this.buttonElement.textContent = value;
  }
}