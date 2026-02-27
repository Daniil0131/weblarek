import type { IProduct } from "../../types";
import { CDN_URL } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";
import { LarekApi } from "../base/LarekApi";
import { SuccessView } from "../view/SuccessView";
import { Header } from "../view/Header";
import { BasketComponent } from "../view/BasketComponent";
import { CardCatalog } from "../view/CardCatalog";
import { CardPreview } from "../view/CardPreview";
import { OrderForm } from "../view/OrderForm";
import { ContactsForm } from "../view/ContactsForm";
import type { FormChangePayload } from "../view/Form";
import { Modal } from "../view/Modal";

type ProductsLike = {
  setItems(items: IProduct[]): void;
  getItems(): IProduct[];
  getItemById(id: string): IProduct | undefined;
  setPreviewItem(item: IProduct): void;
  getPreviewItem(): IProduct | null;
};

type BasketLike = {
  has(id: string): boolean;
  add(item: IProduct): void;
  remove(item: IProduct): void;
  clear(): void;
  getItems(): IProduct[];
  getTotal(): number;
  getCount(): number;
};

type BuyerLike = {
  setData(data: Record<string, unknown>): void;
  validate(): Partial<Record<string, string>>;
  getData(): any;
  clear?(): void;
};

type CardActions = { onClick?: (evt: MouseEvent) => void };

function cloneTemplate<T extends HTMLElement>(template: HTMLTemplateElement): T {
  return template.content.firstElementChild!.cloneNode(true) as T;
}

function formatPrice(price: number | null): string {
  return price === null ? "Бесценно" : `${price} синапсов`;
}

export class Presenter {
  private successTemplate: HTMLTemplateElement;
  private galleryEl: HTMLElement;

  private cardCatalogTemplate: HTMLTemplateElement;
  private cardPreviewTemplate: HTMLTemplateElement;
  private basketTemplate: HTMLTemplateElement;
  private basketItemTemplate: HTMLTemplateElement;
  private orderTemplate: HTMLTemplateElement;
  private contactsTemplate: HTMLTemplateElement;

  private basketView: BasketComponent;
  private header: Header;
  private modal: Modal;

  private orderFormView: OrderForm | null = null;
  private contactsFormView: ContactsForm | null = null;

  constructor(
    private events: EventEmitter,
    private products: ProductsLike,
    private basket: BasketLike,
    private buyer: BuyerLike,
    private api: LarekApi
  ) {
    this.galleryEl = ensureElement<HTMLElement>(".gallery");
    this.successTemplate = ensureElement<HTMLTemplateElement>("#success");

    this.cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
    this.cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
    this.basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
    this.basketItemTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
    this.orderTemplate = ensureElement<HTMLTemplateElement>("#order");
    this.contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");

    const headerEl = ensureElement<HTMLElement>(".header");
    this.header = new Header(this.events, headerEl);

    const basketNode = cloneTemplate<HTMLElement>(this.basketTemplate);
    this.basketView = new BasketComponent(this.events, basketNode);

    const modalEl = ensureElement<HTMLElement>("#modal-container");
    this.modal = new Modal(this.events, modalEl);

    this.bindHandlers();

    this.events.on("success:close", () => this.modal.close());

    this.events.on("modal:close", () => {
      this.orderFormView = null;
      this.contactsFormView = null;
    });
  }

  public start() {
    this.api
      .getProducts()
      .then((items: IProduct[]) => {
        this.products.setItems(items);

        this.events.emit("basket:changed");
        this.events.emit("buyer:changed");
      })
      .catch((err: unknown) => console.error("Ошибка запроса", err));
  }

  private bindHandlers() {
    this.events.on("catalog:changed", () => {
      this.renderCatalog(this.products.getItems());
    });

    this.events.on("basket:changed", () => {
      const items = this.basket.getItems();
      const total = this.basket.getTotal();
      const count = this.basket.getCount();

      this.basketView.disabled = count === 0;
      this.header.counter = count;

      this.renderBasket(items, total);
    });

    this.events.on("buyer:changed", () => this.onBuyerChanged());

    this.events.on<IProduct>("card:select", (item) => {
      this.products.setPreviewItem(item);
      this.openPreview(item);
    });

    this.events.on("basket:toggle", () => {
      const item = this.products.getPreviewItem();
      if (!item) return;

      if (this.basket.has(item.id)) this.basket.remove(item);
      else this.basket.add(item);

      this.modal.close();
    });

    this.events.on<IProduct>("basket:remove", (item) => {
      this.basket.remove(item);
    });

    this.events.on("basket:open", () => {
      this.openBasket();
    });

    this.events.on("order:open", () => {
      this.openOrder();
      this.onBuyerChanged();
    });

    this.events.on<FormChangePayload>("form:change", ({ field, value }) => {
      this.buyer.setData({ [field]: value });
      this.events.emit("buyer:changed");
    });

    this.events.on("order:submit", () => {
      this.openContacts();
      this.onBuyerChanged();
    });

    this.events.on("contacts:submit", async () => {
      try {
        const buyerData = this.buyer.getData();

        const order = {
          items: this.basket.getItems().map((item) => item.id),
          total: this.basket.getTotal(),
          payment: buyerData.payment,
          email: buyerData.email,
          phone: buyerData.phone,
          address: buyerData.address,
        };

        const response = await this.api.order(order);

        this.basket.clear();
        this.buyer.clear?.();

        this.openSuccess(response.total);
      } catch (err) {
        console.error("Ошибка оформления заказа:", err);
      }
    });
  }

  private openSuccess(total: number) {
    const node = cloneTemplate<HTMLElement>(this.successTemplate);
    const success = new SuccessView(this.events, node);
    this.modal.open(success.render({ total } as any));
  }

  private renderCatalog(items: IProduct[]) {
    const cards = items.map((item) => {
      const card = new CardCatalog(
        cloneTemplate(this.cardCatalogTemplate),
        { onClick: () => this.events.emit("card:select", item) } satisfies CardActions
      );

      return card.render({
        image: `${CDN_URL}${item.image}`,
        category: item.category,
        title: item.title,
        price: formatPrice(item.price),
      } as any);
    });

    this.galleryEl.replaceChildren(...cards);
  }

  private openPreview(item: IProduct) {
    const inBasket = this.basket.has(item.id);
    const isPriceless = item.price === null;

    const preview = new CardPreview(cloneTemplate(this.cardPreviewTemplate), {
      onClick: () => this.events.emit("basket:toggle"),
    });

    const node = preview.render({
      title: item.title,
      price: formatPrice(item.price),
      image: { src: `${CDN_URL}${item.image}`, alt: item.title },
      categoryOther: item.category,
      text: item.description,
      buttonText: isPriceless ? "Недоступно" : inBasket ? "Удалить из корзины" : "В корзину",
      buttonDisabled: isPriceless,
    });

    this.modal.open(node);
  }

  private openBasket() {
    this.modal.open(this.basketView.element);

    this.events.emit("basket:changed");
  }

  private renderBasket(items: IProduct[], total: number) {
    const nodes = items.map((item, index) => {
      const li = cloneTemplate<HTMLLIElement>(this.basketItemTemplate);

      ensureElement<HTMLElement>(".basket__item-index", li).textContent = String(index + 1);
      ensureElement<HTMLElement>(".card__title", li).textContent = item.title;
      ensureElement<HTMLElement>(".card__price", li).textContent = formatPrice(item.price);

      const delBtn = ensureElement<HTMLButtonElement>(".basket__item-delete", li);
      delBtn.addEventListener("click", () => this.events.emit("basket:remove", item));

      return li;
    });

    this.basketView.items = nodes;
    this.basketView.price = `${total} синапсов`;
  }

  private openOrder() {
    const formNode = cloneTemplate<HTMLFormElement>(this.orderTemplate);

    this.orderFormView = new OrderForm(this.events, formNode);
    this.contactsFormView = null;

    this.orderFormView.errors = "";
    this.orderFormView.valid = false;

    this.syncFormsFromBuyer();

    this.modal.open(this.orderFormView.render());
  }

  private openContacts() {
    const formNode = cloneTemplate<HTMLFormElement>(this.contactsTemplate);

    this.contactsFormView = new ContactsForm(this.events, formNode);
    this.orderFormView = null;

    this.contactsFormView.errors = "";
    this.contactsFormView.valid = false;

    this.syncFormsFromBuyer();

    this.modal.open(this.contactsFormView.render());
  }

  private onBuyerChanged() {
    const errors = this.buyer.validate();
 
    const keys = this.orderFormView
      ? (["payment", "address"] as const)
      : this.contactsFormView
        ? (["email", "phone"] as const)
        : ([] as const);

    const stepErrors = keys.map((k) => errors[k]).filter(Boolean) as string[];

    const errorsText = stepErrors.join(", ");
    const isValid = stepErrors.length === 0;

    if (this.orderFormView) {
      this.orderFormView.errors = errorsText;
      this.orderFormView.valid = isValid;
    }

    if (this.contactsFormView) {
      this.contactsFormView.errors = errorsText;
      this.contactsFormView.valid = isValid;
    }

    this.syncFormsFromBuyer();
  }

  private syncFormsFromBuyer() {
    const data = this.buyer.getData?.() ?? {};

    if (this.orderFormView) {
      if (data.payment) this.orderFormView.payment = data.payment;
      if (typeof data.address === "string") this.orderFormView.address = data.address;
    }

    if (this.contactsFormView) {
      if (typeof data.email === "string") this.contactsFormView.email = data.email;
      if (typeof data.phone === "string") this.contactsFormView.phone = data.phone;
    }
  }
}