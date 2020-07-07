import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CrudService} from '../../crud.service';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-orders-item',
  templateUrl: './orders-item.component.html',
  styleUrls: ['./orders-item.component.scss']
})
export class OrdersItemComponent implements OnInit {
  @Input() order;
  public removeOrders = true;
  public debtor = null;
  public debtorShow = false;
  public loadDeb = false;
  public language;
  public discount;
  @Output() removeOrder = new EventEmitter();
  @Output() confirmOrder = new EventEmitter();
  public getProducts = [];

  public translate = {
    t1: {
      ru: 'Номер заказа:',
      ua: 'Номер замовелння'
    },
    t2: {
      ru: 'Время заказа:',
      ua: 'Час замовлення'
    },
    t3: {
      ru: 'Ваш заказ был изменен менеджером, подтвердите изменения',
      ua: 'Ваше замовелння було зміненно менеджером, підтвердіть зміни'
    },
    t4: {
      ru: 'Адрес не доступен',
      ua: 'Адреса не доступна'
    },
    t5: {
      ru: 'Способ оплаты:',
      ua: 'Спосіб оплати:'
    },
    t6: {
      ru: 'Всего к оплате:',
      ua: 'Всього до оплати:'
    },
    t7: {
      ru: 'Отменить заказ',
      ua: 'Відмінити замовлення'
    },
    t8: {
      ru: 'Подтвердить изменения',
      ua: 'Підтвердити зміни'
    },
    t9: {
      ru: 'Ваш долг по заказу',
      ua: 'Ваш борг по замовленню'
    },
    status: {
      ru: 'Ваш заказ оформлен.Ожидайте подтверждения.',
      ua: 'Ваше замовлення оформлено. Очікуйте підтвердження.'
    },
    status1: {
      ru: 'Ваш заказ принят. К оплате ',
      ua: 'Ваше замовлення прийняте. До оплати '
    },
    status4Done: {
      ru: 'Ваш заказ выполнен. Оплачено ',
      ua: 'Ваше замовлення виконане. Оплачено  '
    },
    status4Debtor: {
      ru: 'Ваш заказ выполнен. К оплате ',
      ua: 'Ваше замовлення виконане. До оплати  '
    }
  };
  constructor(
      private crud: CrudService,
      private auth: AuthService
  ) { }

  ngOnInit() {
    console.log(this.order);
    this.auth.onLanguage.subscribe((v: any) => {
      if (v) {
        this.language = v;
      }
    });
    this.crud.get(`debtor?query={"basket":"${this.order._id}"}`).then((d: any) => {
      if (d && d.length > 0) {
        this.debtorShow = true;
        this.debtor = d[0].value;
      } else {
        this.debtor = 0;
        this.debtorShow = false;
      }
      this.loadDeb = true;
    });
  }
  getProduct() {
    if (this.getProducts.length > 0) {
      return;
    } else {
      this.crud.get(`product?query={"basketOwner":"${this.order._id}"}&populate=[{"path":"orderOwner","select":"price name img discount"}]`).then((v: any) => {
        if (v) {
          this.getProducts = v;
          this.order.products = this.getProducts;
        }
      });
    }

    this.crud.get(`my-discount/${this.order.companyOwner._id}`).then((v: any) => {
      if (v.success && v.discount) {
        this.discount = v.discount;
      } else {
        this.discount = 0;
      }
    });
  }
  confirmChanges(id) {
    this.crud.post(`basket`, {status: 2}, id).then(() => {
      this.confirmOrder.emit(id);
    });
  }
  cancelOrder(id) {
    this.removeOrder.emit(id);
  }
}
