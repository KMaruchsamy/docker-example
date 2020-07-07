import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from './../../services/auth.service';


@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss']
 })

export class PageHeaderComponent implements OnInit{
    @Input() showCover: boolean;
    @Input() ariaDisabled: boolean;
    @Input() hideDropdown: boolean;
    header: any;
    username: string;

  constructor(public router: Router, public auth: AuthService) {
 }
  ngOnInit() {
     this.updateHeaderBasedOnTemplate();
  }
  updateHeaderBasedOnTemplate() {
    this.username = this.auth.firstname + ' ' + this.auth.lastname;
    this.header = (this.auth.dashboardTemplate) ? JSON.parse(this.auth.dashboardTemplate).header : "";
  }
  logout(e) {
    this.auth.logout();
    e.preventDefault();
    this.router.navigate(['/logout']);
}
}

