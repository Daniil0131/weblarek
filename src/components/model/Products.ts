import type { IProduct } from '../../types/index';
import type { IEvents } from '../base/Events';

export class Products {
  private items: IProduct[] = [];
  private preview: IProduct | null = null;

  constructor(private events: IEvents) {}

  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit('catalog:changed');
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItemById(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setPreviewItem(item: IProduct): void {
    this.preview = item;
    this.events.emit('preview:changed');
  }

  getPreviewItem(): IProduct | null {
    return this.preview;
  }
}