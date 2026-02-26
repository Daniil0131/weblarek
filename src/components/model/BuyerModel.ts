import type { IEvents } from '../base/Events';
import { Buyer } from './Buyer';

export class BuyerModel {
  constructor(
    private readonly events: IEvents,
    private readonly buyer: Buyer
  ) {}

  setData(data: any) {
    this.buyer.setData(data);
    this.events.emit('buyer:changed', this.buyer.getData());
  }

  clear() {
    this.buyer.clear();
    this.events.emit('buyer:changed', this.buyer.getData());
  }

  getData() {
    return this.buyer.getData();
  }

  validate() {
    return this.buyer.validate();
  }
}