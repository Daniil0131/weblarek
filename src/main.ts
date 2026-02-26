import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { LarekApi } from './components/base/LarekApi';
import { EventEmitter } from './components/base/Events';
import { Products } from './components/model/Products';
import { Basket } from './components/model/Basket';
import { Buyer } from './components/model/Buyer';
import { ProductsModel } from './components/model/ProductsModel';
import { BasketModel } from './components/model/BasketModel';
import { BuyerModel } from './components/model/BuyerModel';
import { Presenter } from './components/presenter/Presenter';

const events = new EventEmitter();

const api = new Api(API_URL);
const larekApi = new LarekApi(api);

const productsCore = new Products();
const basketCore = new Basket();
const buyerCore = new Buyer();

const productsModel = new ProductsModel(events, productsCore);
const basketModel = new BasketModel(events, basketCore);
const buyerModel = new BuyerModel(events, buyerCore);

const presenter = new Presenter(events, productsModel, basketModel as any, buyerModel as any, larekApi);
presenter.start();