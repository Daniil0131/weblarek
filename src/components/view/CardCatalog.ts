import type { IProduct } from "../../types";
import { categoryMap } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";
import type { IEvents } from "../base/Events";

type CategoryKey = keyof typeof categoryMap;

export type TCardCatalog = Pick<IProduct, "id" | "title" | "image" | "category"> & {
  price: string;
};

export class CardCatalog extends Card<TCardCatalog> {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;

  constructor(private events: IEvents, container: HTMLElement) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);

    this.container.addEventListener("click", () => {
      const id = this.container.dataset.id;
      if (!id) return;
      this.events.emit("card:select", { id });
    });
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(categoryMap[key as CategoryKey], key === value);
    }
  }

  set title(value: string) {
    super.title = value;
    this.imageElement.alt = value;
  }

  set image(value: string) {
    this.imageElement.src = value;
  }
}