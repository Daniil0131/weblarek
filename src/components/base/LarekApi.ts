import { IApi, IProduct, IProductsResponse, IOrder, IOrderResponse } from '../../types/index';

export class LarekApi {
  constructor(private api: IApi) {}

  getProducts(): Promise<IProduct[]> {
    return this.api
      .get<IProductsResponse>('/product/')
      .then((res) => res.items);
  }

  order(data: IOrder): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', data);
  }
}