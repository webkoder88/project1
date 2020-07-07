import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../auth.service';
import {ActivatedRoute} from '@angular/router';
import {CrudService} from '../../crud.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-category-id',
  templateUrl: './category-id.component.html',
  styleUrls: ['./category-id.component.scss']
})
export class CategoryIDComponent implements OnInit, OnDestroy {
  public loading;
  public id: string;
  public language;
  public orders = [];
  public city;
  public sort;
  public filter;
  public mainCategory;
  public showFilter = false;
  public selectedSort = 0;
  public CityLinksArr = [];
  public companyIdArr = [];
  public copyfilterObj;
  // tslint:disable-next-line:variable-name
  private _subscription: Subscription[] = [];

  public translate = {
    sort1: {
      ru: 'Новинки',
      ua: 'Бренди'
    },
    sort2: {
      ru: 'От дешевых к дорогим',
      ua: 'Від дешевих до дорогих'
    },
    sort3: {
      ru: 'От дорогих к дешевым',
      ua: 'Від дорогих до дешевих'
    },
    filter: {
      ru: 'Фильтр',
      ua: 'Фільтр'
    },
    empty: {
      ru: 'Продукты отсутствуют',
      ua: 'Продукти відсутні'
    }
  };
  constructor(
      private route: ActivatedRoute,
      private auth: AuthService,
      private crud: CrudService
  ) { }

  ngOnInit() {
    this.sort = JSON.stringify({date: -1});
    this._subscription.push(this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('id');
      if (!this.id) {return; }
      this.init();
    }));
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
  }
  init() {
    this.auth.onCity.subscribe((city: any) => {
      if (city) {
        this.city = city;
        this.crud.getCompany(city).then((companyByCity: any) => {
          if (companyByCity && companyByCity.length > 0) {
            companyByCity.forEach((item) => {
              this.companyIdArr.push(`${item.companyOwner}`);
            });
          }
          this.crud.getCategoryName(this.id).then((mainCategory) => {
            this.mainCategory = mainCategory;
            const arr = [];
            if (this.city.links) {
              this.city.links.forEach(it => {
                if (it) {
                  arr.push({cityLink: it});
                  this.CityLinksArr.push({cityLink: it});
                }
              });
            }
            const query = `?query={"$and":[${arr.length > 0 ? JSON.stringify( {$or: arr} ) : {} },{"mainCategory":"${this.mainCategory._id}"}],"companyOwner":${JSON.stringify( {$in:this.companyIdArr})}}&populate={"path":"companyOwner"}&skip=0&limit=5&sort=${this.sort}`;
            this.crud.get('order', '',  query).then((orders: any) => {
              this.orders = orders;
              this.loading = true;
            });
          });
        });
      }
    });
  }
  reinit(e = this.filter) {
    const arr = [];
    this.filter = e;
    if (this.city.links) {
      this.city.links.forEach(it => {
        if (it) {
          arr.push({cityLink: it});
          this.CityLinksArr.push({cityLink: it});
        }
      });
    }

    const query = `?query={"$and":[${arr.length > 0 ? JSON.stringify( {$or: arr} ) : {} },{"mainCategory":"${this.mainCategory._id}"}${this.filter ? this.filter : ''}],"companyOwner":${JSON.stringify( {$in:this.companyIdArr})}}&populate={"path":"companyOwner"}&skip=0&limit=5&sort=${this.sort}`;
    this.crud.get('order', '',  query).then((orders: any) => {
      this.orders = orders;
      this.loading = true;
    });
  }
  closeFilter(e) {
    this.showFilter = e;
  }
  copyFilter(e) {
    this.copyfilterObj = e;
  }
  sortChanges() {
    switch (this.selectedSort) {
      case 0:
        this.sort = JSON.stringify({date: -1});
        break;
      case 1:
        this.sort = JSON.stringify({price: 1});
        break;
      case 2:
        this.sort = JSON.stringify({price: -1});
        break;
      default: return;
    }
    this.reinit();
  }
  getOutput(e) {
    this.orders = this.orders.concat(e);
  }
  ngOnDestroy() {
    this._subscription.forEach((item) => {
      item.unsubscribe();
    });
    this.id = ''
  }
}
