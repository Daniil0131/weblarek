import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

export interface ISuccessData {
  total: number;
}

export class SuccessView extends Component<ISuccessData> {
  protected descriptionEl: HTMLElement;
  protected closeBtn: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.descriptionEl = ensureElement<HTMLElement>(".order-success__description", this.container);
    this.closeBtn = ensureElement<HTMLButtonElement>(".order-success__close", this.container);

    this.closeBtn.addEventListener("click", () => {
      this.events.emit("success:close");
    });
  }

  set total(value: number) {
    this.descriptionEl.textContent = `Списано ${value} синапсов`;
  }
}