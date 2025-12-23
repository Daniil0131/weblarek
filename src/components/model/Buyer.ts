import { IBuyer } from '../../types/index';

export class Buyer {
  private data: IBuyer = {
    payment: null,
    email: '',
    phone: '',
    address: '',
  };

  setData(payload: Partial<IBuyer>): void {
    this.data = { ...this.data, ...payload };
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