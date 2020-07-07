import { Component, OnInit } from '@angular/core';
import {CrudService} from '../../crud.service';
import {AuthService} from '../../auth.service';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import Swal from "sweetalert2";

@Component({
  selector: 'app-loyalty',
  templateUrl: './loyalty.component.html',
  styleUrls: ['./loyalty.component.scss']
})

export class LoyaltyComponent implements OnInit {
  public user;
  public showAdd = false;
  public loading = true;
  public isBlok = false;
  public loyaltyCopy;
  public submitted = false;
  public loyalty;
  public errors = {
    discount1: false,
    discount2: false,
    sum1: false,
    sum2: false,
    require1: true,
    require2: true
  };
  loyaltyForm: FormGroup;

  constructor(
    private auth: AuthService,
    private crud: CrudService,
    private formBuilder: FormBuilder,
  ) { }
  get f() { return this.loyaltyForm.controls; }
  ngOnInit() {
    this.auth.onMe.subscribe((me: any) => {
      if (me) {
        this.user = me;
        if (this.user && this.user.loyalty) {
          this.crud.get(`loyalty/${this.user.id}`).then((l: any) => {
            if (l.success) {
              this.loyalty = l.loyalty;
              this.loyaltyCopy = JSON.parse(JSON.stringify(this.loyalty));
              return;
            }
          });
        }
      }
    });

    this.loyaltyForm = this.formBuilder.group({
      sum1: [null, Validators.required],
      discount1: [null, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
      sum2: [null],
      discount2: [null, Validators.compose([Validators.min(0), Validators.max(100)])],
      sum3: [null],
      discount3: [null, Validators.compose([Validators.min(0), Validators.max(100)])],
    });
  }


  add() {
    this.submitted = true;
    if (this.loyaltyForm.status  === 'VALID') {
      if (this.errors.discount1 || this.errors.discount2 || this.errors.sum1 || this.errors.sum2 || !this.errors.require1 || !this.errors.require2) {
        Swal.fire('Error', 'Все поля должны быть заполнены', 'error').then();
        return;
      }
      this.crud.post('loyalty', this.loyaltyCopy ).then((v: any) => {
        if (v.success) {
          this.isBlok = false;
        }
      });
    }
  }

  delete() {
    this.crud.delete('loyalty', this.user.id).then((v: any) => {
      if (v.success) {
        delete this.user.loyalty;
        this.loyalty = null;
        this.loyaltyCopy = null;
      }
    });
  }

  show() {
    this.showAdd = true;
    this.loyalty = {
      enabled: true,
      loyalty: [
        {
          sum: null,
          discount: null
        },
        {
          sum: null,
          discount: null
        },
        {
          sum: null,
          discount: null
        }
      ]
    };
    this.loyaltyCopy = JSON.parse(JSON.stringify(this.loyalty));
    this.crud.post('loyalty', this.loyaltyCopy, null, false ).then((v: any) => {
      if (v.success) {
        this.isBlok = false;
        this.loyalty = v.loyalty;
        this.loyaltyCopy = JSON.parse(JSON.stringify(this.loyalty));
      }
    });
  }
  toggle(e) {
    this.crud.post('loyalty', {enabled: e.checked}, null, false ).then((v: any) => {
      if (v.success) {
        this.isBlok = false;
      }
    });
  }
  validate(e) {
    let isTrue = false;
    for (const key in this.loyalty.loyalty[e]) {
      if (this.loyalty.loyalty[e][key] !== this.loyaltyCopy.loyalty[e][key]) {isTrue = true; }
    }
    return isTrue;
  }

  btnBlok(is) {
    this.isBlok = is;
  }

  formCheck(e) {
    this.btnBlok(this.validate(e));

    if (this.loyaltyCopy.loyalty[1].discount) {
      this.discountValidator(this.loyaltyForm);
    } else {
      this.errors.discount1 = false;
    }
    if (this.loyaltyCopy.loyalty[1].sum) {
      this.sumValidator(this.loyaltyForm);
    } else {
      this.errors.sum1 = false;
    }
    if (this.loyaltyCopy.loyalty[2].discount) {
      this.discountValidator2(this.loyaltyForm);
    } else {
      this.errors.discount2 = false;
    }
    if (this.loyaltyCopy.loyalty[2].sum) {
      this.sumValidator2(this.loyaltyForm);
    } else {
      this.errors.sum2 = false;
    }
    this.val();
  }

  val() {
    if (this.loyaltyCopy.loyalty[2].sum && !this.loyaltyCopy.loyalty[2].discount) {
      this.errors.require2 = false;
    }
    if (!this.loyaltyCopy.loyalty[2].sum && this.loyaltyCopy.loyalty[2].discount) {
      this.errors.require2 = false;
    }
    if (this.loyaltyCopy.loyalty[2].sum && this.loyaltyCopy.loyalty[2].discount) {
      this.errors.require2 = true;
    }
    if (!this.loyaltyCopy.loyalty[2].sum && !this.loyaltyCopy.loyalty[2].discount) {
      this.errors.require2 = true;
    }
    if (this.loyaltyCopy.loyalty[1].sum && !this.loyaltyCopy.loyalty[1].discount) {
      this.errors.require1 = false;
    }
    if (!this.loyaltyCopy.loyalty[1].sum && this.loyaltyCopy.loyalty[1].discount) {
      this.errors.require1 = false;
    }
    if (this.loyaltyCopy.loyalty[1].sum && this.loyaltyCopy.loyalty[1].discount) {
      this.errors.require1 = true;
    }
    if (!this.loyaltyCopy.loyalty[1].sum && !this.loyaltyCopy.loyalty[1].discount) {
      this.errors.require1 = true;
    }
  }

  discountValidator(fg: FormGroup) {
    const start = fg.get('discount1').value;
    const end = fg.get('discount2').value;
    return start !== null && end !== null && start < end ? this.errors.discount1 = false :  this.errors.discount1 = true;
  }
  discountValidator2(fg: FormGroup) {
    const start = fg.get('discount3').value;
    const end = fg.get('discount2').value;
    return start !== null && end !== null && start > end ? this.errors.discount2 = false : this.errors.discount2 = true;
  }
  sumValidator(fg: FormGroup) {
    const start = fg.get('sum1').value;
    const end = fg.get('sum2').value;
    return start !== null && end !== null && start < end ? this.errors.sum1 = false : this.errors.sum1 = true ;
  }
  sumValidator2(fg: FormGroup) {
    const start = fg.get('sum3').value;
    const end = fg.get('sum2').value;
    return start !== null && end !== null && start > end ? this.errors.sum2 = false : this.errors.sum2 = true;
  }

}
