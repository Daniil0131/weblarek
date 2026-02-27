import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

export type FormChangePayload = {
  form: string;
  field: string;
  value: string;
};

export interface IFormBaseData {
  valid: boolean;
  errors: string;
}

export class Form<T> extends Component<T> {
  protected form: HTMLFormElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLFormElement) {
    super(container);

    this.form = container;
    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.form);
    this.errorsElement = ensureElement<HTMLElement>(".form__errors", this.form);

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit(`${this.form.name}:submit`);
    });

    this.form.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      if (!target?.name) return;

      this.events.emit("form:change", {
        form: this.form.name,
        field: target.name,
        value: target.value,
      } satisfies FormChangePayload);
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.errorsElement.textContent = value ?? "";
  }
}