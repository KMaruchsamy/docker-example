/// <reference path="../typings.d.ts" />

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { ChatWidgetService } from './services/chat-widget.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(
    public titleService: Title,
    private router: Router,
    public chatWidgetService: ChatWidgetService,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    angulartics2GoogleAnalytics.startTracking();
  }
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    this.chatWidgetService.loadChatWidget();
    this.setTitle('Kaplan Nursing');
    this.reloadAppcues();
    (window as any).Appcues.track('Testing from faculty ui');
  }

  reloadAppcues() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // tslint:disable-next-line: no-unused-expression
        (window as any).Appcues && (window as any).Appcues.page();
      }
    });
  }
}
