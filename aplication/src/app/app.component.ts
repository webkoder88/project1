import { Component } from '@angular/core';
import {AuthService} from "./auth.service";
import {CrudService} from "./crud.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'delivery';
  public localStorage = localStorage ;
  public setting: any;
  public me;
  public loaded = false;
  public count;
  public language;
  public url;

  private _subscription: Subscription[] = [];

  constructor(
      private auth: AuthService,
      private crud: CrudService,
      private route: Router
  ) {
    this.url = decodeURI(this.route.url.substring(4));
    if (localStorage.getItem('language')) {
      this.language = localStorage.getItem('language');
      this.route.navigate(['/' + this.language + '/' + this.url]);
    } else {
      this.language = 'ua';
      localStorage.setItem('language', this.language);
    }
    this.crud.get('translator').then((v: any) => {
      if (v) {
        this.auth.setTranslate(v);
        this.crud.get('setting').then((v: any) => {
          this.setting = Object.assign({}, v);
          this.auth.setSettings(this.setting);
          if (this.setting.city) {
            if (localStorage.getItem('city')) {
              this.auth.setCity(JSON.parse(localStorage.getItem('city')));
            } else {
              this.auth.setCity(this.setting.city);
            }
          }
          this.loaded = true;
        });
        if (this.localStorage.getItem('token')) {
          this.crud.get('me').then((v: any) => {
            this.me = Object.assign({}, v);
            this.auth.setMe(this.me);
            if (this.me && this.me._id) {
              this.crud.get(`basket/count?query={"createdBy":"${this.me._id}","status":0}`).then((count: any) => {
                this.count = count.count;
                this.auth.setBasketCount(this.count);
              });
            }else {
              this.auth.setBasketCount(0);
            }
          }).catch((error) => {
            if (error && error.error === "forbidden") {
              this.clearLocal();
            }
          });
        }
      }
    }).catch((error) => {
      if (error && error.error === 'Token error') {
        this.clearLocal();
        location.reload();
      }
    });
    this.auth.onMe.subscribe((me: any) => {
      if (me) {
        this.me = Object.assign({}, me);
        this.auth.setCheckBasket(true)
      }
    });
    this.auth.onCheckBasket.subscribe((v: any) => {
      if (v) {
        if (this.me) {
          this.crud.get(`basket/count?query={"createdBy":"${this.me._id}","status":0}`).then((count: any) => {
            if (count) {
              this.count = count.count;
              this.auth.setBasketCount(this.count);
            }
          });
        }
      }
    });
  }

  clearLocal() {
    this.localStorage.removeItem('userId');
    this.localStorage.removeItem('token');
  }
}
