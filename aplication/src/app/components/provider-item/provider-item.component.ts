import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';
import {Router} from "@angular/router";

interface Company {
  img: string;
  name: string;
  rating?: number;
  ratingCount?: number;
  address?: string;
  createdBy?: any;
  categories?: [];
  action?: [];
  actionCount?: number;
  city: object;
  workTime?: object;
  verify: boolean;
  date: string;
  lastUpdate: string;
  _id: string;
}

@Component({
  selector: 'app-provider-item',
  templateUrl: './provider-item.component.html',
  styleUrls: ['./provider-item.component.scss']
})
export class ProviderItemComponent implements OnInit {
  @Input() single = false;
  @Input() data: Company;
  @Input() isTop = false;
  @Output() getIt = new EventEmitter();
  public language;
  public discount;
  public translate = {
    t1: {
      ru: 'акции',
      ua: 'акції'
    },
    t2: {
      ru: 'акций',
      ua: 'акцій'
    },
    t3: {
      ru: 'акция',
      ua: 'акція'
    },
    work: {
      ru: 'График работы',
      ua: 'Графік роботи'
    }
  };
  constructor(
      private auth: AuthService,
      private crud: CrudService,
      private route: Router
  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
      this.init();
    });
    if (this.data.rating && this.data.ratingCount) {
      this.data.rating = Math.round(this.data.rating / this.data.ratingCount);
    }
  }

  init() {
    const date = new Date(new Date()
      .getTime() - new Date()
      .getHours() * 60 * 60 * 1000 - new Date()
      .getMinutes() * 60 * 1000  - new Date()
      .getSeconds() * 1000)
      .getTime();
    const query = `?query=${JSON.stringify({$or: [{actionGlobal: true}, {client: {$in: localStorage.getItem('userId')}}], companyOwner: this.data._id, dateEnd: {$gte: date}})}`;
    this.crud.get('action/count', '', query).then((v: any) => {
      this.data.actionCount = v.count;
    });

    // this.crud.get(`my-discount/${this.data.createdBy.id}`).then((v: any) => {
    //   if (v.success) {
    //     this.discount = v.discount;
    //   }
    // }).catch((error) => {
    //   if (error && error.error === 'forbidden3') {
    //     this.auth.setBasketCount(0);
    //     this.auth.setMe(null);
    //     localStorage.removeItem('userId');
    //     localStorage.removeItem('token');
    //     this.route.navigate(['/']);
    //   }
    // });
  }
}
