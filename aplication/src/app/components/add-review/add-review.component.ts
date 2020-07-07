import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CrudService } from '../../crud.service';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss']
})
export class AddReviewComponent implements OnInit {
  @Input() clientId: string;
  @Input() orderId: string;
  comment: string;

  @Output() add = new EventEmitter();

  language = 'ru';

  translate = {
    header: {
      ru: 'Добавить отзыв',
      ua: 'Додати відгук',
    },
    comment: {
      ru: 'Комментарий',
      ua: 'Коментар',
    },
    reset: {
      ru: 'Отменить',
      ua: 'Відмінити',
    },
    submit: {
      ru: 'Отправить',
      ua: 'Відправити',
    }
  };

  constructor(
    private auth: AuthService,
    private crud: CrudService
  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((v: string) => {
      this.language = v;
    });
  }

  cancelAdd() {
    this.comment = '';
  }

  submit() {
    this.crud.post('review', {
      createdBy: this.clientId,
      orderOwner: this.orderId,
      comment: this.comment,
    }).then((v: any) => {
      if (v) {
        console.log(v);
        this.comment = '';
        this.add.emit();
      }
    });
  }
}
