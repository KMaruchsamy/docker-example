import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ILink } from '../../../models/links.interface';
import { NestedTreeControl } from '@angular/cdk/tree';
import { of } from 'rxjs';
import { LinksService } from './links.service';
import { AnalyticsService } from './../../../services/analytics.service';

@Component({
  selector: 'app-links-card',
  templateUrl: './links-card.component.html',
  styleUrls: ['./links-card.component.scss']
})
export class LinksCardComponent implements OnInit {
  @Input() card;
  institutionID: string;
  linksDataSource: MatTreeNestedDataSource<ILink>;
  nestedTreeControl: NestedTreeControl<ILink>;

  constructor(private linkService: LinksService, public router: Router, private ga: AnalyticsService ) {
    this.linksDataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<ILink>(this.getLinks);
    this.linksDataSource.data = this.card.links;
  }

  private getLinks = (link: ILink) => of(link.links);

  hasNestedLink = (_: number, linkData: ILink) =>
    linkData.links && linkData.links.length > 0;

  onClickLink(link: ILink,e) {
    if (link && link.name) {
      switch(link.name){
        case 'IHP':
         this.linkService.callToIHPssoLogin();
         break;
        case 'EXAMITY':
          this.linkService.onClickExamityProfile(link);
          break;
        case 'PROCTORTRACK':
          this.linkService.callToProctortrackReport();
          break;
        case 'SCHEDULE_TEST':
          this.linkService.schedule(link.url);
          break;
        default:
          this.linkService.redirect(link);
      }
    }
    else if (link && link.url) {
      switch(link.is_internal_link){
        case true:
          this.router.navigateByUrl(link.url);
          break;
        default:
          window.open(link.url);
      }
    }

    this.ga.track(e.type,{category: link.ga.category, label: link.ga.label})
  }
}
