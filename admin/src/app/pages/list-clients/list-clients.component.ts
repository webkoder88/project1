import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-clients',
  templateUrl: './list-clients.component.html',
  styleUrls: ['./list-clients.component.scss']
})
export class ListClientsComponent implements OnInit {
  public lengthPagination = 0;
  public pageSizePagination = 10;
  public pageSizeOptionsPagination: number[] = [5, 10, 15];
  public loading = false;
  public search;
  public defLang = 'ru-UA';
  public addShow = false;
  public queryFilter = '"role":"client"';
  public clientEdit;
  public list = [];
  public newPass;
  public passErr;
  public filterShow = true;
  public dateSort = {
    status: false,
    value: '"date":-1'
  };
  public client = {
    name: '',
    login: '',
    pass: '',
    role: 'client',
    isFop: false,
    fopDocuments: [],
    idNumber: '',
    notes: '',
    address: '',
  };
  constructor(
    private crud: CrudService
  ) { }

  ngOnInit() {
    this.crud.get('client/count?query={"role": "client"}').then((count: any) => {
      if (count) {
        this.lengthPagination = count.count;
        this.getClients();
      }
    });
  }
  getClients() {
    this.crud.get(`client?query={"role": "client"}&skip=0&limit=${this.pageSizePagination}&sort={${this.dateSort.value}}`).then((v: any) => {
      if (!v) { return; }
      this.list = v;
      this.loading = true;
    });
  }
  create(e) {
    e.preventDefault();
    const c = this.client;
    if (c.name === '' || c.pass === '' || c.login === '') {
      Swal.fire('Error', 'Все поля обязательны', 'error').then();
      return;
    }
    this.crud.post('signup', {
      name: this.client.name,
      login: '0' + this.client.login,
      pass: this.client.pass,
      role: this.client.role,
      isFop: this.client.isFop,
      fopDocuments: this.client.fopDocuments,
      idNumber: this.client.idNumber,
      notes: this.client.notes,
      address: this.client.address,
    }).then((v: any) => {
      this.clearObj();
      this.addShow = false;
      this.list.unshift(v);
      this.lengthPagination++;
    }).catch((error) => {
      if (error && error.error === 'User with this login created') {
        Swal.fire('Error', 'Номер телефона уже используется', 'error').then();
      }
    });
  }
  openAdd() {
    this.addShow = true;
  }
  cancelAdd() {
    this.addShow = false;
    this.clearObj();
  }
  clearObj() {
    this.client = {
      name: '',
      login: '',
      pass: '',
      role: 'client',
      isFop: false,
      fopDocuments: [],
      idNumber: '',
      notes: '',
      address: '',
    };
  }
  outputSearch(e) {
    if (!e) {
      this.crud.get(`client?query={"role": "client"}&skip=0&limit=${this.lengthPagination}&sort={"date":-1}`).then((v: any) => {
        if (!v) { return; }
        this.list = v;
        this.filterShow = true;
      });
    } else {
      this.list = e;
      this.filterShow = false;
    }
  }
  pageEvent(e) {
    this.pageSizePagination = e.pageSize;
    this.crud.get(`client?query={"role": "client"}&skip=${e.pageIndex * e.pageSize}&limit=${e.pageSize}&sort={${this.dateSort.value}}`).then((l: any) => {
      if (!l) {
        return;
      }
      this.list = l;
    });
  }
  saveClient() {
    this.crud.post('client',
      {
        name: this.clientEdit.name,
        img: this.clientEdit.img,
        mobile: this.clientEdit.mobile,
        isFop: this.clientEdit.isFop,
        fopDocuments: this.clientEdit.fopDocuments,
        idNumber: this.clientEdit.idNumber,
        notes: this.clientEdit.notes,
        address: this.clientEdit.address,
      },
      this.clientEdit._id).then(v => {
        this.clientEdit = '';
      });
  }
  changePhone() {
    this.crud.post('changePhone', { client: this.clientEdit._id, mobile: this.clientEdit.mobile, }).then(v => {
      this.clientEdit = '';
    });
  }
  savePass() {
    if (this.newPass.length < 6) {
      this.passErr = 'Пароль менее 6 символов!';
      return;
    }
    this.crud.post('changePass', { pass: this.newPass, _id: this.clientEdit._id, }).then(v => {
      if (v) {
        this.newPass = '';
      }
    });
  }
  edit(data) {
    this.clientEdit = data;
  }
  close() {
    this.clientEdit = '';
  }
  banned(data) {
    data.banned = !data.banned;
    this.crud.post('client', { banned: data.banned, }, data._id, false).then();
  }
  verify(data) {
    data.verify = !data.verify;
    this.crud.post('client', { verify: data.verify, }, data._id, false).then();
  }

  changeDate() {
    if (this.dateSort.status) {
      this.dateSort.status = false;
      this.dateSort.value = '"date":-1';
    } else {
      this.dateSort.status = true;
      this.dateSort.value = '"date":1';
    }
    this.getClients();
  }

  removeImg(client, image: string) {
    const index = client.fopDocuments.indexOf(image);

    delete client.fopDocuments[index];
  }

  onFs(client, e) {
    if (!client.fopDocuments) {
      client.fopDocuments = [];
    }
    client.fopDocuments.push(e.file);
  }
}
