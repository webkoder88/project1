import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { CrudService } from '../../crud.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit, OnChanges {
  @Input() obj;
  @Input() brands;
  @Input() categorys;
  @Output() outputChanges = new EventEmitter();
  @Output() cancelEdit = new EventEmitter();
  public subCategoryChoose;
  public mainChooseBrand;
  public mainCategoryChoose;
  public subCategoryArray = [];
  public subBrandsArray = [];
  public showSale = false;
  public presence = false;
  public isBlok = false;
  public uploadObj = null;
  public editObjCopy;
  public editObj;
  public user;
  public companyId;

  public relatedChoose;
  public related = [];
  public products;

  constructor(
    private crud: CrudService,
    private auth: AuthService
  ) { }

  ngOnChanges() {
    this.editObj = Object.assign({}, this.obj);
    this.editObj.img = this.obj.img.split('--')[1];
    this.editObjCopy = Object.assign({}, this.obj);
    this.mainChooseBrand = this.obj.brand;
    if (this.editObj.discount) {
      this.showSale = true;
      return;
    } else {
      this.showSale = false;
    }
  }
  ngOnInit() {
    this.auth.onMe.subscribe((v: any) => {
      if (!v) { return; }
      if (v && v.companies.length > 0) {
        this.user = v;
        if (this.user.companyOwner) {
          this.companyId = this.user.companyOwner._id;
        }
        this.init();
      }
    });
  }
  init() {
    this.editObj = Object.assign({}, this.obj);
    this.editObj.img = this.obj.img.split('--')[1];
    this.editObjCopy = Object.assign({}, this.obj);
    if (this.obj.brand) {
      this.mainChooseBrand = this.obj.brand;
    }
    if (this.obj.categoryOwner) {
      this.mainCategoryChoose = this.obj.categoryOwner._id;
      this.selectSubCategory(this.mainCategoryChoose);
      this.selectBrandCategory(this.mainCategoryChoose);
    }
    if (this.obj.subCategory) {
      this.subCategoryChoose = this.obj.subCategory;
    }

    // setup this component presence initially
    this.presence = this.editObj.presence;

    this.crud.get(`order?query={"companyOwner":"${this.companyId}"}`).then((p: any[]) => {
      this.products = p;
      this.editObj.related.forEach(id => {
        this.related.push(this.products.find(p => p._id === id));
      });
    });

    if (this.editObj.discount) {
      this.showSale = true;
      return;
    } else {
      this.showSale = false;
    }
  }

  selectSubCategory(id) {
    const index = this.crud.find('_id', id, this.categorys);
    if (this.categorys[index].mainCategory) {
      this.subCategoryArray = this.categorys[index].mainCategory.subCategory;
    }
  }
  selectBrandCategory(id) {
    const index = this.crud.find('_id', id, this.categorys);
    if (this.categorys[index].mainCategory) {
      this.subBrandsArray = this.categorys[index].mainCategory.brands;
    }
  }
  confirmEditCategoryCrud(e) {
    e.preventDefault();
    if (this.validation('editObj')) {
      this.editObj.name = this.editObj.name.trim();
      if (!this.showSale) {
        this.editObj.discount = null;
      } else {
        if (!this.editObj.discount) {
          Swal.fire('Error', 'Укажите скидку или отключите', 'error').then();
          return;
        }
      }

      this.editObj.presence = this.presence;

      this.editObj.brand = this.mainChooseBrand;
      this.editObj.categoryOwner = this.mainCategoryChoose;
      this.editObj.subCategory = this.subCategoryChoose;
      this.editObj.img = this.editObjCopy.img;
      if (this.related.length > 0) {
        this.related.forEach(product => {
          this.editObj.related.push(product._id);
        });
      } else {
        this.editObj.related = [];
      }
      this.crud.post('order', this.editObj, this.editObj['_id']).then((v: any) => {
        if (v) {
          this.outputChanges.emit({ obj: v, close: true });
          this.cancelEdit.emit(false);
          this.isBlok = false;
        }
      }).catch((error) => {
        if (error && error.errors && error.errors.price.name === 'CastError') {
          Swal.fire('Error', 'Цена должна вводится через "." - точку', 'error').then();
          return;
        }
        this.isBlok = true;
      });
    }
  }


  changeSelectBrand(b) {
    this.editObjCopy['brand'] = b;
    this.formCheck();
  }
  changeSelectCategory(c) {
    this.selectSubCategory(c);
    this.selectBrandCategory(c);
    this.editObjCopy['categoryOwner'] = c;
    this.formCheck();
  }

  onFsEdit(e) {
    this.editObj.img = e.file.split('--')[1];
    this.editObjCopy.img = e.file;
    this.formCheck();
  }

  validate() {
    let isTrue = false;
    for (const key in this.editObj) {
      if (this.editObj[key] !== this.editObjCopy[key]) { isTrue = true; }
    }
    return isTrue;
  }

  btnBlok(is) {
    this.isBlok = is;
  }

  formCheck() {
    this.btnBlok(this.validate());
    if (!this.showSale) {
      this.editObj.discount = null;
      this.btnBlok(true);
    }
  }

  selectRelated(product) {
    if (this.related.indexOf(product) === -1) {
      this.related.push(product);
      this.formCheck();
    }
  }

  removeRelated(product) {
    const index = this.related.indexOf(product);
    this.related.splice(index, 1);
    this.formCheck();
  }

  validation(obj) {
    if (this[obj].name === '') {
      Swal.fire('Error', 'Название продукта не может быть пустым', 'error').then();
      return;
    }
    if (this[obj].price === null) {
      Swal.fire('Error', 'Укажите цену продукта', 'error').then();
      return;
    }
    if (this[obj].des === '') {
      Swal.fire('Error', 'Описание не может быть пустым', 'error').then();
      return;
    }
    if (this[obj].img === '') {
      Swal.fire('Error', 'Додайте картинку к продукту', 'error').then();
      return;
    }
    if (this[obj].brand === '') {
      Swal.fire('Error', 'Выберете к какому бренду относится продукт', 'error').then();
      return;
    }
    return true;
  }

  toggle(e) {
    this.editObj.img = this.editObjCopy.img;
    this.editObj.loyaltyAvailable = e.checked;
    this.crud.post('order', this.editObj, this.editObj['_id'], false).then((v) => {
      this.outputChanges.emit({ obj: v, cancel: false });
    });
  }
}
