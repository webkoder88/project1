import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-show-loyalty',
  templateUrl: './show-loyalty.component.html',
  styleUrls: ['./show-loyalty.component.scss']
})
export class ShowLoyaltyComponent implements OnInit {
  @Input() data;
  @Input() single;
  @Input() provider = false;
  public detail = false;
  public language;
  public translate = {
    ru: 'Программа лояльности',
    ua: 'Програма лояльності'
  };

  public discountT = {
    ru: 'Скидка',
    ua: 'Знижка'
  };

  public sumT = {
    ru: 'После покупки на сумму',
    ua: 'Після покупки на суму'
  };

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
  }

  show(e) {
    e.stopPropagation();
    this.detail = !this.detail;
  }

  close() {
    this.detail = !this.detail;
  }
}
