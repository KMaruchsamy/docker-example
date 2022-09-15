import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'home-breaking-widget',
  templateUrl: './breakingMedWidget.component.html'
})
export class BreakingMedComponent implements OnInit {
  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) { }

  ngOnInit() {
    const script = this._renderer2.createElement('script');
    script.type = 'text/javascript';
    script.text = `
    breakingMedWidget.create({
      wrap_id: '#wrapper-container',
      ta_num: ' ',
      options: {
        new_tab: true
      },
      styling: {
        fontSize: '1rem'
      }
    })
  `;
      this._renderer2.appendChild(this._document.body, script);
  }
}
