import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';

import { Api } from './components/base/Api';
import { LarekApi } from './components/base/LarekApi';
import { EventEmitter } from './components/base/Events';

import { Products } from './components/model/Products';
import { Basket } from './components/model/Basket';
import { Buyer } from './components/model/Buyer';

import type { IProduct } from './types';

import { Header } from './components/view/Header';
import { Modal } from './components/view/Modal';
import { BasketComponent } from './components/view/BasketComponent';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { SuccessView } from './components/view/SuccessView';
import type { FormChangePayload } from './components/view/Form';
import { Gallery } from './components/view/Gallery';
import { CardBasket } from './components/view/CardBasket';


function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'Бесценно';
  return `${price} синапсов`;
}

const events = new EventEmitter();


const api = new Api(API_URL);
const larekApi = new LarekApi(api);


const products = new Products(events);
const basket = new Basket(events);
const buyer = new Buyer(events);




const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');


const header = new Header(events, ensureElement('.header'));
const modal = new Modal(events, ensureElement('#modal-container'));

const basketNode = cloneTemplate<HTMLElement>(basketTemplate);
const basketView = new BasketComponent(events, basketNode);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const orderForm = new OrderForm(events, cloneTemplate(orderTemplate));
const contactsForm = new ContactsForm(events, cloneTemplate(contactsTemplate));
const successView = new SuccessView(events, cloneTemplate(successTemplate));

basketView.disabled = basket.getCount() === 0;
basketView.price = `${basket.getTotal()} синапсов`;
header.counter = basket.getCount();

let activeStep: 'order' | 'contacts' | null = null;


function syncFormsFromBuyer() {
  const data = buyer.getData();

  if (data.payment) orderForm.payment = data.payment;
  orderForm.address = data.address;

  contactsForm.email = data.email;
  contactsForm.phone = data.phone;
}



function renderBasket() {
  const items = basket.getItems();
  const total = basket.getTotal();
  const count = basket.getCount();

  header.counter = count;
  basketView.disabled = count === 0;

  const nodes = items.map((item, index) => {
    const row = new CardBasket(events, cloneTemplate<HTMLLIElement>(basketItemTemplate));

    return row.render({
      id: item.id,
      index: index + 1,
      title: item.title,
      price: formatPrice(item.price),
    });
  });

  basketView.items = nodes;
  basketView.price = `${total} синапсов`;
}


events.on('catalog:changed', () => {
  const cards = products.getItems().map((item: IProduct) => {
    const card = new CardCatalog(events, cloneTemplate(cardCatalogTemplate));

    return card.render({
      id: item.id,
      image: `${CDN_URL}${item.image}`,
      category: item.category,
      title: item.title,
      price: formatPrice(item.price),
    });
  });

  gallery.items = cards;
});

events.on('preview:changed', () => {
  const item = products.getPreviewItem();
  if (!item) return;

  const inBasket = basket.has(item.id);
  const isPriceless = item.price === null;

  const preview = new CardPreview(events, cloneTemplate(cardPreviewTemplate));

  modal.open(preview.render({
    title: item.title,
    price: formatPrice(item.price),
    image: { src: `${CDN_URL}${item.image}`, alt: item.title },
    categoryOther: item.category,
    text: item.description,
    buttonText: isPriceless ? 'Недоступно' : inBasket ? 'Удалить из корзины' : 'В корзину',
    buttonDisabled: isPriceless,
  }));
});

events.on('basket:changed', renderBasket);

events.on('buyer:changed', () => {
  const errors = buyer.validate();

  const keys =
    activeStep === 'order'
      ? (['payment', 'address'] as const)
      : activeStep === 'contacts'
        ? (['email', 'phone'] as const)
        : ([] as const);

  const stepErrors = keys.map(k => errors[k]).filter(Boolean) as string[];
  const isValid = stepErrors.length === 0;
  const errorsText = stepErrors.join(', ');

  if (activeStep === 'order') {
    orderForm.errors = errorsText;
    orderForm.valid = isValid;
  }

  if (activeStep === 'contacts') {
    contactsForm.errors = errorsText;
    contactsForm.valid = isValid;
  }

  syncFormsFromBuyer();
});


events.on<{ id: string }>("card:select", ({ id }) => {
  const item = products.getItemById(id);
  if (!item) return;
  products.setPreviewItem(item);
});

events.on('basket:toggle', () => {
  const item = products.getPreviewItem();
  if (!item) return;

  basket.has(item.id) ? basket.remove(item) : basket.add(item);
  modal.close();
});

events.on<{ id: string }>('basket:remove', ({ id }) => basket.removeById(id));

events.on('basket:open', () => {
  renderBasket();
  modal.open(basketView.render());
});

events.on('order:open', () => {
  activeStep = 'order';
  syncFormsFromBuyer();
  modal.open(orderForm.render());
});

events.on<FormChangePayload>('form:change', ({ field, value }) => {
  buyer.setData({ [field]: value });
});

events.on('order:submit', () => {
  activeStep = 'contacts';
  syncFormsFromBuyer();
  modal.open(contactsForm.render());
});

events.on('contacts:submit', async () => {
  try {
    const data = buyer.getData();
    if (!data.payment) return;

    const result = await larekApi.order({
        items: basket.getItems().map(i => i.id),
        total: basket.getTotal(),
        payment: data.payment,
        email: data.email,
        phone: data.phone,
        address: data.address,
    });

    basket.clear();
    buyer.clear();
    activeStep = null;

    modal.open(successView.render({ total: result.total }));
  } catch (err) {
    console.error('Ошибка оформления заказа', err);
  }
});

events.on('success:close', () => modal.close());

events.on('modal:close', () => {
  activeStep = null;
});


larekApi.getProducts()
  .then(items => products.setItems(items))
  .catch(err => console.error('Ошибка запроса', err));