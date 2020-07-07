import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {CrudService} from "../../crud.service";
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public error = {
    text: ''
  };
  public obj = {
    login: '',
    pass: ''
  };
  constructor(
      private crud: CrudService,
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
  }
  signIn(e) {
    e.preventDefault();
    if (this.obj.login === '') {
      this.error['text'] = 'Номер телефона введен не верно';
      return;
    }
    if (this.obj.pass === '') {
      this.error['text'] = 'Пароль введен не верно';
      return;
    }
    this.crud.post('signIn', {login: '0'+this.obj.login, pass: this.obj.pass}, null, false).then((v: any) => {
      if (!v) {return; }
      if (v.user.role === 'client') {
        this.error['text'] = 'Поставщик не найден';
        return;
      }
      if (v.user.role === 'provider' || v.user.role === 'collaborator') {
        localStorage.setItem('userId', v.userId);
        localStorage.setItem('token', v.token);
        this.route.navigate(['']);
        this.obj = {
          login: '',
          pass: ''
        };
      }
    }).catch((error) => {
      if (error.status === 404) {
        this.error['text'] = 'Логин или пароль введены не верно';
      }
    });
  }
}
