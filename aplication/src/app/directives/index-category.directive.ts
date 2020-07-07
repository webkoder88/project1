import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CrudService} from '../crud.service';
import {AuthService} from '../auth.service';

@Directive({
  selector: '[appIndexCategory]'
})
export class IndexCategoryDirective implements AfterViewInit, OnChanges {
  @Input() id;
  @Output() output = new EventEmitter();
  public skip = 1;
  public elem: ElementRef;
  public scroll;
  public count = 0;
  public trigger = true;
  public company;

  constructor(
    private el: ElementRef,
    private crud: CrudService,
    private auth: AuthService
  ) {
    this.elem = el;
    this.auth.onCompany.subscribe((c: any) => {
      if (c) {
        this.company = c;
      }
    });
  }
  ngOnChanges() {
    this.trigger = true;
    const block = this.elem.nativeElement;
    this.skip = 1;
    console.log('change');
    const populate = '&populate=' + JSON.stringify({path: 'mainCategory'});
    const select = '&select=name,mainCategory';
    const query = `?query={"$or":${JSON.stringify(this.company)}}`;
    if (this.company && this.company.length > 0) {
      this.crud.get('category/count', '', query + select + populate).then((v: any) => {
        if (v) {
          this.count = v.count;
          console.log(this.count);
          block.onscroll = e => {
            if ((e.srcElement.scrollTop + (e.target.offsetHeight * 1.2) > e.target.scrollHeight) && this.trigger) {
              this.trigger = false;
              this.upload();
            }
          };
        }
      });
    }
    // this.init(block);
  }
  ngAfterViewInit() {
    const block = this.elem.nativeElement;
    const populate = '&populate=' + JSON.stringify({path: 'mainCategory'});
    const select = '&select=name,mainCategory';
    const query = `?query={"$or":${JSON.stringify(this.company)}}`;
    if (this.company && this.company.length > 0) {
      this.crud.get('category/count', '', query + select + populate).then((v: any) => {
        if (v) {
          this.count = v.count;
          console.log(this.count);
          block.onscroll = e => {
            if ((e.srcElement.scrollTop + (e.target.offsetHeight * 1.2) > e.target.scrollHeight) && this.trigger) {
              this.trigger = false;
              this.upload();
            }
          };
        }
      });
    }
    // this.init(block);
  }
  upload() {
    console.log('here top');
    this.skip++;
    console.log(this.count);
    console.log(this.skip * 6);
    if (this.count <= this.skip * 6) {return; }
    console.log('here');
    const populate = '&populate=' + JSON.stringify({path: 'mainCategory'});
    const select = '&select=name,mainCategory';
    const query = `?query={"$or":${JSON.stringify(this.company)}}`;
    console.log(this.company);
    if (this.company && this.company.length > 0) {
      this.crud.get('category', '', query + select + populate + `&skip=${this.skip * 6}&limit=6`).then((v: any) => {
        if (v) {
          console.log(v)
          const trigger1 = {};
          const arr = [];
          v.forEach(it => {
            if (it.mainCategory) {
              if (trigger1[it.mainCategory._id]) {return; }
              it.name = `${it.mainCategory.name}`;
              arr.push(it);
              trigger1[it.mainCategory._id] = true;
            }
          });
          this.skip++;
          this.trigger = true;
          this.output.emit(arr);
        }
      });
    }
  }


  init(block) {
    const populate = '&populate=' + JSON.stringify({path: 'mainCategory'});
    const select = '&select=name,mainCategory';
    const query = `?query={"$or":${JSON.stringify(this.company)}}`;
    if (this.company && this.company.length > 0) {
      this.crud.get('category/count', '', query + select + populate).then((v: any) => {
        if (v) {
          this.count = v.count;
          console.log(this.count);
          block.onscroll = e => {
            if ((e.srcElement.scrollTop + (e.target.offsetHeight * 1.2) > e.target.scrollHeight) && this.trigger) {
              this.trigger = false;
              this.upload();
            }
          };
        }
      });
    }
  }
}
