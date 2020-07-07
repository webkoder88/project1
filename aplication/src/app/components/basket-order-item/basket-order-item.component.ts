import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CrudService} from '../../crud.service';
import {MatSnackBar} from '@angular/material';
import {AuthService} from '../../auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-basket-order-item',
  templateUrl: './basket-order-item.component.html',
  styleUrls: ['./basket-order-item.component.scss']
})
export class BasketOrderItemComponent implements OnInit, OnDestroy {
  @Input() data;
  @Output() removeBasket = new EventEmitter();
  public removeObj = {
    index: null,
    obj: null
  };
  public discount = 0;
  public companyDiscount = 0;
  public language;
  public chooseAll = false;
  public showConfirm = false;
  public removeItemShow = false;
  public items = [];
  public translate = {
    by: {
      ru: 'Купить',
      ua: 'Купити'
    },
    total: {
      ru: 'Всего к оплате:',
      ua: 'Всього до оплати'
    }
  };
  // tslint:disable-next-line:variable-name
  private _subscription: Subscription[] = [];

  constructor(
      private crud: CrudService,
      private auth: AuthService,
      private snackBar: MatSnackBar
  ) { }
  ngOnDestroy() {
    this._subscription.forEach((item) => {
      item.unsubscribe();
    });
  }
  ngOnInit() {
    this._subscription.push(this.auth.onLanguage.subscribe((l: any) => {
      if (l) {
        this.language = l;
      }
    }));
    this.mainChack();
    this.crud.get(`product?query={"basketOwner":"${this.data._id}"}&populate={"path":"orderOwner","select":"img name price count discount loyaltyAvailable"}`).then((v: any) => {
      if (v && v.length > 0) {
        this.data.product = v;
        this.data.product.forEach((item) => {
          this.items.push({isChoise: item.verify, _id: item._id});
        });
      }
    });
    this._subscription.push(this.auth.onConfirmOrder.subscribe(v => {
      if (!v) {return; }
      this.showConfirm = true;
    }));

    this.crud.get(`my-discount/${this.data.companyOwner.createdBy}`).then((v: any) => {
      if (v.success && v.discount) {
        this.discount = v.discount;
      } else {
        this.discount = 0;
      }
    });
    this.auth.onMe.subscribe((v: any) => {
      this.crud.get(`discount?query={"$and": [{"client":"${v._id}"},{"provider":"${this.data.companyOwner.createdBy}"}]}`).then((d: any[]) => {
        this.companyDiscount = (d && d.length !== 0) ? d[0].discount : 0;
      });
    });
  }
  closeConfirm(e) {
    this.showConfirm = e.value;
    this.removeBasket.emit(true);
  }
  closeRemoveItem(e) {
    this.removeItemShow = e;
  }
  mainChack() {
    this.chooseAll = !this.chooseAll;
    if (this.chooseAll) {
      this.items.forEach((item, index) => {
        this.items[index].isChoise = true;
        this.crud.post(`product`, {verify: true}, item._id).then((v: any) => {
          if (v) {
            this.refreshBasket();
          }
        });
      });
    } else {
      this.items.forEach((item, index) => {
        this.items[index].isChoise = false;
        this.crud.post(`product`, {verify: false}, item._id).then((v: any) => {
          if (v) {
            this.refreshBasket();
          }
        });
      });
    }
  }
  otherChack(it) {
    this.items[it].isChoise = !this.items[it].isChoise;
    this.crud.post(`product`, {verify: this.items[it].isChoise}, this.data.product[it]._id).then((v: any) => {
      if (v) {
        this.refreshBasket();
      }
    });
    let isAll = true;
    this.items.forEach((item, index) => {
      if (!this.items[index].isChoise) {
        isAll = false;
      }
    });
    this.chooseAll = isAll;
  }
  minus(i) {
    let count = this.data.product[i].count;
    count--;
    if (count < 1) {
      this.crud.delete(`product`, this.data.product[i]._id).then((v: any) => {
        if (v) {
          this.data.product.splice(i, 1);
          this.removeBasket.emit(this.data._id);
        }
      });
    } else {
      this.data.product[i].count--;
      this.crud.post(`product`, {count: this.data.product[i].count}, this.data.product[i]._id).then((v: any) => {
        if (v) {
          this.refreshBasket();
        }
      });
    }
  }
  plus(i) {
    this.data.product[i].count++;
    this.crud.post(`product`, {count: this.data.product[i].count}, this.data.product[i]._id).then((v: any) => {
      if (v) {
        this.refreshBasket();
      }
    });
  }
  refreshBasket() {
    this.crud.get(`basket?query={"_id":"${this.data._id}"}&select="totalPrice"`).then((v: any) => {
      this.data.totalPrice = v[0].totalPrice;
    });
  }
  removeProduct(i) {
    this.removeItemShow = true;
    this.removeObj = {
      index: i,
      obj: this.data.product[i]
    };
  }
  successRemove(e) {
    this.data.product.splice(e, 1);
    if (this.data.product.length === 0) {
      this.removeBasket.emit(true);
    } else {
      this.refreshBasket();
    }
  }
  openConfirmComponent() {
    if (this.data.totalPrice === 0) {
      this.openSnackBar('Выберете товар поставщика',  'Ok');
      return;
    }
    this.showConfirm = true;
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
