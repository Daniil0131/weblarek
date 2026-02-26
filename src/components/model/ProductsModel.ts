import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';
import { Products } from './Products';

export class ProductsModel {
  constructor(
    private readonly events: IEvents,
    private readonly products: Products
  ) {}

  setItems(items: IProduct[]): void {
    this.products.setItems(items);
    this.events.emit('catalog:changed', items);
  }

  getItems(): IProduct[] {
    return this.products.getItems();
  }

  getItemById(id: string): IProduct | undefined {
    return this.products.getItemById(id);
  }

  setPreviewItem(item: IProduct): void {
    this.products.setPreviewItem(item);
    this.events.emit('product:selected', item);
  }

  getPreviewItem(): IProduct | null {
    return this.products.getPreviewItem();
  }
}