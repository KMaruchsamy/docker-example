import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-html-card",
  templateUrl: "./html-card.component.html",
  styleUrls: ["./html-card.component.scss"],
})
export class HtmlCardComponent {
  @Input() card;
}
