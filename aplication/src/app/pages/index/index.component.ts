import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {
  public count = null;
  public user;
  public companyArr: any;
  public language;
  public curentCity: any = {};
  public category = [];
  public brandy = [];
  public topCompany = [];
  public topProduct = [];
  public companyIdArr = [];
  public action = [];
  public toggleMain = true;
  public loadingCount = true;
  public topCompanyCount;
  public mySlideOptions = {
    autoplay: true,
    items: 1,
    dots: false,
    nav: false
  };
  public number = 0;
  public domain = environment.domain;
  public loaded = {
    category: false,
    topCompany: false,
    topProduct: false,
    brand: false,
    action: false
  };
  public translate = {
    category: {
      ru: 'Категории',
      ua: 'Категорії'
    },
    brands: {
      ru: 'Бренды',
      ua: 'Бренди'
    },
    city: {
      ru: 'Город',
      ua: 'Місто'
    },
    city_s: {
      ru: 'г.',
      ua: 'м.'
    },
    all_s: {
      ru: 'Все',
      ua: 'Усі'
    },
    provider: {
      ru: 'Поставщики',
      ua: 'Постачальники'
    },
    goods: {
      ru: 'Товары',
      ua: 'Товари'
    },
    allProducts: {
      ru: 'Все товары города',
      ua: 'Всі товари міста'
    },
    allTopProducts: {
      ru: 'Все Топ товары города',
      ua: 'Всі Топ товари міста'
    },
    allProdviders: {
      ru: 'Все поставщики города',
      ua: 'Всі постачальники міста'
    },
    emptyTop: {
      ru: 'Нет популярных товаров',
      ua: 'Немає популярних товарів'
    },
    emptyCountry: {
      ru: 'В выбранном городе нет поставщиков!',
      ua: 'У вибраному місті немає постачальників!'
    }
  };
  // tslint:disable-next-line:variable-name
  private _subscription: Subscription[] = [];

  constructor(
      private auth: AuthService,
      private crud: CrudService
  ) { }


  ngOnInit() {
    this.auth.onMe.subscribe((v: any) => {
      if (!v) {return; }
      this.user = v;
    });
    this._subscription.push(this.auth.onBasketCount.subscribe((v: any) => {
      if (v) {
        this.count = v;
      } else {
        this.count = 0;
      }
      this.loadingCount = true;
    }));
    this._subscription.push(this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    }));
    this._subscription.push(this.auth.onCity.subscribe((v: any) => {
      if (v) {
        this.crud.getCompany(v).then((arr: any) => {
          this.curentCity = v;
          this.companyArr = arr;
          arr.forEach((item) => {
            this.companyIdArr.push(`${item.companyOwner}`);
          });
          this.init().then();
        });
      }
    }));

  }

  async init() {
    await this.crud.getAction(this.curentCity, this.companyIdArr).then((v: any) => {
      if (!v) {return; }
      this.action = v;
      this.loaded.action = true;
    }).catch((e) => {
      this.loaded.action = true;
    });
    await this.crud.getBrands().then((v: any) => {
      if (!v) {return; }
      this.brandy = v;
      this.loaded.brand = true;
    }).catch((e) => { this.loaded.brand = true; });
    await this.crud.getCategory().then((v: any) => {
      if (!v) {return; }
      this.category = v;
      this.loaded.category = true;
    }).catch((e) => { this.loaded.category = true; });
    await this.crud.getTopCompany().then((v: any) => {
      if (!v) {return; }
      this.topCompany = v;
      this.loaded.topCompany = true;
    }).catch((e) => { this.loaded.topCompany = true; });
    await this.crud.getTopProduct(0, 5, true).then((v: any) => {
      if (!v) {return; }
      this.topProduct = v;
      this.loaded.topProduct = true;
    }).catch((e) => { this.loaded.topProduct = true; });
    await this.crud.getTopCompanyCount().then((v: any) => {
      if (!v) {return; }
      this.topCompanyCount = v.count;
    });
  }
  ngOnDestroy() {
    this._subscription.forEach(it => it.unsubscribe());
  }
}
