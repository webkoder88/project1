import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-new-item',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.scss']
})
export class NewItemComponent implements OnInit {
  @Input() obj;
  public language;

  constructor(
    private auth: AuthService

  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
  }

}
