import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CrudService } from '../../crud.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss']
})
export class ProviderComponent implements OnInit {
  public language;
  public favoriteShow;
  public id;
  public providerId;
  public me;
  public company;
  public actions;
  public activeCategoryId;
  public activeBrandsId;
  public showCategory = true;
  public showBrands = false;
  public loading = false;
  public discount;
  public products = {};
  public translate = {
    category: {
      ru: 'Категории',
      ua: 'Категорії'
    },
    all: {
      ru: 'Все',
      ua: 'Всі'
    },
    brands: {
      ru: 'Бренды',
      ua: 'Бренди'
    }
  };
  constructor(
    private auth: AuthService,
    private crud: CrudService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
    this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('id');
      this.auth.onMe.subscribe((v: string) => {
        this.me = v;
        if (this.me && this.me.favoriteCompany && (this.me.favoriteCompany.indexOf(this.id) > -1)) {
          this.favoriteShow = true;
        }
        this.init();
      });
    });
  }
  init() {
    this.crud.post('companyVisit', { company: this.id });
    const date = new Date(new Date().getTime() - new Date().getHours() * 60 * 60 * 1000 - new Date().getMinutes() * 60 * 1000 - new Date().getSeconds() * 1000).getTime();
    this.crud.getDetailCompany(this.id, this.company).then((v: any) => {
      if (v) {
        this.company = v;
        this.providerId = this.company.createdBy.id;

        if (this.company.rating && this.company.ratingCount) {
          this.company.rating = Math.round(this.company.rating / this.company.ratingCount);
        }
        const query = `?query=${JSON.stringify({ $or: [{ actionGlobal: true }, { client: { $in: localStorage.getItem('userId') } }], companyOwner: this.company._id, dateEnd: { $gte: date } })}`; //
        this.crud.get('action', '', query).then((v: any) => {
          this.actions = v;
        });
        if (this.company && this.company.categories.length > 0) {
          this.activeCategoryId = this.company.categories[0]._id;
        }

        if (this.me) {
          this.crud.get(`discount?query={"$and": [{"client":"${this.me._id}"},{"provider":"${this.providerId}"}]}`).then((d: any[]) => {
            this.discount = (d && d.length !== 0) ? d[0].discount : 0;
            this.loading = true;
          });
        } else {
          this.discount = 0;
          this.loading = true;
        }
      }
    });
  }
  favoriteCompany() {
    this.crud.favoriteCompany({ companyId: this.id }).then((v: any) => {
      if (v) {
        this.me.favoriteCompany = v;
        if (v && (v.indexOf(this.id) > -1)) {
          this.favoriteShow = true;
          return;
        }
        this.favoriteShow = false;
      }
    });
  }
  activeCategory(id) {
    this.showCategory = true;
    this.showBrands = false;
    this.activeCategoryId = id;
  }
  activeBrands(id) {
    this.showBrands = true;
    this.showCategory = false;
    this.activeBrandsId = id;
  }
}
