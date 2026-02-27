import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";
import { Form } from "./Form";

export type PaymentMethod = "card" | "cash";

export interface IOrderFormData {
  payment: PaymentMethod;
  address: string;
  valid: boolean;
  errors: string;
}

export class OrderForm extends Form<IOrderFormData> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

  constructor(events: IEvents, container: HTMLFormElement) {
    super(events, container);

    this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.form);
    this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.form);
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.form);

    this.cardButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.events.emit("form:change", { form: this.form.name, field: "payment", value: "card" });
    });

    this.cashButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.events.emit("form:change", { form: this.form.name, field: "payment", value: "cash" });
    });
  }

  set payment(value: PaymentMethod) {
    this.cardButton.classList.toggle("button_alt-active", value === "card");
    this.cashButton.classList.toggle("button_alt-active", value === "cash");
  }

  set address(value: string) {
    this.addressInput.value = value ?? "";
  }
}