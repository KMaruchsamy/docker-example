/// <reference path="../typings.d.ts" />

import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-root",
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  constructor(public titleService: Title, private router: Router) {}
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    this.setTitle("Kaplan Nursing");
    (window as any).Appcues.anonymous();
    this.reloadAppcues();
    (window as any).Appcues.track("Testing from faculty ui");
  }

  reloadAppcues() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // tslint:disable-next-line: no-unused-expression
        (window as any).Appcues && (window as any).Appcues.page();
      }
    });
  }
}
