import { Component, OnInit } from '@angular/core';
import {CrudService} from '../../crud.service';
import {AuthService} from '../../auth.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public user;
  public companyCopy;
  public company;
  public companyId;
  public city;
  public uploadObj;
  public cityChoose;
  public isBlok = false;
  public loading = false;
  public changePhone = false;
  public newPhone = null;
  public body = {};
  public newPass = '';
  public passErr = '';
  public tabIndex = 0;
  public defLang = 'ru-UA';
  constructor(
      private crud: CrudService,
      private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.onMe.subscribe((v: any) => {
      if (!v) {return; }
      this.user = Object.assign({}, v);
      this.companyId = this.user.companyOwner._id;
      this.crud.get('city').then((v: any) => {
        if (!v) {return; }
        this.city = v;
      });
      this.crud.get('company', this.companyId).then((c: any) => {
        if (c) {
          this.company = Object.assign({}, c);
          this.companyCopy = Object.assign({}, c);
          if (this.company.city) {
            this.cityChoose = this.company.city;
          }  else {
              this.company.city = null;
              this.companyCopy.city = null;
          }
          this.loading = true;
        }
      });
    });
  }
  setNewPass() {
    if (this.newPass.length < 6) {
      this.passErr = "Пароль менее 6 символов!";
      return
    }
    this.crud.post('changePass', {pass:this.newPass,_id:this.user._id}).then(v=>{
      if (v) {
        this.newPass = '';
      }
    }).catch(e => {console.log(e)});
  }
  create() {
    this.body['img'] = this.companyCopy.img;
    this.crud.post('company', this.body, this.company._id).then((v: any) => {
      this.user.companyOwner = v;
      this.company = Object.assign({}, v);
      this.companyCopy = Object.assign({}, v);
      this.auth.setMe(this.user);
      this.isBlok = false;
      this.body = {};
    });
  }

  changePhoneF() {
    Swal.fire({
      title: 'Вы действительно хотите изменить номер для входа в систему?',
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: true,
      reverseButtons: true,
      cancelButtonText: 'Отменить',
      confirmButtonText: 'Изменить',
      confirmButtonColor: '#009688',
    }).then((result) => {
      if (result.value) {
        this.crud.post('changePhone', {mobile: this.newPhone.toString()}).then((v: any) => {
          this.user.login = v.user.login;
          this.user.mobile = v.user.mobile;
          this.auth.setMe(this.user);
          localStorage.setItem('token', v.token);
        });
      }
    });
  }

  onFs(e) {
    this.companyCopy.img = e.file;
    this.formCheck();
  }
  changeCity(o) {
    this.companyCopy.city = o;
    this.formCheck();
  }
  validate() {
    let isTrue = false;
    for (const key in this.company) {
      if (this.company[key] !== this.companyCopy[key]) {
        this.body[key] = this.companyCopy[key];
        isTrue = true;
      } else {
        delete this.body[key];
      }
    }
    return isTrue;
  }

  btnBlok(is) {
    this.isBlok = is;
  }

  formCheck() {
    this.btnBlok(this.validate());
  }

  changeTab(e){
    this.tabIndex = e;
  }
}
