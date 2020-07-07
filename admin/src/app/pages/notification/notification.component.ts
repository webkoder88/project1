import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../crud.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  public lengthPagination = 0;
  public pageSizePagination = 10;
  public pageSizeOptionsPagination: number[] = [5, 10, 15];
  public defLang = 'ru-UA';
  public userAction = false;
  public cityAction = false;
  public loadHistory = false;
  public globalAction = true;
  public userChoose = [];
  public inputChange;
  public city = [];
  public searchUser = [];
  public listHistory = [];
  public notification = {
    title: '',
    description: '',
    notificationGlobal: true,
    client: [],
    city: ''
  };
  constructor(
      private crud: CrudService
  ) { }

  ngOnInit() {
    this.crud.get('city').then((c: any) => {
      if (c && c.length > 0) {
        this.city = c;
      }
    });
    this.getHistory();
  }
  getHistory() {
    this.crud.get('history/count').then((count: any) => {
      if (count) {
        this.lengthPagination = count.count;
        this.crud.get(`history?query={}&populate={"path":"city clients", "select": "name login"}&skip=0&limit=${this.pageSizePagination}&sort={"date":-1}`).then((v: any) => {
          if (v && v.length > 0) {
            this.listHistory = v;
            this.loadHistory = true;
          }
        });
      }
    });
  }
  create(e) {
    e.preventDefault();
    if (!this.notification.title) {
      Swal.fire('Error', 'Укажите заголовок сообщения', 'error');
      return;
    }
    if (!this.globalAction) {
      if (this.userChoose.length === 0 && !this.notification.city) {
        Swal.fire('Error', 'Выберите клиентов для уведомления', 'error');
        return;
      }
      if (this.userChoose.length > 0) {
        this.notification.notificationGlobal = false;
        delete this.notification.city;
      }
    } else {
      this.notification.notificationGlobal = true;
      delete this.notification.client;
      delete this.notification.city;
    }

    this.notification.title = this.notification.title.trim();
    this.notification.description = this.notification.description.trim();
    this.crud.post('history', this.notification, null, false).then();
    this.crud.post('customPush', this.notification).then((v: any) => {
      if (v) {
        Swal.fire('Success', 'Ваше уведомление отправленно', 'success');
        this.userChoose = [];
        this.notification = {
          title: '',
          description: '',
          notificationGlobal: true,
          client: [],
          city: ''
        };
        this.globalAction = true;
        this.userAction = false;
        this.cityAction = false;
        this.getHistory();
      }
    });
  }

  change() {
    const query = JSON.stringify({$or: [
        {login: {$regex: this.inputChange, $options: 'gi'}},
        {name: {$regex: this.inputChange, $options: 'gi'}}
      ], role: 'client'});
    this.crud.get(`client?query=${query}&select=["login", "name", "img"]&limit=10`).then((v: any) => {
      this.searchUser = v;
    });
  }

  removeUserChip(i) {
    this.userChoose.splice(i, 1);
    this.notification.client.splice(i, 1);
  }
  setCityFiltr(id) {
    this.notification.city = id;
  }
  pushUser(i) {
    const index = this.crud.find('_id', i._id, this.userChoose);
    if (index === undefined) {
      this.userChoose.push(i);
      this.notification.client.push(i._id);
    }
    this.inputChange = '';
    this.searchUser = [];
  }
  changeTypeActionGlobal() {
    if (this.globalAction) {
      this.userAction = false;
      this.cityAction = false;
      this.notification.client = [];
      this.notification.city = '';
      this.userChoose = [];
    } else if (!this.cityAction) {
      this.cityAction = true;
    }
  }
  changeTypeActionCity() {
    if (this.cityAction) {
      this.userAction = false;
      this.globalAction = false;
      this.notification.client = [];
      this.userChoose = [];
    } else if (!this.userAction) {
      this.userAction = true;
      this.notification.city = '';
    }
  }
  changeTypeActionUser() {
    if (this.userAction) {
      this.globalAction = false;
      this.cityAction = false;
    } else if (!this.globalAction) {
      this.globalAction = true;
      this.notification.client = [];
      this.notification.city = '';
      this.userChoose = [];
    }
  }

  pageEvent(e) {
    this.crud.get(`history?query={}&populate={"path":"city clients", "select": "name login"}&skip=${e.pageIndex  * e.pageSize}&limit=${e.pageSize}&sort={"date":-1}`).then((v: any) => {
      if (!v) {
        return;
      }
      this.listHistory = v;
    });
  }
}
