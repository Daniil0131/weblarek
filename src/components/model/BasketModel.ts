import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';
import { Basket } from './Basket';

export class BasketModel {
  constructor(
    private readonly events: IEvents,
    private readonly basket: Basket
  ) {}

  getItems() {
    return this.basket.getItems();
  }

  getCount() {
    return this.basket.getCount();
  }

  getTotal() {
    return this.basket.getTotal();
  }

  has(id: string) {
    return this.basket.has(id);
  }

  toggle(item: IProduct) {
    if (this.basket.has(item.id)) this.basket.remove(item);
    else this.basket.add(item);

    this.emitChanged();
  }

  remove(item: IProduct) {
    this.basket.remove(item);
    this.emitChanged();
  }

  clear() {
    this.basket.clear();
    this.emitChanged();
  }

  private emitChanged() {
    this.events.emit('basket:changed', {
      items: this.getItems(),
      total: this.getTotal(),
      count: this.getCount(),
    });
  }
}