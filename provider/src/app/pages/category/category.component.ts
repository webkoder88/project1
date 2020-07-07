import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {CrudService} from '../../crud.service';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  public lengthPagination = 0;
  public pageSizePagination = 10;
  public pageSizeOptionsPagination: number[] = [5, 10, 15];
  public mainCategoryChoose = null;
  public mainCategory;
  public mainCategoryFilter = [];
  public categoryArr = [];
  public user;
  public defLang = 'ru-UA';
  public isBlok = false;
  public loading = false;

  public addShow = false;
  public editShow = false;
  public categorys = [];
  public categorysAll = [];
  public editObjCopy;
  public editObj = {
    name: '',
    mainCategory: '',
  };

  constructor(
      private crud: CrudService,
      private auth: AuthService
  ) { }

  ngOnInit() {
    this.crud.get('mainCategory').then((v: any) => {
      if (!v)  { return; }
      this.mainCategory = v;
      this.mainCategoryFilter = JSON.parse(JSON.stringify(this.mainCategory));
    });
    this.auth.onMe.subscribe((v: any) => {
      if (!v) { return; }
      this.user = v;
      if (this.user.companyOwner) {
        this.getAllCategorys();
        this.crud.get(`category/count?query={"companyOwner": "${this.user.companyOwner._id}"}`).then((count: any) => {
          if (count) {
            this.lengthPagination = count.count;
            this.crud.get(`category?query={"companyOwner": "${this.user.companyOwner._id}"}
            &populate={"path":"mainCategory", "populate":{"path":"brands", "select":"name"}}
            &sort={"date":-1}&skip=0&limit=${this.pageSizePagination}`).then((c: any) => {
              if (c) {
                this.categorys = c;
                if (this.mainCategory && this.mainCategory.length > 0 && this.categorys && this.categorys.length > 0) {
                  this.filterMainCategory();
                }
                this.loading = true;
              }
            });
          }
        });
      }
    });
  }

  getAllCategorys() {
    this.crud.get(`category?query={"companyOwner": "${this.user.companyOwner._id}"}
            &populate={"path":"mainCategory", "populate":{"path":"brands", "select":"name"}}
            &sort={"date":-1}`).then((c: any) => {
      if (c) {
        this.categorysAll = c;
      }
    });
  }

  filterMainCategory() {
    this.mainCategoryFilter = JSON.parse(JSON.stringify(this.mainCategory));
    this.categorysAll.forEach((item) => {
      const index = this.crud.find('_id', item.mainCategory._id, this.mainCategory);
      if (this.mainCategoryFilter.length === 0) {
        this.mainCategoryFilter = [];
      } else {
        this.mainCategoryFilter.splice(index, 1);
      }
    });
  }

  create(e) {
    e.preventDefault();
    this.categoryArr.forEach(it => {
      this.crud.post('category', {
        name: it.name.trim(),
        mainCategory: it._id,
        companyOwner: this.user.companyOwner._id
      }).then((v: any) => {
        if (v) {
          this.crud.get(`category?query={"_id":"${v._id}","companyOwner":"${this.user.companyOwner._id}"}&populate={"path":"mainCategory", "populate":{"path":"brands", "select":"name"}}`).then((v) => {
            this.categorys.unshift(v[0]);
            this.categorysAll.unshift(v[0]);
            this.lengthPagination++;
            this.filterMainCategory();
            this.addShow = false;
          });
        }
      }).catch((error) => {
        if (error.error.code === 11000) {
          Swal.fire('Error', 'Категория с таким названием уже создана!', 'error');
        }
      });
    });
    this.categoryArr = [];
  }

  delete(i) {
    this.crud.delete('category', this.categorys[i]._id).then((v: any) => {
      if (v) {
        this.crud.get(`category/count?query={"companyOwner": "${this.user.companyOwner._id}"}`).then((count: any) => {
          this.categorys.splice(i, 1);
          this.categorysAll.splice(i, 1);
          if (count) {
            this.lengthPagination = count.count;
            if (this.lengthPagination > 0 && this.categorys.length === 0) {
              this.pageEventZero();
            }
            this.filterMainCategory();
          }
        });
      }
    });
  }

  confirmEditCategoryCrud(e) {
    e.preventDefault();
    if (this.editObj.name === '') {
      Swal.fire('Error', 'Название категории не может быть пустым', 'error');
      return;
    }
    if (!this.mainCategoryChoose) {
      Swal.fire('Error', 'Выберете к какой категории относится ваша категория', 'error');
      return;
    }
    this.editObj.name = this.editObj.name.trim();
    this.editObj.mainCategory = this.mainCategoryChoose;
    this.crud.post('category', this.editObj, this.editObj['_id']).then((v: any) => {
      if (v) {
        this.editShow = false;
        this.categorys[this.crud.find('_id', this.editObj['_id'], this.categorys)] = v;
        this.isBlok = false;
        this.editShow = false;
        this.editObj = {
          name: '',
          mainCategory: '',
        };
      }
    });
  }
  selectValid() {
    if (this.editObjCopy.mainCategory !== this.mainCategoryChoose) {
      return this.btnBlok(true);
    }
    return this.btnBlok(false);
  }
  validate() {
    let isTrue = false;
    for (const key in this.editObj) {
      if (this.editObj[key] !== this.editObjCopy[key]) {isTrue = true; }
    }
    return isTrue;
  }

  btnBlok(is) {
    this.isBlok = is;
  }

  formCheck() {
    this.btnBlok(this.validate());
  }
  openAdd() {
    this.addShow = true;
    this.editShow = false;
    if (this.mainCategory.length > 0) {
      this.mainCategoryChoose = this.mainCategory[0]._id;
    }
  }
  cancelAdd() {
    this.addShow = false;
    this.mainCategoryChoose = this.mainCategory[0]._id;
    this.categoryArr = [];
  }

  outputSearch(e) {
    if (!e) {
      this.crud.get(`category?query={"companyOwner": "${this.user.companyOwner._id}"}&skip=0&limit=${this.pageSizePagination}`).then((c: any) => {
        if (c) {
          this.categorys = c;
          this.lengthPagination = this.categorys.length;
        }
      });
    } else {
      this.categorys = e;
      this.lengthPagination = this.categorys.length;
    }
  }
  pageEvent(e) {
    this.crud.get(`category?query={"companyOwner":"${this.user.companyOwner._id}"}&populate={"path":"mainCategory"}&sort={"date":-1}&skip=${e.pageIndex  * e.pageSize}&limit=${e.pageSize}`).then((c: any) => {
      if (!c) {
        return;
      }
      this.getAllCategorys();
      this.categorys = c;
      this.filterMainCategory();
      this.loading = true;
    });
  }

  pageEventZero() {
    this.getAllCategorys();
    this.crud.get(`category?query={"companyOwner":"${this.user.companyOwner._id}"}&populate={"path":"mainCategory"}&sort={"date":-1}&skip=0&limit=${this.pageSizePagination}`).then((c: any) => {
      if (!c) {
        return;
      }
      this.categorys = c;
      this.filterMainCategory();
      this.loading = true;
    });
  }
  addCategory(e) {
    const i = this.crud.find('_id', e._id, this.categoryArr);
    if (i > -1) {
      this.categoryArr.splice(i, 1);
    } else {
      this.categoryArr.push(e);
    }
  }
  remCategory(e) {
    const i = this.crud.find('_id', e._id, this.categoryArr );
    this.categoryArr.splice(i, 1);
  }
}
