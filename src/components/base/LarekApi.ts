import { IApi, IProduct, IProductsResponse, IOrder } from '../../types/index';

export class LarekApi {
  constructor(private api: IApi) {}

  getProducts(): Promise<IProduct[]> {
    return this.api
      .get<IProductsResponse>('/product/')
      .then((res) => res.items);
  }

  order(data: IOrder): Promise<unknown> {
    return this.api.post('/order/', data);
  }
}