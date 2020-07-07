import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CrudService } from '../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Me } from '../../interfaces/me';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-product-id',
  templateUrl: './product-id.component.html',
  styleUrls: ['./product-id.component.scss']
})
export class ProductIDComponent implements OnInit {
  public language;
  public count = 0;
  public favoriteShow;
  public id;
  public me: Me;
  public product;
  public company;
  public discount = 0;
  public loading = false;
  public reviews = [];
  public translate = {
    title: {
      ru: 'Адреса доставки',
      ua: 'Адреси доставки'
    },
    description: {
      ru: 'Описание',
      ua: 'Опис'
    },
    by_now: {
      ru: 'Купить сейчас',
      ua: 'Купити зараз'
    },
    withProduct: {
      ru: 'С этим товаром покупают',
      ua: 'З цим товаром купують'
    },
    basket: {
      ru: 'В корзину',
      ua: 'До кошика'
    },
    count: {
      ru: 'Количество',
      ua: 'Кількість'
    },
    reviewsHeader: {
      ru: 'Отзывы',
      ua: 'Відгуки',
    },
  };

  public snackMessageLogin = {
    ru: 'Войдите или зарегестрируйтесь',
    ua: 'Ввійдіть або зареєструйтеся'
  };
  constructor(
    private auth: AuthService,
    private crud: CrudService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
    this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('id');
      this.init();
    });
    this.auth.onMe.subscribe((v: any) => {
      this.me = v;
      if (this.me && this.me.favoriteProduct && (this.me.favoriteProduct.indexOf(this.id) > -1)) {
        this.favoriteShow = true;
      }
    });
  }
  init() {
    this.crud.getDetailProduct(this.id).then((v: any) => {
      if (v) {
        this.product = v;
        this.crud.post('companyVisit', {
          product: this.id,
          company: this.product.companyOwner,
        }).then();

        this.crud.getDetailCompany(this.product.companyOwner).then((v: any) => {
          if (v) {
            this.company = v;
            if (this.me) {
              const discountQuery = JSON.stringify({
                $and: [
                  { client: this.me._id },
                  { provider: this.company.createdBy._id },
                ]
              });

              this.crud.get(`discount?query=${discountQuery}`).then((d: any[]) => {
                this.discount = (d && d.length !== 0) ? d[0].discount : 0;
              });
            }
          }
        });

        const reviewQuery = JSON.stringify({
          orderOwner: this.id,
        });

        const reviewPopulate = JSON.stringify({
          path: 'createdBy',
        });

        this.crud.get(`review?query=${reviewQuery}&populate=${reviewPopulate}&sort={"date":-1}`).then((v: any[]) => {
          if (v && v.length > 0) {
            this.reviews = v;
          }
        });

        this.loading = true;
      }
    });
  }

  favorite() {
    this.crud.favoriteProduct({ productId: this.id }).then((v: any) => {
      if (v) {
        this.me.favoriteProduct = v;
        if (v && (v.indexOf(this.id) > -1)) {
          this.favoriteShow = true;
          return;
        }
        this.favoriteShow = false;
      }
    });
  }
  increment() {
    this.count++;
  }
  decrement() {
    if (this.count === 0) { return; }
    this.count--;
  }
  addProduct(id) {
    if (!this.me) {
      this.openSnackBar(this.snackMessageLogin[this.language], 'Ok');
      return;
    }
    this.crud.post('product', {discount: this.discount, orderOwner: id, count: this.count}).then((v: any) => {
      if (v) {
        this.count = 0;
        this.auth.setCheckBasket(true);
        this.openSnackBar('Товар додан в корзину', 'Ok');
      }
    });
  }
  byNow(id) {
    if (!this.me) {
      this.openSnackBar(this.snackMessageLogin[this.language], 'Ok');
      return;
    }
    this.crud.post('product', {discount: this.discount, orderOwner: id, count: this.count}).then((v: any) => {
      if (v) {
        this.count = 0;
        this.auth.setConfirmOrder(v);
        this.router.navigate(['/' + this.language + '/basket']);
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  updateReviews() {
    const reviewQuery = JSON.stringify({
      orderOwner: this.id,
    });

    const reviewPopulate = JSON.stringify({
      path: 'createdBy',
    });

    this.crud.get(`review?query=${reviewQuery}&populate=${reviewPopulate}&sort={"date":-1}`).then((v: any[]) => {
      if (v && v.length > 0) {
        this.reviews = v;
      }
    });
  }
}
