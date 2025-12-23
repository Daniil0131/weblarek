import { IProduct } from '../../types/index';

export class Products {
  private items: IProduct[] = [];
  private preview: IProduct | null = null;

  setItems(items: IProduct[]): void {
    this.items = items;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItemById(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setPreviewItem(item: IProduct): void {
    this.preview = item;
  }

  getPreviewItem(): IProduct | null {
    return this.preview;
  }
}