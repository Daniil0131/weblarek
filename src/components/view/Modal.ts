import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

export interface IModalData {
  content: HTMLElement;
  isOpen: boolean;
}

export class Modal extends Component<IModalData> {
  protected contentEl: HTMLElement;
  protected closeBtn: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.contentEl = ensureElement<HTMLElement>(".modal__content", this.container);
    this.closeBtn = ensureElement<HTMLButtonElement>(".modal__close", this.container);

    this.closeBtn.addEventListener("click", () => this.close());
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open(content: HTMLElement) {
    this.content = content;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.contentEl.replaceChildren();
    this.events.emit("modal:close");
  }

  set content(value: HTMLElement) {
    this.contentEl.replaceChildren(value);
  }

  set isOpen(value: boolean) {
    this.container.classList.toggle("modal_active", value);
  }
}