import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';
import {MatSnackBar} from '@angular/material';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit, OnDestroy {
  public count = 0;
  public language;
  public user;
  @Input() data;
  @Input() company;
  @Input() discount = 0;
  private _subscription: Subscription[] = [];
  public snackMessage = {
    ru: 'Товар в корзине',
    ua: 'Товар у кошику'
  };
  public snackMessageLogin = {
    ru: 'Войдите или зарегестрируйтесь',
    ua: 'Ввійдіть або зареєструйтеся'
  };
  public snackMessageCount = {
    ru: 'Укажите кол-во товара',
    ua: 'Вкажіть кількість товару'
  };
  public translate = {
    t1: {
      ru: 'Добавить в',
      ua: 'Додати в'
    },

    // translation strings when product is present
    present: {
      ru: 'В наличии',
      ua: 'В наявності',
    },

    // translation strings when product is not present
    notPresent: {
      ru: 'Нет в наличии',
      ua: 'Немає у наявності',
    },
  };
  constructor(
      private auth: AuthService,
      private crud: CrudService,
      private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this._subscription.push(
        this.auth.onMe.subscribe((u: any) => {
          if (u) {
            this.user = u;
          }
        })
    );
    this._subscription.push(
        this.auth.onLanguage.subscribe((v: string) => {
          this.language = v;
        })
    );
  }
  ngOnDestroy() {
    this._subscription.forEach((i) => i.unsubscribe());
  }
  increment() {
    this.count ++;
  }
  decrement() {
    if (this.count === 0) {return; }
    this.count --;
  }

  addProduct(order) {
    if (!this.user) {
      this.openSnackBar(this.snackMessageLogin[this.language],  'Ok');
      return;
    }
    if (this.user) {
      if (this.count  >0) {
        this.crud.post('product', {discount: this.discount, orderOwner: order._id, count: this.count}).then((v: any) => {
          if (v) {
            this.count = 0;
            this.auth.setCheckBasket(true);
            this.openSnackBar(this.snackMessage[this.language],  'Ok');
          }
        });
      }
      if (this.count === 0) {
        this.openSnackBar(this.snackMessageCount[this.language],  'Ok');
      }
    }
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
