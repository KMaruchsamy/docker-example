import { AnalyticsService } from './../services/analytics.service';
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[gatrack]'
})
export class GatrackDirective {
  constructor(
    private el: ElementRef,
    private analyticsService: AnalyticsService
  ) {}

  @Input('gatrack') event: string;
  @Input() gaCategory: string;
  @Input() gaProperties?: any;

  @HostListener('click') onClick() {
    console.log(this.gaCategory);
    this.analyticsService.track(this.event, {
      ...(this.gaProperties ? this.gaProperties : {}),
      category: this.gaCategory
    });
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
