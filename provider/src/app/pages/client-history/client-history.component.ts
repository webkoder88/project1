import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth.service';
import {CrudService} from '../../crud.service';

@Component({
  selector: 'app-client-history',
  templateUrl: './client-history.component.html',
  styleUrls: ['./client-history.component.scss']
})
export class ClientHistoryComponent implements OnInit {
  public loading = false;
  public history;
  public lengthPagination = 0;
  public pageSizePagination = 10;
  public pageSizeOptionsPagination: number[] = [5, 10, 15];
  constructor(
    private auth: AuthService,
    private crud: CrudService
  ) { }

  ngOnInit() {
    this.crud.get('client-history-count').then((count: any) => {
      if (count.success) {
        this.lengthPagination = count.count;
        this.crud.get(`client-history?query&skip=0&limit=${this.pageSizePagination}`).then((v: any) => {
          if (v.success) {
            this.history = v.clientLoyaltyHistory;
            this.crud.get('discount?populate={"path":"client"}').then((d: any[]) => {
              this.history.forEach(h => {
                const discount = d.find(dis => dis.client._id === h.client._id);
                if (discount) {
                  h.providerDiscount = discount.discount;
                }
              });
            });
          } else {
            this.history = [];
          }
        });
      } else {
        this.history = [];
      }
    });
  }

  pageEvent(e) {
    this.crud.get(`client-history?query&skip=${e.pageIndex * e.pageSize}&limit=${e.pageSize}`).then((v: any) => {
      if (v.success) {
        this.history = v.clientLoyaltyHistory;
      }
    });
  }

}
