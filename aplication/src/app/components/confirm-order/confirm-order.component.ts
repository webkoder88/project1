import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CrudService } from '../../crud.service';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  @Input() basket;
  @Output() closeConfirm = new EventEmitter();
  public language;
  public user: any;
  public blockBTN = false;
  public changeCity = false;
  public discount = 0;
  public delayDate = new Date();
  public method = {
    1: 'Наличными',
    2: 'Отстрочка'
  };
  public obj = {
    address: null,
    payMethod: 1
  };

  public translate = {
    title1: {
      ru: 'Адресс доставки',
      ua: 'Адреса доставки'
    },
    title2: {
      ru: 'Способ оплати',
      ua: 'Cпосіб оплати'
    },
    method1: {
      ru: 'наличными',
      ua: 'готівкою'
    },
    method2: {
      ru: 'отсрочка',
      ua: 'відстрочка'
    },
    confirm: {
      ru: 'Оформить',
      ua: 'Оформити'
    },
    buil: {
      ru: 'Дом',
      ua: 'Буд'
    },
    street: {
      ru: 'ул.',
      ua: 'вул.'
    },
    department: {
      ru: 'Квартира',
      ua: 'Квартира'
    },
    oform: {
      ru: 'Оформление заказа',
      ua: 'Оформлення замовлення'
    },

  };
  public _subscription: Subscription[] = [];
  constructor(
    private auth: AuthService,
    private crud: CrudService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    console.log(this.basket);
    this._subscription.push(this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    }));
    this._subscription.push(this.auth.onMe.subscribe((v: string) => {
      if (v) {
        this.user = v;
        this.crud.get(`shopAddress?query={"createdBy":"${this.user._id}"}&populate={"path":"city"}`).then((v: any) => {
          if (v) {
            this.obj.address = v[0];
          }
        });
      }
    }));
    this.crud.get(`my-discount/${this.basket.companyOwner.createdBy}`).then((v: any) => {
      if (v.success) {
        this.discount = v.discount;
      }
    });
    this.auth.resetConfirm();
  }
  confirm() {
    if (!this.obj.address || !this.obj.payMethod) {
      this.openSnackBar('Выберете адрес и способ оплаты', 'Ok');
      return;
    } else {
      this.blockBTN = true;
      this.crud.post(`basket`, { status: 1, currentLoyalty: this.discount, deliveryAddress: this.obj.address._id, payMethod: this.method[this.obj.payMethod] }, this.basket._id).then((v: any) => {
        if (v) {
          this.openSnackBar('Ваш заказ оформлен', 'Ok');
          this.auth.setCheckBasket(true);
          this.closeConfirm.emit(false);
        }
      });
    }
  }
  outputAddress(e) {
    if (e) {
      this.obj.address = e;
      this.changeCity = false;
    }
  }
  cancelConfirmAddress(e) {
    this.changeCity = e.value;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  ngOnDestroy() {
    this._subscription.forEach((item) => {
      item.unsubscribe();
    });
  }

  delayDateChange() {
    this.basket.product.forEach(product => {
      this.crud.post('product', { delayDate: this.delayDate }, product._id);
    });
  }
}
