import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";
import { Form } from "./Form";

export interface IContactsFormData {
  email: string;
  phone: string;
  valid: boolean;
  errors: string;
}

export class ContactsForm extends Form<IContactsFormData> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(events: IEvents, container: HTMLFormElement) {
    super(events, container);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.form);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.form);
  }

  set email(value: string) {
    this.emailInput.value = value ?? "";
  }

  set phone(value: string) {
    this.phoneInput.value = value ?? "";
  }
}