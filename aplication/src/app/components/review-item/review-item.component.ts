import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.scss']
})
export class ReviewItemComponent implements OnInit {
  @Input() review;

  constructor() { }

  ngOnInit() {
  }

}
