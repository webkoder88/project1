import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrudService } from '../../crud.service';
import { AuthService } from '../../auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-items',
  templateUrl: './new-items.component.html',
  styleUrls: ['./new-items.component.scss']
})
export class NewItemsComponent implements OnInit {
  private user;
  private company;
  private products;
  public newItems;
  private productChoose;

  public loading = false;

  public lengthPagination;
  private pageSizePagination = 10;

  public newItemAddForProduct = false;
  public globalNewItem = false;
  public userNewItem = false;
  public userChoose = [];

  public maxDate: Date;
  public inputChange = '';
  public searchUser = [];

  public indexTab = 0;

  private newItemAdd = {
    name: '',
    description: '',
    img: '',
    companyOwner: '',
    orderOwner: '',
    client: [],
    actionGlobal: true,
    dateEnd: new Date(),
    dateStart: new Date(),
  };

  private newItemEdit = {
    _id: '',
    name: '',
    description: '',
    img: '',
    companyOwner: '',
    orderOwner: '',
    client: [],
    actionGlobal: true,
    dateEnd: new Date(),
    dateStart: new Date(),
  };

  addShow = false;
  editShow = false;

  constructor(
    private crud: CrudService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.onMe.subscribe((user: any) => {
      this.user = user;
      if (this.user && this.user.companyOwner) {
        this.company = this.user.companyOwner._id;
        this.crud.get(`order?query={"companyOwner":"${this.company}"}`).then((p: any) => {
          if (p && p.length > 0) {
            this.products = p;
            this.productChoose = this.products[0]._id;
          }
        });
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        this.newItemsCount(this.company, date).then((c: any) => {
          if (c) {
            this.lengthPagination = c.count;
            this.newItemsFetch(this.company, date, 0, this.pageSizePagination).then((a: any) => {
              if (a) {
                this.newItems = a;
                this.loading = true;
              }
            });
          }
        });
      }
    });
    this.newItemAdd.dateEnd = this.newItemAdd.dateStart;
    this.maxDate = new Date(new Date(this.newItemAdd.dateStart).getTime() + 1000 * 60 * 60 * 24 * 7);
  }

  private newItemsCount(company, dateEnd = null) {
    const query = JSON.stringify({
      companyOwner: company,
      ...((dateEnd !== null) && { dateEnd: { $gte: dateEnd } })
    });

    return this.crud.get(`newItem/count?query=${query}`);
  }

  private newItemsFetch(company, dateEnd, skip = 0, pageSize) {
    const query = JSON.stringify({
      companyOwner: company,
      dateEnd: { $gte: dateEnd },
    });

    const populate = JSON.stringify([
      { path: 'client' },
      { path: 'product' },
      { path: 'orderOwner' },
    ]);

    const sort = JSON.stringify({
      date: '-1',
    });

    return this.crud.get('newItem?query=' + query +
      '&populate=' + populate +
      '&skip=' + skip +
      '&limit=' + pageSize +
      '&sort=' + sort);
  }

  create(e) {
    e.preventDefault();

    this.newItemAdd.companyOwner = this.company;
    if (this.newItemAddForProduct) {
      this.newItemAdd.orderOwner = this.productChoose;
    } else {
      delete this.newItemAdd.orderOwner;
    }
    if (!this.globalNewItem) {
      this.newItemAdd.actionGlobal = false;
      this.newItemAdd.client = this.userChoose;
    }

    this.crud.post('newItem', this.newItemAdd).then((v: any) => {
      if (v) {
        this.newItems.unshift(v);
        this.lengthPagination = this.newItems.length;

        this.newItemAdd = {
          name: '',
          description: '',
          img: '',
          companyOwner: '',
          orderOwner: '',
          client: [],
          actionGlobal: true,
          dateStart: new Date(),
          dateEnd: new Date()
        };
        this.productChoose = null;
        this.addShow = false;
      }
    });
  }

  openAdd() {
    this.addShow = !this.addShow;
    this.editShow = false;
  }

  newItemAddGlobal() {
    if (this.globalNewItem) {
      this.userNewItem = false;
    } else if (!this.userNewItem) {
      this.userNewItem = true;
    }
  }

  change() {
    const query = JSON.stringify({
      $or: [
        { login: { $regex: this.inputChange, $options: 'gi' } },
        { name: { $regex: this.inputChange, $options: 'gi' } }
      ], byin: { $in: [this.company] }, role: 'client'
    });
    this.crud.get(`client?query=${query}&select=["login", "img", "name"]&limit=10`).then((v: any) => {
      this.searchUser = v;
    });
  }

  newItemAddUser() {
    if (this.userNewItem) {
      this.globalNewItem = false;
    } else if (!this.userNewItem) {
      this.globalNewItem = true;
    }
  }

  cancelAdd() {
    this.addShow = false;
    if (this.products.length > 0) {
      this.productChoose = this.products[0]._id;
    }
    this.newItemAdd = {
      name: '',
      description: '',
      img: '',
      companyOwner: '',
      orderOwner: '',
      client: [],
      actionGlobal: true,
      dateStart: new Date(),
      dateEnd: new Date()
    };
  }

  edit(index) {
    this.newItemEdit = Object.assign({}, this.newItems[index]);
    this.productChoose = this.newItemEdit.orderOwner;
    this.userChoose = this.newItemEdit.client;
    this.addShow = false;
    this.editShow = true;
    this.newItemEdit.dateEnd = this.newItemEdit.dateStart;
    this.maxDate = new Date(new Date(this.newItemEdit.dateStart).getTime() + 1000 * 60 * 60 * 24 * 7);
  }

  confirmEdit(e) {
    e.preventDefault();

    this.newItemEdit.companyOwner = this.company;
    this.newItemEdit.orderOwner = this.productChoose;

    this.crud.post('newItem', this.newItemEdit, this.newItemEdit._id).then((v: any) => {
      if (v) {
        this.newItems[this.crud.find('_id', this.newItemEdit._id, this.newItems)] = v;
        this.lengthPagination = this.newItems.length;

        this.newItemEdit = {
          _id: '',
          name: '',
          description: '',
          img: '',
          companyOwner: '',
          orderOwner: '',
          client: [],
          actionGlobal: true,
          dateStart: new Date(),
          dateEnd: new Date()
        };
        this.productChoose = null;
        this.editShow = false;
      }
    });
  }

  cancelEdit() {
    this.editShow = false;
    if (this.products.length > 0) {
      this.productChoose = this.products[0]._id;
    }
    this.newItemEdit = {
      _id: '',
      name: '',
      description: '',
      img: '',
      companyOwner: '',
      orderOwner: '',
      client: [],
      actionGlobal: true,
      dateStart: new Date(),
      dateEnd: new Date()
    };
  }

  removeUserChip(i) {
    this.userChoose.splice(i, 1);
  }
  pushUser(i) {
    const index = this.crud.find('_id', i._id, this.userChoose);
    if (index === undefined) {
      this.userChoose.push(i);
    }
    this.inputChange = '';
    this.searchUser = [];
  }

  onFsEdit(e) {
    this.newItemEdit.img = e.file;
  }

  onFs(e) {
    this.newItemAdd.img = e.file;
  }

  delete(index) {
    this.crud.delete('newItem', this.newItems[index]._id).then((item: any) => {
      if (item) {
        this.newItems.splice(index, 1);
        this.newItemsCount(this.company).then((c: any) => {
          if (c && c.count > 0) {
            this.lengthPagination = c.count;
          }
        });
      }
    });
  }

  tabChange(e) {
    this.loading = false;
    this.indexTab = e;
    const date = this.getDayStart();

    if (e === 0) {
      this.newItemsCount(this.company, date).then((c: any) => {
        if (c) {
          this.lengthPagination = c.count;
          this.newItemsFetch(this.company, date, 0, this.pageSizePagination).then((a: any) => {
            if (a) {
              this.newItems = a;
              this.loading = true;
            }
          });
        }
      });
    }
    if (e === 1) {
      const query = JSON.stringify({
        companyOwner: this.company,
        dateEnd: {
          $lte: date,
        },
      });

      const populate = JSON.stringify([
        { path: 'client' },
        { path: 'product' },
        { path: 'orderOwner' },
      ]);

      const limit = this.pageSizePagination;

      const sort = JSON.stringify({
        date: '-1',
      });

      this.crud.get(`newItem/count?query=${query}&populate=${populate}&skip=0&limit=${limit}&sort=${sort}`).then((count: any) => {
        if (count) {
          this.lengthPagination = count.count;
          this.crud.get(`newItem?query=${query}&populate=${populate}&skip=0&limit=${limit}&sort=${sort}`).then((v: any) => {
            if (v) {
              this.newItems = v;
              this.loading = true;
            }
          });
        }
      });
    }
  }

  private getDayStart() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
