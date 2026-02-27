import type { IBuyer } from '../../types/index';
import type { IEvents } from '../base/Events';

export class Buyer {
  private data: IBuyer = {
    payment: null,
    email: '',
    phone: '',
    address: '',
  };

  constructor(private events: IEvents) {}

  setData(payload: Partial<IBuyer>): void {
    this.data = { ...this.data, ...payload };
    this.events.emit('buyer:changed');
  }

  getData(): IBuyer {
    return this.data;
  }

  clear(): void {
    this.data = {
      payment: null,
      email: '',
      phone: '',
      address: '',
    };
    this.events.emit('buyer:changed');
  }

  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    if (!this.data.payment) errors.payment = 'Не выбран способ оплаты';
    if (!this.data.address.trim()) errors.address = 'Укажите адрес доставки';
    if (!this.data.email.trim()) errors.email = 'Укажите email';
    if (!this.data.phone.trim()) errors.phone = 'Укажите телефон';

    return errors;
  }
}