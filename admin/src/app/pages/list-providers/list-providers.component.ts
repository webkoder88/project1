import {Component, OnInit} from '@angular/core';
import {CrudService} from '../../crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-providers',
  templateUrl: './list-providers.component.html',
  styleUrls: ['./list-providers.component.scss']
})
export class ListProvidersComponent implements OnInit {
  public lengthPagination = 0;
  public pageSizePagination = 10;
  public pageSizeOptionsPagination: number[] = [5, 10, 15];
  public loading = false;
  public search;
  public filterInput;
  public defLang = 'ru-UA';
  public addShow = false;
  public list = [];
  public city = [];
  public filterShow = true;
  public queryFilter = '';
  public sortFilter = '"payedAt":-1';
  public cityQuery = {};
  public cityTriger = {};

  public dateSort = {
    status: false,
    value: '"date":-1'
  };
  public client = {
    name: '',
    login: '',
    pass: '',
    role: 'provider',
  };
  public company = {
    name: '',
    city: '',
    address: '',
  };
  count = 0;
  filterName = 'login';

  constructor(
      private crud: CrudService
  ) { }

  ngOnInit() {
    this.crud.get('city').then((c: any) => {
      if (c && c.length > 0) {
        this.city = c;
        this.company.city = this.city[0]._id;
      }
    });
    this.init();
  }
  init() {
    this.crud.get(`company/count?query=${JSON.stringify(this.cityQuery)}`).then((count: any) => {
      if (count) {
        this.lengthPagination = count.count;
        this.getProviders();
      }
    });
  }

  getProviders() {
    this.crud.get(`company?query=${JSON.stringify(this.cityQuery)}&populate={"path":"createdBy"}&skip=0&limit=${this.pageSizePagination}&sort={${this.dateSort.value}}`).then((v: any) => {
      if (!v) {return; }
      this.list = v;
      this.loading = true;
    });
  }
  create(e) {
    e.preventDefault();
    const c = this.client;
    const comp = this.company;
    if ((!c || !comp) || (!c.name || !c.pass || !c.login || !comp.address || !comp.city || !comp.name)) {
      Swal.fire('Error', 'Все поля обязательны', 'error').then();
      return;
    }
    this.crud.post('signup', {client: {name: this.client.name, login:'0'+this.client.login, pass: this.client.pass, role: this.client.role}, company: this.company}).then((v: any) => {
      if (v) {
        this.init();
        this.addShow = false;
        this.clearObj();
      }
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
      role: 'provider',
    };
    this.company = {
      name: '',
      address: '',
      city: this.city[0]._id
    };
  }
  outputSearch(e) {
    if (!e) {
      this.init();
      this.filterShow = true;
    } else {
      this.list = e;
      this.filterShow = false;
    }
  }
  verifyCompany($event, e, id, index) {
    $event.preventDefault();
    this.crud.post(`company`, {verify: e, img: this.list[index].img}, id).then((v: any) => {
      if (v) {
        this.list[index].verify = v.verify;
      }
    });
    return false;
  }
  pageEvent(e) {
    this.pageSizePagination = e.pageSize;

    this.crud.get(`company?query=${JSON.stringify(this.cityQuery)}&populate={"path":"createdBy"}&skip=${e.pageIndex * e.pageSize}&limit=${e.pageSize}&sort={${this.dateSort.value}}`).then((l: any) => {
      if (!l) {
        return;
      }
      this.list = l;
    });
  }
  setCityFiltr(id) {
    if (this.cityTriger && this.cityTriger['city']) {
      this.queryMod('', 'city', this.cityTriger['city']);
    }
    this.cityTriger['city'] = id;
    this.queryMod({city: id});
    this.init();
  }
  queryMod(obj = null, property = null, value=null) {
    this.queryFilter = `"city":"${obj.city}"`;
    if (!property && !value && !obj) return;
    if (!property && !value) {
      if (this.cityQuery['$or']) {
        this.cityQuery['$or'].push(obj);
      } else {
        this.cityQuery['$or'] = [];
        this.cityQuery['$or'].push(obj);
      }
    } else if (property && value) {
      const i = this.crud.find(property, value, this.cityQuery['$or'] );
      this.cityQuery['$or'].splice(i, 1);
    }
  }

  changeDate() {
    if (this.dateSort.status) {
      this.dateSort.status = false;
      this.dateSort.value = '"date":-1';
    } else {
      this.dateSort.status = true;
      this.dateSort.value = '"date":1';
    }
    this.getProviders();
  }

  filterSearch(e) {
    const query = JSON.stringify({
      $regex: this.filterInput,
      $options: 'gi'
    });
    if (this.filterInput.length > 0) {
      if (this.count === 0) {
        if (this.validateKeyCode(e.keyCode)) {
          this.filterName = 'name';
        } else {
          this.filterName = 'login';
        }
      }

      this.crud.get(`company?query={"${this.filterName}":${query}${this.queryFilter ? ',' + this.queryFilter : ''}}`).then((v: any) => {
        if (v) {
          this.outputSearch(v);
        }
      });

      this.count ++;

    } else {
      this.count = 0;
      this.init()
    }
  }

  validateKeyCode(code) {
    if (code >= 48 && code <= 57) {
      return false;
    } else {
      return true;
    }
  }
}
