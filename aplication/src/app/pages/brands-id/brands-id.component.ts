import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-brands-id',
  templateUrl: './brands-id.component.html',
  styleUrls: ['./brands-id.component.scss']
})
export class BrandsIDComponent implements OnInit, OnDestroy {
  public id: string;
  public loading;
  public city;
  public language;
  public filter;
  public sort;
  public orders = [];
  public companyIdArr = [];
  public companies;
  public showFilter = false;
  public copyfilterObj;
  public selectedSort = 0;
  public CityLinksArr = [];
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
    this._subscription.push(this.route.params.subscribe((params: any) => {
      this.id = this.route.snapshot.paramMap.get('id');
      if (!this.id) {return; }
      this.init();
    }));
    this._subscription.push(this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    }));

  }
  init(){
    this.auth.onCity.subscribe((city: any) => {
      if (city) {
        this.city = city;
        this.crud.getCompany(city).then((companyByCity: any) => {
          if (companyByCity && companyByCity.length > 0) {
            companyByCity.forEach((item) => {
              this.companyIdArr.push(`${item.companyOwner}`);
            });
          }
          this.crud.getBrandName(this.id, city._id).then((companies)=>{
            this.companies = companies;
            const arr = [];
            if (this.city.links) {
              this.city.links.forEach(it => {
                if (it) {
                  arr.push({cityLink: it});
                  this.CityLinksArr.push({cityLink: it});
                }
              });
            }
            const query = `?query={"$and":[${arr.length > 0 ? JSON.stringify( {$or: arr} ) : {} },{"brand":"${this.companies[0].brand}"}],"companyOwner":${JSON.stringify( {$in:this.companyIdArr})}}&populate={"path":"companyOwner"}&skip=0&limit=5&sort=${this.sort}`;
            this.crud.get('order', '',  query).then((orders: any) => {
              this.orders = orders;
              this.loading = true;
            });
          });
        });
      }
    })
  }
  ngOnDestroy() {
    this._subscription.forEach((item) => {
      item.unsubscribe();
    });
    this.id = '';
  }
  copyFilter(e) {
    this.copyfilterObj = e;
  }

  closeFilter(e) {
    this.showFilter = e;
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

    const query = `?query={"$and":[${arr.length > 0 ? JSON.stringify( {$or: arr} ) : {} },{"brand":"${this.companies[0].brand}"}${this.filter ? this.filter : ''}],"companyOwner":${JSON.stringify( {$in:this.companyIdArr})}}&populate={"path":"companyOwner"}&skip=0&limit=5&sort=${this.sort}`;
    this.crud.get('order', '',  query).then((orders: any) => {
      this.orders = orders;
      this.loading = true;
    });
  }

  getOutput(e) {
    this.orders = this.orders.concat(e);
  }
}
