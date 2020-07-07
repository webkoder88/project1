import { BrowserModule } from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeUk from '@angular/common/locales/uk';
import localeRu from '@angular/common/locales/ru-UA';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {LangTabComponent} from './components/lang-tab/lang-tab.component';
import {DialogComponent} from './components/upload/dialog/dialog.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material-module';
import {UploadComponent} from './components/upload/upload.component';
import {ImgComponent} from './components/img/img.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import { LoginComponent } from './pages/login/login.component';
import {CookieService} from 'ngx-cookie-service';
import { MainComponent } from './layout/main/main.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CategoryComponent } from './pages/category/category.component';
import { ProductComponent } from './pages/product/product.component';
import { CategoryDetailComponent } from './pages/category-detail/category-detail.component';
import { CreateComponent } from './pages/create/create.component';
import { DebtorComponent } from './pages/debtor/debtor.component';
import { ActionComponent } from './pages/action/action.component';
import { SettingsComponent } from './pages/settings/settings.component';
import {ApiInterceptor} from './api.interceptor';
import { WorkTimeComponent } from './pages/work-time/work-time.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrdersDetailComponent } from './pages/orders-detail/orders-detail.component';
import {MatPaginatorIntl} from "@angular/material";
import {getDutchPaginatorIntl} from "./dutch-paginator-intl";
import { AddProductComponent } from './components/add-product/add-product.component';
import { EditProductComponent } from './components/edit-product/edit-product.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { StatusPipe } from './pipe/status.pipe';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import {WebsocketModule} from "./websocket";
import {environment} from "../environments/environment";
import { ScrollTopDirective } from './directives/scroll-top.directive';
import {LoadingComponent} from "./components/loading/loading.component";
import {LottieAnimationViewModule} from "ng-lottie";
import {CroperComponent, TouchStart} from './components/croper/croper.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { VerificationComponent } from './components/verification/verification.component';
import {Ng5SliderModule} from "ng5-slider";
import {ChartsModule} from "ng2-charts";
import { PayComponent } from './pages/pay/pay.component';
import { ForgotComponent } from './pages/forgot/forgot.component';
import {SafeHTMLPipe} from "./safe-html.pipe";
import { InfoByComponent } from './components/info-by/info-by.component';
import {PopupDirective} from "./directives/app-popup.directive";
import { VisitorComponent } from './components/visitor/visitor.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { LoyaltyComponent } from './pages/loyalty/loyalty.component';
import { ClientHistoryComponent } from './pages/client-history/client-history.component';
import { DiscountsComponent } from './pages/discounts/discounts.component';
import { NewItemsComponent } from './pages/new-items/new-items.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    LangTabComponent,
    DialogComponent,
    UploadComponent,
    ImgComponent,
    DashboardComponent,
    HeaderComponent,
    LoginComponent,
    MainComponent,
    NotFoundComponent,
    CategoryComponent,
    ProductComponent,
    CategoryDetailComponent,
    CreateComponent,
    DebtorComponent,
    ActionComponent,
    SettingsComponent,
    WorkTimeComponent,
    ImageCropperComponent,
    OrdersComponent,
    OrdersDetailComponent,
    AddProductComponent,
    EditProductComponent,
    SearchFilterComponent,
    StatusPipe,
    SafeHtmlPipe,
    ScrollTopDirective,
    LoadingComponent,
    CroperComponent,
    TouchStart,
    SignUpComponent,
    VerificationComponent,
    PayComponent,
    ForgotComponent,
    SafeHTMLPipe,
    InfoByComponent,
    PopupDirective,
    VisitorComponent,
    StarRatingComponent,
    CalendarComponent,
    LoyaltyComponent,
    ClientHistoryComponent,
    DiscountsComponent,
    NewItemsComponent
  ],
  imports: [
    ChartsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    SweetAlert2Module.forRoot(),
    MaterialModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
    WebsocketModule.config({
      url: environment.ws
    }),
    Ng5SliderModule,
    LottieAnimationViewModule.forRoot()
  ],
	exports: [MaterialModule, SearchFilterComponent],
  providers: [CookieService, {provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true},
    {provide: LOCALE_ID, useValue: 'ru-UA'}, {provide: LOCALE_ID, useValue: 'uk'},
    { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl()}],
  entryComponents: [
    DialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    registerLocaleData(localeRu);
    registerLocaleData(localeUk);
  }
}
