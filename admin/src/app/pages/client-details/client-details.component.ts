import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../crud.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {
  public id;
  public client;
  public loading = true;

  constructor(
    private crud: CrudService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('id');
      if (this.id) {
        this.getClient(this.id);
      }
    });
  }

  getClient(id) {
    this.crud.get(`client?query={"_id":"${id}"}`).then(client => {
      if (client) {
        this.client = client[0];
        this.loading = false;
      }
    });
  }
}
