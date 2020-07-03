import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-links-card',
  templateUrl: './links-card.component.html',
  styleUrls: ['./links-card.component.scss'],
})
export class LinksCardComponent {
  @Input() card;
}
