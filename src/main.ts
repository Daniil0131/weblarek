import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { LarekApi } from './components/base/LarekApi';
import { EventEmitter } from './components/base/Events';
import { Products } from './components/model/Products';
import { Basket } from './components/model/Basket';
import { Buyer } from './components/model/Buyer';

import { Presenter } from './components/presenter/Presenter';

const events = new EventEmitter();

const api = new Api(API_URL);
const larekApi = new LarekApi(api);

const products = new Products(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

const presenter = new Presenter(events, products, basket, buyer, larekApi);
presenter.start();