import { Directive, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[prettyCard]',
})
export class PrettyCardDirective implements OnInit {
  @HostBinding('style.flex') flex;
  @HostBinding('style.border-color') borderColor;
  @Input() flexSize;
  @Input() headerColor;
  constructor() {}

  ngOnInit(): void {
    this.flex = this.flexSize;
    this.borderColor = this.headerColor;
  }
}
