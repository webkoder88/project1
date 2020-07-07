import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CrudService } from '../../crud.service';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, AfterViewChecked {
  @Input() brands;
  @Input() categorys;
  @Output() outputNew = new EventEmitter();
  @Output() cancelAdd = new EventEmitter();
  public user;
  public subCategoryArray;
  public subCategoryChoose;
  public subBrandsArray;
  public mainCategoryChoose;
  public mainChooseBrand;
  public companyId;
  public uploadObj;

  public relatedChoose;
  public related = [];
  public products;

  public product = {
    name: '',
    des: '',
    img: '',
    price: null,
    companyOwner: '',
    categoryOwner: '',
    subCategory: '',
    brand: '',
    presence: true,
    related: [],
  };

  constructor(
    private crud: CrudService,
    private auth: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.auth.onMe.subscribe((v: any) => {
      if (!v) { return; }
      this.user = v;
      if (this.user.companyOwner) {
        this.companyId = this.user.companyOwner._id;
      }
      this.crud.get(`order?query={"companyOwner":"${this.companyId}"}`).then((p: any[]) => {
        this.products = p;
      });
    });
    if (this.categorys && this.categorys.length > 0) {
      this.mainCategoryChoose = this.categorys[0]._id;
      this.selectSubCategory(this.mainCategoryChoose);
    }
  }
  selectSubCategory(id) {
    this.selectBrandCategory(id);
    const index = this.crud.find('_id', id, this.categorys);
    this.subCategoryArray = this.categorys[index].mainCategory ? this.categorys[index].mainCategory.subCategory : null;
  }

  selectRelated(product) {
    if (this.related.indexOf(product) === -1) {
      this.related.push(product);
    }
  }

  removeRelated(product) {
    const index = this.related.indexOf(product);
    this.related.splice(index, 1);
  }

  selectBrandCategory(id) {
    const index = this.crud.find('_id', id, this.categorys);
    if (this.categorys[index].mainCategory) {
      this.subBrandsArray = this.categorys[index].mainCategory.brands;
    }
  }

  removeImg() {
    delete this.product.img;
    this.product['img'] = '';
  }
  create() {
    if (this.validation('product')) {
      this.product.name = this.product.name.trim();
      this.product.categoryOwner = this.mainCategoryChoose;
      if (this.subCategoryChoose) {
        this.product.subCategory = this.subCategoryChoose;
      }
      if (this.related.length > 0) {
        this.related.forEach(product => {
          this.product.related.push(product._id);
        });
      }
      this.product.brand = this.mainChooseBrand;
      this.product.companyOwner = this.companyId;
      this.crud.post('order', this.product).then((v: any) => {
        if (v) {
          this.outputNew.emit(v);
          this.clearMainObj();
        }
      });
    }
  }
  cancelAddBtn() {
    if (this.product.img) {
      this.crud.post('deleteFile', { file: this.product.img }, false, false).then((v: any) => {
      });
    }
    this.cancelAdd.emit(false);
  }
  onFs(e) {
    this.product.img = e.file;
  }

  clearMainObj() {
    this.product = {
      name: '',
      des: '',
      img: '',
      price: null,
      companyOwner: '',
      categoryOwner: '',
      subCategory: '',
      brand: '',
      presence: false,
      related: [],
    };
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  validation(obj) {
    if (this[obj].name === '') {
      Swal.fire('Error', 'Название продукта не может быть пустым', 'error');
      return;
    }
    if (this[obj].des === '') {
      Swal.fire('Error', 'Описание не может быть пустым', 'error');
      return;
    }
    if (this[obj].price === null) {
      Swal.fire('Error', 'Укажите цену продукта', 'error');
      return;
    }
    if (this[obj].img === '') {
      Swal.fire('Error', 'Картинка продукта не может быть пустой', 'error');
      return;
    }
    return true;
  }
}
