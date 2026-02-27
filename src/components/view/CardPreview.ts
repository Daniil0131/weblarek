import { categoryMap } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";

type CategoryKey = keyof typeof categoryMap;

export type TCardPreview = {
  title: string;
  price: string;
  categoryOther: string;
  text: string;
  image: { src: string; alt: string };
  buttonText: string;
  buttonDisabled: boolean;
};

export class CardPreview extends Card<TCardPreview> {
  protected categoryElement: HTMLElement;
  protected textElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: { onClick?: (evt: MouseEvent) => void }) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);
    this.textElement = ensureElement<HTMLElement>(".card__text", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);
    this.buttonElement = ensureElement<HTMLButtonElement>(".card__button", this.container);

    this.buttonElement.addEventListener("click", (evt) => {
      if (this.buttonElement.disabled) return;
      actions?.onClick?.(evt);
    });
  }

  set categoryOther(value: string) {
    this.categoryElement.textContent = value;

    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(categoryMap[key as CategoryKey], key === value);
    }
  }

  set text(value: string) {
    this.textElement.textContent = value;
  }

  set image(value: { src: string; alt: string }) {
    this.setImage(this.imageElement, value.src, value.alt);
  }

  set buttonText(value: string) {
    this.buttonElement.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.buttonElement.disabled = value;
  }
}