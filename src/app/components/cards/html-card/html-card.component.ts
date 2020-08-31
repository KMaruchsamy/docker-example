import { Component, OnInit, Input } from "@angular/core";
import { AnalyticsService } from './../../../services/analytics.service';

@Component({
  selector: "app-html-card",
  templateUrl: "./html-card.component.html",
  styleUrls: ["./html-card.component.scss"],
})
export class HtmlCardComponent {
  @Input() card;
  constructor(public ga: AnalyticsService) {}

  gaClick(e) {
    let ga = this.card.ga;
    let value = '';
    if (e.target.getAttribute('href') && e.target.getAttribute('href').length > 0)
      value= e.target.innerText;
    this.ga.track(e.type,{category: ga.category, label: value});
  }
}
