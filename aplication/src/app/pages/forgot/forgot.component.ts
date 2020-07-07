import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../auth.service";
import {CrudService} from "../../crud.service";
import {MatSnackBar} from "@angular/material";
import {Router} from "@angular/router";

interface SignIn {
  login: string,
  pass: string,
  role: string,
}

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {
  public language;
  public showConfirm = false;
  public showSuccess = false;
  public showBack = false;
  public showLogin = true;
  public translate = {
    title: {
      ru: 'Забыли пароль?',
      ua: 'Забули пароль?'
    },
    input: {
      ru: 'Введите код из смс',
      ua: 'Введіть код з смс'
    },
    text: {
      ru: 'Продолжить',
      ua: 'Продовжити'
    },
    btn: {
      ru: 'Продолжить',
      ua: 'Продовжити'
    },
    pass: {
      ru: 'Новый пароль',
      ua: 'Новий пароль'
    },
    confirm: {
      ru: 'Изменить',
      ua: 'Змінити'
    },
    titleSuc: {
      ru: 'Пароль успешно изменен!',
      ua: 'Пароль успішно змінений!'
    },
    btnSuc: {
      ru: 'Назад',
      ua: 'Назад'
    },
    btnLogin: {
      ru: 'Логин',
      ua: 'Логін'
    }
  };
  public objLogin = {
    login: ''
  };
  public objConfirm = {
    login: '',
    smsCode: '',
    pass: ''
  };
  public error1 =  {
    ru: 'Номер телефона введен не верно',
    ua: 'Номер телефону введений не вірно'
  };
  public error2 =  {
    ru: 'Введите код из смс',
    ua: 'Введіть код з смс'
  };
  public error3 =  {
    ru: 'Введите новый пароль',
    ua: 'Введіть новий пароль'
  };
  public error4 =  {
    ru: 'Слишком слабый пароль! Пароль должен быть минимум 6 символов',
    ua: 'Занадто слабкий пароль! Пароль повинен бути мінімум 6 символів'
  };
  public data: SignIn = new class implements SignIn {
    login: string;
    pass: string;
    role = 'client';
  };
  constructor(
      private crud: CrudService,
      private auth: AuthService,
      private snackBar: MatSnackBar,
      private router: Router
  ) { }

  ngOnInit() {
    this.auth.onLanguage.subscribe((l: any) => {
      if (l) {
        this.language = l;
      }
    });
  }
  phone(e) {
    e.preventDefault();
    if (this.objLogin.login === '') {
      this.openSnackBar(this.error1[this.language],  'Ok');
      return;
    }
    this.crud.post('forgotPass', this.objLogin, null).then((v: any) => {
      if (!v) {return; }
      this.showConfirm = true;
      this.objConfirm.login = this.objLogin.login;
    }).catch((error) => {
    });
  }
  confirm(e) {
    e.preventDefault();
    if (this.objConfirm.smsCode === '') {
      this.openSnackBar(this.error2[this.language],  'Ok');
      return;
    }
    if (this.objConfirm.pass === '') {
      this.openSnackBar(this.error3[this.language],  'Ok');
      return;
    }
    this.objConfirm.login = this.objConfirm.login.substr(this.objConfirm.login.length - 10);
    this.data.login = this.objConfirm.login;
    this.data.pass = this.objConfirm.pass;
    this.crud.post('confirmPass', this.objConfirm, null).then((v: any) => {
      if (!v) {return; }
      this.crud.signin(this.data).then((v: any) => {
        localStorage.setItem('userId', v.userId);
        localStorage.setItem('token', v.token);
        this.auth.setMe(v.user);
        this.auth.setCheckBasket(true);
        this.router.navigate(['/'+this.language]);
        this.showSuccess = true;
        this.showBack = true;
        this.showLogin = false;
      }).catch((error) => {
        this.showLogin = true;
      });
    }).catch((error) => {
      if (error.error === 'no pass or less 6 symbol') {
        this.openSnackBar(this.error4[this.language],  'Ok');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
}
