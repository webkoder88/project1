import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {
  public id: string;
  public baskets = [];
  public language;
  public loading = false;
  public removeItem = false;
  public showConfirm = false;

  public translate = {
    title: {
      ru: 'Корзина',
      ua: 'Кошик'
    },
    empty: {
      ru: 'Корзина пуста',
      ua: 'Кошик пустий'
    }
  };
  constructor(
      private route: ActivatedRoute,
      private auth: AuthService,
      private crud: CrudService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('id');
    });
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
    const query = `?query={"status":0,"createdBy":"${localStorage.getItem('userId')}"}&populate={"path":"companyOwner","select":"name img createdBy"}`;
    this.crud.get('basket', '', query).then((v: any) => {
      if (v) {
        this.baskets = v;
        this.loading = true;
      }
    });
  }
  removeBasket(e) {
    this.loading = false;
    if (e) {
      const query = `?query={"status":0,"createdBy":"${localStorage.getItem('userId')}"}&populate={"path":"companyOwner","select":"name img createdBy"}`;
      this.crud.get('basket', '', query).then((v: any) => {
        if (v) {
          this.baskets = v;
          // console.log(v);
          this.loading = true;
        }
      });
      this.auth.setCheckBasket(true);
    }
  }
}
