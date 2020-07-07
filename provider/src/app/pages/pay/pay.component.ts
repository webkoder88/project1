import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../crud.service";
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss']
})
export class PayComponent implements OnInit {
  public settings;
  public liqpay;
  public user;
  constructor(
      private crud: CrudService,
      private auth: AuthService
  ) { }

  ngOnInit() {
    this.crud.get('setting').then((v: any) => {
      if (v) {
        this.settings = Object.assign({}, v);
      }
    });
    this.auth.onMe.subscribe((me: any) => {
      if (me) {
        this.user = me;
        console.log(this.user)
      }
    });
    this.crud.get('liqpay').then( v => {
      this.liqpay = v;
    });
  }

}
