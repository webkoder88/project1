import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[appPopup]'
})
export class PopupDirective {

  el: ElementRef;
  @Output() onClose = new EventEmitter();
  @Input('appPopup') custom;
  private defBlock;
  private node;
  constructor(el: ElementRef) {
    this.el = el;
  }

  ngAfterViewInit() {
    const hostElem = this.el.nativeElement;
    this.defBlock = hostElem;
    this.node = document.createElement('DIV');
    const node2 = document.createElement('DIV');
    this.node.classList.add('popup-directive');
    node2.classList.add('popup-directive-bg');
    const node3 = this.el.nativeElement.getElementsByClassName('cansel-popup-btn')[0];
    this.node.appendChild(node2);
    this.node.appendChild(this.defBlock);
    if (!document.getElementById('wrapper')) { return console.error('Create id wrapper in dom!'); }
    document.getElementsByTagName('body')[0].appendChild(this.node);
    document.getElementById('wrapper').classList.add('active');
    document.getElementsByClassName('popup-directive')[0].addEventListener('touchmove', this.preventDef);
    node2.onclick = () => {
      this.close();
    };
    try {
      node3.onclick = () => {
        this.close();
      };
    } catch (e) {}

    const element = this.el.nativeElement.getElementsByClassName('ibox-tools');
    for (let i = 0; i < element.length; i++) {
      element[i].onclick = () => {
        this.close();
      };
    }
    const element2 = this.el.nativeElement.getElementsByClassName('form');
    for (let i = 0; i < element2.length; i++) {
      element2[i].onsubmit = () => {
        this.close();
      };
    }
  }
  close() {
    this.node.remove();
    this.onClose.emit(true);
    document.getElementById('wrapper').classList.remove('active');
  }
  preventDef(e) {
    e.preventDefault();
  }
}
