import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CrudService } from '../../crud.service';

@Component({
  selector: 'app-new-item-details',
  templateUrl: './new-item-details.component.html',
  styleUrls: ['./new-item-details.component.scss']
})
export class NewItemDetailsComponent implements OnInit {
  public id: string;
  public language;
  public newItem;

  public translate = {
    title: {
      ru: 'Новинки',
      ua: 'Новинки'
    },
    btn_provider: {
      ru: 'Перейти к поставщику',
      ua: 'Перейти до постачальника'
    },
    btn_product: {
      ru: 'Перейти к продукту',
      ua: 'Перейти до продукту'
    },
    btn_back: {
      ru: 'Назад',
      ua: 'Назад'
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
      this.getNewItem(this.id);
    });
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
  }
  getNewItem(id) {
    this.crud.get(`newItem?query={"_id":"${id}"}&populate={"path":"companyOwner","select":"name img"}`).then((v: any) => {
      if (v) {
        this.newItem = v[0];
      }
    });
  }
  back() {
    window.history.back();
  }
}
