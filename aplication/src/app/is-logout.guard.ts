import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IsLogoutGuard implements CanActivate {
  public language;
  constructor(
      private router: Router,
      private auth: AuthService,
  ) {
    this.auth.onLanguage.subscribe((v: string) => {
      if(!v) return;
      this.language = v;
    })
  }
  canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot) {
    if (this.auth.isAuth()) {
      this.router.navigate(['/' + this.language]);
      return false;
    } else {
      return true;
    }

  }
}



