import './scss/styles.scss';

import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';

import { Api } from './components/base/Api';

import { Products } from './components/model/Products';
import { Basket } from './components/model/Basket';
import { Buyer } from './components/model/Buyer';
import { LarekApi } from './components/base/LarekApi';

const productsModel = new Products();
const basketModel = new Basket();
const buyerModel = new Buyer();

console.log('Каталог');
productsModel.setItems(apiProducts.items);
console.log('getItems:', productsModel.getItems());

const first = apiProducts.items[0];
if (first) {
  console.log('getItemById:', productsModel.getItemById(first.id));
  productsModel.setPreviewItem(first);
  console.log('getPreviewItem:', productsModel.getPreviewItem());
}

console.log('Корзина');
if (first) {
  basketModel.add(first);
  console.log('getItems:', basketModel.getItems());
  console.log('getCount:', basketModel.getCount());
  console.log('has:', basketModel.has(first.id));
  console.log('getTotal:', basketModel.getTotal());
  basketModel.remove(first);
  console.log('после remove:', basketModel.getItems());
}
basketModel.clear();
console.log('после clear:', basketModel.getItems());

console.log('Покупатель');
buyerModel.setData({ payment: 'card' });
buyerModel.setData({ address: 'СПб, Невский 1' });
buyerModel.setData({ email: 'test@test.ru', phone: '+79990000000' });
console.log('getData:', buyerModel.getData());
console.log('validate:', buyerModel.validate());
buyerModel.clear();
console.log('после clear:', buyerModel.getData());

console.log('сервер');
const api = new Api(API_URL);
const larekApi = new LarekApi(api);

larekApi.getProducts()
  .then((items) => {
    productsModel.setItems(items);
    console.log('Каталог с сервера:', productsModel.getItems());
  })
  .catch((err) => console.error('Ошибка запроса', err));