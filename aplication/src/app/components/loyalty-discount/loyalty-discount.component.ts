import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-loyalty-discount',
  templateUrl: './loyalty-discount.component.html',
  styleUrls: ['./loyalty-discount.component.scss']
})
export class LoyaltyDiscountComponent implements OnInit {
  @Input() price;
  @Input() discount;
  public newPrice;
  constructor() { }

  ngOnInit() {
    if (this.discount === 0) {
      this.newPrice = this.price;
      return;
    }
    this.newPrice = this.price - (this.price * (this.discount / 100));
  }
}
