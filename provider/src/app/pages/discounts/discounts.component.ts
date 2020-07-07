import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CrudService } from '../../crud.service';
import { AuthService } from '../../auth.service';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss'],
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ transform: 'translateY(-10%)', opacity: 0, overflow: 'hidden', height: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1, height: '570px', overflow: 'hidden' }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1, height: '570px', overflow: 'hidden' }),
        animate('300ms', style({ transform: 'translateY(-10%)', opacity: 0, overflow: 'hidden', height: 0 }))
      ]),
    ]),
  ],
})
export class DiscountsComponent implements OnInit {
  addName = new FormControl();
  editName = new FormControl();
  public editDiscountId;
  public loading = false;
  public addShow = false;
  public editShow = false;
  public discounts = [];
  public addDiscount;
  public editDiscountValue;
  public user;

  public clients;
  public filteredClients;

  constructor(
    private crud: CrudService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.auth.onMe.subscribe((v: any) => {
      if (!v) { return; }
      this.user = v;
      if (this.user && this.user.companyOwner) {
        this.crud.get('discount?populate={"path":"client"}').then((d: any[]) => {
          this.discounts = d;
          this.loading = true;
        });

        this.crud.get('client?query={"role":"client"}').then((c: any[]) => {
          this.clients = c;
          this.loading = true;
        });
      }
    });

    this.filteredClients = this.addName.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  openAdd() {
    this.addShow = true;
  }

  cancelAdd(e) {
    e.preventDefault();

    this.addDiscount = 0;
    this.addName.setValue('');

    this.addShow = false;
  }

  private _filter(value: string) {
    return this.clients.filter(client => client.name.startsWith(value));
  }

  createDiscount(e) {
    e.preventDefault();

    const discount = this.addDiscount;
    const clientId = this.clients.filter(client => client.name === this.addName.value)[0]._id;
    const providerId = this.user._id;

    this.crud.post('discount', {
      discount,
      client: clientId,
      provider: providerId,
    }).then((v: any) => {
      this.addShow = false;
      v.client = this.clients.filter(client => client.name === this.addName.value)[0];

      this.addDiscount = 0;
      this.addName.setValue('');

      this.discounts.unshift(v);
    });
  }

  editDiscount(e) {
    e.preventDefault();

    const discount = this.editDiscountValue;
    const clientId = this.clients.filter(client => client.name === this.editName.value)[0]._id;
    const providerId = this.user._id;

    this.crud.post('discount', {
      discount,
      client: clientId,
      provider: providerId,
    }, this.editDiscountId).then((v: any) => {
      this.editShow = false;
      v.client = this.clients.filter(client => client.name === this.editName.value)[0];
      this.discounts.find(d => d.client._id === v.client._id).discount = discount;
    });
  }

  edit(item) {
    this.editDiscountId = item._id;
    this.editDiscountValue = item.discount;
    this.editName.setValue(item.client.name);
    this.editShow = true;
  }

  delete(item) {
    this.crud.delete('discount', item._id).then((v: any) => {
      if (v) {
        this.discounts.splice(this.discounts.indexOf(item), 1);
      }
    });
  }
}
