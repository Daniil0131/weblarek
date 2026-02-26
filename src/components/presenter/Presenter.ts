import type { IProduct } from "../../types";
import { CDN_URL } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";
import { LarekApi } from "../base/LarekApi";
import { SuccessView } from "../model/SuccessView";
import { Header } from "../model/Header";
import { BasketComponent } from "../model/BasketComponent";
import { CardCatalog } from "../model/CardCatalog";
import { CardPreview } from "../model/CardPreview";
import { OrderForm } from "../model/OrderForm";
import { ContactsForm } from "../model/ContactsForm";
import type { FormChangePayload } from "../model/Form";

type ProductsLike = {
  setItems(items: IProduct[]): void;
  getItems(): IProduct[];
  getItemById(id: string): IProduct | undefined;
  setPreviewItem(item: IProduct): void;
  getPreviewItem(): IProduct | null;
};

type BasketChangedPayload = { items: IProduct[]; total: number; count: number };

type BasketLike = {
  has(id: string): boolean;
  toggle(item: IProduct): void;
  remove(item: IProduct): void;
  clear(): void;
  getItems(): IProduct[];
  getTotal(): number;
};

type BuyerLike = {
  setData(data: Record<string, unknown>): void;
  validate(): string[] | string;
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
  private modalEl: HTMLElement;
  private modalContentEl: HTMLElement;
  private modalCloseBtn: HTMLButtonElement;

  private cardCatalogTemplate: HTMLTemplateElement;
  private cardPreviewTemplate: HTMLTemplateElement;
  private basketTemplate: HTMLTemplateElement;
  private basketItemTemplate: HTMLTemplateElement;
  private orderTemplate: HTMLTemplateElement;
  private contactsTemplate: HTMLTemplateElement;

  private basketView: BasketComponent;
  private header: Header;

  private orderFormView: OrderForm | null = null;
  private contactsFormView: ContactsForm | null = null;
  private activeFormView: { valid: boolean; errors: string } | null = null;

  private isBasketOpen = false;

  constructor(
    private events: EventEmitter,
    private products: ProductsLike,
    private basket: BasketLike,
    private buyer: BuyerLike,
    private api: LarekApi
  ) {
    this.galleryEl = ensureElement<HTMLElement>(".gallery");
    this.successTemplate = ensureElement<HTMLTemplateElement>("#success");
    this.modalEl = ensureElement<HTMLElement>("#modal-container");
    this.modalContentEl = ensureElement<HTMLElement>(".modal__content", this.modalEl);
    this.modalCloseBtn = ensureElement<HTMLButtonElement>(".modal__close", this.modalEl);

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

    this.bindHandlers();
    this.events.on("success:close", () => this.closeModal());
  }

  private openSuccess(total: number) {
    const node = cloneTemplate<HTMLElement>(this.successTemplate);
    const success = new SuccessView(this.events, node);

    this.modalContentEl.replaceChildren(success.render({ total } as any));
    this.openModal();
  }

  public start() {
    this.api
      .getProducts()
      .then((items: IProduct[]) => {
        this.products.setItems(items);
      })
      .catch((err: unknown) => console.error("Ошибка запроса", err));
  }

  private bindHandlers() {
    this.events.on<IProduct[]>("catalog:changed", (items) => this.renderCatalog(items));

    this.events.on<BasketChangedPayload>("basket:changed", ({ items, total, count }) => {
      this.header.counter = count;

      if (this.isBasketOpen) {
        this.renderBasket(items, total);
      }
    });

    this.events.on("buyer:changed", () => this.onBuyerChanged());

    this.events.on<IProduct>("card:select", (item) => this.openPreview(item));

    this.events.on<IProduct>("basket:toggle", (item) => {
      this.basket.toggle(item);
      this.closeModal();
    });

    this.events.on<IProduct>("basket:remove", (item) => {
      this.basket.remove(item);
    });

    this.events.on("basket:open", () => {
      this.isBasketOpen = true;
      this.openBasket();
    });

    this.events.on("order:open", () => {
      this.isBasketOpen = false;
      this.openOrder();
    });

    this.events.on<FormChangePayload>("form:change", ({ form, field, value }) => {
      if (form === "order") {
        if (field === "payment") this.buyer.setData({ payment: value });
        if (field === "address") this.buyer.setData({ address: value });
      }

      if (form === "contacts") {
        if (field === "email") this.buyer.setData({ email: value });
        if (field === "phone") this.buyer.setData({ phone: value });
      }
    });

    this.events.on("order:submit", () => {
      this.openContacts();
    });

    this.events.on("contacts:submit", () => {
      const total = this.basket.getTotal();
      this.basket.clear();
      this.buyer.clear?.();
      this.openSuccess(total);
    });

    this.modalCloseBtn.addEventListener("click", () => this.closeModal());
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) this.closeModal();
    });
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

    const preview = new CardPreview(
      cloneTemplate(this.cardPreviewTemplate),
      { onClick: () => this.events.emit("basket:toggle", item) }
    );

    const node = preview.render({
      title: item.title,
      price: formatPrice(item.price),
      image: `${CDN_URL}${item.image}`,
      categoryOther: item.category,
      text: item.description,
      buttonText: inBasket ? "Удалить из корзины" : "В корзину",
    } as any);

    this.modalContentEl.replaceChildren(node);
    this.openModal();
  }

  private openBasket() {
    this.modalContentEl.replaceChildren(this.basketView.element);
    this.openModal();

    this.renderBasket(this.basket.getItems(), this.basket.getTotal());
  }

  private renderBasket(items: IProduct[], total: number) {
    const nodes = items.map((item, index) => {
      const li = cloneTemplate<HTMLLIElement>(this.basketItemTemplate);

      ensureElement<HTMLElement>(".basket__item-index", li).textContent = String(index + 1);
      ensureElement<HTMLElement>(".card__title", li).textContent = item.title;
      ensureElement<HTMLElement>(".card__price", li).textContent = formatPrice(item.price);

      const delBtn = ensureElement<HTMLButtonElement>(".basket__item-delete", li);
      delBtn.onclick = () => this.events.emit("basket:remove", item);

      return li;
    });

    this.basketView.items = nodes;
    this.basketView.price = `${total} синапсов`;
  }

  private openOrder() {
    const formNode = cloneTemplate<HTMLFormElement>(this.orderTemplate);

    this.orderFormView = new OrderForm(this.events, formNode);
    this.contactsFormView = null;

    this.activeFormView = this.orderFormView;
    this.orderFormView.errors = "";
    this.orderFormView.valid = false;

    this.syncFormsFromBuyer();

    this.modalContentEl.replaceChildren(this.orderFormView.render());
    this.openModal();
  }

  private openContacts() {
    const formNode = cloneTemplate<HTMLFormElement>(this.contactsTemplate);

    this.contactsFormView = new ContactsForm(this.events, formNode);
    this.orderFormView = null;

    this.activeFormView = this.contactsFormView;
    this.contactsFormView.errors = "";
    this.contactsFormView.valid = false;

    this.syncFormsFromBuyer();

    this.modalContentEl.replaceChildren(this.contactsFormView.render());
    this.openModal();
  }

  private onBuyerChanged() {
    const res = this.buyer.validate();
    const errorsText =
      Array.isArray(res) ? res.filter(Boolean).join(", ") :
      typeof res === "string" ? res :
      "";

    const isValid = errorsText.length === 0;

    if (this.activeFormView) {
      this.activeFormView.errors = errorsText;
      this.activeFormView.valid = isValid;
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

  private openModal() {
    this.modalEl.classList.add("modal_active");
  }

  private closeModal() {
    this.modalEl.classList.remove("modal_active");
    this.modalContentEl.replaceChildren();

    this.isBasketOpen = false;
    this.activeFormView = null;
    this.orderFormView = null;
    this.contactsFormView = null;
  }
}