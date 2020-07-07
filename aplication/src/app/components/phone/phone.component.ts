import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss']
})
export class PhoneComponent implements OnInit {
  @Input() other: boolean;
  @Input() number: string;
  @Output() phone = new EventEmitter();
  public phoneNumber = '';
  public mainPhone = '';
  constructor() { }

  ngOnInit() {
    if (this.number) {
      if (this.other) {
        this.number = this.number.slice(1, 10);
      }
      this.phoneNumber = '+380' + this.mainPhone;
    }
  }
  splitPhone() {
    this.phone.emit('+380' + this.mainPhone);
  }
}
