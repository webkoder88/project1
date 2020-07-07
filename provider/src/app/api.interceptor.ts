import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/internal/operators/tap';
import Swal from 'sweetalert2';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    public localStorage = localStorage ;
    public obj: any;
    constructor() { }

    // intercept request and add token
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // modify request
        if (this.localStorage.getItem('token')) {
            this.obj = {
                setHeaders: {
                    Authorization: this.localStorage.getItem('token')
                },
                withCredentials: true
            };
        } else {
            this.obj = {
                setHeaders: {},
                withCredentials: true
            };
        }
        request = request.clone(this.obj);
        return next.handle(request)
            .pipe(
                tap(event => {
                    if (event instanceof HttpResponse) {
                        // http response status code
                    }
                }, error => {
                    // http response status code
                    switch (error.status) {
                        // case 404: Swal.fire('Oops...', 'Попробуйте еще раз...', 'error');
                        // break;
                    }
                })
            );
    }

}
